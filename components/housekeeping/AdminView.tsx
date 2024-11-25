"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getDatabase, ref, get, update, onValue } from "firebase/database";
import { db, auth } from "@/lib/firebase";
import { Room } from "@/types/room";
import Loading from "@/components/ui/loading";
import { HousekeepingCard } from "@/components/housekeeping/HouseKeepingCard";
import { HousekeepingStats } from "@/components/housekeeping/HouseKeepingStats";
import { HousekeepingFilters } from "@/components/housekeeping/HousekeepingFilters";
import { UpdateStatusModal } from "@/components/housekeeping/UpdateStatusModal";
import { HousekeepingHistory } from "@/components/housekeeping/HousekeepingHistory";

type HousekeepingStatus = "Clean" | "Cleaning" | "Dirty" | "All";

interface RoomWithStatus extends Room {
  housekeepingStatus: string;
  lastUpdated?: number;
  updatedBy?: string;
}

interface HousekeeperQueueData {
  queue: string[];
  assignments: {
    [roomId: string]: {
      housekeeperUid: string;
      roomNumber: string;
      roomType: string;
      status: "assigned" | "cleaning" | "completed";
      assignedAt: number;
      completedAt?: number;
    };
  };
}

interface Housekeeper {
  id: string;
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

export default function AdminView() {
  const [rooms, setRooms] = useState<RoomWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<HousekeepingStatus>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<RoomWithStatus | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [queueData, setQueueData] = useState<HousekeeperQueueData>({
    queue: [],
    assignments: {},
  });
  const [housekeepers, setHousekeepers] = useState<Housekeeper[]>([]);

  // Fetch housekeepers
  useEffect(() => {
    const fetchHousekeepers = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(
          usersRef,
          where("role", "==", "housekeeper"),
          where("status", "==", "active")
        );
        const snapshot = await getDocs(q);
        const housekeepersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Housekeeper[];
        setHousekeepers(housekeepersData);
      } catch (error) {
        console.error("Error fetching housekeepers:", error);
      }
    };

    fetchHousekeepers();
  }, []);

  // Subscribe to queue updates
  useEffect(() => {
    const database = getDatabase();
    const queueRef = ref(database, "housekeepingQueue");

    const unsubscribe = onValue(queueRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setQueueData(data);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchRooms = async () => {
    try {
      // Get room statuses from Realtime Database
      const database = getDatabase();
      const statusesRef = ref(database, "roomStatuses");
      const statusSnapshot = await get(statusesRef);
      const roomStatuses = statusSnapshot.val();

      // Get all rooms from Firestore
      const roomsRef = collection(db, "rooms");
      const snapshot = await getDocs(roomsRef);

      // Combine room data with housekeeping status
      const roomsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        const roomKey = `${data.type}${data.number}`;
        const status = roomStatuses[roomKey];

        return {
          id: doc.id,
          ...data,
          housekeepingStatus: status?.housekeeping || "Dirty",
          lastUpdated: status?.lastUpdated,
          updatedBy: status?.updatedBy,
        } as RoomWithStatus;
      });

      setRooms(roomsData);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setError("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleUpdateStatus = async (
    room: RoomWithStatus,
    newStatus: HousekeepingStatus
  ) => {
    setIsUpdating(true);
    try {
      const database = getDatabase();
      const roomStatusRef = ref(
        database,
        `roomStatuses/${room.type}${room.number}`
      );

      await update(roomStatusRef, {
        housekeeping: newStatus,
        lastUpdated: Date.now(),
        updatedBy: auth.currentUser?.uid || "unknown",
      });

      // Create history entry
      const historyRef = ref(
        database,
        `housekeepingHistory/${room.type}${room.number}/${Date.now()}`
      );
      await update(historyRef, {
        status: newStatus,
        timestamp: Date.now(),
        updatedBy: auth.currentUser?.uid || "unknown",
      });

      // Refresh rooms data
      await fetchRooms();
      setIsUpdateModalOpen(false);
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Failed to update room status");
    } finally {
      setIsUpdating(false);
    }
  };

  // Calculate stats
  const stats = {
    total: rooms.length,
    clean: rooms.filter((room) => room.housekeepingStatus === "Clean").length,
    cleaning: rooms.filter((room) => room.housekeepingStatus === "Cleaning")
      .length,
    dirty: rooms.filter((room) => room.housekeepingStatus === "Dirty").length,
  };

  // Filter rooms based on status and search
  const filteredRooms = rooms.filter((room) => {
    const matchesStatus =
      statusFilter === "All" || room.housekeepingStatus === statusFilter;
    const matchesSearch =
      searchTerm === "" ||
      `${room.type} ${room.number}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Housekeeping</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor and manage room cleaning status
          </p>
        </div>

        <button
          onClick={() => {
            /* Add function to generate cleaning schedule */
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg
            hover:bg-primary-dark transition-colors flex items-center gap-2"
        >
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Create Schedule
        </button>
      </div>

      {/* Stats Overview */}
      <HousekeepingStats stats={stats} />

      {/* Queue Overview */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Cleaning Queue</h2>
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            {queueData.queue.length} housekeepers
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {queueData.queue.map((uid, index) => {
            const housekeeper = housekeepers.find((h) => h.uid === uid);
            if (!housekeeper) return null;

            const currentAssignment = Object.entries(
              queueData.assignments
            ).find(
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              ([_, a]) => a.housekeeperUid === uid && a.status !== "completed"
            );

            return (
              <div key={uid} className="p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {housekeeper.firstName} {housekeeper.lastName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Queue Position: #{index + 1}
                    </p>
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      currentAssignment ? "bg-yellow-400" : "bg-green-400"
                    }`}
                  />
                </div>

                {currentAssignment && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-900">Currently cleaning:</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {currentAssignment[1].roomType}{" "}
                      {currentAssignment[1].roomNumber}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Started:{" "}
                      {new Date(
                        currentAssignment[1].assignedAt
                      ).toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <HousekeepingFilters
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      )}

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRooms.map((room) => (
          <HousekeepingCard
            key={room.id}
            room={room}
            onUpdateStatus={() => {
              setSelectedRoom(room);
              setIsUpdateModalOpen(true);
            }}
          />
        ))}
      </div>

      {filteredRooms.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No rooms found</p>
        </div>
      )}

      {/* History Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Updates</h2>
        <HousekeepingHistory rooms={rooms} />
      </div>

      {/* Update Status Modal */}
      {isUpdateModalOpen && selectedRoom && (
        <UpdateStatusModal
          room={selectedRoom}
          onUpdate={handleUpdateStatus}
          onClose={() => setIsUpdateModalOpen(false)}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
}
