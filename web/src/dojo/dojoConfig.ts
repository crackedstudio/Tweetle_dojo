import { createDojoConfig } from '@dojoengine/core';
import manifest from './manifest_sepolia.json';

export const dojoConfig = createDojoConfig({ manifest: manifest as any });
