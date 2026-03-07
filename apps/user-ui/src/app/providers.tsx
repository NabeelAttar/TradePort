'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react'
import { Toaster } from 'sonner';
import useUser from '../hooks/useUser';
import { WebSocketProvider } from '../context/webSocketContext';

const Providers = ({children} : {children:React.ReactNode}) => {
    const [queryClient] = React.useState(() => new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          staleTime: 1000 * 60 * 5
        }
      }
    }));
  return (
    <QueryClientProvider client={queryClient}>
        <ProvidersWithWebSocket>
          {children}
        </ProvidersWithWebSocket> 
        <Toaster />
    </QueryClientProvider> 
  )
}

const ProvidersWithWebSocket = ({children} : {children: React.ReactNode}) => {
  const {user, isLoading} = useUser()
  if(isLoading) return null
  
  return (
    <>
      {user && <WebSocketProvider user={user}>
          {children}
      </WebSocketProvider>}

      {!user && children}
    </>
  )
}

export default Providers