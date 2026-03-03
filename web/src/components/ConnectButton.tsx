import { useWallet } from '../providers/WalletProvider';

export function ConnectButton() {
  const { account, username, isConnecting, connect, disconnect } = useWallet();

  if (account) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-text-secondary font-mono">
          {username || account.address.slice(0, 6) + '...' + account.address.slice(-4)}
        </span>
        <button
          onClick={disconnect}
          className="px-4 py-2 text-xs font-heading tracking-wider bg-bg-surface-light/40 text-text-secondary border-tile-border/50 hover:border-error/50 hover:text-error transition-all button-bubbly cursor-pointer"
        >
          DISCONNECT
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="px-5 py-2.5 rounded-xl bg-brand text-secondary border-puffy-blue-border font-heading tracking-widest text-xs button-bubbly disabled:opacity-50 cursor-pointer"
    >
      {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
    </button>
  );
}
