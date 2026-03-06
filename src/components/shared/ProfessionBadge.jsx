import React from "react";
import { 
  Heart, Siren, Flame, Shield, Radio, Factory, Plane, Truck, 
  Hotel, UtensilsCrossed, Store, Package, Sword, Lock, Home, HelpCircle 
} from "lucide-react";

const PROFESSION_MAP = {
  nurse: { label: "Nurse", icon: Heart, color: "bg-rose-100 text-rose-700" },
  doctor: { label: "Doctor", icon: Heart, color: "bg-blue-100 text-blue-700" },
  emt_paramedic: { label: "EMT / Paramedic", icon: Siren, color: "bg-red-100 text-red-700" },
  firefighter: { label: "Firefighter", icon: Flame, color: "bg-orange-100 text-orange-700" },
  police_officer: { label: "Police Officer", icon: Shield, color: "bg-indigo-100 text-indigo-700" },
  dispatcher: { label: "Dispatcher", icon: Radio, color: "bg-purple-100 text-purple-700" },
  security: { label: "Security", icon: Shield, color: "bg-slate-100 text-slate-700" },
  factory_worker: { label: "Factory Worker", icon: Factory, color: "bg-amber-100 text-amber-700" },
  pilot_flight_crew: { label: "Pilot / Flight Crew", icon: Plane, color: "bg-sky-100 text-sky-700" },
  truck_driver: { label: "Truck Driver", icon: Truck, color: "bg-emerald-100 text-emerald-700" },
  hotel_hospitality: { label: "Hotel / Hospitality", icon: Hotel, color: "bg-teal-100 text-teal-700" },
  restaurant_bar: { label: "Restaurant / Bar", icon: UtensilsCrossed, color: "bg-yellow-100 text-yellow-700" },
  retail: { label: "Retail", icon: Store, color: "bg-pink-100 text-pink-700" },
  warehouse: { label: "Warehouse", icon: Package, color: "bg-lime-100 text-lime-700" },
  military: { label: "Military", icon: Sword, color: "bg-green-100 text-green-700" },
  corrections_officer: { label: "Corrections Officer", icon: Lock, color: "bg-gray-100 text-gray-700" },
  home_health_aide: { label: "Home Health Aide", icon: Home, color: "bg-cyan-100 text-cyan-700" },
  other: { label: "Other", icon: HelpCircle, color: "bg-neutral-100 text-neutral-700" },
};

export default function ProfessionBadge({ profession, size = "sm" }) {
  const info = PROFESSION_MAP[profession] || PROFESSION_MAP.other;
  const Icon = info.icon;
  const isSmall = size === "sm";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${info.color} ${isSmall ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"}`}>
      <Icon className={isSmall ? "w-3 h-3" : "w-4 h-4"} />
      {info.label}
    </span>
  );
}

export { PROFESSION_MAP };