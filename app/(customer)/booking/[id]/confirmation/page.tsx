"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Room } from "@/types/room";
import Loading from "@/components/ui/loading";
import { BookingDetails } from "@/components/booking/BookingDetails";
import { useSearchParams } from "next/navigation";
import * as React from "react";

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

  // Get booking details from URL params
  const bookingDetails = {
    checkIn: new Date(searchParams.get("checkIn") || ""),
    checkOut: new Date(searchParams.get("checkOut") || ""),
    guests: {
      adults: parseInt(searchParams.get("adults") || "0"),
      children: parseInt(searchParams.get("children") || "0"),
      infants: parseInt(searchParams.get("infants") || "0"),
    },
    personalInfo: {
      firstName: searchParams.get("firstName") || "",
      lastName: searchParams.get("lastName") || "",
      middleName: searchParams.get("middleName") || "",
      mobileNumber: searchParams.get("mobileNumber") || "",
    },
    totalPrice: parseInt(searchParams.get("totalPrice") || "0"),
  };

  useEffect(() => {
    // Validate required parameters
    const requiredParams = [
      "checkIn",
      "checkOut",
      "adults",
      "firstName",
      "lastName",
      "mobileNumber",
      "totalPrice",
    ];

    const missingParams = requiredParams.filter(
      (param) => !searchParams.get(param)
    );

    if (missingParams.length > 0) {
      console.error("Missing required parameters:", missingParams);
      router.push(`/booking/${id}`);
      return;
    }

    // Validate date formats
    const checkIn = new Date(searchParams.get("checkIn") || "");
    const checkOut = new Date(searchParams.get("checkOut") || "");

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      console.error("Invalid date format");
      router.push(`/booking/${id}`);
      return;
    }

    // Validate numeric values
    const adults = parseInt(searchParams.get("adults") || "0");
    const totalPrice = parseInt(searchParams.get("totalPrice") || "0");

    if (adults < 1 || totalPrice <= 0) {
      console.error("Invalid numeric values");
      router.push(`/booking/${id}`);
      return;
    }
  }, [id, router, searchParams]);

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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <BookingDetails room={room} booking={bookingDetails} />
      </div>
    </div>
  );
}
