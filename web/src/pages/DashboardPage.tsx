import { useNavigate } from 'react-router-dom';
import { useWallet } from '../providers/WalletProvider';
import { Sparkles, Target, Trophy } from 'lucide-react';

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
    <div className="max-w-6xl mx-auto w-full px-4 lg:px-10 py-10 lg:py-20 flex flex-col-reverse lg:flex-row gap-12 lg:gap-20 items-center lg:items-start justify-center">
      {/* Left Column: Mascot & Brand */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center lg:sticky lg:top-32 order-1">
        <div className="relative inline-block mb-8 lg:mb-12">
          <div className="absolute inset-0 bg-brand/30 blur-[80px] lg:blur-[130px] rounded-full scale-125 animate-pulse" />
          <img 
            src="/mascot.png" 
            alt="Tweetle Mascot" 
            className="h-56 md:h-80 lg:h-[32rem] w-auto relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-bounce-slow pointer-events-none select-none transition-transform hover:scale-105 duration-700 object-contain"
          />
        </div>
        <div className="text-center w-full px-4 mt-8 lg:mt-12">
          <img src="/tweetle-name.png" alt="Tweetle" className="h-24 md:h-40 lg:h-56 object-contain mx-auto mb-10 drop-shadow-[0_0_40px_rgba(58,176,255,0.4)]" />
          <p className="text-accent text-[10px] lg:text-sm font-heading tracking-[0.3em] lg:tracking-[0.4em] uppercase opacity-90 mb-8 px-5 lg:px-8 py-2.5 rounded-full border border-white/10 inline-block bg-secondary/40 backdrop-blur-md shadow-2xl">
            GUESS THE WORD • SKILL PROVEN
          </p>
          
          {account && (
            <div className="inline-flex items-center gap-4 px-6 lg:px-8 py-3.5 lg:py-4 rounded-[2rem] lg:rounded-[2.5rem] bg-secondary/60 backdrop-blur-2xl border-2 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-brand/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-gradient-to-br from-accent to-[#D4941A] flex items-center justify-center shadow-lg border-b-4 border-puffy-yellow-border relative z-10">
                <span className="text-secondary text-base lg:text-lg font-display">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col items-start relative z-10">
                <span className="text-text-secondary text-[8px] lg:text-[10px] uppercase tracking-[0.2em] font-bold mb-0.5 opacity-60 text-left">Explorer Profile</span>
                <span className="text-text-primary text-base lg:text-lg font-heading tracking-wider drop-shadow-md">{displayName}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Game Cards */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6 lg:gap-8 order-2 lg:order-2">
        {/* Daily Challenge Card */}
        <div className="card-bubbly p-6 lg:p-8 overflow-hidden group border-white/5">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand via-accent to-brand opacity-60" />
          <h2 className="font-heading text-xl lg:text-2xl text-text-primary mb-2 uppercase tracking-wide flex items-center gap-3">
            <Sparkles className="w-6 h-6 lg:w-8 lg:h-8 text-accent animate-pulse" /> Daily Puzzle
          </h2>
          <p className="text-text-secondary text-[10px] lg:text-xs mb-8 uppercase tracking-widest font-bold opacity-80">
            Win for <span className="text-accent font-display text-lg drop-shadow-[0_0_12px_rgba(255,217,61,0.5)]">50 XP</span>
          </p>

          <div className="flex justify-center gap-2 lg:gap-4 mb-10 overflow-x-auto py-2 no-scrollbar px-2">
            {PREVIEW_TILES.map((tile, i) => (
              <div
                key={i}
                className={`
                  w-12 h-12 lg:w-16 lg:h-16 flex-shrink-0 rounded-xl lg:rounded-[1.25rem] flex items-center justify-center 
                  border-b-4 lg:border-b-6 border-r-2 shadow-xl transition-all 
                  hover:scale-110 hover:-rotate-3 cursor-default 
                  ${TILE_COLORS[tile.state]} border-black/10
                `}
              >
                <span className="font-display text-xl lg:text-3xl text-white drop-shadow-md uppercase">
                  {tile.letter}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/daily')}
            className="w-full py-4 lg:py-5 rounded-2xl bg-accent text-secondary border-puffy-yellow-border font-heading tracking-[0.2em] text-sm lg:text-base button-bubbly shadow-2xl active:brightness-90 uppercase"
          >
            Play Daily
          </button>
        </div>

        {/* Game Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/classic')}
            className="card-bubbly p-6 lg:p-8 text-center cursor-pointer group active:scale-95 shadow-2xl border-white/5"
          >
            <Target className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-4 text-brand group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 filter drop-shadow-[0_10px_20px_rgba(58,176,255,0.3)]" />
            <span className="font-heading text-lg lg:text-xl text-text-primary block mb-1 tracking-wider uppercase">Classic</span>
            <span className="text-text-secondary text-[10px] block mb-6 uppercase tracking-wider opacity-80 leading-relaxed font-bold">
              START YOUR<br/>SAGA JOURNEY
            </span>
            <div className="bg-brand text-secondary py-3 rounded-2xl text-[10px] lg:text-xs font-heading tracking-[0.2em] border-puffy-blue-border border-b-6 border-r-4 button-bubbly shadow-xl uppercase">
              Enter Map
            </div>
          </button>

          <button
            onClick={() => navigate('/tournaments')}
            className="card-bubbly p-6 lg:p-8 text-center cursor-pointer group active:scale-95 shadow-2xl border-white/5"
          >
            <Trophy className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-4 text-accent group-hover:scale-125 group-hover:-rotate-6 transition-all duration-500 filter drop-shadow-[0_10px_20px_rgba(255,217,61,0.3)]" />
            <span className="font-heading text-lg lg:text-xl text-text-primary block mb-1 tracking-wider uppercase">Tournament</span>
            <span className="text-text-secondary text-[10px] block mb-6 uppercase tracking-wider opacity-90 leading-relaxed font-bold">
              COMPETE FOR<br/>BIG REWARDS
            </span>
            <div className="bg-accent text-secondary py-3 rounded-2xl text-[10px] lg:text-xs font-heading tracking-[0.2em] border-puffy-yellow-border border-b-6 border-r-4 button-bubbly shadow-xl uppercase">
              Join Now
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
