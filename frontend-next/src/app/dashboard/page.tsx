import { getServerSession } from "next-auth/next";
import { authOptions, prisma } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import TopHeader from "@/components/TopHeader";
import DailyCommissionClaimButton from "@/components/DailyCommissionClaimButton";
import DailyChallengeTimer from "@/components/DailyChallengeTimer";
import { getXPDetails } from "@/lib/leveling";
import { XP_REWARDS } from "@/lib/xpEconomy";
import { Zap, Settings, Rocket, Award, ShieldCheck, Compass, ArrowRight, Lock, CheckCircle2, Circle, Sparkles, Play, Gift, Clock, Flame, Brain, Check } from "lucide-react";
import DashboardAvatarCard from "@/components/DashboardAvatarCard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const sessionUser = session?.user as any;
  const userId = sessionUser?.id;
  const userEmail = sessionUser?.email;

  if (!userId && !userEmail) {
    redirect("/login");
  }

  // Retrieve user data safely by id or email
  const dbUser = await prisma.user.findUnique({
    where: userId ? { id: userId } : { email: userEmail },
    select: {
      id: true,
      name: true,
      displayName: true,
      image: true,
      banner: true,
      xp: true,
      gears: true,
      isVerified: true,
      hasTakenAptitudeTest: true,
    }
  });

  if (!dbUser) {
    redirect("/login");
  }

  const isVerified = dbUser.isVerified === true;
  const hasTakenAptitudeTest = dbUser.hasTakenAptitudeTest === true;

  const xp = dbUser?.xp || 0;
  const { level, progress, nextThreshold, levelCurrentXp, levelRequiredXp, isMaxLevel } = getXPDetails(xp);

  // Retrieve completed missions
  const completedMissions = await prisma.missionProgress.findMany({
    where: {
      userId,
      status: "COMPLETED",
    },
    select: {
      missionId: true,
      completedAt: true,
    }
  });

  // Count unlocked achievements
  const unlockedAchievementsCount = await prisma.userAchievement.count({
    where: { userId }
  });

  const userDisplayName = dbUser?.displayName || dbUser?.name || session.user?.name || "Explorer";

  // Filter out daily missions from campaign mission progress
  const campaignCompletedMissions = completedMissions.filter(m => !m.missionId.startsWith("daily-"));

  // Planetary progression order and total levels (3 levels per planet)
  const PLANET_TRACKS = [
    { id: "moon", name: "The Moon", subtitle: "Basics", totalLevels: 3, prefix: "moon" },
    { id: "mars", name: "Mars", subtitle: "HTML5", totalLevels: 3, prefix: "mars" },
    { id: "venus", name: "Venus", subtitle: "CSS", totalLevels: 3, prefix: "venus" },
    { id: "mercury", name: "Mercury", subtitle: "JavaScript", totalLevels: 3, prefix: "mercury" },
    { id: "jupiter", name: "Jupiter", subtitle: "Java", totalLevels: 3, prefix: "jupiter" },
    { id: "saturn", name: "Saturn", subtitle: "C++", totalLevels: 3, prefix: "saturn" },
    { id: "earth", name: "Earth (HQ)", subtitle: "Python", totalLevels: 3, prefix: "earth" },
  ];

  const getPlanetCompletedCount = (prefix: string) => {
    return campaignCompletedMissions.filter(m => {
      const mid = m.missionId.toLowerCase();
      return mid.startsWith(prefix);
    }).length;
  };

  // Find active planet (first planet where completed < totalLevels)
  let currentPlanet = PLANET_TRACKS[0];
  for (const planet of PLANET_TRACKS) {
    const completed = getPlanetCompletedCount(planet.prefix);
    if (completed < planet.totalLevels) {
      currentPlanet = planet;
      break;
    }
  }

  const currentPlanetCompleted = getPlanetCompletedCount(currentPlanet.prefix);
  const currentPlanetTotal = currentPlanet.totalLevels;

  // Moon tutorial state
  const completedMoonLevels = getPlanetCompletedCount("moon");
  const isTutorialComplete = completedMoonLevels >= 3;

  // Web Development Track (HTML Mars + CSS Venus + JS Mercury = 9 levels / 3 courses)
  // Only unlocks / accumulates progress once tutorial is cleared
  const marsCompleted = getPlanetCompletedCount("mars");
  const venusCompleted = getPlanetCompletedCount("venus");
  const mercuryCompleted = getPlanetCompletedCount("mercury");
  const isWebDevActive = isTutorialComplete || (marsCompleted + venusCompleted + mercuryCompleted) > 0;
  const webLevelsCompleted = isWebDevActive ? (marsCompleted + venusCompleted + mercuryCompleted) : 0;
  const TOTAL_WEB_LEVELS = 9;
  const webProgress = isWebDevActive ? Math.min(100, Math.round((webLevelsCompleted / TOTAL_WEB_LEVELS) * 100)) : 0;
  const webProgressLabel = `${webLevelsCompleted} / ${TOTAL_WEB_LEVELS} Modules`;

  // Determine user's expertise sector
  const isHtmlExpert = level <= 2;
  const isCssExpert = level > 2 && level <= 4;

  // Philippine Standard Time (PHT, UTC+8) Date & 12:00 AM Midnight Reset Calculation
  const nowUtc = new Date();
  const phtFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayStrPHT = phtFormatter.format(nowUtc); // "YYYY-MM-DD" in PHT

  // Compute exact time remaining until 12:00 AM PHT
  const phtNow = new Date(nowUtc.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  const phtMidnight = new Date(phtNow);
  phtMidnight.setHours(24, 0, 0, 0);
  const msUntilPhtReset = Math.max(0, phtMidnight.getTime() - phtNow.getTime());
  const phtHoursLeft = Math.floor(msUntilPhtReset / (1000 * 60 * 60));
  const phtMinutesLeft = Math.floor((msUntilPhtReset % (1000 * 60 * 60)) / (1000 * 60));
  const phtTimeLeftDisplay = `${phtHoursLeft}h ${phtMinutesLeft}m Left`;

  // Deterministic seed for daily rotation
  const [pYear, pMonth, pDay] = todayStrPHT.split("-").map(Number);
  const phtDaySeed = (pYear * 372) + (pMonth * 31) + pDay;

  // Daily Mission Level DB Check (Checked against PHT Date)
  const dailyMissionId = `daily-level-${todayStrPHT}`;

  const dailyMissionProgress = await prisma.missionProgress.findFirst({
    where: {
      userId,
      OR: [
        { missionId: dailyMissionId },
        { missionId: "daily-level" }
      ]
    }
  });

  const isDailyLevelCompleted = dailyMissionProgress?.status === "COMPLETED";
  const isDailyLevelStarted = !!dailyMissionProgress;

  const isCompletedTodayPHT = (date: Date | null | undefined) => {
    if (!date) return false;
    try {
      const dStr = phtFormatter.format(new Date(date));
      return dStr === todayStrPHT;
    } catch {
      return false;
    }
  };

  // Check today's distinct daily tasks from DB
  const todayDailyTaskRecords = completedMissions.filter(m => m.missionId.startsWith("daily-task-"));
  const completedTaskIdsToday = new Set(
    todayDailyTaskRecords
      .filter(r => r.missionId.endsWith(`-${todayStrPHT}`) || isCompletedTodayPHT(r.completedAt))
      .map(r => r.missionId.replace(/^daily-task-/, '').replace(new RegExp(`-${todayStrPHT}$`), ''))
  );

  const isDailyBonusClaimed = completedMissions.some(m => 
    m.missionId === `daily-commission-bonus-${todayStrPHT}` || 
    (m.missionId === "daily-commission-bonus" && isCompletedTodayPHT(m.completedAt))
  );

  const hasCampaignCompletedToday = campaignCompletedMissions.some(m => isCompletedTodayPHT(m.completedAt));

  // Gather strictly actual completed Daily Challenge Level dates (not general checklist tasks)
  const completedDailyChallengeDates = new Set<string>();
  for (const m of completedMissions) {
    if (m.missionId.startsWith("daily-level")) {
      if (m.completedAt) {
        try {
          const dStr = phtFormatter.format(new Date(m.completedAt));
          completedDailyChallengeDates.add(dStr);
        } catch {}
      }
      const dateMatch = m.missionId.match(/\d{4}-\d{2}-\d{2}/);
      if (dateMatch) {
        completedDailyChallengeDates.add(dateMatch[0]);
      }
    }
  }
  if (isDailyLevelCompleted) {
    completedDailyChallengeDates.add(todayStrPHT);
  }

  // 7-day progress indicator for the current week (Monday - Sunday)
  const [tYear, tMonth, tDay] = todayStrPHT.split("-").map(Number);
  const todayUtcMs = Date.UTC(tYear, tMonth - 1, tDay);
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  const todayDayOfWeek = (new Date(todayUtcMs).getUTCDay() + 6) % 7; // 0 = Mon, 1 = Tue, ..., 6 = Sun
  const mondayUtcMs = todayUtcMs - todayDayOfWeek * ONE_DAY_MS;
  const WEEK_DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const weekDaysProgress = WEEK_DAY_LABELS.map((label, idx) => {
    const dayMs = mondayUtcMs + idx * ONE_DAY_MS;
    const d = new Date(dayMs);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${day}`;

    const isToday = idx === todayDayOfWeek;
    const isPast = idx < todayDayOfWeek;
    const isCompleted = completedDailyChallengeDates.has(dateStr) || (isToday && isDailyLevelCompleted);

    return {
      label,
      dateStr,
      isToday,
      isPast,
      isCompleted,
    };
  });

  // Daily Rotating Challenge Pool (6 Playable Challenges with Custom Vector Icons)
  const DAILY_LEVEL_POOL = [
    {
      title: "Weave Trap",
      tag: "Syntax",
      desc: "Watch out for red bomb traps! Steer your space rover around the danger and take the safe road to reach the finish line.",
      customIcon: "/assets/global/daily/weave-trap.svg",
      xpReward: 100,
      gearsReward: 300,
    },
    {
      title: "Lane Changer",
      tag: "Syntax",
      desc: "Switch lanes to avoid road blocks! Pick the best turns and drive your rover safely all the way to the goal.",
      customIcon: "/assets/global/daily/lane-changer.svg",
      xpReward: 100,
      gearsReward: 300,
    },
    {
      title: "Hazard Labyrinth",
      tag: "Syntax",
      desc: "Find your way out of the space maze! Use repeat loops and look out for walls to reach the golden star.",
      customIcon: "/assets/global/daily/hazard-labyrinth.svg",
      xpReward: 100,
      gearsReward: 300,
    },
    {
      title: "Master Sorting Gauntlet",
      tag: "Syntax",
      desc: "The robot belt is rolling fast! Sort 25 space items into Food, Fuel, Cargo, and Trash boxes without any mistakes.",
      customIcon: "/assets/global/daily/sorting-gauntlet.svg",
      xpReward: 100,
      gearsReward: 300,
    },
    {
      title: "Fuel Synthesis Protocol",
      tag: "Syntax",
      desc: "Make fuel for the rocket ship! Add drops, turn up the heat, and mix it well until the fuel turns orange.",
      customIcon: "/assets/global/daily/fuel-synthesis.svg",
      xpReward: 100,
      gearsReward: 300,
    },
    {
      title: "Ledger Cipher Recovery",
      tag: "Python",
      desc: "Decode corrupted satellite telemetry! Laser-slice boundary noise, swap multiple leet characters, and explode delimiters.",
      customIcon: "/assets/global/daily/ledger-cipher.svg",
      xpReward: 100,
      gearsReward: 300,
    },
  ];

  // Offset seed (+5) preserves today as Fuel Synthesis Protocol without disruption,
  // allowing Ledger Cipher Recovery (index 5) to rotate in seamlessly tomorrow.
  const dailyLevelTemplate = DAILY_LEVEL_POOL[(phtDaySeed + 5) % DAILY_LEVEL_POOL.length];
  const dailyGeneratedLevel = {
    ...dailyLevelTemplate,
    link: `/sandbox?mode=daily&missionId=${dailyMissionId}&tier=${level}`,
  };

  // 10 Distinct Rotating Daily Tasks Pool (Resetting cleanly every day at 12:00 AM PHT)
  const DAILY_TASK_POOL = [
    {
      id: "task-daily-level",
      title: "Complete Today's Daily Challenge",
      tag: "DAILY",
      desc: "Solve today's featured coding challenge in the sandbox.",
      xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
      gearsReward: 30,
      completed: isDailyLevelCompleted || completedTaskIdsToday.has("task-daily-level"),
      link: `/sandbox?mode=daily&missionId=${dailyMissionId}&tier=${level}`,
    },
    {
      id: "task-curriculum-1",
      title: "Finish 1 Planet Mission",
      tag: "MISSION",
      desc: "Solve and complete any coding level on your current planet course.",
      xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
      gearsReward: 30,
      completed: hasCampaignCompletedToday || completedTaskIdsToday.has("task-curriculum-1"),
      link: "/modules",
    },
    {
      id: "task-curriculum-2",
      title: "Test Code in the Sandbox",
      tag: "SANDBOX",
      desc: "Run a script or test code blocks in the free-play Sandbox.",
      xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
      gearsReward: 30,
      completed: completedTaskIdsToday.has("task-curriculum-2"),
      link: "/sandbox",
    },
    {
      id: "task-curriculum-3",
      title: "Review a Story Archive Log",
      tag: "STORY",
      desc: "Open the Story Archive and review a planetary mission cutscene.",
      xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
      gearsReward: 30,
      completed: completedTaskIdsToday.has("task-curriculum-3"),
      link: "/modules",
    },
    {
      id: "task-explore-1",
      title: "Customize Your Avatar",
      tag: "AVATAR",
      desc: "Equip or customize an item layer in the Avatar Studio.",
      xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
      gearsReward: 30,
      completed: completedTaskIdsToday.has("task-explore-1"),
      link: "/shop",
    },
    {
      id: "task-explore-2",
      title: "Inspect Starport Supplies",
      tag: "SHOP",
      desc: "Preview an outfit, hair, or accessory in the Starport Shop.",
      xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
      gearsReward: 30,
      completed: completedTaskIdsToday.has("task-explore-2"),
      link: "/shop",
    },
    {
      id: "task-explore-3",
      title: "Explore Course Tracks",
      tag: "EXPEDITION",
      desc: "Inspect a course track on the planetary solar system map.",
      xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
      gearsReward: 30,
      completed: completedTaskIdsToday.has("task-explore-3"),
      link: "/modules",
    },
    {
      id: "task-achieve-1",
      title: "Analyze Cognitive Aptitudes",
      tag: "APTITUDE",
      desc: "Inspect your cognitive metrics radar on your Pilot Passport.",
      xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
      gearsReward: 30,
      completed: completedTaskIdsToday.has("task-achieve-1"),
      link: "/profile",
    },
    {
      id: "task-achieve-2",
      title: "Calibrate Pilot Profile",
      tag: "PROFILE",
      desc: "Update your bio, title, or review your stats on your profile.",
      xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
      gearsReward: 30,
      completed: completedTaskIdsToday.has("task-achieve-2"),
      link: "/profile",
    },
    {
      id: "task-achieve-3",
      title: "Inspect Badge Accolades",
      tag: "BADGES",
      desc: "Review your earned badges and milestone progress in Achievements.",
      xpReward: XP_REWARDS.DAILY_COMMISSIONS.MISSION_XP,
      gearsReward: 30,
      completed: completedTaskIdsToday.has("task-achieve-3"),
      link: "/achievements",
    },
  ];

  // Pick 4 distinct tasks from the 10-task pool for today based on PHT Day Seed
  const curTask = DAILY_TASK_POOL[1 + (phtDaySeed % 3)];
  const expTask = DAILY_TASK_POOL[4 + ((phtDaySeed + 1) % 3)];
  const achTask = DAILY_TASK_POOL[7 + ((phtDaySeed + 2) % 3)];

  const dailyTasks = [
    DAILY_TASK_POOL[0], // Daily Level
    curTask,            // Rotating Curriculum
    expTask,            // Rotating Exploration
    achTask,            // Rotating Accolades
  ];

  const completedTasksCount = dailyTasks.filter(t => t.completed).length;

  // Simple, encouraging daily companion quips
  const COMPANION_QUIPS = [
    "Ready to write some code today? Let's get started!",
    "Great to see you again! Pick a mission and start coding.",
    "Your coding workspace is ready. Let's make progress!",
    "Take it one level at a time. You're doing great!",
    "Ready for today's challenge? Let's solve some puzzles!",
    "Practice makes progress. Let's learn something new today!",
    "Welcome back! Your next mission is waiting for you.",
    "Small steps every day lead to big achievements. Let's go!",
    "Time to level up your skills. Which mission are we tackling today?",
    "Every line of code counts. Have fun learning today!"
  ];

  const randomQuip = COMPANION_QUIPS[Math.floor(Math.random() * COMPANION_QUIPS.length)];

  return (
    <div className="flex w-full h-full">
      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col z-10 h-full overflow-hidden bg-[#1e0a2d] relative">
        {/* Background Override Layer */}
        {dbUser?.banner && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0 transition-all duration-500"
            style={{ backgroundImage: `url("${dbUser.banner}")` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/50" />
          </div>
        )}

        <TopHeader title="Dashboard" />

        {/* Scrollable Content (Shifted slightly to the right with increased left padding) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 md:py-8 lg:py-10 pl-10 md:pl-14 lg:pl-16 pr-6 md:pr-8 lg:pr-10 no-scrollbar relative z-10">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_310px] xl:grid-cols-[1fr_335px] gap-8 pb-12">
            
            {/* LEFT COLUMN */}
            <div className="flex flex-col justify-between gap-6">
              
              {/* Greeting Header & Currency Badges */}
              <div className="flex items-center justify-between gap-4 w-full">
                <div className="flex-1 min-w-0 pr-2">
                  <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-white tracking-tight">
                    Salutations, <span className="text-[#ff912d] italic">{userDisplayName}!</span>
                  </h1>
                  <p className="text-white/80 text-xs sm:text-sm md:text-base font-medium mt-3 md:mt-3.5 flex items-start gap-2 leading-snug">
                    <Sparkles className="text-[#ff912d] flex-shrink-0 mt-0.5" size={16} />
                    <span>{randomQuip}</span>
                  </p>
                </div>

                {/* Live Badges (XP & Gears) - Permanently locked to the Right */}
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  {/* XP Badge */}
                  <div 
                    title={`Total XP: ${xp.toLocaleString()} XP • Level ${level} (${Math.round(progress)}%)`}
                    className="flex items-center gap-2 bg-[#361d57] border border-[#ff912d]/40 rounded-2xl px-3 sm:px-4 py-2 shadow-md"
                  >
                    <div className="w-7 h-7 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center font-bold flex-shrink-0">
                      <Zap size={15} className="fill-yellow-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/50 leading-none">Experience</span>
                      <span className="text-xs sm:text-sm font-black font-display text-white mt-0.5 whitespace-nowrap">
                        {isMaxLevel ? `${xp.toLocaleString()} XP` : `${levelCurrentXp} / ${levelRequiredXp} XP`}
                      </span>
                    </div>
                  </div>

                  {/* Gears Badge */}
                  <div className="flex items-center gap-2 bg-[#361d57] border border-[#ff912d]/40 rounded-2xl px-3 sm:px-4 py-2 shadow-md">
                    <div className="w-7 h-7 rounded-xl bg-[#ff912d]/20 text-[#ff912d] flex items-center justify-center font-bold flex-shrink-0">
                      <Settings size={15} className="animate-spin-slow" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/50 leading-none">Gears</span>
                      <span className="text-xs sm:text-sm font-black font-display text-[#ff912d] mt-0.5 whitespace-nowrap">{dbUser?.gears || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional Aptitude Test Banner with "Take Now" Button */}
              {!hasTakenAptitudeTest && (
                <div className="bg-[#361d57] border-2 border-[#ff912d]/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-[#ff912d]/20 border border-[#ff912d]/40 text-[#ff912d] animate-pulse">
                      <Brain size={22} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-display uppercase tracking-wider">Aptitude Assessment Available</h4>
                      <p className="text-xs text-white/70">Calibrate your algorithmic thinking profile to receive tailored orbit recommendations.</p>
                    </div>
                  </div>
                  <Link
                    href="/aptitude-test"
                    className="px-6 py-2.5 bg-[#ff912d] hover:bg-orange-400 text-black font-sans font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 whitespace-nowrap flex items-center gap-2 cursor-pointer"
                  >
                    Take Now <ArrowRight size={14} />
                  </Link>
                </div>
              )}

              {/* 3 Top Stat / Metric Cards with 3D Depth */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                
                {/* Metric 1: Current Planet & Levels Completed */}
                <div className="relative group/stat-card">
                  <div className="absolute inset-0 bg-[#090311]/75 rounded-2xl translate-x-1.5 translate-y-1.5 z-0 transition-all duration-300 group-hover/stat-card:translate-x-2 group-hover/stat-card:translate-y-2" />
                  <div className="relative z-10 bg-[#361d57] border border-[#ff912d]/30 p-5 rounded-2xl transition-all duration-300 shadow-xl group-hover/stat-card:-translate-x-0.5 group-hover/stat-card:-translate-y-0.5 flex flex-col justify-between gap-3 h-full">
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base font-mono font-black uppercase tracking-wider text-white/70">
                        {currentPlanet.name}
                      </span>
                      <div className="w-9 h-9 rounded-xl bg-[#ff912d]/20 text-[#ff912d] flex items-center justify-center">
                        <Rocket size={18} />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-black font-display text-white">
                        {currentPlanetCompleted} <span className="text-base font-normal text-white/50">/ {currentPlanetTotal}</span>
                      </div>
                      <div className="text-xs sm:text-sm text-white/70 font-medium mt-1">
                        {currentPlanet.subtitle ? `${currentPlanet.subtitle} • Levels Completed` : "Levels Completed"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metric 2: Rank & Level (Astronaut Level) */}
                <div className="relative group/stat-card">
                  <div className="absolute inset-0 bg-[#090311]/75 rounded-2xl translate-x-1.5 translate-y-1.5 z-0 transition-all duration-300 group-hover/stat-card:translate-x-2 group-hover/stat-card:translate-y-2" />
                  <div className="relative z-10 bg-[#361d57] border border-[#ffc107]/30 p-5 rounded-2xl transition-all duration-300 shadow-xl group-hover/stat-card:-translate-x-0.5 group-hover/stat-card:-translate-y-0.5 flex flex-col justify-between gap-3 h-full">
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base font-mono font-black uppercase tracking-wider text-white/70">Astronaut Level</span>
                      <div className="w-9 h-9 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
                        <Award size={18} />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-black font-display text-white">Level {level}</div>
                      <div className="text-xs sm:text-sm text-white/70 font-medium mt-1">{Math.round(progress)}% to Level {level < 10 ? level + 1 : 'MAX'}</div>
                    </div>
                  </div>
                </div>

                {/* Metric 3: Badges Collected */}
                <div className="relative group/stat-card">
                  <div className="absolute inset-0 bg-[#090311]/75 rounded-2xl translate-x-1.5 translate-y-1.5 z-0 transition-all duration-300 group-hover/stat-card:translate-x-2 group-hover/stat-card:translate-y-2" />
                  <div className="relative z-10 bg-[#361d57] border border-[#a855f7]/30 p-5 rounded-2xl transition-all duration-300 shadow-xl group-hover/stat-card:-translate-x-0.5 group-hover/stat-card:-translate-y-0.5 flex flex-col justify-between gap-3 h-full">
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base font-mono font-black uppercase tracking-wider text-white/70">Badges</span>
                      <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-[#a855f7] flex items-center justify-center">
                        <ShieldCheck size={18} />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-black font-display text-white">{unlockedAchievementsCount}</div>
                      <div className="text-xs sm:text-sm text-white/70 font-medium mt-1">Badges Collected</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Horizontal Divider */}
              <div className="w-full border-t border-white/10 my-1" />

              {/* Progress Tracker Section */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Compass className="text-[#ff912d]" size={20} />
                    <h2 className="font-display font-black text-xl text-white tracking-wide uppercase">Progress Tracker</h2>
                  </div>
                  <Link 
                    href="/modules" 
                    className="text-sm sm:text-base text-[#ff912d] hover:text-[#ff912d]/80 font-bold flex items-center gap-1.5 px-3 py-1 rounded-lg hover:bg-[#ff912d]/10 transition-colors group/view-missions"
                  >
                    View Missions <ArrowRight size={16} className="transition-transform group-hover/view-missions:translate-x-1" />
                  </Link>
                </div>

                {/* 2x2 Course Track Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* Track 1: Web Development */}
                  <div className="relative group/track-card">
                    <div className="absolute inset-0 bg-[#090311]/75 rounded-2xl translate-x-2 translate-y-2 z-0 transition-all duration-300 group-hover/track-card:translate-x-3 group-hover/track-card:translate-y-3" />
                    <div className="relative z-10 bg-gradient-to-br from-[#ff912d] to-[#e67e22] text-white p-5 rounded-2xl transition-all duration-300 shadow-xl group-hover/track-card:-translate-x-1 group-hover/track-card:-translate-y-1 flex flex-col justify-between gap-5 border border-white/20">
                      <div className="flex items-center justify-between">
                        <div className="font-display font-black text-lg tracking-tight">Web Development</div>
                        {isWebDevActive ? (
                          <span className="bg-[#1e0a2d]/80 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Active
                          </span>
                        ) : (
                          <span className="bg-black/40 text-white/80 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
                            <Lock size={9} /> Sector Locked
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                          <span className={`${isWebDevActive ? 'text-[#361d57]' : 'text-white'} font-black text-3xl font-display tracking-tight`}>
                            {webProgress}%
                          </span>
                          <span className={`text-xs ${isWebDevActive ? 'font-black text-[#361d57]' : 'font-bold text-white/90'}`}>
                            {webProgressLabel}
                          </span>
                        </div>
                        {/* Progress Bar Track */}
                        <div className="h-3 w-full bg-[#1e0a2d]/60 rounded-full overflow-hidden p-0.5 border border-black/20">
                          {isWebDevActive ? (
                            <div 
                              className="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
                              style={{ width: `${webProgress}%` }}
                            />
                          ) : (
                            <div className="h-full bg-white/20 rounded-full w-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Track 2: Python (Upcoming) */}
                  <div className="relative group/track-card">
                    <div className="absolute inset-0 bg-[#090311]/75 rounded-2xl translate-x-2 translate-y-2 z-0 transition-all duration-300 group-hover/track-card:translate-x-3 group-hover/track-card:translate-y-3" />
                    <div className="relative z-10 bg-gradient-to-br from-[#ff912d] to-[#e67e22] text-white p-5 rounded-2xl transition-all duration-300 shadow-xl group-hover/track-card:-translate-x-1 group-hover/track-card:-translate-y-1 flex flex-col justify-between gap-5 border border-white/20">
                      <div className="flex items-center justify-between">
                        <div className="font-display font-black text-lg tracking-tight">Python</div>
                        <span className="bg-black/40 text-white/80 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
                          <Lock size={9} /> Sector Locked
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                          <span className="text-3xl font-black font-display tracking-tight">0%</span>
                          <span className="text-xs font-bold text-white/90">0 / 3 Modules</span>
                        </div>
                        <div className="h-3 w-full bg-[#1e0a2d]/60 rounded-full overflow-hidden p-0.5 border border-black/20">
                          <div className="h-full bg-white/20 rounded-full w-0" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Track 3: C++ (Upcoming) */}
                  <div className="relative group/track-card">
                    <div className="absolute inset-0 bg-[#090311]/75 rounded-2xl translate-x-2 translate-y-2 z-0 transition-all duration-300 group-hover/track-card:translate-x-3 group-hover/track-card:translate-y-3" />
                    <div className="relative z-10 bg-gradient-to-br from-[#ff912d] to-[#e67e22] text-white p-5 rounded-2xl transition-all duration-300 shadow-xl group-hover/track-card:-translate-x-1 group-hover/track-card:-translate-y-1 flex flex-col justify-between gap-5 border border-white/20">
                      <div className="flex items-center justify-between">
                        <div className="font-display font-black text-lg tracking-tight">C++</div>
                        <span className="bg-black/40 text-white/80 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
                          <Lock size={9} /> Sector Locked
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                          <span className="text-3xl font-black font-display tracking-tight">0%</span>
                          <span className="text-xs font-bold text-white/90">0 / 3 Modules</span>
                        </div>
                        <div className="h-3 w-full bg-[#1e0a2d]/60 rounded-full overflow-hidden p-0.5 border border-black/20">
                          <div className="h-full bg-white/20 rounded-full w-0" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Track 4: Java (Upcoming) */}
                  <div className="relative group/track-card">
                    <div className="absolute inset-0 bg-[#090311]/75 rounded-2xl translate-x-2 translate-y-2 z-0 transition-all duration-300 group-hover/track-card:translate-x-3 group-hover/track-card:translate-y-3" />
                    <div className="relative z-10 bg-gradient-to-br from-[#ff912d] to-[#e67e22] text-white p-5 rounded-2xl transition-all duration-300 shadow-xl group-hover/track-card:-translate-x-1 group-hover/track-card:-translate-y-1 flex flex-col justify-between gap-5 border border-white/20">
                      <div className="flex items-center justify-between">
                        <div className="font-display font-black text-lg tracking-tight">Java</div>
                        <span className="bg-black/40 text-white/80 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
                          <Lock size={9} /> Sector Locked
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                          <span className="text-3xl font-black font-display tracking-tight">0%</span>
                          <span className="text-xs font-bold text-white/90">0 / 3 Modules</span>
                        </div>
                        <div className="h-3 w-full bg-[#1e0a2d]/60 rounded-full overflow-hidden p-0.5 border border-black/20">
                          <div className="h-full bg-white/20 rounded-full w-0" />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Dedicated Daily Mission Level Card (Clean, Non-Overlapping Layout) */}
              <div className="relative group/daily-level-card flex-1">
                <div className="absolute inset-0 bg-[#090311]/75 rounded-3xl translate-x-2 translate-y-2 z-0 transition-all duration-300 group-hover/daily-level-card:translate-x-3 group-hover/daily-level-card:translate-y-3" />
                <div className="relative z-10 bg-[#361d57] border-2 border-[#ff912d]/50 rounded-3xl p-5 md:p-6 transition-all duration-300 shadow-xl group-hover/daily-level-card:-translate-x-1 group-hover/daily-level-card:-translate-y-1 flex flex-col justify-between gap-4 h-full">
                  
                  {/* Top Header Row: Category Badges + Dynamic Real-Time Countdown */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={`font-sans font-black text-xs sm:text-sm uppercase tracking-wider px-4 py-2 rounded-full flex items-center gap-2 shadow-md ${
                        isDailyLevelCompleted 
                          ? "bg-emerald-500 text-black" 
                          : isDailyLevelStarted 
                          ? "bg-amber-500 text-black" 
                          : "bg-[#ff912d] text-black"
                      }`}>
                        {isDailyLevelCompleted ? <CheckCircle2 size={16} /> : <Flame size={16} className="fill-black" />} 
                        {isDailyLevelCompleted ? "Daily Challenge Complete" : isDailyLevelStarted ? "Daily Challenge In Progress" : "Daily Challenge"}
                      </span>
                      <span className="bg-white/10 text-white font-mono text-xs sm:text-sm font-bold uppercase tracking-wider px-3.5 py-2 rounded-full border border-white/15 shadow-sm">
                        {dailyGeneratedLevel.tag}
                      </span>
                    </div>

                    {/* Dynamic Real-Time Countdown with Seconds */}
                    <DailyChallengeTimer />
                  </div>

                  {/* Main Content Area: Custom Icon Graphic + Mission Description & Launch Action */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6 lg:gap-8 flex-1 justify-center">
                    
                    {/* Custom Challenge Icon Thumbnail Container (scaled up for balanced layout) */}
                    <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-3xl bg-gradient-to-b from-[#1a082c] to-[#130927] border-2 border-[#ff912d]/60 shadow-[0_0_25px_rgba(255,145,45,0.3)] flex items-center justify-center relative overflow-hidden flex-shrink-0 p-4 sm:p-5">
                      <img 
                        src="/assets/global/ui/Landing Page BG.png" 
                        alt="Starfield"
                        className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
                      />
                      <img 
                        src={dailyGeneratedLevel.customIcon} 
                        alt={dailyGeneratedLevel.title} 
                        className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_25px_rgba(255,145,45,0.45)] transition-transform duration-500 group-hover/daily-level-card:scale-105" 
                      />
                    </div>

                    {/* Mission Details & Action Button */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between gap-4 text-center sm:text-left w-full h-full">
                      <div className="space-y-2">
                        <h3 className="text-white font-display font-black text-2xl sm:text-3xl tracking-tight leading-tight">
                          {dailyGeneratedLevel.title}
                        </h3>
                        <p className="text-white/90 text-sm sm:text-base font-medium leading-relaxed">
                          {dailyGeneratedLevel.desc}
                        </p>
                      </div>

                      {/* Weekly Challenge Activity Tracker (Mon - Sun) */}
                      <div className="bg-[#1a082c]/85 border border-[#ff912d]/30 rounded-2xl p-3.5 sm:p-4 shadow-inner flex flex-col gap-2.5 my-1">
                        <div className="flex items-center justify-between pb-1 border-b border-white/5">
                          <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-white/60 font-bold flex items-center gap-1.5">
                            <Flame size={14} className="text-[#ff912d]" />
                            Weekly Challenge Activity
                          </span>
                          <span className="text-[11px] font-mono text-[#ff912d] font-bold">
                            {isDailyLevelCompleted ? "Completed Today" : "Today: In Progress"}
                          </span>
                        </div>

                        {/* 7-Day Progress Dots Indicator (Mon - Sun) */}
                        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
                          {weekDaysProgress.map((day) => (
                            <div key={day.label} className="flex flex-col items-center gap-1">
                              <span className={`text-[10px] sm:text-[11px] font-mono uppercase tracking-wider font-bold ${day.isToday ? "text-[#ff912d]" : "text-white/40"}`}>
                                {day.label}
                              </span>
                              <div 
                                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
                                  day.isCompleted
                                    ? "bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)] border border-emerald-300"
                                    : day.isToday
                                    ? "bg-[#ff912d]/20 text-[#ff912d] border-2 border-[#ff912d] shadow-[0_0_12px_rgba(255,145,45,0.4)]"
                                    : day.isPast
                                    ? "bg-white/5 text-white/20 border border-white/10"
                                    : "bg-white/5 text-white/20 border border-white/5"
                                }`}
                                title={day.isCompleted ? `${day.label}: Completed` : day.isToday ? `${day.label}: Today` : day.label}
                              >
                                {day.isCompleted ? (
                                  <Check size={14} className="stroke-[3]" />
                                ) : day.isToday ? (
                                  <Flame size={14} className="text-[#ff912d]" />
                                ) : (
                                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Reward Chips & Launch Button Row (Single Row Layout) */}
                      <div className="flex items-center justify-between gap-2 sm:gap-3 pt-1 mt-auto w-full">
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                          <span className="text-xs sm:text-sm font-mono font-bold bg-[#ff912d]/15 text-[#ff912d] px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-[#ff912d]/40 shadow-sm whitespace-nowrap">
                            +{dailyGeneratedLevel.xpReward} XP
                          </span>
                          <span className="text-xs sm:text-sm font-mono font-bold bg-[#ff912d]/15 text-[#ff912d] px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-[#ff912d]/40 shadow-sm whitespace-nowrap">
                            +{dailyGeneratedLevel.gearsReward} Gears
                          </span>
                        </div>

                        <Link 
                          href={dailyGeneratedLevel.link}
                          className={`flex-shrink-0 px-3.5 sm:px-5 py-2 font-sans font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                            isDailyLevelCompleted 
                              ? "bg-emerald-500 hover:bg-emerald-400 text-black" 
                              : "bg-[#ff912d] hover:bg-orange-400 text-black"
                          }`}
                        >
                          {isDailyLevelCompleted ? (
                            <>
                              <CheckCircle2 size={14} /> REVIEW CHALLENGE
                            </>
                          ) : isDailyLevelStarted ? (
                            <>
                              <Play size={13} className="fill-black" /> CONTINUE CHALLENGE
                            </>
                          ) : (
                            <>
                              <Play size={13} className="fill-black" /> START CHALLENGE
                            </>
                          )}
                        </Link>
                      </div>
                    </div>

                  </div>

                </div>
              </div>

            </div>

            {/* RIGHT COLUMN (Slimmer, Portrait Vertical) */}
            <div className="flex flex-col justify-between gap-6 w-full">
              
              {/* Top Right: Astronaut Avatar Portrait Card with Live Customizer Modal */}
              <DashboardAvatarCard userDisplayName={userDisplayName} />

              {/* Daily Tasks Card (Tasks Completed) */}
              <div className="relative group/commissions-card flex-1">
                <div className="absolute inset-0 bg-[#090311]/75 rounded-3xl translate-x-2 translate-y-2 z-0 transition-all duration-300 group-hover/commissions-card:translate-x-3 group-hover/commissions-card:translate-y-3" />
                <div className="relative z-10 bg-[#361d57] border-2 border-[#ff912d]/50 p-4 sm:p-5 rounded-3xl transition-all duration-300 shadow-xl group-hover/commissions-card:-translate-x-1 group-hover/commissions-card:-translate-y-1 flex flex-col justify-start gap-3 h-full">
                  
                  {/* Daily Tasks Header */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="text-[#ff912d]" size={18} />
                      <h3 className="font-display font-black text-lg text-white tracking-wide uppercase">
                        Daily Tasks
                      </h3>
                    </div>

                    {/* Top Tasks Progress Bar & Claim Button */}
                    <DailyCommissionClaimButton 
                      completedTasksCount={completedTasksCount}
                      totalTasksCount={dailyTasks.length}
                      bonusGears={100}
                      bonusXP={XP_REWARDS.DAILY_COMMISSIONS.COMPLETION_BONUS}
                      initialIsClaimed={isDailyBonusClaimed}
                    />
                  </div>

                  {/* Tasks List (Distinct Gap from Rewards Claim Box) */}
                  <div className="flex flex-col gap-2.5 mt-3.5 sm:mt-4">
                    {dailyTasks.map((task) => (
                      <Link 
                        key={task.id}
                        href={task.link}
                        title={`${task.title}: ${task.desc}`}
                        className={`p-3 rounded-2xl border transition-all duration-200 flex items-start gap-2.5 group/task relative ${
                          task.completed 
                            ? 'bg-[#25103a]/60 border-emerald-500/30' 
                            : 'bg-[#25103a]/80 border-white/10 hover:border-[#ff912d]/50 hover:bg-[#25103a]'
                        }`}
                      >
                        {/* Custom Hover Floating Tooltip (Fast Hover Response) */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex flex-col items-center z-40 pointer-events-none opacity-0 group-hover/task:opacity-100 transition-opacity duration-100 w-max max-w-[270px]">
                          <div className="bg-[#1e0a2d] border border-[#ff912d]/60 text-white p-2.5 rounded-xl shadow-[0_0_20px_rgba(255,145,45,0.4)] text-xs text-center space-y-1">
                            <div className="font-bold text-[#ff912d]">{task.title}</div>
                            <div className="text-[11px] text-white/90 leading-snug font-medium">{task.desc}</div>
                          </div>
                          <div className="w-2.5 h-2.5 bg-[#1e0a2d] border-r border-b border-[#ff912d]/60 rotate-45 -mt-1.5" />
                        </div>

                        {/* Check status icon */}
                        <div className="mt-0.5 flex-shrink-0">
                          {task.completed ? (
                            <CheckCircle2 size={16} className="text-emerald-400 fill-emerald-400/20" />
                          ) : (
                            <Circle size={16} className="text-white/40 group-hover/task:text-[#ff912d] transition-colors" />
                          )}
                        </div>

                        {/* Expedition Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-xs font-black font-display tracking-tight leading-snug ${
                              task.completed ? 'text-white/60 line-through' : 'text-white group-hover/task:text-[#ff912d] transition-colors'
                            }`}>
                              {task.title}
                            </span>
                          </div>
                          <div className="text-[11px] text-white/70 leading-normal mt-0.5 line-clamp-1 font-medium">
                            {task.desc}
                          </div>

                          {/* Reward Chips */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-mono font-black bg-[#ff912d]/20 text-[#ff912d] px-2.5 py-1 rounded-lg border border-[#ff912d]/35">
                              +{task.xpReward} XP
                            </span>
                            <span className="text-xs font-mono font-black bg-purple-500/20 text-[#c084fc] px-2.5 py-1 rounded-lg border border-purple-500/35">
                              +{task.gearsReward} Gears
                            </span>
                          </div>
                        </div>

                        <ArrowRight size={14} className="text-white/30 group-hover/task:text-white transition-colors flex-shrink-0 self-center" />
                      </Link>
                    ))}
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
