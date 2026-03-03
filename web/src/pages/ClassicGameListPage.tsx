import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameActions } from '../hooks/useGameActions';
import { useWallet } from '../providers/WalletProvider';
import { ChevronRight, Plus } from 'lucide-react';

const LEVEL_SPACING = 160;
const MAP_WIDTH = 450; 

interface ClassicGame {
  game_id: number;
  has_ended: boolean;
  starts_at: number;
}

// Reusable dynamic Level Station component
function LevelStation({ index, state, onClick }: { index: number, state: 'locked' | 'current' | 'completed' | 'in-progress', onClick: () => void }) {
  const isLocked = state === 'locked';
  
  return (
    <button
      disabled={isLocked}
      onClick={onClick}
      className={`
        relative w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center 
        transition-all duration-300 transform group
        ${isLocked ? 'cursor-not-allowed grayscale-[0.8] scale-90' : 'cursor-pointer hover:scale-115 active:scale-95'}
      `}
    >
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {state === 'completed' ? (
          <div className="relative transform hover:rotate-12 transition-transform">
            <img src="/star.svg" className="w-14 h-14 drop-shadow-[0_5px_15px_rgba(254,117,4,0.4)]" alt="Win" />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-tile-correct text-white text-[9px] font-heading px-2 py-0.5 rounded-md border border-white/20 shadow-lg">
              WIN
            </span>
          </div>
        ) : state === 'locked' ? (
          <div className="relative opacity-60">
            <img src="/level-locked.svg" className="w-12 h-12" alt="Locked" />
          </div>
        ) : (
          <div className="relative flex items-center justify-center group-hover:drop-shadow-glow-blue transition-all">
            {/* Dynamic Level SVG Base */}
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" className="w-16 h-16 lg:w-20 lg:h-20">
              <rect x="2" y="2" width="56" height="56" rx="28" stroke="#ACF5FB" strokeWidth="4"/>
              <rect x="4" y="4" width="52" height="52" rx="26" stroke="#33D8D4" strokeWidth="4"/>
              <rect x="6.5" y="6.5" width="47" height="47" rx="23.5" fill="url(#levelGradient)"/>
              <rect x="6.5" y="6.5" width="47" height="47" rx="23.5" stroke="#ACF5FB"/>
              <defs>
                <linearGradient id="levelGradient" x1="30" y1="6" x2="30" y2="54" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ECFEFF"/>
                  <stop offset="1" stopColor="#30A7B0"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-display text-2xl text-[#006E6C] pt-1 drop-shadow-sm">
              {index + 1}
            </span>
            {state === 'in-progress' && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-secondary animate-pulse shadow-glow-yellow" />
            )}
          </div>
        )}
      </div>

      {!isLocked && (
        <div className={`absolute top-18 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0
          ${state === 'completed' ? 'text-tile-correct' : 'text-brand'}
        `}>
          <p className="text-[10px] font-heading tracking-[0.2em] uppercase whitespace-nowrap drop-shadow-lg">
            {state === 'completed' ? 'Level Clear' : 'Explore'}
          </p>
        </div>
      )}
    </button>
  );
}

