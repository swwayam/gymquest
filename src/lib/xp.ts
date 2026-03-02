export const XP_LEVELS = [
  { level: 1, title: "Wanderer", xp: 0 },
  { level: 2, title: "Initiate", xp: 500 },
  { level: 3, title: "Trainee", xp: 1200 },
  { level: 4, title: "Fighter", xp: 2500 },
  { level: 5, title: "Iron Guard", xp: 4500 },
  { level: 6, title: "Steel Sentinel", xp: 7500 },
  { level: 7, title: "Gold Titan", xp: 12000 },
  { level: 8, title: "Platinum Beast", xp: 18000 },
  { level: 9, title: "Diamond Apex", xp: 26000 },
  { level: 10, title: "Legendary", xp: 36000 },
];

export function getLevelData(currentXp: number) {
  let currentLevel = XP_LEVELS[0];
  let nextLevel = XP_LEVELS[1];

  for (let i = 0; i < XP_LEVELS.length; i++) {
    if (currentXp >= XP_LEVELS[i].xp) {
      currentLevel = XP_LEVELS[i];
      nextLevel = XP_LEVELS[i + 1] || currentLevel;
    } else {
      break;
    }
  }

  const xpIntoLevel = currentXp - currentLevel.xp;
  const xpNeeded = nextLevel.xp - currentLevel.xp;
  let progressPercent = 100;

  if (currentLevel.level < 10) {
    progressPercent = Math.min(
      100,
      Math.max(0, (xpIntoLevel / xpNeeded) * 100),
    );
  }

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    currentXp,
    xpIntoLevel,
    xpNeeded: currentLevel.level === 10 ? 0 : xpNeeded,
    nextThreshold: currentLevel.level === 10 ? currentXp : nextLevel.xp,
    progressPercent,
  };
}

export function calculateSessionXp(session: any) {
  let xp = 0;
  let bonuses: any[] = [];
  const logHour = new Date(session.date || new Date()).getHours();

  // Base Split XP
  if (session.splitType === "LEGS") {
    xp += 150;
  } else if (session.splitType === "PUSH" || session.splitType === "PULL") {
    xp += 120;
  }

  // Cardio XP
  let cardioXp = 0;
  if (session.cardioDone && session.cardioDuration) {
    if (session.cardioDuration >= 20) cardioXp = 60;
    else if (session.cardioDuration >= 15) cardioXp = 45;
    else if (session.cardioDuration >= 10) cardioXp = 30;
  }
  xp += cardioXp;

  // Complete Session Bonus
  if (session.splitType && session.splitType !== "NONE" && cardioXp > 0) {
    xp += 25;
    bonuses.push({ name: "Complete Session", amount: 25 });
  }

  // Time bonuses
  if (logHour < 8) {
    xp += 15;
    bonuses.push({ name: "Early Iron", amount: 15 });
  } else if (logHour >= 21) {
    xp += 15;
    bonuses.push({ name: "Night Grind", amount: 15 });
  }

  return {
    total: xp,
    splitXp: xp - cardioXp - bonuses.reduce((a, b) => a + b.amount, 0),
    cardioXp,
    bonuses,
  };
}
