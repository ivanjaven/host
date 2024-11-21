interface InventoryActionsProps {
  onRestock: () => void;
  onAdjust: () => void;
}

export function InventoryActions({
  onRestock,
  onAdjust,
}: InventoryActionsProps) {
  return (
    <div className="flex gap-3">
      <button
        onClick={onRestock}
        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium
          hover:bg-primary-dark transition-colors flex items-center gap-2"
      >
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        Restock Items
      </button>

      <button
        onClick={onAdjust}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium
          hover:bg-gray-200 transition-colors flex items-center gap-2"
      >
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
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        Adjust Stock
      </button>
    </div>
  );
}
