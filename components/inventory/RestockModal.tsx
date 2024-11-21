// components/inventory/RestockModal.tsx
import { useState } from "react";
import { getDatabase, ref, update } from "firebase/database";
import { auth } from "@/lib/firebase";
import type { InventorySupplies } from "@/types/inventory";
import { capitalizeFirstLetter } from "@/utils/string";

interface RestockModalProps {
  supplies: InventorySupplies;
  onClose: () => void;
  selectedCategory: string | null;
}

export function RestockModal({
  supplies,
  onClose,
  selectedCategory,
}: RestockModalProps) {
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRestock = async (e: React.FormEvent) => {
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

      const newStock = currentItem.current_stock + parseInt(quantity);
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
      const transactionId = `restock_${Date.now()}`;
      updates[`inventory/transactions/${transactionId}`] = {
        type: "restock",
        item_id: itemName,
        quantity: parseInt(quantity),
        previous_stock: currentItem.current_stock,
        new_stock: newStock,
        timestamp: new Date().toISOString(),
        performed_by: auth.currentUser?.uid || "unknown",
        notes: `Restocked ${quantity} ${currentItem.unit}`,
      };

      await update(ref(database), updates);
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Failed to restock item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Restock Items</h2>

        <form onSubmit={handleRestock} className="space-y-4">
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
          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity to Add
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
              {loading ? "Restocking..." : "Restock"}
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
