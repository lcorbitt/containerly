import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClientWithAuth } from '@/lib/apiClient';
import { API_ENDPOINTS, Lookup } from '@containerly/common';

export function useRefreshLookup() {
  const queryClient = useQueryClient();

  return useMutation<Lookup, Error, string>({
    mutationFn: (id) =>
      apiClientWithAuth<Lookup>(API_ENDPOINTS.LOOKUPS.REFRESH(id), {
        method: 'POST',
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lookups'] });
      queryClient.invalidateQueries({ queryKey: ['lookup', data.id] });
    },
  });
}




