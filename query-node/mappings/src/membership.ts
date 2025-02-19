/*
eslint-disable @typescript-eslint/naming-convention
*/
import { EventContext, StoreContext, DatabaseManager, SubstrateEvent } from '@joystream/hydra-common'
import { Members } from '../generated/types'
import { MemberId, BuyMembershipParameters, InviteMembershipParameters } from '@joystream/types/augment/all'
import { MembershipMetadata, MemberRemarked } from '@joystream/metadata-protobuf'
import {
  bytesToString,
  deserializeMetadata,
  genericEventFields,
  getWorker,
  inconsistentState,
  toNumber,
  updateMetaprotocolTransactionStatus,
} from './common'
import {
  Membership,
  MembershipEntryMethod,
  MembershipSystemSnapshot,
  MemberMetadata,
  MembershipBoughtEvent,
  MemberProfileUpdatedEvent,
  MemberAccountsUpdatedEvent,
  MemberInvitedEvent,
  MemberVerificationStatusUpdatedEvent,
  InvitesTransferredEvent,
  StakingAccountConfirmedEvent,
  StakingAccountRemovedEvent,
  InitialInvitationCountUpdatedEvent,
  MembershipPriceUpdatedEvent,
  ReferralCutUpdatedEvent,
  InitialInvitationBalanceUpdatedEvent,
  StakingAccountAddedEvent,
  LeaderInvitationQuotaUpdatedEvent,
  MembershipEntryPaid,
  MembershipEntryInvited,
  AvatarUri,
  WorkingGroup,
  MembershipExternalResource,
  MembershipExternalResourceType,
  MetaprotocolTransactionStatusEvent,
  MetaprotocolTransactionPending,
  MetaprotocolTransactionErrored,
  MetaprotocolTransactionSuccessful,
} from 'query-node/dist/model'
import {
  processReactVideoMessage,
  processReactCommentMessage,
  processCreateCommentMessage,
  processEditCommentMessage,
  processDeleteCommentMessage,
} from './content'
import { BaseModel } from '@joystream/warthog'
import { Bytes } from '@polkadot/types'
import { isSet } from '@joystream/metadata-protobuf/utils'

async function getMemberById(store: DatabaseManager, id: MemberId, relations: string[] = []): Promise<Membership> {
  const member = await store.get(Membership, { where: { id: id.toString() }, relations })
  if (!member) {
    throw new Error(`Member(${id}) not found`)
  }
  return member
}

async function getLatestMembershipSystemSnapshot(store: DatabaseManager): Promise<MembershipSystemSnapshot> {
  const membershipSystem = await store.get(MembershipSystemSnapshot, {
    order: { snapshotBlock: 'DESC' },
  })
  if (!membershipSystem) {
    throw new Error(`Membership system snapshot not found! Forgot to run "yarn workspace query-node-root store:init"?`)
  }
  return membershipSystem
}

async function getOrCreateMembershipSnapshot({ store, event }: EventContext & StoreContext) {
  const latestSnapshot = await getLatestMembershipSystemSnapshot(store)
  const eventTime = new Date(event.blockTimestamp)
  return latestSnapshot.snapshotBlock === event.blockNumber
    ? latestSnapshot
    : new MembershipSystemSnapshot({
        ...latestSnapshot,
        createdAt: eventTime,
        updatedAt: eventTime,
        id: undefined,
        snapshotBlock: event.blockNumber,
      })
}

async function saveMembershipExternalResources(
  store: DatabaseManager,
  from: MembershipExternalResource[] | undefined,
  metadata: MembershipMetadata.IExternalResource[] | undefined | null,
  memberMetadata: MemberMetadata
): Promise<void> {
  const externalResource = from ?? metadata?.map(asMembershipExternalResource) ?? []
  for (const { type, value } of externalResource) {
    if (type && value) {
      await store.save<MembershipExternalResource>(new MembershipExternalResource({ type, value, memberMetadata }))
    }
  }

  function asMembershipExternalResource(
    metadata: MembershipMetadata.IExternalResource
  ): Pick<MembershipExternalResource, 'type' | 'value'> {
    const type = isSet(metadata.type) && MembershipMetadata.ExternalResource.ResourceType[metadata.type]

    if (!type || !(type in MembershipExternalResourceType)) {
      throw new Error(`Invalid ResourceType: ${type}`)
    }

    return { type: MembershipExternalResourceType[type], value: metadata.value ?? '' }
  }
}

