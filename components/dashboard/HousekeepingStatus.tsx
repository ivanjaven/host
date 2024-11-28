// components/dashboard/HousekeepingStatus.tsx
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getDatabase, ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";

export function HousekeepingStatus() {
  const [housekeepingData, setHousekeepingData] = useState<{
    activeCleaners: number;
    roomsInQueue: number;
    roomsCleaned: number;
    pendingRooms: number;
  }>({
    activeCleaners: 0,
    roomsInQueue: 0,
    roomsCleaned: 0,
    pendingRooms: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHousekeepingStatus = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(
          usersRef,
          where("role", "==", "housekeeper"),
          where("status", "==", "active"),
          where("archived", "==", false)
        );

        const housekeepersSnapshot = await getDocs(q);

        const database = getDatabase();
        const queueRef = ref(database, "housekeepingQueue");

        onValue(queueRef, (snapshot) => {
          const queueData = snapshot.val() || { queue: [], assignments: {} };
          const assignments = queueData.assignments || {};

          const stats = {
            activeCleaners: housekeepersSnapshot.size,
            roomsInQueue: Object.values(assignments).filter(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (a: any) => a.status === "assigned"
            ).length,
            roomsCleaned: Object.values(assignments).filter(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (a: any) => a.status === "completed"
            ).length,
            pendingRooms: Object.values(assignments).filter(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (a: any) => a.status === "cleaning"
            ).length,
          };

          setHousekeepingData(stats);
        });
      } catch (error) {
        console.error("Error fetching housekeeping status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHousekeepingStatus();
  }, []);

  if (loading) return null;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-6">
        Housekeeping Status
      </h2>

      <div className="grid grid-cols-2 gap-6">
        {[
          {
            label: "Active Cleaners",
            value: housekeepingData.activeCleaners,
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            ),
            color: "blue",
          },
          {
            label: "Rooms in Queue",
            value: housekeepingData.roomsInQueue,
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            ),
            color: "yellow",
          },
          {
            label: "Being Cleaned",
            value: housekeepingData.pendingRooms,
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            ),
            color: "green",
          },
          {
            label: "Completed Today",
            value: housekeepingData.roomsCleaned,
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ),
            color: "green",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
          >
            <div
              className={`p-3 bg-${stat.color}-100 rounded-lg text-${stat.color}-600`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
