'use client';

import { signOut } from 'next-auth/react';

export function useLogout() {
  const handleLogout = async () => {
    // Clear NextAuth session and redirect to login
    // NextAuth handles session cookie clearing and redirect
    await signOut({
      redirect: true,
      callbackUrl: '/login'
    });
  };

  return {
    logout: handleLogout,
    isLoading: false,
  };
}

