// components/forms/SupplyItem.tsx
interface SupplyItemProps {
  label: string;
  quantity: number;
  onQuantityChange: (value: number) => void;
}

export function SupplyItem({
  label,
  quantity,
  onQuantityChange,
}: SupplyItemProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <input
        type="number"
        value={quantity}
        onChange={(e) => onQuantityChange(Number(e.target.value))}
        min={0}
        className="
          w-20 px-3 py-1.5
          text-gray-900 font-semibold text-center
          bg-white border border-gray-200 rounded-lg
          focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
          [appearance:textfield]
          [&::-webkit-outer-spin-button]:appearance-none
          [&::-webkit-inner-spin-button]:appearance-none
        "
      />
    </div>
  );
}
