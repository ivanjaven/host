// hooks/useAvailableRoomNumbers.ts
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface RoomNumberData {
  numbers: {
    [key: string]: {
      used: boolean;
    };
  };
}

export function useAvailableRoomNumbers() {
  const [availableNumbers, setAvailableNumbers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRoomNumbers() {
      try {
        const roomNumbersDoc = await getDoc(doc(db, "config", "roomNumbers"));
        if (roomNumbersDoc.exists()) {
          const data = roomNumbersDoc.data() as RoomNumberData;
          const available = Object.entries(data.numbers)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .filter(([_, value]) => !value.used)
            .map(([number]) => number)
            .sort((a, b) => Number(a) - Number(b));

          setAvailableNumbers(available);
        }
      } catch (err) {
        setError("Failed to fetch available room numbers");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchRoomNumbers();
  }, []);

  return { availableNumbers, loading, error };
}
