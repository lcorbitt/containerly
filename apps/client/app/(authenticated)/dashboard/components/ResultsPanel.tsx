'use client';

import { useResultsPanel } from '../hooks/useResultsPanel';
import { Lookup, LookupStatus } from '@containerly/common';
import { formatDate } from '@containerly/common';

interface ResultsPanelProps {
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

export function ResultsPanel({ selectedId, onSelect }: ResultsPanelProps) {
  const { lookups, isLoading, error } = useResultsPanel();

  const getStatusColor = (status: LookupStatus) => {
    switch (status) {
      case LookupStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case LookupStatus.PROCESSING:
        return 'bg-blue-100 text-blue-800';
      case LookupStatus.FAILED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">Loading lookups...</div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading lookups: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  if (lookups.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No lookups yet. Start searching to see results here.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {lookups.map((lookup: Lookup) => (
        <div
          key={lookup.id}
          onClick={() => onSelect?.(lookup.id)}
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            selectedId === lookup.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm truncate">{lookup.query}</span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                lookup.status
              )}`}
            >
              {lookup.status}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {formatDate(lookup.createdAt)}
          </div>
        </div>
      ))}
    </div>
  );
}

