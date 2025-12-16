import { useQuery } from '@tanstack/react-query';
import { apiClientWithAuth } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@containerly/common';
import { Lookup } from '@containerly/common';

export function useLookups() {
  return useQuery<Lookup[]>({
    queryKey: ['lookups'],
    queryFn: () => apiClientWithAuth<Lookup[]>(API_ENDPOINTS.LOOKUPS.BASE),
  });
}




