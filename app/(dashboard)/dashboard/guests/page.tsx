"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Guest } from "@/types/guest";
import { GuestTable } from "@/components/guests/GuestTable";
import Loading from "@/components/ui/loading";
import { startOfDay, startOfWeek, startOfMonth } from "date-fns";

type TimeFilter = "day" | "week" | "month" | "all";

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("day");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    checkedOut: 0,
  });

  useEffect(() => {
    fetchGuests();
  }, [timeFilter]);

  const getTimeFilterDate = (filter: TimeFilter) => {
    const now = new Date();
    switch (filter) {
      case "day":
        return startOfDay(now);
      case "week":
        return startOfWeek(now);
      case "month":
        return startOfMonth(now);
      default:
        return null;
    }
  };

  const fetchGuests = async () => {
    try {
      const guestsRef = collection(db, "guests");
      let q = query(guestsRef, orderBy("created_at", "desc"));

      const filterDate = getTimeFilterDate(timeFilter);
      if (filterDate) {
        q = query(q, where("created_at", ">=", filterDate));
      }

      const snapshot = await getDocs(q);
      const guestsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Guest[];

      // Calculate stats
      const stats = {
        total: guestsData.length,
        active: guestsData.filter((g) => g.status === "active").length,
        checkedOut: guestsData.filter((g) => g.status === "checked_out").length,
      };

      setStats(stats);
      setGuests(guestsData);
    } catch (error) {
      console.error("Error fetching guests:", error);
      setError("Failed to load guests");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8">
      {/* Header with Search and Time Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guests</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor current and past hotel guests
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
            {(["day", "week", "month", "all"] as TimeFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors
                  ${
                    timeFilter === filter
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                {filter === "all" ? "All Time" : `This ${filter}`}
              </button>
            ))}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search guests..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Guests"
          value={stats.total}
          icon={
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
          color="blue"
        />
        <StatCard
          title="Currently Checked In"
          value={stats.active}
          icon={
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          color="green"
        />
        <StatCard
          title="Checked Out"
          value={stats.checkedOut}
          icon={
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          }
          color="purple"
        />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* Active Guests */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Active Guests
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Currently checked-in guests
              </p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              {guests.filter((g) => g.status === "active").length} active
            </span>
          </div>
        </div>
        <GuestTable
          guests={guests.filter((g) => g.status === "active")}
          type="active"
        />
      </div>

      {/* Checked Out Guests */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Past Guests
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Guests who have checked out
              </p>
            </div>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
              {guests.filter((g) => g.status === "checked_out").length} checked
              out
            </span>
          </div>
        </div>
        <GuestTable
          guests={guests.filter((g) => g.status === "checked_out")}
          type="checked_out"
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "yellow" | "green" | "purple";
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    yellow: "bg-yellow-50 text-yellow-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
}
