// components/guests/GuestDetailsModal.tsx
import { Guest } from "@/types/guest";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";

interface GuestDetailsModalProps {
  guest: Guest;
  onClose: () => void;
}

export function GuestDetailsModal({ guest, onClose }: GuestDetailsModalProps) {
  const formatTimestamp = (timestamp: Timestamp) => {
    return format(timestamp.toDate(), "MMM d, yyyy h:mm a");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Guest Details</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Guest Name</h4>
            <p className="text-sm text-gray-900 mt-1">
              {`${guest.firstName} ${
                guest.middleName ? guest.middleName + " " : ""
              }${guest.lastName}`}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">
              Reference Number
            </h4>
            <p className="text-sm text-gray-900 mt-1">
              {guest.referenceNumber}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">
              Contact Number
            </h4>
            <p className="text-sm text-gray-900 mt-1">{guest.mobileNumber}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Check In</h4>
              <p className="text-sm text-gray-900 mt-1">
                {formatTimestamp(guest.checkIn)}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Check Out</h4>
              <p className="text-sm text-gray-900 mt-1">
                {formatTimestamp(guest.checkOut)}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Status</h4>
            <p className="text-sm text-gray-900 mt-1">{guest.status}</p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100
              rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
