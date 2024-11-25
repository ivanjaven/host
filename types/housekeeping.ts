// types/housekeeping.ts
export interface HousekeepingAssignment {
  housekeeperUid: string;
  roomNumber: string;
  roomType: string;
  status: "assigned" | "cleaning" | "completed";
  assignedAt: number;
  startedCleaning?: number | null;
  completedAt?: number | null;
}

export interface HousekeepingQueue {
  queue: string[];
  assignments: {
    [roomId: string]: HousekeepingAssignment;
  };
}
