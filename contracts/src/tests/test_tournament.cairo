#[cfg(test)]
mod tests {
    use dojo_cairo_test::WorldStorageTestTrait;
    use dojo::model::ModelStorage;
    use dojo::world::WorldStorageTrait;
    use dojo_cairo_test::{
        spawn_test_world, NamespaceDef, TestResource, ContractDefTrait, ContractDef,
    };
    use starknet::ContractAddress;

    use tweetle_dojo::models::tournament::{
        Tournament, TournamentEntry, TournamentAttempt, TournamentRanking, TournamentStatus,
        m_Tournament, m_TournamentEntry, m_TournamentAttempt, m_TournamentRanking,
    };
    use tweetle_dojo::models::config::{TournamentConfig, m_TournamentConfig};
    use tweetle_dojo::systems::tournament_manager::{
        tournament_manager, ITournamentManagerDispatcher, ITournamentManagerDispatcherTrait,
    };

    // All correct clue: 2*81 + 2*27 + 2*9 + 2*3 + 2 = 242
    const ALL_CORRECT_CLUE: u16 = 242;

    const GAME_MASTER: felt252 = 0x1111;
    const FEE_RECIPIENT: felt252 = 0x9999;
    const PLAYER_1: felt252 = 0x2222;
    const PLAYER_2: felt252 = 0x3333;
    const PLAYER_3: felt252 = 0x4444;

    fn namespace_def() -> NamespaceDef {
        NamespaceDef {
            namespace: "tweetle_revamp",
            resources: [
                TestResource::Model(m_Tournament::TEST_CLASS_HASH),
                TestResource::Model(m_TournamentEntry::TEST_CLASS_HASH),
                TestResource::Model(m_TournamentAttempt::TEST_CLASS_HASH),
                TestResource::Model(m_TournamentRanking::TEST_CLASS_HASH),
                TestResource::Model(m_TournamentConfig::TEST_CLASS_HASH),
                TestResource::Contract(tournament_manager::TEST_CLASS_HASH),
                TestResource::Event(tournament_manager::e_TournamentCreated::TEST_CLASS_HASH),
                TestResource::Event(tournament_manager::e_TournamentJoined::TEST_CLASS_HASH),
                TestResource::Event(tournament_manager::e_TournamentActivated::TEST_CLASS_HASH),
                TestResource::Event(tournament_manager::e_GuessVerified::TEST_CLASS_HASH),
                TestResource::Event(tournament_manager::e_TournamentWon::TEST_CLASS_HASH),
                TestResource::Event(tournament_manager::e_TournamentCompleted::TEST_CLASS_HASH),
                TestResource::Event(tournament_manager::e_PrizeDistributed::TEST_CLASS_HASH),
                TestResource::Event(tournament_manager::e_TournamentCancelled::TEST_CLASS_HASH),
            ].span(),
        }
    }

    fn contract_defs() -> Span<ContractDef> {
        [
            ContractDefTrait::new(@"tweetle_revamp", @"tournament_manager")
                .with_writer_of([dojo::utils::bytearray_hash(@"tweetle_revamp")].span()),
        ].span()
    }

    fn setup() -> (dojo::world::WorldStorage, ITournamentManagerDispatcher) {
        let game_master: ContractAddress = GAME_MASTER.try_into().unwrap();

        let ndef = namespace_def();
        let mut world = spawn_test_world(
            dojo::world::world::TEST_CLASS_HASH, [ndef].span(),
        );
        world.sync_perms_and_inits(contract_defs());

        starknet::testing::set_contract_address(game_master);
        starknet::testing::set_account_contract_address(game_master);

        let (addr, _) = world.dns(@"tournament_manager").unwrap();
        let dispatcher = ITournamentManagerDispatcher { contract_address: addr };

        let fee_recipient: ContractAddress = FEE_RECIPIENT.try_into().unwrap();
        dispatcher.initialize(game_master, fee_recipient, 2, 500); // min 2 players, 5% fee

        (world, dispatcher)
    }

