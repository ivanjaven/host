// components/rooms/RoomDetails.tsx
import { useRouter } from "next/navigation";
import { Room } from "@/types/room";
import { RoomFeatures } from "./RoomFeatures";
import { RoomAmenitiesList } from "./RoomAmenitiesList";
import { RoomOverview } from "./RoomOverview";
import { RoomGallery } from "./RoomGallery";
import { RoomSuppliesDetails } from "./RoomSuppliesDetails";

interface RoomDetailsProps {
  room: Room;
  isAdmin?: boolean;
}

export function RoomDetails({ room, isAdmin = false }: RoomDetailsProps) {
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => router.push(`/dashboard/rooms/${room.id}/edit`)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <span className="flex items-center gap-2">
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span className="text-sm font-medium">Edit Room</span>
            </span>
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column - Gallery */}
        <RoomGallery
          primaryImage={room.images.primary}
          galleryImages={room.images.gallery}
        />

        {/* Right Column - Details */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              {room.type} {room.number}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-xl font-semibold text-gray-600">
                ₱{room.price.toLocaleString()}
              </p>
              <span className="text-sm text-gray-500">/night</span>
            </div>
          </div>

          <RoomOverview room={room} />

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Description
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              {room.description}
            </p>
          </div>

          <RoomFeatures features={room.features} />

          <RoomAmenitiesList amenities={room.amenities} />

          {!isAdmin && (
            <button
              onClick={() => router.push(`/booking/${room.id}`)}
              className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              Book Now
            </button>
          )}
        </div>
      </div>

      {/* Room Supplies - Admin Only */}
      {isAdmin && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Room Supplies
          </h2>
          <RoomSuppliesDetails supplies={room.supplies} />
        </div>
      )}
    </div>
  );
}
