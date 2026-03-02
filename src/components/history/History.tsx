"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Zap } from "lucide-react";
import ExerciseHistory from "@/components/exercises/ExerciseHistory";

type SplitFilter = "ALL" | "PUSH" | "PULL" | "LEGS" | "CARDIO" | "EXERCISES";

const SPLIT_BADGE_VARIANT: Record<string, "push" | "pull" | "legs"> = {
  PUSH: "push", PULL: "pull", LEGS: "legs",
};

export default function HistoryTab({ user, refreshKey }: { user: any; refreshKey: number }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [filter, setFilter] = useState<SplitFilter>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        if (d.sessions) setSessions(d.sessions);
        setLoading(false);
      });
    return () => { mounted = false; };
  }, [refreshKey]);

  const filtered = sessions.filter((s) => {
    if (filter === "ALL") return true;
    if (filter === "CARDIO") return s.cardioDone && (!s.splitType || s.splitType === "NONE");
    if (filter === "EXERCISES") return false; // handled by ExerciseHistory component
    return s.splitType === filter;
  });

  const filters: SplitFilter[] = ["ALL", "PUSH", "PULL", "LEGS", "CARDIO", "EXERCISES"];
  const filterColors: Record<SplitFilter, string> = {
    ALL: "var(--xp-gold)", PUSH: "var(--push-color)", PULL: "var(--pull-color)",
    LEGS: "var(--legs-color)", CARDIO: "var(--cardio-color)", EXERCISES: "#a855f7",
  };

  return (
    <div className="space-y-4 pb-4">
      <h2 className="cinzel text-2xl text-center text-[var(--text-main)]">Battle Log</h2>

      {/* Filter Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold cinzel border transition-all ${filter === f ? "scale-105" : "border-white/10 opacity-60 hover:opacity-80"}`}
            style={filter === f ? {
              borderColor: filterColors[f], background: `${filterColors[f]}20`,
              color: filterColors[f], boxShadow: `0 0 10px ${filterColors[f]}30`,
            } : { color: "var(--text-muted)" }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Exercise History sub-view */}
      {filter === "EXERCISES" && <ExerciseHistory refreshKey={refreshKey} />}

      {/* Session list */}
      {filter !== "EXERCISES" && (
        loading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => <div key={i} className="panel p-4 h-20 animate-pulse bg-white/5" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="panel p-8 text-center text-[var(--text-muted)] italic">
            {filter === "ALL" ? "No sessions logged yet. The path begins today." : `No ${filter} sessions found.`}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((s) => {
              const hasSplit = s.splitType && s.splitType !== "NONE";
              const splitColor = s.splitType === "PUSH" ? "var(--push-color)" : s.splitType === "PULL" ? "var(--pull-color)" : "var(--legs-color)";
              return (
                <Card key={s._id} className="relative overflow-hidden hover:border-white/15 transition-colors">
                  {s.isPerfect && (
                    <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none z-10">
                      <div className="absolute transform rotate-45 bg-[var(--xp-gold)] text-[var(--bg-dark)] text-[9px] font-black py-0.5 right-[-28px] top-[12px] w-[100px] text-center shadow-md">PERFECT</div>
                    </div>
                  )}
                  {hasSplit && <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ background: splitColor }} />}

                  <CardContent className="pl-5 pr-4 py-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-[var(--text-muted)] font-mono">{formatDate(s.date)}</span>
                      <div className="flex items-center gap-1 text-[var(--xp-gold)]">
                        <Zap className="w-3.5 h-3.5" />
                        <span className="cinzel font-bold text-sm">+{s.xpEarned}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {hasSplit ? (
                        <Badge variant={SPLIT_BADGE_VARIANT[s.splitType]}>{s.splitType} · {s.splitDuration}m</Badge>
                      ) : (
                        <Badge variant="muted">Recovery</Badge>
                      )}
                      {s.cardioDone ? (
                        <Badge variant="cardio">{s.cardioType} · {s.cardioDuration}m{s.cardioDuration >= 20 ? " 🔥" : ""}</Badge>
                      ) : (
                        <Badge variant="warning">Cardio Skipped</Badge>
                      )}
                      {s.isPerfect && <Badge variant="perfect">⭐ Perfect</Badge>}
                    </div>
                    {s.splitNotes && (
                      <p className="text-xs text-[var(--text-muted)] mt-2 italic border-t border-white/5 pt-2">&quot;{s.splitNotes}&quot;</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
