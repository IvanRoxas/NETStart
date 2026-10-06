"use client";

import React, { useEffect } from 'react';
import { X, Terminal, ShieldAlert, ShieldCheck, Cpu } from 'lucide-react';

interface ClueModalProps {
  id: 1 | 2 | 3 | 4;
  onClose: () => void;
}

const CLUE_DATA: Record<
  1 | 2 | 3 | 4,
  {
    title: string;
    subtitle: string;
    icon: typeof Terminal;
    slot: string;
    desc: string;
    blueprint: string;
    privateData: string;
    publicData: string;
    actions: string[];
  }
> = {
  1: {
    title: "The Admin",
    subtitle: "Datapad 1",
    icon: Terminal,
    slot: "Slot 1: Admin",
    desc: "Facility administrator. Needs private clearance 4, public role 'Admin', unlockDoors(), and soundAlarm().",
    blueprint: "AdminProfile",
    privateData: "private clearanceLevel = 4",
    publicData: 'public role = "Admin"',
    actions: ["unlockDoors()", "soundAlarm()"],
  },
  2: {
    title: "The Technician",
    subtitle: "Datapad 2",
    icon: ShieldAlert,
    slot: "Slot 2: Technician",
    desc: "Hardware specialist. Needs private clearance 3, public role 'Maintenance', fixErrors(), and checkHealth().",
    blueprint: "TechProfile",
    privateData: "private clearanceLevel = 3",
    publicData: 'public role = "Maintenance"',
    actions: ["fixErrors()", "checkHealth()"],
  },
  3: {
    title: "The Security Officer",
    subtitle: "Datapad 3",
    icon: ShieldCheck,
    slot: "Slot 3: Security",
    desc: "Perimeter guardian. Needs private clearance 2, public role 'Security', soundAlarm() (shared with Admin), and scanRoom().",
    blueprint: "SecurityProfile",
    privateData: "private clearanceLevel = 2",
    publicData: 'public role = "Security"',
    actions: ["soundAlarm()", "scanRoom()"],
  },
  4: {
    title: "The Visitor",
    subtitle: "Datapad 4",
    icon: Cpu,
    slot: "Slot 4: Visitor",
    desc: "Station guest. Needs private clearance 1, public role 'Visitor', and takeTour().",
    blueprint: "VisitorProfile",
    privateData: "private clearanceLevel = 1",
    publicData: 'public role = "Visitor"',
    actions: ["takeTour()"],
  },
};

export default function ClueModal({ id, onClose }: ClueModalProps) {
  const clue = CLUE_DATA[id];
  const IconComponent = clue.icon;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      id="clue_modal_backdrop"
      onClick={onClose}
      className="absolute inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        id="clue_modal_dialog"
        className="w-full max-w-sm bg-[#0d131f]/98 border border-[#ff912d]/50 rounded-2xl p-4 shadow-[0_0_35px_rgba(255,145,45,0.25)] relative text-white flex flex-col gap-3 animate-in zoom-in-95 duration-200 cursor-default"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#ff912d]/15 border border-[#ff912d]/40 flex items-center justify-center text-[#ff912d]">
              <IconComponent size={15} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-[#ff912d] font-bold leading-none">
                {clue.subtitle} - {clue.slot}
              </div>
              <h3 className="text-xs sm:text-sm font-bold font-mono tracking-tight text-white mt-0.5">
                {clue.title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Concise Description */}
        <p className="text-[11px] font-sans text-gray-300 leading-normal bg-black/40 border border-white/5 rounded-lg px-2.5 py-1.5">
          {clue.desc}
        </p>

        {/* Compact Requirement Cards */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5">
            <span className="text-[11px] text-gray-400 font-mono">Blueprint:</span>
            <span className="text-[11px] font-mono font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 px-2 py-0.5 rounded">
              {clue.blueprint}
            </span>
          </div>

          <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5">
            <span className="text-[11px] text-gray-400 font-mono">Private Data:</span>
            <span className="text-[11px] font-mono font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
              {clue.privateData}
            </span>
          </div>

          <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5">
            <span className="text-[11px] text-gray-400 font-mono">Public Data:</span>
            <span className="text-[11px] font-mono font-bold text-rose-300 bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 rounded">
              {clue.publicData}
            </span>
          </div>

          <div className="flex flex-col gap-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5">
            <span className="text-[11px] text-gray-400 font-mono">
              Actions:
            </span>
            <div className="flex flex-wrap gap-1">
              {clue.actions.map(act => (
                <span
                  key={act}
                  className="text-[10px] font-mono font-bold text-purple-300 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded"
                >
                  {act}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <span className="text-[10px] text-gray-400 font-mono">
            Datapad {id} of 4 Checked
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1 bg-[#ff912d] hover:bg-[#ffa756] text-black font-mono font-bold text-xs uppercase rounded-lg shadow transition-all active:scale-95 cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
