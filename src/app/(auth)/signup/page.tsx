"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dumbbell, Zap, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [days, setDays] = useState("4");
  const [cardio, setCardio] = useState("Running");
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email || !password) return;
    setSubmitting(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          name: name.trim(),
          weight: weight ? parseFloat(weight) : undefined,
          daysPerWeek: parseInt(days),
          preferredCardio: cardio,
        }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sign up");
      }
      
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-[var(--bg-dark)] py-12">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[var(--xp-gold)]/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10 fade-in-up">
        {/* Logo + hero */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--xp-gold)]/10 border border-[var(--xp-gold)]/30 glow-gold mb-3">
            <Dumbbell className="w-6 h-6 text-[var(--xp-gold)]" />
          </div>
          <h1 className="cinzel text-3xl text-[var(--xp-gold)] glow-gold mb-1">GymQuest</h1>
          <p className="text-[var(--text-muted)] text-sm">Your RPG fitness journey begins here.</p>
        </div>

        <Card className="border-white/10 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-center text-base">
              ⚔ Create Your Character
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hero@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a strong password"
                />
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="player-name">Hero Name</Label>
                <Input
                  id="player-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aragorn"
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
                      className={`py-2 rounded-lg border-2 text-sm font-bold cinzel transition-all ${
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

              <Button
                type="submit"
                disabled={submitting || !name.trim() || !email || !password}
                className="w-full cinzel text-base font-bold tracking-wider mt-4"
              >
                {submitting ? "Forging..." : "⚔ Forge Profile"}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <span className="text-sm text-[var(--text-muted)]">Already have a character? </span>
              <Button variant="link" onClick={() => router.push("/login")} className="text-[var(--xp-gold)] px-1">
                Log In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
