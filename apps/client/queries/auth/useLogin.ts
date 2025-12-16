import { useMutation } from '@tanstack/react-query';
import { apiClient, setAuthToken } from '@/lib/apiClient';
import { API_ENDPOINTS, LoginDto, AuthResponse } from '@containerly/common';

export function useLogin() {
  return useMutation<AuthResponse, Error, LoginDto>({
    mutationFn: async (data) => {
      const response = await apiClient<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      await setAuthToken(response.token);
      return response;
    },
  });
}




