// components/guests/GuestTable.tsx
import { Guest, GuestStatus } from "@/types/guest";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";

interface GuestTableProps {
  guests: Guest[];
  type: "active" | "checked_out";
}

export function GuestTable({ guests, type }: GuestTableProps) {
  const formatTimestamp = (timestamp: Timestamp) => {
    return format(timestamp.toDate(), "MMM d, yyyy h:mm a");
  };

  const StatusBadge = ({ status }: { status: GuestStatus }) => {
    const getStatusColor = () => {
      switch (status) {
        case "active":
          return "bg-green-100 text-green-800";
        case "checked_out":
          return "bg-gray-100 text-gray-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-y border-gray-100">
            <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-left">
              Guest Name
            </th>
            <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-left">
              Reference Number
            </th>
            <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-left">
              Contact
            </th>
            <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-left">
              Check In
            </th>
            <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-left">
              Check Out
            </th>
            <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-left">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {guests.map((guest) => (
            <tr
              key={guest.id}
              className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
            >
              <td className="px-6 py-4">
                <div>
                  <span className="text-xs font-medium text-gray-900">
                    {`${guest.firstName} ${guest.lastName}`}
                  </span>
                  {guest.middleName && (
                    <span className="text-[11px] text-gray-500 block mt-0.5">
                      {guest.middleName}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-xs font-medium text-gray-900">
                  {guest.referenceNumber}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-xs text-gray-600">
                  {guest.mobileNumber}
                </span>
              </td>
              <td className="px-6 py-4">
                <div>
                  <span className="text-[11px] text-gray-900">
                    {formatTimestamp(guest.checkIn)}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div>
                  <span className="text-[11px] text-gray-900">
                    {formatTimestamp(guest.checkOut)}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={guest.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {guests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xs text-gray-500">
            {type === "active" ? "No active guests" : "No checked out guests"}
          </p>
        </div>
      )}
    </div>
  );
}
