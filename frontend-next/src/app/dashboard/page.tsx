import { getServerSession } from "next-auth/next";
import { authOptions, prisma } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import TopHeader from "@/components/TopHeader";
import DailyCommissionClaimButton from "@/components/DailyCommissionClaimButton";
import { getXPDetails } from "@/lib/leveling";
import { Zap, Settings, Rocket, Award, ShieldCheck, Compass, ArrowRight, Lock, CheckCircle2, Circle, Sparkles, Play, Gift, Clock, Flame, Brain } from "lucide-react";

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
  const { level, progress, nextThreshold } = getXPDetails(xp);

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
  const TOTAL_WEB_MODULES = 28; // HTML: 5, CSS: 5, JS: 8, React: 10
  const webProgress = Math.min(100, Math.round((completedMissions.length / TOTAL_WEB_MODULES) * 100));

  // Determine user's expertise sector
  const isHtmlExpert = level <= 2;
  const isCssExpert = level > 2 && level <= 4;

  // Daily Generated Level Details (Clean & Natural)
  const dailyGeneratedLevel = {
    title: isHtmlExpert 
      ? "Daily Practice: Web Structure & Tags" 
      : isCssExpert 
        ? "Daily Practice: Layouts & Selectors" 
        : "Daily Practice: Functions & Logic",
    sector: isHtmlExpert ? "HTML Sector" : isCssExpert ? "CSS Sector" : "JavaScript Sector",
    difficulty: isHtmlExpert ? "Beginner" : isCssExpert ? "Intermediate" : "Advanced",
    desc: isHtmlExpert 
      ? "Practice structuring headings, paragraphs, and list components in today's sandbox exercise." 
      : isCssExpert 
        ? "Practice styling responsive elements, margins, and colors in the code editor." 
        : "Write variables and conditional logic statements to clear today's practice level.",
    planetIcon: isHtmlExpert ? "/Planet 7.svg" : isCssExpert ? "/Planet 4.svg" : "/Planet 1.svg",
    xpReward: 100,
    gearsReward: 25,
    link: `/sandbox?mode=daily&tier=${level}`,
  };

  // Genshin-style Daily Commissions (3 Tasks)
  const dailyTasks = [
    {
      id: "task-1",
      title: "Complete Today's Daily Level",
      tag: "DAILY LEVEL",
      desc: "Finish today's practice exercise in the sandbox.",
      xpReward: 80,
      gearsReward: 20,
      completed: false,
      link: `/sandbox?mode=daily&tier=${level}`,
    },
    {
      id: "task-2",
      title: isHtmlExpert 
        ? "Complete 1 HTML Lesson" 
        : isCssExpert 
          ? "Complete 1 CSS Challenge" 
          : "Complete 1 JavaScript Mission",
      tag: "CURRICULUM",
      desc: "Clear an active level from your current course track.",
      xpReward: 50,
      gearsReward: 10,
      completed: completedMissions.length > 0,
      link: isHtmlExpert ? "/modules/html" : isCssExpert ? "/modules/css" : "/modules/javascript",
    },
    {
      id: "task-3",
      title: "Visit the Galactic Shop",
      tag: "EXPLORATION",
      desc: "Check out available accessories and gear.",
      xpReward: 40,
      gearsReward: 5,
      completed: true,
      link: "/shop",
    },
    {
      id: "task-4",
      title: "Check Cadet Achievements",
      tag: "ACHIEVEMENTS",
      desc: "Inspect your unlocked badges & trophies.",
      xpReward: 30,
      gearsReward: 5,
      completed: true,
      link: "/achievements",
    },
  ];

  const completedTasksCount = dailyTasks.filter(t => t.completed).length;

  // Ordis-style quirky, bubbly AI companion quips
  const COMPANION_QUIPS = [
    "All systems nominal! ...Well, except for the coffee machine. Let's write some stellar code today!",
    "Vital signs: optimal! Learning matrix: charged! Ready to conquer new star sectors?",
    "Diagnostic voyage in progress. Remind me to sweep space dust from your thrusters later!",
    "Sensors detect a 100% chance of breakthrough today. Shall we ignite the main engines?",
    "Recalibrating enthusiasm processors... OVERFLOW ERROR! Let's get straight to coding!",
    "Sub-space transmitters tuned to your learning frequency. Awaiting your command!",
    "Proximity warning: severe genius detected in your sector. Keep up the momentum!",
    "Flight log updated: Cadet is looking exceptionally sharp and ready today!",
    "Orbital telemetry suggests today is an excellent day to solve complex challenges!",
    "Shields up, code ready! I've pre-warmed your developer sandbox, Explorer!"
  ];

  const randomQuip = COMPANION_QUIPS[Math.floor(Math.random() * COMPANION_QUIPS.length)];

  return (
    <div className="flex w-full h-full">
      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col z-10 h-full overflow-hidden bg-[#1e0a2d]">
        <TopHeader title="Dashboard" />

        {/* Scrollable Content (Shifted slightly to the right with increased left padding) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 md:py-8 lg:py-10 pl-10 md:pl-14 lg:pl-16 pr-6 md:pr-8 lg:pr-10 no-scrollbar">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_310px] xl:grid-cols-[1fr_335px] gap-8 pb-12">
            
            {/* LEFT COLUMN */}
            <div className="flex flex-col justify-between gap-6">
              
              {/* Greeting Header & Currency Badges */}
              <div className="flex items-center justify-between gap-4 w-full">
                <div className="flex-1 min-w-0 pr-2">
                  <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-white tracking-tight">
                    Salutations, <span className="text-[#ff912d] italic">{userDisplayName}!</span>
                  </h1>
                  <p className="text-white/80 text-xs sm:text-sm md:text-base font-medium mt-1.5 flex items-start gap-2 leading-snug">
                    <Sparkles className="text-[#ff912d] flex-shrink-0 mt-0.5" size={16} />
                    <span>{randomQuip}</span>
                  </p>
                </div>

                {/* Live Badges (XP & Gears) - Permanently locked to the Right */}
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  {/* XP Badge */}
                  <div className="flex items-center gap-2 bg-[#361d57] border border-[#ff912d]/40 rounded-2xl px-3 sm:px-4 py-2 shadow-md">
                    <div className="w-7 h-7 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center font-bold flex-shrink-0">
                      <Zap size={15} className="fill-yellow-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/50 leading-none">Experience</span>
                      <span className="text-xs sm:text-sm font-black font-display text-white mt-0.5 whitespace-nowrap">{xp} / {nextThreshold}</span>
                    </div>
                  </div>

                  {/* Gears Badge */}
                  <div className="flex items-center gap-2 bg-[#361d57] border border-[#a855f7]/40 rounded-2xl px-3 sm:px-4 py-2 shadow-md">
                    <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-[#a855f7] flex items-center justify-center font-bold flex-shrink-0">
                      <Settings size={15} className="animate-spin-slow" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/50 leading-none">Gears</span>
                      <span className="text-xs sm:text-sm font-black font-display text-[#a855f7] mt-0.5 whitespace-nowrap">{dbUser?.gears || 0}</span>
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
                
                {/* Metric 1: Missions Completed */}
                <div className="relative group/stat-card">
                  <div className="absolute inset-0 bg-[#090311]/75 rounded-2xl translate-x-1.5 translate-y-1.5 z-0 transition-all duration-300 group-hover/stat-card:translate-x-2 group-hover/stat-card:translate-y-2" />
                  <div className="relative z-10 bg-[#361d57] border border-[#ff912d]/30 p-5 rounded-2xl transition-all duration-300 shadow-xl group-hover/stat-card:-translate-x-0.5 group-hover/stat-card:-translate-y-0.5 flex flex-col justify-between gap-3 h-full">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono font-bold uppercase tracking-wider text-white/50">Missions</span>
                      <div className="w-8 h-8 rounded-xl bg-[#ff912d]/20 text-[#ff912d] flex items-center justify-center">
                        <Rocket size={16} />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-black font-display text-white">{completedMissions.length} <span className="text-sm font-normal text-white/50">/ {TOTAL_WEB_MODULES}</span></div>
                      <div className="text-xs sm:text-sm text-white/70 font-medium mt-1">Completed Missions</div>
                    </div>
                  </div>
                </div>

                {/* Metric 2: Rank & Level */}
                <div className="relative group/stat-card">
                  <div className="absolute inset-0 bg-[#090311]/75 rounded-2xl translate-x-1.5 translate-y-1.5 z-0 transition-all duration-300 group-hover/stat-card:translate-x-2 group-hover/stat-card:translate-y-2" />
                  <div className="relative z-10 bg-[#361d57] border border-[#ffc107]/30 p-5 rounded-2xl transition-all duration-300 shadow-xl group-hover/stat-card:-translate-x-0.5 group-hover/stat-card:-translate-y-0.5 flex flex-col justify-between gap-3 h-full">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono font-bold uppercase tracking-wider text-white/50">Cadet Rank</span>
                      <div className="w-8 h-8 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
                        <Award size={16} />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-black font-display text-white">Level {level}</div>
                      <div className="text-xs sm:text-sm text-white/70 font-medium mt-1">{Math.round(progress)}% to Level {level < 10 ? level + 1 : 'MAX'}</div>
                    </div>
                  </div>
                </div>

                {/* Metric 3: Badges Collected */}
                <div className="relative group/stat-card">
                  <div className="absolute inset-0 bg-[#090311]/75 rounded-2xl translate-x-1.5 translate-y-1.5 z-0 transition-all duration-300 group-hover/stat-card:translate-x-2 group-hover/stat-card:translate-y-2" />
                  <div className="relative z-10 bg-[#361d57] border border-[#a855f7]/30 p-5 rounded-2xl transition-all duration-300 shadow-xl group-hover/stat-card:-translate-x-0.5 group-hover/stat-card:-translate-y-0.5 flex flex-col justify-between gap-3 h-full">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono font-bold uppercase tracking-wider text-white/50">Badges</span>
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-[#a855f7] flex items-center justify-center">
                        <ShieldCheck size={16} />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-black font-display text-white">{unlockedAchievementsCount}</div>
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
                  <Link href="/modules" className="text-xs text-[#ff912d] hover:underline font-bold flex items-center gap-1">
                    View Missions <ArrowRight size={13} />
                  </Link>
                </div>

                {/* 2x2 Course Track Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* Track 1: Web Development (Active) */}
                  <div className="relative group/track-card">
                    <div className="absolute inset-0 bg-[#090311]/75 rounded-2xl translate-x-2 translate-y-2 z-0 transition-all duration-300 group-hover/track-card:translate-x-3 group-hover/track-card:translate-y-3" />
                    <div className="relative z-10 bg-gradient-to-br from-[#ff912d] to-[#e67e22] text-white p-5 rounded-2xl transition-all duration-300 shadow-xl group-hover/track-card:-translate-x-1 group-hover/track-card:-translate-y-1 flex flex-col justify-between gap-5 border border-white/20">
                      <div className="flex items-center justify-between">
                        <div className="font-display font-black text-lg tracking-tight">Web Development</div>
                        <span className="bg-[#1e0a2d]/80 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Active
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                          <span className="text-3xl font-black font-display tracking-tight">{webProgress}%</span>
                          <span className="text-xs font-bold text-white/90">{completedMissions.length} / {TOTAL_WEB_MODULES} Modules</span>
                        </div>
                        {/* Progress Bar Track */}
                        <div className="h-3 w-full bg-[#1e0a2d]/60 rounded-full overflow-hidden p-0.5 border border-black/20">
                          <div 
                            className="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: `${Math.max(4, webProgress)}%` }}
                          />
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
                          <span className="text-xs font-bold text-white/90">0 / 20 Modules</span>
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
                          <span className="text-xs font-bold text-white/90">0 / 18 Modules</span>
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
                          <span className="text-xs font-bold text-white/90">0 / 22 Modules</span>
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
                  
                  {/* Top Header Row: Sector & Category Badges + Time Remaining */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#ff912d] text-black font-sans font-black text-xs uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                        <Flame size={13} className="fill-black" /> Daily Mission Level
                      </span>
                      <span className="bg-white/10 text-white font-mono text-xs uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/10">
                        {dailyGeneratedLevel.sector}
                      </span>
                      <span className="hidden sm:inline-block bg-white/5 text-white/70 font-mono text-xs px-2.5 py-1 rounded-full border border-white/10">
                        {dailyGeneratedLevel.difficulty}
                      </span>
                    </div>

                    {/* Clean Timer Label (24 Hours Left) */}
                    <div className="flex items-center gap-1.5 text-[#ff912d] text-sm font-bold font-mono">
                      <Clock size={15} />
                      <span>24 Hours Left</span>
                    </div>
                  </div>

                  {/* Main Content Area: Planet Graphic + Mission Description & Launch Action */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 flex-1 justify-center">
                    
                    {/* Planet Thumbnail Container */}
                    <div className="w-22 h-22 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-b from-[#1a082c] to-[#130927] border border-white/10 flex items-center justify-center relative overflow-hidden flex-shrink-0 shadow-inner">
                      <img 
                        src="/Landing Page BG.png" 
                        alt="Starfield"
                        className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
                      />
                      <img 
                        src={dailyGeneratedLevel.planetIcon} 
                        alt="Planet" 
                        className="w-14 h-14 sm:w-16 sm:h-16 object-contain relative z-10 drop-shadow-[0_0_12px_rgba(255,145,45,0.4)] transition-transform duration-500 group-hover/daily-level-card:scale-110" 
                      />
                    </div>

                    {/* Mission Details & Action Button */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between gap-3.5 text-center sm:text-left w-full h-full">
                      <div className="space-y-1.5">
                        <h3 className="text-white font-display font-black text-lg sm:text-xl tracking-tight">
                          {dailyGeneratedLevel.title}
                        </h3>
                        <p className="text-white/80 text-sm font-medium leading-relaxed">
                          {dailyGeneratedLevel.desc}
                        </p>
                      </div>

                      {/* Reward Chips & Launch Button Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 mt-auto">
                        <div className="flex items-center gap-2.5 mx-auto sm:mx-0">
                          <span className="text-xs sm:text-sm font-mono font-black bg-[#ff912d]/20 text-[#ff912d] px-3.5 py-1.5 rounded-xl border border-[#ff912d]/40 shadow-sm">
                            +{dailyGeneratedLevel.xpReward} XP Reward
                          </span>
                          <span className="text-xs sm:text-sm font-mono font-black bg-purple-500/20 text-[#a855f7] px-3.5 py-1.5 rounded-xl border border-purple-500/40 shadow-sm">
                            +{dailyGeneratedLevel.gearsReward} Gears
                          </span>
                        </div>

                        <Link 
                          href={dailyGeneratedLevel.link}
                          className="w-full sm:w-auto px-6 py-2.5 bg-[#ff912d] hover:bg-orange-400 text-black font-sans font-black text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Play size={14} className="fill-black" /> START MISSION
                        </Link>
                      </div>
                    </div>

                  </div>

                </div>
              </div>

            </div>

            {/* RIGHT COLUMN (Slimmer, Portrait Vertical) */}
            <div className="flex flex-col justify-between gap-6 w-full">
              
              {/* Top Right: Astronaut Avatar Portrait Card */}
              <div className="relative group/avatar-card">
                <div className="absolute inset-0 bg-[#090311]/75 rounded-3xl translate-x-2 translate-y-2 z-0 transition-all duration-300 group-hover/avatar-card:translate-x-3 group-hover/avatar-card:translate-y-3" />
                <div className="relative z-10 bg-[#361d57] border-2 border-[#ff912d]/50 p-5 sm:p-6 rounded-3xl transition-all duration-300 shadow-xl group-hover/avatar-card:-translate-x-1 group-hover/avatar-card:-translate-y-1 flex flex-col justify-between gap-5 overflow-hidden min-h-[290px]">
                  
                  {/* Cosmic Backdrop Ambient Effects */}
                  <img 
                    src="/Landing Page BG.png" 
                    alt="Stars" 
                    className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#1a082c]/80 via-transparent to-[#1a082c]/90 pointer-events-none" />
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#ff912d]/15 rounded-full blur-xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-[#a855f7]/15 rounded-full blur-xl pointer-events-none" />

                  {/* Header: User Display Name at the Top */}
                  <div className="relative z-10 w-full flex items-center justify-between border-b border-white/10 pb-2">
                    <h3 className="text-white font-display font-black text-base tracking-wide">
                      {userDisplayName}
                    </h3>
                    <span className="text-[10px] font-mono font-bold text-[#ff912d] bg-[#ff912d]/15 px-2 py-0.5 rounded border border-[#ff912d]/30">
                      AVATAR
                    </span>
                  </div>

                  {/* Middle Stage: Floor Stage with Character Standing Shadow at the Bottom */}
                  <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-end my-3 min-h-[140px] pb-3">
                    {/* Evident Character Floor Standing Shadow (Enlarged & Un-cutoff) */}
                    <div className="w-44 h-6 sm:w-52 sm:h-7 bg-[#05010a]/95 rounded-[100%] blur-[3px] shadow-[0_0_25px_rgba(0,0,0,0.95)] border border-black/60 mb-2" />
                  </div>

                  {/* Quick Profile Link */}
                  <Link 
                    href="/profile"
                    className="relative z-10 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#ff912d]/50 rounded-xl text-xs font-bold text-[#ff912d] transition-all flex items-center justify-center gap-1.5"
                  >
                    Customize in Profile <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              {/* Daily Expeditions Card (Tasks Completed) */}
              <div className="relative group/commissions-card flex-1">
                <div className="absolute inset-0 bg-[#090311]/75 rounded-3xl translate-x-2 translate-y-2 z-0 transition-all duration-300 group-hover/commissions-card:translate-x-3 group-hover/commissions-card:translate-y-3" />
                <div className="relative z-10 bg-[#361d57] border-2 border-[#ff912d]/50 p-4 sm:p-5 rounded-3xl transition-all duration-300 shadow-xl group-hover/commissions-card:-translate-x-1 group-hover/commissions-card:-translate-y-1 flex flex-col justify-start gap-3 h-full">
                  
                  {/* Expeditions Header */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-[#ff912d]" size={18} />
                      <h3 className="font-display font-black text-base text-white tracking-wide uppercase">
                        Daily Expeditions
                      </h3>
                    </div>

                    {/* Top Expeditions Progress Bar & Claim Button */}
                    <DailyCommissionClaimButton 
                      completedTasksCount={completedTasksCount}
                      totalTasksCount={dailyTasks.length}
                      bonusGears={50}
                      bonusXP={150}
                    />
                  </div>

                  {/* Expeditions List (Distinct Gap from Rewards Claim Box) */}
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
                            <span className="text-xs font-mono font-black bg-purple-500/20 text-[#a855f7] px-2.5 py-1 rounded-lg border border-purple-500/35">
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