export function ClassicGameListPage() {
  const navigate = useNavigate();
  const { account, address } = useWallet();
  const { listClassicGames, startGame } = useGameActions();
  const [games, setGames] = useState<ClassicGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const loadGames = useCallback(async () => {
    if (!address) return;
    try {
      const list = await listClassicGames(address);
      const sorted = [...list].sort((a, b) => Number(a.game_id) - Number(b.game_id));
      setGames(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [address, listClassicGames]);

  useEffect(() => {
    if (address) {
      loadGames();
    } else {
      setLoading(false);
    }
  }, [address, loadGames]);

  useEffect(() => {
    if (!loading && scrollContainerRef.current) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [loading]);

  if (!account) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-[#04080F]">
        <div className="card-bubbly p-10 max-w-sm">
           <img src="/level-locked.svg" className="w-20 h-20 mx-auto mb-6 opacity-40" alt="" />
           <h2 className="font-heading text-2xl text-text-primary mb-4">Journey Awaits</h2>
           <p className="text-text-secondary text-sm mb-8">Connect your wallet to start your space odyssey across levels.</p>
        </div>
      </div>
    );
  }

  const getLevelCoords = (index: number) => {
    const y = index * LEVEL_SPACING + 100;
    const x = (MAP_WIDTH / 2) + Math.sin(index * 1.5) * (MAP_WIDTH * 0.25);
    return { x, y };
  };

  const totalLevelsToShow = Math.max(games.length + 5, 12);
  
  // Find where the spaceship should be: the first game NOT finished, or the next available slot
  const currentActiveIdx = games.findIndex(g => !g.has_ended);
  const spaceshipIndex = currentActiveIdx !== -1 ? currentActiveIdx : games.length;

  const levels = Array.from({ length: totalLevelsToShow }).map((_, i) => {
    const game = games[i];
    const isCompleted = game?.has_ended;
    const isInProgress = game && !game.has_ended;
    const isLocked = i > games.length;
    const isCurrent = i === spaceshipIndex; 
    const coords = getLevelCoords(i);
    
    let state: 'locked' | 'current' | 'completed' | 'in-progress' = 'locked';
    if (isCompleted) state = 'completed';
    else if (isInProgress) state = 'in-progress';
    else if (i === games.length) state = 'current'; // Visual style for the 'next' level
    
    return { index: i, game, state, isLocked, isCurrent, ...coords };
  });

  const pathD = levels.reduce((acc, level, i) => {
    if (i === 0) return `M ${level.x} ${level.y}`;
    const prev = levels[i - 1];
    const midY = (prev.y + level.y) / 2;
    return `${acc} C ${prev.x} ${midY}, ${level.x} ${midY}, ${level.x} ${level.y}`;
  }, '');

  const handleStartNew = async () => {
    if (starting) return;
    if (!account) return;
    setStarting(true);
    try {
      const gameId = await startGame();
      navigate(`/classic/play/${Number(gameId)}`);
    } catch (err) {
      console.error(err);
      setStarting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#04080F] relative overflow-hidden">
      {/* Map Header */}
      <div className="relative z-50 bg-[#0A161A]/90 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all button-bubbly group"
          >
            <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="font-heading text-xl text-text-primary tracking-tight">Classic Journey</h1>
            <p className="text-accent text-[9px] uppercase tracking-[0.3em] font-bold opacity-70">Sector Exploration</p>
          </div>
        </div>
        <button
          onClick={handleStartNew}
          disabled={starting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-secondary border-puffy-yellow-border font-heading tracking-widest text-[10px] button-bubbly shadow-lg disabled:opacity-50"
        >
          {starting ? 'WARPING...' : <><Plus className="w-3.5 h-3.5" /> NEW LEVEL</>}
        </button>
      </div>

      {/* Level Scroll Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pb-60 relative scroll-smooth bg-saga-stars"
      >
        {/* Distant Stars Decor */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
           <img src="/left-star.png" className="absolute top-40 left-10 w-24 animate-pulse rotate-12" alt="" />
           <img src="/right-star.svg" className="absolute top-[600px] right-10 w-20 animate-bounce-slow" alt="" />
           <img src="/left-star.png" className="absolute top-[1200px] left-20 w-16 opacity-30" alt="" />
           <img src="/right-star.svg" className="absolute top-[1800px] right-24 w-28 opacity-20" alt="" />
        </div>

        <div className="relative mx-auto mt-20 mb-40 w-full max-w-[450px]" style={{ height: totalLevelsToShow * LEVEL_SPACING + 200 }}>
          {/* The Trail Path */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 px-10">
            <path 
              d={pathD} 
              fill="none" 
              stroke="white" 
              strokeWidth="4" 
              strokeDasharray="1 16" 
              strokeLinecap="round"
              className="animate-trail-flow"
            />
          </svg>

          {/* Level Stations */}
          {levels.map((level) => (
            <div 
              key={level.index}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ left: level.x, top: level.y }}
            >
              {level.isCurrent && (
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-24 z-20 pointer-events-none animate-float-spaceship">
                  <div className="absolute inset-4 bg-brand/40 blur-2xl rounded-full" />
                  <img src="/spaceship.png" className="w-full relative drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" alt="Current" />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-brand text-secondary text-[8px] font-heading px-2 py-0.5 rounded-full tracking-widest whitespace-nowrap shadow-glow-blue border border-white/20">
                    HERE
                  </div>
                </div>
              )}

              <LevelStation 
                index={level.index} 
                state={level.state} 
                onClick={() => level.game && navigate(`/classic/play/${Number(level.game.game_id)}`)} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