async function saveMembershipMetadata(
  store: DatabaseManager,
  from: Partial<MemberMetadata>,
  metadataBytes?: Bytes
): Promise<MemberMetadata> {
  const metadata = metadataBytes && deserializeMetadata(MembershipMetadata, metadataBytes)

  const avatar = from.avatar || metadata?.avatarUri ? new AvatarUri() : undefined
  if (avatar) {
    avatar.avatarUri = from.avatar && 'avatarUri' in from.avatar ? from.avatar.avatarUri : metadata?.avatarUri || ''
  }

  const metadataEntity = new MemberMetadata({
    id: undefined,
    name: metadata?.name || undefined,
    about: metadata?.about || undefined,
    ...from,
    avatar,
  })

  await store.save<MemberMetadata>(metadataEntity)

  await saveMembershipExternalResources(store, from.externalResources, metadata?.externalResources, metadataEntity)

  return metadataEntity
}

async function createNewMemberFromParams(
  store: DatabaseManager,
  event: SubstrateEvent,
  memberId: MemberId,
  entryMethod: typeof MembershipEntryMethod,
  params: BuyMembershipParameters | InviteMembershipParameters
): Promise<Membership> {
  const { defaultInviteCount } = await getLatestMembershipSystemSnapshot(store)
  const { root_account: rootAccount, controller_account: controllerAccount, handle, metadata: metadataBytes } = params
  const eventTime = new Date(event.blockTimestamp)

  const metadataEntity = await saveMembershipMetadata(
    store,
    {
      createdAt: eventTime,
      updatedAt: eventTime,
    },
    metadataBytes
  )

  const member = new Membership({
    createdAt: eventTime,
    updatedAt: eventTime,
    id: memberId.toString(),
    rootAccount: rootAccount.toString(),
    controllerAccount: controllerAccount.toString(),
    handle: handle.unwrap().toString(),
    metadata: metadataEntity,
    entry: entryMethod,
    referredBy:
      entryMethod.isTypeOf === 'MembershipEntryPaid' && (params as BuyMembershipParameters).referrer_id.isSome
        ? new Membership({ id: (params as BuyMembershipParameters).referrer_id.unwrap().toString() })
        : undefined,
    isVerified: false,
    inviteCount: entryMethod.isTypeOf === 'MembershipEntryInvited' ? 0 : defaultInviteCount,
    boundAccounts: [],
    invitees: [],
    referredMembers: [],
    invitedBy:
      entryMethod.isTypeOf === 'MembershipEntryInvited'
        ? new Membership({ id: (params as InviteMembershipParameters).inviting_member_id.toString() })
        : undefined,
    isFoundingMember: false,
    isCouncilMember: false,

    councilCandidacies: [],
    councilMembers: [],
  })

  await store.save<Membership>(member)

  return member
}

export async function createNewMember(
  store: DatabaseManager,
  eventTime: Date,
  memberId: string,
  entryMethod: typeof MembershipEntryMethod,
  rootAccount: string,
  controllerAccount: string,
  handle: string,
  defaultInviteCount: number,
  metadata: MembershipMetadata
): Promise<Membership> {
  const avatar = new AvatarUri()
  avatar.avatarUri = metadata?.avatarUri ?? ''

  const metadataEntity = new MemberMetadata({
    createdAt: eventTime,
    updatedAt: eventTime,
    name: metadata?.name || undefined,
    about: metadata?.about || undefined,
    avatar,
  })

  const member = new Membership({
    createdAt: eventTime,
    updatedAt: eventTime,
    id: memberId,
    rootAccount: rootAccount.toString(),
    controllerAccount: controllerAccount.toString(),
    handle: handle.toString(),
    metadata: metadataEntity,
    entry: entryMethod,
    referredBy: undefined,
    isVerified: false,
    inviteCount: defaultInviteCount,
    boundAccounts: [],
    invitees: [],
    referredMembers: [],
    invitedBy: undefined,
    isFoundingMember: false,
    isCouncilMember: false,
    councilCandidacies: [],
    councilMembers: [],
  })

  await store.save<MemberMetadata>(member.metadata)
  await store.save<Membership>(member)

  return member
}

