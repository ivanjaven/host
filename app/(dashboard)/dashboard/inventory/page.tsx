// app/dashboard/inventory/page.tsx
"use client";
import { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import Loading from "@/components/ui/loading";
import { CategoryCard } from "@/components/inventory/CategoryCard";
import { InventoryStats } from "@/components/inventory/InventoryStats";
import { TransactionsList } from "@/components/inventory/TransactionList";
import { InventoryActions } from "@/components/inventory/InventoryActions";
import { RestockModal } from "@/components/inventory/RestockModal";
import { AdjustStockModal } from "@/components/inventory/AdjustStockModal";
import type { Inventory } from "@/types/inventory";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const database = getDatabase();
    const inventoryRef = ref(database, "inventory");

    try {
      const unsubscribe = onValue(inventoryRef, (snapshot) => {
        if (snapshot.exists()) {
          setInventory(snapshot.val() as Inventory);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      setError("Failed to load inventory data");
      setLoading(false);
    }
  }, []);

  const getTotalItems = () => {
    if (!inventory) return 0;
    let total = 0;
    Object.values(inventory.supplies).forEach((category) => {
      Object.values(category).forEach((item) => {
        total += item.current_stock;
      });
    });
    return total;
  };

  const getLowStockItems = () => {
    if (!inventory) return 0;
    let count = 0;
    Object.values(inventory.supplies).forEach((category) => {
      Object.values(category).forEach((item) => {
        if (item.status === "low") count++;
      });
    });
    return count;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">No inventory data available</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Inventory Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor and manage hotel supplies
          </p>
        </div>
        <InventoryActions
          onRestock={() => setIsRestockModalOpen(true)}
          onAdjust={() => setIsAdjustModalOpen(true)}
        />
      </div>

      {/* Stats Overview */}
      <InventoryStats
        totalItems={getTotalItems()}
        lowStockItems={getLowStockItems()}
        categories={Object.keys(inventory.supplies).length}
      />

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(inventory.supplies).map(([category, items]) => (
          <CategoryCard
            key={category}
            category={category}
            items={items}
            onSelect={() =>
              setSelectedCategory(
                selectedCategory === category ? null : category
              )
            }
            isSelected={selectedCategory === category}
          />
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Recent Transactions
        </h2>
        <TransactionsList transactions={inventory.transactions} />
      </div>

      {/* Modals */}
      {isRestockModalOpen && (
        <RestockModal
          supplies={inventory.supplies}
          onClose={() => setIsRestockModalOpen(false)}
          selectedCategory={selectedCategory}
        />
      )}
      {isAdjustModalOpen && (
        <AdjustStockModal
          supplies={inventory.supplies}
          onClose={() => setIsAdjustModalOpen(false)}
          selectedCategory={selectedCategory}
        />
      )}
    </div>
  );
}
