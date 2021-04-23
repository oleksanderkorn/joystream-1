import * as Types from './schema'

import gql from 'graphql-tag'
export type BlockFieldsFragment = { number: number; timestamp: any; network: Types.Network }

export type EventFieldsFragment = {
  inExtrinsic?: Types.Maybe<string>
  indexInBlock: number
  type: Types.EventType
  inBlock: BlockFieldsFragment
}

export type MemberMetadataFieldsFragment = { name?: Types.Maybe<string>; about?: Types.Maybe<string> }

export type MembershipFieldsFragment = {
  id: string
  handle: string
  controllerAccount: string
  rootAccount: string
  registeredAtTime: any
  entry: Types.MembershipEntryMethod
  isVerified: boolean
  inviteCount: number
  boundAccounts: Array<string>
  metadata: MemberMetadataFieldsFragment
  registeredAtBlock: BlockFieldsFragment
  invitedBy?: Types.Maybe<{ id: string }>
  invitees: Array<{ id: string }>
}

export type GetMemberByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']
}>

export type GetMemberByIdQuery = { membershipByUniqueInput?: Types.Maybe<MembershipFieldsFragment> }

export type MembershipSystemSnapshotFieldsFragment = {
  snapshotTime: any
  referralCut: number
  invitedInitialBalance: any
  defaultInviteCount: number
  membershipPrice: any
  snapshotBlock: BlockFieldsFragment
}

export type GetMembershipSystemSnapshotAtQueryVariables = Types.Exact<{
  time: Types.Scalars['DateTime']
}>

export type GetMembershipSystemSnapshotAtQuery = {
  membershipSystemSnapshots: Array<MembershipSystemSnapshotFieldsFragment>
}

export type GetMembershipSystemSnapshotBeforeQueryVariables = Types.Exact<{
  time: Types.Scalars['DateTime']
}>

export type GetMembershipSystemSnapshotBeforeQuery = {
  membershipSystemSnapshots: Array<MembershipSystemSnapshotFieldsFragment>
}

export type MembershipBoughtEventFieldsFragment = {
  id: string
  rootAccount: string
  controllerAccount: string
  handle: string
  event: EventFieldsFragment
  newMember: { id: string }
  metadata: MemberMetadataFieldsFragment
  referrer?: Types.Maybe<{ id: string }>
}

export type GetMembershipBoughtEventsByMemberIdQueryVariables = Types.Exact<{
  memberId: Types.Scalars['ID']
}>

export type GetMembershipBoughtEventsByMemberIdQuery = {
  membershipBoughtEvents: Array<MembershipBoughtEventFieldsFragment>
}

export type MemberProfileUpdatedEventFieldsFragment = {
  id: string
  newHandle?: Types.Maybe<string>
  event: EventFieldsFragment
  member: { id: string }
  newMetadata: { name?: Types.Maybe<string>; about?: Types.Maybe<string> }
}

export type GetMemberProfileUpdatedEventsByMemberIdQueryVariables = Types.Exact<{
  memberId: Types.Scalars['ID']
}>

export type GetMemberProfileUpdatedEventsByMemberIdQuery = {
  memberProfileUpdatedEvents: Array<MemberProfileUpdatedEventFieldsFragment>
}

export type MemberAccountsUpdatedEventFieldsFragment = {
  id: string
  newRootAccount?: Types.Maybe<string>
  newControllerAccount?: Types.Maybe<string>
  event: EventFieldsFragment
  member: { id: string }
}

export type GetMemberAccountsUpdatedEventsByMemberIdQueryVariables = Types.Exact<{
  memberId: Types.Scalars['ID']
}>

export type GetMemberAccountsUpdatedEventsByMemberIdQuery = {
  memberAccountsUpdatedEvents: Array<MemberAccountsUpdatedEventFieldsFragment>
}

export type MemberInvitedEventFieldsFragment = {
  id: string
  rootAccount: string
  controllerAccount: string
  handle: string
  event: EventFieldsFragment
  invitingMember: { id: string }
  newMember: { id: string }
  metadata: MemberMetadataFieldsFragment
}

export type GetMemberInvitedEventsByNewMemberIdQueryVariables = Types.Exact<{
  newMemberId: Types.Scalars['ID']
}>

export type GetMemberInvitedEventsByNewMemberIdQuery = { memberInvitedEvents: Array<MemberInvitedEventFieldsFragment> }

export type InvitesTransferredEventFieldsFragment = {
  id: string
  numberOfInvites: number
  event: EventFieldsFragment
  sourceMember: { id: string }
  targetMember: { id: string }
}

export type GetInvitesTransferredEventsBySourceMemberIdQueryVariables = Types.Exact<{
  sourceMemberId: Types.Scalars['ID']
}>

