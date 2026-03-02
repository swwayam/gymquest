"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dumbbell, Zap, Shield } from "lucide-react";

export default function ProfileSetup({ onComplete }: { onComplete: () => void }) {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [days, setDays] = useState("4");
  const [cardio, setCardio] = useState("Running");
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          weight: weight ? parseFloat(weight) : undefined,
          daysPerWeek: parseInt(days),
          preferredCardio: cardio,
        }),
      });
      onComplete();
    } catch (error) {
      console.error("Failed", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-[var(--bg-dark)]">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[var(--xp-gold)]/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10 fade-in-up">
        {/* Logo + hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--xp-gold)]/10 border border-[var(--xp-gold)]/30 glow-gold mb-4">
            <Dumbbell className="w-8 h-8 text-[var(--xp-gold)]" />
          </div>
          <h1 className="cinzel text-4xl text-[var(--xp-gold)] glow-gold mb-1">GymQuest</h1>
          <p className="text-[var(--text-muted)] text-sm">Your RPG fitness journey begins here.</p>
        </div>

        <Card className="border-white/10 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-center text-base">
              ⚔ Create Your Character
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="player-name">Hero Name</Label>
                <Input
                  id="player-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aragorn"
                  className="text-base"
                />
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <Label htmlFor="weight">Starting Weight <span className="text-white/30 normal-case font-normal">(optional)</span></Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="kg or lbs"
                />
              </div>

              {/* Days per week */}
              <div className="space-y-2">
                <Label>Training Days / Week</Label>
                <div className="grid grid-cols-4 gap-2">
                  {["3","4","5","6"].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDays(d)}
                      className={`py-2.5 rounded-lg border-2 text-sm font-bold cinzel transition-all ${
                        days === d
                          ? "border-[var(--xp-gold)] bg-[var(--xp-gold)]/20 text-[var(--xp-gold)] glow-gold"
                          : "border-white/10 text-[var(--text-muted)] hover:border-white/30"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred cardio */}
              <div className="space-y-2">
                <Label>Preferred Cardio</Label>
                <Select value={cardio} onValueChange={setCardio}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Running", "Cycling", "Rowing", "Skipping", "HIIT", "Other"].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Perks preview */}
              <div className="bg-[var(--bg-dark)] rounded-lg p-3 border border-white/5 space-y-1.5">
                <p className="text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wider font-bold">What you'll earn</p>
                {[
                  { icon: <Zap className="w-3.5 h-3.5" />, text: "XP for every session" },
                  { icon: <Shield className="w-3.5 h-3.5" />, text: "Shields for 7-day streaks" },
                  { icon: <Dumbbell className="w-3.5 h-3.5" />, text: "Level up to Legendary" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span className="text-[var(--xp-gold)]">{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>

              <Button
                type="submit"
                disabled={submitting || !name.trim()}
                size="lg"
                className="w-full cinzel text-base font-bold tracking-wider"
              >
                {submitting ? "Forging..." : "⚔ Forge Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
