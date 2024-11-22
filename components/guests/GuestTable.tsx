// components/guests/GuestTable.tsx
import { Guest, GuestStatus } from "@/types/guest";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";

interface GuestTableProps {
  guests: Guest[];
}

export function GuestTable({ guests }: GuestTableProps) {
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
          <tr className="text-left border-b border-gray-100">
            <th className="px-6 py-4 text-xs font-semibold text-gray-600">
              Guest Name
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-600">
              Reference Number
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-600">
              Contact
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-600">
              Check In
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-600">
              Check Out
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-600">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {guests.map((guest) => (
            <tr
              key={guest.id}
              className="border-b border-gray-50 last:border-0"
            >
              <td className="px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {`${guest.firstName} ${guest.lastName}`}
                  </p>
                  {guest.middleName && (
                    <p className="text-xs text-gray-500">{guest.middleName}</p>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm font-medium text-gray-900">
                  {guest.referenceNumber}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-600">
                  {guest.mobileNumber}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-600">
                  {formatTimestamp(guest.checkIn)}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-600">
                  {formatTimestamp(guest.checkOut)}
                </span>
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
          <p className="text-gray-500">No guests found</p>
        </div>
      )}
    </div>
  );
}
