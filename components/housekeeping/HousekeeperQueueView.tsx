// components/housekeeping/HousekeeperQueueView.tsx
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { HousekeepingQueue } from "@/types/housekeeping";
import type { User } from "@/types/user";

interface HousekeeperQueueViewProps {
  queue: string[];
  assignments: HousekeepingQueue["assignments"];
}

export function HousekeeperQueueView({
  queue,
  assignments,
}: HousekeeperQueueViewProps) {
  const [housekeepers, setHousekeepers] = useState<Record<string, User>>({});

  useEffect(() => {
    const fetchHousekeepers = async () => {
      if (!queue.length) return;

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("uid", "in", queue));
      const snapshot = await getDocs(q);

      const housekeeperData = {} as Record<string, User>;
      snapshot.forEach((doc) => {
        housekeeperData[doc.data().uid] = { id: doc.id, ...doc.data() } as User;
      });

      setHousekeepers(housekeeperData);
    };

    fetchHousekeepers();
  }, [queue]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Cleaning Queue</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {queue.map((uid, index) => {
          const housekeeper = housekeepers[uid];
          if (!housekeeper) return null;

          // Find current assignment
          const currentAssignment = Object.values(assignments).find(
            (a) => a.housekeeperUid === uid && a.status !== "completed"
          );

          return (
            <div
              key={uid}
              className="p-4 rounded-lg border border-gray-200 bg-gray-50"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900">
                    {housekeeper.firstName} {housekeeper.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
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
                <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                  <p className="text-sm text-gray-600">Currently cleaning:</p>
                  <p className="text-sm font-medium text-gray-900">
                    {currentAssignment.roomType} {currentAssignment.roomNumber}
                  </p>
                  <p className="text-xs text-gray-500">
                    Started:{" "}
                    {new Date(
                      currentAssignment.assignedAt
                    ).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {queue.length === 0 && (
        <p className="text-center text-gray-500 py-4">
          No housekeepers in queue
        </p>
      )}
    </div>
  );
}
