// Ensure we're `no_std` when compiling for Wasm.
#![cfg_attr(not(feature = "std"), no_std)]

pub mod constraints;
pub mod council;
pub mod currency;
pub mod membership;
pub mod storage;
pub mod working_group;

use codec::{Codec, Decode, Encode};
#[cfg(feature = "std")]
use serde::{Deserialize, Serialize};

use frame_support::traits::LockIdentifier;
use frame_support::Parameter;
pub use membership::{ActorId, MemberId, MembershipTypes, StakingAccountValidator};
use sp_arithmetic::traits::BaseArithmetic;
use sp_runtime::traits::{MaybeSerialize, Member};
use sp_std::collections::btree_set::BTreeSet;
use sp_std::vec::Vec;

/// HTTP Url string
pub type Url = Vec<u8>;
pub type AssetUrls = Vec<Url>;

/// Generic trait for strorage ownership dependent pallets.
pub trait StorageOwnership {
    /// Channel id representation.
    type ChannelId: Parameter
        + Member
        + BaseArithmetic
        + Codec
        + Default
        + Copy
        + MaybeSerialize
        + Ord
        + PartialEq;

    /// Content id representation.
    type ContentId: Parameter + Member + Codec + Default + Copy + MaybeSerialize + Ord + PartialEq;

    /// Data object type id.
    type DataObjectTypeId: Parameter
        + Member
        + BaseArithmetic
        + Codec
        + Default
        + Copy
        + MaybeSerialize
        + Ord
        + PartialEq;
}

/// Defines time in both block number and substrate time abstraction.
#[cfg_attr(feature = "std", derive(Serialize, Deserialize))]
#[derive(Clone, Encode, Decode, PartialEq, Eq, Debug, Default)]
pub struct BlockAndTime<BlockNumber, Moment> {
    /// Defines chain block
    pub block: BlockNumber,

    /// Defines time
    pub time: Moment,
}

/// Parameters for the 'Funding Request' proposal.
#[cfg_attr(feature = "std", derive(Serialize, Deserialize))]
#[derive(Encode, Decode, Clone, PartialEq, Debug, Eq)]
pub struct FundingRequestParameters<Balance, AccountId> {
    /// Single reciever account of funding request
    pub account: AccountId,

    /// Amount of funds the account will recieve
    pub amount: Balance,
}

/// Kind of Balance for `Update Working Group Budget`.
#[cfg_attr(feature = "std", derive(Serialize, Deserialize))]
#[derive(Encode, Decode, Clone, Copy, PartialEq, Debug, Eq)]
pub enum BalanceKind {
    /// Increasing Working Group budget decreasing Council budget
    Positive,
    /// Decreasing Working Group budget increasing Council budget
    Negative,
}

/// Gathers current block and time information for the runtime.
/// If this function is used inside a config() at genesis the timestamp will be 0
/// because the timestamp is actually produced by validators.
pub fn current_block_time<T: frame_system::Trait + pallet_timestamp::Trait>(
) -> BlockAndTime<T::BlockNumber, T::Moment> {
    BlockAndTime {
        block: <frame_system::Module<T>>::block_number(),
        time: <pallet_timestamp::Module<T>>::now(),
    }
}

/// Provides allowed locks combination for the accounts.
pub trait AllowedLockCombinationProvider {
    /// Return allowed locks combination set.
    fn get_allowed_lock_combinations() -> BTreeSet<(LockIdentifier, LockIdentifier)>;
}