    /// Helper: create a tournament with default params, returns tournament_id
    fn create_default_tournament(dispatcher: ITournamentManagerDispatcher) -> u64 {
        starknet::testing::set_block_timestamp(1000);
        dispatcher.create_tournament(
            0xABCDEF,   // commitment
            100,        // entry_fee
            10,         // max_players
            2000,       // start_time
            5000,       // end_time
        )
    }

    /// Helper: switch caller to a player address
    fn as_player(player_felt: felt252) {
        let player: ContractAddress = player_felt.try_into().unwrap();
        starknet::testing::set_contract_address(player);
        starknet::testing::set_account_contract_address(player);
    }

    /// Helper: switch caller back to game master
    fn as_game_master() {
        let gm: ContractAddress = GAME_MASTER.try_into().unwrap();
        starknet::testing::set_contract_address(gm);
        starknet::testing::set_account_contract_address(gm);
    }

    // ─── Initialization Tests ───

    #[test]
    fn test_initialize_config() {
        let (world, _) = setup();
        let config: TournamentConfig = world.read_model(0_u8);
        assert(config.max_attempts == 6, 'max_attempts should be 6');
        assert(config.tournament_count == 0, 'count should be 0');
        assert(config.min_players == 2, 'min_players should be 2');
        assert(config.platform_fee_bps == 500, 'fee_bps should be 500');
    }

    #[test]
    #[should_panic(expected: ('Already initialized', 'ENTRYPOINT_FAILED'))]
    fn test_double_initialize() {
        let (_, dispatcher) = setup();
        let gm: ContractAddress = GAME_MASTER.try_into().unwrap();
        let fr: ContractAddress = FEE_RECIPIENT.try_into().unwrap();
        dispatcher.initialize(gm, fr, 2, 500);
    }

    // ─── Tournament Creation Tests ───

    #[test]
    fn test_create_tournament() {
        let (world, dispatcher) = setup();
        let tid = create_default_tournament(dispatcher);

        assert(tid == 1, 'First tournament should be 1');

        let t: Tournament = world.read_model(tid);
        assert(t.solution_commitment == 0xABCDEF, 'Commitment mismatch');
        assert(t.entry_fee == 100, 'Entry fee mismatch');
        assert(t.max_players == 10, 'Max players mismatch');
        assert(t.current_players == 0, 'Should have 0 players');
        assert(t.status == TournamentStatus::OPEN, 'Should be OPEN');
        assert(t.start_time == 2000, 'Start time mismatch');
        assert(t.end_time == 5000, 'End time mismatch');
    }

    #[test]
    #[should_panic(expected: ('Not game master', 'ENTRYPOINT_FAILED'))]
    fn test_create_not_game_master() {
        let (_, dispatcher) = setup();
        as_player(PLAYER_1);
        dispatcher.create_tournament(0xABC, 100, 10, 2000, 5000);
    }

    #[test]
    #[should_panic(expected: ('Empty commitment', 'ENTRYPOINT_FAILED'))]
    fn test_create_empty_commitment() {
        let (_, dispatcher) = setup();
        dispatcher.create_tournament(0, 100, 10, 2000, 5000);
    }

    // ─── Join Tournament Tests ───

    #[test]
    fn test_join_tournament() {
        let (world, dispatcher) = setup();
        let tid = create_default_tournament(dispatcher);

        as_player(PLAYER_1);
        dispatcher.join_tournament(tid);

        let player_addr: ContractAddress = PLAYER_1.try_into().unwrap();
        let entry: TournamentEntry = world.read_model((tid, player_addr));
        assert(entry.has_joined, 'Should have joined');
        assert(entry.attempts_used == 0, 'No attempts yet');

        let t: Tournament = world.read_model(tid);
        assert(t.current_players == 1, 'Should have 1 player');
        assert(t.prize_pool == 100, 'Prize pool should be 100');
    }

    #[test]
    #[should_panic(expected: ('Already joined', 'ENTRYPOINT_FAILED'))]
    fn test_double_join() {
        let (_, dispatcher) = setup();
        let tid = create_default_tournament(dispatcher);

        as_player(PLAYER_1);
        dispatcher.join_tournament(tid);
        dispatcher.join_tournament(tid); // should panic
    }