export async function members_MembershipBought({ store, event }: EventContext & StoreContext): Promise<void> {
  const [memberId, buyMembershipParameters] = new Members.MembershipBoughtEvent(event).params

  const memberEntry = new MembershipEntryPaid()
  const member = await createNewMemberFromParams(store, event, memberId, memberEntry, buyMembershipParameters)

  const membershipBoughtEvent = new MembershipBoughtEvent({
    ...genericEventFields(event),
    newMember: member,
    controllerAccount: member.controllerAccount,
    rootAccount: member.rootAccount,
    handle: member.handle,
    metadata: await saveMembershipMetadata(store, member.metadata),
    referrer: member.referredBy,
  })

  await store.save<MemberMetadata>(membershipBoughtEvent.metadata)
  await store.save<MembershipBoughtEvent>(membershipBoughtEvent)

  // Update the other side of event<->membership relation
  memberEntry.membershipBoughtEventId = membershipBoughtEvent.id
  await store.save<Membership>(member)
}

export async function members_MemberProfileUpdated({ store, event }: EventContext & StoreContext): Promise<void> {
  const [memberId, newHandle, newMetadata] = new Members.MemberProfileUpdatedEvent(event).params
  const metadata = newMetadata.isSome ? deserializeMetadata(MembershipMetadata, newMetadata.unwrap()) : undefined
  const member = await getMemberById(store, memberId, ['metadata'])
  const eventTime = new Date(event.blockTimestamp)

  // FIXME: https://github.com/Joystream/hydra/issues/435
  if (typeof metadata?.name === 'string') {
    member.metadata.name = (metadata.name || null) as string | undefined
    member.metadata.updatedAt = eventTime
  }
  if (typeof metadata?.about === 'string') {
    member.metadata.about = (metadata.about || null) as string | undefined
    member.metadata.updatedAt = eventTime
  }

  if (typeof metadata?.avatarUri === 'string') {
    member.metadata.avatar = (metadata.avatarUri ? new AvatarUri() : null) as AvatarUri | undefined
    if (member.metadata.avatar) {
      member.metadata.avatar.avatarUri = metadata.avatarUri
      member.metadata.updatedAt = eventTime
    }
  }

  if (metadata?.externalResources) {
    member.metadata.updatedAt = eventTime
  }

  if (newHandle.isSome) {
    member.handle = bytesToString(newHandle.unwrap())
    member.updatedAt = eventTime
  }

  await store.save<MemberMetadata>(member.metadata)
  await store.save<Membership>(member)

  if (metadata?.externalResources) {
    await saveMembershipExternalResources(store, undefined, metadata.externalResources, member.metadata)
  }

  const memberProfileUpdatedEvent = new MemberProfileUpdatedEvent({
    ...genericEventFields(event),
    member: member,
    newHandle: member.handle,
    newMetadata: await saveMembershipMetadata(store, member.metadata),
  })

  await store.save<MemberMetadata>(memberProfileUpdatedEvent.newMetadata)
  await store.save<MemberProfileUpdatedEvent>(memberProfileUpdatedEvent)
}

