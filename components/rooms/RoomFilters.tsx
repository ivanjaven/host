// components/rooms/RoomFilters.tsx
import { RoomType, ROOM_TYPES } from "@/types/room";

interface RoomFiltersProps {
  selectedType: RoomType | "All";
  onTypeChange: (type: RoomType | "All") => void;
  onSearch: (query: string) => void;
}

export function RoomFilters({
  selectedType,
  onTypeChange,
  onSearch,
}: RoomFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
      {/* Search Input */}
      <div className="relative w-full sm:w-72">
        <input
          type="text"
          placeholder="Search rooms..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg
            text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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

      {/* Type Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => onTypeChange("All")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${
              selectedType === "All"
                ? "bg-primary text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
        >
          All
        </button>
        {ROOM_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${
                selectedType === type
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}
