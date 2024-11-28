// components/users/UserTable.tsx
import { User } from "@/types/user";
import { format } from "date-fns";
import { serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc } from "firebase/firestore";
import { EditActionModal } from "./EditActionModal";
import { DeleteUserModal } from "./DeleteActionModal";
import { get, getDatabase, ref, update } from "firebase/database";
import { HousekeepingQueue } from "@/types/housekeeping";

interface UserTableProps {
  users: User[];
  onRefresh: () => Promise<void>;
}

export function UserTable({ users, onRefresh }: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<"edit" | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const formatTimestamp = (timestamp: Timestamp | null) => {
    if (!timestamp) return "Never";
    return format(timestamp.toDate(), "MMM d, yyyy h:mm a");
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);

    try {
      // If the user is a housekeeper, remove from queue
      if (userToDelete.role === "housekeeper") {
        const database = getDatabase();
        const queueRef = ref(database, "housekeepingQueue");

        const snapshot = await get(queueRef);
        const data = snapshot.val() as HousekeepingQueue;

        if (data.queue?.includes(userToDelete.uid)) {
          const newQueue = data.queue.filter((id) => id !== userToDelete.uid);

          // Remove assignments
          const newAssignments = { ...data.assignments };
          for (const [roomId, assignment] of Object.entries(newAssignments)) {
            if (assignment.housekeeperUid === userToDelete.uid) {
              delete newAssignments[roomId];
            }
          }

          await update(ref(database), {
            "housekeepingQueue/queue": newQueue,
            "housekeepingQueue/assignments": newAssignments,
          });
        }
      }

      // Existing delete logic
      await updateDoc(doc(db, "users", userToDelete.id), {
        archived: true,
        status: "inactive",
        updated_at: serverTimestamp(),
      });

      await onRefresh();
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error archiving user:", error);
      alert("Failed to archive user");
    } finally {
      setIsDeleting(false);
    }
  };

  const StatusBadge = ({ status }: { status: "active" | "inactive" }) => {
    const getStatusColor = () => {
      switch (status) {
        case "active":
          return "bg-green-100 text-green-800";
        case "inactive":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${getStatusColor()}`}
      >
        {status}
      </span>
    );
  };

  const RoleBadge = ({ role }: { role: string }) => {
    const getRoleColor = () => {
      switch (role) {
        case "admin":
          return "bg-purple-100 text-purple-800";
        case "receptionist":
          return "bg-blue-100 text-blue-800";
        case "housekeeper":
          return "bg-yellow-100 text-yellow-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${getRoleColor()}`}
      >
        {role}
      </span>
    );
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-100">
              <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-left">
                User
              </th>
              <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-left">
                Role
              </th>
              <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-left">
                Status
              </th>
              <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-left">
                Last Login
              </th>
              <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-left">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
              >
                <td className="px-6 py-4">
                  <div>
                    <span className="text-xs font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-[11px] text-gray-500 block mt-0.5">
                      {user.email}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={user.status} />
                </td>
                <td className="px-6 py-4">
                  <div>
                    <span className="text-[11px] text-gray-900">
                      {formatTimestamp(user.lastLogin)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setActionType("edit");
                      }}
                      className="px-3 py-1.5 text-[11px] font-medium text-blue-700 bg-blue-50
                      rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(user)}
                      className="px-3 py-1.5 text-[11px] font-medium text-red-700 bg-red-50
                      rounded-md hover:bg-red-100 transition-colors flex items-center gap-1"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xs text-gray-500">No users found</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {actionType === "edit" && selectedUser && (
        <EditActionModal
          type="edit"
          user={selectedUser}
          onClose={() => {
            setSelectedUser(null);
            setActionType(null);
          }}
          onSuccess={async () => {
            await onRefresh();
            setSelectedUser(null);
            setActionType(null);
          }}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && userToDelete && (
        <DeleteUserModal
          user={userToDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setUserToDelete(null);
          }}
          onConfirm={confirmDelete}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
}
