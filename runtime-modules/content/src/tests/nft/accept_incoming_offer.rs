#![cfg(test)]
use crate::tests::curators;
use crate::tests::fixtures::{
    create_default_member_owned_channel_with_video, create_initial_storage_buckets_helper,
    increase_account_balance_helper, CreateChannelFixture, CreateVideoFixture,
};
use crate::tests::mock::*;
use crate::*;
use frame_support::{assert_err, assert_ok};

#[test]
fn accept_incoming_offer() {
    with_default_mock_builder(|| {
        // Run to block one to see emitted events
        run_to_block(1);

        let video_id = NextVideoId::<Test>::get();
        create_initial_storage_buckets_helper();
        increase_account_balance_helper(DEFAULT_MEMBER_ACCOUNT_ID, INITIAL_BALANCE);
        create_default_member_owned_channel_with_video();

        // Issue nft
        assert_ok!(Content::issue_nft(
            Origin::signed(DEFAULT_MEMBER_ACCOUNT_ID),
            ContentActor::Member(DEFAULT_MEMBER_ID),
            video_id,
            NftIssuanceParameters::<Test>::default(),
        ));

        // Offer nft
        assert_ok!(Content::offer_nft(
            Origin::signed(DEFAULT_MEMBER_ACCOUNT_ID),
            video_id,
            ContentActor::Member(DEFAULT_MEMBER_ID),
            SECOND_MEMBER_ID,
            None,
        ));

        // Runtime tested state before call

        // Events number before tested calls
        let number_of_events_before_call = System::events().len();

        // Accept nft offer
        assert_ok!(Content::accept_incoming_offer(
            Origin::signed(SECOND_MEMBER_ACCOUNT_ID),
            video_id,
        ));

        // Runtime tested state after call

        // Ensure nft offer accepted succesfully
        assert!(matches!(
            Content::video_by_id(video_id).nft_status,
            Some(OwnedNft {
                owner: NftOwner::Member(member_id),
                transactional_status: TransactionalStatus::<Test>::Idle,
                ..
            }) if member_id == SECOND_MEMBER_ID
        ));

        // Last event checked
        assert_event(
            MetaEvent::content(RawEvent::OfferAccepted(video_id)),
            number_of_events_before_call + 1,
        );
    })
}

#[test]
fn accept_incoming_offer_video_does_not_exist() {
    with_default_mock_builder(|| {
        // Run to block one to see emitted events
        run_to_block(1);

        let video_id = NextVideoId::<Test>::get();

        // Make an attempt to accept incoming nft offer if corresponding video does not exist
        let accept_incoming_offer_result =
            Content::accept_incoming_offer(Origin::signed(SECOND_MEMBER_ACCOUNT_ID), video_id);

        // Failure checked
        assert_err!(
            accept_incoming_offer_result,
            Error::<Test>::VideoDoesNotExist
        );
    })
}

#[test]
fn accept_incoming_offer_nft_not_issued() {
    with_default_mock_builder(|| {
        // Run to block one to see emitted events
        run_to_block(1);

        let video_id = NextVideoId::<Test>::get();
        create_initial_storage_buckets_helper();
        increase_account_balance_helper(DEFAULT_MEMBER_ACCOUNT_ID, INITIAL_BALANCE);
        create_default_member_owned_channel_with_video();

        // Make an attempt to accept incoming nft offer if corresponding nft is not issued yet
        let accept_incoming_offer_result =
            Content::accept_incoming_offer(Origin::signed(SECOND_MEMBER_ACCOUNT_ID), video_id);

        // Failure checked
        assert_err!(accept_incoming_offer_result, Error::<Test>::NftDoesNotExist);
    })
}

#[test]
fn accept_incoming_offer_auth_failed() {
    with_default_mock_builder(|| {
        // Run to block one to see emitted events
        run_to_block(1);

        let video_id = NextVideoId::<Test>::get();
        create_initial_storage_buckets_helper();
        increase_account_balance_helper(DEFAULT_MEMBER_ACCOUNT_ID, INITIAL_BALANCE);
        create_default_member_owned_channel_with_video();

        // Issue nft
        assert_ok!(Content::issue_nft(
            Origin::signed(DEFAULT_MEMBER_ACCOUNT_ID),
            ContentActor::Member(DEFAULT_MEMBER_ID),
            video_id,
            NftIssuanceParameters::<Test>::default(),
        ));

        // Offer nft
        assert_ok!(Content::offer_nft(
            Origin::signed(DEFAULT_MEMBER_ACCOUNT_ID),
            video_id,
            ContentActor::Member(DEFAULT_MEMBER_ID),
            SECOND_MEMBER_ID,
            None,
        ));

        // Make an attempt to accept incoming nft offer providing wrong credentials
        let accept_incoming_offer_result = Content::accept_incoming_offer(
            Origin::signed(UNAUTHORIZED_MEMBER_ACCOUNT_ID),
            video_id,
        );

        // Failure checked
        assert_err!(
            accept_incoming_offer_result,
            Error::<Test>::MemberAuthFailed
        );
    })
}

#[test]
fn accept_incoming_offer_no_incoming_offers() {
    with_default_mock_builder(|| {
        // Run to block one to see emitted events
        run_to_block(1);

        let video_id = NextVideoId::<Test>::get();
        create_initial_storage_buckets_helper();
        increase_account_balance_helper(DEFAULT_MEMBER_ACCOUNT_ID, INITIAL_BALANCE);
        create_default_member_owned_channel_with_video();

        // Issue nft
        assert_ok!(Content::issue_nft(
            Origin::signed(DEFAULT_MEMBER_ACCOUNT_ID),
            ContentActor::Member(DEFAULT_MEMBER_ID),
            video_id,
            NftIssuanceParameters::<Test>::default(),
        ));

        // Make an attempt to accept incoming nft offer if there is no incoming transfers
        let accept_incoming_offer_result =
            Content::accept_incoming_offer(Origin::signed(SECOND_MEMBER_ACCOUNT_ID), video_id);

        // Failure checked
        assert_err!(
            accept_incoming_offer_result,
            Error::<Test>::PendingOfferDoesNotExist
        );
    })
}

