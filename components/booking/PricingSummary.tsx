// components/booking/PricingSummary.tsx
import { Room } from "@/types/room";
import { format, differenceInDays } from "date-fns";
import Image from "next/image";

interface PricingSummaryProps {
  room: Room;
  checkIn: Date | null;
  checkOut: Date | null;
  totalPrice: number;
}

export function PricingSummary({
  room,
  checkIn,
  checkOut,
  totalPrice,
}: PricingSummaryProps) {
  const numberOfNights =
    checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const serviceFee = 1000; // Fixed service fee
  const finalTotal = totalPrice + serviceFee;

  const PriceRow = ({
    label,
    amount,
    subtext,
    isTotal = false,
  }: {
    label: string;
    amount: number;
    subtext?: string;
    isTotal?: boolean;
  }) => (
    <div
      className={`flex justify-between ${
        isTotal ? "pt-4 border-t border-gray-200" : ""
      }`}
    >
      <div>
        <p
          className={`${
            isTotal ? "text-base font-semibold" : "text-sm"
          } text-gray-900`}
        >
          {label}
        </p>
        {subtext && <p className="text-xs text-gray-500 mt-0.5">{subtext}</p>}
      </div>
      <p
        className={`${
          isTotal ? "text-lg font-bold" : "text-sm font-medium"
        } text-gray-900`}
      >
        ₱{amount.toLocaleString()}
      </p>
    </div>
  );

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-50 rounded-lg">
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Pricing Details</h3>
          {checkIn && checkOut && (
            <p className="text-sm text-gray-600">
              {format(checkIn, "MMM dd, yyyy")} -{" "}
              {format(checkOut, "MMM dd, yyyy")}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <PriceRow
          label="Room Rate"
          amount={totalPrice}
          subtext={`₱${room.price.toLocaleString()} × ${numberOfNights} night${
            numberOfNights !== 1 ? "s" : ""
          }`}
        />

        <PriceRow
          label="Service Fee"
          amount={serviceFee}
          subtext="Includes cleaning and processing"
        />

        <PriceRow label="Total Amount" amount={finalTotal} isTotal />
      </div>

      {/* Cancellation Policy */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex gap-3">
          <div className="text-gray-400">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              Cancellation Policy
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Free cancellation until 24 hours before check-in. Cancel before
              then for a full refund.
            </p>
          </div>
        </div>
      </div>

      {/* Price Guarantee */}
      <div className="mt-4 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-primary/10 rounded-full">
            <svg
              className="w-4 h-4 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <p className="text-xs text-gray-600">
            <span className="font-medium text-gray-900">Price Guarantee:</span>{" "}
            You wont find a better rate anywhere else.
          </p>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-2">
          Accepted Payment Methods (Aside from Cash)
        </p>
        <div className="flex gap-1">
          {["visa", "mastercard", "gcash"].map((method) => (
            <div
              key={method}
              className="w-10 h-6 rounded flex items-center justify-center"
            >
              <Image
                src={`/images/payment/${method}.svg`}
                alt={method}
                width={24}
                height={24}
                className="h-6 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
