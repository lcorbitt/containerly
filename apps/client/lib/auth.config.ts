import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';

// Use server-side API_URL if available (for Docker), otherwise fall back to NEXT_PUBLIC_API_URL (for client-side)
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await axios.post(`${API_URL}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          }, {
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const data = response.data;
          return {
            id: data.user.id,
            email: data.user.email,
            orgId: data.user.orgId,
            role: data.user.role,
            token: data.token,
            organization: data.organization,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn(params: any) {
      const { user, account, profile } = params;
      // Handle Google OAuth sign-in
      if (account?.provider === 'google') {
        if (!user.email) {
          console.error('Google OAuth: No email provided');
          return false;
        }

        try {
          // Find or create user in backend
          const response = await axios.post(`${API_URL}/auth/google`, {
            email: user.email,
            name: user.name,
            googleId: account.providerAccountId,
          }, {
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const data = response.data;
          // Store backend user data in the user object
          (user as any).id = data.user.id;
          (user as any).orgId = data.user.orgId;
          (user as any).role = data.user.role;
          (user as any).token = data.token;
          (user as any).organization = data.organization;
          return true;
        } catch (error) {
          console.error('Google auth error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt(params: any) {
      const { token, user, account } = params;
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.orgId = (user as any).orgId;
        token.role = (user as any).role;
        token.accessToken = (user as any).token;
        token.organization = (user as any).organization;
      }
      return token;
    },
    async session(params: any) {
      const { session, token } = params;
      try {
        if (session?.user && token) {
          session.user.id = token.id as string;
          session.user.orgId = token.orgId as string;
          session.user.role = token.role as string;
          (session as any).accessToken = token.accessToken;
          (session as any).organization = token.organization;
        }
      } catch (error) {
        console.error('Session callback error:', error);
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

