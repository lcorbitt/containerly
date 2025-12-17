import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      orgId: string;
      role: string;
    };
    accessToken?: string;
    organization?: {
      id: string;
      name: string;
      createdAt: string;
      updatedAt: string;
    };
  }

  interface User {
    id: string;
    email: string;
    orgId?: string;
    role?: string;
    token?: string;
    organization?: any;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    email?: string;
    orgId?: string;
    role?: string;
    accessToken?: string;
    organization?: any;
  }
}

