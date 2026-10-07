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
  // Slot 1: Daily Challenge Staple
  "task-daily-level": {
    title: "Complete Today's Daily Challenge",
    tag: "DAILY",
    desc: "Solve today's featured coding challenge in the sandbox.",
    xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
    gearsReward: 30,
    link: "/sandbox?mode=daily",
  },

  // Slot 2: Coding & Missions Rotation
  "task-curriculum-1": {
    title: "Finish 1 Planet Mission",
    tag: "MISSION",
    desc: "Solve and complete any coding level on your current planet course.",
    xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
    gearsReward: 30,
    link: "/modules",
  },
  "task-curriculum-2": {
    title: "Test Code in the Sandbox",
    tag: "SANDBOX",
    desc: "Run a script or test code blocks in the free-play Sandbox.",
    xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
    gearsReward: 30,
    link: "/sandbox",
  },
  "task-curriculum-3": {
    title: "Review a Story Archive Log",
    tag: "STORY",
    desc: "Open the Story Archive and review a planetary mission cutscene.",
    xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
    gearsReward: 30,
    link: "/modules",
  },

  // Slot 3: Avatar Studio & Starport Gear Rotation
  "task-explore-1": {
    title: "Customize Your Avatar",
    tag: "AVATAR",
    desc: "Equip or customize an item layer in the Avatar Studio.",
    xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
    gearsReward: 30,
    link: "/shop",
  },
  "task-explore-2": {
    title: "Inspect Starport Supplies",
    tag: "SHOP",
    desc: "Preview an outfit, hair, or accessory in the Starport Shop.",
    xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
    gearsReward: 30,
    link: "/shop",
  },
  "task-explore-3": {
    title: "Explore Course Tracks",
    tag: "EXPEDITION",
    desc: "Inspect a course track on the planetary solar system map.",
    xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
    gearsReward: 30,
    link: "/modules",
  },

  // Slot 4: Pilot Career, Aptitude & Badges Rotation
  "task-achieve-1": {
    title: "Analyze Cognitive Aptitudes",
    tag: "APTITUDE",
    desc: "Inspect your cognitive metrics radar on your Pilot Passport.",
    xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
    gearsReward: 30,
    link: "/profile",
  },
  "task-achieve-2": {
    title: "Calibrate Pilot Profile",
    tag: "PROFILE",
    desc: "Update your bio, title, or review your stats on your profile.",
    xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
    gearsReward: 30,
    link: "/profile",
  },
  "task-achieve-3": {
    title: "Inspect Badge Accolades",
    tag: "BADGES",
    desc: "Review your earned badges and milestone progress in Achievements.",
    xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
    gearsReward: 30,
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
    gearsReward: 30,
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

/**
 * Triggers completion for an active daily task from the client side.
 * Validates with the backend and broadcasts the notification toast if newly completed.
 */
export async function triggerDailyTaskCompletion(taskId: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const res = await fetch("/api/daily-tasks/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && !data.alreadyCompleted) {
        window.dispatchEvent(
          new CustomEvent("daily_task_completed", {
            detail: {
              taskId,
              title: data.task?.title || "Daily Task Completed",
              tag: data.task?.tag || "DAILY",
              desc: data.task?.desc || "Completed a daily mission task.",
              xpEarned: data.xpEarned || 25,
              gearsEarned: data.gearsEarned || 30,
              notificationId: data.notificationId,
            },
          })
        );
        return true;
      }
    }
  } catch (err) {
    console.warn(`Failed to complete daily task ${taskId}:`, err);
  }
  return false;
}

