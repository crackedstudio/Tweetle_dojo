import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from './ConnectButton';
import { Home, Target, Sparkles, Trophy, LayoutDashboard, Image as ImageIcon, ImageOff } from 'lucide-react';

const NAV_LINKS = [
  { path: '/', label: 'Home', Icon: Home },
  { path: '/classic', label: 'Classic', Icon: Target },
  { path: '/daily', label: 'Daily', Icon: Sparkles },
  { path: '/tournaments', label: 'Tournaments', Icon: Trophy },
  { path: '/admin', label: 'Admin', Icon: LayoutDashboard },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [bgVisible, setBgVisible] = useState(() => {
    const saved = localStorage.getItem('tweetle_bg_visible');
    return saved !== 'false'; // Default to true
  });

  useEffect(() => {
    if (bgVisible) {
      document.body.classList.add('bg-active');
    } else {
      document.body.classList.remove('bg-active');
    }
    localStorage.setItem('tweetle_bg_visible', String(bgVisible));
  }, [bgVisible]);

  return (
    <div className="min-h-screen flex flex-col bg-[#04080F] relative overflow-x-hidden">
      {/* Dynamic Background Image Layer */}
      {bgVisible && (
        <div 
          className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000"
          style={{ 
            backgroundImage: "url('/background.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            opacity: 0.15 // Subtle background to keep text legible
          }}
        />
      )}
      
      {/* Background Gradient Overlay (Always there for depth) */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-radial-dark opacity-80" />

      {/* Top Header */}
      <header className="relative bg-[#0A161A]/80 backdrop-blur-xl border-b border-white/5 px-4 lg:px-8 py-1 sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Link to="/" className="flex-shrink-0 flex items-center no-underline ">
            <img src="/tweetle-name.png" alt="Tweetle" className="h-14 lg:h-20 object-contain drop-shadow-sm scale-150" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-2 lg:gap-4 no-scrollbar">
            <div className="flex items-center gap-2 lg:gap-3 flex-nowrap min-w-0">
              {NAV_LINKS.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-3 lg:px-4 py-2 text-[10px] lg:text-xs font-heading tracking-wider no-underline transition-all button-bubbly whitespace-nowrap min-w-fit ${
                    location.pathname === path
                      ? 'bg-accent text-secondary border-puffy-yellow-border'
                      : 'bg-white/5 text-text-secondary border-white/5 hover:border-accent/40 hover:text-accent'
                  }`}
                >
                  {label.toUpperCase()}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2 pl-4 border-l border-white/5 ml-2">
              <button 
                onClick={() => setBgVisible(!bgVisible)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-brand border border-white/5 transition-all button-bubbly group flex items-center gap-2 cursor-pointer"
                title="Toggle Background"
              >
                {bgVisible ? <ImageIcon className="w-4 h-4" /> : <ImageOff className="w-4 h-4" />}
                <span className="text-[10px] font-heading tracking-widest hidden xl:inline">THEME</span>
              </button>
              <ConnectButton />
            </div>
          </nav>

          {/* Mobile Header (Just Wallet & Toggle) */}
          <div className="lg:hidden flex items-center gap-2">
            <button 
              onClick={() => setBgVisible(!bgVisible)}
              className="p-2.5 rounded-xl bg-white/5 text-brand border border-white/5 cursor-pointer"
            >
              {bgVisible ? <ImageIcon className="w-5 h-5" /> : <ImageOff className="w-5 h-5" />}
            </button>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col pb-20 lg:pb-0">
        {children}
      </main>

      {/* Bottom Nav (Mobile Only) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-3 pt-1">
        <div className="max-w-md mx-auto bg-[#0A161A]/95 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] flex items-center justify-between py-2 px-4">
          {NAV_LINKS.filter(link => link.path !== '/admin').map(({ path, label, Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className="flex flex-col items-center gap-1 no-underline group relative flex-1"
              >
                <div className={`
                  w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300
                  ${isActive 
                    ? 'bg-brand shadow-[0_0_12px_rgba(58,176,255,0.3)]' 
                    : 'bg-[#14232B] border border-white/5'}
                `}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-secondary' : 'text-brand'}`} />
                </div>
                <span className={`
                  text-[8px] font-heading tracking-widest uppercase transition-all duration-300
                  ${isActive ? 'text-brand opacity-100 font-bold' : 'text-text-secondary opacity-50'}
                `}>
                  {label}
                </span>
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand rounded-full shadow-[0_0_8px_#3fbaff] animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
