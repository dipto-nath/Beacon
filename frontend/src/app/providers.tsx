'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

// Query key factories for user-specific and shared data
export const queryKeys = {
  // User-specific keys - include user ID
  staffAppointments: (userId: string | undefined) => ['staffAppointments', userId],
  staffAnalytics: (userId: string | undefined) => ['staffAnalytics', userId],
  staffCases: (userId: string | undefined) => ['staffCases', userId],
  // Shared keys - no user ID
  resources: () => ['resources'],
  announcements: () => ['announcements'],
} as const;

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const { user } = useAuth({ requireAuth: false });

  // Clear user-specific queries when user changes (login/logout/user switch)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const prevUserId = (window as any).__BEACON_PREV_USER_ID__;
    const currentUserId = user?.id;
    
    if (prevUserId !== currentUserId) {
      if (prevUserId !== undefined) {
        // User changed or logged out - cancel and remove user-specific queries
        queryClient.cancelQueries({ queryKey: ['staffAppointments', prevUserId] });
        queryClient.removeQueries({ queryKey: ['staffAppointments', prevUserId] });
        queryClient.cancelQueries({ queryKey: ['staffAnalytics', prevUserId] });
        queryClient.removeQueries({ queryKey: ['staffAnalytics', prevUserId] });
        queryClient.cancelQueries({ queryKey: ['staffCases', prevUserId] });
        queryClient.removeQueries({ queryKey: ['staffCases', prevUserId] });
      }
      (window as any).__BEACON_PREV_USER_ID__ = currentUserId;
    }
  }, [user?.id, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
