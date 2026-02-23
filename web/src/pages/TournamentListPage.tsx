import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournamentActions } from '../hooks/useTournamentActions';
import { useWallet } from '../providers/WalletProvider';
import type { TournamentNode } from '../dojo/apollo';
import { TournamentCard } from '../components/TournamentCard';

export function TournamentListPage() {
  const navigate = useNavigate();
  const { account } = useWallet();
  const { listTournaments, joinTournament } = useTournamentActions();
  const [tournaments, setTournaments] = useState<TournamentNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTournaments = useCallback(async () => {
    try {
      setError(null);
      const list = await listTournaments();
      setTournaments(list);
    } catch (err: any) {
      setError(err.message);
    }
  }, [listTournaments]);

  useEffect(() => {
    loadTournaments().finally(() => setLoading(false));
  }, [loadTournaments]);

  const handleJoin = useCallback(
    async (tournamentId: string) => {
      if (!account) {
        setError('Please connect your wallet first');
        return;
      }
      setJoining(tournamentId);
      try {
        await joinTournament(Number(tournamentId));
        await loadTournaments();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setJoining(null);
      }
    },
    [account, joinTournament, loadTournaments],
  );

  const handlePlay = useCallback(
    (tournament: TournamentNode) => {
      navigate(`/tournament/${tournament.tournament_id}`);
    },
    [navigate],
  );

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl text-text-primary">Tournaments</h1>
        <button
          onClick={() => loadTournaments()}
          className="px-3 py-1.5 text-sm rounded-lg border border-tile-border text-text-secondary hover:text-text-primary hover:border-brand transition-colors cursor-pointer bg-transparent"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-error/20 text-error text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-text-secondary text-sm">Loading tournaments...</p>
        </div>
      ) : tournaments.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <span className="text-5xl mb-5">🏆</span>
          <h2 className="font-heading text-xl text-text-primary mb-2">No Tournaments Yet</h2>
          <p className="text-text-secondary text-sm max-w-xs">
            Tournaments will appear here once they are created by the game master.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tournaments.map((t) => (
            <TournamentCard
              key={t.tournament_id}
              tournament={t}
              onJoin={() => handleJoin(t.tournament_id)}
              onPlay={() => handlePlay(t)}
              isJoining={joining === t.tournament_id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
