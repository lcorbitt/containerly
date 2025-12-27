'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useAuth } from '@/entities/auth/useAuth';

export function useSignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const router = useRouter();
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Call the entity hook
      await signup.mutateAsync({ email, password, organizationName });

      // Signup successful - automatically sign in and redirect to dashboard
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        // If auto-login fails, redirect to login page
        router.push(`/login?email=${encodeURIComponent(email)}&message=Account created! Please sign in.`);
      } else {
        // Successfully signed in - redirect to dashboard
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      // Error is handled by the mutation
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    organizationName,
    setOrganizationName,
    handleSubmit,
    isLoading: signup.isPending,
    error: signup.error,
  };
}

