import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from './ConnectButton';

const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/classic', label: 'Classic' },
  { path: '/daily', label: 'Daily' },
  { path: '/tournaments', label: 'Tournaments' },
  { path: '/admin', label: 'Admin' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-bg-surface/60 backdrop-blur-md border-b border-tile-border px-4 py-3 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center no-underline group">
            <img src="/tweetle-name.png" alt="Tweetle" className="h-12 object-contain transition-transform scale-250" />
          </Link>

          <nav className="flex items-center gap-3">
            {NAV_LINKS.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-4 py-2 text-xs font-heading tracking-wider no-underline transition-all button-bubbly ${
                  location.pathname === path
                    ? 'bg-accent text-secondary border-puffy-yellow-border'
                    : 'bg-accent/5 text-text-secondary border-white/5 hover:border-accent/40 hover:text-accent'
                }`}
              >
                {label.toUpperCase()}
              </Link>
            ))}
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
