"use client";

import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  X, 
  Puzzle, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  CornerDownRight,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { 
  getSolutionGuideForMission, 
  LevelSolutionGuide, 
  LevelSectionSolution, 
  PuzzleBlockSpec, 
  WorkspaceAssemblyNode, 
  CATEGORY_COLORS, 
  BlockCategory 
} from '@/lib/levelSolutionGuides';

interface LevelSolutionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionId: string;
  currentSectionIndex?: number;
  missionTitle?: string;
  planetName?: string;
}

/**
 * Authentic Blockly-inspired Puzzle Block component
 */
function PuzzleBlockShape({
  name,
  category,
  isCustomizable,
  customizableChoice,
  notes,
  isCompact = false,
}: {
  name: string;
  category: BlockCategory;
  isCustomizable?: boolean;
  customizableChoice?: string;
  notes?: string;
  isCompact?: boolean;
}) {
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.code;

  return (
    <div
      className={`relative inline-flex items-center gap-2 rounded-lg font-mono font-semibold transition-all select-none shadow-md ${
        isCompact ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2 text-xs sm:text-sm'
      } ${
        isCustomizable
          ? 'border-2 border-dashed border-amber-400 bg-amber-500/20 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
          : 'border text-white'
      }`}
      style={{
        backgroundColor: isCustomizable ? undefined : color.bg,
        borderColor: isCustomizable ? undefined : color.border,
      }}
    >
      {/* Top Puzzle Notch Cutout */}
      <div 
        className="absolute -top-[5px] left-5 w-4 h-1.5 rounded-t-sm"
        style={{
          backgroundColor: isCustomizable ? '#d97706' : color.bg,
          borderTop: `1px solid ${isCustomizable ? '#fbbf24' : color.border}`,
          borderLeft: `1px solid ${isCustomizable ? '#fbbf24' : color.border}`,
          borderRight: `1px solid ${isCustomizable ? '#fbbf24' : color.border}`,
        }}
      />

      {/* Bottom Puzzle Tab Protrusion */}
      <div 
        className="absolute -bottom-[5px] left-5 w-4 h-1.5 rounded-b-sm shadow-sm"
        style={{
          backgroundColor: isCustomizable ? '#d97706' : color.bg,
          borderBottom: `1px solid ${isCustomizable ? '#fbbf24' : color.border}`,
          borderLeft: `1px solid ${isCustomizable ? '#fbbf24' : color.border}`,
          borderRight: `1px solid ${isCustomizable ? '#fbbf24' : color.border}`,
        }}
      />

      {/* Block Icon / Badge */}
      {isCustomizable ? (
        <Sparkles size={13} className="text-amber-400 shrink-0" />
      ) : (
        <span 
          className="w-2 h-2 rounded-full shrink-0" 
          style={{ backgroundColor: color.border }} 
        />
      )}

      {/* Block Text */}
      <span className="tracking-wide whitespace-nowrap">{name}</span>

      {/* Customizable Choice Slot Indicator */}
      {isCustomizable && customizableChoice && (
        <span className="ml-1 text-[11px] font-sans font-normal px-2 py-0.5 rounded bg-amber-400/30 text-amber-100 border border-amber-400/40">
          {customizableChoice}
        </span>
      )}

      {/* Optional Note */}
      {notes && (
        <span className="text-[10px] font-mono text-gray-300/80 font-normal ml-1">
          // {notes}
        </span>
      )}
    </div>
  );
}

