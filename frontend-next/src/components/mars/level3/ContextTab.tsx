"use client";

import React from 'react';
import { Code2, Copy, Check } from 'lucide-react';

interface ContextTabProps {
  htmlCode: string;
}

export default function ContextTab({ htmlCode }: ContextTabProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (!htmlCode) return;
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = htmlCode ? htmlCode.split('\n') : ['<!-- Build your message structure to view HTML output -->'];

  return (
    <div className="w-full h-full flex flex-col bg-[#0c051a] border-t border-purple-500/20 font-mono select-text">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#140a2b] border-b border-purple-500/20 shrink-0">
        <div className="flex items-center gap-2">
          <Code2 size={13} className="text-pink-400" />
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            Context Tab // Indented HTML Tree
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] transition-colors cursor-pointer border border-white/10"
          title="Copy HTML to Clipboard"
        >
          {copied ? (
            <>
              <Check size={11} className="text-emerald-400" />
              <span className="text-emerald-300">Copied</span>
            </>
          ) : (
            <>
              <Copy size={11} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Display */}
      <div className="flex-1 p-3 overflow-auto text-xs leading-relaxed text-slate-200">
        {lines.map((line, idx) => (
          <div key={idx} className="flex items-start gap-3 hover:bg-white/5 px-1 rounded">
            <span className="text-slate-600 select-none text-[10px] w-5 text-right shrink-0 pt-0.5">
              {idx + 1}
            </span>
            <pre className="font-mono text-xs text-purple-200 whitespace-pre">
              {line}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
