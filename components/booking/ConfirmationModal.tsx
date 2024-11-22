// components/booking/ConfirmationModal.tsx
import { Booking } from "@/types/booking";

interface ConfirmationModalProps {
  booking: Booking;
  actionType: "accept" | "decline";
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
          ) : (
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
          )}
        </div>

        <div className="mt-6 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p>Reference Number:</p>
              <p className="font-medium text-gray-900">
                {booking.referenceNumber}
              </p>
            </div>
            <div>
              <p>Guest Name:</p>
              <p className="font-medium text-gray-900">
                {`${booking.guestInfo.firstName} ${booking.guestInfo.lastName}`}
              </p>
            </div>
            <div>
              <p>Room:</p>
              <p className="font-medium text-gray-900">
                {`${booking.roomType} ${booking.roomNumber}`}
              </p>
            </div>
            <div>
              <p>Amount:</p>
              <p className="font-medium text-gray-900">
                ₱{booking.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg
              ${
                actionType === "accept"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isProcessing
              ? "Processing..."
              : actionType === "accept"
              ? "Accept Booking"
              : "Decline Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}
