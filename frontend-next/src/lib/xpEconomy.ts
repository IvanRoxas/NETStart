/**
 * Global XP Economy Configuration
 * Defines centralized reward triggers and payouts across Campaign Levels, Sections, Dailies, and Meta-Achievements.
 * 
 * Total Campaign Level Yield: Exactly 150 XP per level divided evenly across 3 sections (50 XP per section):
 * - Section 1: 3 Directives (30 XP) + Section Bonus (20 XP) = 50 XP
 * - Section 2: 3 Directives (30 XP) + Section Bonus (20 XP) = 50 XP
 * - Section 3: 3 Directives (30 XP) + Section Bonus (20 XP) = 50 XP
 * Total = 150 XP per level.
 */

export const XP_REWARDS = {
  // Directives / Goals: 10 XP per completed goal (3 goals per section = 30 XP, 9 goals per level = 90 XP)
  CAMPAIGN_GOAL: 10,
  GOALS_PER_SECTION: 3,
  SECTION_GOALS_XP: 30, // 3 * 10 XP
  GOALS_PER_LEVEL: 9,
  TOTAL_CAMPAIGN_GOALS_XP: 90, // 9 * 10 XP

  // Section Payouts (50 XP per section)
  SECTION_COMPLETION_BONUS: 20, // 20 XP awarded upon clearing each section
  SECTION_TOTAL_YIELD: 50,      // 30 XP from directives + 20 XP section bonus = 50 XP
  SECTIONS_PER_LEVEL: 3,

  // Level Completion Total (3 sections * 50 XP = 150 XP total per level)
  TOTAL_LEVEL_YIELD: 150,
  LEVEL_COMPLETION_BONUS: 20, // Section 3 bonus completes the 150 XP level total

  // Onboarding Achievements (One-Time)
  ONBOARDING: {
    ACCOUNT_CREATION: 100, // "Account Creation" (100 XP)
    ACCOUNT_VERIFIED: 100, // "Account Verified" (100 XP)
  },

  // Daily Commissions (Repeatable): 4 missions at 5 XP each, plus a 10 XP completion bonus (30 XP total per day)
  DAILY_COMMISSIONS: {
    MISSION_XP: 5,
    MISSION_COUNT: 4,
    COMPLETION_BONUS: 10,
    TOTAL_DAILY_XP: 30,
  },
} as const;
