export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  LOOKUPS: {
    BASE: '/lookups',
    BY_ID: (id: string) => `/lookups/${id}`,
    REFRESH: (id: string) => `/lookups/${id}/refresh`,
  },
} as const;

export const WS_EVENTS = {
  LOOKUP_UPDATE: 'lookup:update',
  LOOKUP_COMPLETE: 'lookup:complete',
  LOOKUP_ERROR: 'lookup:error',
} as const;

export const QUEUE_NAMES = {
  LOOKUP: 'lookup',
} as const;

