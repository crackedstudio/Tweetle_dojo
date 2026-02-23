import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from './ConnectButton';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <header className="bg-bg-surface border-b border-tile-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <span className="font-display text-xl text-brand">TWEETLE</span>
            <span className="text-xs text-text-muted font-mono tracking-widest">TOURNAMENT</span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              to="/"
              className={`text-sm no-underline transition-colors ${
                location.pathname === '/' ? 'text-brand' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Tournaments
            </Link>
            <Link
              to="/admin"
              className={`text-sm no-underline transition-colors ${
                location.pathname === '/admin' ? 'text-brand' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Admin
            </Link>
            <ConnectButton />
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
