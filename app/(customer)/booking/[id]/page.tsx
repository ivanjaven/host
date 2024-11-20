// app/booking/[id]/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Room } from "@/types/room";
import { Calendar } from "@/components/booking/Calendar";
import { GuestSelector } from "@/components/booking/GuestSelector";
import { PersonalInfo } from "@/components/booking/PersonalInfo";
import { PricingSummary } from "@/components/booking/PricingSummary";
import Loading from "@/components/ui/loading";
import Image from "next/image";
import { differenceInDays } from "date-fns";
import * as React from "react";

interface BookingFormData {
  checkIn: Date | null;
  checkOut: Date | null;
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
  personalInfo: {
    firstName: string;
    lastName: string;
    middleName: string;
    mobileNumber: string;
  };
}

const initialFormData: BookingFormData = {
  checkIn: null,
  checkOut: null,
  guests: {
    adults: 1,
    children: 0,
    infants: 0,
  },
  personalInfo: {
    firstName: "",
    lastName: "",
    middleName: "",
    mobileNumber: "",
  },
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BookingPage({ params }: PageProps) {
  const { id } = React.use(params);
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<BookingFormData>(initialFormData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const roomDoc = await getDoc(doc(db, "rooms", id));
        if (roomDoc.exists()) {
          setRoom({ id: roomDoc.id, ...roomDoc.data() } as Room);
        } else {
          router.push("/rooms");
        }
      } catch (error) {
        console.error("Error fetching room:", error);
        router.push("/rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id, router]);

  const calculateTotalPrice = () => {
    if (!room || !formData.checkIn || !formData.checkOut) return 0;
    const nights = differenceInDays(formData.checkOut, formData.checkIn);
    return room.price * nights;
  };

  const handleProceed = () => {
    if (!formData.checkIn || !formData.checkOut) {
      setError("Please select check-in and check-out dates");
      return;
    }

    if (formData.guests.adults < 1) {
      setError("At least one adult is required");
      return;
    }

    if (
      !formData.personalInfo.firstName ||
      !formData.personalInfo.lastName ||
      !formData.personalInfo.mobileNumber
    ) {
      setError("Please fill in all required personal information");
      return;
    }

    // Proceed with booking
    router.push(`/booking/${id}/confirmation`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="large" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-800 font-medium">Room not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Room Preview */}
        <div className="mb-8 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="relative h-[200px] sm:h-[300px] overflow-hidden">
            <Image
              src={room.images.primary}
              alt={`${room.type} ${room.number}`}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-0 p-6 text-white">
              <h1 className="text-2xl sm:text-3xl font-bold">
                {room.type} {room.number}
              </h1>
              <p className="text-lg mt-2 font-medium">
                ₱{room.price.toLocaleString()}/night
              </p>
            </div>
          </div>

          {/* Room Gallery */}
          <div className="p-6 border-t border-gray-100">
            <div className="grid grid-cols-4 gap-4">
              {room.images.gallery.slice(0, 4).map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden"
                >
                  <Image
                    src={image}
                    alt={`Room view ${index + 1}`}
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Section */}
        <div className="relative">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Complete Your Booking
          </h2>
          <p className="text-gray-700 text-sm mb-8">
            Please provide all the required information
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <Calendar
                room={room}
                selectedDates={{
                  checkIn: formData.checkIn,
                  checkOut: formData.checkOut,
                }}
                onDateChange={(dates) => {
                  setFormData((prev) => ({
                    ...prev,
                    ...dates,
                  }));
                }}
              />

              <GuestSelector
                guests={formData.guests}
                onGuestsChange={(guests) => {
                  setFormData((prev) => ({
                    ...prev,
                    guests,
                  }));
                }}
                maxGuests={room.capacity.maxGuests}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <PersonalInfo
                personalInfo={formData.personalInfo}
                onPersonalInfoChange={(personalInfo) => {
                  setFormData((prev) => ({
                    ...prev,
                    personalInfo,
                  }));
                }}
              />

              <PricingSummary
                room={room}
                checkIn={formData.checkIn}
                checkOut={formData.checkOut}
                totalPrice={calculateTotalPrice()}
              />

              <button
                onClick={handleProceed}
                className="w-full py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors
                  shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!formData.checkIn || !formData.checkOut}
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
