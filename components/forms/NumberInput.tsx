// components/forms/NumberInput.tsx
interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  required?: boolean;
}

export function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  required,
}: NumberInputProps) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-600 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const newValue = Number(e.target.value);
          if (!min || newValue >= min) {
            if (!max || newValue <= max) {
              onChange(newValue);
            }
          }
        }}
        min={min}
        max={max}
        className="
          w-full px-3 py-2.5
          text-gray-900 font-semibold
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
