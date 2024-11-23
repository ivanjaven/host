// components/housekeeping/UpdateStatusModal.tsx
import { useState } from "react";
import Loading from "@/components/ui/loading";
import { Room } from "@/types/room";

type HousekeepingStatus = "Clean" | "Cleaning" | "Dirty";

interface RoomWithStatus extends Room {
  housekeepingStatus: string;
  lastUpdated?: number;
  updatedBy?: string;
}

interface UpdateStatusModalProps {
  room: RoomWithStatus;
  onUpdate: (
    room: RoomWithStatus,
    newStatus: HousekeepingStatus
  ) => Promise<void>;
  onClose: () => void;
  isUpdating: boolean;
}

export function UpdateStatusModal({
  room,
  onUpdate,
  onClose,
  isUpdating,
}: UpdateStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<HousekeepingStatus>(
    room.housekeepingStatus as HousekeepingStatus
  );

  const statuses: Array<{
    value: HousekeepingStatus;
    label: string;
    description: string;
    color: string;
    icon: JSX.Element;
  }> = [
    {
      value: "Clean",
      label: "Clean",
      description: "Room is clean and ready for guests",
      color: "bg-green-50 text-green-700 border-green-200",
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
    },
    {
      value: "Cleaning",
      label: "Cleaning in Progress",
      description: "Room is currently being cleaned",
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
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
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ),
    },
    {
      value: "Dirty",
      label: "Needs Cleaning",
      description: "Room requires cleaning",
      color: "bg-red-50 text-red-700 border-red-200",
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Update Room Status
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {room.type} {room.number} - Floor {room.floor}
          </p>
        </div>

        <div className="space-y-3">
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => setSelectedStatus(status.value)}
              className={`w-full p-4 rounded-lg border transition-colors flex items-start gap-3
                ${
                  selectedStatus === status.value
                    ? status.color
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  selectedStatus === status.value ? "bg-white/50" : "bg-white"
                }`}
              >
                {status.icon}
              </div>
              <div className="text-left">
                <div className="font-medium">{status.label}</div>
                <div className="text-sm opacity-75">{status.description}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50
              rounded-lg transition-colors"
            disabled={isUpdating}
          >
            Cancel
          </button>
          <button
            onClick={() => onUpdate(room, selectedStatus)}
            disabled={isUpdating || selectedStatus === room.housekeepingStatus}
            className="px-4 py-2 text-sm font-medium text-white bg-primary
              hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-50
              disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUpdating ? (
              <>
                <Loading size="small" color="white" />
                Updating...
              </>
            ) : (
              "Update Status"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
