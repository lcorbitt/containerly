export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  MEMBER = 'MEMBER',
}

export interface User {
  id: string;
  email: string;
  orgId: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lookup {
  id: string;
  userId: string;
  orgId: string;
  query: string;
  status: LookupStatus;
  result?: LookupResult;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export enum LookupStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface LookupResult {
  data: Record<string, any>;
  metadata?: {
    source?: string;
    timestamp?: Date;
    [key: string]: any;
  };
}

export interface CreateLookupDto {
  query: string;
}

export interface UpdateLookupDto {
  status?: LookupStatus;
  result?: LookupResult;
  error?: string;
}

export interface AuthResponse {
  user: User;
  organization: Organization;
  token: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface SignupDto {
  email: string;
  password: string;
  organizationName: string;
}
