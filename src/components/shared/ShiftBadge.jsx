import React from "react";
import { Clock, RotateCcw, Sun, Moon, Sunset, Phone, Shuffle } from "lucide-react";

const SHIFT_MAP = {
  rotating: { label: "Rotating Shifts", icon: RotateCcw, color: "bg-violet-100 text-violet-700" },
  fixed_days: { label: "Fixed Days", icon: Sun, color: "bg-yellow-100 text-yellow-700" },
  fixed_nights: { label: "Fixed Nights", icon: Moon, color: "bg-indigo-100 text-indigo-700" },
  fixed_evenings: { label: "Fixed Evenings", icon: Sunset, color: "bg-orange-100 text-orange-700" },
  "12_hour_rotating": { label: "12-Hour Rotating", icon: RotateCcw, color: "bg-teal-100 text-teal-700" },
  "24_on_48_off": { label: "24 On / 48 Off", icon: Clock, color: "bg-red-100 text-red-700" },
  "48_on_96_off": { label: "48 On / 96 Off", icon: Clock, color: "bg-rose-100 text-rose-700" },
  on_call: { label: "On-Call", icon: Phone, color: "bg-emerald-100 text-emerald-700" },
  split_shift: { label: "Split Shift", icon: Shuffle, color: "bg-blue-100 text-blue-700" },
  irregular_freelance: { label: "Irregular / Freelance", icon: Shuffle, color: "bg-purple-100 text-purple-700" },
};

export default function ShiftBadge({ shiftPattern, size = "sm" }) {
  const info = SHIFT_MAP[shiftPattern] || { label: shiftPattern, icon: Clock, color: "bg-gray-100 text-gray-700" };
  const Icon = info.icon;
  const isSmall = size === "sm";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${info.color} ${isSmall ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"}`}>
      <Icon className={isSmall ? "w-3 h-3" : "w-4 h-4"} />
      {info.label}
    </span>
  );
}

export { SHIFT_MAP };