// app/dashboard/rooms/[id]/edit/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  getDatabase,
  ref as databaseRef,
  set,
  get,
  remove,
} from "firebase/database"; // Changed rtdbRef to databaseRef
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage"; // Added storageRef
import { auth, db, storage } from "@/lib/firebase";
import { Room, RoomType, BedType } from "@/types/room";
import { FormSection } from "@/components/forms/FormSection";
import { Input } from "@/components/forms/Input";
import { Select } from "@/components/forms/Select";
import { Checkbox } from "@/components/forms/Checkbox";
import { ImageUpload } from "@/components/forms/ImageUpload";
import { RoomSupplies } from "@/components/forms/RoomSupplies";
import { FeatureToggle } from "@/components/forms/FeatureToggle";
import Loading from "@/components/ui/loading";
import { useAvailableRoomNumbers } from "@/hooks/useAvailableRoomNumbers";
import Image from "next/image";
import {
  ROOM_TYPES,
  BED_TYPES,
  ROOM_FEATURES,
  DEFAULT_ROOM_DATA,
} from "@/constants/room";
// import {
//   markRoomNumberAsAvailable,
//   markRoomNumberAsUsed,
// } from "@/utils/roomNumbers";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditRoomPage({ params }: PageProps) {
  const { id } = React.use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const [primaryImage, setPrimaryImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [primaryImagePreview, setPrimaryImagePreview] = useState<string>("");
  const { availableNumbers, loading: loadingNumbers } =
    useAvailableRoomNumbers();
  const [formData, setFormData] =
    useState<Omit<Room, "id" | "created_at" | "updated_at">>(DEFAULT_ROOM_DATA);

  // Fetch room data
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const roomDoc = await getDoc(doc(db, "rooms", id));
        if (roomDoc.exists()) {
          const roomData = { id: roomDoc.id, ...roomDoc.data() } as Room;
          setRoom(roomData);
          setFormData(roomData);
          setPrimaryImagePreview(roomData.images.primary);
        } else {
          router.push("/dashboard/rooms");
        }
      } catch (error) {
        console.error("Error fetching room:", error);
        setError("Failed to load room data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [id, router]);

  const validateForm = (): string | null => {
    if (!formData.number.trim()) {
      return "Room number is required";
    }
    if (!formData.floor || formData.floor <= 0) {
      return "Valid floor number is required";
    }
    if (!formData.size || formData.size <= 0) {
      return "Valid room size is required";
    }
    if (formData.capacity.minGuests <= 0) {
      return "Minimum guests must be greater than 0";
    }
    if (formData.capacity.maxGuests <= formData.capacity.minGuests) {
      return "Maximum guests must be greater than minimum guests";
    }
    if (formData.price <= 0) {
      return "Valid price is required";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!room) {
      setError("Room data not found");
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      // Handle image uploads if new images are selected
      const updatedImages = { ...formData.images };

      if (primaryImage) {
        const primaryImageRef = storageRef(
          storage,
          `rooms/${Date.now()}_${primaryImage.name}`
        );
        await uploadBytes(primaryImageRef, primaryImage);
        updatedImages.primary = await getDownloadURL(primaryImageRef);
      }

      if (galleryImages.length > 0) {
        const galleryUrls = await Promise.all(
          galleryImages.map(async (image) => {
            const imageRef = storageRef(
              storage,
              `rooms/${Date.now()}_${image.name}`
            );
            await uploadBytes(imageRef, image);
            return getDownloadURL(imageRef);
          })
        );
        updatedImages.gallery = [...formData.images.gallery, ...galleryUrls];
      }

      // Handle room number change if it was updated
      if (formData.number !== room.number) {
        // Update Firestore room numbers statuses
        const roomNumbersRef = doc(db, "config", "roomNumbers");
        await updateDoc(roomNumbersRef, {
          [`numbers.${room.number}.used`]: false,
          [`numbers.${formData.number}.used`]: true,
        });

        // Update RTDB
        const database = getDatabase();
        const oldStatusRef = databaseRef(
          database,
          `roomStatuses/${room.type}${room.number}`
        );
        const newStatusRef = databaseRef(
          database,
          `roomStatuses/${formData.type}${formData.number}`
        );

        const snapshot = await get(oldStatusRef);

        if (snapshot.exists()) {
          // Save status to new path using RTDB set
          await set(newStatusRef, {
            ...snapshot.val(),
            lastUpdated: Date.now(),
            updatedBy: auth.currentUser?.uid || "system",
          });
          // Remove old path
          await remove(oldStatusRef);
        }
      }

      // Update room document in Firestore
      const roomRef = doc(db, "rooms", id);
      const updateData = {
        ...formData,
        name: `${formData.type}${formData.number}`,
        images: updatedImages,
        updated_at: serverTimestamp(),
      };

      await updateDoc(roomRef, updateData);

      router.push(`/dashboard/rooms/${id}`);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An error occurred while updating the room");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrimaryImageChange = (files: FileList | null) => {
    if (files && files[0]) {
      setPrimaryImage(files[0]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrimaryImagePreview(reader.result as string);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleGalleryImagesChange = (files: FileList | null) => {
    if (files) {
      setGalleryImages(Array.from(files));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-lg text-gray-600">Room not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit Room</h1>
          <p className="text-xs text-gray-500">
            Update room information and details
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-3 py-1.5 text-xs font-medium text-white bg-primary border border-transparent rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <FormSection
          title="Basic Information"
          icon={
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        >
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Room Number"
              value={formData.number}
              onChange={(value) => {
                setFormData({
                  ...formData,
                  number: value,
                  name: `${formData.type}${value}`,
                });
              }}
              options={[
                room.number,
                ...availableNumbers.filter((num) => num !== room.number),
              ]}
              required
              disabled={loadingNumbers}
            />
            <Select<RoomType>
              label="Room Type"
              value={formData.type}
              onChange={(value) => setFormData({ ...formData, type: value })}
              options={ROOM_TYPES}
              required
            />
            <Input
              label="Floor"
              type="number"
              value={formData.floor || ""}
              onChange={(value) =>
                setFormData({ ...formData, floor: Number(value) })
              }
              min={1}
              required
            />
            <Input
              label="Size (sqm)"
              type="number"
              value={formData.size || ""}
              onChange={(value) =>
                setFormData({ ...formData, size: Number(value) })
              }
              min={1}
              required
            />{" "}
            <Input
              label="Price"
              type="number"
              value={formData.price || ""}
              onChange={(value) =>
                setFormData({ ...formData, price: Number(value) })
              }
              min={1}
              suffix="/night"
              required
            />
          </div>
        </FormSection>

        {/* Reuse all the other form sections from the add page */}
        <FormSection
          title="Room Description"
          icon={
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
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          }
        >
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Enter room description..."
            className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            rows={4}
          />
        </FormSection>

        <FormSection
          title="Room Capacity"
          icon={
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
        >
          <div className="grid grid-cols-3 gap-4">
            <Select<BedType>
              label="Bed Type"
              value={formData.capacity.bedType}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  capacity: { ...formData.capacity, bedType: value },
                })
              }
              options={BED_TYPES}
              required
            />
            <Input
              label="Min Guests"
              type="number"
              value={formData.capacity.minGuests}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  capacity: { ...formData.capacity, minGuests: Number(value) },
                })
              }
              min={1}
              required
            />
            <Input
              label="Max Guests"
              type="number"
              value={formData.capacity.maxGuests}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  capacity: { ...formData.capacity, maxGuests: Number(value) },
                })
              }
              min={2}
              required
            />
          </div>
        </FormSection>

        <FormSection
          title="Room Features"
          icon={
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
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          }
        >
          <FeatureToggle
            features={ROOM_FEATURES}
            selectedFeatures={formData.features}
            onToggle={(feature) => {
              const features = formData.features.includes(feature)
                ? formData.features.filter((f) => f !== feature)
                : [...formData.features, feature];
              setFormData({ ...formData, features });
            }}
          />
        </FormSection>

        <FormSection
          title="Amenities"
          icon={
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
                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
              />
            </svg>
          }
        >
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(formData.amenities).map(([key, value]) => (
              <Checkbox
                key={key}
                label={key.replace(/([A-Z])/g, " $1").trim()}
                checked={value}
                onChange={(checked) =>
                  setFormData({
                    ...formData,
                    amenities: { ...formData.amenities, [key]: checked },
                  })
                }
              />
            ))}
          </div>
        </FormSection>

        <FormSection
          title="Room Images"
          icon={
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <ImageUpload
                label="Primary Image"
                onChange={handlePrimaryImageChange}
                preview={primaryImagePreview || room.images.primary}
                nextImage={true}
                required
              />
              <p className="text-xs text-gray-500">
                Main display image for the room
              </p>
            </div>
            <div className="space-y-2">
              <ImageUpload
                label="Add Gallery Images"
                onChange={handleGalleryImagesChange}
                multiple
              />
              <p className="text-xs text-gray-500">
                Additional room photos (optional)
              </p>

              {/* Display existing gallery images */}
              {formData.images.gallery.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {formData.images.gallery.map((url, index) => (
                    <div key={index} className="relative aspect-square">
                      <div className="relative w-full h-full">
                        <Image
                          src={url}
                          alt={`Gallery ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newGallery = formData.images.gallery.filter(
                            (_, i) => i !== index
                          );
                          setFormData({
                            ...formData,
                            images: {
                              ...formData.images,
                              gallery: newGallery,
                            },
                          });
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Room Supplies"
          icon={
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
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          }
        >
          <RoomSupplies
            supplies={formData.supplies}
            onSuppliesChange={(supplies) =>
              setFormData({ ...formData, supplies })
            }
          />
        </FormSection>
      </div>
    </div>
  );
}