export type GetInvitesTransferredEventsBySourceMemberIdQuery = {
  invitesTransferredEvents: Array<InvitesTransferredEventFieldsFragment>
}

export type StakingAccountAddedEventFieldsFragment = {
  id: string
  account: string
  event: EventFieldsFragment
  member: { id: string }
}

export type GetStakingAccountAddedEventsByMemberIdQueryVariables = Types.Exact<{
  memberId: Types.Scalars['ID']
}>

export type GetStakingAccountAddedEventsByMemberIdQuery = {
  stakingAccountAddedEvents: Array<StakingAccountAddedEventFieldsFragment>
}

export type StakingAccountConfirmedEventFieldsFragment = {
  id: string
  account: string
  event: EventFieldsFragment
  member: { id: string }
}

export type GetStakingAccountConfirmedEventsByMemberIdQueryVariables = Types.Exact<{
  memberId: Types.Scalars['ID']
}>

export type GetStakingAccountConfirmedEventsByMemberIdQuery = {
  stakingAccountConfirmedEvents: Array<StakingAccountConfirmedEventFieldsFragment>
}

export type StakingAccountRemovedEventFieldsFragment = {
  id: string
  account: string
  event: EventFieldsFragment
  member: { id: string }
}

export type GetStakingAccountRemovedEventsByMemberIdQueryVariables = Types.Exact<{
  memberId: Types.Scalars['ID']
}>

export type GetStakingAccountRemovedEventsByMemberIdQuery = {
  stakingAccountRemovedEvents: Array<StakingAccountRemovedEventFieldsFragment>
}

export type ReferralCutUpdatedEventFieldsFragment = { id: string; newValue: number; event: EventFieldsFragment }

export type GetReferralCutUpdatedEventsByEventIdQueryVariables = Types.Exact<{
  eventId: Types.Scalars['ID']
}>

export type GetReferralCutUpdatedEventsByEventIdQuery = {
  referralCutUpdatedEvents: Array<ReferralCutUpdatedEventFieldsFragment>
}

export type MembershipPriceUpdatedEventFieldsFragment = { id: string; newPrice: any; event: EventFieldsFragment }

export type GetMembershipPriceUpdatedEventsByEventIdQueryVariables = Types.Exact<{
  eventId: Types.Scalars['ID']
}>

export type GetMembershipPriceUpdatedEventsByEventIdQuery = {
  membershipPriceUpdatedEvents: Array<MembershipPriceUpdatedEventFieldsFragment>
}

export type InitialInvitationBalanceUpdatedEventFieldsFragment = {
  id: string
  newInitialBalance: any
  event: EventFieldsFragment
}

export type GetInitialInvitationBalanceUpdatedEventsByEventIdQueryVariables = Types.Exact<{
  eventId: Types.Scalars['ID']
}>

export type GetInitialInvitationBalanceUpdatedEventsByEventIdQuery = {
  initialInvitationBalanceUpdatedEvents: Array<InitialInvitationBalanceUpdatedEventFieldsFragment>
}

export type InitialInvitationCountUpdatedEventFieldsFragment = {
  id: string
  newInitialInvitationCount: number
  event: EventFieldsFragment
}

export type GetInitialInvitationCountUpdatedEventsByEventIdQueryVariables = Types.Exact<{
  eventId: Types.Scalars['ID']
}>

export type GetInitialInvitationCountUpdatedEventsByEventIdQuery = {
  initialInvitationCountUpdatedEvents: Array<InitialInvitationCountUpdatedEventFieldsFragment>
}

export type ApplicationBasicFieldsFragment = {
  id: string
  runtimeId: number
  status:
    | { __typename: 'ApplicationStatusPending' }
    | { __typename: 'ApplicationStatusAccepted'; openingFilledEventId: string }
    | { __typename: 'ApplicationStatusRejected'; openingFilledEventId: string }
    | { __typename: 'ApplicationStatusWithdrawn'; applicationWithdrawnEventId: string }
    | { __typename: 'ApplicationStatusCancelled'; openingCancelledEventId: string }
}

type OpeningStatusFields_OpeningStatusOpen_Fragment = { __typename: 'OpeningStatusOpen' }

type OpeningStatusFields_OpeningStatusFilled_Fragment = {
  __typename: 'OpeningStatusFilled'
  openingFilledEventId: string
}

type OpeningStatusFields_OpeningStatusCancelled_Fragment = {
  __typename: 'OpeningStatusCancelled'
  openingCancelledEventId: string
}

