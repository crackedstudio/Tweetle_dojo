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
    <div className="card-bubbly p-6 border-white/5 relative group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-xl text-text-primary tracking-wide group-hover:text-accent transition-colors">
          Tournament #{tournament.tournament_id}
        </h3>
        <StatusBadge status={status} />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5 shadow-inner">
          <div className="text-[10px] text-text-secondary uppercase tracking-widest mb-1 font-bold">Players</div>
          <div className="text-base font-heading text-text-primary">
            {tournament.current_players}/{tournament.max_players}
          </div>
        </div>
        <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5 shadow-inner">
          <div className="text-[10px] text-text-secondary uppercase tracking-widest mb-1 font-bold">Trys</div>
          <div className="text-base font-heading text-text-primary">6</div>
        </div>
        <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5 shadow-inner">
          <div className="text-[10px] text-text-secondary uppercase tracking-widest mb-1 font-bold">Host</div>
          <div className="text-xs font-heading text-brand opacity-80">
            {truncateAddress(tournament.creator)}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        {isJoinable && (
          <button
            onClick={onJoin}
            disabled={isJoining}
            className="flex-1 py-4 rounded-xl bg-brand text-secondary border-puffy-blue-border font-heading tracking-[0.2em] text-xs button-bubbly shadow-lg disabled:opacity-50"
          >
            {isJoining ? '...' : 'JOIN'}
          </button>
        )}
        {isPlayable && (
          <button
            onClick={onPlay}
            className="flex-1 py-4 rounded-xl bg-accent text-secondary border-puffy-yellow-border font-heading tracking-[0.2em] text-xs button-bubbly shadow-lg"
          >
            PLAY
          </button>
        )}
      </div>
    </div>
  );
}
