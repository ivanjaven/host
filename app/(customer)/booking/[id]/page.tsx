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
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
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

  useEffect(() => {
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const adults = searchParams.get("adults");
    const children = searchParams.get("children");
    const infants = searchParams.get("infants");
    const firstName = searchParams.get("firstName");
    const lastName = searchParams.get("lastName");
    const middleName = searchParams.get("middleName");
    const mobileNumber = searchParams.get("mobileNumber");

    if (checkIn && checkOut) {
      setFormData((prev) => ({
        ...prev,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        guests: {
          adults: adults ? parseInt(adults) : prev.guests.adults,
          children: children ? parseInt(children) : prev.guests.children,
          infants: infants ? parseInt(infants) : prev.guests.infants,
        },
        personalInfo: {
          firstName: firstName || prev.personalInfo.firstName,
          lastName: lastName || prev.personalInfo.lastName,
          middleName: middleName || prev.personalInfo.middleName,
          mobileNumber: mobileNumber || prev.personalInfo.mobileNumber,
        },
      }));
    }
  }, [searchParams]);

  const calculateTotalPrice = () => {
    if (!room || !formData.checkIn || !formData.checkOut) return 0;
    const nights = differenceInDays(formData.checkOut, formData.checkIn);

    // Return 0 if trying to check out on same day
    if (nights <= 0) return 0;

    return room.price * nights;
  };

  const handleProceed = () => {
    setError("");

    // Validate room exists
    if (!room) {
      setError("Room information not available");
      return;
    }

    // Create an array to collect all validation errors
    const errors: string[] = [];

    // Validate dates
    if (!formData.checkIn || !formData.checkOut) {
      errors.push("Please select both check-in and check-out dates");
    } else {
      const nights = differenceInDays(formData.checkOut, formData.checkIn);
      if (nights <= 0) {
        errors.push(
          "Check-out date must be at least one day after check-in date"
        );
      }
    }

    // Validate guests
    if (formData.guests.adults < 1) {
      errors.push("At least one adult is required");
    }

    const totalGuests = formData.guests.adults + formData.guests.children;
    if (totalGuests > room.capacity.maxGuests) {
      errors.push(
        `Maximum ${room.capacity.maxGuests} guests allowed for this room`
      );
    }

    // Validate personal information
    if (!formData.personalInfo.firstName.trim()) {
      errors.push("First name is required");
    }

    if (!formData.personalInfo.lastName.trim()) {
      errors.push("Last name is required");
    }

    if (!formData.personalInfo.mobileNumber.trim()) {
      errors.push("Mobile number is required");
    } else {
      // Remove any spaces or special characters
      const cleanNumber = formData.personalInfo.mobileNumber.replace(/\D/g, "");

      // Check if number starts with 09 and has exactly 11 digits
      const phoneRegex = /^09\d{9}$/;
      if (!phoneRegex.test(cleanNumber)) {
        errors.push(
          "Mobile number must start with 09 and be 11 digits long (e.g., 09123456789)"
        );
      }
    }

    // If there are any validation errors, display them and stop
    if (errors.length > 0) {
      setError(errors.join("\n"));
      // Scroll to the error message
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // All validations passed, proceed with the booking
    try {
      // Additional check for type safety
      if (!formData.checkIn || !formData.checkOut) {
        throw new Error("Invalid dates");
      }

      const params = new URLSearchParams({
        checkIn: formData.checkIn.toISOString(),
        checkOut: formData.checkOut.toISOString(),
        adults: formData.guests.adults.toString(),
        children: formData.guests.children.toString(),
        infants: formData.guests.infants.toString(),
        firstName: formData.personalInfo.firstName,
        lastName: formData.personalInfo.lastName,
        middleName: formData.personalInfo.middleName || "",
        mobileNumber: formData.personalInfo.mobileNumber,
        totalPrice: calculateTotalPrice().toString(),
      });

      router.push(`/booking/${id}/confirmation?${params.toString()}`);
    } catch (error) {
      setError(
        "An error occurred while processing your booking. Please try again."
      );
      console.error("Booking error:", error);
    }
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
        {/* Back Button */}
        <button
          onClick={() => router.push("/rooms")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
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
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
              <div className="flex gap-3">
                <div className="text-red-500">
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
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">
                    Please fix the following errors:
                  </h3>
                  <div className="mt-2 text-sm text-red-700 space-y-1">
                    {error.split("\n").map((err, index) => (
                      <p key={index}>• {err}</p>
                    ))}
                  </div>
                </div>
              </div>
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
