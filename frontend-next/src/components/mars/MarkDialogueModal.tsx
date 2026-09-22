"use client";

import React from 'react';
import { X, MessageSquare, AlertCircle } from 'lucide-react';

interface MarkDialogueModalProps {
  isOpen: boolean;
  message: string;
  title?: string;
  onClose: () => void;
}

export default function MarkDialogueModal({
  isOpen,
  message,
  title = "Mark // Station Manager",
  onClose
}: MarkDialogueModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#1d0920] border-2 border-orange-500/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(234,88,12,0.4)] flex flex-col gap-4 text-white">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-orange-500/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <MessageSquare size={16} />
            </div>
            <div>
              <h3 className="font-display font-black text-sm text-orange-400 uppercase tracking-wider">
                {title}
              </h3>
              <span className="text-[10px] font-mono text-gray-400">MARTIAN MARKETING HUB</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close dialogue"
          >
            <X size={18} />
          </button>
        </div>

        {/* NPC Avatar + Speech Bubble */}
        <div className="flex items-start gap-4 my-2">
          {/* NPC Mark Avatar Badge */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-600 to-amber-700 border-2 border-orange-400 flex items-center justify-center shrink-0 shadow-lg text-2xl font-black font-display">
            👨‍🚀
          </div>

          {/* Dialogue Message */}
          <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 shadow-inner">
            <p className="text-sm sm:text-base font-medium text-orange-100 leading-relaxed">
              &ldquo;{message}&rdquo;
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-display font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            Got It, Let Me Fix It!
          </button>
        </div>

      </div>
    </div>
  );
}
