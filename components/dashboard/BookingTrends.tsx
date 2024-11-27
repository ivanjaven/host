// components/dashboard/BookingTrends.tsx
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  endOfDay,
  startOfDay,
  eachDayOfInterval,
  format,
  subDays,
} from "date-fns";

interface ChartData {
  date: string;
  newBookings: number;
  checkIns: number;
  checkOuts: number;
}

export function BookingTrends() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const startDate = startOfDay(subDays(new Date(), 6));
        const endDate = endOfDay(new Date());

        const bookingsRef = collection(db, "bookings");
        const bookingsQuery = query(bookingsRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(bookingsQuery);

        const days = eachDayOfInterval({ start: startDate, end: endDate });

        const chartData = days.map((day) => {
          const dayStart = startOfDay(day);
          const dayEnd = endOfDay(day);

          const dayBookings = snapshot.docs.filter((doc) => {
            const createdAt = (doc.data().createdAt as Timestamp).toDate();
            return createdAt >= dayStart && createdAt <= dayEnd;
          });

          const newBookings = dayBookings.filter(
            (doc) => doc.data().status === "pending"
          ).length;
          const checkIns = dayBookings.filter(
            (doc) => doc.data().status === "active"
          ).length;
          const checkOuts = dayBookings.filter(
            (doc) => doc.data().status === "checked_out"
          ).length;

          return {
            date: format(day, "MMM dd"),
            newBookings,
            checkIns,
            checkOuts,
          };
        });

        setData(chartData);
      } catch (error) {
        console.error("Error fetching booking trends:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return null;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Booking Trends</h2>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-600">New Bookings</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600">Check-ins</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-gray-600">Check-outs</span>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="newBookings" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="checkIns" fill="#22C55E" radius={[4, 4, 0, 0]} />
            <Bar dataKey="checkOuts" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
