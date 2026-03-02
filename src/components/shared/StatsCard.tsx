"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sword, Heart, Zap, Shield, Scale, Star } from "lucide-react";

interface Session {
  splitType?: string;
  cardioDone?: boolean;
  cardioDuration?: number;
}

interface ExerciseLog {
  volumeKg: number;
}

interface WeightLogEntry {
  weight: number;
}

interface User {
  weight?: number;
  activityStreak?: number;
  shields?: number;
}

interface Props {
  user: User;
  sessions: Session[];
  exerciseLogs: ExerciseLog[];
  weightLogs: WeightLogEntry[];
}

function StatBar({
  label,
  value,
  color,
  icon: Icon,
  detail,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  detail: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" style={{ color }} />
          <span className="cinzel text-xs font-bold" style={{ color }}>
            {label}
          </span>
        </div>
        <span className="cinzel text-xs text-[var(--text-muted)]">{detail}</span>
      </div>
      <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(100, value)}%`,
            background: `linear-gradient(90deg, ${color}aa, ${color})`,
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>
    </div>
  );
}

export default function StatsCard({ user, sessions, exerciseLogs, weightLogs }: Props) {
  const strengthRaw =
    exerciseLogs.length > 0
      ? exerciseLogs.reduce((a, l) => a + l.volumeKg, 0) / exerciseLogs.length
      : 0;
  const strength = Math.min(100, (strengthRaw / 3000) * 100);

  const cardioMin = sessions.reduce((a, s) => a + (s.cardioDuration || 0), 0);
  const endurance = Math.min(100, (cardioMin / 600) * 100);

  const legsCount = sessions.filter((s) => s.splitType === "LEGS").length;
  const power = Math.min(100, legsCount * 10);

  const consistency = Math.min(
    100,
    (user.activityStreak || 0) * 5 + (user.shields || 0) * 3
  );

  const currentWeight = weightLogs[0]?.weight ?? null;
  const startWeight = user.weight;
  let body = 50;
  if (currentWeight !== null && startWeight) {
    const delta = currentWeight - startWeight;
    body = Math.min(100, Math.max(0, 50 + delta * -2));
  }

  const overall = Math.round(
    strength * 0.25 + endurance * 0.2 + power * 0.2 + consistency * 0.25 + body * 0.1
  );

  const stats = [
    { label: "Strength", value: strength, color: "#e05a2b", icon: Sword, detail: `${strengthRaw.toFixed(0)} kg avg vol` },
    { label: "Endurance", value: endurance, color: "#22c55e", icon: Heart, detail: `${cardioMin} min cardio` },
    { label: "Power", value: power, color: "#a855f7", icon: Zap, detail: `${legsCount} leg days` },
    { label: "Consistency", value: consistency, color: "#f0c040", icon: Shield, detail: `${user.activityStreak || 0}d streak` },
    {
      label: "Body", value: body, color: "#38bdf8", icon: Scale,
      detail: currentWeight !== null ? `${currentWeight} kg` : startWeight ? `${startWeight} kg` : "untracked",
    },
  ];

  const overallColor = overall >= 75 ? "#f0c040" : overall >= 50 ? "#22c55e" : overall >= 25 ? "#38bdf8" : "#888";

  return (
    <Card className="relative overflow-hidden border-[var(--xp-gold)]/15">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--xp-gold)]/3 via-transparent to-purple-500/3 pointer-events-none" />
      <CardHeader className="pb-3 relative z-10">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 cinzel text-sm">
            <Star className="w-4 h-4 text-[var(--xp-gold)]" />
            <span>Player Attributes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[var(--text-muted)] cinzel">OVERALL</span>
            <span className="cinzel text-lg font-black" style={{ color: overallColor }}>{overall}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
        {stats.map((s) => (
          <StatBar key={s.label} {...s} />
        ))}
        <p className="text-[10px] text-[var(--text-muted)] text-center pt-1 italic">
          Stats derived from your real training data — proof of work.
        </p>
      </CardContent>
    </Card>
  );
}
