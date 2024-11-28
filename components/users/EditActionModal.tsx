// components/users/EditActionModal.tsx

import { useState } from "react";
import { getDatabase, ref as dbRef, get, update } from "firebase/database";
import {
  doc,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import type { HousekeepingQueue } from "@/types/housekeeping";
import { User, UserRole } from "@/types/user";
import Loading from "@/components/ui/loading";

interface UserFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

interface EditActionModalProps {
  user?: User;
  type: "add" | "edit";
  onClose: () => void;
  onSuccess: () => void;
}

const ROLES: UserRole[] = ["admin", "receptionist", "housekeeper"];

export function EditActionModal({
  user,
  type,
  onClose,
  onSuccess,
}: EditActionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<UserFormData>({
    email: user?.email || "",
    password: "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    role: user?.role || "receptionist",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (type === "add") {
        // Create authentication user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Create user document
        await addDoc(collection(db, "users"), {
          uid: userCredential.user.uid,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          status: "active",
          lastLogin: null,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });

        // If new user is a housekeeper, add to queue
        if (formData.role === "housekeeper") {
          const database = getDatabase();
          const queueRef = dbRef(database, "housekeepingQueue");

          const snapshot = await get(queueRef);
          const queueData = snapshot.val() as HousekeepingQueue;

          const newQueue = [
            ...(queueData?.queue || []),
            userCredential.user.uid,
          ];

          await update(dbRef(database), {
            "housekeepingQueue/queue": newQueue,
          });
        }
      } else if (type === "edit" && user) {
        // Update user in Firestore
        await updateDoc(doc(db, "users", user.id), {
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          updated_at: serverTimestamp(),
        });

        // Handle housekeeping queue updates
        const database = getDatabase();

        // Removing from queue if changing from housekeeper
        if (user.role === "housekeeper" && formData.role !== "housekeeper") {
          const queueRef = dbRef(database, "housekeepingQueue");
          const snapshot = await get(queueRef);
          const queueData = snapshot.val() as HousekeepingQueue;

          if (queueData?.queue?.includes(user.uid)) {
            const newQueue = queueData.queue.filter((id) => id !== user.uid);

            const newAssignments = { ...queueData.assignments };
            for (const [roomId, assignment] of Object.entries(newAssignments)) {
              if (assignment.housekeeperUid === user.uid) {
                delete newAssignments[roomId];
              }
            }

            await update(dbRef(database), {
              "housekeepingQueue/queue": newQueue,
              "housekeepingQueue/assignments": newAssignments,
            });
          }
        }

        // Adding to queue if changing to housekeeper
        else if (
          user.role !== "housekeeper" &&
          formData.role === "housekeeper"
        ) {
          const queueRef = dbRef(database, "housekeepingQueue");
          const snapshot = await get(queueRef);
          const queueData = snapshot.val() as HousekeepingQueue;

          if (!queueData?.queue?.includes(user.uid)) {
            const newQueue = [...(queueData?.queue || []), user.uid];

            await update(dbRef(database), {
              "housekeepingQueue/queue": newQueue,
            });
          }
        }
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error handling user:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {type === "add" ? "Add New User" : "Edit User"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex gap-3">
              <div className="text-red-500">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-xs text-red-600">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                First Name
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-900
                  focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Last Name
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-900
                  focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {type === "add" && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs
                    focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Password
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs
                    focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <p className="mt-1 text-[11px] text-gray-500">
                  Must be at least 6 characters
                </p>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Role
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFormData({ ...formData, role })}
                  className={`px-4 py-2 rounded-lg border text-xs font-medium
                    transition-colors ${
                      formData.role === role
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100
                rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-xs font-medium text-white bg-primary
                rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50
                disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loading size="small" color="white" />
                  {type === "add" ? "Creating..." : "Updating..."}
                </>
              ) : type === "add" ? (
                "Create User"
              ) : (
                "Update User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
