import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

// ── Mini tile used inside instruction slides ──
function MiniTile({
  letter,
  state,
  delay = 0,
}: {
  letter: string;
  state: 'correct' | 'present' | 'absent' | 'empty' | 'filled';
  delay?: number;
}) {
  const STYLE: Record<string, string> = {
    correct: 'bg-tile-correct border-b-4 border-tile-correct/50',
    present: 'bg-tile-present border-b-4 border-tile-present/50',
    absent: 'bg-tile-absent border-b-4 border-tile-absent/50',
    empty: 'bg-tile-empty border-2 border-tile-border',
    filled: 'bg-tile-empty border-2 border-brand',
  };

  return (
    <div
      className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center rounded-xl shadow-lg ${STYLE[state]}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="text-white font-display text-lg sm:text-xl uppercase drop-shadow">
        {letter}
      </span>
    </div>
  );
}

// ── Individual step row for example words ──
function ExampleRow({
  tiles,
  highlight,
  label,
}: {
  tiles: { letter: string; state: 'correct' | 'present' | 'absent' | 'empty' | 'filled' }[];
  highlight: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex gap-1.5 sm:gap-2">
        {tiles.map((tile, i) => (
          <div
            key={i}
            className={`transition-transform duration-300 ${i === highlight ? 'scale-110' : ''}`}
          >
            <MiniTile letter={tile.letter} state={tile.state} delay={i * 80} />
          </div>
        ))}
      </div>
      <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">{label}</p>
    </div>
  );
}

