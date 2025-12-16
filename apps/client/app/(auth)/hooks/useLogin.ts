'use client';

import { useRouter } from 'next/navigation';
import { useLogin as useLoginQuery } from '@/queries';
import { LoginDto } from '@containerly/common';

export function useLogin() {
  const router = useRouter();
  const loginMutation = useLoginQuery();

  const login = async (data: LoginDto) => {
    try {
      await loginMutation.mutateAsync(data);
      router.push('/dashboard');
    } catch (error) {
      // Error handling is done by the mutation
      throw error;
    }
  };

  return {
    login,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
  };
}




