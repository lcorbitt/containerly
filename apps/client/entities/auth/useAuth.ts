import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { LoginDto, SignupDto, AuthResponse, User } from '@containerly/common';

export function useAuth() {
  const queryClient = useQueryClient();

  const signup = useMutation<AuthResponse, Error, SignupDto>({
    mutationFn: async (data: SignupDto) => {
      try {
        const response = await axios.post<AuthResponse>('/api/auth/signup', data);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || 'Signup failed';
          throw new Error(message);
        }
        throw error;
      }
    },
  });

  const login = useMutation<AuthResponse, Error, LoginDto>({
    mutationFn: async (data: LoginDto) => {
      try {
        const response = await axios.post<AuthResponse>('/api/auth/login', data);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || 'Login failed';
          throw new Error(message);
        }
        throw error;
      }
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      try {
        const response = await axios.post('/api/auth/logout');
        return response.data;
      } catch (error) {
        // Continue with logout even if API call fails
        console.error('Logout API error:', error);
        return { message: 'Logged out' };
      }
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });

  const currentUser = useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await axios.get<User>('/api/auth/me');
      return response.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    signup,
    login,
    logout,
    currentUser,
  };
}

