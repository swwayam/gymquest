"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, ChevronDown, ChevronUp } from "lucide-react";

interface SetEntry { reps: number; weightKg: number; }
interface ExerciseLog {
  _id: string; exerciseName: string; muscleGroup: string;
  sets: SetEntry[]; volumeKg: number; isPR: boolean; date: string;
}
interface GroupedExercise {
  name: string; muscleGroup: string; logs: ExerciseLog[];
  prVolume: number; totalVolume: number;
}

const GROUP_COLORS: Record<string, string> = {
  Chest: "var(--push-color)", Back: "var(--pull-color)", Legs: "var(--legs-color)",
  Shoulders: "#818cf8", Arms: "#fb923c", Core: "#22d3ee",
};

export default function ExerciseHistory({ refreshKey }: { refreshKey: number }) {
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/exercises")
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        if (d.logs) setLogs(d.logs);
        setLoading(false);
      });
    return () => { mounted = false; };
  }, [refreshKey]);

  const groups: GroupedExercise[] = Object.values(
    logs.reduce((acc: Record<string, GroupedExercise>, log) => {
      const key = log.exerciseName.toLowerCase();
      if (!acc[key]) acc[key] = { name: log.exerciseName, muscleGroup: log.muscleGroup, logs: [], prVolume: 0, totalVolume: 0 };
      acc[key].logs.push(log);
      acc[key].totalVolume += log.volumeKg;
      if (log.volumeKg > acc[key].prVolume) acc[key].prVolume = log.volumeKg;
      return acc;
    }, {})
  ).sort((a, b) => b.totalVolume - a.totalVolume);

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  if (loading) return (
    <div className="space-y-3">
      {[1,2,3].map(i => <div key={i} className="h-16 animate-pulse bg-white/5 rounded-xl" />)}
    </div>
  );
  if (groups.length === 0) return (
    <div className="panel p-8 text-center text-[var(--text-muted)] italic rounded-xl">
      No exercises logged yet. Add exercises in your next session.
    </div>
  );

  return (
    <div className="space-y-3">
      {groups.map((g) => {
        const color = GROUP_COLORS[g.muscleGroup] || "var(--xp-gold)";
        const isOpen = expanded[g.name];
        return (
          <Card key={g.name} className="overflow-hidden">
            <button className="w-full text-left" onClick={() =>
              setExpanded((p) => ({ ...p, [g.name]: !p[g.name] }))
            }>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1 rounded-full self-stretch min-h-[2rem]" style={{ background: color }} />
                    <div>
                      <div className="font-bold text-white text-sm">{g.name}</div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                        {g.muscleGroup} · {g.logs.length} session{g.logs.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-[var(--xp-gold)] text-xs font-bold">
                        <Trophy className="w-3 h-3" /> PR: {g.prVolume.toFixed(0)} kg
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{g.totalVolume.toFixed(0)} kg total</div>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
                  </div>
                </div>
              </CardContent>
            </button>
            {isOpen && (
              <div className="border-t border-white/5">
                {g.logs.slice(0, 10).map((log, i) => (
                  <div key={log._id} className={`px-4 py-3 flex justify-between items-start ${i !== 0 ? "border-t border-white/5" : ""} bg-[var(--bg-dark)]/40`}>
                    <div>
                      <div className="text-xs text-[var(--text-muted)] font-mono">{fmt(log.date)}</div>
                      <div className="text-xs text-white mt-1 space-x-1.5">
                        {log.sets.map((s, si) => (
                          <span key={si} className="font-mono text-[var(--text-muted)]">{s.reps}×{s.weightKg}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      {log.isPR && <Badge variant="perfect" className="text-[9px] mb-1">🏆 PR</Badge>}
                      <div className="text-xs font-bold text-white">{log.volumeKg.toFixed(0)} kg</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
