// components/dashboard/RoomStatus.tsx
import { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface RoomStatusData {
  name: string;
  value: number;
  color: string;
  description: string;
}

export function RoomStatus() {
  const [statusData, setStatusData] = useState<RoomStatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRooms, setTotalRooms] = useState(0);

  useEffect(() => {
    const fetchRoomStatus = async () => {
      try {
        const database = getDatabase();
        const statusesRef = ref(database, "roomStatuses");

        onValue(statusesRef, (snapshot) => {
          const statuses = snapshot.val() || {};
          const total = Object.keys(statuses).length;
          setTotalRooms(total);

          const counts = {
            occupied: 0,
            vacant: 0,
            cleaning: 0,
            maintenance: 0,
          };

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Object.values(statuses).forEach((status: any) => {
            if (status.occupancy === "Not Vacant") counts.occupied++;
            else if (status.housekeeping === "Cleaning") counts.cleaning++;
            else if (status.maintenanceStatus === "Under Maintenance")
              counts.maintenance++;
            else counts.vacant++;
          });

          setStatusData([
            {
              name: "Occupied",
              value: counts.occupied,
              color: "#EF4444",
              description: "Rooms currently in use by guests",
            },
            {
              name: "Vacant",
              value: counts.vacant,
              color: "#22C55E",
              description: "Available rooms ready for check-in",
            },
            {
              name: "Cleaning",
              value: counts.cleaning,
              color: "#F59E0B",
              description: "Rooms being prepared",
            },
            {
              name: "Maintenance",
              value: counts.maintenance,
              color: "#6B7280",
              description: "Rooms under repair/maintenance",
            },
          ]);
        });
      } catch (error) {
        console.error("Error fetching room status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomStatus();
  }, []);

  if (loading) return null;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Room Status</h2>
          <p className="text-xs text-gray-500 mt-1">
            Total Rooms: {totalRooms}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="w-1/2">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-1/2 space-y-3">
          {statusData.map((status, index) => (
            <div key={index} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: status.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-900">
                    {status.name}
                  </p>
                  <p className="text-xs font-bold text-gray-900">
                    {status.value}
                  </p>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {status.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
