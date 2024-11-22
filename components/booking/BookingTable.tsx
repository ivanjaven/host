// components/booking/BookingTable.tsx
import { Booking } from "@/types/booking";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";

interface BookingTableProps {
  bookings: Booking[];
  onAccept: (booking: Booking) => void;
  onDecline: (booking: Booking) => void;
  onCheckout: (booking: Booking) => void;
  type: "pending" | "active" | "completed";
}

export function BookingTable({
  bookings,
  onAccept,
  onDecline,
  onCheckout,
  type,
}: BookingTableProps) {
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
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${getStatusColor()}`}
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
              Reference
            </th>
            <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-left">
              Guest Name
            </th>
            <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-left">
              Room
            </th>
            <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-left">
              Amount
            </th>
            <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-left">
              Status
            </th>
            <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-left">
              Date
            </th>
            {(type === "pending" || type === "active") && (
              <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-left">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {bookings.map((booking) => (
            <tr
              key={booking.id}
              className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
            >
              <td className="px-6 py-4">
                <span className="text-xs font-medium text-gray-900">
                  {booking.referenceNumber}
                </span>
              </td>
              <td className="px-6 py-4">
                <div>
                  <span className="text-xs font-medium text-gray-900">
                    {`${booking.guestInfo.firstName} ${booking.guestInfo.lastName}`}
                  </span>
                  <span className="text-[11px] text-gray-500 block mt-0.5">
                    {booking.guestInfo.mobileNumber}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div>
                  <span className="text-xs text-gray-900">
                    {`${booking.roomType} ${booking.roomNumber}`}
                  </span>
                  <span className="text-[11px] text-gray-500 block mt-0.5">
                    Room {booking.roomNumber}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div>
                  <span className="text-xs font-medium text-gray-900">
                    ₱{booking.totalAmount.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-gray-500 block mt-0.5">
                    Paid
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={booking.status} />
              </td>
              <td className="px-6 py-4">
                <div>
                  <span className="text-[11px] text-gray-900">
                    {formatTimestamp(booking.createdAt as unknown as Timestamp)}
                  </span>
                  {type === "active" && (
                    <span className="text-[11px] text-gray-500 block mt-0.5">
                      Check-out:{" "}
                      {formatTimestamp(
                        booking.checkOut as unknown as Timestamp
                      )}
                    </span>
                  )}
                </div>
              </td>
              {type === "pending" && (
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAccept(booking)}
                      className="px-3 py-1.5 text-[11px] font-medium text-green-700 bg-green-50
                        rounded-md hover:bg-green-100 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => onDecline(booking)}
                      className="px-3 py-1.5 text-[11px] font-medium text-red-700 bg-red-50
                        rounded-md hover:bg-red-100 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </td>
              )}
              {type === "active" && (
                <td className="px-6 py-4">
                  <button
                    onClick={() => onCheckout(booking)}
                    className="px-3 py-1.5 text-[11px] font-medium text-blue-700 bg-blue-50
                      rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1"
                  >
                    <svg
                      className="w-3.5 h-3.5"
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
                    Check Out
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {bookings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xs text-gray-500">
            {type === "pending" && "No pending bookings"}
            {type === "active" && "No active bookings"}
            {type === "completed" && "No completed bookings"}
          </p>
        </div>
      )}
    </div>
  );
}
