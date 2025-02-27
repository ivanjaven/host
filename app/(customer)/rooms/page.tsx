// app/rooms/page.tsx
"use client";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getDatabase, ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { Room } from "@/types/room";
import { RoomCardCustomer } from "@/components/rooms/RoomCardCustomer";
import { SearchBar } from "@/components/rooms/SearchBar";
import Loading from "@/components/ui/loading";
import { Filters } from "@/app/(dashboard)/dashboard/rooms/page";

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

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // First get room statuses from Realtime Database
        const database = getDatabase();
        const statusesRef = ref(database, "roomStatuses");
        const statusSnapshot = await get(statusesRef);
        const roomStatuses = statusSnapshot.val();

        // Get all rooms from Firestore
        const roomsRef = collection(db, "rooms");
        const snapshot = await getDocs(roomsRef);

        // Filter rooms based on their status in RTDB
        const roomsData = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            const roomKey = `${data.type}${data.number}`;
            const status = roomStatuses[roomKey];

            // Only include room if it meets all criteria
            if (
              status &&
              status.occupancy === "Vacant" &&
              status.reservation === "Not Reserved" &&
              status.housekeeping === "Clean"
            ) {
              return {
                id: doc.id,
                ...data,
                reviews: data.reviews ?? [],
                averageRating: data.averageRating ?? 0,
              } as Room;
            }
            return null;
          })
          .filter((room): room is Room => room !== null); // Type guard to filter out null values

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

  // Filter rooms based on all filters
  const filteredRooms = rooms.filter((room) => {
    // Type filter
    const matchesType = filters.type === "All" || room.type === filters.type;

    // Guest capacity filter
    const matchesCapacity =
      filters.guestCapacity === "All" ||
      (room.capacity.minGuests <= parseInt(filters.guestCapacity) &&
        room.capacity.maxGuests >= parseInt(filters.guestCapacity));

    // Floor filter
    const matchesFloor =
      filters.floor === "All Floors" || room.floor === parseInt(filters.floor);

    // Search filter
    const searchTerm = filters.search.toLowerCase().trim();
    const matchesSearch =
      !searchTerm ||
      room.number.toLowerCase().includes(searchTerm) ||
      room.type.toLowerCase().includes(searchTerm) ||
      `${room.type} ${room.number}`.toLowerCase().includes(searchTerm);

    return matchesType && matchesCapacity && matchesFloor && matchesSearch;
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
          <h1 className="text-2xl font-bold text-gray-900">Available Rooms</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and book available rooms
          </p>
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-10">
        {filteredRooms.map((room) => (
          <RoomCardCustomer key={room.id} room={room} />
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
