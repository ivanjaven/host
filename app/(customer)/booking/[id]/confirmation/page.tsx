// app/booking/[id]/confirmation/page.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  collection,
  doc,
  addDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Room } from "@/types/room";
import Loading from "@/components/ui/loading";
import { useReactToPrint } from "react-to-print";
import { BookingConfirmationSlip } from "@/components/booking/BookingConfirmationSlip";
import * as React from "react";
import { generateBookingReference } from "@/utils/referenceGenerator";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BookingConfirmationPage({ params }: PageProps) {
  const { id } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingReference, setBookingReference] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({ contentRef });

  // Fetch room data
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const roomDoc = await getDoc(doc(db, "rooms", id));
        if (roomDoc.exists()) {
          setRoom({ id: roomDoc.id, ...roomDoc.data() } as Room);
        } else {
          setError("Room not found");
          router.push("/rooms");
        }
      } catch (error) {
        console.error("Error fetching room:", error);
        setError("Failed to load room data");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id, router]);

  // Create booking
  useEffect(() => {
    if (!room || !isProcessing) return;

    const createBooking = async () => {
      try {
        const reference = generateBookingReference();
        setBookingReference(reference);

        // Set check-out time to 12 PM
        const checkOut = new Date(searchParams.get("checkOut") || "");
        checkOut.setHours(12, 0, 0, 0);

        const serviceFee = 1000;
        const totalAmount = parseInt(searchParams.get("totalPrice") || "0");

        // Create booking data
        const bookingData = {
          referenceNumber: reference,
          roomId: id,
          roomType: room.type,
          roomNumber: room.number,
          checkIn: new Date(), // Current time
          checkOut: checkOut, // 12 PM on selected date
          guests: {
            adults: parseInt(searchParams.get("adults") || "0"),
            children: parseInt(searchParams.get("children") || "0"),
            infants: parseInt(searchParams.get("infants") || "0"),
          },
          guestInfo: {
            firstName: searchParams.get("firstName"),
            lastName: searchParams.get("lastName"),
            middleName: searchParams.get("middleName") || "",
            mobileNumber: searchParams.get("mobileNumber"),
          },
          totalAmount: totalAmount,
          serviceFee: serviceFee,
          finalTotal: totalAmount + serviceFee,
          status: "pending",
          paymentStatus: "pending",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        // Add booking to Firestore
        await addDoc(collection(db, "bookings"), bookingData);
      } catch (error) {
        console.error("Error creating booking:", error);
        setError("Failed to create booking");
      } finally {
        setIsProcessing(false);
      }
    };

    createBooking();
  }, [room, id, searchParams, isProcessing]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 p-4 bg-red-50 rounded-full">
            <svg
              className="w-8 h-8 text-red-500 mx-auto"
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Booking Failed
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
          >
            Go Back
          </button>
        </div>
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Booking Submitted Successfully!
            </h1>
            <p className="text-gray-600 mt-2">
              Your booking reference is:{" "}
              <span className="font-bold">{bookingReference}</span>
            </p>
            <div className="mt-3">
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-sm
                font-medium bg-yellow-100 text-yellow-800"
              >
                Pending Approval
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Please proceed to the front desk with your booking slip for
              check-in.
            </p>
          </div>

          {/* Booking Slip */}
          <div className="flex justify-center mb-8">
            <div ref={contentRef}>
              <BookingConfirmationSlip
                bookingReference={bookingReference}
                checkInDate={new Date()}
                checkOutDate={new Date(searchParams.get("checkOut") || "")}
                roomType={room?.type || ""}
                roomNumber={room?.number || ""}
                lastName={searchParams.get("lastName") || ""}
                numberOfGuests={
                  parseInt(searchParams.get("adults") || "0") +
                  parseInt(searchParams.get("children") || "0")
                }
                bookingDate={new Date()}
                totalAmount={
                  parseInt(searchParams.get("totalPrice") || "0") + 1000
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                handlePrint()
              }
              disabled={isPrinting}
              className={`px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium
                flex items-center gap-2 transition-colors
                ${
                  isPrinting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-primary-dark"
                }`}
            >
              {isPrinting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Preparing...
                </>
              ) : (
                <>
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
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  Print Booking Slip
                </>
              )}
            </button>
            <button
              onClick={() => router.push("/rooms")}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium
                hover:bg-gray-200 transition-colors"
            >
              Back to Rooms
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
