"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Room } from "@/types/room";
import { RoomDetailsCustomer } from "@/components/rooms/RoomDetailsCustomer";
import Loading from "@/components/ui/loading";
import * as React from "react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function RoomDetailsPage({ params }: PageProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Use React.use to handle the Promise
  const { id } = React.use(params);

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

  return <RoomDetailsCustomer room={room} />;
}
