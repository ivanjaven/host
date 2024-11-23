"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { UserRole } from "@/types/user";
import Loading from "@/components/ui/loading";

const ROLES: UserRole[] = ["admin", "receptionist", "housekeeper"];

export default function AddUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "receptionist" as UserRole,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Create authentication user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Create user document in Firestore
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

      router.push("/dashboard/users");
    } catch (err) {
      console.error("Error adding user:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while creating the user"
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center mb-10">
        <button
          onClick={() => router.back()}
          className="p-2 mr-4 text-gray-600 hover:bg-gray-100 rounded-lg
            transition-colors flex items-center justify-center"
        >
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New User</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create a new user account with specific role
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl">
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

      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-900
                  focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-900
                  focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Email Address
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-900
                focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
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
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-900
                focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <p className="mt-2 text-[11px] text-gray-500">
              Password must be at least 6 characters long
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Role
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="grid grid-cols-3 gap-4">
              {ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFormData({ ...formData, role })}
                  className={`px-4 py-3 rounded-xl border text-xs font-medium
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

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2.5 text-xs font-medium text-gray-700 bg-gray-100
                rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2.5 text-xs font-medium text-white bg-primary
                rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50
                disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loading size="small" color="white" />
                  Creating User...
                </>
              ) : (
                "Create User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
