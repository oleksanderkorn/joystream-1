import * as express from 'express'
import { Logger } from 'winston'
import send from 'send'
import { StateCacheService } from '../../../services/cache/StateCacheService'
import { NetworkingService } from '../../../services/networking'
import { AssetRouteParams, BucketsResponse, ErrorResponse, StatusResponse } from '../../../types/api'
import { LoggingService } from '../../logging'
import { ContentService, DEFAULT_CONTENT_TYPE } from '../../content/ContentService'
import proxy from 'express-http-proxy'
import { ReadonlyConfig } from '../../../types'

const CACHED_MAX_AGE = 31536000
const PENDING_MAX_AGE = 180

export class PublicApiController {
  private config: ReadonlyConfig
  private logger: Logger
  private networking: NetworkingService
  private stateCache: StateCacheService
  private content: ContentService

  public constructor(
    config: ReadonlyConfig,
    logging: LoggingService,
    networking: NetworkingService,
    stateCache: StateCacheService,
    content: ContentService
  ) {
    this.config = config
    this.logger = logging.createLogger('PublicApiController')
    this.networking = networking
    this.stateCache = stateCache
    this.content = content
  }

  private serveAssetFromFilesystem(
    req: express.Request<AssetRouteParams>,
    res: express.Response,
    next: express.NextFunction,
    objectId: string
  ): void {
    // TODO: Limit the number of times useContent is trigerred for similar requests?
    // (for example: same ip, 3 different request within a minute = 1 request)
    this.stateCache.useContent(objectId)

    const path = this.content.path(objectId)
    const stream = send(req, path, {
      maxAge: CACHED_MAX_AGE,
      lastModified: false,
    })
    const mimeType = this.stateCache.getContentMimeType(objectId)

    stream.on('headers', (res) => {
      res.setHeader('x-cache', 'hit')
      res.setHeader('x-data-source', 'local')
      res.setHeader('content-disposition', 'inline')
      res.setHeader('content-type', mimeType || DEFAULT_CONTENT_TYPE)
    })

    stream.on('error', (err) => {
      this.logger.error('SendStream error while trying to serve an asset', { err })
      // General error
      const statusCode = err.status || 500
      const errorRes: ErrorResponse = {
        type: 'sendstream_error',
        message: err.toString(),
      }

      res.status(statusCode).json(errorRes)
    })

    stream.pipe(res)
  }

  private async servePendingDownloadAsset(
    req: express.Request<AssetRouteParams>,
    res: express.Response,
    next: express.NextFunction,
    objectId: string
  ) {
    const pendingDownload = this.stateCache.getPendingDownload(objectId)
    if (!pendingDownload) {
      throw new Error('Trying to serve pending download asset that is not pending download!')
    }

    const { promise, objectSize } = pendingDownload
    const response = await promise
    const source = new URL(response.config.url!)
    const contentType = response.headers['content-type'] || DEFAULT_CONTENT_TYPE
    res.setHeader('content-type', contentType)
    // Allow caching pendingDownload reponse only for very short period of time and requite revalidation,
    // since the data coming from the source may not be valid
    res.setHeader('cache-control', `max-age=${PENDING_MAX_AGE}, must-revalidate`)

    // Handle request using pending download file if this makes sense in current context:
    if (this.content.exists(objectId)) {
      const partiallyDownloadedContentSize = this.content.fileSize(objectId)
      const range = req.range(objectSize)
      if (!range || range === -1 || range === -2 || range.length !== 1 || range.type !== 'bytes') {
        // Range is not provided / invalid - serve data from pending download file
        return this.servePendingDownloadAssetFromFile(req, res, next, objectId, objectSize)
      } else if (range[0].start <= partiallyDownloadedContentSize) {
        // Range starts at the already downloaded part of the content - serve data from pending download file
        return this.servePendingDownloadAssetFromFile(req, res, next, objectId, objectSize, range[0])
      }
    }

    // Range doesn't start from the beginning of the content or the file was not found - froward request to source storage node
    this.logger.verbose(`Forwarding request to ${source.href}`, { source: source.href })
    res.setHeader('x-data-source', 'external')
    return proxy(source.origin, { proxyReqPathResolver: () => source.pathname })(req, res, next)
  }

  private async servePendingDownloadAssetFromFile(
    req: express.Request<AssetRouteParams>,
    res: express.Response,
    next: express.NextFunction,
    objectId: string,
    objectSize: number,
    range?: { start: number; end: number }
  ) {
    this.logger.verbose(`Serving pending download asset from file`, { objectId, objectSize, range })
    const stream = this.content.createContinousReadStream(objectId, {
      start: range?.start,
      end: range !== undefined ? range.end : objectSize - 1,
    })
    res.status(range !== undefined ? 206 : 200)
    res.setHeader('accept-ranges', 'bytes')
    res.setHeader('x-data-source', 'local')
    res.setHeader('content-disposition', 'inline')
    if (range !== undefined) {
      res.setHeader('content-range', `bytes ${range.start}-${range.end}/${objectSize}`)
    }
    stream.pipe(res)
    req.on('close', () => {
      stream.destroy()
      res.destroy()
    })
  }

