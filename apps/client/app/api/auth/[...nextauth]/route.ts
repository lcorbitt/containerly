import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth.config';

if (!process.env.NEXTAUTH_SECRET) {
  console.warn('NEXTAUTH_SECRET is not set. Please set it in your environment variables.');
}

const { handlers } = NextAuth(authOptions as any);

export const GET = handlers.GET;
export const POST = handlers.POST;

