import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const queryClient = new QueryClient();

export function withReactQueryProvider(AppComponent: React.ComponentType) {
  return function ProviderWrapper(props: any) {
    return (
      <QueryClientProvider client={queryClient}>
        <AppComponent {...props} />
      </QueryClientProvider>
    );
  };
}
