// components/rooms/FilterInput.tsx
interface FilterInputProps {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  options?: string[];
  isSearch?: boolean;
}

export function FilterInput({
  label,
  value,
  placeholder,
  onChange,
  options,
  isSearch,
}: FilterInputProps) {
  return (
    <div>
      <label className="block text-xs font-sm text-gray-800 mb-2">
        {label}
      </label>
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-4 bg-white border border-gray-200 rounded-lg
            text-xs font-semibold text-gray-700 focus:outline-none focus:border-primary
            focus:ring-1 focus:ring-primary"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-4 bg-white border border-gray-200 rounded-lg
              text-xs text-gray-900 focus:outline-none focus:border-primary
              focus:ring-1 focus:ring-primary"
          />
          {isSearch && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
