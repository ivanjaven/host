// components/dashboard/StatsOverview.tsx
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getDatabase, ref, get } from "firebase/database";
import { db } from "@/lib/firebase";

interface StatsData {
  totalBookings: number;
  activeBookings: number;
  totalGuests: number;
  availableRooms: number;
  totalRevenue: number;
  occupancyRate: number;
}

export function StatsOverview() {
  const [stats, setStats] = useState<StatsData>({
    totalBookings: 0,
    activeBookings: 0,
    totalGuests: 0,
    availableRooms: 0,
    totalRevenue: 0,
    occupancyRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch bookings
        const bookingsRef = collection(db, "bookings");
        const activeQuery = query(bookingsRef, where("status", "==", "active"));
        const [allBookings, activeBookings] = await Promise.all([
          getDocs(bookingsRef),
          getDocs(activeQuery),
        ]);

        // Fetch room statuses
        const database = getDatabase();
        const statusesRef = ref(database, "roomStatuses");
        const statusSnapshot = await get(statusesRef);
        const roomStatuses = statusSnapshot.val() || {};

        // Calculate stats
        const available = Object.values(roomStatuses).filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (status: any) =>
            status.occupancy === "Vacant" &&
            status.reservation === "Not Reserved"
        ).length;

        const totalRooms = Object.keys(roomStatuses).length;
        const occupancyRate = ((totalRooms - available) / totalRooms) * 100;

        // Calculate total revenue
        const revenue = allBookings.docs.reduce((sum, doc) => {
          const data = doc.data();
          return sum + (data.totalAmount || 0);
        }, 0);

        setStats({
          totalBookings: allBookings.size,
          activeBookings: activeBookings.size,
          totalGuests: activeBookings.docs.reduce((sum, doc) => {
            const data = doc.data();
            return (
              sum + (data.guests?.adults || 0) + (data.guests?.children || 0)
            );
          }, 0),
          availableRooms: available,
          totalRevenue: revenue,
          occupancyRate,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        {
          label: "Total Bookings",
          value: stats.totalBookings,
          icon: (
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          ),
          color: "blue",
        },
        {
          label: "Active Guests",
          value: stats.totalGuests,
          icon: (
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ),
          color: "green",
        },
        {
          label: "Available Rooms",
          value: stats.availableRooms,
          icon: (
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          ),
          color: "yellow",
        },
        {
          label: "Total Revenue",
          value: `₱${stats.totalRevenue.toLocaleString()}`,
          icon: (
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          color: "green",
        },
        {
          label: "Occupancy Rate",
          value: `${Math.round(stats.occupancyRate)}%`,
          icon: (
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          ),
          color: "purple",
        },
      ].map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stat.value}
              </p>
            </div>
            <div
              className={`p-3 bg-${stat.color}-50 rounded-xl text-${stat.color}-600`}
            >
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
