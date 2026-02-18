import { useEffect, useState } from 'react';
import { DojoProvider } from '@dojoengine/core';
import { Account, AccountInterface, RpcProvider } from 'starknet';
import { setupWorld } from './contracts.gen';
import {
  dojoConfig,
  KATANA_RPC_URL,
  MASTER_ADDRESS,
  MASTER_PRIVATE_KEY,
} from './dojoConfig';

export interface DojoContextValue {
  account: AccountInterface | null;
  address: string | null;
  client: ReturnType<typeof setupWorld> | null;
  isLoading: boolean;
  error: Error | null;
}

export function useDojo(): DojoContextValue {
  const [account, setAccount] = useState<AccountInterface | null>(null);
  const [client, setClient] = useState<ReturnType<typeof setupWorld> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initialize() {
      try {
        const rpcProvider = new RpcProvider({ nodeUrl: KATANA_RPC_URL });

        const masterAccount = new Account({
          provider: rpcProvider,
          address: MASTER_ADDRESS,
          signer: MASTER_PRIVATE_KEY,
        });

        // Patch for Hermes (React Native) — BigInt crash workarounds.
        // starknet.js v8 uses BigInt internally for nonce arithmetic and fee
        // estimation. Hermes cannot convert BigInt → Number, so we must bypass
        // every code-path that triggers that conversion.

        const ZERO_BOUNDS = {
          l1_gas: { max_amount: '0x0', max_price_per_unit: '0x0' },
          l2_gas: { max_amount: '0x0', max_price_per_unit: '0x0' },
          l1_data_gas: { max_amount: '0x0', max_price_per_unit: '0x0' },
        };

        // 1) resolveDetailsWithTip → getEstimateTip → scans blocks → BigInt crash
        (masterAccount as any).resolveDetailsWithTip = async (details: any) => ({
          ...details,
          tip: details.tip ?? 0,
        });

        // 2) estimateInvokeFee → BigInt crash
        (masterAccount as any).estimateInvokeFee = async () => ({
          resourceBounds: ZERO_BOUNDS,
        });

        // 3) accountInvocationsFactory does toBigInt(Number(nonce)) → BigInt crash.
        //    getNonceSafe returns a BigInt, then Number(bigint) crashes Hermes.
        //    Patch getNonceSafe to return a plain JS number instead of BigInt.
        (masterAccount as any).getNonceSafe = async (nonce?: any) => {
          if (nonce !== undefined && nonce !== null) {
            return typeof nonce === 'number' ? nonce : parseInt(String(nonce), 16) || 0;
          }
          const nonceHex: string = await rpcProvider.getNonceForAddress(MASTER_ADDRESS);
          return parseInt(nonceHex, 16) || 0;
        };

        // 4) getChainId may also return BigInt in some paths — ensure it returns a string.
        (masterAccount as any).getChainId = async () => {
          const chainId = await rpcProvider.getChainId();
          return chainId;
        };

        const dojoProvider = new DojoProvider(
          dojoConfig.manifest,
          KATANA_RPC_URL,
        );
        const worldClient = setupWorld(dojoProvider);

        setAccount(masterAccount);
        setClient(worldClient);
      } catch (err) {
        console.error('Failed to initialize Dojo:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, []);

  return { account, address: account?.address ?? null, client, isLoading, error };
}
