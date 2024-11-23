import { useState } from "react";
import { User } from "@/types/user";
import Loading from "@/components/ui/loading";

interface DeleteUserModalProps {
  user: User;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteUserModal({
  user,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteUserModalProps) {
  const [confirmName, setConfirmName] = useState("");
  const fullName = `${user.firstName} ${user.lastName}`;
  const isConfirmed = confirmName === fullName;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Delete User</h2>
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

        <div className="bg-red-50 p-4 rounded-lg mb-6">
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
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-red-800">
                Delete User Account
              </p>
              <p className="text-sm text-red-700 mt-1">
                This action cannot be undone. This will permanently delete the
                user account of {fullName}.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Please type <span className="font-bold">{fullName}</span> to confirm
          </label>
          <input
            type="text"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={fullName}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-900
              focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          <p className="mt-2 text-[11px] text-gray-500">
            The delete button will be enabled once the name matches exactly.
          </p>
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
            onClick={onConfirm}
            disabled={!isConfirmed || isDeleting}
            className="px-4 py-2 text-xs font-medium text-white bg-red-600
              rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50
              disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loading size="small" color="white" />
                Deleting...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
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
                Delete User
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
