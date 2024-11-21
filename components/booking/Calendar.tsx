// components/booking/Calendar.tsx
import { useState } from "react";
import { Room } from "@/types/room";
import { format, isSameDay, isAfter, isBefore } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface CalendarProps {
  room: Room;
  selectedDates: {
    checkIn: Date | null;
    checkOut: Date | null;
  };
  onDateChange: (dates: {
    checkIn: Date | null;
    checkOut: Date | null;
  }) => void;
}

export function Calendar({ selectedDates, onDateChange }: CalendarProps) {
  const [calendarMode, setCalendarMode] = useState<"checkIn" | "checkOut">(
    "checkIn"
  );

  // Sample unavailable dates (to be replaced with real data later)
  const unavailableDates = [
    new Date(2024, 11, 24),
    new Date(2024, 11, 25),
    new Date(2024, 11, 26),
  ];

  const getMinDate = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (now.getHours() <= 17) {
      // Before or at 5 PM
      return today;
    }

    // After 5 PM, return tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (calendarMode === "checkIn") {
      onDateChange({
        checkIn: date,
        checkOut: null,
      });
      setCalendarMode("checkOut");
    } else {
      // Check if trying to select same day as check-in
      if (selectedDates.checkIn && isSameDay(date, selectedDates.checkIn)) {
        return;
      }

      // Check if selected date is before check-in
      if (selectedDates.checkIn && isBefore(date, selectedDates.checkIn)) {
        onDateChange({
          checkIn: date,
          checkOut: null,
        });
        setCalendarMode("checkOut");
      } else {
        onDateChange({
          ...selectedDates,
          checkOut: date,
        });
        setCalendarMode("checkIn");
      }
    }
  };

  const modifiers = {
    selected: (date: Date) => {
      if (!selectedDates.checkIn && !selectedDates.checkOut) return false;
      if (selectedDates.checkIn && isSameDay(date, selectedDates.checkIn))
        return true;
      if (selectedDates.checkOut && isSameDay(date, selectedDates.checkOut))
        return true;
      return false;
    },
    inRange: (date: Date) => {
      if (!selectedDates.checkIn || !selectedDates.checkOut) return false;
      return (
        isAfter(date, selectedDates.checkIn) &&
        isBefore(date, selectedDates.checkOut)
      );
    },
    unavailable: (date: Date) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const isAfter5PM = now.getHours() >= 17;

      return (
        unavailableDates.some((unavailableDate) =>
          isSameDay(date, unavailableDate)
        ) ||
        (isSameDay(date, today) && isAfter5PM)
      );
    },
    disabled: (date: Date) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return isBefore(date, today) || modifiers.unavailable(date);
    },
  };

  const modifiersStyles = {
    selected: {
      backgroundColor: "#FF69B4",
      color: "white",
      fontWeight: "bold",
    },
    inRange: {
      backgroundColor: "#FFE4E1",
      color: "#FF69B4",
    },
    unavailable: {
      backgroundColor: "#FEE2E2",
      color: "#EF4444",
      textDecoration: "line-through",
    },
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Select Dates</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-in Date
          </label>
          <div className="relative">
            <input
              type="text"
              value={
                selectedDates.checkIn
                  ? format(selectedDates.checkIn, "MMM dd, yyyy")
                  : ""
              }
              onClick={() => setCalendarMode("checkIn")}
              readOnly
              placeholder="Select date"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900
                focus:outline-none focus:border-primary cursor-pointer"
            />
            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-out Date
          </label>
          <div className="relative">
            <input
              type="text"
              value={
                selectedDates.checkOut
                  ? format(selectedDates.checkOut, "MMM dd, yyyy")
                  : ""
              }
              onClick={() => {
                if (selectedDates.checkIn) {
                  setCalendarMode("checkOut");
                }
              }}
              readOnly
              placeholder="Select date"
              className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900
                focus:outline-none focus:border-primary cursor-pointer
                ${
                  !selectedDates.checkIn ? "opacity-50 cursor-not-allowed" : ""
                }`}
              disabled={!selectedDates.checkIn}
            />
            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 mb-4">
        * Check-out date must be at least one day after check-in date
      </div>

      <style>{`
        .rdp {
          --rdp-cell-size: 40px;
          --rdp-accent-color: #FF69B4;
          --rdp-background-color: #FFE4E1;
          margin: 0;
        }
        .rdp-button:focus-visible {
          outline: none !important;
          background-color: transparent !important;
          box-shadow: none !important;
        }
        .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
          background-color: #FFE4E1 !important;
          color: #FF69B4 !important;
        }
        .rdp-nav_button {
          color: #FF69B4 !important;
        }
        .rdp-nav_button:hover {
          background-color: #FFE4E1 !important;
        }
        .rdp-day {
          color: #1F2937;
          font-weight: 500;
        }
        .rdp-day_selected {
          background-color: var(--rdp-accent-color) !important;
          color: white !important;
        }
        .rdp-day_range_middle {
          background-color: var(--rdp-background-color);
          color: var(--rdp-accent-color);
        }
        .rdp-day_disabled {
          color: #D1D5DB;
        }
        .rdp-day_outside {
          opacity: 0.5;
        }
        .rdp-caption {
          padding: 0 0 1rem 0;
        }
        .rdp-caption_label {
          color: #1F2937;
          font-weight: 600;
          font-size: 1rem;
        }
        .rdp-head_cell {
          color: #1F2937;
          font-weight: 600;
          font-size: 0.875rem;
        }
      `}</style>

      <DayPicker
        mode="single"
        selected={
          calendarMode === "checkIn"
            ? selectedDates.checkIn || undefined
            : selectedDates.checkOut || undefined
        }
        onSelect={handleDateSelect}
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        fromDate={getMinDate()}
        numberOfMonths={2}
        pagedNavigation
        showOutsideDays
        className="!font-sans"
      />

      <div className="mt-4 grid grid-cols-3 gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#FF69B4]"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#FFE4E1]"></div>
          <span>In Range</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#FEE2E2]"></div>
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`w-5 h-5 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}