export async function members_MemberAccountsUpdated({ store, event }: EventContext & StoreContext): Promise<void> {
  const [memberId, newRootAccount, newControllerAccount] = new Members.MemberAccountsUpdatedEvent(event).params
  const member = await getMemberById(store, memberId)
  const eventTime = new Date(event.blockTimestamp)

  if (newControllerAccount.isSome) {
    member.controllerAccount = newControllerAccount.unwrap().toString()
  }
  if (newRootAccount.isSome) {
    member.rootAccount = newRootAccount.unwrap().toString()
  }
  member.updatedAt = eventTime

  await store.save<Membership>(member)

  const memberAccountsUpdatedEvent = new MemberAccountsUpdatedEvent({
    ...genericEventFields(event),
    member: member,
    newRootAccount: member.rootAccount,
    newControllerAccount: member.controllerAccount,
  })

  await store.save<MemberAccountsUpdatedEvent>(memberAccountsUpdatedEvent)
}

export async function members_MemberVerificationStatusUpdated({
  store,
  event,
}: EventContext & StoreContext): Promise<void> {
  const [memberId, verificationStatus, workerId] = new Members.MemberVerificationStatusUpdatedEvent(event).params
  const member = await getMemberById(store, memberId)
  const worker = await getWorker(store, 'membershipWorkingGroup', workerId)
  const eventTime = new Date(event.blockTimestamp)

  member.isVerified = verificationStatus.valueOf()
  member.updatedAt = eventTime

  await store.save<Membership>(member)

  const memberVerificationStatusUpdatedEvent = new MemberVerificationStatusUpdatedEvent({
    ...genericEventFields(event),
    member: member,
    isVerified: member.isVerified,
    worker,
  })

  await store.save<MemberVerificationStatusUpdatedEvent>(memberVerificationStatusUpdatedEvent)
}

export async function members_InvitesTransferred({ store, event }: EventContext & StoreContext): Promise<void> {
  const [sourceMemberId, targetMemberId, numberOfInvites] = new Members.InvitesTransferredEvent(event).params
  const sourceMember = await getMemberById(store, sourceMemberId)
  const targetMember = await getMemberById(store, targetMemberId)
  const eventTime = new Date(event.blockTimestamp)

  sourceMember.inviteCount -= numberOfInvites.toNumber()
  sourceMember.updatedAt = eventTime
  targetMember.inviteCount += numberOfInvites.toNumber()
  targetMember.updatedAt = eventTime

  await store.save<Membership>(sourceMember)
  await store.save<Membership>(targetMember)

  const invitesTransferredEvent = new InvitesTransferredEvent({
    ...genericEventFields(event),
    sourceMember,
    targetMember,
    numberOfInvites: numberOfInvites.toNumber(),
  })

  await store.save<InvitesTransferredEvent>(invitesTransferredEvent)
}

export async function members_MemberInvited({ store, event }: EventContext & StoreContext): Promise<void> {
  const [memberId, inviteMembershipParameters] = new Members.MemberInvitedEvent(event).params
  const eventTime = new Date(event.blockTimestamp)
  const entryMethod = new MembershipEntryInvited()
  const invitedMember = await createNewMemberFromParams(store, event, memberId, entryMethod, inviteMembershipParameters)

  // Decrease invite count of inviting member
  const invitingMember = await getMemberById(store, inviteMembershipParameters.inviting_member_id)
  invitingMember.inviteCount -= 1
  invitingMember.updatedAt = eventTime
  await store.save<Membership>(invitingMember)

  const memberInvitedEvent = new MemberInvitedEvent({
    ...genericEventFields(event),
    invitingMember,
    newMember: invitedMember,
    handle: invitedMember.handle,
    rootAccount: invitedMember.rootAccount,
    controllerAccount: invitedMember.controllerAccount,
    metadata: await saveMembershipMetadata(store, invitedMember.metadata),
  })

  await store.save<MemberMetadata>(memberInvitedEvent.metadata)
  await store.save<MemberInvitedEvent>(memberInvitedEvent)
  // Update the other side of event<->member relationship
  entryMethod.memberInvitedEventId = memberInvitedEvent.id
  await store.save<Membership>(invitedMember)
}

