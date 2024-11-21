// types/inventory.ts

export interface InventoryItem {
  current_stock: number;
  minimum_threshold: number;
  unit: string;
  status: "low" | "medium" | "high";
  last_updated: string;
}

export interface CategoryItems {
  [key: string]: InventoryItem;
}

export interface InventorySupplies {
  toiletries: CategoryItems;
  bedding: CategoryItems;
  refreshments: CategoryItems;
}

export interface InventoryTransaction {
  type: "deduction" | "restock";
  item_id: string;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  timestamp: string;
  performed_by: string;
  reference?: string;
  notes?: string;
}

export interface Inventory {
  supplies: InventorySupplies;
  transactions: {
    [key: string]: InventoryTransaction;
  };
}
