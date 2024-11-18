// components/forms/RoomSupplies.tsx
import { Room } from "@/types/room";
import { NumberInputWithControls } from "./NumberInputWithControls";

interface RoomSuppliesProps {
  supplies: Room["supplies"];
  onSuppliesChange: (supplies: Room["supplies"]) => void;
}

export function RoomSupplies({
  supplies,
  onSuppliesChange,
}: RoomSuppliesProps) {
  const updateSupply = (
    category: keyof Room["supplies"],
    item: string,
    value: number
  ) => {
    onSuppliesChange({
      ...supplies,
      [category]: {
        ...supplies[category],
        [item]: value,
      },
    });
  };

  return (
    <div className="grid grid-cols-3 gap-8">
      <div>
        <h3 className="text-xs font-semibold text-gray-900 mb-3">Toiletries</h3>
        <div className="space-y-2">
          {Object.entries(supplies.toiletries).map(([key, value]) => (
            <NumberInputWithControls
              key={key}
              label={key
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
              value={value}
              onChange={(newValue) => updateSupply("toiletries", key, newValue)}
              min={0}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-900 mb-3">Bedding</h3>
        <div className="space-y-2">
          {Object.entries(supplies.bedding).map(([key, value]) => (
            <NumberInputWithControls
              key={key}
              label={key
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
              value={value}
              onChange={(newValue) => updateSupply("bedding", key, newValue)}
              min={0}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-900 mb-3">
          Refreshments
        </h3>
        <div className="space-y-2">
          {Object.entries(supplies.refreshments).map(([key, value]) => (
            <NumberInputWithControls
              key={key}
              label={key
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
              value={value}
              onChange={(newValue) =>
                updateSupply("refreshments", key, newValue)
              }
              min={0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
