// components/forms/NumberInputWithControls.tsx
interface NumberInputWithControlsProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
}

export function NumberInputWithControls({
  label,
  value,
  onChange,
  min = 0,
}: NumberInputWithControlsProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-gray-700">{label}</span>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => value > min && onChange(value - 1)}
          className="px-1.5 py-0.5 text-xs text-gray-600 border border-gray-200 rounded-l-lg hover:bg-gray-50"
        >
          -
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const newValue = Number(e.target.value);
            if (newValue >= min) {
              onChange(newValue);
            }
          }}
          className="
            w-12 px-1.5 py-0.5
            text-center text-xs text-gray-900 font-medium
            border-y border-gray-200
            focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
            [appearance:textfield]
            [&::-webkit-outer-spin-button]:appearance-none
            [&::-webkit-inner-spin-button]:appearance-none
          "
        />
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="px-1.5 py-0.5 text-xs text-gray-600 border border-gray-200 rounded-r-lg hover:bg-gray-50"
        >
          +
        </button>
      </div>
    </div>
  );
}
