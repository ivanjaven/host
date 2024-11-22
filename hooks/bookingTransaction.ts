// hooks/useBookingTransaction.ts
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Room } from "@/types/room";
import { generateBookingReference } from "@/utils/referenceGenerator";
import { set12PMTime } from "@/utils/dateHelpers";

interface BookingData {
  room: Room;
  checkIn: Date;
  checkOut: Date;
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
  totalPrice: number;
  serviceFee: number;
}

export function useBookingTransaction() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [bookingReference, setBookingReference] = useState("");

  const createBooking = async (bookingData: BookingData) => {
    setIsProcessing(true);
    setError("");

    try {
      const reference = generateBookingReference();
      const now = new Date();
      const checkOutTime = set12PMTime(bookingData.checkOut);

      // Create booking document
      await addDoc(collection(db, "bookings"), {
        referenceNumber: reference,
        roomId: bookingData.room.id,
        roomType: bookingData.room.type,
        roomNumber: bookingData.room.number,
        checkIn: now,
        checkOut: checkOutTime,
        guests: bookingData.guests,
        guestInfo: bookingData.personalInfo,
        totalAmount: bookingData.totalPrice + bookingData.serviceFee,
        serviceFee: bookingData.serviceFee,
        status: "pending",
        paymentStatus: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setBookingReference(reference);
      return reference;
    } catch (err) {
      console.error("Booking creation error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to process booking");
      }
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    createBooking,
    isProcessing,
    error,
    bookingReference,
  };
}
