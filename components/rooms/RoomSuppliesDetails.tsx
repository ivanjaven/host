// components/rooms/RoomSuppliesDetails.tsx
import { RoomSupplies } from "@/types/room";

interface RoomSuppliesDetailsProps {
  supplies: RoomSupplies;
}

export function RoomSuppliesDetails({ supplies }: RoomSuppliesDetailsProps) {
  const categories = [
    {
      title: "Toiletries",
      items: supplies.toiletries,
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
          />
        </svg>
      ),
    },
    {
      title: "Bedding",
      items: supplies.bedding,
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
      ),
    },
    {
      title: "Refreshments",
      items: supplies.refreshments,
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-8">
      {categories.map((category) => (
        <div
          key={category.title}
          className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 transition-colors"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400">
              {category.icon}
            </div>
            <h3 className="text-xs font-medium text-gray-600">
              {category.title}
            </h3>
          </div>

          <div className="space-y-3">
            {Object.entries(category.items).map(([item, quantity]) => (
              <div
                key={item}
                className="flex items-center justify-between py-1.5"
              >
                <span className="text-xs text-gray-500">
                  {item
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
                <span className="text-xs font-medium text-gray-700">
                  {quantity}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
