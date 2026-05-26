import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchClients } from '../api/clients.api';
import SearchBar from '../components/SearchBar';
import ClientList from '../components/ClientList';

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce: wait 400ms after user stops typing before firing the API
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: clients = [], isPending, error } = useQuery({
    queryKey: ['clients', debouncedSearch],
    queryFn: () => fetchClients(debouncedSearch),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">H</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">HouzeCheck</span>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isPending ? 'Loading...' : `${clients.length} clients`}
            </p>
          </div>
          <SearchBar
            clients={clients}
            onSearch={setSearchQuery}
          />
        </div>

        <ClientList
          clients={clients}
          isPending={isPending}
          error={error}
          searchQuery={searchQuery}
        />
      </main>
    </div>
  );
}
