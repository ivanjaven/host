// components/booking/ConfirmationModal.tsx
import { Booking } from "@/types/booking";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";

interface ConfirmationModalProps {
  booking: Booking;
  actionType: "accept" | "decline" | "checkout";
  isProcessing: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmationModal({
  booking,
  actionType,
  isProcessing,
  onConfirm,
  onClose,
}: ConfirmationModalProps) {
  const formatFirestoreTimestamp = (timestamp: Timestamp) => {
    return format(timestamp.toDate(), "MMM dd, yyyy h:mm a");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="text-center">
          {actionType === "accept" ? (
            <>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Accept Booking
              </h3>
              <p className="text-sm text-gray-600">
                Are you sure you want to accept this booking? This will mark the
                room as reserved and update the payment status.
              </p>
            </>
          ) : actionType === "decline" ? (
            <>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-red-600"
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
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Decline Booking
              </h3>
              <p className="text-sm text-gray-600">
                Are you sure you want to decline this booking? This action
                cannot be undone.
              </p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
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
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Confirm Check-out
              </h3>
              <p className="text-sm text-gray-600">
                Are you sure you want to check out this guest? This will:
              </p>
              <ul className="text-left text-sm text-gray-600 mt-4 space-y-2 bg-gray-50 p-4 rounded-lg">
                <li className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Mark the booking as checked out
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Update guest status to checked out
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Mark room as vacant and needs cleaning
                </li>
              </ul>
            </>
          )}
        </div>

        <div className="mt-6 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-2 gap-6 text-sm text-gray-600 mb-6">
            <div>
              <p className="text-gray-500">Reference Number:</p>
              <p className="font-medium text-gray-900 mt-1">
                {booking.referenceNumber}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Guest Name:</p>
              <p className="font-medium text-gray-900 mt-1">
                {`${booking.guestInfo.firstName} ${booking.guestInfo.lastName}`}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Room:</p>
              <p className="font-medium text-gray-900 mt-1">
                {`${booking.roomType} ${booking.roomNumber}`}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Amount:</p>
              <p className="font-medium text-gray-900 mt-1">
                ₱{booking.finalTotal.toLocaleString()}
              </p>
            </div>
            {actionType === "checkout" && (
              <>
                <div>
                  <p className="text-gray-500">Check In:</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {formatFirestoreTimestamp(
                      booking.checkIn as unknown as Timestamp
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Check Out:</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {formatFirestoreTimestamp(
                      booking.checkOut as unknown as Timestamp
                    )}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors
                ${
                  actionType === "checkout"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : actionType === "accept"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }
                disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : actionType === "checkout" ? (
                "Confirm Check-out"
              ) : actionType === "accept" ? (
                "Accept Booking"
              ) : (
                "Decline Booking"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