export async function members_StakingAccountAdded({ store, event }: EventContext & StoreContext): Promise<void> {
  const [accountId, memberId] = new Members.StakingAccountAddedEvent(event).params

  const stakingAccountAddedEvent = new StakingAccountAddedEvent({
    ...genericEventFields(event),
    member: new Membership({ id: memberId.toString() }),
    account: accountId.toString(),
  })

  await store.save<StakingAccountAddedEvent>(stakingAccountAddedEvent)
}

export async function members_StakingAccountConfirmed({ store, event }: EventContext & StoreContext): Promise<void> {
  const [accountId, memberId] = new Members.StakingAccountConfirmedEvent(event).params
  const member = await getMemberById(store, memberId)
  const eventTime = new Date(event.blockTimestamp)

  member.boundAccounts.push(accountId.toString())
  member.updatedAt = eventTime

  await store.save<Membership>(member)

  const stakingAccountConfirmedEvent = new StakingAccountConfirmedEvent({
    ...genericEventFields(event),
    member,
    account: accountId.toString(),
  })

  await store.save<StakingAccountConfirmedEvent>(stakingAccountConfirmedEvent)
}

export async function members_StakingAccountRemoved({ store, event }: EventContext & StoreContext): Promise<void> {
  const [accountId, memberId] = new Members.StakingAccountRemovedEvent(event).params
  const eventTime = new Date(event.blockTimestamp)
  const member = await getMemberById(store, memberId)

  member.boundAccounts.splice(
    member.boundAccounts.findIndex((a) => a === accountId.toString()),
    1
  )
  member.updatedAt = eventTime

  await store.save<Membership>(member)

  const stakingAccountRemovedEvent = new StakingAccountRemovedEvent({
    ...genericEventFields(event),
    member,
    account: accountId.toString(),
  })

  await store.save<StakingAccountRemovedEvent>(stakingAccountRemovedEvent)
}

export async function members_InitialInvitationCountUpdated(ctx: EventContext & StoreContext): Promise<void> {
  const { event, store } = ctx
  const [newDefaultInviteCount] = new Members.InitialInvitationCountUpdatedEvent(event).params
  const membershipSystemSnapshot = await getOrCreateMembershipSnapshot(ctx)

  membershipSystemSnapshot.defaultInviteCount = newDefaultInviteCount.toNumber()

  await store.save<MembershipSystemSnapshot>(membershipSystemSnapshot)

  const initialInvitationCountUpdatedEvent = new InitialInvitationCountUpdatedEvent({
    ...genericEventFields(event),
    newInitialInvitationCount: newDefaultInviteCount.toNumber(),
  })

  await store.save<InitialInvitationCountUpdatedEvent>(initialInvitationCountUpdatedEvent)
}

export async function members_MembershipPriceUpdated(ctx: EventContext & StoreContext): Promise<void> {
  const { event, store } = ctx
  const [newMembershipPrice] = new Members.MembershipPriceUpdatedEvent(event).params
  const membershipSystemSnapshot = await getOrCreateMembershipSnapshot(ctx)

  membershipSystemSnapshot.membershipPrice = newMembershipPrice

  await store.save<MembershipSystemSnapshot>(membershipSystemSnapshot)

  const membershipPriceUpdatedEvent = new MembershipPriceUpdatedEvent({
    ...genericEventFields(event),
    newPrice: newMembershipPrice,
  })

  await store.save<MembershipPriceUpdatedEvent>(membershipPriceUpdatedEvent)
}

export async function members_ReferralCutUpdated(ctx: EventContext & StoreContext): Promise<void> {
  const { event, store } = ctx
  const [newReferralCut] = new Members.ReferralCutUpdatedEvent(event).params
  const membershipSystemSnapshot = await getOrCreateMembershipSnapshot(ctx)

  membershipSystemSnapshot.referralCut = newReferralCut.toNumber()

  await store.save<MembershipSystemSnapshot>(membershipSystemSnapshot)

  const referralCutUpdatedEvent = new ReferralCutUpdatedEvent({
    ...genericEventFields(event),
    newValue: newReferralCut.toNumber(),
  })

  await store.save<ReferralCutUpdatedEvent>(referralCutUpdatedEvent)
}

