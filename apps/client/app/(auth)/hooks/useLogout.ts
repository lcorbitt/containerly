'use client';

import { useLogout as useLogoutQuery } from '@/queries';

export function useLogout() {
  const logoutMutation = useLogoutQuery();

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return {
    logout,
    isLoading: logoutMutation.isPending,
  };
}




