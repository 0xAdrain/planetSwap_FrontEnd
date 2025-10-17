import { createContext, useContext, ReactNode, useState } from 'react';

interface PlanetSwapContextType {
  // Global state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // User preferences
  slippage: number;
  setSlippage: (slippage: number) => void;
  
  // Pool data
  selectedPool: 'protocol' | 'community';
  setSelectedPool: (pool: 'protocol' | 'community') => void;
  
  // Transaction state
  pendingTx: string | null;
  setPendingTx: (tx: string | null) => void;
}

const PlanetSwapContext = createContext<PlanetSwapContextType | undefined>(undefined);

interface PlanetSwapProviderProps {
  children: ReactNode;
}

export function PlanetSwapProvider({ children }: PlanetSwapProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [slippage, setSlippage] = useState(0.5); // 0.5%
  const [selectedPool, setSelectedPool] = useState<'protocol' | 'community'>('protocol');
  const [pendingTx, setPendingTx] = useState<string | null>(null);

  const value: PlanetSwapContextType = {
    isLoading,
    setIsLoading,
    slippage,
    setSlippage,
    selectedPool,
    setSelectedPool,
    pendingTx,
    setPendingTx,
  };

  return (
    <PlanetSwapContext.Provider value={value}>
      {children}
    </PlanetSwapContext.Provider>
  );
}

export function usePlanetSwap() {
  const context = useContext(PlanetSwapContext);
  if (context === undefined) {
    throw new Error('usePlanetSwap must be used within a PlanetSwapProvider');
  }
  return context;
}
