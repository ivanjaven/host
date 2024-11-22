import { format } from "date-fns";

interface Transaction {
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

interface TransactionsListProps {
  transactions: Record<string, Transaction>;
}

export function TransactionsList({ transactions }: TransactionsListProps) {
  const sortedTransactions = Object.entries(transactions)
    .sort(
      (a, b) =>
        new Date(b[1].timestamp).getTime() - new Date(a[1].timestamp).getTime()
    )
    .slice(0, 25); // Show only last 5 transactions

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-semibold text-gray-600">
                Type
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-600">
                Item
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-600">
                Quantity
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-600">
                Date
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-600">
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map(([id, transaction]) => (
              <tr key={id} className="border-b border-gray-50 last:border-0">
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${
                      transaction.type === "deduction"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {transaction.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {transaction.item_id}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {transaction.quantity}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({transaction.previous_stock} → {transaction.new_stock})
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {format(
                    new Date(transaction.timestamp),
                    "MMM d, yyyy h:mm a"
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {transaction.notes || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
