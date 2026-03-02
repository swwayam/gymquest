"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Scale, TrendingUp, TrendingDown, Minus, Plus } from "lucide-react";

interface WeightEntry {
  _id: string;
  date: string;
  weight: number;
  note?: string;
}

interface WeightTrackerProps {
  user: { weight?: number } | null;
}

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const W = 160;
  const H = 40;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 8) - 4;
    return `${x},${y}`;
  });
  const last = pts[pts.length - 1];

  return (
    <svg width={W} height={H} className="overflow-visible">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="var(--xp-gold)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.7"
      />
      <circle
        cx={last.split(",")[0]}
        cy={last.split(",")[1]}
        r="3.5"
        fill="var(--xp-gold)"
      />
    </svg>
  );
}

export default function WeightTracker({ user }: WeightTrackerProps) {
  const [logs, setLogs] = useState<WeightEntry[]>([]);
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [trend, setTrend] = useState<"up" | "down" | "stable" | null>(null);

  const computeTrend = (entries: WeightEntry[]): "up" | "down" | "stable" | null => {
    const now = Date.now();
    const week = 7 * 24 * 3600 * 1000;
    const recent = entries.filter((l) => now - new Date(l.date).getTime() <= week);
    const prior = entries.filter(
      (l) =>
        now - new Date(l.date).getTime() > week &&
        now - new Date(l.date).getTime() <= week * 2
    );
    const avg = (arr: WeightEntry[]) =>
      arr.length ? arr.reduce((a, l) => a + l.weight, 0) / arr.length : null;
    const r = avg(recent);
    const p = avg(prior);
    if (r === null || p === null) return null;
    if (r - p > 0.3) return "up";
    if (p - r > 0.3) return "down";
    return "stable";
  };

  const fetchLogs = async () => {
    const res = await fetch("/api/weight");
    const data = await res.json();
    if (data.logs) {
      setLogs(data.logs);
      setTrend(computeTrend(data.logs));
    }
  };

  useEffect(() => { fetchLogs(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLog = async () => {
    if (!weight || isNaN(Number(weight))) return;
    setSubmitting(true);
    await fetch("/api/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weight: Number(weight), note: note || undefined }),
    });
    setWeight("");
    setNote("");
    await fetchLogs();
    setSubmitting(false);
  };

  // Sorted old → new for sparkline
  const sorted = [...logs].reverse();
  const sparkData = sorted.slice(-12).map((l) => l.weight);
  // (trend is computed in fetchLogs outside render path)

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  const startWeight = user?.weight || null;
  const currentWeight = logs[0]?.weight ?? null;
  const delta =
    currentWeight !== null && startWeight !== null
      ? +(currentWeight - startWeight).toFixed(1)
      : null;

  return (
    <div className="space-y-4 pb-4">
      <h2 className="cinzel text-2xl text-center text-[var(--text-main)]">
        ⚖ Weight Log
      </h2>

      {/* Log form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-[var(--text-muted)] flex items-center gap-2">
            <Scale className="w-4 h-4" /> Log Today&apos;s Weight
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.1"
              placeholder="e.g. 78.5 kg"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="flex-1 text-center text-lg font-bold"
            />
            <Button
              onClick={handleLog}
              disabled={submitting || !weight}
              className="px-4"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          <Input
            placeholder="Optional note (e.g. post-workout, morning)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="text-sm"
          />
        </CardContent>
      </Card>

      {/* Stats row */}
      {currentWeight !== null && (
        <div className="grid grid-cols-3 gap-3">
          <div className="panel p-3 text-center">
            <div className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider mb-1">
              Current
            </div>
            <div className="text-xl font-bold text-white">
              {currentWeight}
              <span className="text-xs opacity-50"> kg</span>
            </div>
          </div>
          <div className="panel p-3 text-center">
            <div className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider mb-1">
              Change
            </div>
            <div
              className={`text-xl font-bold ${
                delta === null
                  ? "text-white"
                  : delta > 0
                  ? "text-orange-400"
                  : delta < 0
                  ? "text-[var(--cardio-color)]"
                  : "text-white"
              }`}
            >
              {delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta}`}
            </div>
          </div>
          <div className="panel p-3 text-center">
            <div className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider mb-1">
              Trend
            </div>
            <div className="flex justify-center items-center h-6">
              {trend === "up" ? (
                <TrendingUp className="w-5 h-5 text-orange-400" />
              ) : trend === "down" ? (
                <TrendingDown className="w-5 h-5 text-[var(--cardio-color)]" />
              ) : trend === "stable" ? (
                <Minus className="w-5 h-5 text-[var(--xp-gold)]" />
              ) : (
                <span className="text-[var(--text-muted)] text-xs">—</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sparkline */}
      {sparkData.length >= 2 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex justify-between items-center">
              <span>Last {sparkData.length} Weigh-ins</span>
              <span className="text-xs text-[var(--text-muted)] font-mono">
                {Math.min(...sparkData)} — {Math.max(...sparkData)} kg
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-2">
            <Sparkline data={sparkData} />
          </CardContent>
        </Card>
      )}

      {/* Log list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-0">
          {logs.length === 0 ? (
            <p className="text-center text-sm text-[var(--text-muted)] p-6 italic">
              No entries yet. Log your first weigh-in above.
            </p>
          ) : (
            <div>
              {logs.slice(0, 15).map((l, i) => (
                <div
                  key={l._id}
                  className={`flex justify-between items-center px-4 py-3 ${
                    i !== 0 ? "border-t border-white/5" : ""
                  }`}
                >
                  <div>
                    <div className="text-xs text-[var(--text-muted)] font-mono">
                      {formatDate(l.date)}
                    </div>
                    {l.note && (
                      <div className="text-[10px] text-[var(--text-muted)] italic mt-0.5">
                        {l.note}
                      </div>
                    )}
                  </div>
                  <div className="cinzel font-bold text-white">
                    {l.weight}
                    <span className="text-xs opacity-50"> kg</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
