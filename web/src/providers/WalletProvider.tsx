import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import Controller from '@cartridge/controller';
import { constants } from 'starknet';
import { RPC_URL } from '../env';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WalletAccountCompat = any;

interface WalletContextValue {
  account: WalletAccountCompat | null;
  address: string | null;
  username: string | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

// Contract addresses from the deployed manifest
const TOURNAMENT_MANAGER = '0x5efad73bc9c5401383fd9c0fb76b2db60356f1c4fcc9fed60f29fa8cd7dc236';
const PLAYER_SYSTEM = '0x143fb2cfabb7277a1b8696284f0ca6327698d2db74097fe7967cc13975dd239';

const controller = new Controller({
  defaultChainId: constants.StarknetChainId.SN_SEPOLIA,
  chains: [{ rpcUrl: RPC_URL }],
  policies: {
    contracts: {
      [TOURNAMENT_MANAGER]: {
        name: 'Tournament Manager',
        methods: [
          { name: 'Join Tournament', entrypoint: 'join_tournament' },
          { name: 'Submit Guess', entrypoint: 'submit_guess' },
          { name: 'Create Tournament', entrypoint: 'create_tournament' },
          { name: 'Activate Tournament', entrypoint: 'activate_tournament' },
          { name: 'End Tournament', entrypoint: 'end_tournament' },
        ],
      },
      [PLAYER_SYSTEM]: {
        name: 'Player System',
        methods: [
          { name: 'Register Player', entrypoint: 'register_player' },
        ],
      },
    },
  },
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<WalletAccountCompat | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const probed = useRef(false);

  useEffect(() => {
    if (probed.current) return;
    probed.current = true;
    controller.probe().then((walletAccount) => {
      if (walletAccount) {
        setAccount(walletAccount);
        setAddress(walletAccount.address);
        controller.username()?.then((u: string | undefined) => setUsername(u ?? null));
      }
    }).catch(() => {});
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const walletAccount = await controller.connect();
      if (walletAccount) {
        setAccount(walletAccount);
        setAddress(walletAccount.address);
        const u = await controller.username();
        setUsername(u ?? null);
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await controller.disconnect();
    setAccount(null);
    setAddress(null);
    setUsername(null);
  }, []);

  return (
    <WalletContext.Provider value={{ account, address, username, isConnecting, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
