// components/forms/FeatureToggle.tsx
interface FeatureToggleProps {
  features: readonly string[]; // Make it accept readonly arrays
  selectedFeatures: string[];
  onToggle: (feature: string) => void;
}

export function FeatureToggle({
  features,
  selectedFeatures,
  onToggle,
}: FeatureToggleProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {features.map((feature) => (
        <button
          key={feature}
          type="button"
          onClick={() => onToggle(feature)}
          className={`px-4 py-2 rounded-full text-xs font-medium ${
            selectedFeatures.includes(feature)
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {feature}
        </button>
      ))}
    </div>
  );
}
