import { useState } from "react";

// components/forms/Input.tsx
interface InputProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  type?: "text" | "number";
  required?: boolean;
  min?: number;
  placeholder?: string;
  suffix?: string;
  error?: string;
}

export function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  min,
  placeholder,
  suffix,
  error,
}: InputProps) {
  const [focused, setFocused] = useState(false);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow empty string for deletion of numbers
    if (val === "") {
      onChange("");
      return;
    }

    const num = Number(val);
    // Only update if it's a valid number and meets minimum requirement
    if (!isNaN(num) && (!min || num >= min)) {
      onChange(num);
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={
            type === "number"
              ? handleNumberChange
              : (e) => onChange(e.target.value)
          }
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          min={min}
          placeholder={placeholder}
          className={`
            w-full px-2 py-1.5
            text-xs text-gray-900 font-medium
            bg-white border rounded-lg
            focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
            ${focused ? "border-primary" : "border-gray-200"}
            ${error ? "border-red-500" : ""}
            ${suffix ? "pr-12" : ""}
          `}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-gray-400 font-medium h-full">
            {suffix}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
