// components/housekeeping/HousekeepingHistory.tsx
import { useState, useEffect } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { format } from "date-fns";
import Loading from "@/components/ui/loading";

interface HistoryEntry {
  status: string;
  timestamp: number;
  updatedBy: string;
  roomNumber: string;
  roomType: string;
}

interface HousekeepingHistoryProps {
  rooms: Array<{
    type: string;
    number: string;
  }>;
}

export function HousekeepingHistory({ rooms }: HousekeepingHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const database = getDatabase();
        const historyEntries: HistoryEntry[] = [];

        // Fetch history for each room
        for (const room of rooms) {
          const historyRef = ref(
            database,
            `housekeepingHistory/${room.type}${room.number}`
          );
          const snapshot = await get(historyRef);

          if (snapshot.exists()) {
            const roomHistory = Object.entries(snapshot.val()).map(
              ([, value]) => ({
                ...(value as Omit<HistoryEntry, "roomNumber" | "roomType">),
                roomNumber: room.number,
                roomType: room.type,
              })
            );
            historyEntries.push(...roomHistory);
          }
        }

        // Sort by timestamp, most recent first
        historyEntries.sort((a, b) => b.timestamp - a.timestamp);

        // Take only last 20 entries
        setHistory(historyEntries.slice(0, 20));
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [rooms]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Clean":
        return "bg-green-100 text-green-800";
      case "Cleaning":
        return "bg-yellow-100 text-yellow-800";
      case "Dirty":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <Loading size="medium" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-gray-500">No history available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left border-b border-gray-100">
            <th className="pb-3 text-xs font-semibold text-gray-500">Room</th>
            <th className="pb-3 text-xs font-semibold text-gray-500">Status</th>
            <th className="pb-3 text-xs font-semibold text-gray-500">
              Updated
            </th>
            <th className="pb-3 text-xs font-semibold text-gray-500">By</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {history.map((entry, index) => (
            <tr
              key={`${entry.timestamp}_${index}`}
              className="hover:bg-gray-50"
            >
              <td className="py-3 text-sm text-gray-900">
                {entry.roomType} {entry.roomNumber}
              </td>
              <td className="py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium
                  ${getStatusColor(entry.status)}`}
                >
                  {entry.status}
                </span>
              </td>
              <td className="py-3 text-sm text-gray-500">
                {format(entry.timestamp, "MMM d, h:mm a")}
              </td>
              <td className="py-3 text-sm text-gray-500">{entry.updatedBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
