import { capitalizeFirstLetter } from "@/utils/string";
interface CategoryCardProps {
  category: string;
  items: Record<
    string,
    {
      current_stock: number;
      minimum_threshold: number;
      unit: string;
      status: string;
    }
  >;
  onSelect: () => void;
  isSelected: boolean;
}

export function CategoryCard({
  category,
  items,
  onSelect,
  isSelected,
}: CategoryCardProps) {
  const getCategoryIcon = () => {
    switch (category) {
      case "toiletries":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
          />
        );
      case "bedding":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        );
      case "refreshments":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        );
      default:
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "low":
        return "text-red-500 bg-red-50";
      case "medium":
        return "text-yellow-500 bg-yellow-50";
      case "high":
        return "text-green-500 bg-green-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  return (
    <div
      className={`bg-white rounded-xl p-6 border transition-all duration-200 cursor-pointer
        ${
          isSelected
            ? "border-primary ring-1 ring-primary"
            : "border-gray-100 hover:border-primary/50"
        }`}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {getCategoryIcon()}
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900">
          {capitalizeFirstLetter(category)}
        </h3>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {Object.entries(items).map(([name, data]) => (
          <div
            key={name}
            className="flex items-center justify-between py-2 group hover:bg-gray-50 rounded-lg px-2"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">
                {capitalizeFirstLetter(name.replace(/_/g, " "))}
              </p>
              <p className="text-xs text-gray-500">{data.unit}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {data.current_stock}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                    data.status
                  )}`}
                >
                  {capitalizeFirstLetter(data.status)}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Min: {data.minimum_threshold}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
