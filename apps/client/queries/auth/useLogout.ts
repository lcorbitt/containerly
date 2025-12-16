import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClientWithAuth, setAuthToken } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@containerly/common';
import { logout } from '@/lib/auth';

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await apiClientWithAuth(API_ENDPOINTS.AUTH.LOGOUT, {
          method: 'POST',
        });
      } catch (error) {
        // Continue with logout even if API call fails
        console.error('Logout API error:', error);
      }
      await setAuthToken(null);
      queryClient.clear();
      await logout();
    },
  });
}




