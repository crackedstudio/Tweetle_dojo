import { createDojoConfig } from '@dojoengine/core';
import manifest from './manifest_dev.json';

export const dojoConfig = createDojoConfig({ manifest: manifest as any });

export const KATANA_RPC_URL = 'http://localhost:5050';
export const TORII_URL = 'http://localhost:8080';
export const NAMESPACE = 'tweetle_dojo';

// Master account from Katana (for development only)
export const MASTER_ADDRESS = '0x127fd5f1fe78a71f8bcd1fec63e3fe2f0486b6ecd5c86a0466c3a21fa5cfcec';
export const MASTER_PRIVATE_KEY = '0xc5b2fcab997346f3ea1c00b002ecf6f382c5f9c9659a3894eb783c5320f912';

// Sepolia / Cartridge (restore for testnet)
// export const TORII_URL = 'https://api.cartridge.gg/x/tweetle-dojo/torii';