    #[test]
    #[should_panic(expected: ('Not open', 'ENTRYPOINT_FAILED'))]
    fn test_join_cancelled_tournament() {
        let (_, dispatcher) = setup();
        let tid = create_default_tournament(dispatcher);

        as_game_master();
        dispatcher.cancel_tournament(tid);

        as_player(PLAYER_1);
        dispatcher.join_tournament(tid); // should panic
    }

    // ─── Activation Tests ───

    #[test]
    fn test_activate_tournament() {
        let (world, dispatcher) = setup();
        let tid = create_default_tournament(dispatcher);

        // Two players join (meets min_players = 2)
        as_player(PLAYER_1);
        dispatcher.join_tournament(tid);
        as_player(PLAYER_2);
        dispatcher.join_tournament(tid);

        // Activate after start_time
        as_game_master();
        starknet::testing::set_block_timestamp(2000);
        dispatcher.activate_tournament(tid);

        let t: Tournament = world.read_model(tid);
        assert(t.status == TournamentStatus::ACTIVE, 'Should be ACTIVE');
    }

    #[test]
    #[should_panic(expected: ('Not enough players', 'ENTRYPOINT_FAILED'))]
    fn test_activate_not_enough_players() {
        let (_, dispatcher) = setup();
        let tid = create_default_tournament(dispatcher);

        // Only 1 player (min is 2)
        as_player(PLAYER_1);
        dispatcher.join_tournament(tid);

        as_game_master();
        starknet::testing::set_block_timestamp(2000);
        dispatcher.activate_tournament(tid); // should panic
    }

    #[test]
    #[should_panic(expected: ('Too early', 'ENTRYPOINT_FAILED'))]
    fn test_activate_too_early() {
        let (_, dispatcher) = setup();
        let tid = create_default_tournament(dispatcher);

        as_player(PLAYER_1);
        dispatcher.join_tournament(tid);
        as_player(PLAYER_2);
        dispatcher.join_tournament(tid);

        as_game_master();
        starknet::testing::set_block_timestamp(1500); // before start_time=2000
        dispatcher.activate_tournament(tid); // should panic
    }

    // ─── Guess Submission Tests ───

    /// Helper: setup an active tournament with 2 players joined
    fn setup_active_tournament() -> (dojo::world::WorldStorage, ITournamentManagerDispatcher, u64) {
        let (world, dispatcher) = setup();
        let tid = create_default_tournament(dispatcher);

        as_player(PLAYER_1);
        dispatcher.join_tournament(tid);
        as_player(PLAYER_2);
        dispatcher.join_tournament(tid);

        as_game_master();
        starknet::testing::set_block_timestamp(2000);
        dispatcher.activate_tournament(tid);

        (world, dispatcher, tid)
    }

    #[test]
    fn test_submit_guess() {
        let (world, dispatcher, tid) = setup_active_tournament();

        as_player(PLAYER_1);
        starknet::testing::set_block_timestamp(3000);
        dispatcher.submit_guess(tid, 0x48454C4C4F, 0); // all absent

        let player_addr: ContractAddress = PLAYER_1.try_into().unwrap();
        let entry: TournamentEntry = world.read_model((tid, player_addr));
        assert(entry.attempts_used == 1, 'Should have 1 attempt');
        assert(!entry.completed, 'Should not be completed');

        let attempt: TournamentAttempt = world.read_model((tid, player_addr, 1_u8));
        assert(attempt.guess_packed == 0x48454C4C4F, 'Guess mismatch');
        assert(attempt.clue_packed == 0, 'Clue mismatch');
    }

    #[test]
    #[should_panic(expected: ('Not joined', 'ENTRYPOINT_FAILED'))]
    fn test_submit_not_joined() {
        let (_, dispatcher, tid) = setup_active_tournament();

        as_player(PLAYER_3); // never joined
        starknet::testing::set_block_timestamp(3000);
        dispatcher.submit_guess(tid, 0x01, 0); // should panic
    }