export async function members_InitialInvitationBalanceUpdated(ctx: EventContext & StoreContext): Promise<void> {
  const { event, store } = ctx
  const [newInvitedInitialBalance] = new Members.InitialInvitationBalanceUpdatedEvent(event).params
  const membershipSystemSnapshot = await getOrCreateMembershipSnapshot(ctx)

  membershipSystemSnapshot.invitedInitialBalance = newInvitedInitialBalance

  await store.save<MembershipSystemSnapshot>(membershipSystemSnapshot)

  const initialInvitationBalanceUpdatedEvent = new InitialInvitationBalanceUpdatedEvent({
    ...genericEventFields(event),
    newInitialBalance: newInvitedInitialBalance,
  })

  await store.save<InitialInvitationBalanceUpdatedEvent>(initialInvitationBalanceUpdatedEvent)
}

export async function members_LeaderInvitationQuotaUpdated({
  store,
  event,
}: EventContext & StoreContext): Promise<void> {
  const [newQuota] = new Members.LeaderInvitationQuotaUpdatedEvent(event).params

  const groupName = 'membershipWorkingGroup'
  const group = await store.get(WorkingGroup, {
    where: { name: groupName },
    relations: ['leader', 'leader.membership'],
  })

  if (!group) {
    throw new Error(`Working group ${groupName} not found!`)
  }

  const lead = group.leader!.membership
  lead.inviteCount = toNumber(newQuota)

  await store.save<Membership>(lead)

  const leaderInvitationQuotaUpdatedEvent = new LeaderInvitationQuotaUpdatedEvent({
    ...genericEventFields(event),
    newInvitationQuota: newQuota.toNumber(),
  })

  await store.save<LeaderInvitationQuotaUpdatedEvent>(leaderInvitationQuotaUpdatedEvent)
}

export async function members_MemberRemarked(ctx: EventContext & StoreContext): Promise<void> {
  const { event, store } = ctx
  const [memberId, message] = new Members.MemberRemarkedEvent(event).params

  const genericFields = genericEventFields(event)
  // unique identifier for metaprotocol tx
  const { id: metaprotocolTxIdentifier } = genericFields as BaseModel

  const metaprotocolTxStatusEvent = new MetaprotocolTransactionStatusEvent({
    ...genericFields,
    status: new MetaprotocolTransactionPending(),
  })

  // save metaprotocol tx status event
  await store.save<MetaprotocolTransactionStatusEvent>(metaprotocolTxStatusEvent)

  try {
    const decodedMessage = MemberRemarked.decode(message.toU8a(true))
    const messageType = decodedMessage.memberRemarked

    // update MetaprotocolTransactionStatusEvent
    const statusSuccessful = new MetaprotocolTransactionSuccessful()

    if (!messageType) {
      inconsistentState('Unsupported message type in member_remark action')
    } else if (messageType === 'reactVideo') {
      await processReactVideoMessage(ctx, memberId, decodedMessage.reactVideo!)
    } else if (messageType === 'reactComment') {
      await processReactCommentMessage(ctx, memberId, decodedMessage.reactComment!)
    } else if (messageType === 'createComment') {
      const comment = await processCreateCommentMessage(ctx, memberId, decodedMessage.createComment!)
      statusSuccessful.commentCreatedId = comment.id
    } else if (messageType === 'editComment') {
      const comment = await processEditCommentMessage(ctx, memberId, decodedMessage.editComment!)
      statusSuccessful.commentEditedId = comment.id
    } else if (messageType === 'deleteComment') {
      const comment = await processDeleteCommentMessage(ctx, memberId, decodedMessage.deleteComment!)
      statusSuccessful.commentDeletedId = comment.id
    }

    await updateMetaprotocolTransactionStatus(store, metaprotocolTxIdentifier, statusSuccessful)
  } catch (e) {
    // update MetaprotocolTransactionStatusEvent
    const statusErrored = new MetaprotocolTransactionErrored()
    await updateMetaprotocolTransactionStatus(store, metaprotocolTxIdentifier, statusErrored, e)
  }
}
