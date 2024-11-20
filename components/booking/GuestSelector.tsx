// components/booking/GuestSelector.tsx
interface GuestSelectorProps {
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
  onGuestsChange: (guests: {
    adults: number;
    children: number;
    infants: number;
  }) => void;
  maxGuests: number;
}

export function GuestSelector({
  guests,
  onGuestsChange,
  maxGuests,
}: GuestSelectorProps) {
  const handleGuestChange = (
    type: "adults" | "children" | "infants",
    increment: boolean
  ) => {
    const newGuests = { ...guests };
    const currentTotal = guests.adults + guests.children;

    if (increment) {
      if (type === "infants" || currentTotal < maxGuests) {
        newGuests[type] += 1;
      }
    } else {
      if (type === "adults" && guests.adults > 1) {
        newGuests[type] -= 1;
      } else if (type !== "adults" && guests[type] > 0) {
        newGuests[type] -= 1;
      }
    }

    onGuestsChange(newGuests);
  };

  const GuestTypeInfo = {
    adults: {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      label: "Adults",
      description: "Ages 13 or above",
    },
    children: {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      label: "Children",
      description: "Ages 2-12",
    },
    infants: {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      label: "Infants",
      description: "Under 2",
    },
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Guests</h3>

      <div className="space-y-4">
        {(Object.keys(GuestTypeInfo) as Array<keyof typeof GuestTypeInfo>).map(
          (type) => (
            <div
              key={type}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                  {GuestTypeInfo[type].icon}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {GuestTypeInfo[type].label}
                  </p>
                  <p className="text-sm text-gray-600">
                    {GuestTypeInfo[type].description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleGuestChange(type, false)}
                  disabled={
                    type === "adults" ? guests[type] <= 1 : guests[type] <= 0
                  }
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200
                  text-gray-600 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50
                  disabled:cursor-not-allowed transition-colors"
                >
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
                      d="M20 12H4"
                    />
                  </svg>
                </button>

                <span className="w-6 text-center font-medium text-gray-900">
                  {guests[type]}
                </span>

                <button
                  onClick={() => handleGuestChange(type, true)}
                  disabled={
                    type !== "infants" &&
                    guests.adults + guests.children >= maxGuests
                  }
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200
                  text-gray-600 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50
                  disabled:cursor-not-allowed transition-colors"
                >
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">
            Maximum {maxGuests} guests
          </span>{" "}
          allowed for this room (excluding infants)
        </p>
      </div>
    </div>
  );
}