export type OpeningStatusFieldsFragment =
  | OpeningStatusFields_OpeningStatusOpen_Fragment
  | OpeningStatusFields_OpeningStatusFilled_Fragment
  | OpeningStatusFields_OpeningStatusCancelled_Fragment

export type ApplicationFormQuestionFieldsFragment = {
  question: string
  type: Types.ApplicationFormQuestionType
  index: number
}

export type OpeningMetadataFieldsFragment = {
  shortDescription: string
  description: string
  hiringLimit?: Types.Maybe<number>
  expectedEnding?: Types.Maybe<any>
  applicationDetails: string
  applicationFormQuestions: Array<ApplicationFormQuestionFieldsFragment>
}

export type WorkerFieldsFragment = {
  id: string
  runtimeId: number
  roleAccount: string
  rewardAccount: string
  stakeAccount: string
  isLead: boolean
  stake: any
  hiredAtTime: any
  storage?: Types.Maybe<string>
  group: { name: string }
  membership: { id: string }
  status:
    | { __typename: 'WorkerStatusActive' }
    | { __typename: 'WorkerStatusLeft' }
    | { __typename: 'WorkerStatusTerminated' }
  payouts: Array<{ id: string }>
  hiredAtBlock: BlockFieldsFragment
  application: ApplicationBasicFieldsFragment
}

export type WorkingGroupMetadataFieldsFragment = {
  id: string
  status?: Types.Maybe<string>
  statusMessage?: Types.Maybe<string>
  about?: Types.Maybe<string>
  description?: Types.Maybe<string>
  setAtBlock: BlockFieldsFragment
}

export type OpeningFieldsFragment = {
  id: string
  runtimeId: number
  type: Types.WorkingGroupOpeningType
  stakeAmount: any
  unstakingPeriod: number
  rewardPerBlock: any
  createdAt: any
  group: { name: string; leader?: Types.Maybe<{ runtimeId: number }> }
  applications: Array<ApplicationBasicFieldsFragment>
  status:
    | OpeningStatusFields_OpeningStatusOpen_Fragment
    | OpeningStatusFields_OpeningStatusFilled_Fragment
    | OpeningStatusFields_OpeningStatusCancelled_Fragment
  metadata: OpeningMetadataFieldsFragment
  createdAtBlock: BlockFieldsFragment
}

export type GetOpeningByIdQueryVariables = Types.Exact<{
  openingId: Types.Scalars['ID']
}>

export type GetOpeningByIdQuery = { workingGroupOpeningByUniqueInput?: Types.Maybe<OpeningFieldsFragment> }

export type ApplicationFieldsFragment = {
  createdAt: any
  roleAccount: string
  rewardAccount: string
  stakingAccount: string
  stake: any
  createdAtBlock: BlockFieldsFragment
  opening: { id: string; runtimeId: number }
  applicant: { id: string }
  answers: Array<{ answer: string; question: { question: string } }>
} & ApplicationBasicFieldsFragment

export type GetApplicationByIdQueryVariables = Types.Exact<{
  applicationId: Types.Scalars['ID']
}>

export type GetApplicationByIdQuery = { workingGroupApplicationByUniqueInput?: Types.Maybe<ApplicationFieldsFragment> }

export type WorkingGroupFieldsFragment = {
  id: string
  name: string
  budget: any
  metadata?: Types.Maybe<WorkingGroupMetadataFieldsFragment>
  leader?: Types.Maybe<{ id: string }>
}

export type GetWorkingGroupByNameQueryVariables = Types.Exact<{
  name: Types.Scalars['String']
}>

export type GetWorkingGroupByNameQuery = { workingGroupByUniqueInput?: Types.Maybe<WorkingGroupFieldsFragment> }

export type UpcomingOpeningFieldsFragment = {
  id: string
  expectedStart: any
  stakeAmount: any
  rewardPerBlock: any
  createdAt: any
  group: { name: string }
  metadata: OpeningMetadataFieldsFragment
  createdAtBlock: BlockFieldsFragment
}

export type GetUpcomingOpeningByCreatedInEventIdQueryVariables = Types.Exact<{
  createdInEventId: Types.Scalars['ID']
}>

export type GetUpcomingOpeningByCreatedInEventIdQuery = {
  upcomingWorkingGroupOpenings: Array<UpcomingOpeningFieldsFragment>
}

export type GetWorkingGroupMetadataSnapshotAtQueryVariables = Types.Exact<{
  groupId: Types.Scalars['ID']
  timestamp: Types.Scalars['DateTime']
}>

export type GetWorkingGroupMetadataSnapshotAtQuery = { workingGroupMetadata: Array<WorkingGroupMetadataFieldsFragment> }

export type GetWorkingGroupMetadataSnapshotBeforeQueryVariables = Types.Exact<{
  groupId: Types.Scalars['ID']
  timestamp: Types.Scalars['DateTime']
}>

