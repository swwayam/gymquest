"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { SkipForward, Plus } from "lucide-react";

interface RestTimerProps {
  initialSeconds?: number;
  onComplete: () => void;
  onSkip: () => void;
}

const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function RestTimer({
  initialSeconds = 90,
  onComplete,
  onSkip,
}: RestTimerProps) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [total, setTotal] = useState(initialSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setTimeout(onComplete, 300);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addTime = () => {
    setRemaining((r) => r + 30);
    setTotal((t) => t + 30);
  };

  const progress = remaining / total;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  // Colour: green → amber → red
  const ringColor =
    remaining > 30
      ? "var(--cardio-color)"
      : remaining > 10
      ? "var(--warning-amber)"
      : "#f87171";

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="flex flex-col items-center gap-3 py-3 fade-in-up">
      {/* Ring */}
      <div className="relative w-28 h-28">
        <svg
          className="absolute inset-0 -rotate-90"
          width="112"
          height="112"
          viewBox="0 0 112 112"
        >
          {/* Track */}
          <circle
            cx="56"
            cy="56"
            r={RADIUS}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress */}
          <circle
            cx="56"
            cy="56"
            r={RADIUS}
            stroke={ringColor}
            strokeWidth="8"
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.9s linear, stroke 0.5s ease",
              filter: `drop-shadow(0 0 8px ${ringColor}80)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="cinzel text-2xl font-bold tabular-nums"
            style={{ color: ringColor }}
          >
            {formatTime(remaining)}
          </span>
          <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
            rest
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 w-full max-w-xs">
        <button
          onClick={addTime}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-white/10 text-xs text-[var(--text-muted)] hover:text-white hover:border-white/30 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> +30s
        </button>
        <Button
          onClick={onSkip}
          size="sm"
          className="flex-[2] flex items-center justify-center gap-1.5 text-xs"
        >
          <SkipForward className="w-4 h-4" />
          Start Next Set
        </Button>
      </div>
    </div>
  );
}
