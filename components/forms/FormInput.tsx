// components/forms/FormInput.tsx

interface FormInputProps<T extends string | number> {
  label: string;
  type: "text" | "number" | "select";
  value: T;
  onChange: (value: T) => void;
  required?: boolean;
  options?: readonly T[];
}

export function FormInput<T extends string | number>({
  label,
  type,
  value,
  onChange,
  required,
  options,
}: FormInputProps<T>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        >
          {options?.map((option) => (
            <option key={String(option)} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) =>
            onChange(
              type === "number"
                ? (Number(e.target.value) as T)
                : (e.target.value as T)
            )
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      )}
    </div>
  );
}
