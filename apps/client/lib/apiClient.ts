import { env } from '../env';
import { getSession } from 'next-auth/react';

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  // Try to get token from Auth.js session first
  try {
    const session = await getSession();
    if (session?.accessToken) {
      return session.accessToken as string;
    }
  } catch (error) {
    // Silently fail and fallback to localStorage
    // This is expected during signup/login when no session exists yet
  }
  
  // Fallback to localStorage for backward compatibility
  return localStorage.getItem('auth_token');
}

async function setAuthToken(token: string | null): Promise<void> {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${env.API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, response.statusText, errorData);
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response.text() as any;
}

export async function apiClientWithAuth<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  if (!token) {
    throw new ApiError(401, 'Unauthorized', { message: 'No auth token' });
  }
  return apiClient<T>(endpoint, options);
}

// Export token management functions
export { getAuthToken, setAuthToken };




