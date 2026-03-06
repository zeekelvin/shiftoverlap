import React from "react";
import { Clock } from "lucide-react";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const TIME_BLOCKS = ["morning", "afternoon", "evening", "night"];
const TIME_LABELS = ["AM", "PM", "Eve", "Night"];

function computeOverlap(scheduleA, scheduleB) {
  if (!scheduleA || !scheduleB) return { percentage: 0, overlaps: {} };

  let totalSlotsA = 0;
  let overlapCount = 0;
  const overlaps = {};

  DAYS.forEach((day) => {
    const slotsA = scheduleA[day] || [];
    const slotsB = scheduleB[day] || [];
    totalSlotsA += slotsA.length;
    const dayOverlaps = slotsA.filter((s) => slotsB.includes(s));
    if (dayOverlaps.length > 0) {
      overlaps[day] = dayOverlaps;
      overlapCount += dayOverlaps.length;
    }
  });

  const percentage = totalSlotsA > 0 ? Math.round((overlapCount / totalSlotsA) * 100) : 0;
  return { percentage, overlaps };
}

export default function ScheduleOverlapIndicator({ mySchedule, theirSchedule, compact = false }) {
  const { percentage, overlaps } = computeOverlap(mySchedule, theirSchedule);

  const getColor = (pct) => {
    if (pct >= 60) return "text-green-600";
    if (pct >= 30) return "text-yellow-600";
    return "text-red-500";
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 font-semibold text-sm ${getColor(percentage)}`}>
        <Clock className="w-4 h-4" />
        <span>{percentage}% overlap</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">Schedule Overlap</span>
        <span className={`text-lg font-bold ${getColor(percentage)}`}>{percentage}%</span>
      </div>

      {/* Visual grid */}
      <div className="grid grid-cols-8 gap-1 text-[10px]">
        <div></div>
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="text-center font-medium text-slate-400">{d}</div>
        ))}
        {TIME_BLOCKS.map((block, bi) => (
          <React.Fragment key={block}>
            <div className="text-right pr-1 font-medium text-slate-400 flex items-center justify-end">
              {TIME_LABELS[bi]}
            </div>
            {DAYS.map((day, di) => {
              const hasOverlap = overlaps[day]?.includes(block);
              const myAvail = mySchedule?.[day]?.includes(block);
              return (
                <div
                  key={`${day}-${block}`}
                  className={`h-5 rounded-sm transition-colors ${
                    hasOverlap
                      ? "bg-gradient-to-br from-green-400 to-emerald-500"
                      : myAvail
                      ? "bg-slate-200"
                      : "bg-slate-50 border border-slate-100"
                  }`}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center gap-4 text-[10px] text-slate-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-green-400 to-emerald-500" />
          Overlap
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-slate-200" />
          Your time
        </div>
      </div>
    </div>
  );
}

export { computeOverlap };