// components/booking/BookingConfirmationSlip.tsx
import { format } from "date-fns";
import Image from "next/image";

interface BookingConfirmationSlipProps {
  bookingReference: string;
  checkInDate: Date;
  checkOutDate: Date;
  roomType: string;
  roomNumber: string;
  lastName: string;
  numberOfGuests: number;
  bookingDate: Date;
  totalAmount: number;
}

export function BookingConfirmationSlip({
  bookingReference,
  checkInDate,
  checkOutDate,
  roomType,
  roomNumber,
  lastName,
  numberOfGuests,
  totalAmount,
}: BookingConfirmationSlipProps) {
  return (
    <div className="w-[320px] bg-white px-8 py-6 text-xs">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex justify-center items-center gap-2 mb-2">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={28}
            height={28}
            className="h-7 w-auto"
          />
          <h1 className="text-lg font-bold text-gray-500">HoST</h1>
        </div>
        <p className="text-[10px] text-gray-600">Booking Receipt</p>
      </div>

      {/* Essential Booking Info */}
      <div className="space-y-6 border-y border-gray-100 py-6">
        <div className="text-center">
          <p className="text-[10px] text-gray-600">Booking Reference</p>
          <p className="text-base font-bold tracking-wider mt-1 text-gray-600">
            {bookingReference}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-y-4 text-[10px] text-center">
          <div>
            <p className="text-gray-600">Transaction Time</p>
            <p className="font-medium mt-0.5 text-gray-800">
              {format(checkInDate, "MMM dd, yyyy h:mm a")}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Check-out</p>
            <p className="font-medium mt-0.5 text-gray-800">
              {format(checkOutDate, "MMM dd, yyyy")}
            </p>
            <p className="text-[9px] text-gray-800">Before 12:00 PM</p>
          </div>
          <div>
            <p className="text-gray-600">Room</p>
            <p className="font-medium mt-0.5 text-gray-800">
              {roomType} {roomNumber}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Guest Name</p>
            <p className="font-medium mt-0.5 text-gray-800">{lastName}</p>
          </div>
          <div>
            <p className="text-gray-600">Number of Guests</p>
            <p className="font-medium mt-0.5 text-gray-800">{numberOfGuests}</p>
          </div>
          <div>
            <p className="text-gray-600">Total Amount</p>
            <p className="font-medium mt-0.5 text-gray-800">
              ₱{totalAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 space-y-4">
        <div className="text-[9px] text-gray-500 space-y-2 text-center">
          <p>Please note:</p>
          <ul className="space-y-1">
            <li>Present this receipt at the front desk</li>
            <li>Valid ID required for check-in</li>
            <li>Check-in time starts at 2:00 PM</li>
            <li>Check-out time is before 12:00 PM</li>
          </ul>
        </div>

        <div className="text-center text-[9px] text-gray-500 pt-4 border-t border-gray-100">
          <p>For inquiries, contact us at</p>
          <p className="font-medium mt-0.5">(123) 456-7890</p>
        </div>
      </div>
    </div>
  );
}
