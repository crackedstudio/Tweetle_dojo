import type { TournamentNode } from '../dojo/apollo';
import { StatusBadge } from './StatusBadge';

function truncateAddress(addr: string): string {
  if (!addr || addr.length < 12) return addr || '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

interface TournamentCardProps {
  tournament: TournamentNode;
  onJoin: () => void;
  onPlay: () => void;
  isJoining?: boolean;
}

export function TournamentCard({ tournament, onJoin, onPlay, isJoining }: TournamentCardProps) {
  const status = Number(tournament.status);
  const isJoinable = status === 0 || status === 1;
  const isPlayable = status === 1;

  return (
    <div className="bg-bg-surface rounded-xl p-4 border border-tile-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading text-lg text-text-primary">
          Tournament #{tournament.tournament_id}
        </h3>
        <StatusBadge status={status} />
      </div>

      <div className="flex gap-3 mb-3">
        <div className="flex-1 bg-bg-primary rounded-lg p-2 text-center">
          <div className="text-xs text-text-muted">Players</div>
          <div className="text-sm font-semibold text-text-primary">
            {tournament.current_players}/{tournament.max_players}
          </div>
        </div>
        <div className="flex-1 bg-bg-primary rounded-lg p-2 text-center">
          <div className="text-xs text-text-muted">Attempts</div>
          <div className="text-sm font-semibold text-text-primary">6</div>
        </div>
        <div className="flex-1 bg-bg-primary rounded-lg p-2 text-center">
          <div className="text-xs text-text-muted">Creator</div>
          <div className="text-sm font-semibold text-text-primary">
            {truncateAddress(tournament.creator)}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        {isJoinable && (
          <button
            onClick={onJoin}
            disabled={isJoining}
            className="flex-1 py-2.5 rounded-lg border border-brand text-brand font-semibold text-sm hover:bg-brand/10 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isJoining ? 'Joining...' : 'JOIN'}
          </button>
        )}
        {isPlayable && (
          <button
            onClick={onPlay}
            className="flex-1 py-2.5 rounded-lg bg-brand text-secondary font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            PLAY
          </button>
        )}
      </div>
    </div>
  );
}
