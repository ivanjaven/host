// components/forms/Select.tsx
interface SelectProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly T[];
  required?: boolean;
  disabled?: boolean;
}

export function Select<T extends string>({
  label,
  value,
  onChange,
  options,
  required,
  disabled,
}: SelectProps<T>) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        disabled={disabled}
        className={`
          w-full px-2 py-2
          text-xs text-gray-900 font-medium
          bg-white border border-gray-200 rounded-lg
          focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
        `}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
