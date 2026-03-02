"use client";

import { useState, useMemo } from "react";
import { calculateSessionXp } from "@/lib/xp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import XpCelebration from "@/components/shared/XpCelebration";
import ExerciseLogger from "@/components/exercises/ExerciseLogger";
import { Zap, Heart, ChevronDown, ChevronUp } from "lucide-react";

const SPLIT_TYPES = ["PUSH", "PULL", "LEGS"] as const;
type SplitType = typeof SPLIT_TYPES[number] | "NONE";

const SPLIT_CONFIG = {
  PUSH: { color: "var(--push-color)", emoji: "💪", desc: "Chest · Shoulders · Triceps" },
  PULL: { color: "var(--pull-color)", emoji: "🏋️", desc: "Back · Biceps · Rear Delts" },
  LEGS: { color: "var(--legs-color)", emoji: "🦵", desc: "Quads · Hamstrings · Glutes" },
};

const QUICK_DURATIONS = [30, 45, 60, 75];
const CARDIO_MINUTES = [10, 15, 20];
const CARDIO_TYPES = ["Running", "Cycling", "Rowing", "Skipping", "HIIT", "Other"];

interface XpData { total: number; splitXp: number; cardioXp: number; bonuses: {name:string;amount:number}[]; }

export default function DailyLog({ user, onLogComplete }: { user: { preferredCardio?: string }; onLogComplete: () => void }) {
  const [split, setSplit] = useState<SplitType>("NONE");
  const [duration, setDuration] = useState("");
  const [cardioDone, setCardioDone] = useState(true);
  const [cardioDuration, setCardioDuration] = useState(15);
  const [cardioType, setCardioType] = useState(user.preferredCardio || "Running");
  const [submitting, setSubmitting] = useState(false);
  const [xpData, setXpData] = useState<XpData | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [splitNotes, setSplitNotes] = useState("");
  const [exercises, setExercises] = useState<{ name: string; muscleGroup: string; sets: {reps: string; weightKg: string}[] }[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Live XP preview
  const liveXp = useMemo(() => {
    const preview = {
      splitType: split,
      splitDuration: duration ? parseInt(duration) : undefined,
      cardioDone,
      cardioDuration: cardioDone ? cardioDuration : 0,
      date: new Date(),
    };
    return calculateSessionXp(preview);
  }, [split, duration, cardioDone, cardioDuration]);

  const isPerfectPreview = split !== "NONE" && cardioDone && cardioDuration >= 10;

  const handleSubmit = async () => {
    setError(null);
    if (split !== "NONE" && !duration) {
      setError("Please select or enter a duration for your split.");
      return;
    }
    if (split === "NONE" && !cardioDone) {
      setError("Please log at least one activity (split or cardio).");
      return;
    }
    setSubmitting(true);

    const exercisesPayload = exercises
      .filter((e) => e.sets.some((s) => s.reps && s.weightKg))
      .map((e) => ({
        name: e.name,
        muscleGroup: e.muscleGroup,
        sets: e.sets
          .filter((s) => s.reps && s.weightKg)
          .map((s) => ({ reps: parseInt(s.reps), weightKg: parseFloat(s.weightKg) })),
      }));

    const sessionData = {
      splitType: split,
      splitDuration: duration ? parseInt(duration) : undefined,
      splitNotes: splitNotes || undefined,
      cardioDone,
      cardioType: cardioDone ? cardioType : undefined,
      cardioDuration: cardioDone ? cardioDuration : undefined,
      date: new Date().toISOString(),
      exercises: exercisesPayload.length > 0 ? exercisesPayload : undefined,
    };

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save session. Please try again.");
        setSubmitting(false);
        return;
      }

      setXpData({
        total: data.xpEarned ?? liveXp.total,
        splitXp: liveXp.splitXp,
        cardioXp: liveXp.cardioXp,
        bonuses: liveXp.bonuses,
      });
    } catch (e) {
      console.error(e);
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  };

  const handleCelebrationDismiss = () => {
    setXpData(null);
    onLogComplete();
  };

  const splitColor = split !== "NONE" ? SPLIT_CONFIG[split].color : undefined;

  return (
    <div className="space-y-4 relative pb-4">
      {xpData && <XpCelebration xpData={xpData} onDismiss={handleCelebrationDismiss} />}

      <h2 className="cinzel text-2xl text-center text-[var(--text-main)]">Daily Log</h2>

      {/* Split Selector */}
      <Card className={split !== "NONE" ? "border-t-2" : ""} style={split !== "NONE" ? { borderTopColor: splitColor } : {}}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-[var(--text-muted)]">Main Split</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {SPLIT_TYPES.map((s) => {
              const cfg = SPLIT_CONFIG[s];
              const active = split === s;
              return (
                <button
                  key={s}
                  onClick={() => {
                    if (active) {
                      setSplit("NONE");
                      setDuration("");
                    } else {
                      setSplit(s);
                      setDuration("");
                    }
                    setError(null);
                  }}
                  className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all duration-200 ${
                    active
                      ? "scale-105"
                      : "border-white/10 opacity-60 hover:opacity-100 hover:border-white/20"
                  }`}
                  style={active ? {
                    borderColor: cfg.color,
                    background: `${cfg.color}18`,
                    boxShadow: `0 0 20px ${cfg.color}40`,
                  } : {}}
                >
                  <span className="text-2xl">{cfg.emoji}</span>
                  <span className="cinzel text-xs font-bold" style={active ? { color: cfg.color } : { color: "var(--text-muted)" }}>{s}</span>
                </button>
              );
            })}
          </div>

          {split !== "NONE" && (
            <div className="space-y-3 fade-in-up">
              <p className="text-xs text-[var(--text-muted)] text-center">{SPLIT_CONFIG[split].desc}</p>
              {/* Quick duration picks */}
              <div>
                <Label className="mb-2 block">Duration</Label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {QUICK_DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d.toString())}
                      className={`py-2 rounded-lg text-sm font-bold border transition-all ${
                        duration === d.toString()
                          ? "border-[var(--xp-gold)] bg-[var(--xp-gold)]/20 text-[var(--xp-gold)]"
                          : "border-white/10 text-[var(--text-muted)] hover:border-white/30"
                      }`}
                    >
                      {d}m
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Custom minutes"
                  className="text-center"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exercise Logger */}
      {split !== "NONE" && (
        <ExerciseLogger
          onExercisesChange={(exs) =>
            setExercises(exs.map((e) => ({
              name: e.name,
              muscleGroup: e.muscleGroup,
              sets: e.sets,
            })))
          }
        />
      )}

      {/* Cardio Panel */}
      <Card className={`border-l-2 transition-colors ${!cardioDone ? "border-l-[var(--warning-amber)]" : "border-l-[var(--cardio-color)]"}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm text-[var(--text-muted)] flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Daily Cardio
            </CardTitle>
            <button
              onClick={() => setCardioDone(!cardioDone)}
              className={`px-3 py-1 rounded-full text-xs font-bold cinzel transition-all ${
                cardioDone
                  ? "bg-[var(--cardio-color)] text-black shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                  : "bg-white/10 text-[var(--warning-amber)] border border-[var(--warning-amber)]/50"
              }`}
            >
              {cardioDone ? "✓ DONE" : "SKIPPED"}
            </button>
          </div>
        </CardHeader>
        {cardioDone && (
          <CardContent className="space-y-3 scale-in">
            {/* Duration chips */}
            <div>
              <Label className="mb-2 block">Duration</Label>
              <div className="grid grid-cols-3 gap-2">
                {CARDIO_MINUTES.map((m) => (
                  <button
                    key={m}
                    onClick={() => setCardioDuration(m)}
                    className={`py-2.5 rounded-lg text-sm font-bold border transition-all ${
                      cardioDuration === m
                        ? "border-[var(--cardio-color)] bg-[var(--cardio-color)]/20 text-[var(--cardio-color)] scale-105"
                        : "border-white/10 text-[var(--text-muted)] hover:border-[var(--cardio-color)]/40"
                    }`}
                  >
                    {m}m {m === 20 ? "🔥" : ""}
                  </button>
                ))}
              </div>
            </div>
            {/* Type */}
            <div>
              <Label className="mb-2 block">Type</Label>
              <Select value={cardioType} onValueChange={setCardioType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CARDIO_TYPES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        )}
        {!cardioDone && (
          <CardContent>
            <p className="text-xs text-[var(--warning-amber)] flex items-center gap-1">
              ⚠ Skipping cardio reduces XP earned
            </p>
          </CardContent>
        )}
      </Card>

      {/* Optional Notes */}
      {split !== "NONE" && (
        <button
          onClick={() => setNotesOpen(!notesOpen)}
          className="w-full flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 text-sm text-[var(--text-muted)] hover:text-white transition"
        >
          <span>Add Notes (optional)</span>
          {notesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      )}
      {notesOpen && split !== "NONE" && (
        <div className="fade-in-up">
          <textarea
            value={splitNotes}
            onChange={(e) => setSplitNotes(e.target.value)}
            placeholder="What went well? Any PRs?"
            rows={3}
            className="w-full bg-[var(--bg-dark)] border border-white/10 rounded-lg p-3 text-white text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--xp-gold)]/50 resize-none"
          />
        </div>
      )}

      {/* Live XP Preview */}
      <div className="bg-[var(--bg-dark)] border border-white/10 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-[var(--xp-gold)]" />
          <span className="text-sm text-[var(--text-muted)]">Session XP Preview</span>
        </div>
        <div className="flex items-center gap-2">
          {isPerfectPreview && (
            <Badge variant="perfect" className="text-[10px]">PERFECT</Badge>
          )}
          <span className="cinzel text-xl font-bold text-[var(--xp-gold)] glow-gold">
            +{liveXp.total}
          </span>
        </div>
      </div>

      {/* Inline error message */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm fade-in-up">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={submitting || (split === "NONE" && !cardioDone)}
        size="xl"
        className="w-full cinzel text-lg font-black tracking-widest"
      >
        {submitting ? "LOGGING..." : "⚔ LOG SESSION"}
      </Button>
    </div>
  );
}
