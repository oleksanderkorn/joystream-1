import { flags } from '@oclif/command'
import fs, { PathLike } from 'fs'
import AccountsCommandBase from '../../base/AccountsCommandBase'
import { BlockHash, AccountId, EventRecord } from '@polkadot/types/interfaces'
import { Vec } from '@polkadot/types'

const BURN_ADDRESS = '5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMaeKQu'
// const FROM_ADDRESS = '5EqVuvYEyzCa7xuEZYw9FM5Vkd7FaTcq5CKKN2LuSNqqv8FP'

export interface BurningBlockData {
  events: EventDetails[]
}

export interface EventDetails {
  blockNumber: number
  blockHash: BlockHash
  blockTimestamp: Date
  sender: AccountId
  receiver: AccountId
  amount: number
}

export const saveFile = (jsonString: string, path: PathLike, log: (message?: unknown, ...args: unknown[]) => void) => {
  // try {
  //   fs.rmSync(path)
  // } catch (err) {
  //   console.log('Error deleting file', err)
  // }
  try {
    fs.writeFile(path, jsonString, (err) => {
      if (err) {
        // log('Error writing file', err)
      } else {
        // log('Successfully wrote file')
      }
    })
  } catch (err) {
    console.error(err)
  }
}

const processBurnTransfers = (
  burnEvents: EventRecord[],
  burning: BurningBlockData,
  blockNumber: number,
  blockHash: BlockHash,
  blockTimestamp: Date,
  log: (arg: string) => void
): boolean => {
  let newDataFound = false
  if (burnEvents.length > 0) {
    burnEvents.map((event) => {
      const { data } = event.event
      const sender = data[0] as AccountId
      // log(`Sender: [${sender}]`)
      const receiver = data[1] as AccountId
      // log(`Receiver: [${receiver}]`)
      const amount = Number(data[2])
      if (receiver.toString() === BURN_ADDRESS) {
        log(
          `Found burn event at block [${blockNumber}] date [${blockTimestamp}]: ${event.event.data
            .toJSON()
            ?.toString()}`
        )
        const eventData = {
          blockNumber,
          blockHash,
          blockTimestamp,
          sender,
          receiver,
          amount,
        }
        newDataFound = true
        burning.events.push(eventData)
      }
    })
  }
  return newDataFound
}

const filterByEvent = (eventName: string, events: Vec<EventRecord>) => {
  return events.filter((event) => {
    const { section, method } = event.event
    return `${section}.${method}` === eventName
  })
}

export default class AccountTransferTokens extends AccountsCommandBase {
  static description = 'Transfer tokens from any of the available accounts'

  static flags = {
    from: flags.string({
      required: false,
      description: 'Address of the sender (can also be provided interactively)',
    }),
    to: flags.string({
      required: false,
      description: 'Address of the recipient (can also be provided interactively)',
    }),
    amount: flags.string({
      required: true,
      description: 'Amount of tokens to transfer',
    }),
  }

  async run(): Promise<void> {
    this.log(`Find burning events.`)
    const api = await this.getApi()
    const data = { events: [] }
    for (let block = 1731066; block > 0; block--) {
      const blockHash = await api.getBlockHash(block)
      const blockTimestamp = await api.blockTimestamp(block)
      this.log(`Fetch Block [${block}]. Timestampt: [${blockTimestamp}]. Hash [${blockHash}].`)
      const events = await api.getEvents(blockHash)
      const newDataFound = processBurnTransfers(
        filterByEvent('balances.Transfer', events),
        data,
        block,
        blockHash,
        blockTimestamp,
        this.log
      )
      if (newDataFound) {
        saveFile(JSON.stringify(data, undefined, 4), './data.json', this.log)
      }
    }

    // let { from, to, amount } = this.parse(AccountTransferTokens).flags
    // if (!isValidBalance(amount)) {
    //   this.error('Invalid transfer amount', { exit: ExitCodes.InvalidInput })
    // }
    // // Initial validation
    // if (!from) {
    //   from = await this.promptForAccount('Select sender account')
    // } else if (!this.isKeyAvailable(from)) {
    //   this.error('Sender key not available', { exit: ExitCodes.InvalidInput })
    // }
    // if (!to) {
    //   to = await this.promptForAnyAddress('Select recipient')
    // } else if (validateAddress(to) !== true) {
    //   this.error('Invalid recipient address', { exit: ExitCodes.InvalidInput })
    // }
    // const accBalances = (await this.getApi().getAccountsBalancesInfo([from]))[0]
    // checkBalance(accBalances, new BN(amount))
    // await this.sendAndFollowNamedTx(await this.getDecodedPair(from), 'balances', 'transferKeepAlive', [to, amount])
  }
}