// ── Step definitions ──
const STEPS = [
  {
    id: 'welcome',
    icon: '🐦',
    title: 'WELCOME TO TWEETLE',
    subtitle: 'A word game with web3 skills',
    content: (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-brand/30 blur-[60px] rounded-full scale-150" />
          <img
            src="/mascot.png"
            alt="Tweetle Mascot"
            className="w-24 h-24 sm:w-32 sm:h-32 relative z-10 drop-shadow-xl animate-bounce-slow"
          />
        </div>
        <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-xs">
          Tweetle is a <span className="text-accent font-bold">Wordle-style guessing game</span> built
          on-chain. Guess the hidden 5-letter word in <span className="text-brand font-bold">6 attempts</span> or
          fewer — every move is verified on the blockchain.
        </p>
        <div className="flex gap-1.5 mt-2">
          {['T', 'W', 'E', 'E', 'T'].map((l, i) => (
            <MiniTile
              key={i}
              letter={l}
              state={['correct', 'present', 'absent', 'correct', 'absent'][i] as any}
              delay={i * 100}
            />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'board',
    icon: '🎯',
    title: 'THE GAME BOARD',
    subtitle: 'Your guessing arena',
    content: (
      <div className="flex flex-col gap-4">
        <p className="text-text-secondary text-sm leading-relaxed">
          The board has <span className="text-brand font-bold">6 rows</span> of{' '}
          <span className="text-accent font-bold">5 tiles</span>. Each row is one guess attempt.
          Tiles reveal their colour after you submit a word.
        </p>
        <div className="bg-bg-surface/60 rounded-2xl border border-white/5 p-4 flex flex-col gap-1.5 items-center">
          {/* Submitted row */}
          <div className="flex gap-1.5">
            {['C','R','A','N','E'].map((l,i)=>(
              <MiniTile key={i} letter={l} state={['correct','absent','absent','present','absent'][i] as any} />
            ))}
          </div>
          {/* Active row */}
          <div className="flex gap-1.5">
            {['S','L','A','T','E'].map((l,i)=>(
              <MiniTile key={i} letter={l} state={i < 4 ? 'filled' : 'empty'} />
            ))}
          </div>
          {/* Empty rows */}
          {[0,1,2,3].map(r=>(
            <div key={r} className="flex gap-1.5">
              {[0,1,2,3,4].map(c=>(
                <MiniTile key={c} letter="" state="empty" />
              ))}
            </div>
          ))}
        </div>
        <p className="text-text-secondary text-xs opacity-70 text-center">
          The active row (2nd) is where you type your current guess
        </p>
      </div>
    ),
  },
  {
    id: 'colors',
    icon: '🎨',
    title: 'TILE COLOURS',
    subtitle: 'decoding the feedback',
    content: (
      <div className="flex flex-col gap-5">
        <p className="text-text-secondary text-sm leading-relaxed">
          Each tile colour tells you something about that letter:
        </p>

        <ExampleRow
          tiles={[
            { letter: 'W', state: 'correct' },
            { letter: 'E', state: 'absent' },
            { letter: 'A', state: 'absent' },
            { letter: 'R', state: 'absent' },
            { letter: 'Y', state: 'absent' },
          ]}
          highlight={0}
          label="🟩 Green — letter is CORRECT and in the right spot"
        />

        <ExampleRow
          tiles={[
            { letter: 'P', state: 'absent' },
            { letter: 'I', state: 'present' },
            { letter: 'L', state: 'absent' },
            { letter: 'O', state: 'absent' },
            { letter: 'T', state: 'absent' },
          ]}
          highlight={1}
          label="🟨 Yellow — letter IS in the word but in the WRONG spot"
        />

        <ExampleRow
          tiles={[
            { letter: 'V', state: 'absent' },
            { letter: 'A', state: 'absent' },
            { letter: 'G', state: 'absent' },
            { letter: 'U', state: 'absent' },
            { letter: 'E', state: 'absent' },
          ]}
          highlight={2}
          label="⬛ Dark — letter is NOT in the word at all"
        />
      </div>
    ),
  },
  {
    id: 'keyboard',
    icon: '⌨️',
    title: 'THE KEYBOARD',
    subtitle: 'type, submit, backspace',
    content: (
      <div className="flex flex-col gap-4">
        <p className="text-text-secondary text-sm leading-relaxed">
          Tap or click letters on the on-screen keyboard — or use your physical keyboard — to build
          your guess. Keys also turn colour as you play.
        </p>
        <div className="bg-bg-surface/60 rounded-2xl border border-white/5 p-4 flex flex-col gap-3">
          {/* Keyboard colour legend */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-tile-correct flex items-center justify-center text-white font-display text-sm">A</div>
            <p className="text-text-secondary text-xs">Key turns <span className="text-tile-correct font-bold">green</span> — correct position known</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-tile-present flex items-center justify-center text-white font-display text-sm">B</div>
            <p className="text-text-secondary text-xs">Key turns <span className="text-tile-present font-bold">yellow</span> — in word, wrong spot</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-tile-absent flex items-center justify-center text-white font-display text-sm">C</div>
            <p className="text-text-secondary text-xs">Key turns <span className="text-text-muted font-bold">dark</span> — not in the word</p>
          </div>
          <div className="border-t border-white/5 pt-3 flex items-center gap-2">
            <div className="px-3 h-8 rounded-lg bg-brand/20 border border-brand/40 flex items-center justify-center text-brand font-heading text-xs tracking-wider">ENTER</div>
            <p className="text-text-secondary text-xs">Submit your 5-letter guess</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary font-heading text-xs tracking-wider">⌫</div>
            <p className="text-text-secondary text-xs">Remove last typed letter</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'modes',
    icon: '🏆',
    title: 'GAME MODES',
    subtitle: 'choose your battlefield',
    content: (
      <div className="flex flex-col gap-4">
        <div className="bg-bg-surface/60 rounded-2xl border border-white/5 p-4 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center text-xl flex-shrink-0">✨</div>
            <div>
              <p className="text-accent font-heading tracking-wider text-sm uppercase mb-0.5">Daily Puzzle</p>
              <p className="text-text-secondary text-xs leading-relaxed">One fresh word every day, shared by all players. Resets at midnight UTC. Earn <span className="text-accent font-bold">50 XP</span> for solving it.</p>
            </div>
          </div>
          <div className="border-t border-white/5" />
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand/20 border border-brand/30 flex items-center justify-center text-xl flex-shrink-0">🎯</div>
            <div>
              <p className="text-brand font-heading tracking-wider text-sm uppercase mb-0.5">Classic Mode</p>
              <p className="text-text-secondary text-xs leading-relaxed">Unlimited free-play rounds. Start a new game anytime, at your own pace. Great for practice and improving your streak.</p>
            </div>
          </div>
          <div className="border-t border-white/5" />
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-puffy-purple/20 border border-puffy-purple/30 flex items-center justify-center text-xl flex-shrink-0">🏆</div>
            <div>
              <p className="text-puffy-purple font-heading tracking-wider text-sm uppercase mb-0.5">Tournaments</p>
              <p className="text-text-secondary text-xs leading-relaxed">Competitive bracket play. Buy in, beat other players' scores, and claim the prize pool — all on-chain.</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

// ── Hook: persist "seen" state ──
const STORAGE_KEY = 'tweetle_how_to_play_seen';

export function useHowToPlay() {
  const [isOpen, setIsOpen] = useState(false);

  function open() {
    setIsOpen(true);
  }

  function close() {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
  }

  // Auto-open on first visit
  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      // slight delay so page renders first
      const t = setTimeout(() => setIsOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  return { isOpen, open, close };
}

// ── Main Modal ──
interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
  const [step, setStep] = useState(0);
  const [animDir, setAnimDir] = useState<'forward' | 'back'>('forward');
  const [visible, setVisible] = useState(false);

  const totalSteps = STEPS.length;
  const current = STEPS[step];

  // Animate in/out on isOpen change
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Reset step when reopened
  useEffect(() => {
    if (isOpen) setStep(0);
  }, [isOpen]);

  function goNext() {
    if (step < totalSteps - 1) {
      setAnimDir('forward');
      setStep((s) => s + 1);
    } else {
      onClose();
    }
  }

  function goPrev() {
    if (step > 0) {
      setAnimDir('back');
      setStep((s) => s - 1);
    }
  }

  if (!isOpen && !visible) return null;

  const isLast = step === totalSteps - 1;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ background: 'rgba(4, 8, 15, 0.92)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`relative w-full max-w-sm bg-[#0E1A20] rounded-[2rem] border border-white/8 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 ${
          visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand via-accent to-puffy-purple opacity-80" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-secondary hover:text-brand transition-all cursor-pointer border-none"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step counter dots */}
        <div className="flex justify-center gap-1.5 pt-5 pb-0 px-6">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setAnimDir(i > step ? 'forward' : 'back'); setStep(i); }}
              className={`transition-all duration-300 rounded-full border-none cursor-pointer ${
                i === step
                  ? 'w-6 h-2 bg-brand shadow-glow-blue'
                  : i < step
                  ? 'w-2 h-2 bg-accent/60'
                  : 'w-2 h-2 bg-white/15'
              }`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="px-6 pt-4 pb-3 text-center">
          <div className="text-3xl mb-2">{current.icon}</div>
          <h2 className="font-display text-base sm:text-lg text-text-primary tracking-widest leading-tight">
            {current.title}
          </h2>
          <p className="text-text-secondary text-[10px] uppercase tracking-[0.2em] opacity-70 mt-0.5 font-heading">
            {current.subtitle}
          </p>
        </div>

        {/* Content area */}
        <div
          className="px-5 pb-5 overflow-y-auto"
          style={{ maxHeight: '55vh', minHeight: '200px' }}
          key={`${step}-${animDir}`}
        >
          {current.content}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-4 border-t border-white/5 bg-black/20">
          <button
            onClick={goPrev}
            disabled={step === 0}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-heading text-xs tracking-widest transition-all border-none cursor-pointer ${
              step === 0
                ? 'text-white/20 bg-transparent cursor-not-allowed'
                : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            PREV
          </button>

          <span className="text-text-secondary text-[10px] font-heading tracking-widest opacity-50">
            {step + 1} / {totalSteps}
          </span>

          <button
            onClick={goNext}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-heading text-xs tracking-widest transition-all button-bubbly border-none cursor-pointer ${
              isLast
                ? 'bg-accent text-secondary border-puffy-yellow-border shadow-glow-yellow'
                : 'bg-brand text-secondary border-puffy-blue-border shadow-glow-blue'
            }`}
          >
            {isLast ? "LET'S GO!" : 'NEXT'}
            {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Trigger button convenience component ──
export function HowToPlayButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="How to Play"
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-brand border border-white/5 transition-all button-bubbly cursor-pointer text-[10px] font-heading tracking-widest"
    >
      <BookOpen className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">HOW TO PLAY</span>
    </button>
  );
}
