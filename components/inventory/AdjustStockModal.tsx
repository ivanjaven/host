// components/inventory/AdjustStockModal.tsx
import { useState } from "react";
import { getDatabase, ref, update } from "firebase/database";
import { auth } from "@/lib/firebase";
import type { InventorySupplies } from "@/types/inventory";
import { capitalizeFirstLetter } from "@/utils/string";

interface AdjustStockModalProps {
  supplies: InventorySupplies;
  onClose: () => void;
  selectedCategory: string | null;
}

export function AdjustStockModal({
  supplies,
  onClose,
  selectedCategory,
}: AdjustStockModalProps) {
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<"increase" | "decrease">(
    "decrease"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !quantity) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const database = getDatabase();
      const [category, itemName] = selectedItem.split(".");
      const currentItem =
        supplies[category as keyof InventorySupplies][itemName];

      const quantityNum = parseInt(quantity);
      const newStock =
        adjustmentType === "increase"
          ? currentItem.current_stock + quantityNum
          : currentItem.current_stock - quantityNum;

      // Validate new stock value
      if (newStock < 0) {
        setError("Stock cannot be negative");
        setLoading(false);
        return;
      }

      const newStatus = calculateStatus(
        newStock,
        currentItem.minimum_threshold
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updates: { [key: string]: any } = {};

      // Update stock and status
      updates[`inventory/supplies/${category}/${itemName}/current_stock`] =
        newStock;
      updates[`inventory/supplies/${category}/${itemName}/status`] = newStatus;
      updates[`inventory/supplies/${category}/${itemName}/last_updated`] =
        new Date().toISOString();

      // Add transaction
      const transactionId = `adjust_${Date.now()}`;
      updates[`inventory/transactions/${transactionId}`] = {
        type: adjustmentType === "increase" ? "restock" : "deduction",
        item_id: itemName,
        quantity: quantityNum,
        previous_stock: currentItem.current_stock,
        new_stock: newStock,
        timestamp: new Date().toISOString(),
        performed_by: auth.currentUser?.uid || "unknown",
        notes: `Manual ${adjustmentType} of ${quantity} ${currentItem.unit}`,
      };

      await update(ref(database), updates);
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Failed to adjust stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Adjust Stock</h2>

        <form onSubmit={handleAdjust} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Item
            </label>
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm
                focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-900"
              required
            >
              <option value="">Select an item</option>
              {(Object.keys(supplies) as Array<keyof InventorySupplies>).map(
                (category) =>
                  selectedCategory === null || selectedCategory === category ? (
                    <optgroup
                      key={category}
                      label={capitalizeFirstLetter(category)}
                    >
                      {Object.entries(supplies[category]).map(
                        ([itemName, item]) => (
                          <option
                            key={itemName}
                            value={`${category}.${itemName}`}
                          >
                            {capitalizeFirstLetter(itemName.replace(/_/g, " "))}{" "}
                            ({item.current_stock} {item.unit})
                          </option>
                        )
                      )}
                    </optgroup>
                  ) : null
              )}
            </select>
          </div>

          {/* Adjustment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adjustment Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="decrease"
                  checked={adjustmentType === "decrease"}
                  onChange={() => setAdjustmentType("decrease")}
                  className="text-primary focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-700">Decrease</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="increase"
                  checked={adjustmentType === "increase"}
                  onChange={() => setAdjustmentType("increase")}
                  className="text-primary focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-700">Increase</span>
              </label>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-900"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark
                rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Adjusting..." : "Adjust Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function calculateStatus(
  currentStock: number,
  minimumThreshold: number
): "low" | "medium" | "high" {
  const ratio = currentStock / minimumThreshold;
  if (ratio <= 1.5) return "low";
  if (ratio <= 3) return "medium";
  return "high";
}
