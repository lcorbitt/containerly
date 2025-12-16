import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClientWithAuth } from '@/lib/apiClient';
import { API_ENDPOINTS, CreateLookupDto, Lookup } from '@containerly/common';

export function useCreateLookup() {
  const queryClient = useQueryClient();

  return useMutation<Lookup, Error, CreateLookupDto>({
    mutationFn: (data) =>
      apiClientWithAuth<Lookup>(API_ENDPOINTS.LOOKUPS.BASE, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lookups'] });
    },
  });
}




