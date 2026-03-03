import { useNavigate } from 'react-router-dom';
import { useWallet } from '../providers/WalletProvider';
import { Sparkles, Target, CalendarDays, Trophy } from 'lucide-react';

const PREVIEW_TILES = [
  { letter: 'T', state: 'correct' },
  { letter: 'W', state: 'present' },
  { letter: 'E', state: 'absent' },
  { letter: 'E', state: 'correct' },
  { letter: 'T', state: 'absent' },
] as const;

const TILE_COLORS: Record<string, string> = {
  correct: 'bg-tile-correct',
  present: 'bg-tile-present',
  absent: 'bg-tile-absent',
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { account, username, address } = useWallet();

  const displayName = username || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '');

  return (
    <div className="max-w-6xl mx-auto w-full px-6 py-16 flex flex-col lg:flex-row gap-16 items-start justify-center">
      {/* Left Column: Mascot & Brand */}
      <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-end justify-center sticky top-28">
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-brand/40 blur-[120px] rounded-full scale-150 animate-pulse" />
          <img 
            src="/mascot.png" 
            alt="Tweetle Mascot" 
            className="w-72 h-72 lg:w-96 lg:h-96 relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-bounce-slow pointer-events-none select-none transition-transform hover:scale-105 duration-700"
          />
        </div>
        <div className="text-center lg:text-right">
          <img src="/tweetle-name.png" alt="Tweetle" className="h-28 lg:h-40 object-contain ml-30 mb-6 drop-shadow-[0_0_30px_rgba(58,176,255,0.5)] scale-250" />
          <p className="text-accent text-sm font-heading tracking-[0.4em] uppercase opacity-90 mb-8 px-5 py-2 rounded-full border border-white/10 inline-block lg:block bg-secondary/40 backdrop-blur-md shadow-2xl">
            GUESS THE WORD • PROVE YOUR SKILL
          </p>
          
          {account && (
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-[2rem] border-2 border-white/5 bg-secondary/60 backdrop-blur-xl shadow-2xl button-bubbly border-b-6 border-r-4 border-puffy-yellow-border hover:border-puffy-yellow transition-all pointer-events-none">
              <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shadow-lg border-b-2 border-puffy-yellow-border">
                <span className="text-secondary text-sm font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-text-primary text-base font-heading tracking-wider drop-shadow-md">{displayName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Game Cards */}
      <div className="w-full lg:w-1/2 flex flex-col gap-8">
        {/* Daily Challenge Card */}
        <div className="card-bubbly p-8 overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand via-accent to-brand shadow-[0_0_20px_rgba(255,217,61,0.4)] opacity-80" />
          <h2 className="font-heading text-2xl text-text-primary mb-2 uppercase tracking-wide flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-accent animate-pulse" /> Daily Challenge
          </h2>
          <p className="text-text-secondary text-xs mb-8 uppercase tracking-widest font-semibold opacity-80">
            Solve today's puzzle for <span className="text-accent font-display text-lg drop-shadow-[0_0_12px_rgba(255,217,61,0.5)]">50 POINTS</span>
          </p>

          <div className="flex justify-center gap-4 mb-10">
            {PREVIEW_TILES.map((tile, i) => (
              <div
                key={i}
                className={`
                  w-14 h-14 lg:w-16 lg:h-16 rounded-[1.25rem] flex items-center justify-center 
                  border-b-6 border-r-2 shadow-2xl transition-all 
                  hover:scale-110 hover:-rotate-3 cursor-default 
                  ${TILE_COLORS[tile.state]} border-black/20
                `}
              >
                <span className="font-display text-2xl lg:text-3xl text-white drop-shadow-md uppercase">
                  {tile.letter}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/daily')}
            className="w-full py-5 rounded-2xl bg-accent text-secondary border-puffy-yellow-border font-heading tracking-[0.25em] text-base button-bubbly shadow-2xl active:brightness-90"
          >
            PLAY NOW
          </button>
        </div>

        {/* Game Modes Grid */}
        <div className="grid grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/classic')}
            className="card-bubbly p-8 text-center cursor-pointer group active:scale-95 shadow-2xl"
          >
            <Target className="w-12 h-12 mx-auto mb-4 text-brand group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]" />
            <span className="font-heading text-xl text-text-primary block mb-2 tracking-wider">CLASSIC</span>
            <span className="text-text-secondary text-[11px] block mb-6 uppercase tracking-wider opacity-90 leading-relaxed font-bold">
              UNLIMITED<br/>PUZZLES
            </span>
            <div className="bg-brand text-secondary py-3 rounded-2xl text-xs font-heading tracking-[0.2em] border-puffy-blue-border border-b-6 border-r-4 button-bubbly shadow-xl uppercase">
              Start
            </div>
          </button>

          <button
            onClick={() => navigate('/daily')}
            className="card-bubbly p-8 text-center cursor-pointer group active:scale-95 shadow-2xl"
          >
            <CalendarDays className="w-12 h-12 mx-auto mb-4 text-accent group-hover:scale-125 group-hover:-rotate-6 transition-all duration-500 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]" />
            <span className="font-heading text-xl text-accent block mb-2 tracking-wider drop-shadow-md">DAILY</span>
            <span className="text-text-secondary text-[11px] block mb-6 uppercase tracking-wider opacity-90 leading-relaxed font-bold">
              ONE WORD<br/>A DAY
            </span>
            <div className="bg-accent text-secondary py-3 rounded-2xl text-xs font-heading tracking-[0.2em] border-puffy-yellow-border border-b-6 border-r-4 button-bubbly shadow-xl uppercase">
              Play
            </div>
          </button>
        </div>

        {/* Tournament Button */}
        <button
          onClick={() => navigate('/tournaments')}
          className="card-bubbly p-6 cursor-pointer group active:scale-95 text-left shadow-2xl"
        >
          <div className="flex items-center gap-6">
            <div className="bg-white/5 p-5 rounded-[2rem] border border-white/10 shadow-inner group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
              <Trophy className="w-10 h-10 text-accent" />
            </div>
            <div className="flex-1">
              <span className="font-heading text-xl text-text-primary block uppercase tracking-wider group-hover:text-accent transition-colors drop-shadow-md">Tournament</span>
              <span className="text-text-secondary text-[11px] uppercase tracking-widest opacity-90 font-bold">ZK-VERIFIED CHAMPIONS</span>
            </div>
            <div className="bg-accent text-secondary px-8 py-4 rounded-2xl text-sm font-heading tracking-[0.2em] border-puffy-yellow-border border-b-6 border-r-4 button-bubbly shadow-2xl uppercase">
              Enter
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
