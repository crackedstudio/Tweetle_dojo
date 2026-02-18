import { BigNumberish } from 'starknet';

// Base schema type (avoids @dojoengine/sdk dependency)
interface ISchemaType { [namespace: string]: Record<string, any> }

// Type definition for `tweetle_dojo::models::attempt::ClassicAttempt` struct
export interface ClassicAttempt {
	player: string;
	game_id: BigNumberish;
	attempt_number: BigNumberish;
	word: BigNumberish;
	hint_packed: BigNumberish;
}

// Type definition for `tweetle_dojo::models::attempt::DailyAttempt` struct
export interface DailyAttempt {
	player: string;
	game_id: BigNumberish;
	attempt_number: BigNumberish;
	word: BigNumberish;
	hint_packed: BigNumberish;
}

// Type definition for `tweetle_dojo::models::attempt::DailyAttemptCount` struct
export interface DailyAttemptCount {
	player: string;
	game_id: BigNumberish;
	count: BigNumberish;
	has_joined: boolean;
	has_finished: boolean;
}

// Type definition for `tweetle_dojo::models::daily_game::DailyGame` struct
export interface DailyGame {
	game_id: BigNumberish;
	word_index: BigNumberish;
	starts_at: BigNumberish;
	expires_at: BigNumberish;
	winners_count: BigNumberish;
	players_count: BigNumberish;
}

// Type definition for `tweetle_dojo::models::daily_game::DailyPlayer` struct
export interface DailyPlayer {
	game_id: BigNumberish;
	player_index: BigNumberish;
	player: string;
}

// Type definition for `tweetle_dojo::models::daily_game::DailyWinner` struct
export interface DailyWinner {
	game_id: BigNumberish;
	winner_index: BigNumberish;
	player: string;
}

// Type definition for `tweetle_dojo::models::game::ClassicGame` struct
export interface ClassicGame {
	player: string;
	game_id: BigNumberish;
	active_players: BigNumberish;
	starts_at: BigNumberish;
	expires_at: BigNumberish;
	word_index: BigNumberish;
	has_ended: boolean;
}

// Type definition for `tweetle_dojo::models::game::ClassicGameAttemptCount` struct
export interface ClassicGameAttemptCount {
	player: string;
	game_id: BigNumberish;
	count: BigNumberish;
}

// Type definition for `tweetle_dojo::models::game_stats::GameStats` struct
export interface GameStats {
	id: BigNumberish;
	player_count: BigNumberish;
	daily_games_count: BigNumberish;
	next_daily_update: BigNumberish;
	attempt_price: BigNumberish;
	daily_instructor: string;
	token_address: string;
}

// Type definition for `tweetle_dojo::models::player::Player` struct
export interface Player {
	address: string;
	username: BigNumberish;
	classic_game_count: BigNumberish;
	points: BigNumberish;
	is_registered: boolean;
	referrer: string;
	friends_count: BigNumberish;
}

// Type definition for `tweetle_dojo::models::player::PlayerFriend` struct
export interface PlayerFriend {
	referrer: string;
	friend_index: BigNumberish;
	friend_address: string;
}

// Type definition for `tweetle_dojo::models::player::PlayerUsername` struct
export interface PlayerUsername {
	username: BigNumberish;
	address: string;
}

// Type definition for `tweetle_dojo::systems::actions::actions::GameLost` struct
export interface GameLost {
	game_id: BigNumberish;
	player: string;
}

// Type definition for `tweetle_dojo::systems::actions::actions::GameStarted` struct
export interface GameStarted {
	game_id: BigNumberish;
	player: string;
}

// Type definition for `tweetle_dojo::systems::actions::actions::GameWon` struct
export interface GameWon {
	game_id: BigNumberish;
	player: string;
	attempts: BigNumberish;
	points_earned: BigNumberish;
}

// Type definition for `tweetle_dojo::systems::actions::actions::GuessSubmitted` struct
export interface GuessSubmitted {
	game_id: BigNumberish;
	player: string;
	attempt_number: BigNumberish;
	word: BigNumberish;
	hint_packed: BigNumberish;
}

// Type definition for `tweetle_dojo::systems::daily_game::daily_game::DailyGameCreated` struct
export interface DailyGameCreated {
	game_id: BigNumberish;
	starts_at: BigNumberish;
	expires_at: BigNumberish;
}

// Type definition for `tweetle_dojo::systems::daily_game::daily_game::DailyGameLost` struct
export interface DailyGameLost {
	game_id: BigNumberish;
	player: string;
}

// Type definition for `tweetle_dojo::systems::daily_game::daily_game::DailyGameWon` struct
export interface DailyGameWon {
	game_id: BigNumberish;
	player: string;
	attempts: BigNumberish;
	points_earned: BigNumberish;
	winner_index: BigNumberish;
}

// Type definition for `tweetle_dojo::systems::daily_game::daily_game::DailyGuessSubmitted` struct
export interface DailyGuessSubmitted {
	game_id: BigNumberish;
	player: string;
	attempt_number: BigNumberish;
	word: BigNumberish;
	hint_packed: BigNumberish;
}

// Type definition for `tweetle_dojo::systems::daily_game::daily_game::PlayerJoinedDaily` struct
export interface PlayerJoinedDaily {
	game_id: BigNumberish;
	player: string;
	player_index: BigNumberish;
}

