'use client';

import { useState, useMemo, useRef } from 'react';
import { useCreateLookup } from '@/queries';

export function useSearchInput() {
  const [query, setQuery] = useState('');
  const createLookup = useCreateLookup();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useMemo(() => {
    return (searchQuery: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(async () => {
        if (searchQuery.trim()) {
          await createLookup.mutateAsync({ query: searchQuery.trim() });
        }
      }, 500);
    };
  }, [createLookup]);

  const handleChange = (value: string) => {
    setQuery(value);
    handleSearch(value);
  };

  return {
    query,
    setQuery: handleChange,
    isCreating: createLookup.isPending,
    error: createLookup.error,
  };
}

