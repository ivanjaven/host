"use client";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/types/user";
import { UserTable } from "@/components/users/UserTable";
import Loading from "@/components/ui/loading";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        const usersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];

        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage system users and their roles
          </p>
        </div>
        <button
          onClick={() => (window.location.href = "/dashboard/users/add")}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium
            hover:bg-primary-dark transition-colors"
        >
          Add User
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <UserTable users={users} />
      </div>
    </div>
  );
}
