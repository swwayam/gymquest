"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to login");
      }
      
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-[var(--bg-dark)]">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[var(--xp-gold)]/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10 fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--xp-gold)]/10 border border-[var(--xp-gold)]/30 glow-gold mb-4">
            <Dumbbell className="w-8 h-8 text-[var(--xp-gold)]" />
          </div>
          <h1 className="cinzel text-4xl text-[var(--xp-gold)] glow-gold mb-1">GymQuest</h1>
          <p className="text-[var(--text-muted)] text-sm">Welcome back, Hero.</p>
        </div>

        <Card className="border-white/10 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-center text-base">
              Enter your credentials to continue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="text-base"
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
                  placeholder="Enter your password"
                  className="text-base"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !email || !password}
                size="lg"
                className="w-full cinzel text-base font-bold tracking-wider"
              >
                {loading ? "Authenticating..." : "Login"}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <span className="text-sm text-[var(--text-muted)]">Don't have an account? </span>
              <Button variant="link" onClick={() => router.push("/signup")} className="text-[var(--xp-gold)] px-1">
                Forge a Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
