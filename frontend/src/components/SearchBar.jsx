import { useState, useMemo, useRef, useEffect } from 'react';

const HighlightMatch = ({ text, query }) => {
  if (!query) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-indigo-100 text-indigo-700 not-italic rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
};

export default function SearchBar({ clients, onSearch }) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const suggestions = useMemo(() => {
    if (!inputValue.trim()) return [];
    const q = inputValue.toLowerCase();
    return clients
      .filter((c) => {
        const fullName = `${c.first_name} ${c.last_name || ''}`.toLowerCase();
        return fullName.includes(q);
      })
      .slice(0, 8);
  }, [clients, inputValue]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    onSearch(val);
    setIsOpen(true);
  };

  const handleSelect = (client) => {
    const fullName = `${client.first_name} ${client.last_name || ''}`.trim();
    setInputValue(fullName);
    onSearch(fullName);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputValue('');
    onSearch('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full sm:w-80">
      {/* Input */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={() => inputValue.trim() && setIsOpen(true)}
          placeholder="Search by client name..."
          className="w-full pl-9 pr-8 py-2.5 text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-20 w-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <ul className="max-h-64 overflow-y-auto py-1">
            {suggestions.map((client) => {
              const fullName = `${client.first_name} ${client.last_name || ''}`.trim();
              return (
                <li key={client.id}>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(client)}
                    className="w-full px-4 py-2.5 text-left hover:bg-indigo-50 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-600 text-xs font-semibold">
                        {(client.first_name?.[0] ?? '').toUpperCase()}
                        {(client.last_name?.[0] ?? '').toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        <HighlightMatch text={fullName} query={inputValue} />
                      </p>
                      <p className="text-xs text-gray-400 truncate">{client.email}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
