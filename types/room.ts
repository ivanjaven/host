import { Timestamp, FieldValue } from "firebase/firestore";

// types/room.ts
export interface Room {
  id: string;
  number: string;
  type: RoomType;
  price: number;
  status: RoomStatus;
  capacity: RoomCapacity;
  amenities: RoomAmenities;
  images: RoomImages;
  supplies: RoomSupplies;
  floor: number;
  size: number;
  maintenanceStatus: MaintenanceStatus;
  features: string[];
  reviews: Review[];
  averageRating: number;
  description: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export const ROOM_TYPES = ["Standard", "Deluxe", "Suite"] as const;
export type RoomType = (typeof ROOM_TYPES)[number];

export type MaintenanceStatus = "Operational" | "Under Maintenance";

export const BED_TYPES = ["Single", "Double", "Queen", "King"] as const;
export type BedType = (typeof BED_TYPES)[number];

export type RoomCreate = Omit<Room, "id" | "created_at" | "updated_at"> & {
  created_at: FieldValue;
  updated_at: FieldValue;
};

export interface RoomStatus {
  reservation: "Reserved" | "Not Reserved";
  housekeeping: "Clean" | "Dirty" | "Cleaning";
  occupancy: "Vacant" | "Occupied";
}

export interface RoomCapacity {
  minGuests: number;
  maxGuests: number;
  bedType: BedType;
}

export interface RoomAmenities {
  safeBox: boolean;
  refrigerator: boolean;
  luggage: boolean;
  airConditioner: boolean;
  concierge: boolean;
  tvCable: boolean;
  internet: boolean;
  bathtub: boolean;
  hairDryer: boolean;
  coffeeMaker: boolean;
  workspace: boolean;
}

export interface RoomImages {
  primary: string;
  gallery: string[];
}

export interface RoomSupplies {
  toiletries: {
    toilet_paper: number;
    shampoo: number;
    soap: number;
    toothbrush: number;
    toothpaste: number;
  };
  bedding: {
    towels: number;
    bedsheets: number;
    pillowcases: number;
    blankets: number;
  };
  refreshments: {
    water_bottles: number;
    coffee_sachets: number;
    tea_bags: number;
    sugar_packets: number;
  };
}

export interface Review {
  reviewerId: string;
  value: number; // 1-5 rating
}
