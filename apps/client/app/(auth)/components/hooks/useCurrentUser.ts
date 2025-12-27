'use client';

import { useSession } from 'next-auth/react';
import { useAuth } from '@/entities/auth/useAuth';

export function useCurrentUser() {
  const { data: session, status } = useSession();
  const { currentUser } = useAuth();

  // Return NextAuth session user for UI, entity hook available for API-based access
  return {
    data: session?.user || null,
    isLoading: status === 'loading',
    isAuthenticated: !!session?.user,
    // Also expose the entity hook's currentUser for API-based access if needed
    apiUser: currentUser.data,
  };
}

