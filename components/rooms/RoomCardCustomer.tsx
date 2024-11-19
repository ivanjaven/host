import Image from "next/image";
import { useRouter } from "next/navigation";
import { Room } from "@/types/room";

interface RoomCardCustomerProps {
  room: Room;
}

export function RoomCardCustomer({ room }: RoomCardCustomerProps) {
  const router = useRouter();

  return (
    <div
      className="group cursor-pointer"
      onClick={() => router.push(`/rooms/${room.id}`)}
    >
      {/* Image Container */}
      <div className="relative aspect-[6/4] rounded-2xl overflow-hidden mb-4">
        <Image
          src={room.images.primary}
          alt={`${room.type} ${room.number}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            {`${room.type} ${room.number}`}
          </h3>
          <span className="text-[15px] font-semibold text-gray-900">
            ₱{room.price.toLocaleString()}
          </span>
        </div>

        <p className="text-[12px] text-gray-500 font-semibold">
          Floor {room.floor}
        </p>

        {/* Room Details */}
        <div className="flex items-center gap-4 text-[13px] text-gray-500 pt-1">
          <div className="flex items-center gap-1.5 text-xs border-gray-400 border rounded-lg p-1 px-2 font-semibold">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-2v2m0 0v2"
              />
            </svg>
            <span>{room.capacity.maxGuests}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs border-gray-400 border rounded-lg p-1 px-2 font-semibold">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{room.capacity.bedType}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs border-gray-400 border rounded-lg p-1 px-2 font-semibold">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 8V4m0 0h4M4 4l5 5m11-2V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
            <span>{room.size}m²</span>
          </div>
        </div>
      </div>
    </div>
  );
}