export type GetWorkingGroupMetadataSnapshotBeforeQuery = {
  workingGroupMetadata: Array<WorkingGroupMetadataFieldsFragment>
}

export type AppliedOnOpeningEventFieldsFragment = {
  id: string
  event: EventFieldsFragment
  group: { name: string }
  opening: { id: string; runtimeId: number }
  application: { id: string; runtimeId: number }
}

export type GetAppliedOnOpeningEventsByEventIdQueryVariables = Types.Exact<{
  eventId: Types.Scalars['ID']
}>

export type GetAppliedOnOpeningEventsByEventIdQuery = {
  appliedOnOpeningEvents: Array<AppliedOnOpeningEventFieldsFragment>
}

export type OpeningAddedEventFieldsFragment = {
  id: string
  event: EventFieldsFragment
  group: { name: string }
  opening: { id: string; runtimeId: number }
}

export type GetOpeningAddedEventsByEventIdQueryVariables = Types.Exact<{
  eventId: Types.Scalars['ID']
}>

export type GetOpeningAddedEventsByEventIdQuery = { openingAddedEvents: Array<OpeningAddedEventFieldsFragment> }

export type OpeningFilledEventFieldsFragment = {
  id: string
  event: EventFieldsFragment
  group: { name: string }
  opening: { id: string; runtimeId: number }
  workersHired: Array<WorkerFieldsFragment>
}

export type GetOpeningFilledEventsByEventIdQueryVariables = Types.Exact<{
  eventId: Types.Scalars['ID']
}>

export type GetOpeningFilledEventsByEventIdQuery = { openingFilledEvents: Array<OpeningFilledEventFieldsFragment> }

export type ApplicationWithdrawnEventFieldsFragment = {
  id: string
  event: EventFieldsFragment
  group: { name: string }
  application: { id: string; runtimeId: number }
}

export type GetApplicationWithdrawnEventsByEventIdQueryVariables = Types.Exact<{
  eventId: Types.Scalars['ID']
}>

export type GetApplicationWithdrawnEventsByEventIdQuery = {
  applicationWithdrawnEvents: Array<ApplicationWithdrawnEventFieldsFragment>
}

export type OpeningCanceledEventFieldsFragment = {
  id: string
  event: EventFieldsFragment
  group: { name: string }
  opening: { id: string; runtimeId: number }
}

export type GetOpeningCancelledEventsByEventIdQueryVariables = Types.Exact<{
  eventId: Types.Scalars['ID']
}>

export type GetOpeningCancelledEventsByEventIdQuery = {
  openingCanceledEvents: Array<OpeningCanceledEventFieldsFragment>
}

export type StatusTextChangedEventFieldsFragment = {
  id: string
  metadata?: Types.Maybe<string>
  event: EventFieldsFragment
  group: { name: string }
  result:
    | { __typename: 'UpcomingOpeningAdded'; upcomingOpeningId: string }
    | { __typename: 'UpcomingOpeningRemoved'; upcomingOpeningId: string }
    | { __typename: 'WorkingGroupMetadataSet'; metadataId: string }
    | { __typename: 'InvalidActionMetadata'; reason: string }
}

export type GetStatusTextChangedEventsByEventIdQueryVariables = Types.Exact<{
  eventId: Types.Scalars['ID']
}>

export type GetStatusTextChangedEventsByEventIdQuery = {
  statusTextChangedEvents: Array<StatusTextChangedEventFieldsFragment>
}

