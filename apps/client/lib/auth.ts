import { getAuthToken, setAuthToken } from './apiClient';

export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export async function getCurrentUser(): Promise<User | null> {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      await setAuthToken(null);
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await setAuthToken(null);
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}




