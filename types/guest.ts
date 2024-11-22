// types/guest.ts
import { Timestamp } from "firebase/firestore";

export type GuestStatus = "active" | "checked_out";

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  mobileNumber: string;
  checkIn: Timestamp;
  checkOut: Timestamp;
  referenceNumber: string;
  status: GuestStatus;
  created_at: Timestamp;
  updated_at: Timestamp;
}
