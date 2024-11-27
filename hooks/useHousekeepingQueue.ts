// hooks/useHousekeepingQueue.ts
import { useState, useEffect } from "react";
import { getDatabase, ref, onValue, get, update } from "firebase/database";
import { auth } from "@/lib/firebase";
import type { HousekeepingQueue } from "@/types/housekeeping";

export function useHousekeepingQueue() {
  const [assignments, setAssignments] = useState<
    HousekeepingQueue["assignments"]
  >({});
  const [queuePosition, setQueuePosition] = useState<number>(-1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const database = getDatabase();
    const queueRef = ref(database, "housekeepingQueue");

    const unsubscribe = onValue(queueRef, (snapshot) => {
      const data = snapshot.val() as HousekeepingQueue;
      if (data) {
        setAssignments(data.assignments || {});
        // Store currentUser.uid in a variable to ensure it doesn't change
        const uid = currentUser.uid;
        const position = data.queue?.indexOf(uid) ?? -1;
        setQueuePosition(position);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const assignRoom = async (
    roomId: string,
    roomNumber: string,
    roomType: string
  ) => {
    const database = getDatabase();
    const queueRef = ref(database, "housekeepingQueue");

    const snapshot = await get(queueRef);
    const data = snapshot.val() as HousekeepingQueue;

    if (!data.queue?.length) return;

    // Get first housekeeper in queue
    const housekeeperUid = data.queue[0];

    // Move housekeeper to end of queue
    const newQueue = [...data.queue.slice(1), housekeeperUid];

    // Create assignment
    const assignment = {
      housekeeperUid,
      roomNumber,
      roomType,
      status: "assigned",
      assignedAt: Date.now(),
    };

    // Update database
    await update(ref(database), {
      "housekeepingQueue/queue": newQueue,
      [`housekeepingQueue/assignments/${roomId}`]: assignment,
    });
  };

  const updateAssignmentStatus = async (
    roomId: string,
    status: "cleaning" | "completed"
  ) => {
    const database = getDatabase();
    await update(ref(database), {
      [`housekeepingQueue/assignments/${roomId}/status`]: status,
      ...(status === "completed" && {
        [`housekeepingQueue/assignments/${roomId}/completedAt`]: Date.now(),
      }),
    });
  };

  return {
    assignments,
    queuePosition,
    loading,
    assignRoom,
    updateAssignmentStatus,
  };
}
