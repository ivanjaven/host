// components/rooms/RoomGallery.tsx
import Image from "next/image";
import { useState } from "react";

interface RoomGalleryProps {
  primaryImage: string;
  galleryImages: string[];
}

export function RoomGallery({ primaryImage, galleryImages }: RoomGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const allImages = [primaryImage, ...galleryImages];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
        <Image
          src={allImages[activeIndex]}
          alt="Room view"
          fill
          className="object-cover"
          priority
        />

        {/* Navigation Arrows */}
        <div className="absolute inset-0 flex items-center justify-between p-4">
          <button
            onClick={() =>
              setActiveIndex((prev) =>
                prev === 0 ? allImages.length - 1 : prev - 1
              )
            }
            className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-900"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={() =>
              setActiveIndex((prev) =>
                prev === allImages.length - 1 ? 0 : prev + 1
              )
            }
            className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-900"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-4">
        {allImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`relative aspect-square rounded-lg overflow-hidden
              ${index === activeIndex ? "ring-2 ring-primary" : ""}
            `}
          >
            <Image
              src={image}
              alt={`Room thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
