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
  "Ocean View",
  "Mountain View",
  "Balcony",
  "Private Pool",
  "Terrace",
  "Garden Access",
  "Executive Lounge Access",
  "Club Level",
  "Soundproof",
  "Jacuzzi",
] as const;

export const DEFAULT_ROOM_DATA: Omit<Room, "id" | "created_at" | "updated_at"> =
  {
    name: "",
    number: "",
    type: "Standard" as RoomType,
    price: 0,
    description: "",
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
      refrigerator: true,
      luggage: false,
      airConditioner: true,
      concierge: false,
      tvCable: false,
      internet: true,
      coffeeMaker: false,
      workspace: false,
      hairDryer: false,
      bathtub: false,
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
