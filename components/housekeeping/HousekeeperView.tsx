// components/housekeeping/HousekeeperView.tsx
import { Room } from "@/types/room";
import { useHousekeepingQueue } from "@/hooks/useHousekeepingQueue";
import { HousekeepingCard } from "./HouseKeepingCard";
import { HousekeepingHistory } from "./HousekeepingHistory";
import Loading from "../ui/loading";
import { getDatabase, onValue, ref, update } from "firebase/database";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/router";
import { useEffect } from "react";

interface HousekeeperViewProps {
  rooms: Room[];
}

export function HousekeeperView({ rooms }: HousekeeperViewProps) {
  const { assignments, queuePosition, loading } = useHousekeepingQueue();

  const router = useRouter();

  useEffect(() => {
    const database = getDatabase();
    const unsubscribe = onValue(
      ref(database, "housekeepingQueue"),
      (snapshot) => {
        const data = snapshot.val() || { queue: [], assignments: {} };

        if (auth.currentUser && !data.queue.includes(auth.currentUser.uid)) {
          router.push("/dashboard");
        }
      }
    );

    return () => unsubscribe();
  }, [router]);

  const updateAssignmentStatus = async (
    roomId: string,
    status: "cleaning" | "completed"
  ) => {
    const database = getDatabase();

    // Update assignment status
    await update(ref(database, `housekeepingQueue/assignments/${roomId}`), {
      status,
      ...(status === "completed" && { completedAt: Date.now() }),
    });

    // If completing, also update room status
    if (status === "completed") {
      const assignment = assignments[roomId];
      if (assignment) {
        await update(
          ref(
            database,
            `roomStatuses/${assignment.roomType}${assignment.roomNumber}`
          ),
          {
            housekeeping: "Clean",
            lastUpdated: Date.now(),
            updatedBy: auth.currentUser?.uid || "unknown",
          }
        );

        // Add to history
        const historyRef = ref(
          database,
          `housekeepingHistory/${assignment.roomType}${
            assignment.roomNumber
          }/${Date.now()}`
        );
        await update(historyRef, {
          status: "Clean",
          timestamp: Date.now(),
          updatedBy: auth.currentUser?.uid || "unknown",
        });
      }
    }
  };

  if (loading) {
    return <Loading size="large" />;
  }

  const myAssignments = Object.entries(assignments).filter(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ([_, assignment]) =>
      assignment.housekeeperUid === auth.currentUser?.uid &&
      assignment.status !== "completed"
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Your Assignments
        </h2>
        {queuePosition > -1 && (
          <p className="text-sm text-gray-600 mb-4">
            You are #{queuePosition + 1} in the cleaning queue
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myAssignments.map(([roomId, assignment]) => {
            const room = rooms.find(
              (r) =>
                r.number === assignment.roomNumber &&
                r.type === assignment.roomType
            );
            if (!room) return null;

            return (
              <HousekeepingCard
                key={roomId}
                room={{
                  ...room,
                  housekeepingStatus:
                    assignment.status === "assigned" ? "Dirty" : "Cleaning",
                }}
                onUpdateStatus={() => {
                  const newStatus =
                    assignment.status === "assigned" ? "cleaning" : "completed";
                  updateAssignmentStatus(roomId, newStatus);
                }}
              />
            );
          })}
        </div>

        {myAssignments.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-gray-500">
              No rooms assigned to you at the moment
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Updates</h2>
        <HousekeepingHistory rooms={rooms} />
      </div>
    </div>
  );
}