export default function LevelSolutionGuideModal({
  isOpen,
  onClose,
  missionId,
  currentSectionIndex = 0,
  missionTitle,
  planetName,
}: LevelSolutionGuideModalProps) {
  const guide: LevelSolutionGuide = getSolutionGuideForMission(missionId, missionTitle, planetName);
  
  // Tab state: 'blocks' | 'arrangement'
  const [activeTab, setActiveTab] = useState<'blocks' | 'arrangement'>('blocks');

  // Multi-section index
  const initialSection = Math.min(
    Math.max(0, currentSectionIndex),
    Math.max(0, guide.sections.length - 1)
  );
  const [selectedSectionIdx, setSelectedSectionIdx] = useState<number>(initialSection);

  // Sync selected section when modal opens or section index changes
  useEffect(() => {
    if (isOpen) {
      setSelectedSectionIdx(
        Math.min(
          Math.max(0, currentSectionIndex),
          Math.max(0, guide.sections.length - 1)
        )
      );
    }
  }, [isOpen, currentSectionIndex, guide.sections.length]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeSectionData: LevelSectionSolution =
    guide.sections[selectedSectionIdx] || guide.sections[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="solution-guide-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[88vh] flex flex-col bg-[#0d0722] border border-yellow-500/40 rounded-2xl shadow-2xl shadow-yellow-500/10 overflow-hidden text-gray-100 animate-in zoom-in-95 duration-200 relative"
      >
        {/* TOP GLOW ACCENT BAR */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 shrink-0" />

        {/* COMPACT CLEAN HEADER */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between gap-3 bg-gradient-to-b from-[#180d38] to-[#0d0722] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-yellow-500/15 border border-yellow-400/40 text-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.2)] shrink-0">
              <Lightbulb className="w-5 h-5 fill-yellow-400/30 text-yellow-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 font-semibold">
                  {guide.planetName}
                </span>
                <span className="text-[10px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-200 border border-purple-500/30">
                  {guide.categoryTag}
                </span>
              </div>
              <h2
                id="solution-guide-title"
                className="text-base sm:text-lg font-bold font-sans text-white tracking-wide truncate mt-0.5"
              >
                {guide.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-all cursor-pointer shrink-0"
            aria-label="Close Solution Manual"
          >
            <X size={18} />
          </button>
        </div>

        {/* SECTION SELECTOR (If multi-stage mission) */}
        {guide.sections.length > 1 && (
          <div className="px-5 py-2 border-b border-white/5 bg-[#120a2e] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider shrink-0 mr-1">
              Part:
            </span>
            {guide.sections.map((sec, idx) => {
              const isSelected = idx === selectedSectionIdx;
              const isCurrentPlaying = idx === currentSectionIndex;
              return (
                <button
                  key={sec.sectionIndex}
                  onClick={() => setSelectedSectionIdx(idx)}
                  className={`px-3 py-1 rounded-lg text-xs font-sans font-medium transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-yellow-500/25 text-yellow-300 border border-yellow-400/60 shadow-sm'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  <span>{sec.title}</span>
                  {isCurrentPlaying && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400/30 text-amber-200 font-mono font-bold">
                      ACTIVE
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* 2 MAIN TABS: REQUIRED BLOCKS vs WORKSPACE ARRANGEMENT */}
        <div className="px-5 pt-3 border-b border-white/10 bg-[#0f0826] flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('blocks')}
            className={`flex-1 py-2.5 px-3 rounded-t-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer border-t border-x ${
              activeTab === 'blocks'
                ? 'bg-[#180f3a] text-yellow-300 border-yellow-500/40 border-b-transparent shadow-[0_-2px_10px_rgba(250,204,21,0.08)]'
                : 'bg-transparent text-gray-400 hover:text-gray-200 border-transparent hover:bg-white/5'
            }`}
          >
            <Puzzle size={15} className={activeTab === 'blocks' ? 'text-yellow-400' : 'text-gray-400'} />
            <span>1. Required Blocks & Logic</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/40 text-gray-400">
              {activeSectionData.requiredBlocks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('arrangement')}
            className={`flex-1 py-2.5 px-3 rounded-t-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer border-t border-x ${
              activeTab === 'arrangement'
                ? 'bg-[#180f3a] text-yellow-300 border-yellow-500/40 border-b-transparent shadow-[0_-2px_10px_rgba(250,204,21,0.08)]'
                : 'bg-transparent text-gray-400 hover:text-gray-200 border-transparent hover:bg-white/5'
            }`}
          >
            <Layers size={15} className={activeTab === 'arrangement' ? 'text-yellow-400' : 'text-gray-400'} />
            <span>2. Workspace Arrangement</span>
          </button>
        </div>

        {/* TAB CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 text-sm leading-relaxed custom-scrollbar bg-[#180f3a]/50">
          
          {/* TAB 1: REQUIRED BLOCKS & LOGIC */}
          {activeTab === 'blocks' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400 pb-1">
                <span>Grab these blocks from your toolbox:</span>
                <span className="text-[11px] font-mono text-yellow-400/80">Click blocks to inspect</span>
              </div>

              {activeSectionData.requiredBlocks.map((block: PuzzleBlockSpec, idx: number) => {
                const color = CATEGORY_COLORS[block.category] || CATEGORY_COLORS.code;
                return (
                  <div
                    key={`${block.name}-${idx}`}
                    className="p-3 rounded-xl bg-black/40 border border-white/10 hover:border-yellow-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    {/* Visual Puzzle Block */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <PuzzleBlockShape
                        name={block.name}
                        category={block.category}
                        isCustomizable={block.isCustomizable}
                      />
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                        {block.category}
                      </span>
                    </div>

                    {/* Purpose / 1-Sentence Logic */}
                    <div className="flex-1 sm:text-right min-w-0">
                      <p className="text-xs text-gray-300 leading-snug">
                        {block.summary}
                      </p>
                      
                      {/* Customizable Notice */}
                      {block.isCustomizable && (
                        <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/25">
                          <Sparkles size={11} className="text-amber-400 shrink-0" />
                          <span>
                            {block.customizableHint || "Customizable: pick any value or style you prefer"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {activeSectionData.summaryNote && (
                <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/25 text-xs text-yellow-200/90 flex items-center gap-2 mt-2">
                  <CheckCircle2 size={15} className="text-yellow-400 shrink-0" />
                  <span>{activeSectionData.summaryNote}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WORKSPACE ARRANGEMENT */}
          {activeTab === 'arrangement' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400 pb-1">
                <span>Connect your blocks in this order (top to bottom):</span>
                <span className="text-[11px] font-mono text-purple-300">
                  Nested blocks snap inside brackets
                </span>
              </div>

              {/* INTERLOCKING STACK */}
              <div className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-2 relative">
                {activeSectionData.assembly.map((node: WorkspaceAssemblyNode, idx: number) => {
                  const hasIndent = node.indent > 0;
                  const indentPixels = node.indent * 28;

                  return (
                    <div 
                      key={`assembly-${idx}`} 
                      className="flex items-center gap-2 relative group"
                      style={{ paddingLeft: `${indentPixels}px` }}
                    >
                      {/* Nesting Indicator Line */}
                      {hasIndent && (
                        <div className="flex items-center text-purple-400/60 mr-1 shrink-0">
                          <CornerDownRight size={14} />
                        </div>
                      )}

                      {/* Snap Connector / Down Arrow for root stack */}
                      {!hasIndent && idx > 0 && (
                        <div className="absolute -top-2 left-6 text-yellow-400/40 text-[10px] select-none pointer-events-none">
                          ▼
                        </div>
                      )}

                      {/* Puzzle Block */}
                      <PuzzleBlockShape
                        name={node.blockName}
                        category={node.category}
                        isCustomizable={node.isCustomizable}
                        customizableChoice={node.customizableChoice}
                        notes={node.notes}
                        isCompact={true}
                      />

                      {/* Customization callout for flexible blocks */}
                      {node.isCustomizable && (
                        <div className="text-[11px] text-amber-300/90 italic ml-2 hidden sm:inline">
                          (Your custom choice is valid here)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* HELPFUL NOTE */}
              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200/80 flex items-center gap-2">
                <Sliders size={14} className="text-purple-400 shrink-0" />
                <span>
                  Blocks with indented arrows snap inside loops or condition brackets. You are free to customize any marked slots!
                </span>
              </div>
            </div>
          )}

        </div>

        {/* COMPACT MODAL FOOTER */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#120a2e] flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-gray-400 hidden sm:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Switch tabs anytime while assembling your code.</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-bold font-sans text-xs uppercase tracking-wider transition-all shadow-md shadow-yellow-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2 ml-auto"
          >
            <span>Return to Workspace</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
