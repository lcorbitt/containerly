'use client';

import { useState } from 'react';
import { SearchInput } from './components/SearchInput';
import { ResultsPanel } from './components/ResultsPanel';
import { LookupDetail } from './components/LookupDetail';
import { useLogout } from '../(auth)/hooks/useLogout';
import { useCurrentUser } from '../(auth)/hooks/useCurrentUser';

export default function DashboardPage() {
  const [selectedLookupId, setSelectedLookupId] = useState<string | null>(null);
  const { logout } = useLogout();
  const { data: user } = useCurrentUser();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Containerly</h1>
            <div className="flex items-center gap-4">
              {user && (
                <span className="text-sm text-gray-600">{user.email}</span>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <SearchInput />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Recent Lookups</h2>
            <ResultsPanel
              selectedId={selectedLookupId}
              onSelect={setSelectedLookupId}
            />
          </div>

          <div className="bg-white rounded-lg shadow">
            <LookupDetail lookupId={selectedLookupId} />
          </div>
        </div>
      </main>
    </div>
  );
}

