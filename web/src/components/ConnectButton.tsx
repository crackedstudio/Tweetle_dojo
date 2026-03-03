import { useState, useRef, useEffect } from 'react';
import { useWallet } from '../providers/WalletProvider';
import { ChevronDown, LogOut, User as UserIcon, Wallet } from 'lucide-react';

export function ConnectButton() {
  const { account, username, isConnecting, connect, disconnect } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = username || (account ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}` : '');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (account) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-300
            bg-secondary/40 backdrop-blur-md border-2 border-white/5 
            hover:border-accent/40 group cursor-pointer
            ${isOpen ? 'border-accent/60 shadow-[0_0_20px_rgba(255,217,61,0.2)]' : 'shadow-lg'}
          `}
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand to-brand/60 flex items-center justify-center shadow-inner">
            <UserIcon className="w-4 h-4 text-secondary" />
          </div>
          <span className="text-sm font-heading tracking-wide text-text-primary group-hover:text-accent transition-colors">
            {displayName}
          </span>
          <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180 text-accent' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-3 w-56 p-2 card-bubbly border-white/10 shadow-2xl z-50 animate-pop origin-top-right">
            <div className="px-4 py-3 border-b border-white/5 mb-2">
              <p className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-bold mb-1">Authenticated</p>
              <div className="flex items-center gap-2 text-brand">
                <Wallet className="w-3 h-3" />
                <span className="text-[11px] font-mono opacity-80">{account.address.slice(0, 10)}...</span>
              </div>
            </div>
            
            <button
              onClick={() => {
                disconnect();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-error/10 hover:text-error transition-all group font-heading text-xs tracking-widest uppercase cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-white/5 group-hover:bg-error/20">
                <LogOut className="w-4 h-4" />
              </div>
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="px-6 py-2.5 rounded-2xl bg-brand text-secondary border-puffy-blue-border font-heading tracking-[0.15em] text-xs button-bubbly shadow-xl disabled:opacity-50 cursor-pointer"
    >
      {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
    </button>
  );
}
