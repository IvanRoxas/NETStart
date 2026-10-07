"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Lock, Play, X, Film, CheckCircle2 } from "lucide-react";
import {
  STORY_CATEGORIES,
  STORY_ARCHIVE_ENTRIES,
  StoryCategory,
  StoryArchiveEntry,
  isStoryEntryUnlocked
} from "@/lib/storyArchive";
import VisualNovelCutscene, { sanitizeDialogueText } from "@/components/VisualNovelCutscene";
import { getUserStorageItem } from "@/lib/userStorage";
import { triggerDailyTaskCompletion } from "@/lib/dailyTasks";

interface StoryArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  hasTakenAptitudeTest?: boolean;
  completedMissions?: { missionId: string }[];
  isDemoMode?: boolean;
  username?: string;
  scopedCategory?: StoryCategory | null;
  sectorTitle?: string;
}

const getPlanetMeta = (category: StoryCategory, categoryTitle?: string) => {
  switch (category) {
    case "moon":
      return {
        name: "The Moon",
        icon: "/assets/planets/00_moon/environment/MainMoon.svg",
      };
    case "mars":
      return {
        name: "Mars",
        icon: "/assets/planets/celestial/Mars.svg",
      };
    case "venus":
      return {
        name: "Venus",
        icon: "/assets/planets/celestial/Venus.svg",
      };
    case "mercury":
      return {
        name: "Mercury",
        icon: "/assets/planets/celestial/Mercury.svg",
      };
    case "jupiter":
      return {
        name: "Jupiter",
        icon: "/assets/planets/celestial/Jupiter.svg",
      };
    case "saturn":
      return {
        name: "Saturn",
        icon: "/assets/planets/celestial/Saturn.svg",
      };
    case "earth":
      return {
        name: "Earth",
        icon: "/assets/planets/celestial/Earth.svg",
      };
    case "prologue":
      return {
        name: "Prologue",
        icon: "/assets/planets/celestial/Planet 1.svg",
      };
    case "epilogue":
      return {
        name: "Epilogue",
        icon: "/assets/planets/celestial/Planet 8.svg",
      };
    default:
      return {
        name: categoryTitle || "Sector",
        icon: "/assets/planets/celestial/Mars.svg",
      };
  }
};

