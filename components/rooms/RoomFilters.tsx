// components/rooms/RoomFilters.tsx
import { useState } from "react";
import { RoomType, ROOM_TYPES } from "@/types/room";

interface RoomFiltersProps {
  onFiltersChange: (filters: {
    type: RoomType | "All";
    priceRange: [number, number];
    guestCount: number;
  }) => void;
}

export function RoomFilters({ onFiltersChange }: RoomFiltersProps) {
  const [type, setType] = useState<RoomType | "All">("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([1000, 50000]);
  const [guestCount, setGuestCount] = useState(2);

  const handleTypeChange = (newType: RoomType | "All") => {
    setType(newType);
    onFiltersChange({ type: newType, priceRange, guestCount });
  };

  const handlePriceChange = (newRange: [number, number]) => {
    setPriceRange(newRange);
    onFiltersChange({ type, priceRange: newRange, guestCount });
  };

  const handleGuestChange = (newCount: number) => {
    setGuestCount(newCount);
    onFiltersChange({ type, priceRange, guestCount: newCount });
  };

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg shadow-sm mb-6">
      {/* Type Selection */}
      <div className="flex-1">
        <label className="block text-sm text-gray-600 mb-2">Type</label>
        <select
          value={type}
          onChange={(e) => handleTypeChange(e.target.value as RoomType | "All")}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="All">All Types</option>
          {ROOM_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="flex-1">
        <label className="block text-sm text-gray-600 mb-2">Price Range</label>
        <select
          value={`${priceRange[0]}-${priceRange[1]}`}
          onChange={(e) => {
            const [min, max] = e.target.value.split("-").map(Number);
            handlePriceChange([min, max]);
          }}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="1000-50000">₱1,000 - ₱50,000</option>
          <option value="50000-100000">₱50,000 - ₱100,000</option>
          <option value="100000-200000">₱100,000 - ₱200,000</option>
        </select>
      </div>

      {/* Guest Count */}
      <div className="flex-1">
        <label className="block text-sm text-gray-600 mb-2">Guests</label>
        <select
          value={guestCount}
          onChange={(e) => handleGuestChange(Number(e.target.value))}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <option key={num} value={num}>
              {num} Guests
            </option>
          ))}
        </select>
      </div>

      {/* Search Button */}
      <button
        className="px-6 py-2 bg-primary text-white rounded-lg mt-auto"
        onClick={() => onFiltersChange({ type, priceRange, guestCount })}
      >
        Search
      </button>
    </div>
  );
}
