"use client";

import React from "react";
import { Check, Copy } from "lucide-react";

interface PlainEnglishCodeViewerProps {
  code: string;
}

export default function PlainEnglishCodeViewer({ code }: PlainEnglishCodeViewerProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatLine = (line: string, index: number) => {
    const indentMatch = line.match(/^(\s*)/);
    const leadingSpaces = indentMatch ? indentMatch[1].length : 0;
    const trimmed = line.trim();

    if (!trimmed) {
      return <div key={index} className="h-4" />;
    }

    // Start block sentences
    if (trimmed.startsWith("Start the program") || trimmed === "Start") {
      return (
        <div key={index} style={{ paddingLeft: `${leadingSpaces * 10}px` }} className="flex items-center gap-2 text-emerald-400 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span>{trimmed}</span>
        </div>
      );
    }

    // End block sentences
    if (trimmed.startsWith("End the program") || trimmed === "End") {
      return (
        <div key={index} style={{ paddingLeft: `${leadingSpaces * 10}px` }} className="flex items-center gap-2 text-rose-400 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
          <span>{trimmed}</span>
        </div>
      );
    }

    // When the program runs
    if (trimmed.startsWith("When the program runs")) {
      return (
        <div key={index} style={{ paddingLeft: `${leadingSpaces * 10}px` }} className="text-amber-400 font-bold">
          {trimmed}
        </div>
      );
    }

    // Rover Movement Sentences: "Move the rover [direction] 1 space."
    if (trimmed.startsWith("Move the rover")) {
      const parts = trimmed.split(/(\bMove the rover\b|\bforward\b|\bbackward\b|\bup\b|\bdown\b|\bleft\b|\bright\b|\b1 space\b|\.)/g);
      return (
        <div key={index} style={{ paddingLeft: `${leadingSpaces * 10}px` }} className="flex items-center flex-wrap">
          {parts.map((p, pIdx) => {
            if (p === "Move the rover") {
              return <span key={pIdx} className="text-sky-300 font-semibold">{p} </span>;
            }
            if (["forward", "backward", "up", "down", "left", "right"].includes(p)) {
              return <span key={pIdx} className="text-amber-300 font-bold">{p} </span>;
            }
            if (p === "1 space") {
              return <span key={pIdx} className="text-emerald-300 font-medium">{p}</span>;
            }
            if (p === ".") {
              return <span key={pIdx} className="text-gray-400">{p}</span>;
            }
            return <span key={pIdx} className="text-gray-200">{p}</span>;
          })}
        </div>
      );
    }

    // Rover Turning Sentences: "Turn the rover to the [left/right]."
    if (trimmed.startsWith("Turn the rover")) {
      const parts = trimmed.split(/(\bTurn the rover to the\b|\bleft\b|\bright\b|\.)/g);
      return (
        <div key={index} style={{ paddingLeft: `${leadingSpaces * 10}px` }} className="flex items-center flex-wrap">
          {parts.map((p, pIdx) => {
            if (p === "Turn the rover to the") {
              return <span key={pIdx} className="text-sky-300 font-semibold">{p} </span>;
            }
            if (p === "left" || p === "right") {
              return <span key={pIdx} className="text-amber-300 font-bold">{p}</span>;
            }
            if (p === ".") {
              return <span key={pIdx} className="text-gray-400">{p}</span>;
            }
            return <span key={pIdx} className="text-gray-200">{p}</span>;
          })}
        </div>
      );
    }

    // Backward compatibility for "Action: Move ..."
    if (trimmed.startsWith("Action:")) {
      const actionContent = trimmed.substring(7).trim();
      return (
        <div key={index} style={{ paddingLeft: `${leadingSpaces * 10}px` }} className="flex items-center">
          <span className="text-gray-400 font-bold mr-2">Action:</span>
          <span className="text-blue-300 font-semibold">{actionContent}</span>
        </div>
      );
    }

    // Repeat sentences & loops
    if (trimmed.startsWith("Repeat")) {
      const parts = trimmed.split(/(\bRepeat the following actions\b|\bRepeat\b|\btimes:\b|\buntil the rover reaches the\b|\buntil\b|\bcontinuously:\b|\b\d+\b|\bGoal\b|\bClear\b|\bBlocked\b|\band\b|\bor\b)/g);
      return (
        <div key={index} style={{ paddingLeft: `${leadingSpaces * 10}px` }}>
          {parts.map((p, pIdx) => {
            if (p === "Repeat the following actions" || p === "Repeat" || p === "until" || p === "times:" || p === "until the rover reaches the" || p === "continuously:") {
              return <span key={pIdx} className="text-purple-300 font-bold">{p} </span>;
            }
            if (/^\d+$/.test(p)) {
              return <span key={pIdx} className="text-emerald-400 font-black">{p} </span>;
            }
            if (p === "Goal" || p === "Clear" || p === "Blocked") {
              return <span key={pIdx} className="text-amber-300 font-bold">{p} </span>;
            }
            if (p === "and" || p === "or") {
              return <span key={pIdx} className="text-sky-300 font-bold">{p} </span>;
            }
            return <span key={pIdx} className="text-gray-200">{p}</span>;
          })}
        </div>
      );
    }

    // Conditional sentences: "If the path ahead is ..."
    if (trimmed.startsWith("If")) {
      const parts = trimmed.split(/(\bIf the path ahead is\b|\bIf the path to the left is\b|\bIf the path to the right is\b|\bIf\b|\bthe\s+path\s+is\b|\bthen:\b|\bGoal\b|\bClear\b|\bBlocked\b|\band\b|\bor\b)/g);
      return (
        <div key={index} style={{ paddingLeft: `${leadingSpaces * 10}px` }}>
          {parts.map((p, pIdx) => {
            if (p.startsWith("If") || p === "then:") {
              return <span key={pIdx} className="text-orange-400 font-bold">{p} </span>;
            }
            if (p.includes("path")) {
              return <span key={pIdx} className="text-sky-200 font-medium">{p} </span>;
            }
            if (p === "Goal" || p === "Clear" || p === "Blocked") {
              return <span key={pIdx} className="text-amber-300 font-bold">{p} </span>;
            }
            if (p === "and" || p === "or") {
              return <span key={pIdx} className="text-sky-300 font-bold">{p} </span>;
            }
            return <span key={pIdx} className="text-gray-200">{p}</span>;
          })}
        </div>
      );
    }

    return (
      <div key={index} style={{ paddingLeft: `${leadingSpaces * 10}px` }} className="text-gray-200">
        {trimmed}
      </div>
    );
  };

  const lines = code ? code.split("\n") : [];

  return (
    <div className="w-full h-full flex flex-col bg-[#0e031a] p-5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3 shrink-0">
        <h3 className="text-sm sm:text-base font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#ff912d] shadow-[0_0_8px_#ff912d]" />
          What Does This Code Mean?
        </h3>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono text-gray-300 hover:text-white transition-all cursor-pointer active:scale-95"
          title="Copy Explanation"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      {/* Code / Translation Content */}
      <div className="flex-1 bg-black/60 border border-white/10 rounded-xl p-4 overflow-auto font-mono text-sm sm:text-base leading-relaxed custom-syntax-scroll">
        {lines.length > 0 && code.trim() !== "" ? (
          <div className="space-y-1">{lines.map((l, i) => formatLine(l, i))}</div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-500 font-mono text-xs sm:text-sm">
            <p>Connect blocks on the canvas to see what your code instructions mean in plain English.</p>
          </div>
        )}
      </div>
    </div>
  );
}