    #[test]
    #[should_panic(expected: ('Not active', 'ENTRYPOINT_FAILED'))]
    fn test_submit_to_open_tournament() {
        let (_, dispatcher) = setup();
        let tid = create_default_tournament(dispatcher);

        as_player(PLAYER_1);
        dispatcher.join_tournament(tid);
        dispatcher.submit_guess(tid, 0x01, 0); // should panic — still OPEN
    }

    #[test]
    fn test_win_condition() {
        let (world, dispatcher, tid) = setup_active_tournament();

        as_player(PLAYER_1);
        starknet::testing::set_block_timestamp(3000);

        // Wrong guess first
        dispatcher.submit_guess(tid, 0x01, 0);
        // Win on second guess
        dispatcher.submit_guess(tid, 0x02, ALL_CORRECT_CLUE);

        let player_addr: ContractAddress = PLAYER_1.try_into().unwrap();
        let entry: TournamentEntry = world.read_model((tid, player_addr));
        assert(entry.attempts_used == 2, 'Should have 2 attempts');
        assert(entry.did_win, 'Should have won');
        assert(entry.completed, 'Should be completed');
        assert(entry.completion_time == 3000, 'Time mismatch');
    }

    #[test]
    fn test_exhaust_attempts() {
        let (world, dispatcher, tid) = setup_active_tournament();

        as_player(PLAYER_1);
        starknet::testing::set_block_timestamp(3000);

        dispatcher.submit_guess(tid, 0x01, 0);
        dispatcher.submit_guess(tid, 0x02, 0);
        dispatcher.submit_guess(tid, 0x03, 0);
        dispatcher.submit_guess(tid, 0x04, 0);
        dispatcher.submit_guess(tid, 0x05, 0);
        dispatcher.submit_guess(tid, 0x06, 0);

        let player_addr: ContractAddress = PLAYER_1.try_into().unwrap();
        let entry: TournamentEntry = world.read_model((tid, player_addr));
        assert(entry.attempts_used == 6, 'Should have 6 attempts');
        assert(entry.completed, 'Should be completed');
        assert(!entry.did_win, 'Should not have won');
    }

    #[test]
    #[should_panic(expected: ('Already completed', 'ENTRYPOINT_FAILED'))]
    fn test_submit_after_win() {
        let (_, dispatcher, tid) = setup_active_tournament();

        as_player(PLAYER_1);
        starknet::testing::set_block_timestamp(3000);
        dispatcher.submit_guess(tid, 0x01, ALL_CORRECT_CLUE);
        dispatcher.submit_guess(tid, 0x02, 0); // should panic
    }

    #[test]
    #[should_panic(expected: ('Tournament ended', 'ENTRYPOINT_FAILED'))]
    fn test_submit_after_end_time() {
        let (_, dispatcher, tid) = setup_active_tournament();

        as_player(PLAYER_1);
        starknet::testing::set_block_timestamp(6000); // after end_time=5000
        dispatcher.submit_guess(tid, 0x01, 0); // should panic
    }

    // ─── End Tournament Tests ───

    #[test]
    fn test_end_tournament() {
        let (world, dispatcher, tid) = setup_active_tournament();

        as_game_master();
        starknet::testing::set_block_timestamp(5000);
        dispatcher.end_tournament(tid, 42, 0x7B2);

        let t: Tournament = world.read_model(tid);
        assert(t.status == TournamentStatus::COMPLETED, 'Should be COMPLETED');
        assert(t.solution_index == 42, 'Index mismatch');
        assert(t.solution_salt == 0x7B2, 'Salt mismatch');
    }

    #[test]
    #[should_panic(expected: ('Not game master', 'ENTRYPOINT_FAILED'))]
    fn test_end_not_game_master() {
        let (_, dispatcher, tid) = setup_active_tournament();

        as_player(PLAYER_1);
        dispatcher.end_tournament(tid, 42, 0x7B2); // should panic
    }

    // ─── Prize Distribution Tests ───