#[test]
fn accept_incoming_offer_ok_with_reward_account_not_set_succeeds_with_member_owner_channel() {
    let video_id = 1u64;
    with_default_mock_builder(|| {
        // Run to block one to see emitted events
        run_to_block(1);
        // channel with no reward account
        CreateChannelFixture::default()
            .with_sender(DEFAULT_MEMBER_ACCOUNT_ID)
            .with_actor(ContentActor::Member(DEFAULT_MEMBER_ID))
            .call();
        CreateVideoFixture::default()
            .with_sender(DEFAULT_MEMBER_ACCOUNT_ID)
            .with_actor(ContentActor::Member(DEFAULT_MEMBER_ID))
            .call();

        assert_ok!(Content::issue_nft(
            Origin::signed(DEFAULT_MEMBER_ACCOUNT_ID),
            ContentActor::Member(DEFAULT_MEMBER_ID),
            video_id,
            NftIssuanceParameters::<Test>::default(),
        ));

        increase_account_balance_helper(SECOND_MEMBER_ACCOUNT_ID, DEFAULT_NFT_PRICE);

        // Offer nft
        assert_ok!(Content::offer_nft(
            Origin::signed(DEFAULT_MEMBER_ACCOUNT_ID),
            video_id,
            ContentActor::Member(DEFAULT_MEMBER_ID),
            SECOND_MEMBER_ID,
            Some(100u64), // price
        ));

        // Make an attempt to accept incoming nft offer if sender is owner and reward account is not set
        assert_ok!(Content::accept_incoming_offer(
            Origin::signed(SECOND_MEMBER_ACCOUNT_ID),
            video_id
        ));

        // check owner balance increased by net profit
        assert_eq!(
            Balances::<Test>::usable_balance(DEFAULT_MEMBER_ACCOUNT_ID),
            100u64 - (Content::platform_fee_percentage() * 100u64)
        );
    })
}

#[test]
fn accept_incoming_offer_reward_account_burns_token_with_curator_owner_channel() {
    with_default_mock_builder(|| {
        // Run to block one to see emitted events
        run_to_block(1);

        let curator_group_id = curators::add_curator_to_new_group(DEFAULT_CURATOR_ID);
        let video_id = Content::next_video_id();
        let curator_actor = ContentActor::Curator(curator_group_id, DEFAULT_CURATOR_ID);
        CreateChannelFixture::default()
            .with_sender(DEFAULT_CURATOR_ACCOUNT_ID)
            .with_actor(curator_actor)
            .call();
        CreateVideoFixture::default()
            .with_sender(DEFAULT_CURATOR_ACCOUNT_ID)
            .with_actor(ContentActor::Curator(curator_group_id, DEFAULT_CURATOR_ID))
            .call();

        assert_ok!(Content::issue_nft(
            Origin::signed(DEFAULT_CURATOR_ACCOUNT_ID),
            curator_actor,
            video_id,
            NftIssuanceParameters::<Test>::default(),
        ));

        increase_account_balance_helper(SECOND_MEMBER_ACCOUNT_ID, DEFAULT_NFT_PRICE);
        // Offer nft
        assert_ok!(Content::offer_nft(
            Origin::signed(DEFAULT_CURATOR_ACCOUNT_ID),
            video_id,
            curator_actor,
            SECOND_MEMBER_ID,
            Some(DEFAULT_NFT_PRICE),
        ));

        let issuance_pre = Balances::<Test>::total_issuance();
        // Make an attempt to accept incoming nft offer if sender is owner and reward account is not set
        let _ = Content::accept_incoming_offer(Origin::signed(SECOND_MEMBER_ACCOUNT_ID), video_id);

        // Failure checked
        assert_eq!(
            Balances::<Test>::total_issuance(),
            issuance_pre - DEFAULT_NFT_PRICE,
        );
    })
}

#[test]
fn accept_incoming_offer_insufficient_balance() {
    with_default_mock_builder(|| {
        // Run to block one to see emitted events
        run_to_block(1);

        let video_id = NextVideoId::<Test>::get();
        create_initial_storage_buckets_helper();
        increase_account_balance_helper(DEFAULT_MEMBER_ACCOUNT_ID, INITIAL_BALANCE);
        create_default_member_owned_channel_with_video();

        // Issue nft
        assert_ok!(Content::issue_nft(
            Origin::signed(DEFAULT_MEMBER_ACCOUNT_ID),
            ContentActor::Member(DEFAULT_MEMBER_ID),
            video_id,
            NftIssuanceParameters::<Test>::default(),
        ));

        // Offer nft
        assert_ok!(Content::offer_nft(
            Origin::signed(DEFAULT_MEMBER_ACCOUNT_ID),
            video_id,
            ContentActor::Member(DEFAULT_MEMBER_ID),
            SECOND_MEMBER_ID,
            Some(DEFAULT_NFT_PRICE),
        ));

        // Make an attempt to accept incoming nft offer if there is no incoming transfers
        let accept_incoming_offer_result =
            Content::accept_incoming_offer(Origin::signed(SECOND_MEMBER_ACCOUNT_ID), video_id);

        // Failure checked
        assert_err!(
            accept_incoming_offer_result,
            Error::<Test>::InsufficientBalance
        );
    })
}
