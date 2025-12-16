'use client';

import { useSearchInput } from '../hooks/useSearchInput';

export function SearchInput() {
  const { query, setQuery, isCreating, error } = useSearchInput();

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter search query..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isCreating}
        />
        {isCreating && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-2 text-red-600 text-sm">
          {error instanceof Error ? error.message : 'Failed to create lookup'}
        </div>
      )}
    </div>
  );
}




