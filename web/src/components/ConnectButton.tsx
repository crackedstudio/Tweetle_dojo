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
          className="px-3 py-1.5 text-sm rounded-lg border border-tile-border text-text-secondary hover:text-text-primary hover:border-brand transition-colors cursor-pointer"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="px-4 py-2 rounded-lg bg-brand text-secondary font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
