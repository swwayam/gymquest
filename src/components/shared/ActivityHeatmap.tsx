"use client";

interface ActivityHeatmapProps {
  sessions: Array<{
    date: string;
    isPerfect: boolean;
    cardioDone: boolean;
    splitType?: string;
  }>;
}

export default function ActivityHeatmap({ sessions }: ActivityHeatmapProps) {
  // Build last 84 days (12 weeks) map
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sessionMap = new Map<string, { isPerfect: boolean; cardioDone: boolean; splitType?: string }>();
  sessions.forEach((s) => {
    const d = new Date(s.date);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    sessionMap.set(key, { isPerfect: s.isPerfect, cardioDone: s.cardioDone, splitType: s.splitType });
  });

  // Generate 84-day grid from oldest to newest
  const days: Array<{ date: Date; key: string }> = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push({ date: d, key: d.toISOString().slice(0, 10) });
  }

  const getCellClass = (key: string) => {
    const s = sessionMap.get(key);
    if (!s) return "heatmap-none";
    if (s.isPerfect) return "heatmap-perfect";
    if (s.cardioDone && s.splitType && s.splitType !== "NONE") return "heatmap-good";
    return "heatmap-partial";
  };

  const getCellTitle = (key: string, date: Date) => {
    const s = sessionMap.get(key);
    const label = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    if (!s) return `${label}: Rest`;
    if (s.isPerfect) return `${label}: Perfect Session ⭐`;
    if (s.cardioDone && s.splitType !== "NONE") return `${label}: ${s.splitType} + Cardio`;
    if (s.cardioDone) return `${label}: Cardio only`;
    return `${label}: ${s.splitType} only`;
  };

  // Split into 12 columns of 7 rows (weeks)
  const weeks: typeof days[] = [];
  for (let w = 0; w < 12; w++) {
    weeks.push(days.slice(w * 7, w * 7 + 7));
  }

  const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div className="w-full">
      {/* Month label - show every 4w */}
      <div className="flex gap-[3px] mb-1 pl-0">
        {weeks.map((week, wi) => {
          const firstDay = week[0]?.date;
          const label = firstDay && (wi === 0 || firstDay.getDate() <= 7)
            ? monthLabels[firstDay.getMonth()]
            : "";
          return (
            <div key={wi} className="w-[calc((100%-33px)/12)] text-[9px] text-[var(--text-muted)]">
              {label}
            </div>
          );
        })}
      </div>
      {/* Grid */}
      <div className="flex gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px] flex-1">
            {week.map((day, di) => (
              <div
                key={di}
                title={getCellTitle(day.key, day.date)}
                className={`rounded-[2px] aspect-square ${getCellClass(day.key)} transition-all hover:opacity-80 hover:scale-110 cursor-default`}
              />
            ))}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-2 mt-2 justify-end text-[10px] text-[var(--text-muted)]">
        <span>Less</span>
        {["heatmap-none","heatmap-partial","heatmap-good","heatmap-perfect"].map((c) => (
          <div key={c} className={`w-3 h-3 rounded-[2px] ${c}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
