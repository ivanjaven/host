// app/dashboard/page.tsx
"use client";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { BookingTrends } from "@/components/dashboard/BookingTrends";
import { RecentBookings } from "@/components/dashboard/RecentBooking";
import { RoomStatus } from "@/components/dashboard/RoomStatus";
import { HousekeepingStatus } from "@/components/dashboard/HousekeepingStatus";
import { RevenueTrends } from "@/components/dashboard/RevenueTrends";
import { useAuthProtection } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { userRole } = useAuthProtection(["admin"]);

  if (!userRole) return null;
  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Hotel performance overview and insights
          </p>
        </div>
        <div className="flex items-center gap-4"></div>
      </div>

      {/* Stats Overview */}
      <StatsOverview />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BookingTrends />
        <RevenueTrends />
      </div>

      {/* Status Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RoomStatus />
        <HousekeepingStatus />
      </div>

      {/* Recent Bookings */}
      <RecentBookings />
    </div>
  );
}
