// components/housekeeping/HousekeepingStats.tsx
interface HousekeepingStatsProps {
  stats: {
    total: number;
    clean: number;
    cleaning: number;
    dirty: number;
  };
}

export function HousekeepingStats({ stats }: HousekeepingStatsProps) {
  const statItems = [
    {
      label: "Total Rooms",
      value: stats.total,
      icon: (
        <svg
          className="w-6 h-6"
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
      ),
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Clean Rooms",
      value: stats.clean,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Being Cleaned",
      value: stats.cleaning,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ),
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      label: "Needs Cleaning",
      value: stats.dirty,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
      bgColor: "bg-red-50",
      textColor: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stat.value}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.textColor}`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
