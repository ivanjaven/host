// app/dashboard/page.tsx
"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { PieChart, Pie, Cell } from "recharts";

const statsData = [
  {
    title: "New Booking",
    value: "172",
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
  },
  {
    title: "Available Room",
    value: "103",
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
  },
  {
    title: "Check In",
    value: "71",
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
          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
        />
      </svg>
    ),
  },
  {
    title: "Check Out",
    value: "29",
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
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
    ),
  },
];
const reservationData = [
  { day: "MON", newBooking: 45, confirmed: 35, checkIn: 40, checkOut: 60 },
  { day: "TUE", newBooking: 30, confirmed: 25, checkIn: 80, checkOut: 30 },
  { day: "WED", newBooking: 40, confirmed: 35, checkIn: 70, checkOut: 65 },
  { day: "THU", newBooking: 50, confirmed: 75, checkIn: 30, checkOut: 70 },
  { day: "FRI", newBooking: 60, confirmed: 45, checkIn: 50, checkOut: 45 },
  { day: "SAT", newBooking: 65, confirmed: 30, checkIn: 70, checkOut: 40 },
  { day: "SUN", newBooking: 45, confirmed: 40, checkIn: 60, checkOut: 90 },
];

const housekeepingData = [
  { name: "Clean", value: 70, color: "#3B82F6" },
  { name: "Cleaning", value: 18, color: "#F97316" },
  { name: "Dirty", value: 15, color: "#EF4444" },
];

export default function DashboardPage() {
  return (
    <div className="p-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900">Yellow Star Hotel</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        {statsData.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Booking Schedule */}
        <div className="bg-white rounded-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-900">
              Recent Booking Schedule
            </h2>
            <div className="flex items-center gap-6">
              <button className="p-1 hover:bg-gray-50 rounded-full">
                <svg
                  className="w-5 h-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <span className="text-sm font-medium text-gray-900">
                {"October"}
              </span>
              <button className="p-1 hover:bg-gray-50 rounded-full">
                <svg
                  className="w-5 h-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-8">
            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
              <div
                key={day}
                className="text-xs font-medium text-gray-400 text-center"
              >
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm
                  ${i === 2 ? "bg-primary text-white" : "hover:bg-gray-50"}`}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Booking Table */}
          <div className="space-y-4">
            <div className="grid grid-cols-5 text-xs font-medium text-gray-400 pb-2">
              <div>Name</div>
              <div>Room</div>
              <div>No.</div>
              <div>Duration</div>
              <div>Check Out</div>
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-5 text-sm text-gray-600 py-3 border-b border-gray-100"
              >
                <div className="font-medium text-gray-900">Mrs. Lyodya</div>
                <div>Deluxe</div>
                <div>#31</div>
                <div>3D 2N</div>
                <div>6 Sep 2023</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Reservation Stats */}
          <div className="bg-white rounded-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-gray-900">
                Reservation Stats
              </h2>
              <button className="p-1 hover:bg-gray-50 rounded-full">
                <svg
                  className="w-5 h-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reservationData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Bar
                    dataKey="newBooking"
                    fill="#FFD700"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="confirmed"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar dataKey="checkIn" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar
                    dataKey="checkOut"
                    fill={`#FF69B4`}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-8 mt-6">
              {[
                { label: "New Booking", color: "#FFD700" },
                { label: "Confirmed Booking", color: "#10B981" },
                { label: "Check In", color: "#3B82F6" },
                { label: "Check Out", color: `#FF69B4` },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Housekeeping Status */}
          <div className="bg-white rounded-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-gray-900">Housekeeping</h2>
              <button className="p-1 hover:bg-gray-50 rounded-full">
                <svg
                  className="w-5 h-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="relative h-44 w-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={housekeepingData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {housekeepingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">103</span>
                  <span className="text-xs text-gray-500">Total Rooms</span>
                </div>
              </div>
              <div className="space-y-4">
                {housekeepingData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600">{item.name}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl p-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-3">{value}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-primary">{icon}</div>
        </div>
      </div>
    </div>
  );
}
