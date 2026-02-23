import { ApolloClient, InMemoryCache, HttpLink, gql } from '@apollo/client';
import { TORII_URL } from '../env';

// ── Apollo Client ──

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: `${TORII_URL}/graphql` }),
  cache: new InMemoryCache(),
});

// ── Tournament Queries ──

export const GET_TOURNAMENTS = gql`
  query GetTournaments($first: Int!) {
    tweetleDojoTournamentModels(
      order: { field: CREATED_AT, direction: DESC }
      first: $first
    ) {
      edges {
        node {
          tournament_id
          creator
          status
          max_players
          current_players
          solution_commitment
          start_time
          end_time
          created_at
        }
      }
    }
  }
`;

export const GET_TOURNAMENT_ENTRIES = gql`
  query GetTournamentEntries($tournamentId: String!) {
    tweetleDojoTournamentEntryModels(
      where: { tournament_id: $tournamentId }
      order: { field: COMPLETION_TIME, direction: ASC }
    ) {
      edges {
        node {
          tournament_id
          player
          attempts_used
          did_win
          completed
          completion_time
          has_joined
        }
      }
    }
  }
`;

export const GET_TOURNAMENT_ATTEMPTS = gql`
  query GetTournamentAttempts($tournamentId: String!, $player: String!) {
    tweetleDojoTournamentAttemptModels(
      where: { tournament_id: $tournamentId, player: $player }
      order: { field: ATTEMPT_NUMBER, direction: ASC }
    ) {
      edges {
        node {
          tournament_id
          player
          attempt_number
          guess_packed
          clue_packed
        }
      }
    }
  }
`;

// ── Types ──

export interface TournamentNode {
  tournament_id: string;
  creator: string;
  status: number;
  max_players: number;
  current_players: number;
  solution_commitment: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface TournamentEntryNode {
  tournament_id: string;
  player: string;
  attempts_used: number;
  did_win: boolean;
  completed: boolean;
  completion_time: string;
  has_joined: boolean;
}

export interface TournamentAttemptNode {
  tournament_id: string;
  player: string;
  attempt_number: number;
  guess_packed: string;
  clue_packed: number;
}

interface GetTournamentsResponse {
  tweetleDojoTournamentModels: {
    edges: Array<{ node: TournamentNode }>;
  };
}

interface GetTournamentAttemptsResponse {
  tweetleDojoTournamentAttemptModels: {
    edges: Array<{ node: TournamentAttemptNode }>;
  };
}

// ── Fetch helpers ──

export async function fetchTournaments(first = 20): Promise<TournamentNode[]> {
  const { data } = await apolloClient.query<GetTournamentsResponse>({
    query: GET_TOURNAMENTS,
    variables: { first },
    fetchPolicy: 'network-only',
  });
  return data?.tweetleDojoTournamentModels?.edges?.map((e) => e.node) ?? [];
}

export async function fetchTournamentAttempts(
  tournamentId: number,
  player: string,
): Promise<TournamentAttemptNode[]> {
  const { data } = await apolloClient.query<GetTournamentAttemptsResponse>({
    query: GET_TOURNAMENT_ATTEMPTS,
    variables: {
      tournamentId: '0x' + tournamentId.toString(16),
      player,
    },
    fetchPolicy: 'network-only',
  });
  return data?.tweetleDojoTournamentAttemptModels?.edges?.map((e) => e.node) ?? [];
}

export async function pollNewTournamentAttempt(
  tournamentId: number,
  player: string,
  afterAttempt: number,
): Promise<TournamentAttemptNode> {
  return poll(async () => {
    const attempts = await fetchTournamentAttempts(tournamentId, player);
    const latest = attempts[attempts.length - 1];
    if (latest && Number(latest.attempt_number) > afterAttempt) return latest;
    return null;
  });
}

// ── Polling helper ──

async function poll<T>(
  queryFn: () => Promise<T | null>,
  maxAttempts = 40,
  intervalMs = 2000,
): Promise<T> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await queryFn();
    if (result !== null) return result;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error('Torii polling timed out');
}
