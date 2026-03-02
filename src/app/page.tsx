"use client";

import { useEffect, useState } from "react";
import ProfileSetup from "@/components/setup/ProfileSetup";
import Dashboard from "@/components/dashboard/Dashboard";
import DailyLog from "@/components/log/DailyLog";
import HistoryTab from "@/components/history/History";
import WeightTracker from "@/components/weight/WeightTracker";
import { BarChart2, Dumbbell, Clock, Zap, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "dashboard" | "log" | "history" | "weight";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<Tab>("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      if (data.user) setUser(data.user);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUser(); }, [refreshKey]);

  const handleSessionLogged = () => {
    setRefreshKey((prev) => prev + 1);
    setCurrentTab("dashboard");
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-4 bg-[var(--bg-dark)]">
        <div className="w-16 h-16 rounded-2xl bg-[var(--xp-gold)]/10 border border-[var(--xp-gold)]/30 flex items-center justify-center animate-pulse">
          <Dumbbell className="w-8 h-8 text-[var(--xp-gold)]" />
        </div>
        <div className="cinzel text-lg text-[var(--xp-gold)] tracking-widest animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) return <ProfileSetup onComplete={fetchUser} />;

  const navItems = [
    { id: "history" as Tab, label: "Log", icon: Clock },
    { id: "weight" as Tab, label: "Weight", icon: Scale },
    { id: "log" as Tab, label: "Log Day", icon: Dumbbell, cta: true },
    { id: "dashboard" as Tab, label: "Stats", icon: BarChart2 },
  ];

  return (
    <div className="max-w-md mx-auto min-h-screen relative">
      {/* Ambient top glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-32 bg-gradient-to-b from-[var(--xp-gold)]/5 to-transparent pointer-events-none z-0" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[var(--bg-dark)]/90 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="cinzel text-xl font-black text-[var(--xp-gold)] tracking-widest">GymQuest</h1>
          <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs">
            <Zap className="w-3.5 h-3.5 text-[var(--xp-gold)]" />
            <span className="font-mono text-[var(--xp-gold)] font-bold">{user.xp} XP</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 pt-4 pb-24 relative z-10">
        {currentTab === "dashboard" && <Dashboard user={user} refreshKey={refreshKey} />}
        {currentTab === "log" && <DailyLog user={user} onLogComplete={handleSessionLogged} />}
        {currentTab === "history" && <HistoryTab user={user} refreshKey={refreshKey} />}
        {currentTab === "weight" && <WeightTracker user={user} />}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-md mx-auto">
          <div className="mx-3 mb-3 bg-[var(--panel-bg)]/95 backdrop-blur-xl border border-white/8 rounded-2xl shadow-2xl flex items-center px-2 py-2 gap-1">
            {navItems.map(({ id, label, icon: Icon, cta }) => (
              <button
                key={id}
                onClick={() => setCurrentTab(id)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-0.5 rounded-xl py-2 transition-all duration-200",
                  cta ? [
                    "bg-[var(--xp-gold)] text-[var(--bg-dark)] glow-gold py-3 mx-1",
                    currentTab === id ? "scale-105" : "hover:brightness-110"
                  ] : [
                    currentTab === id
                      ? "text-white bg-white/10"
                      : "text-[var(--text-muted)] hover:text-white hover:bg-white/5"
                  ]
                )}
              >
                <Icon className={cn("w-5 h-5", cta ? "w-6 h-6" : "")} />
                <span className={cn("text-[10px] font-bold cinzel tracking-wide", cta ? "text-[9px]" : "")}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
