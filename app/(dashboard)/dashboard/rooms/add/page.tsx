// app/dashboard/rooms/add/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getDatabase, ref as rtdbRef, set } from "firebase/database";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Room, RoomType, BedType } from "@/types/room";
import { FormSection } from "@/components/forms/FormSection";
import { Input } from "@/components/forms/Input";
import { Select } from "@/components/forms/Select";
import { Checkbox } from "@/components/forms/Checkbox";
import { ImageUpload } from "@/components/forms/ImageUpload";
import { RoomSupplies } from "@/components/forms/RoomSupplies";
import { FeatureToggle } from "@/components/forms/FeatureToggle";
import {
  ROOM_TYPES,
  BED_TYPES,
  ROOM_FEATURES,
  DEFAULT_ROOM_DATA,
} from "@/constants/room";

export default function AddRoomPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [primaryImage, setPrimaryImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [primaryImagePreview, setPrimaryImagePreview] = useState<string>("");
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [formData, setFormData] =
    useState<Omit<Room, "id" | "created_at" | "updated_at">>(DEFAULT_ROOM_DATA);

  const validateForm = (): string | null => {
    // Basic Information validation
    if (!formData.number.trim()) {
      return "Room number is required";
    }
    if (!formData.floor || formData.floor <= 0) {
      return "Valid floor number is required";
    }
    if (!formData.size || formData.size <= 0) {
      return "Valid room size is required";
    }

    // Room Capacity validation
    if (formData.capacity.minGuests <= 0) {
      return "Minimum guests must be greater than 0";
    }
    if (formData.capacity.maxGuests <= formData.capacity.minGuests) {
      return "Maximum guests must be greater than minimum guests";
    }

    // Room Status validation
    if (formData.price <= 0) {
      return "Valid price is required";
    }

    // Primary Image validation
    if (!primaryImage) {
      return "Primary image is required";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (!primaryImage) {
        throw new Error("Primary image is required");
      }

      // Upload primary image
      const primaryImageRef = ref(
        storage,
        `rooms/${Date.now()}_${primaryImage.name}`
      );
      await uploadBytes(primaryImageRef, primaryImage);
      const primaryImageUrl = await getDownloadURL(primaryImageRef);

      // Upload gallery images
      const galleryUrls = await Promise.all(
        galleryImages.map(async (image) => {
          const imageRef = ref(storage, `rooms/${Date.now()}_${image.name}`);
          await uploadBytes(imageRef, image);
          return getDownloadURL(imageRef);
        })
      );

      // Create a new document reference to get the ID
      const roomsRef = collection(db, "rooms");
      const newRoomRef = doc(roomsRef);
      const newRoomId = newRoomRef.id;

      const roomData = {
        ...formData,
        id: newRoomId,
        name: `${formData.type}${formData.number}`,
        features: formData.features,
        images: {
          primary: primaryImageUrl,
          gallery: galleryUrls,
        },
        reviews: [],
        averageRating: 0,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      await setDoc(newRoomRef, roomData);

      // Save status to Realtime DB
      const rtdb = getDatabase();
      await set(
        rtdbRef(rtdb, `roomStatuses/${formData.type}${formData.number}`),
        {
          maintenanceStatus: "Operational",
          occupancy: "Vacant",
          reservation: "Not Reserved",
          housekeeping: "Clean",
          lastUpdated: Date.now(),
          updatedBy: auth.currentUser?.uid || "system",
        }
      );

      router.push("/dashboard/rooms");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error adding room:", error);
      setError(error.message);
      setIsLoading(false);
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
      const newFiles = Array.from(files);
      setGalleryImages((prev) => [...prev, ...newFiles]);

      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setGalleryPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeGalleryImage = (index: number) => {
    const newImages = galleryImages.filter((_, i) => i !== index);
    const newPreviews = galleryPreviews.filter((_, i) => i !== index);

    setGalleryImages(newImages);
    setGalleryPreviews(newPreviews);

    // Reset the file input
    const fileInput = document.querySelector(
      'input[type="file"][multiple]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Add New Room</h1>
          <p className="text-xs text-gray-500">
            Create a new room with complete details
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
            disabled={isLoading}
            className="px-3 py-1.5 text-xs font-medium text-white bg-primary border border-transparent rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? "Adding..." : "Add Room"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
          {error}
        </div>
      )}
      <div className="space-y-6 ">
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
            <Input
              label="Room Number"
              type="text"
              value={formData.number}
              onChange={(value) => {
                const newNumber = value as string;
                setFormData({
                  ...formData,
                  number: newNumber,
                  // Create combined name
                  name: `${formData.type} ${newNumber}`,
                });
              }}
              required
            />
            <Select<RoomType>
              label="Room Type"
              value={formData.type}
              onChange={(value) => {
                setFormData({
                  ...formData,
                  type: value,
                  // Update name when type changes
                  name: `${value} ${formData.number}`,
                });
              }}
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
            />
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
                preview={primaryImagePreview}
                nextImage={true}
                required
              />
              <p className="text-xs text-gray-500">
                Main display image for the room
              </p>
            </div>
            <div className="space-y-2">
              <ImageUpload
                label="Gallery Images"
                onChange={handleGalleryImagesChange}
                multiple
              />
              <p className="text-xs text-gray-500">
                Additional room photos (optional)
              </p>
              {galleryPreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {galleryPreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={preview}
                        alt={`Gallery ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
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
