// components/rooms/SearchBar.tsx
import { FilterInput } from "./FilterInput";
import { ROOM_TYPES } from "@/types/room";
import { Filters } from "@/app/(home)/dashboard/rooms/page";

interface SearchBarProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  onReset: () => void;
}

export function SearchBar({
  filters,
  onFilterChange,
  onReset,
}: SearchBarProps) {
  const handleFilterChange = (key: keyof Filters, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Filter Title */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Filter Rooms</h2>
        <p className="text-sm text-gray-500">Filter rooms by type and search</p>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4">
        {/* Room Type Filter */}
        <div className="w-48">
          <FilterInput
            label="Room Type"
            value={filters.type}
            placeholder="Select type"
            options={["All", ...ROOM_TYPES]}
            onChange={(value) => handleFilterChange("type", value)}
          />
        </div>

        {/* Price Range Filter */}
        <div className="w-48">
          <FilterInput
            label="Price Range"
            value={filters.priceRange}
            placeholder="Select price range"
            options={[
              "₱1,000 - ₱50,000",
              "₱50,000 - ₱100,000",
              "₱100,000 - ₱200,000",
            ]}
            onChange={(value) => handleFilterChange("priceRange", value)}
          />
        </div>

        {/* Floor Filter */}
        <div className="w-48">
          <FilterInput
            label="Floor"
            value={filters.floor}
            placeholder="Select floor"
            options={["All Floors", "1", "2", "3", "4", "5"]}
            onChange={(value) => handleFilterChange("floor", value)}
          />
        </div>

        {/* Search Input */}
        <div className="flex-1 min-w-[200px]">
          <FilterInput
            label="Search"
            value={filters.search}
            placeholder="Search by room number or type..."
            onChange={(value) => handleFilterChange("search", value)}
            isSearch
          />
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={onReset}
            className="px-4 py-4 text-sm text-gray-600 bg-gray-100 rounded-lg font font-semibold
              hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
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
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
