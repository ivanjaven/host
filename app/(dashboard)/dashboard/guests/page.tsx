// app/dashboard/guests/page.tsx
"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Guest } from "@/types/guest";
import { GuestTable } from "@/components/guests/GuestTable";
import Loading from "@/components/ui/loading";

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const guestsRef = collection(db, "guests");
      const q = query(guestsRef, orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);
      const guestsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Guest[];
      setGuests(guestsData);
    } catch (error) {
      console.error("Error fetching guests:", error);
      setError("Failed to load guests");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Guests</h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor current and past hotel guests
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <GuestTable guests={guests} />
      </div>
    </div>
  );
}
