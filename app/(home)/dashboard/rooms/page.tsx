// app/dashboard/rooms/page.tsx
"use client";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Room, RoomType } from "@/types/room";
import { RoomCard } from "@/components/rooms/RoomCard";
import { RoomFilters } from "@/components/rooms/RoomFilters";
import Loading from "@/components/ui/loading";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<RoomType | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchRooms = async () => {
      try {
        const roomsRef = collection(db, "rooms");
        const snapshot = await getDocs(roomsRef);

        if (!mounted) return;

        const roomsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            reviews: data.reviews ?? [],
            averageRating: data.averageRating ?? 0,
          } as Room;
        });

        setRooms(roomsData);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        if (mounted) {
          setError("Failed to load rooms");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchRooms();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredRooms = rooms.filter((room) => {
    const matchesType = selectedType === "All" || room.type === selectedType;
    const matchesSearch =
      room.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and monitor all rooms
          </p>
        </div>
        <button
          type="button"
          onClick={() => (window.location.href = "/dashboard/rooms/add")}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium
            hover:bg-primary-dark transition-colors"
        >
          Add Room
        </button>
      </div>

      <RoomFilters
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        onSearch={setSearchQuery}
      />

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>

      {filteredRooms.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No rooms found</p>
        </div>
      )}
    </div>
  );
}
