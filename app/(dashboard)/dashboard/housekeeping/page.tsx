// app/dashboard/housekeeping/page.tsx
"use client";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Room } from "@/types/room";
import Loading from "@/components/ui/loading";
import { HousekeeperView } from "@/components/housekeeping/HousekeeperView";
import AdminView from "@/components/housekeeping/AdminView";
import { useAuthProtection } from "@/hooks/useAuth";

export default function HousekeepingPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRoleHouseKeeping, setUserRoleHouseKeeping] = useState<
    string | null
  >(null);

  useEffect(() => {
    // Get user role from localStorage (set during login)
    const role = localStorage.getItem("userRole");
    setUserRoleHouseKeeping(role);
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomsRef = collection(db, "rooms");
        const snapshot = await getDocs(roomsRef);
        const roomsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Room[];
        setRooms(roomsData);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        setError("Failed to load rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const { userRole } = useAuthProtection(["admin", "housekeeper"]);

  if (!userRole) return null;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 lg:p-10">
      {userRoleHouseKeeping === "housekeeper" ? (
        <HousekeeperView rooms={rooms} />
      ) : (
        <AdminView />
      )}
    </div>
  );
}
