// utils/roomNumbers.ts
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function markRoomNumberAsUsed(roomNumber: string) {
  const roomNumbersRef = doc(db, "config", "roomNumbers");
  await updateDoc(roomNumbersRef, {
    [`numbers.${roomNumber}.used`]: true,
  });
}

export async function markRoomNumberAsAvailable(roomNumber: string) {
  const roomNumbersRef = doc(db, "config", "roomNumbers");
  await updateDoc(roomNumbersRef, {
    [`numbers.${roomNumber}.used`]: false,
  });
}
