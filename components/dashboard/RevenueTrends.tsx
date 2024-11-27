// components/dashboard/RevenueTrends.tsx
import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  subMonths,
} from "date-fns";

interface RevenueData {
  date: string;
  revenue: number;
  target: number;
}

export function RevenueTrends() {
  const [data, setData] = useState<RevenueData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const startDate = startOfMonth(subMonths(new Date(), 2));
        const endDate = endOfMonth(new Date());

        const bookingsRef = collection(db, "bookings");
        const revenueQuery = query(bookingsRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(revenueQuery);

        const days = eachDayOfInterval({ start: startDate, end: endDate });
        let runningTotal = 0;

        const revenueData = days.map((day) => {
          const dayStart = startOfMonth(day);
          const dayEnd = endOfMonth(day);

          const dayRevenue = snapshot.docs.reduce((sum, doc) => {
            const createdAt = (doc.data().createdAt as Timestamp).toDate();
            if (createdAt >= dayStart && createdAt <= dayEnd) {
              return sum + (doc.data().totalAmount || 0);
            }
            return sum;
          }, 0);

          runningTotal += dayRevenue;

          return {
            date: format(day, "MMM yyyy"),
            revenue: dayRevenue,
            target: 100000, // Example target
          };
        });

        setTotalRevenue(runningTotal);
        setData(revenueData);
      } catch (error) {
        console.error("Error fetching revenue data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, []);

  if (loading) return null;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Revenue Trends</h2>
          <p className="text-sm text-gray-500">
            Total Revenue: ₱{totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-gray-600">Actual Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <span className="text-sm text-gray-600">Target Revenue</span>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => `₱${value.toLocaleString()}`} />
            <Tooltip
              formatter={(value: number) => [
                `₱${value.toLocaleString()}`,
                "Amount",
              ]}
              labelFormatter={(label) => `Period: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#FF69B4"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="#E5E7EB"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
