import { Timestamp } from "firebase/firestore";

export type UserRole = "admin" | "receptionist" | "housekeeper";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: "active" | "inactive";
  lastLogin: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}
