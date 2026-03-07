'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useMemo } from 'react'
import useSeller from '../hooks/useSeller';
import { WebSocketProvider } from '../context/webSocketContext';

interface ProviderProps {
  children: ReactNode;
}

const Provider = ({ children }: ProviderProps) => {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ProvidersWithWebSocket>
        {children}
      </ProvidersWithWebSocket>
    </QueryClientProvider>
  );
};

const ProvidersWithWebSocket = ({children} : {children: React.ReactNode}) => {
  const {seller, isLoading} = useSeller()
  if(isLoading) return null
  
  return (
    <>
      {seller && <WebSocketProvider seller={seller}>
          {children}
      </WebSocketProvider>}

      {!seller && children}
    </>
  )
}

export default Provider;