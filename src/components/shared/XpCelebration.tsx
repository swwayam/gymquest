"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

interface XpCelebrationProps {
  xpData: {
    total: number;
    splitXp: number;
    cardioXp: number;
    bonuses: Array<{ name: string; amount: number }>;
  };
  onDismiss: () => void;
}

export default function XpCelebration({ xpData, onDismiss }: XpCelebrationProps) {
  useEffect(() => {
    // Fire confetti
    confetti({
      particleCount: 180,
      spread: 110,
      origin: { y: 0.5 },
      colors: ["#f0c040", "#e05a2b", "#3b82f6", "#22c55e", "#ffffff"],
    });
    // Second burst
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.4, x: 0.3 },
        colors: ["#f0c040", "#b8860b"],
      });
    }, 350);

    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm px-6"
      onClick={onDismiss}
    >
      <div className="flex flex-col items-center gap-6 xp-fly-in">
        {/* Big XP number */}
        <div className="text-center">
          <div className="cinzel text-7xl font-black text-[var(--xp-gold)] glow-gold leading-none">
            +{xpData.total}
          </div>
          <div className="cinzel text-xl text-white/70 mt-1 tracking-widest">XP EARNED</div>
        </div>

        {/* Breakdown card */}
        <div className="w-full max-w-xs bg-black/60 border border-[var(--xp-gold)]/30 rounded-xl p-5 space-y-2 shadow-[0_0_30px_rgba(240,192,64,0.2)]">
          {xpData.splitXp > 0 && (
            <div className="flex justify-between items-center py-1 border-b border-white/10">
              <span className="text-[var(--text-muted)] text-sm">Split Training</span>
              <span className="text-white font-bold">+{xpData.splitXp}</span>
            </div>
          )}
          {xpData.cardioXp > 0 && (
            <div className="flex justify-between items-center py-1 border-b border-white/10">
              <span className="text-[var(--cardio-color)] text-sm">Cardio</span>
              <span className="text-white font-bold">+{xpData.cardioXp}</span>
            </div>
          )}
          {xpData.bonuses.map((b, i) => (
            <div key={i} className="flex justify-between items-center py-1 border-b border-white/10">
              <span className="text-[var(--xp-gold)] text-sm">✦ {b.name}</span>
              <span className="font-bold text-[var(--xp-gold)]">+{b.amount}</span>
            </div>
          ))}
          {xpData.total === 0 && (
            <p className="text-center text-[var(--text-muted)] text-sm italic">No XP earned. Log more activity!</p>
          )}
        </div>

        <p className="text-xs text-white/40 mt-2">Tap anywhere to continue</p>
      </div>
    </div>
  );
}
