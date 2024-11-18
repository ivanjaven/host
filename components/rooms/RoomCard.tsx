// components/rooms/RoomCard.tsx
"use client";
import Image from "next/image";
import { useState } from "react";
import { Room } from "@/types/room";
import { StarRating } from "./StartRating";

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  const [imageError, setImageError] = useState(false);

  const formattedPrice = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(room.price);

  const reviewCount = room.reviews?.length ?? 0;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={
            imageError ? "/images/room-placeholder.jpg" : room.images.primary
          }
          alt={`${room.type} ${room.number}`}
          fill
          className="object-cover hover:scale-105 transition-transform duration-200"
          onError={() => setImageError(true)}
          priority={false}
        />
      </div>

      {/* Content Container */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900">
          {`${room.type} ${room.number}`}
        </h3>

        <p className="text-sm text-gray-600 mt-1">
          {`${room.capacity.minGuests}-${room.capacity.maxGuests} Guests`}
        </p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-primary">
              {formattedPrice}
            </span>
            <span className="text-sm text-gray-500">/night</span>
          </div>
          <StarRating
            rating={room.averageRating ?? 0}
            reviewCount={reviewCount}
          />
        </div>
      </div>
    </div>
  );
}
