import React, { createContext, useContext } from 'react';
import { useDojo as useDojoHook, type DojoContextValue } from './useDojo';

const DojoContext = createContext<DojoContextValue | null>(null);

export function DojoContextProvider({ children }: { children: React.ReactNode }) {
  const dojo = useDojoHook();
  return (
    <DojoContext.Provider value={dojo}>{children}</DojoContext.Provider>
  );
}

export function useDojo(): DojoContextValue {
  const ctx = useContext(DojoContext);
  if (!ctx) {
    throw new Error('useDojo must be used within DojoContextProvider');
  }
  return ctx;
}
