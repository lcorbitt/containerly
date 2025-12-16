import { useQuery } from '@tanstack/react-query';
import { apiClientWithAuth } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@containerly/common';
import { Lookup } from '@containerly/common';

export function useLookup(id: string | null) {
  return useQuery<Lookup>({
    queryKey: ['lookup', id],
    queryFn: () => apiClientWithAuth<Lookup>(API_ENDPOINTS.LOOKUPS.BY_ID(id!)),
    enabled: !!id,
  });
}




