import { Option, bool, u32, Text } from '@polkadot/types'
import { RegistryTypes } from '@polkadot/types/types'
import { AccountId, MemberId, JoyStructDecorated } from './common'

export type IMembership = {
  handle_hash: Text
  root_account: AccountId
  controller_account: AccountId
  verified: bool
  invites: u32
}

export class Membership
  extends JoyStructDecorated({
    handle_hash: Text,
    root_account: AccountId,
    controller_account: AccountId,
    verified: bool,
    invites: u32,
  })
  implements IMembership {}

export type IStakingAccountMemberBinding = {
  member_id: MemberId
  confirmed: bool
}

export class StakingAccountMemberBinding
  extends JoyStructDecorated({
    member_id: MemberId,
    confirmed: bool,
  })
  implements IStakingAccountMemberBinding {}

export type IBuyMembershipParameters = {
  root_account: AccountId
  controller_account: AccountId
  name: Option<Text>
  handle: Option<Text>
  avatar_uri: Option<Text>
  about: Option<Text>
  referrer_id: Option<MemberId>
}

export class BuyMembershipParameters
  extends JoyStructDecorated({
    root_account: AccountId,
    controller_account: AccountId,
    name: Option.with(Text),
    handle: Option.with(Text),
    avatar_uri: Option.with(Text),
    about: Option.with(Text),
    referrer_id: Option.with(MemberId),
  })
  implements IBuyMembershipParameters {}

export type IInviteMembershipParameters = {
  inviting_member_id: MemberId
  root_account: AccountId
  controller_account: AccountId
  name: Option<Text>
  handle: Option<Text>
  avatar_uri: Option<Text>
  about: Option<Text>
}

export class InviteMembershipParameters
  extends JoyStructDecorated({
    inviting_member_id: MemberId,
    root_account: AccountId,
    controller_account: AccountId,
    name: Option.with(Text),
    handle: Option.with(Text),
    avatar_uri: Option.with(Text),
    about: Option.with(Text),
  })
  implements IInviteMembershipParameters {}

export const membersTypes: RegistryTypes = {
  Membership,
  StakingAccountMemberBinding,
  BuyMembershipParameters,
  InviteMembershipParameters,
}

export default membersTypes
