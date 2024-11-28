"use client";
import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Booking } from "@/types/booking";
import { BookingTable } from "@/components/booking/BookingTable";
import { ConfirmationModal } from "@/components/booking/ConfirmationModal";
import Loading from "@/components/ui/loading";
import { startOfDay, startOfWeek, startOfMonth } from "date-fns";
import { getDatabase, ref, get, set, update } from "firebase/database";
import { HousekeepingAssignment } from "@/types/housekeeping";
import { useAuthProtection } from "@/hooks/useAuth";

type TimeFilter = "day" | "week" | "month" | "all";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionType, setActionType] = useState<
    "accept" | "decline" | "checkout" | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("day");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchBookings();
  }, [timeFilter]);

  const getTimeFilterDate = (filter: TimeFilter) => {
    const now = new Date();
    switch (filter) {
      case "day":
        return startOfDay(now);
      case "week":
        return startOfWeek(now);
      case "month":
        return startOfMonth(now);
      default:
        return null;
    }
  };

  const { userRole } = useAuthProtection(["admin", "receptionist"]);

  if (!userRole) return null;

  const fetchBookings = async () => {
    try {
      const bookingsRef = collection(db, "bookings");
      let q = query(bookingsRef, orderBy("createdAt", "desc"));

      const filterDate = getTimeFilterDate(timeFilter);
      if (filterDate) {
        q = query(q, where("createdAt", ">=", filterDate));
      }

      const snapshot = await getDocs(q);
      const bookingsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Booking[];

      // Calculate stats
      const stats = {
        total: bookingsData.length,
        pending: bookingsData.filter((b) => b.status === "pending").length,
        active: bookingsData.filter((b) => b.status === "active").length,
        completed: bookingsData.filter((b) => b.status === "checked_out")
          .length,
      };

      setStats(stats);
      setBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (booking: Booking) => {
    setSelectedBooking(booking);
    setActionType("accept");
  };

  const handleCheckout = async (booking: Booking) => {
    setSelectedBooking(booking);
    setActionType("checkout");
  };

  const handleDecline = async (booking: Booking) => {
    setSelectedBooking(booking);
    setActionType("decline");
  };

  const confirmAction = async () => {
    if (!selectedBooking || !actionType) return;

    setIsProcessing(true);
    try {
      if (actionType === "checkout") {
        // Update room status in Realtime Database
        const database = getDatabase();
        const roomStatusRef = ref(
          database,
          `roomStatuses/${selectedBooking.roomType}${selectedBooking.roomNumber}`
        );

        await update(roomStatusRef, {
          occupancy: "Vacant",
          reservation: "Not Reserved",
          housekeeping: "Dirty",
          lastUpdated: Date.now(),
        });

        // Assign room for cleaning
        await assignRoomForCleaning(
          selectedBooking.roomId,
          selectedBooking.roomType,
          selectedBooking.roomNumber
        );

        // Update booking status in Firestore
        const bookingRef = doc(db, "bookings", selectedBooking.id);
        await updateDoc(bookingRef, {
          status: "checked_out",
          updatedAt: serverTimestamp(),
        });

        // Update guest status in Firestore
        const guestsRef = collection(db, "guests");
        const q = query(
          guestsRef,
          where("referenceNumber", "==", selectedBooking.referenceNumber)
        );
        const guestSnapshot = await getDocs(q);

        if (!guestSnapshot.empty) {
          const guestDoc = guestSnapshot.docs[0];
          await updateDoc(doc(db, "guests", guestDoc.id), {
            status: "checked_out",
            updated_at: serverTimestamp(),
          });
        }
      } else if (actionType === "accept") {
        // Get the room data first to know what supplies to deduct
        const roomDoc = await getDoc(doc(db, "rooms", selectedBooking.roomId));
        if (!roomDoc.exists()) {
          throw new Error("Room not found");
        }
        const roomData = roomDoc.data();

        // Get current inventory state
        const database = getDatabase();
        const inventoryRef = ref(database, "inventory");
        const inventorySnapshot = await get(inventoryRef);
        const inventory = inventorySnapshot.val();

        // Prepare updates object
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updates: { [key: string]: any } = {};

        // Process each supply category
        const categories = ["toiletries", "bedding", "refreshments"] as const;

        for (const category of categories) {
          for (const [itemName, quantity] of Object.entries(
            roomData.supplies[category]
          )) {
            const currentStock =
              inventory.supplies[category][itemName].current_stock;
            const newStock = currentStock - Number(quantity);

            if (newStock < 0) {
              throw new Error(`Insufficient ${itemName} in inventory`);
            }

            // Update stock level
            updates[`supplies/${category}/${itemName}/current_stock`] =
              newStock;

            // Calculate new status
            const minThreshold =
              inventory.supplies[category][itemName].minimum_threshold;
            const ratio = newStock / minThreshold;
            let newStatus: "low" | "medium" | "high" = "high";
            if (ratio <= 1.5) newStatus = "low";
            else if (ratio <= 3) newStatus = "medium";

            updates[`supplies/${category}/${itemName}/status`] = newStatus;
            updates[`supplies/${category}/${itemName}/last_updated`] =
              new Date().toISOString();

            // Create single transaction for each item
            const transactionId = `transactions/${Date.now()}_${itemName}`;
            updates[transactionId] = {
              type: "deduction",
              item_id: itemName,
              category: category,
              quantity: Number(quantity),
              previous_stock: currentStock,
              new_stock: newStock,
              timestamp: new Date().toISOString(),
              performed_by: auth.currentUser?.uid || "unknown",
              reference: selectedBooking.referenceNumber,
              notes: `Deducted for booking ${selectedBooking.referenceNumber}`,
            };
          }
        }

        // Update Realtime Database for inventory
        await update(ref(database, "inventory"), updates);

        // Update room status in Realtime Database
        const roomStatusRef = ref(
          database,
          `roomStatuses/${selectedBooking.roomType}${selectedBooking.roomNumber}`
        );

        await update(roomStatusRef, {
          reservation: "Reserved",
          occupancy: "Not Vacant",
          bookingReference: selectedBooking.referenceNumber,
          lastUpdated: Date.now(),
        });

        // Update booking status in Firestore
        const bookingRef = doc(db, "bookings", selectedBooking.id);
        await updateDoc(bookingRef, {
          status: "active",
          paymentStatus: "paid",
          updatedAt: serverTimestamp(),
        });

        // Add guest to Firestore
        const guestData = {
          firstName: selectedBooking.guestInfo.firstName,
          lastName: selectedBooking.guestInfo.lastName,
          middleName: selectedBooking.guestInfo.middleName,
          mobileNumber: selectedBooking.guestInfo.mobileNumber,
          checkIn: selectedBooking.checkIn,
          checkOut: selectedBooking.checkOut,
          referenceNumber: selectedBooking.referenceNumber,
          status: "active" as const,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        };

        await addDoc(collection(db, "guests"), guestData);
      } else {
        // Delete booking document
        await deleteDoc(doc(db, "bookings", selectedBooking.id));
      }

      // Refresh bookings list
      await fetchBookings();
      setSelectedBooking(null);
      setActionType(null);
    } catch (error) {
      console.error("Error processing booking:", error);
      setError("Failed to process booking");
    } finally {
      setIsProcessing(false);
    }
  };

  const assignRoomForCleaning = async (
    roomId: string,
    roomType: string,
    roomNumber: string
  ) => {
    const database = getDatabase();
    const queueRef = ref(database, "housekeepingQueue");

    // Get current queue state
    const snapshot = await get(queueRef);
    const queueData = snapshot.val() || { queue: [], assignments: {} };

    if (!queueData.queue?.length) return;

    // Get first housekeeper in queue
    const housekeeperUid = queueData.queue[0];

    // Move housekeeper to end of queue
    const newQueue = [...queueData.queue.slice(1), housekeeperUid];

    // Create assignment with initial "assigned" state
    const assignment: HousekeepingAssignment = {
      housekeeperUid,
      roomNumber,
      roomType,
      status: "assigned", // Initial status
      assignedAt: Date.now(), // Assignment time
      startedCleaning: null, // Now TypeScript knows about this field
    };

    // Update database
    await set(ref(database, "housekeepingQueue"), {
      ...queueData,
      queue: newQueue,
      assignments: {
        ...queueData.assignments,
        [roomId]: assignment,
      },
    });
  };

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const activeBookings = bookings.filter((b) => b.status === "active");
  const completedBookings = bookings.filter((b) => b.status === "checked_out");

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8">
      {/* Header with Search and Time Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and monitor all bookings
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
            {(["day", "week", "month", "all"] as TimeFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors
                  ${
                    timeFilter === filter
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                {filter === "all" ? "All Time" : `This ${filter}`}
              </button>
            ))}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search bookings..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Bookings"
          value={stats.total}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
          color="blue"
        />
        <StatCard
          title="Pending Bookings"
          value={stats.pending}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          color="yellow"
        />
        <StatCard
          title="Active Bookings"
          value={stats.active}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          color="green"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          }
          color="purple"
        />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* Pending Bookings Table */}
      {pendingBookings.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-yellow-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Pending Bookings
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  New booking requests that need your attention
                </p>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                {pendingBookings.length} pending
              </span>
            </div>
          </div>
          <BookingTable
            bookings={pendingBookings}
            onAccept={handleAccept}
            onDecline={handleDecline}
            onCheckout={handleCheckout}
            type="pending"
          />
        </div>
      )}

      {/* Active Bookings Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Active Bookings
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Currently checked-in guests
              </p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              {activeBookings.length} active
            </span>
          </div>
        </div>
        <BookingTable
          bookings={activeBookings}
          onAccept={handleAccept}
          onDecline={handleDecline}
          onCheckout={handleCheckout}
          type="active"
        />
      </div>

      {/* Completed Bookings Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Completed Bookings
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Past bookings and checkouts
              </p>
            </div>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
              {completedBookings.length} completed
            </span>
          </div>
        </div>
        <BookingTable
          bookings={completedBookings}
          onAccept={handleAccept}
          onDecline={handleDecline}
          onCheckout={handleCheckout}
          type="completed"
        />
      </div>

      {selectedBooking && actionType && (
        <ConfirmationModal
          booking={selectedBooking}
          actionType={actionType}
          isProcessing={isProcessing}
          onConfirm={confirmAction}
          onClose={() => {
            setSelectedBooking(null);
            setActionType(null);
          }}
        />
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "yellow" | "green" | "purple";
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    yellow: "bg-yellow-50 text-yellow-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
}
