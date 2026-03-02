"use client";

import { useEffect, useState } from "react";
import { getLevelData } from "@/lib/xp";
import { daysSince } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SplitRing from "@/components/shared/SplitRing";
import ActivityHeatmap from "@/components/shared/ActivityHeatmap";
import StatsCard from "@/components/shared/StatsCard";
import { Shield, Flame, Target, Zap, AlertTriangle, Trophy, TrendingDown, TrendingUp } from "lucide-react";
import confetti from "canvas-confetti";

export default function Dashboard({ user, refreshKey }: { user: any; refreshKey: number }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [freshUser, setFreshUser] = useState(user);
  const [exerciseLogs, setExerciseLogs] = useState<any[]>([]);
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const levelData = getLevelData(freshUser.xp);
  const [prevLevel, setPrevLevel] = useState(levelData.level);

  useEffect(() => {
    if (levelData.level > prevLevel) {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ["#f0c040","#e05a2b","#3b82f6","#dc2626"] });
      setPrevLevel(levelData.level);
    }
  }, [levelData.level, prevLevel]);

  useEffect(() => {
    const fetchData = async () => {
      const [sessionRes, userRes, exRes, wtRes] = await Promise.all([
        fetch("/api/sessions"),
        fetch("/api/user"),
        fetch("/api/exercises"),
        fetch("/api/weight"),
      ]);
      const sessionData = await sessionRes.json();
      const userData = await userRes.json();
      const exData = await exRes.json();
      const wtData = await wtRes.json();
      if (sessionData.sessions) setSessions(sessionData.sessions);
      if (userData.user) setFreshUser(userData.user);
      if (exData.logs) setExerciseLogs(exData.logs);
      if (wtData.logs) setWeightLogs(wtData.logs);
    };
    fetchData();
  }, [refreshKey]);

  // Split counts
  const pushCount = sessions.filter((s) => s.splitType === "PUSH").length;
  const pullCount = sessions.filter((s) => s.splitType === "PULL").length;
  const legsCount = sessions.filter((s) => s.splitType === "LEGS").length;

  // Last sessions per type
  const lastPush = sessions.find((s) => s.splitType === "PUSH");
  const lastPull = sessions.find((s) => s.splitType === "PULL");
  const lastLegs = sessions.find((s) => s.splitType === "LEGS");

  // Cardio stats
  const cardioSessions = sessions.filter((s) => s.cardioDone).length;
  const cardioTotalMin = sessions.filter((s) => s.cardioDone).reduce((a, s) => a + (s.cardioDuration || 0), 0);
  const totalSessions = sessions.length;
  const cardioPercent = totalSessions ? Math.round((cardioSessions / totalSessions) * 100) : 0;
  const perfectSessions = sessions.filter((s) => s.isPerfect).length;

  // Weekly ring
  const getWeekStart = () => {
    const now = new Date(); const d = new Date(now);
    const day = d.getDay();
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1)); d.setHours(0,0,0,0);
    return d;
  };
  const weekStart = getWeekStart();
  const thisWeek = sessions.filter((s) => new Date(s.date) >= weekStart);
  const weekPush = thisWeek.some((s) => s.splitType === "PUSH");
  const weekPull = thisWeek.some((s) => s.splitType === "PULL");
  const weekLegs = thisWeek.some((s) => s.splitType === "LEGS");

  // Warnings
  let splitWarning: string | null = null;
  if (daysSince(lastPush?.date) >= 4 && pushCount > 0) splitWarning = "PUSH";
  else if (daysSince(lastPull?.date) >= 4 && pullCount > 0) splitWarning = "PULL";
  else if (daysSince(lastLegs?.date) >= 4 && legsCount > 0) splitWarning = "LEGS";
  const cardioWarning = sessions.length >= 2 && !sessions[0].cardioDone && !sessions[1].cardioDone;

  const recencyLabel = (days: number) => {
    if (days === 0) return "Today";
    if (days === 999) return "Never";
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  };

  const splitCards = [
    { key: "PUSH", count: pushCount, color: "var(--push-color)", days: daysSince(lastPush?.date), glowClass: "glow-push" },
    { key: "PULL", count: pullCount, color: "var(--pull-color)", days: daysSince(lastPull?.date), glowClass: "glow-pull" },
    { key: "LEGS", count: legsCount, color: "var(--legs-color)", days: daysSince(lastLegs?.date), glowClass: "glow-legs" },
  ];

  // Recent PRs
  const recentPRs = exerciseLogs.filter((l) => l.isPR).slice(0, 3);

  // Weight stats
  const currentWeight = weightLogs[0]?.weight ?? null;
  const startWeight = freshUser.weight;
  const weightDelta = currentWeight !== null && startWeight ? +(currentWeight - startWeight).toFixed(1) : null;

  return (
    <div className="space-y-4 pb-4">
      {/* Warnings */}
      {splitWarning && (
        <div className="flex items-center gap-2 bg-[var(--warning-amber)]/10 border border-[var(--warning-amber)]/50 rounded-lg p-3 text-[var(--warning-amber)] text-sm font-bold animate-pulse">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{splitWarning} hasn&apos;t been trained in 4+ days. Stay balanced.</span>
        </div>
      )}
      {cardioWarning && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm font-bold animate-pulse">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Cardio skipped twice in a row. Don&apos;t break the habit.</span>
        </div>
      )}

      {/* Hero Card */}
      <Card className="relative overflow-hidden border-[var(--xp-gold)]/20">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--xp-gold)]/5 via-transparent to-transparent pointer-events-none" />
        <CardContent className="pt-6 pb-5 relative z-10">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h2 className="cinzel text-2xl font-bold text-white tracking-wider">{freshUser.name}</h2>
              <p className="cinzel text-[var(--xp-gold)] text-sm flex items-center gap-1.5 mt-0.5">
                <Zap className="w-4 h-4" /> Level {levelData.level} · {levelData.title}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5 bg-[var(--xp-gold)]/10 border border-[var(--xp-gold)]/20 rounded-lg px-2.5 py-1.5">
                <Shield className="w-3.5 h-3.5 text-[var(--xp-gold)]" />
                <span className="cinzel text-[var(--xp-gold)] text-sm font-bold">{freshUser.shields || 0}</span>
              </div>
              <div className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 rounded-lg px-2.5 py-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-orange-400 text-sm font-bold">{freshUser.activityStreak || 0}</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1.5 text-xs text-[var(--text-muted)]">
              <span>XP Progress</span>
              <span>{levelData.xpNeeded === 0 ? "MAX LEVEL" : `${freshUser.xp} / ${levelData.nextThreshold} XP`}</span>
            </div>
            <Progress value={levelData.progressPercent} className="h-5" />
          </div>
        </CardContent>
      </Card>

      {/* Player Attributes (RPG Stats Card) */}
      <StatsCard
        user={freshUser}
        sessions={sessions}
        exerciseLogs={exerciseLogs}
        weightLogs={weightLogs}
      />

      {/* Recent PRs strip */}
      {recentPRs.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-[var(--xp-gold)]">
              <Trophy className="w-4 h-4" /> Recent Personal Records
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentPRs.map((pr) => (
              <div key={pr._id} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                <div>
                  <span className="text-sm font-bold text-white">{pr.exerciseName}</span>
                  <span className="text-xs text-[var(--text-muted)] ml-2">{pr.muscleGroup}</span>
                </div>
                <Badge variant="perfect" className="text-[10px]">🏆 {pr.volumeKg.toFixed(0)} kg</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Weight card */}
      {currentWeight !== null && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">⚖ Body Weight</span>
              {weightDelta !== null && (
                <span className={`text-xs flex items-center gap-1 ${weightDelta < 0 ? "text-[var(--cardio-color)]" : weightDelta > 0 ? "text-orange-400" : "text-[var(--text-muted)]"}`}>
                  {weightDelta > 0 ? <TrendingUp className="w-3 h-3" /> : weightDelta < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                  {weightDelta > 0 ? "+" : ""}{weightDelta} kg from start
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--bg-dark)] rounded-lg p-3 text-center border border-white/5">
                <div className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider mb-1">Current</div>
                <div className="text-xl font-bold text-white">{currentWeight}<span className="text-xs opacity-50"> kg</span></div>
              </div>
              <div className="bg-[var(--bg-dark)] rounded-lg p-3 text-center border border-white/5">
                <div className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider mb-1">Starting</div>
                <div className="text-xl font-bold text-white">{startWeight ?? "—"}<span className="text-xs opacity-50"> kg</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PPL Ring + quick stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="flex items-center justify-center py-5">
          <SplitRing pushDone={weekPush} pullDone={weekPull} legsDone={weekLegs} />
        </Card>
        <div className="space-y-3">
          {splitCards.map((s) => (
            <div key={s.key} className={`panel p-3 flex items-center justify-between border-l-2 transition-all ${s.days <= 1 ? s.glowClass : ""}`} style={{ borderLeftColor: s.color }}>
              <div>
                <div className="cinzel text-xs font-bold" style={{ color: s.color }}>{s.key}</div>
                <div className="text-[10px] text-[var(--text-muted)]">{recencyLabel(s.days)}</div>
              </div>
              <div className="cinzel text-2xl font-bold text-white">{s.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cardio Panel */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-[var(--cardio-color)]">
            <span>Daily Cardio</span>
            <span className="text-2xl">🏃</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[var(--bg-dark)] rounded-lg p-3 text-center border border-white/5">
              <div className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider mb-1">Hit Rate</div>
              <div className={`text-xl font-bold ${cardioPercent >= 80 ? "text-[var(--cardio-color)]" : cardioPercent <= 50 ? "text-[var(--warning-amber)]" : "text-white"}`}>{cardioPercent}%</div>
            </div>
            <div className="bg-[var(--bg-dark)] rounded-lg p-3 text-center border border-white/5">
              <div className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider mb-1">Total</div>
              <div className="text-xl font-bold text-white">{cardioTotalMin}<span className="text-xs opacity-50">m</span></div>
            </div>
            <div className="bg-[var(--bg-dark)] rounded-lg p-3 text-center border border-white/5">
              <div className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider mb-1">Perfect</div>
              <div className="text-xl font-bold text-[var(--xp-gold)]">{perfectSessions}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Player stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[var(--text-muted)]" /> Player Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { label: "Total Sessions", value: totalSessions },
            { label: "Training Goal", value: `${freshUser.daysPerWeek} / wk` },
            { label: "Streak", value: `${freshUser.activityStreak || 0} days 🔥` },
            { label: "Shields Earned", value: `${freshUser.shields || 0} 🛡` },
          ].map((stat) => (
            <div key={stat.label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
              <span className="text-sm text-[var(--text-muted)]">{stat.label}</span>
              <span className="font-bold text-white">{stat.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Activity Heatmap */}
      {sessions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Activity · Last 12 Weeks</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityHeatmap sessions={sessions} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
