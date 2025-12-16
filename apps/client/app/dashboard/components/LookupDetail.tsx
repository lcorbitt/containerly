'use client';

import { useLookupDetail } from '../hooks/useLookupDetail';
import { LookupStatus } from '@containerly/common';
import { formatDate } from '@containerly/common';

interface LookupDetailProps {
  lookupId: string | null;
}

export function LookupDetail({ lookupId }: LookupDetailProps) {
  const { lookup, isLoading, error, refresh, isRefreshing } =
    useLookupDetail(lookupId);

  if (!lookupId) {
    return (
      <div className="p-8 text-center text-gray-500">
        Select a lookup to view details
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  if (!lookup) {
    return (
      <div className="p-8 text-center text-gray-500">Lookup not found</div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Lookup Details</h2>
        <button
          onClick={refresh}
          disabled={isRefreshing}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-700">Query</label>
          <p className="mt-1 text-gray-900">{lookup.query}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Status</label>
          <p className="mt-1">
            <span
              className={`px-2 py-1 rounded text-sm font-medium ${
                lookup.status === LookupStatus.COMPLETED
                  ? 'bg-green-100 text-green-800'
                  : lookup.status === LookupStatus.PROCESSING
                  ? 'bg-blue-100 text-blue-800'
                  : lookup.status === LookupStatus.FAILED
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {lookup.status}
            </span>
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Created At
          </label>
          <p className="mt-1 text-gray-900">{formatDate(lookup.createdAt)}</p>
        </div>

        {lookup.completedAt && (
          <div>
            <label className="text-sm font-medium text-gray-700">
              Completed At
            </label>
            <p className="mt-1 text-gray-900">
              {formatDate(lookup.completedAt)}
            </p>
          </div>
        )}

        {lookup.error && (
          <div>
            <label className="text-sm font-medium text-gray-700">Error</label>
            <p className="mt-1 text-red-600">{lookup.error}</p>
          </div>
        )}

        {lookup.result && (
          <div>
            <label className="text-sm font-medium text-gray-700">Result</label>
            <pre className="mt-1 p-4 bg-gray-50 rounded-md overflow-auto text-sm">
              {JSON.stringify(lookup.result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}




