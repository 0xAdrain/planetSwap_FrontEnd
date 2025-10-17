import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { ConnectKitProvider } from 'connectkit';

import { wagmiConfig } from '@/lib/wagmi';
import { GlobalStyles } from '@/styles/GlobalStyles';
import { PlanetSwapProvider } from '@/contexts/StarPumpContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import LoadingScreen from '@/components/LoadingScreen';

import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false);
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
      },
    },
  }));

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <ConnectKitProvider
          theme="midnight"
          customTheme={{
            "--ck-accent-color": "#228B22",
            "--ck-accent-text-color": "#ffffff",
          }}
        >
          <LanguageProvider>
            <PlanetSwapProvider>
              <GlobalStyles />
              <Component {...pageProps} />
            </PlanetSwapProvider>
          </LanguageProvider>
        </ConnectKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