  public async assetHead(req: express.Request<AssetRouteParams>, res: express.Response): Promise<void> {
    const objectId = req.params.objectId
    const pendingDownload = this.stateCache.getPendingDownload(objectId)

    res.setHeader('timing-allow-origin', '*')
    res.setHeader('accept-ranges', 'bytes')
    res.setHeader('content-disposition', 'inline')

    if (!pendingDownload && this.content.exists(objectId)) {
      res.status(200)
      res.setHeader('x-cache', 'hit')
      res.setHeader('cache-control', `max-age=${CACHED_MAX_AGE}`)
      res.setHeader('content-type', this.stateCache.getContentMimeType(objectId) || DEFAULT_CONTENT_TYPE)
      res.setHeader('content-length', this.content.fileSize(objectId))
    } else if (pendingDownload) {
      res.status(200)
      res.setHeader('x-cache', 'pending')
      res.setHeader('cache-control', `max-age=${PENDING_MAX_AGE}, must-revalidate`)
      res.setHeader('content-length', pendingDownload.objectSize)
    } else {
      const objectInfo = await this.networking.dataObjectInfo(objectId)
      if (!objectInfo.exists) {
        res.status(404)
      } else if (!objectInfo.isSupported) {
        res.status(421)
      } else {
        res.status(200)
        res.setHeader('x-cache', 'miss')
        res.setHeader('cache-control', `max-age=${PENDING_MAX_AGE}, must-revalidate`)
        res.setHeader('content-length', objectInfo.data?.size || 0)
      }
    }

    res.send()
  }

  public async asset(
    req: express.Request<AssetRouteParams>,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    const objectId = req.params.objectId
    const pendingDownload = this.stateCache.getPendingDownload(objectId)

    this.logger.verbose('Data object requested', {
      objectId,
      status: pendingDownload && pendingDownload.status,
    })

    res.setHeader('timing-allow-origin', '*')

    if (!pendingDownload && this.content.exists(objectId)) {
      this.logger.verbose('Requested file found in filesystem', { path: this.content.path(objectId) })
      return this.serveAssetFromFilesystem(req, res, next, objectId)
    } else if (pendingDownload) {
      this.logger.verbose('Requested file is in pending download state', { path: this.content.path(objectId) })
      res.setHeader('x-cache', 'pending')
      return this.servePendingDownloadAsset(req, res, next, objectId)
    } else {
      this.logger.verbose('Requested file not found in filesystem')
      const objectInfo = await this.networking.dataObjectInfo(objectId)
      if (!objectInfo.exists) {
        const errorRes: ErrorResponse = {
          message: 'Data object does not exist',
        }
        res.status(404).json(errorRes)
      } else if (!objectInfo.isSupported) {
        const errorRes: ErrorResponse = {
          message: 'Data object not served by this node',
        }
        res.status(421).json(errorRes)
        // TODO: Try to direct to a node that supports it?
      } else {
        const { data: objectData } = objectInfo
        if (!objectData) {
          throw new Error('Missing data object data')
        }
        const { size, contentHash } = objectData

        const downloadResponse = await this.networking.downloadDataObject({ objectData })

        if (downloadResponse) {
          // Note: Await will only wait unil the file is created, so we may serve the response from it
          await this.content.handleNewContent(objectId, size, contentHash, downloadResponse.data)
          res.setHeader('x-cache', 'miss')
        } else {
          res.setHeader('x-cache', 'pending')
        }
        return this.servePendingDownloadAsset(req, res, next, objectId)
      }
    }
  }

  public async status(req: express.Request, res: express.Response<StatusResponse>): Promise<void> {
    const data: StatusResponse = {
      id: this.config.id,
      objectsInCache: this.stateCache.getCachedObjectsCount(),
      storageLimit: this.config.limits.storage,
      storageUsed: this.content.usedSpace,
      uptime: Math.floor(process.uptime()),
      downloadsInProgress: this.stateCache.getPendingDownloadsCount(),
    }
    res.status(200).json(data)
  }

  public async buckets(req: express.Request, res: express.Response<BucketsResponse>): Promise<void> {
    res
      .status(200)
      .json(
        this.config.buckets === 'all'
          ? { allByWorkerId: this.config.workerId }
          : { bucketIds: [...this.config.buckets] }
      )
  }
}
