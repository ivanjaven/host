// components/housekeeping/HousekeepingFilters.tsx
interface HousekeepingFiltersProps {
  statusFilter: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onStatusChange: (status: any) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function HousekeepingFilters({
  statusFilter,
  onStatusChange,
  searchTerm,
  onSearchChange,
}: HousekeepingFiltersProps) {
  const statuses = ["All", "Clean", "Cleaning", "Dirty"];

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => onStatusChange(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  statusFilter === status
                    ? "bg-primary text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search rooms..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
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
        </div>
      </div>
    </div>
  );
}
