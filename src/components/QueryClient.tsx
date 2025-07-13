
import React from 'react';
import { QueryClient as TanStackQueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create the query client instance outside of the component to avoid recreation
const queryClient = new TanStackQueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface QueryClientProps {
  children: React.ReactNode;
}

export const QueryClient: React.FC<QueryClientProps> = ({ children }) => {
  console.log('🔍 QueryClient - Rendering with React:', !!React);
  console.log('🔍 QueryClient - useEffect available:', !!React.useEffect);
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
