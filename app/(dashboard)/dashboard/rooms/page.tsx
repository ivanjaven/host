// app/dashboard/rooms/page.tsx
"use client";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Room, RoomType } from "@/types/room";
import { RoomCard } from "@/components/rooms/RoomCard";
import { SearchBar } from "@/components/rooms/SearchBar";
import Loading from "@/components/ui/loading";
import { useAuthProtection } from "@/hooks/useAuth";

export type Filters = {
  type: RoomType | "All";
  guestCapacity: string;
  floor: string;
  search: string;
};

const initialFilters: Filters = {
  type: "All",
  guestCapacity: "All",
  floor: "All Floors",
  search: "",
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<Filters>(initialFilters);

  // Fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        console.log("Fetching rooms...");
        const roomsRef = collection(db, "rooms");
        const snapshot = await getDocs(roomsRef);
        console.log(
          "Raw snapshot:",
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );

        const roomsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("Processing room:", { id: doc.id, ...data });
          return {
            id: doc.id,
            ...data,
            reviews: data.reviews ?? [],
            averageRating: data.averageRating ?? 0,
          } as Room;
        });

        console.log("Processed rooms:", roomsData);
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

  // Log rooms whenever they change
  useEffect(() => {
    console.log("Current rooms:", rooms);
  }, [rooms]);

  // Filter rooms based on all filters
  const filteredRooms = rooms.filter((room) => {
    console.log("Room being filtered:", {
      number: room.number,
      type: room.type,
      price: room.price,
      floor: room.floor,
    });

    // Type filter
    const matchesType = filters.type === "All" || room.type === filters.type;
    console.log("Type filter:", {
      roomType: room.type,
      filterType: filters.type,
      matchesType,
    });

    // Guest capacity filter
    const matchesCapacity =
      filters.guestCapacity === "All" ||
      (room.capacity.minGuests <= parseInt(filters.guestCapacity) &&
        room.capacity.maxGuests >= parseInt(filters.guestCapacity));

    // Floor filter
    const matchesFloor =
      filters.floor === "All Floors" || room.floor === parseInt(filters.floor);
    console.log("Floor filter:", {
      roomFloor: room.floor,
      filterFloor: filters.floor,
      matchesFloor,
    });

    // Search filter
    const searchTerm = filters.search.toLowerCase().trim();
    const matchesSearch =
      !searchTerm ||
      room.number.toLowerCase().includes(searchTerm) ||
      room.type.toLowerCase().includes(searchTerm) ||
      `${room.type} ${room.number}`.toLowerCase().includes(searchTerm);
    console.log("Search filter:", { searchTerm, matchesSearch });

    const matches =
      matchesType && matchesFloor && matchesSearch && matchesCapacity;
    console.log("Final result:", matches);

    return matches;
  });

  // Log filtered rooms
  useEffect(() => {
    console.log("Filtered rooms:", filteredRooms);
  }, [filteredRooms]);

  const { userRole } = useAuthProtection(["admin"]);

  if (!userRole) return null;

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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <SearchBar
          filters={filters}
          onFilterChange={setFilters}
          onReset={() => setFilters(initialFilters)}
        />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
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
