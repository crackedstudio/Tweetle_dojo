use starknet::ContractAddress;

// ─── Tournament Status Constants ───
pub mod TournamentStatus {
    pub const OPEN: u8 = 0;        // Accepting players
    pub const ACTIVE: u8 = 1;      // In progress, guessing allowed
    pub const COMPLETED: u8 = 2;   // Ended, solution revealed
    pub const CANCELLED: u8 = 3;   // Cancelled, refunds available
}

// Tournament — one per competition
#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Tournament {
    #[key]
    pub tournament_id: u64,
    pub solution_commitment: felt252,   // poseidon(word_index, salt)
    pub entry_fee: u256,                // STRK entry cost per player
    pub prize_pool: u256,               // Total accumulated prize
    pub max_players: u16,
    pub current_players: u16,
    pub status: u8,                     // TournamentStatus
    pub start_time: u64,
    pub end_time: u64,
    pub created_at: u64,
    pub creator: ContractAddress,       // Game master
    pub solution_index: u32,            // Revealed after end (0 until then)
    pub solution_salt: felt252,         // Revealed after end (0 until then)
}

// Per-player entry in a tournament
#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct TournamentEntry {
    #[key]
    pub tournament_id: u64,
    #[key]
    pub player: ContractAddress,
    pub attempts_used: u8,
    pub did_win: bool,
    pub completed: bool,
    pub completion_time: u64,
    pub has_joined: bool,
}

// Per-attempt record — stores each guess and its ZK-verified clue
#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct TournamentAttempt {
    #[key]
    pub tournament_id: u64,
    #[key]
    pub player: ContractAddress,
    #[key]
    pub attempt_number: u8,
    pub guess_packed: felt252,          // 5 ASCII bytes packed into felt252
    pub clue_packed: u16,               // 5 ternary values packed (0=absent, 1=present, 2=correct)
}

// Final ranking — populated after tournament ends
#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct TournamentRanking {
    #[key]
    pub tournament_id: u64,
    #[key]
    pub rank: u16,
    pub player: ContractAddress,
    pub prize_amount: u256,
}