export const MemberMetadataFields = gql`
  fragment MemberMetadataFields on MemberMetadata {
    name
    about
  }
`
export const BlockFields = gql`
  fragment BlockFields on Block {
    number
    timestamp
    network
  }
`
export const MembershipFields = gql`
  fragment MembershipFields on Membership {
    id
    handle
    metadata {
      ...MemberMetadataFields
    }
    controllerAccount
    rootAccount
    registeredAtBlock {
      ...BlockFields
    }
    registeredAtTime
    entry
    isVerified
    inviteCount
    invitedBy {
      id
    }
    invitees {
      id
    }
    boundAccounts
  }
  ${MemberMetadataFields}
  ${BlockFields}
`
export const MembershipSystemSnapshotFields = gql`
  fragment MembershipSystemSnapshotFields on MembershipSystemSnapshot {
    snapshotBlock {
      ...BlockFields
    }
    snapshotTime
    referralCut
    invitedInitialBalance
    defaultInviteCount
    membershipPrice
  }
  ${BlockFields}
`
export const EventFields = gql`
  fragment EventFields on Event {
    inBlock {
      ...BlockFields
    }
    inExtrinsic
    indexInBlock
    type
  }
  ${BlockFields}
`
export const MembershipBoughtEventFields = gql`
  fragment MembershipBoughtEventFields on MembershipBoughtEvent {
    id
    event {
      ...EventFields
    }
    newMember {
      id
    }
    rootAccount
    controllerAccount
    handle
    metadata {
      ...MemberMetadataFields
    }
    referrer {
      id
    }
  }
  ${EventFields}
  ${MemberMetadataFields}
`
export const MemberProfileUpdatedEventFields = gql`
  fragment MemberProfileUpdatedEventFields on MemberProfileUpdatedEvent {
    id
    event {
      ...EventFields
    }
    member {
      id
    }
    newHandle
    newMetadata {
      name
      about
    }
  }
  ${EventFields}
`
export const MemberAccountsUpdatedEventFields = gql`
  fragment MemberAccountsUpdatedEventFields on MemberAccountsUpdatedEvent {
    id
    event {
      ...EventFields
    }
    member {
      id
    }
    newRootAccount
    newControllerAccount
  }
  ${EventFields}
`
export const MemberInvitedEventFields = gql`
  fragment MemberInvitedEventFields on MemberInvitedEvent {
    id
    event {
      ...EventFields
    }
    invitingMember {
      id
    }
    newMember {
      id
    }
    rootAccount
    controllerAccount
    handle
    metadata {
      ...MemberMetadataFields
    }
  }
  ${EventFields}
  ${MemberMetadataFields}
`
export const InvitesTransferredEventFields = gql`
  fragment InvitesTransferredEventFields on InvitesTransferredEvent {
    id
    event {
      ...EventFields
    }
    sourceMember {
      id
    }
    targetMember {
      id
    }
    numberOfInvites
  }
  ${EventFields}
`
export const StakingAccountAddedEventFields = gql`
  fragment StakingAccountAddedEventFields on StakingAccountAddedEvent {
    id
    event {
      ...EventFields
    }
    member {
      id
    }
    account
  }
  ${EventFields}
`
export const StakingAccountConfirmedEventFields = gql`
  fragment StakingAccountConfirmedEventFields on StakingAccountConfirmedEvent {
    id
    event {
      ...EventFields
    }
    member {
      id
    }
    account
  }
  ${EventFields}
`
export const StakingAccountRemovedEventFields = gql`
  fragment StakingAccountRemovedEventFields on StakingAccountRemovedEvent {
    id
    event {
      ...EventFields
    }
    member {
      id
    }
    account
  }
  ${EventFields}
`
export const ReferralCutUpdatedEventFields = gql`
  fragment ReferralCutUpdatedEventFields on ReferralCutUpdatedEvent {
    id
    event {
      ...EventFields
    }
    newValue
  }
  ${EventFields}
`
export const MembershipPriceUpdatedEventFields = gql`
  fragment MembershipPriceUpdatedEventFields on MembershipPriceUpdatedEvent {
    id
    event {
      ...EventFields
    }
    newPrice
  }
  ${EventFields}
`
export const InitialInvitationBalanceUpdatedEventFields = gql`
  fragment InitialInvitationBalanceUpdatedEventFields on InitialInvitationBalanceUpdatedEvent {
    id
    event {
      ...EventFields
    }
    newInitialBalance
  }
  ${EventFields}
`
export const InitialInvitationCountUpdatedEventFields = gql`
  fragment InitialInvitationCountUpdatedEventFields on InitialInvitationCountUpdatedEvent {
    id
    event {
      ...EventFields
    }
    newInitialInvitationCount
  }
  ${EventFields}
`
export const ApplicationBasicFields = gql`
  fragment ApplicationBasicFields on WorkingGroupApplication {
    id
    runtimeId
    status {
      __typename
      ... on ApplicationStatusCancelled {
        openingCancelledEventId
      }
      ... on ApplicationStatusWithdrawn {
        applicationWithdrawnEventId
      }
      ... on ApplicationStatusAccepted {
        openingFilledEventId
      }
      ... on ApplicationStatusRejected {
        openingFilledEventId
      }
    }
  }
`
export const OpeningStatusFields = gql`
  fragment OpeningStatusFields on WorkingGroupOpeningStatus {
    __typename
    ... on OpeningStatusFilled {
      openingFilledEventId
    }
    ... on OpeningStatusCancelled {
      openingCancelledEventId
    }
  }
`
export const ApplicationFormQuestionFields = gql`
  fragment ApplicationFormQuestionFields on ApplicationFormQuestion {
    question
    type
    index
  }
`
export const OpeningMetadataFields = gql`
  fragment OpeningMetadataFields on WorkingGroupOpeningMetadata {
    shortDescription
    description
    hiringLimit
    expectedEnding
    applicationDetails
    applicationFormQuestions {
      ...ApplicationFormQuestionFields
    }
  }
  ${ApplicationFormQuestionFields}
`
export const OpeningFields = gql`
  fragment OpeningFields on WorkingGroupOpening {
    id
    runtimeId
    group {
      name
      leader {
        runtimeId
      }
    }
    applications {
      ...ApplicationBasicFields
    }
    type
    status {
      ...OpeningStatusFields
    }
    metadata {
      ...OpeningMetadataFields
    }
    stakeAmount
    unstakingPeriod
    rewardPerBlock
    createdAtBlock {
      ...BlockFields
    }
    createdAt
  }
  ${ApplicationBasicFields}
  ${OpeningStatusFields}
  ${OpeningMetadataFields}
  ${BlockFields}
`
export const ApplicationFields = gql`
  fragment ApplicationFields on WorkingGroupApplication {
    ...ApplicationBasicFields
    createdAtBlock {
      ...BlockFields
    }
    createdAt
    opening {
      id
      runtimeId
    }
    applicant {
      id
    }
    roleAccount
    rewardAccount
    stakingAccount
    answers {
      question {
        question
      }
      answer
    }
    stake
  }
  ${ApplicationBasicFields}
  ${BlockFields}
`
export const WorkingGroupMetadataFields = gql`
  fragment WorkingGroupMetadataFields on WorkingGroupMetadata {
    id
    status
    statusMessage
    about
    description
    setAtBlock {
      ...BlockFields
    }
  }
  ${BlockFields}
`
export const WorkingGroupFields = gql`
  fragment WorkingGroupFields on WorkingGroup {
    id
    name
    metadata {
      ...WorkingGroupMetadataFields
    }
    leader {
      id
    }
    budget
  }
  ${WorkingGroupMetadataFields}
`
export const UpcomingOpeningFields = gql`
  fragment UpcomingOpeningFields on UpcomingWorkingGroupOpening {
    id
    group {
      name
    }
    metadata {
      ...OpeningMetadataFields
    }
    expectedStart
    stakeAmount
    rewardPerBlock
    createdAtBlock {
      ...BlockFields
    }
    createdAt
  }
  ${OpeningMetadataFields}
  ${BlockFields}
`
export const AppliedOnOpeningEventFields = gql`
  fragment AppliedOnOpeningEventFields on AppliedOnOpeningEvent {
    id
    event {
      ...EventFields
    }
    group {
      name
    }
    opening {
      id
      runtimeId
    }
    application {
      id
      runtimeId
    }
  }
  ${EventFields}
`
export const OpeningAddedEventFields = gql`
  fragment OpeningAddedEventFields on OpeningAddedEvent {
    id
    event {
      ...EventFields
    }
    group {
      name
    }
    opening {
      id
      runtimeId
    }
  }
  ${EventFields}
`
export const WorkerFields = gql`
  fragment WorkerFields on Worker {
    id
    runtimeId
    group {
      name
    }
    membership {
      id
    }
    roleAccount
    rewardAccount
    stakeAccount
    status {
      __typename
    }
    isLead
    stake
    payouts {
      id
    }
    hiredAtBlock {
      ...BlockFields
    }
    hiredAtTime
    application {
      ...ApplicationBasicFields
    }
    storage
  }
  ${BlockFields}
  ${ApplicationBasicFields}
`
export const OpeningFilledEventFields = gql`
  fragment OpeningFilledEventFields on OpeningFilledEvent {
    id
    event {
      ...EventFields
    }
    group {
      name
    }
    opening {
      id
      runtimeId
    }
    workersHired {
      ...WorkerFields
    }
  }
  ${EventFields}
  ${WorkerFields}
`
export const ApplicationWithdrawnEventFields = gql`
  fragment ApplicationWithdrawnEventFields on ApplicationWithdrawnEvent {
    id
    event {
      ...EventFields
    }
    group {
      name
    }
    application {
      id
      runtimeId
    }
  }
  ${EventFields}
`
export const OpeningCanceledEventFields = gql`
  fragment OpeningCanceledEventFields on OpeningCanceledEvent {
    id
    event {
      ...EventFields
    }
    group {
      name
    }
    opening {
      id
      runtimeId
    }
  }
  ${EventFields}
`
export const StatusTextChangedEventFields = gql`
  fragment StatusTextChangedEventFields on StatusTextChangedEvent {
    id
    event {
      ...EventFields
    }
    group {
      name
    }
    metadata
    result {
      __typename
      ... on UpcomingOpeningAdded {
        upcomingOpeningId
      }
      ... on UpcomingOpeningRemoved {
        upcomingOpeningId
      }
      ... on WorkingGroupMetadataSet {
        metadataId
      }
      ... on InvalidActionMetadata {
        reason
      }
    }
  }
  ${EventFields}
`
export const GetMemberById = gql`
  query getMemberById($id: ID!) {
    membershipByUniqueInput(where: { id: $id }) {
      ...MembershipFields
    }
  }
  ${MembershipFields}
`
export const GetMembershipSystemSnapshotAt = gql`
  query getMembershipSystemSnapshotAt($time: DateTime!) {
    membershipSystemSnapshots(where: { snapshotTime_eq: $time }, orderBy: snapshotTime_DESC, limit: 1) {
      ...MembershipSystemSnapshotFields
    }
  }
  ${MembershipSystemSnapshotFields}
`
export const GetMembershipSystemSnapshotBefore = gql`
  query getMembershipSystemSnapshotBefore($time: DateTime!) {
    membershipSystemSnapshots(where: { snapshotTime_lt: $time }, orderBy: snapshotTime_DESC, limit: 1) {
      ...MembershipSystemSnapshotFields
    }
  }
  ${MembershipSystemSnapshotFields}
`
export const GetMembershipBoughtEventsByMemberId = gql`
  query getMembershipBoughtEventsByMemberId($memberId: ID!) {
    membershipBoughtEvents(where: { newMemberId_eq: $memberId }) {
      ...MembershipBoughtEventFields
    }
  }
  ${MembershipBoughtEventFields}
`
export const GetMemberProfileUpdatedEventsByMemberId = gql`
  query getMemberProfileUpdatedEventsByMemberId($memberId: ID!) {
    memberProfileUpdatedEvents(where: { memberId_eq: $memberId }) {
      ...MemberProfileUpdatedEventFields
    }
  }
  ${MemberProfileUpdatedEventFields}
`
export const GetMemberAccountsUpdatedEventsByMemberId = gql`
  query getMemberAccountsUpdatedEventsByMemberId($memberId: ID!) {
    memberAccountsUpdatedEvents(where: { memberId_eq: $memberId }) {
      ...MemberAccountsUpdatedEventFields
    }
  }
  ${MemberAccountsUpdatedEventFields}
`
export const GetMemberInvitedEventsByNewMemberId = gql`
  query getMemberInvitedEventsByNewMemberId($newMemberId: ID!) {
    memberInvitedEvents(where: { newMemberId_eq: $newMemberId }) {
      ...MemberInvitedEventFields
    }
  }
  ${MemberInvitedEventFields}
`
export const GetInvitesTransferredEventsBySourceMemberId = gql`
  query getInvitesTransferredEventsBySourceMemberId($sourceMemberId: ID!) {
    invitesTransferredEvents(where: { sourceMemberId_eq: $sourceMemberId }) {
      ...InvitesTransferredEventFields
    }
  }
  ${InvitesTransferredEventFields}
`
export const GetStakingAccountAddedEventsByMemberId = gql`
  query getStakingAccountAddedEventsByMemberId($memberId: ID!) {
    stakingAccountAddedEvents(where: { memberId_eq: $memberId }) {
      ...StakingAccountAddedEventFields
    }
  }
  ${StakingAccountAddedEventFields}
`
export const GetStakingAccountConfirmedEventsByMemberId = gql`
  query getStakingAccountConfirmedEventsByMemberId($memberId: ID!) {
    stakingAccountConfirmedEvents(where: { memberId_eq: $memberId }) {
      ...StakingAccountConfirmedEventFields
    }
  }
  ${StakingAccountConfirmedEventFields}
`
export const GetStakingAccountRemovedEventsByMemberId = gql`
  query getStakingAccountRemovedEventsByMemberId($memberId: ID!) {
    stakingAccountRemovedEvents(where: { memberId_eq: $memberId }) {
      ...StakingAccountRemovedEventFields
    }
  }
  ${StakingAccountRemovedEventFields}
`
export const GetReferralCutUpdatedEventsByEventId = gql`
  query getReferralCutUpdatedEventsByEventId($eventId: ID!) {
    referralCutUpdatedEvents(where: { eventId_eq: $eventId }) {
      ...ReferralCutUpdatedEventFields
    }
  }
  ${ReferralCutUpdatedEventFields}
`
export const GetMembershipPriceUpdatedEventsByEventId = gql`
  query getMembershipPriceUpdatedEventsByEventId($eventId: ID!) {
    membershipPriceUpdatedEvents(where: { eventId_eq: $eventId }) {
      ...MembershipPriceUpdatedEventFields
    }
  }
  ${MembershipPriceUpdatedEventFields}
`
export const GetInitialInvitationBalanceUpdatedEventsByEventId = gql`
  query getInitialInvitationBalanceUpdatedEventsByEventId($eventId: ID!) {
    initialInvitationBalanceUpdatedEvents(where: { eventId_eq: $eventId }) {
      ...InitialInvitationBalanceUpdatedEventFields
    }
  }
  ${InitialInvitationBalanceUpdatedEventFields}
`
export const GetInitialInvitationCountUpdatedEventsByEventId = gql`
  query getInitialInvitationCountUpdatedEventsByEventId($eventId: ID!) {
    initialInvitationCountUpdatedEvents(where: { eventId_eq: $eventId }) {
      ...InitialInvitationCountUpdatedEventFields
    }
  }
  ${InitialInvitationCountUpdatedEventFields}
`
export const GetOpeningById = gql`
  query getOpeningById($openingId: ID!) {
    workingGroupOpeningByUniqueInput(where: { id: $openingId }) {
      ...OpeningFields
    }
  }
  ${OpeningFields}
`
export const GetApplicationById = gql`
  query getApplicationById($applicationId: ID!) {
    workingGroupApplicationByUniqueInput(where: { id: $applicationId }) {
      ...ApplicationFields
    }
  }
  ${ApplicationFields}
`
export const GetWorkingGroupByName = gql`
  query getWorkingGroupByName($name: String!) {
    workingGroupByUniqueInput(where: { name: $name }) {
      ...WorkingGroupFields
    }
  }
  ${WorkingGroupFields}
`
export const GetUpcomingOpeningByCreatedInEventId = gql`
  query getUpcomingOpeningByCreatedInEventId($createdInEventId: ID!) {
    upcomingWorkingGroupOpenings(where: { createdInEventId_eq: $createdInEventId }) {
      ...UpcomingOpeningFields
    }
  }
  ${UpcomingOpeningFields}
`
export const GetWorkingGroupMetadataSnapshotAt = gql`
  query getWorkingGroupMetadataSnapshotAt($groupId: ID!, $timestamp: DateTime!) {
    workingGroupMetadata(where: { createdAt_eq: $timestamp, groupId_eq: $groupId }, orderBy: createdAt_DESC, limit: 1) {
      ...WorkingGroupMetadataFields
    }
  }
  ${WorkingGroupMetadataFields}
`
export const GetWorkingGroupMetadataSnapshotBefore = gql`
  query getWorkingGroupMetadataSnapshotBefore($groupId: ID!, $timestamp: DateTime!) {
    workingGroupMetadata(where: { createdAt_lt: $timestamp, groupId_eq: $groupId }, orderBy: createdAt_DESC, limit: 1) {
      ...WorkingGroupMetadataFields
    }
  }
  ${WorkingGroupMetadataFields}
`
export const GetAppliedOnOpeningEventsByEventId = gql`
  query getAppliedOnOpeningEventsByEventId($eventId: ID!) {
    appliedOnOpeningEvents(where: { eventId_eq: $eventId }) {
      ...AppliedOnOpeningEventFields
    }
  }
  ${AppliedOnOpeningEventFields}
`
export const GetOpeningAddedEventsByEventId = gql`
  query getOpeningAddedEventsByEventId($eventId: ID!) {
    openingAddedEvents(where: { eventId_eq: $eventId }) {
      ...OpeningAddedEventFields
    }
  }
  ${OpeningAddedEventFields}
`
export const GetOpeningFilledEventsByEventId = gql`
  query getOpeningFilledEventsByEventId($eventId: ID!) {
    openingFilledEvents(where: { eventId_eq: $eventId }) {
      ...OpeningFilledEventFields
    }
  }
  ${OpeningFilledEventFields}
`
export const GetApplicationWithdrawnEventsByEventId = gql`
  query getApplicationWithdrawnEventsByEventId($eventId: ID!) {
    applicationWithdrawnEvents(where: { eventId_eq: $eventId }) {
      ...ApplicationWithdrawnEventFields
    }
  }
  ${ApplicationWithdrawnEventFields}
`
export const GetOpeningCancelledEventsByEventId = gql`
  query getOpeningCancelledEventsByEventId($eventId: ID!) {
    openingCanceledEvents(where: { eventId_eq: $eventId }) {
      ...OpeningCanceledEventFields
    }
  }
  ${OpeningCanceledEventFields}
`
export const GetStatusTextChangedEventsByEventId = gql`
  query getStatusTextChangedEventsByEventId($eventId: ID!) {
    statusTextChangedEvents(where: { eventId_eq: $eventId }) {
      ...StatusTextChangedEventFields
    }
  }
  ${StatusTextChangedEventFields}
`