export interface SchemaType extends ISchemaType {
	tweetle_dojo: {
		ClassicAttempt: ClassicAttempt,
		DailyAttempt: DailyAttempt,
		DailyAttemptCount: DailyAttemptCount,
		DailyGame: DailyGame,
		DailyPlayer: DailyPlayer,
		DailyWinner: DailyWinner,
		ClassicGame: ClassicGame,
		ClassicGameAttemptCount: ClassicGameAttemptCount,
		GameStats: GameStats,
		Player: Player,
		PlayerFriend: PlayerFriend,
		PlayerUsername: PlayerUsername,
		GameLost: GameLost,
		GameStarted: GameStarted,
		GameWon: GameWon,
		GuessSubmitted: GuessSubmitted,
		DailyGameCreated: DailyGameCreated,
		DailyGameLost: DailyGameLost,
		DailyGameWon: DailyGameWon,
		DailyGuessSubmitted: DailyGuessSubmitted,
		PlayerJoinedDaily: PlayerJoinedDaily,
	},
}
export const schema: SchemaType = {
	tweetle_dojo: {
		ClassicAttempt: {
			player: "",
			game_id: 0,
			attempt_number: 0,
			word: 0,
			hint_packed: 0,
		},
		DailyAttempt: {
			player: "",
			game_id: 0,
			attempt_number: 0,
			word: 0,
			hint_packed: 0,
		},
		DailyAttemptCount: {
			player: "",
			game_id: 0,
			count: 0,
			has_joined: false,
			has_finished: false,
		},
		DailyGame: {
			game_id: 0,
			word_index: 0,
			starts_at: 0,
			expires_at: 0,
			winners_count: 0,
			players_count: 0,
		},
		DailyPlayer: {
			game_id: 0,
			player_index: 0,
			player: "",
		},
		DailyWinner: {
			game_id: 0,
			winner_index: 0,
			player: "",
		},
		ClassicGame: {
			player: "",
			game_id: 0,
		active_players: 0,
			starts_at: 0,
			expires_at: 0,
			word_index: 0,
			has_ended: false,
		},
		ClassicGameAttemptCount: {
			player: "",
			game_id: 0,
			count: 0,
		},
		GameStats: {
			id: 0,
			player_count: 0,
			daily_games_count: 0,
			next_daily_update: 0,
		attempt_price: 0,
			daily_instructor: "",
			token_address: "",
		},
		Player: {
			address: "",
			username: 0,
			classic_game_count: 0,
			points: 0,
			is_registered: false,
			referrer: "",
		friends_count: 0,
		},
		PlayerFriend: {
			referrer: "",
		friend_index: 0,
			friend_address: "",
		},
		PlayerUsername: {
			username: 0,
			address: "",
		},
		GameLost: {
			game_id: 0,
			player: "",
		},
		GameStarted: {
			game_id: 0,
			player: "",
		},
		GameWon: {
			game_id: 0,
			player: "",
			attempts: 0,
			points_earned: 0,
		},
		GuessSubmitted: {
			game_id: 0,
			player: "",
			attempt_number: 0,
			word: 0,
			hint_packed: 0,
		},
		DailyGameCreated: {
			game_id: 0,
			starts_at: 0,
			expires_at: 0,
		},
		DailyGameLost: {
			game_id: 0,
			player: "",
		},
		DailyGameWon: {
			game_id: 0,
			player: "",
			attempts: 0,
			points_earned: 0,
			winner_index: 0,
		},
		DailyGuessSubmitted: {
			game_id: 0,
			player: "",
			attempt_number: 0,
			word: 0,
			hint_packed: 0,
		},
		PlayerJoinedDaily: {
			game_id: 0,
			player: "",
			player_index: 0,
		},
	},
};
export enum ModelsMapping {
	ClassicAttempt = 'tweetle_dojo-ClassicAttempt',
	DailyAttempt = 'tweetle_dojo-DailyAttempt',
	DailyAttemptCount = 'tweetle_dojo-DailyAttemptCount',
	DailyGame = 'tweetle_dojo-DailyGame',
	DailyPlayer = 'tweetle_dojo-DailyPlayer',
	DailyWinner = 'tweetle_dojo-DailyWinner',
	ClassicGame = 'tweetle_dojo-ClassicGame',
	ClassicGameAttemptCount = 'tweetle_dojo-ClassicGameAttemptCount',
	GameStats = 'tweetle_dojo-GameStats',
	Player = 'tweetle_dojo-Player',
	PlayerFriend = 'tweetle_dojo-PlayerFriend',
	PlayerUsername = 'tweetle_dojo-PlayerUsername',
	GameLost = 'tweetle_dojo-GameLost',
	GameStarted = 'tweetle_dojo-GameStarted',
	GameWon = 'tweetle_dojo-GameWon',
	GuessSubmitted = 'tweetle_dojo-GuessSubmitted',
	DailyGameCreated = 'tweetle_dojo-DailyGameCreated',
	DailyGameLost = 'tweetle_dojo-DailyGameLost',
	DailyGameWon = 'tweetle_dojo-DailyGameWon',
	DailyGuessSubmitted = 'tweetle_dojo-DailyGuessSubmitted',
	PlayerJoinedDaily = 'tweetle_dojo-PlayerJoinedDaily',
}