// types/booking.ts
import { Timestamp } from "firebase/firestore";

export type BookingStatus = "pending" | "active" | "checked_out";
export type PaymentStatus = "pending" | "paid" | "refunded" | "cancelled";

export interface Booking {
  finalTotal: any;
  id: string;
  referenceNumber: string;
  roomId: string;
  roomType: string;
  roomNumber: string;
  checkIn: Date;
  checkOut: Date;
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
  guestInfo: {
    firstName: string;
    lastName: string;
    middleName: string;
    mobileNumber: string;
  };
  totalAmount: number;
  serviceFee: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