    #[test]
    fn test_distribute_prizes() {
        let (world, dispatcher, tid) = setup_active_tournament();

        // End tournament first
        as_game_master();
        starknet::testing::set_block_timestamp(5000);
        dispatcher.end_tournament(tid, 42, 0x7B2);

        // Distribute to 2 players
        let p1: ContractAddress = PLAYER_1.try_into().unwrap();
        let p2: ContractAddress = PLAYER_2.try_into().unwrap();
        dispatcher.distribute_prizes(tid, array![p1, p2]);

        let rank1: TournamentRanking = world.read_model((tid, 1_u16));
        assert(rank1.player == p1, 'Rank 1 player mismatch');
        assert(rank1.prize_amount > 0, 'Rank 1 should have prize');

        let rank2: TournamentRanking = world.read_model((tid, 2_u16));
        assert(rank2.player == p2, 'Rank 2 player mismatch');
        assert(rank2.prize_amount > 0, 'Rank 2 should have prize');

        // Rank 1 should get more than rank 2
        assert(rank1.prize_amount > rank2.prize_amount, '1st > 2nd prize');
    }

    #[test]
    #[should_panic(expected: ('Not completed', 'ENTRYPOINT_FAILED'))]
    fn test_distribute_before_completed() {
        let (_, dispatcher, tid) = setup_active_tournament();

        as_game_master();
        let p1: ContractAddress = PLAYER_1.try_into().unwrap();
        dispatcher.distribute_prizes(tid, array![p1]); // should panic — still ACTIVE
    }

    // ─── Cancel Tournament Tests ───

    #[test]
    fn test_cancel_tournament() {
        let (world, dispatcher) = setup();
        let tid = create_default_tournament(dispatcher);

        dispatcher.cancel_tournament(tid);

        let t: Tournament = world.read_model(tid);
        assert(t.status == TournamentStatus::CANCELLED, 'Should be CANCELLED');
    }

    #[test]
    #[should_panic(expected: ('Cannot cancel', 'ENTRYPOINT_FAILED'))]
    fn test_cancel_completed_tournament() {
        let (_, dispatcher, tid) = setup_active_tournament();

        as_game_master();
        starknet::testing::set_block_timestamp(5000);
        dispatcher.end_tournament(tid, 42, 0x7B2);
        dispatcher.cancel_tournament(tid); // should panic — already COMPLETED
    }

    // ─── Multi-Player Game Flow ───

    #[test]
    fn test_full_tournament_flow() {
        let (world, dispatcher, tid) = setup_active_tournament();

        // Player 1 wins in 2 attempts
        as_player(PLAYER_1);
        starknet::testing::set_block_timestamp(3000);
        dispatcher.submit_guess(tid, 0x01, 0);
        dispatcher.submit_guess(tid, 0x02, ALL_CORRECT_CLUE);

        // Player 2 wins in 4 attempts
        as_player(PLAYER_2);
        starknet::testing::set_block_timestamp(3500);
        dispatcher.submit_guess(tid, 0x01, 0);
        dispatcher.submit_guess(tid, 0x02, 0);
        dispatcher.submit_guess(tid, 0x03, 0);
        dispatcher.submit_guess(tid, 0x04, ALL_CORRECT_CLUE);

        // End tournament
        as_game_master();
        starknet::testing::set_block_timestamp(5000);
        dispatcher.end_tournament(tid, 42, 0x7B2);

        // Distribute prizes — Player 1 is rank 1, Player 2 is rank 2
        let p1: ContractAddress = PLAYER_1.try_into().unwrap();
        let p2: ContractAddress = PLAYER_2.try_into().unwrap();
        dispatcher.distribute_prizes(tid, array![p1, p2]);

        // Verify rankings
        let rank1: TournamentRanking = world.read_model((tid, 1_u16));
        let rank2: TournamentRanking = world.read_model((tid, 2_u16));

        assert(rank1.player == p1, 'P1 should be rank 1');
        assert(rank2.player == p2, 'P2 should be rank 2');
        assert(rank1.prize_amount > rank2.prize_amount, '1st > 2nd');

        // Verify tournament state
        let t: Tournament = world.read_model(tid);
        assert(t.status == TournamentStatus::COMPLETED, 'Should be COMPLETED');
        assert(t.prize_pool == 200, 'Pool should be 200');
    }
}
