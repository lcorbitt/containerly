'use client';

import { useCurrentUser as useCurrentUserQuery } from '@/queries';

export function useCurrentUser() {
  return useCurrentUserQuery();
}




