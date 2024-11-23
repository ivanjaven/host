// components/housekeeping/HousekeepingCard.tsx
import Image from "next/image";
import { Room } from "@/types/room";

interface RoomWithStatus extends Room {
  housekeepingStatus: string;
  lastUpdated?: number;
  updatedBy?: string;
}

interface HousekeepingCardProps {
  room: RoomWithStatus;
  onUpdateStatus: () => void; // Add this prop
}

export function HousekeepingCard({
  room,
  onUpdateStatus,
}: HousekeepingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Clean":
        return "bg-green-100 text-green-800";
      case "Cleaning":
        return "bg-yellow-100 text-yellow-800";
      case "Dirty":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="relative aspect-video">
        <Image
          src={room.images.primary}
          alt={room.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-0 p-4">
          <h3 className="text-lg font-bold text-white">
            {room.type} {room.number}
          </h3>
          <p className="text-sm text-white/90">Floor {room.floor}</p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onUpdateStatus}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
              ${getStatusColor(room.housekeepingStatus)} hover:opacity-80`}
          >
            {room.housekeepingStatus}
          </button>
          <span className="text-sm text-gray-500">
            {room.capacity.maxGuests} max guests
          </span>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          {room.lastUpdated && (
            <p>Last updated: {new Date(room.lastUpdated).toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  );
}
