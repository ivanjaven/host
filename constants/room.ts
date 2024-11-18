import { Room, RoomType } from "../types/room";

// constants/room.ts
export const ROOM_TYPES = ["Standard", "Deluxe", "Suite"] as const;
export const BED_TYPES = ["Single", "Double", "Queen", "King"] as const;
export const ROOM_FEATURES = [
  "Accessible",
  "Connecting",
  "Corner Room",
  "City View",
  "High Floor",
] as const;

export const DEFAULT_ROOM_DATA: Omit<Room, "id"> = {
  number: "",
  type: "Standard" as RoomType,
  price: 0,
  status: {
    reservation: "Not Reserved",
    housekeeping: "Clean",
    occupancy: "Vacant",
  },
  capacity: {
    minGuests: 1,
    maxGuests: 2,
    bedType: "Single",
  },
  amenities: {
    safeBox: false,
    refrigerator: false,
    luggage: false,
    airConditioner: false,
    concierge: false,
    tvCable: false,
    internet: false,
  },
  images: {
    primary: "",
    gallery: [],
  },
  supplies: {
    toiletries: {
      toilet_paper: 2,
      shampoo: 2,
      soap: 2,
      toothbrush: 2,
      toothpaste: 2,
    },
    bedding: {
      towels: 4,
      bedsheets: 2,
      pillowcases: 4,
      blankets: 2,
    },
    refreshments: {
      water_bottles: 4,
      coffee_sachets: 4,
      tea_bags: 4,
      sugar_packets: 8,
    },
  },
  floor: 1,
  size: 0,
  maintenanceStatus: "Operational",
  features: [],
  reviews: [],
  averageRating: 0,
};
