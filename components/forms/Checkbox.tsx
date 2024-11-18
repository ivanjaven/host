// components/forms/Checkbox.tsx
interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label className="flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="
          w-5 h-5
          border-2 border-gray-300
          rounded
          text-primary
          focus:ring-primary/20
          cursor-pointer
        "
      />
      <span className="ml-2 text-xs font-medium text-gray-700">{label}</span>
    </label>
  );
}
