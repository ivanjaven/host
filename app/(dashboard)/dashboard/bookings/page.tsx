// app/dashboard/bookings/page.tsx
"use client";
import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { getDatabase, ref, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { Booking } from "@/types/booking";
import { BookingTable } from "@/components/booking/BookingTable";
import { ConfirmationModal } from "@/components/booking/ConfirmationModal";
import Loading from "@/components/ui/loading";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionType, setActionType] = useState<"accept" | "decline" | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const bookingsRef = collection(db, "bookings");
      const q = query(bookingsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const bookingsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Booking[];
      setBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (booking: Booking) => {
    setSelectedBooking(booking);
    setActionType("accept");
  };

  const handleDecline = async (booking: Booking) => {
    setSelectedBooking(booking);
    setActionType("decline");
  };

  const confirmAction = async () => {
    if (!selectedBooking || !actionType) return;

    setIsProcessing(true);
    try {
      if (actionType === "accept") {
        // Update room status in Realtime Database
        const database = getDatabase();
        const roomStatusRef = ref(
          database,
          `roomStatuses/${selectedBooking.roomType}${selectedBooking.roomNumber}`
        );

        await update(roomStatusRef, {
          reservation: "Reserved",
          occupancy: "Not Vacant",
          bookingReference: selectedBooking.referenceNumber,
          lastUpdated: Date.now(),
        });

        // Update booking status in Firestore
        const bookingRef = doc(db, "bookings", selectedBooking.id);
        await updateDoc(bookingRef, {
          status: "active",
          paymentStatus: "paid",
          updatedAt: serverTimestamp(),
        });

        // Add guest to Firestore
        const guestData = {
          firstName: selectedBooking.guestInfo.firstName,
          lastName: selectedBooking.guestInfo.lastName,
          middleName: selectedBooking.guestInfo.middleName,
          mobileNumber: selectedBooking.guestInfo.mobileNumber,
          checkIn: selectedBooking.checkIn,
          checkOut: selectedBooking.checkOut,
          referenceNumber: selectedBooking.referenceNumber,
          status: "active" as const,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        };

        await addDoc(collection(db, "guests"), guestData);
      } else {
        // Delete booking document
        await deleteDoc(doc(db, "bookings", selectedBooking.id));
      }

      // Refresh bookings list
      await fetchBookings();
      setSelectedBooking(null);
      setActionType(null);
    } catch (error) {
      console.error("Error processing booking:", error);
      setError("Failed to process booking");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage and monitor all bookings
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <BookingTable
          bookings={bookings}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      </div>

      {selectedBooking && actionType && (
        <ConfirmationModal
          booking={selectedBooking}
          actionType={actionType}
          isProcessing={isProcessing}
          onConfirm={confirmAction}
          onClose={() => {
            setSelectedBooking(null);
            setActionType(null);
          }}
        />
      )}
    </div>
  );
}
