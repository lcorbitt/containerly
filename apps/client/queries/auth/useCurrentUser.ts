import { useQuery } from '@tanstack/react-query';
import { apiClientWithAuth } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@containerly/common';
import { User } from '@containerly/common';

export function useCurrentUser() {
  return useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: () => apiClientWithAuth<User>(API_ENDPOINTS.AUTH.ME),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}




