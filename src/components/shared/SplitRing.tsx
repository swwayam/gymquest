"use client";

interface SplitRingProps {
  pushDone: boolean;
  pullDone: boolean;
  legsDone: boolean;
}

// SVG donut ring split into 3 arcs for Push/Pull/Legs
export default function SplitRing({ pushDone, pullDone, legsDone }: SplitRingProps) {
  const cx = 60, cy = 60, r = 48;
  const circumference = 2 * Math.PI * r;
  // 3 equal segments with small gaps
  const gap = 6;
  const segmentArc = (circumference - gap * 3) / 3;

  // Each segment: strokeDasharray = [filled, gap, rest...]
  // Offset so Push starts at top (-90deg = -circumference/4)
  const startOffset = circumference / 4;

  const segments = [
    { key: "push", done: pushDone, color: "var(--push-color)", offset: startOffset },
    { key: "pull", done: pullDone, color: "var(--pull-color)", offset: startOffset - (segmentArc + gap) },
    { key: "legs", done: legsDone, color: "var(--legs-color)", offset: startOffset - (segmentArc + gap) * 2 },
  ];

  const totalDone = [pushDone, pullDone, legsDone].filter(Boolean).length;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width="120" height="120" viewBox="0 0 120 120">
          {/* Background track */}
          {segments.map((seg, i) => (
            <circle
              key={`track-${seg.key}`}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="10"
              strokeDasharray={`${segmentArc} ${circumference - segmentArc}`}
              strokeDashoffset={seg.offset}
              strokeLinecap="round"
              transform="scale(1)"
            />
          ))}
          {/* Active arcs */}
          {segments.map((seg) => (
            <circle
              key={`arc-${seg.key}`}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.done ? seg.color : "transparent"}
              strokeWidth="10"
              strokeDasharray={`${segmentArc} ${circumference - segmentArc}`}
              strokeDashoffset={seg.offset}
              strokeLinecap="round"
              style={{
                filter: seg.done ? `drop-shadow(0 0 8px ${seg.color})` : "none",
                transition: "stroke 0.4s ease, filter 0.4s ease",
              }}
            />
          ))}
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="cinzel text-2xl font-bold text-white">{totalDone}/3</span>
          <span className="text-[9px] text-[var(--text-muted)] tracking-wider uppercase">This Week</span>
        </div>
      </div>
      {/* Labels */}
      <div className="flex gap-4 text-xs">
        {[
          { label: "PUSH", done: pushDone, color: "var(--push-color)" },
          { label: "PULL", done: pullDone, color: "var(--pull-color)" },
          { label: "LEGS", done: legsDone, color: "var(--legs-color)" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full transition-all"
              style={{
                background: s.done ? s.color : "rgba(255,255,255,0.15)",
                boxShadow: s.done ? `0 0 6px ${s.color}` : "none",
              }}
            />
            <span
              className="cinzel font-bold tracking-wider"
              style={{ color: s.done ? s.color : "var(--text-muted)" }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
