import React from "react";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TIME_BLOCKS = [
  { key: "morning",   label: "Morning",   short: "AM",    bg: "bg-amber-400",  light: "bg-amber-50 border border-amber-200",  text: "text-amber-700" },
  { key: "afternoon", label: "Afternoon", short: "PM",    bg: "bg-orange-400", light: "bg-orange-50 border border-orange-200", text: "text-orange-700" },
  { key: "evening",   label: "Evening",   short: "Eve",   bg: "bg-violet-500", light: "bg-violet-50 border border-violet-200", text: "text-violet-700" },
  { key: "night",     label: "Night",     short: "Night", bg: "bg-indigo-600", light: "bg-indigo-50 border border-indigo-200",  text: "text-indigo-700" },
];

/**
 * Interactive weekly availability calendar.
 *
 * Props:
 *  - schedule: object { mon: ["morning","evening"], tue: [], ... }
 *  - onChange: (newSchedule) => void   — omit to make read-only
 *  - readOnly: bool
 *  - compact: bool  (smaller cells, no labels column)
 */
export default function WeeklyCalendar({ schedule = {}, onChange, readOnly = false, compact = false }) {
  const toggle = (day, block) => {
    if (readOnly || !onChange) return;
    const current = schedule[day] || [];
    const updated = current.includes(block)
      ? current.filter((b) => b !== block)
      : [...current, block];
    onChange({ ...schedule, [day]: updated });
  };

  // Long-press / drag support: track pointer-down to allow drag-painting
  const [painting, setPainting] = React.useState(null); // "add" | "remove"

  const handlePointerDown = (day, block) => {
    if (readOnly || !onChange) return;
    const current = schedule[day] || [];
    const mode = current.includes(block) ? "remove" : "add";
    setPainting(mode);
    applyPaint(day, block, mode);
  };

  const handlePointerEnter = (day, block) => {
    if (!painting) return;
    applyPaint(day, block, painting);
  };

  const applyPaint = (day, block, mode) => {
    const current = schedule[day] || [];
    const alreadyOn = current.includes(block);
    if (mode === "add" && !alreadyOn) {
      onChange({ ...schedule, [day]: [...current, block] });
    } else if (mode === "remove" && alreadyOn) {
      onChange({ ...schedule, [day]: current.filter((b) => b !== block) });
    }
  };

  const cellSize = compact ? "h-7 w-full" : "h-9 w-full";

  return (
    <div
      className="select-none"
      onPointerUp={() => setPainting(null)}
      onPointerLeave={() => setPainting(null)}
    >
      {/* Header row */}
      <div className={`grid gap-1 mb-1`} style={{ gridTemplateColumns: compact ? `repeat(7, 1fr)` : `5rem repeat(7, 1fr)` }}>
        {!compact && <div />}
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            {d}
          </div>
        ))}
      </div>

      {/* Time-block rows */}
      {TIME_BLOCKS.map((block) => (
        <div
          key={block.key}
          className="grid gap-1 mb-1"
          style={{ gridTemplateColumns: compact ? `repeat(7, 1fr)` : `5rem repeat(7, 1fr)` }}
        >
          {!compact && (
            <div className={`flex items-center text-xs font-semibold ${block.text} pr-1`}>
              <span className="w-2 h-2 rounded-full mr-1.5 inline-block" style={{ backgroundColor: `var(--dot-${block.key})` }} />
              {block.label}
            </div>
          )}

          {DAYS.map((day) => {
            const active = (schedule[day] || []).includes(block.key);
            return (
              <div
                key={day}
                className={`${cellSize} rounded-lg cursor-pointer touch-none transition-all duration-100 flex items-center justify-center ${
                  active
                    ? `${block.bg} shadow-sm`
                    : readOnly
                    ? "bg-slate-100"
                    : "bg-slate-100 hover:bg-slate-200"
                }`}
                onPointerDown={() => handlePointerDown(day, block.key)}
                onPointerEnter={() => handlePointerEnter(day, block.key)}
              >
                {compact && active && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Legend */}
      {!compact && !readOnly && (
        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-slate-100">
          {TIME_BLOCKS.map((b) => (
            <div key={b.key} className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <div className={`w-3 h-3 rounded-sm ${b.bg}`} />
              {b.label}
            </div>
          ))}
          <span className="text-[11px] text-slate-400 ml-auto">Tap or drag to toggle</span>
        </div>
      )}

      <style>{`
        :root {
          --dot-morning: #fbbf24;
          --dot-afternoon: #fb923c;
          --dot-evening: #8b5cf6;
          --dot-night: #4f46e5;
        }
      `}</style>
    </div>
  );
}