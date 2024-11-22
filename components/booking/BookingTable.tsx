// components/booking/BookingTable.tsx
import { Booking } from "@/types/booking";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";

interface BookingTableProps {
  bookings: Booking[];
  onAccept: (booking: Booking) => void;
  onDecline: (booking: Booking) => void;
}

export function BookingTable({
  bookings,
  onAccept,
  onDecline,
}: BookingTableProps) {
  // Format Firestore timestamp to readable date
  const formatTimestamp = (timestamp: Timestamp) => {
    return format(timestamp.toDate(), "MMM d, yyyy h:mm a");
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = () => {
      switch (status) {
        case "pending":
          return "bg-yellow-100 text-yellow-800";
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
              Reference
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-600">
              Guest Name
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-600">
              Room
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-600">
              Amount
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-600">
              Status
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-600">
              Date
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-gray-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr
              key={booking.id}
              className="border-b border-gray-50 last:border-0"
            >
              <td className="px-6 py-4">
                <span className="text-sm font-medium text-gray-900">
                  {booking.referenceNumber}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-900">
                  {`${booking.guestInfo.firstName} ${booking.guestInfo.lastName}`}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-900">
                  {`${booking.roomType} ${booking.roomNumber}`}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm font-medium text-gray-900">
                  ₱{booking.totalAmount.toLocaleString()}
                </span>
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={booking.status} />
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-500">
                  {formatTimestamp(booking.createdAt as unknown as Timestamp)}
                </span>
              </td>
              <td className="px-6 py-4">
                {booking.status === "pending" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAccept(booking)}
                      className="px-3 py-1 text-xs font-medium text-green-700 bg-green-50
                        rounded-lg hover:bg-green-100 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => onDecline(booking)}
                      className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50
                        rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {bookings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No bookings found</p>
        </div>
      )}
    </div>
  );
}
