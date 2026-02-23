import { createContext, useContext, useMemo } from 'react';
import { DojoProvider as DojoSdkProvider } from '@dojoengine/core';
import { setupWorld } from '../dojo/contracts.gen';
import { dojoConfig } from '../dojo/dojoConfig';
import { RPC_URL } from '../env';
import { useWallet } from './WalletProvider';

type WorldClient = ReturnType<typeof setupWorld>;

interface DojoContextValue {
  client: WorldClient | null;
  account: ReturnType<typeof useWallet>['account'];
  address: string | null;
}

const DojoContext = createContext<DojoContextValue | null>(null);

export function DojoProvider({ children }: { children: React.ReactNode }) {
  const { account, address } = useWallet();

  const client = useMemo(() => {
    try {
      const provider = new DojoSdkProvider(dojoConfig.manifest, RPC_URL);
      return setupWorld(provider);
    } catch (e) {
      console.error('[DojoProvider] Failed to initialize:', e);
      return null;
    }
  }, []);

  return (
    <DojoContext.Provider value={{ client, account, address }}>
      {children}
    </DojoContext.Provider>
  );
}

export function useDojo() {
  const ctx = useContext(DojoContext);
  if (!ctx) throw new Error('useDojo must be used within DojoProvider');
  return ctx;
}