export default function StoryArchiveModal({
  isOpen,
  onClose,
  userId,
  hasTakenAptitudeTest = false,
  completedMissions = [],
  isDemoMode = false,
  username = "Operator",
  scopedCategory,
  sectorTitle,
}: StoryArchiveModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory>(scopedCategory || "all");
  const [activePlayingEntry, setActivePlayingEntry] = useState<StoryArchiveEntry | null>(null);

  // Sync category if scopedCategory changes
  useEffect(() => {
    if (scopedCategory) {
      setSelectedCategory(scopedCategory);
    }
  }, [scopedCategory, isOpen]);

  // Compute set of all completed missions across DB + localStorage
  const completedIds = useMemo(() => {
    const set = new Set<string>();

    // Server completed
    completedMissions.forEach((m) => {
      if (m.missionId) set.add(m.missionId.toLowerCase());
    });

    // Local completed
    if (typeof window !== "undefined") {
      try {
        const scoped = userId ? getUserStorageItem("completed_missions", userId) : null;
        const fallback = localStorage.getItem("completed_missions");
        const localList: string[] = JSON.parse(scoped || fallback || "[]");
        localList.forEach((id) => set.add(id.toLowerCase()));
      } catch (e) {
        console.warn("Could not read local completed_missions in StoryArchiveModal:", e);
      }
    }

    return set;
  }, [completedMissions, userId]);

  // Determine if Python was the last completed planet for Earth branching storylines
  const isPythonLast = useMemo(() => {
    const hasMars = Array.from(completedIds).some(m => m.startsWith("mars") || m.startsWith("html"));
    const hasVenus = Array.from(completedIds).some(m => m.startsWith("venus") || m.startsWith("css"));
    const hasMercury = Array.from(completedIds).some(m => m.startsWith("mercury") || m.startsWith("js") || m.startsWith("javascript"));
    const hasJupiter = Array.from(completedIds).some(m => m.startsWith("jupiter") || m.startsWith("java"));
    const hasSaturn = Array.from(completedIds).some(m => m.startsWith("saturn") || m.startsWith("cpp"));
    return hasMars && hasVenus && hasMercury && hasJupiter && hasSaturn;
  }, [completedIds]);

  // Map each entry to its unlocked status
  const evaluatedEntries = useMemo(() => {
    return STORY_ARCHIVE_ENTRIES.map((entry) => {
      const unlocked = isStoryEntryUnlocked({
        entry,
        completedMissionIds: completedIds,
        hasTakenAptitudeTest,
        isDemoMode,
      });
      return {
        ...entry,
        unlocked,
      };
    });
  }, [completedIds, hasTakenAptitudeTest, isDemoMode]);

  const activeCategory = scopedCategory || selectedCategory;

  // Filtered by active category
  const filteredEntries = useMemo(() => {
    if (activeCategory === "all") return evaluatedEntries;
    return evaluatedEntries.filter((e) => e.category === activeCategory);
  }, [evaluatedEntries, activeCategory]);

  const totalCount = evaluatedEntries.length;
  const unlockedCount = evaluatedEntries.filter((e) => e.unlocked).length;

  // Category counts
  const categoryStats = useMemo(() => {
    const stats: Record<StoryCategory, { total: number; unlocked: number }> = {
      all: { total: totalCount, unlocked: unlockedCount },
      prologue: { total: 0, unlocked: 0 },
      moon: { total: 0, unlocked: 0 },
      mars: { total: 0, unlocked: 0 },
      venus: { total: 0, unlocked: 0 },
      mercury: { total: 0, unlocked: 0 },
      jupiter: { total: 0, unlocked: 0 },
      saturn: { total: 0, unlocked: 0 },
      earth: { total: 0, unlocked: 0 },
      epilogue: { total: 0, unlocked: 0 },
    };

    evaluatedEntries.forEach((e) => {
      if (stats[e.category]) {
        stats[e.category].total += 1;
        if (e.unlocked) stats[e.category].unlocked += 1;
      }
    });

    return stats;
  }, [evaluatedEntries, totalCount, unlockedCount]);

  const displayTotalCount = scopedCategory ? (categoryStats[scopedCategory]?.total || 0) : totalCount;
  const displayUnlockedCount = scopedCategory ? (categoryStats[scopedCategory]?.unlocked || 0) : unlockedCount;

  const currentCategoryLabel = scopedCategory
    ? (STORY_CATEGORIES.find((c) => c.id === scopedCategory)?.label || sectorTitle || "Sector")
    : "Story";

  const headerTitle = scopedCategory
    ? `${currentCategoryLabel} Archives`
    : "Story Archives";

  const headerSubtitle = scopedCategory
    ? `Rewatch storyline cutscenes and transmissions for this sector`
    : "Rewatch storyline cutscenes and transmissions";

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !activePlayingEntry) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activePlayingEntry, onClose]);

  if (!isOpen) return null;

  // If a cutscene is currently playing in fullscreen
  if (activePlayingEntry) {
    const scenes = activePlayingEntry.getScenes(isPythonLast);
    return (
      <div className="fixed inset-0 z-[10000] w-full h-full bg-black">
        <VisualNovelCutscene
          scenes={scenes}
          missionId={activePlayingEntry.id}
          username={username}
          userId={userId}
          summaryText={sanitizeDialogueText(activePlayingEntry.summary)}
          onFinished={() => setActivePlayingEntry(null)}
        />
      </div>
    );
  }



  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-[#140827] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
              {headerTitle}
            </h2>
            <p className="text-xs text-white/50 mt-0.5">
              {headerSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-medium text-[#ff912d] bg-[#ff912d]/10 border border-[#ff912d]/20 px-3 py-1 rounded-full">
              {displayUnlockedCount} / {displayTotalCount} Unlocked
            </span>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Category Arranger (Only shown on global missions map) */}
        {!scopedCategory && (
          <div className="px-6 py-3 border-b border-white/10 bg-black/30 shrink-0">
            {/* Main Category Tabs: Responsive wrap, clear visual progression */}
            <div className="flex flex-wrap items-center gap-2">
              {/* All Sectors Button */}
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${selectedCategory === "all"
                    ? "bg-[#ff912d] text-[#110524] shadow-[0_0_12px_rgba(255,145,45,0.4)]"
                    : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10"
                  }`}
              >
                <span>All Sectors</span>
                <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded-md ${selectedCategory === "all" ? "bg-black/20 text-[#110524]" : "bg-black/40 text-white/50"
                  }`}>
                  {unlockedCount}/{totalCount}
                </span>
              </button>

              <div className="h-4 w-px bg-white/15 mx-1 hidden sm:block" />

              {/* Chronological Sector Sequence */}
              {STORY_CATEGORIES.filter(c => c.id !== "all").map((cat) => {
                const stat = categoryStats[cat.id];
                const isSelected = selectedCategory === cat.id;
                const isFullyUnlocked = stat.unlocked === stat.total && stat.total > 0;
                const isLocked = stat.unlocked === 0;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${isSelected
                        ? "bg-[#ff912d] text-[#110524] shadow-[0_0_12px_rgba(255,145,45,0.4)]"
                        : isLocked
                          ? "bg-white/[0.02] hover:bg-white/5 text-white/40 border border-white/5"
                          : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10"
                      }`}
                  >
                    {isLocked && <Lock size={11} className={isSelected ? "text-[#110524]" : "text-white/40"} />}
                    <span>{cat.label}</span>
                    <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded-md ${isSelected
                        ? "bg-black/20 text-[#110524]"
                        : isFullyUnlocked
                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/20"
                          : isLocked
                            ? "bg-black/30 text-white/30"
                            : "bg-amber-950/60 text-amber-300 border border-amber-500/20"
                      }`}>
                      {stat.unlocked}/{stat.total}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Grid of Episode Cards */}
        <div className="flex-1 overflow-y-auto p-6 bg-black/20">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-20 text-white/40 font-mono text-sm">
              No transmission records found in this sector.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEntries.map((entry) => {
                const isLocked = !entry.unlocked;
                const planetMeta = getPlanetMeta(entry.category, entry.categoryTitle);

                return (
                  <div
                    key={entry.id}
                    onClick={() => {
                      if (!isLocked) {
                        setActivePlayingEntry(entry);
                        triggerDailyTaskCompletion("task-curriculum-3");
                      }
                    }}
                    className={`group rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${isLocked
                        ? "bg-white/[0.02] border-white/5 opacity-60 cursor-not-allowed"
                        : "bg-white/[0.04] hover:bg-white/[0.07] border-white/10 hover:border-[#ff912d]/50 cursor-pointer shadow-sm hover:shadow-md"
                      }`}
                  >
                    {/* Top Content: Thumbnail & Title Info */}
                    <div>
                      {/* 16:9 Thumbnail */}
                      <div className="relative aspect-video w-full overflow-hidden bg-black/60 shrink-0">
                        <img
                          src={entry.thumbnail}
                          alt={entry.title}
                          className={`w-full h-full object-cover select-none transition-transform duration-300 ${isLocked ? "grayscale brightness-40" : "group-hover:scale-105"
                            }`}
                        />

                        {/* Vignette */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                        {/* Hover Play Button (Unlocked) */}
                        {!isLocked && (
                          <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[1px]">
                            <div className="p-3 rounded-full bg-[#ff912d] text-[#150524] shadow-lg">
                              <Play size={18} className="fill-[#150524] ml-0.5" />
                            </div>
                          </div>
                        )}

                        {/* Locked Overlay */}
                        {isLocked && (
                          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-3 text-center bg-black/50">
                            <Lock size={20} className="text-white/40 mb-1.5" />
                            <span className="text-[11px] font-mono text-white/60">
                              {entry.requiredDescription}
                            </span>
                          </div>
                        )}

                        {/* Planet Tag on Image - positioned at z-20 so hover backdrop-blur does not blur it */}
                        <div className="absolute bottom-2 left-2.5 z-20 pointer-events-none">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-white/90 font-semibold px-2 py-0.5 rounded bg-black/75 border border-white/15 shadow-sm">
                            <img
                              src={planetMeta.icon}
                              alt=""
                              aria-hidden="true"
                              className="w-3.5 h-3.5 object-contain shrink-0"
                            />
                            <span>{planetMeta.name}</span>
                          </span>
                        </div>
                      </div>

                      {/* Card Titles */}
                      <div className="p-4 pb-2">
                        <h3 className={`text-sm sm:text-base font-bold transition-colors ${isLocked ? "text-white/60" : "text-white group-hover:text-[#ff912d]"
                          }`}>
                          {sanitizeDialogueText(entry.title)}
                        </h3>
                        <p className="text-xs text-white/50 mt-0.5 line-clamp-1">
                          {sanitizeDialogueText(entry.subtitle)}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action: Yellow Watch Container Button */}
                    <div className="p-4 pt-1">
                      {isLocked ? (
                        <div className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-white/40 font-mono text-xs font-semibold flex items-center justify-center gap-2 cursor-not-allowed select-none">
                          <Lock size={13} />
                          <span>Locked</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePlayingEntry(entry);
                            triggerDailyTaskCompletion("task-curriculum-3");
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-[#ff912d] hover:bg-[#ff912d]/90 text-[#150524] font-sans font-bold text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(255,145,45,0.3)] hover:shadow-[0_0_18px_rgba(255,145,45,0.5)] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Play size={13} className="fill-[#150524]" />
                          <span>Watch Cutscene</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Minimal Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs text-white/40 shrink-0">
          <span>Click any unlocked cutscene or Watch button to replay</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
