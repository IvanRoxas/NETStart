import { XP_REWARDS } from "./xpEconomy";

export interface DailyTaskDefinition {
  id: string;
  title: string;
  tag: string;
  desc: string;
  xpReward: number;
  gearsReward: number;
  link: string;
}

export interface DailyTaskNotificationData {
  id?: string;
  taskId: string;
  title: string;
  tag: string;
  desc: string;
  xpEarned: number;
  gearsEarned: number;
  completedAt?: string | Date;
}

export const DAILY_TASKS_CONFIG: Record<string, Omit<DailyTaskDefinition, "id">> = {
  "task-daily-level": {
    title: "Complete Today's Daily Challenge",
    tag: "DAILY",
    desc: "Finish today's quick practice coding challenge.",
    xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
    gearsReward: 20,
    link: "/sandbox?mode=daily",
  },
  "task-curriculum-1": {
    title: "Finish 1 Curriculum Lesson",
    tag: "LESSON",
    desc: "Complete any 1 lesson in your current course.",
    xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
    gearsReward: 10,
    link: "/modules",
  },
  "task-curriculum-2": {
    title: "Finish 1 Planet Level",
    tag: "PLANET",
    desc: "Solve any 1 coding level on the planet map.",
    xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
    gearsReward: 10,
    link: "/modules",
  },
  "task-curriculum-3": {
    title: "Play 1 Rover Level",
    tag: "GAME",
    desc: "Move your rover past blocks to reach the goal.",
    xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
    gearsReward: 10,
    link: "/modules",
  },
  "task-explore-1": {
    title: "Visit the Shop",
    tag: "EXPLORE",
    desc: "Take a look at items and outfits in the shop.",
    xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
    gearsReward: 5,
    link: "/shop",
  },
  "task-explore-2": {
    title: "View the Planet Map",
    tag: "EXPLORE",
    desc: "Look at the planets and courses on the map.",
    xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
    gearsReward: 5,
    link: "/modules",
  },
  "task-explore-3": {
    title: "Look at Space Suits",
    tag: "SHOP",
    desc: "Check out astronaut suits and gear in the shop.",
    xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
    gearsReward: 5,
    link: "/shop",
  },
  "task-achieve-1": {
    title: "Check Your Badges",
    tag: "BADGES",
    desc: "See the badges and trophies you have unlocked.",
    xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
    gearsReward: 5,
    link: "/achievements",
  },
  "task-achieve-2": {
    title: "View Your Profile",
    tag: "PROFILE",
    desc: "Check your level, gears, and stats on your profile.",
    xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
    gearsReward: 5,
    link: "/profile",
  },
  "task-achieve-3": {
    title: "Check Achievements",
    tag: "BADGES",
    desc: "See your progress toward new achievements.",
    xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
    gearsReward: 5,
    link: "/achievements",
  },
};

export function getDailyTaskInfo(taskId: string): DailyTaskDefinition {
  const config = DAILY_TASKS_CONFIG[taskId];
  if (config) {
    return { id: taskId, ...config };
  }
  return {
    id: taskId,
    title: "Daily Task",
    tag: "DAILY",
    desc: "Completed a daily mission task.",
    xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
    gearsReward: 5,
    link: "/dashboard",
  };
}

export function getTodayPHTDateStr(date: Date = new Date()): string {
  const phtFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return phtFormatter.format(date);
}

export function getTodayPHTDaySeed(date: Date = new Date()): number {
  const todayStrPHT = getTodayPHTDateStr(date);
  const [pYear, pMonth, pDay] = todayStrPHT.split("-").map(Number);
  return (pYear * 372) + (pMonth * 31) + pDay;
}

export function getTodayActiveDailyTaskIds(date: Date = new Date()): string[] {
  const phtDaySeed = getTodayPHTDaySeed(date);
  const curTaskId = `task-curriculum-${1 + (phtDaySeed % 3)}`;
  const expTaskId = `task-explore-${1 + ((phtDaySeed + 1) % 3)}`;
  const achTaskId = `task-achieve-${1 + ((phtDaySeed + 2) % 3)}`;

  return [
    "task-daily-level",
    curTaskId,
    expTaskId,
    achTaskId,
  ];
}

