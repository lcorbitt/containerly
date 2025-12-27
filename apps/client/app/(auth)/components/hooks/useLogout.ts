'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/entities/auth/useAuth';

export function useLogout() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      // Call the entity hook to make the API request
      await logout.mutateAsync();
      // Clear NextAuth session
      await signOut({ redirect: false });
      // Navigate to home
      router.push('/');
      router.refresh();
    } catch (error) {
      // Even if API call fails, still clear the session
      await signOut({ redirect: false });
      router.push('/');
      router.refresh();
    }
  };

  return {
    logout: handleLogout,
    isLoading: logout.isPending,
  };
}

