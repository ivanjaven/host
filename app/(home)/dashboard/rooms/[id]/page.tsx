// app/dashboard/rooms/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Room } from "@/types/room";
import { RoomDetails } from "@/components/rooms/RoomDetails";
import Loading from "@/components/ui/loading";

export default function RoomDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const roomDoc = await getDoc(doc(db, "rooms", params.id));
        if (roomDoc.exists()) {
          setRoom({ id: roomDoc.id, ...roomDoc.data() } as Room);
        } else {
          router.push("/dashboard/rooms");
        }
      } catch (error) {
        console.error("Error fetching room:", error);
        router.push("/dashboard/rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [params.id, router]);

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

  return <RoomDetails room={room} isAdmin />;
}
