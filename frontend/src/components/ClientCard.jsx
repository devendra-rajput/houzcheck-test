const STATUS_MAP = {
  1: { label: 'Active', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  0: { label: 'Inactive', className: 'bg-gray-100 text-gray-500 border-gray-200' },
  2: { label: 'Blocked', className: 'bg-red-50 text-red-600 border-red-200' },
  3: { label: 'Deleted', className: 'bg-red-50 text-red-600 border-red-200' },
};

const AVATAR_COLORS = [
  'bg-indigo-500',
  'bg-violet-500',
  'bg-pink-500',
  'bg-rose-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-sky-500',
];

const getInitials = (firstName, lastName) =>
  ((firstName?.[0] ?? '') + (lastName?.[0] ?? '')).toUpperCase() || '?';

const getAvatarColor = (id) => AVATAR_COLORS[(id ?? 0) % AVATAR_COLORS.length];

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function ClientCard({ client }) {
  const status = STATUS_MAP[client.status] ?? STATUS_MAP[0];
  const initials = getInitials(client.first_name, client.last_name);
  const avatarColor = getAvatarColor(client.id);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all duration-200">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center flex-shrink-0`}
          >
            <span className="text-white text-sm font-bold">{initials}</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-sm leading-tight">
              {client.first_name} {client.last_name ?? ''}
            </h3>
            <p className="text-xs text-gray-400 truncate mt-0.5">{client.email}</p>
          </div>
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-1.5 pt-3 border-t border-gray-100">
        {client.organization && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg
              className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span className="truncate">{client.organization.name}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>Joined {formatDate(client.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
