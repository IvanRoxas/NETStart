"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { X, ChevronDown, Zap } from "lucide-react";
import { DailyTaskNotificationData, getTodayActiveDailyTaskIds } from "@/lib/dailyTasks";


/**
 * Minimalist Star Icon
 * Elegant 4-point geometric star with subtle radiant glow
 */
function MinimalistStarIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <div className="relative flex items-center justify-center shrink-0">
      <div className="absolute inset-0 bg-amber-400/25 blur-sm rounded-full transform scale-125 pointer-events-none" />
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinejoin="round"
        className={`${className} text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]`}
      >
        <path d="M12 2L14.6 9.4L22 12L14.6 14.6L12 22L9.4 14.6L2 12L9.4 9.4L12 2Z" />
      </svg>
    </div>
  );
}

export default function DailyTaskNotificationProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<DailyTaskNotificationData[]>([]);
  const [currentTask, setCurrentTask] = useState<DailyTaskNotificationData | null>(null);
  const [show, setShow] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const remainingTimeRef = useRef<number>(5500); // 5.5s display duration
  const shownIdsRef = useRef<Set<string>>(new Set());

  // Initialize notification sound
  useEffect(() => {
    if (typeof window !== "undefined") {
      const audio = new Audio();
      const canPlayMp3 = audio.canPlayType && audio.canPlayType("audio/mpeg") !== "";
      audio.src = canPlayMp3 ? "/assets/global/ui/notification.mp3" : "/assets/global/ui/Notification.ogg";
      audio.volume = 0.25;
      audio.preload = "auto";
      audioRef.current = audio;
    }
  }, []);

  const playNotificationChime = useCallback(() => {
    try {
      if (typeof window !== "undefined" && localStorage.getItem("setting_sounds") !== "false" && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } catch {}
  }, []);

  // Listen to window event 'daily_task_completed'
  useEffect(() => {
    const handleDailyTaskEvent = (event: Event) => {
      const customEvent = event as CustomEvent<DailyTaskNotificationData>;
      if (!customEvent.detail) return;
      const detail = customEvent.detail;

      // Only monitor/show tasks that belong to today's active tasks
      const activeTaskIds = getTodayActiveDailyTaskIds();
      if (!activeTaskIds.includes(detail.taskId)) return;

      const uniqueKey = detail.id || `${detail.taskId}-${Date.now()}`;
      if (shownIdsRef.current.has(uniqueKey)) return;
      shownIdsRef.current.add(uniqueKey);

      setQueue((prev) => [...prev, { ...detail, id: detail.id || uniqueKey }]);
    };

    window.addEventListener("daily_task_completed", handleDailyTaskEvent);
    return () => window.removeEventListener("daily_task_completed", handleDailyTaskEvent);
  }, []);

  // Dismiss current notification
  const dismissCurrent = useCallback(
    (_taskToDismiss?: DailyTaskNotificationData | null) => {
      setShow(false);
      setIsHovered(false);

      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

      setTimeout(() => {
        setQueue((prev) => prev.slice(1));
        setCurrentTask(null);
      }, 400);
    },
    []
  );

  // Process queue
  useEffect(() => {
    if (!currentTask && queue.length > 0) {
      const nextTask = queue[0];
      setCurrentTask(nextTask);
      setShow(true);
      setProgress(100);
      remainingTimeRef.current = 5500;
      playNotificationChime();
    }
  }, [queue, currentTask, playNotificationChime]);

  // Auto-dismiss timer management (pauses when hovered)
  useEffect(() => {
    if (!show || !currentTask) return;

    if (isHovered) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const duration = remainingTimeRef.current > 0 ? remainingTimeRef.current : 3500;
    const intervalStep = 50;

    let stepCount = 0;
    progressIntervalRef.current = setInterval(() => {
      stepCount++;
      const currentRemaining = Math.max(0, duration - stepCount * intervalStep);
      remainingTimeRef.current = currentRemaining;
      const nextProgress = Math.max(0, (currentRemaining / 5500) * 100);
      setProgress(nextProgress);
    }, intervalStep);

    timerRef.current = setTimeout(() => {
      dismissCurrent(currentTask);
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [show, currentTask, isHovered, dismissCurrent]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    remainingTimeRef.current = Math.max(remainingTimeRef.current, 3500);
    setIsHovered(false);
  };

  return (
    <>
      {children}

      {/* Side Notification Toast Popup for Daily Tasks */}
      <aside
        aria-live="polite"
        className={`fixed top-24 right-6 z-[999998] transition-all duration-500 ease-out transform pointer-events-auto ${
          show && currentTask
            ? "translate-x-0 opacity-100 scale-100"
            : "translate-x-[120%] opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {currentTask && (
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`w-[300px] sm:w-[330px] bg-[#0c0f1d]/95 backdrop-blur-xl border border-amber-400/40 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(245,158,11,0.2)] overflow-hidden transition-all duration-300 ease-out ${
              isHovered ? "border-amber-400/70 shadow-[0_16px_45px_rgba(0,0,0,0.7),0_0_30px_rgba(245,158,11,0.3)]" : ""
            }`}
          >
            {/* Ambient Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent pointer-events-none" />

            {/* Top Compact Section */}
            <div className="p-3 flex items-center gap-3 relative z-10">
              {/* Minimalist Star Icon Container */}
              <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-amber-500/25 to-yellow-500/10 border border-amber-400/50 flex items-center justify-center shadow-inner">
                <MinimalistStarIcon className="w-4 h-4" />
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0 pr-4">
                <div className="text-[10px] font-bold text-amber-400 tracking-wider uppercase mb-0.5">
                  Daily Task Completed
                </div>

                <h4 className="text-white font-semibold text-sm leading-tight truncate" title={currentTask.title}>
                  {currentTask.title}
                </h4>

                {!isHovered && (
                  <div className="flex items-center gap-1 mt-0.5 text-[11px] text-white/45">
                    <span>Hover for details</span>
                    <ChevronDown className="w-3 h-3 text-white/40" />
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissCurrent(currentTask);
                }}
                className="text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full w-6 h-6 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Hover Details: Simple Description & Rewards */}
            <div
              className={`transition-all duration-300 ease-out overflow-hidden relative z-10 px-3 ${
                isHovered ? "max-h-48 opacity-100 pb-3 pt-0.5" : "max-h-0 opacity-0 pb-0 pt-0 pointer-events-none"
              }`}
            >
              <div className="border-t border-white/10 pt-2 flex flex-col gap-2">
                {/* Description Box */}
                <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {currentTask.desc}
                  </p>
                </div>

                {/* Rewards Breakdown: Thunderbolt for XP, Yellow for Gears */}
                <div className="grid grid-cols-2 gap-2">
                  {/* XP Bonus with Thunderbolt */}
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-amber-400/20 flex items-center justify-center shrink-0">
                      <Zap className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </div>
                    <span className="text-xs font-bold text-amber-300">+{currentTask.xpEarned} XP</span>
                  </div>

                  {/* Gears with Yellow Styling and Yellow Gear Icon */}
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-yellow-400/20 flex items-center justify-center shrink-0">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3 h-3 text-yellow-400"
                      >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-yellow-300">+{currentTask.gearsEarned} Gears</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Auto-Dismiss Progress Bar (pauses when hovered) */}
            <div className="w-full h-1 bg-white/5 relative overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-75 ${
                  isHovered ? "opacity-35" : "opacity-100"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
