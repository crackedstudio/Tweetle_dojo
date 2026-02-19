use starknet::ContractAddress;

// Singleton config — key is always 0
#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct GameConfig {
    #[key]
    pub id: u8,                         // Always 0 (singleton pattern)
    pub game_count: u64,                // Auto-incrementing daily game counter
    pub max_attempts: u8,               // Max guesses per player per day (default: 6)
}

// Tournament config singleton — key is always 0
#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct TournamentConfig {
    #[key]
    pub id: u8,                         // Always 0 (singleton pattern)
    pub tournament_count: u64,          // Auto-incrementing tournament counter
    pub min_players: u16,               // Minimum players to start (default: 2)
    pub max_attempts: u8,               // Max guesses per player (default: 6)
    pub platform_fee_bps: u16,          // Platform fee in basis points (e.g. 500 = 5%)
    pub game_master: ContractAddress,   // Who can create tournaments
    pub fee_recipient: ContractAddress,  // Where platform fees go
}
