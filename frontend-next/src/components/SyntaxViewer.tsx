"use client";

import React, { useState, useRef, useMemo } from 'react';
import { Check, Copy, Code2, Sparkles, HelpCircle } from 'lucide-react';

interface SyntaxExplanation {
  title: string;
  tagOrCommand: string;
  category: 'Structure' | 'Content' | 'Styling' | 'Action' | 'Logic' | 'Loop' | 'General';
  description: string;
  functionPurpose: string;
}

interface SyntaxViewerProps {
  code: string;
  mode?: 'html' | 'pseudocode' | 'javascript' | 'auto';
  missionId?: string;
}

// Concise, Kid-Friendly Explanations without Technical Jargon
export function getSyntaxExplanation(lineText: string, isHtml: boolean): SyntaxExplanation {
  const trimmed = lineText.trim();
  const lower = trimmed.toLowerCase();

  // =========================================================================
  // 1. HTML SYNTAX EXPLANATIONS (Beginner Friendly)
  // =========================================================================
  if (isHtml) {
    if (lower.includes('<!-- billboard') || lower.includes('<!-- billboard 1') || lower.includes('<!-- billboard 2') || lower.includes('<!-- billboard 3') || lower.includes('<!-- billboard 4') || lower.includes('<!-- billboard 5')) {
      const match = trimmed.match(/<!--\s*(Billboard\s*\d+)\s*-->/i);
      const billboardName = match ? match[1] : 'Billboard';
      return {
        title: `${billboardName} Note`,
        tagOrCommand: '<!-- Comment -->',
        category: 'Structure',
        description: 'A private note to keep your code neat and organized.',
        functionPurpose: `Labels the blocks that build ${billboardName} on Mars.`,
      };
    }

    if (lower.startsWith('<div') || lower.startsWith('</div')) {
      return {
        title: 'Container Box',
        tagOrCommand: '<div> ... </div>',
        category: 'Structure',
        description: 'A box that groups pictures and words together in one place.',
        functionPurpose: 'Holds everything for a single billboard on the Martian surface.',
      };
    }

    if (lower.startsWith('<h1') || lower.startsWith('</h1')) {
      return {
        title: 'Large Title',
        tagOrCommand: '<h1> ... </h1>',
        category: 'Content',
        description: 'A big, bold headline that catches the reader\'s eye first.',
        functionPurpose: 'Displays the main campaign title across the top of your billboard.',
      };
    }

    if (lower.startsWith('<h3') || lower.startsWith('</h3')) {
      return {
        title: 'Subtitle',
        tagOrCommand: '<h3> ... </h3>',
        category: 'Content',
        description: 'A smaller title that gives extra info right under the big headline.',
        functionPurpose: 'Shows supporting slogans, dome numbers, or open hours.',
      };
    }

    if (lower.startsWith('<p') || lower.startsWith('</p')) {
      return {
        title: 'Paragraph Text',
        tagOrCommand: '<p> ... </p>',
        category: 'Content',
        description: 'Regular readable sentences and paragraphs for information.',
        functionPurpose: 'Tells Martian colonists what they need to know.',
      };
    }

    if (lower.includes('<img')) {
      return {
        title: 'Image',
        tagOrCommand: '<img src="..." />',
        category: 'Content',
        description: 'Puts a picture on screen using its file name in the src path.',
        functionPurpose: 'Shows the advertisement picture on the billboard screen.',
      };
    }

    if (lower.includes('<b') || lower.includes('</b')) {
      return {
        title: 'Bold Text',
        tagOrCommand: '<b> ... </b>',
        category: 'Styling',
        description: 'Makes words thicker and heavier so they stand out.',
        functionPurpose: 'Puts extra focus on important keywords in your message.',
      };
    }

    if (lower.includes('<u') || lower.includes('</u')) {
      return {
        title: 'Underline',
        tagOrCommand: '<u> ... </u>',
        category: 'Styling',
        description: 'Draws a neat line straight under words.',
        functionPurpose: 'Highlights urgent alerts and safety guidelines.',
      };
    }

    if (lower.includes('<mark') || lower.includes('</mark')) {
      return {
        title: 'Highlight',
        tagOrCommand: '<mark> ... </mark>',
        category: 'Styling',
        description: 'Adds a bright glowing color behind words like a highlighter pen.',
        functionPurpose: 'Makes announcements bright and easy to spot for explorers.',
      };
    }

    if (lower.includes('<del') || lower.includes('</del')) {
      return {
        title: 'Cross Out',
        tagOrCommand: '<del> ... </del>',
        category: 'Styling',
        description: 'Draws a line through words to show they changed or sold out.',
        functionPurpose: 'Shows discount sales or updated flight board schedules.',
      };
    }

    if (lower.includes('<hr')) {
      return {
        title: 'Divider Line',
        tagOrCommand: '<hr>',
        category: 'Structure',
        description: 'Draws a line across the screen to separate different sections.',
        functionPurpose: 'Divides your headline from the text below.',
      };
    }

    if (lower.includes('<br')) {
      return {
        title: 'New Line',
        tagOrCommand: '<br>',
        category: 'Structure',
        description: 'Drops the next words down to a fresh new line.',
        functionPurpose: 'Breaks long sentences into neat multiple rows.',
      };
    }

    return {
      title: 'Text Content',
      tagOrCommand: 'Text',
      category: 'Content',
      description: 'The readable words written inside your blocks.',
      functionPurpose: 'Delivers the billboard message to colonists.',
    };
  }

  // =========================================================================
  // 2. PSEUDOCODE / JAVASCRIPT EXPLANATIONS (Beginner Friendly)
  // =========================================================================
  if (lower.includes('start') || lower.includes('when the program runs')) {
    return {
      title: 'Start',
      tagOrCommand: 'Start Trigger',
      category: 'General',
      description: 'Where your instructions begin.',
      functionPurpose: 'Starts the rover when you press Run Simulation.',
    };
  }

  if (lower.includes('end the program') || lower === 'end') {
    return {
      title: 'End',
      tagOrCommand: 'End / Stop',
      category: 'General',
      description: 'Where your instructions finish.',
      functionPurpose: 'Stops the rover once it reaches the goal.',
    };
  }

  if (lower.includes('move the rover') || lower.includes('moveforward') || lower.includes('movebackward') || lower.includes('move_forward')) {
    return {
      title: 'Move Forward',
      tagOrCommand: 'rover.move()',
      category: 'Action',
      description: 'Makes the rover take 1 step forward in the direction it faces.',
      functionPurpose: 'Drives the rover through the maze towards the beacon.',
    };
  }

  if (lower.includes('turn the rover') || lower.includes('turnleft') || lower.includes('turnright') || lower.includes('turn_left') || lower.includes('turn_right')) {
    const isLeft = lower.includes('left');
    return {
      title: `Turn ${isLeft ? 'Left' : 'Right'}`,
      tagOrCommand: isLeft ? 'rover.turnLeft()' : 'rover.turnRight()',
      category: 'Action',
      description: `Turns the rover to face to its ${isLeft ? 'left' : 'right'}.`,
      functionPurpose: 'Steers the rover around rocks and towards open paths.',
    };
  }

  if (lower.includes('repeat') || lower.includes('for ') || lower.includes('times:')) {
    return {
      title: 'Repeat Loop',
      tagOrCommand: 'repeat(count)',
      category: 'Loop',
      description: 'Does the same actions a set number of times.',
      functionPurpose: 'Walks straight across multiple tiles without extra blocks.',
    };
  }

  if (lower.includes('until') || lower.includes('while') || lower.includes('reaches the goal')) {
    return {
      title: 'Repeat Until Goal',
      tagOrCommand: 'while (!atGoal)',
      category: 'Loop',
      description: 'Keeps repeating actions until you reach the destination.',
      functionPurpose: 'Drives the rover until it touches the goal beacon.',
    };
  }

  if (lower.includes('if ') || lower.includes('path') || lower.includes('then:')) {
    return {
      title: 'Check Path',
      tagOrCommand: 'if (condition)',
      category: 'Logic',
      description: 'Looks ahead to see if the path is clear before taking action.',
      functionPurpose: 'Avoids crashing into boulders or walls.',
    };
  }

  return {
    title: 'Instruction',
    tagOrCommand: trimmed.slice(0, 20),
    category: 'General',
    description: 'A step in your list of commands.',
    functionPurpose: 'Guides your rover through the mission.',
  };
}

export default function SyntaxViewer({ code, mode = 'auto' }: SyntaxViewerProps) {
  const [copied, setCopied] = useState(false);
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const isHtml = mode === 'html' || (mode === 'auto' && (code.includes('<') || code.includes('</')));

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!code) return;
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTagColor = (tagName: string) => {
    const name = tagName.toLowerCase();
    if (name.startsWith('h')) return 'text-orange-400';
    if (name === 'p') return 'text-sky-400';
    if (name === 'div') return 'text-purple-400';
    if (name === 'img') return 'text-cyan-400';
    if (name === 'b') return 'text-rose-400';
    if (name === 'u') return 'text-emerald-400';
    if (name === 'mark') return 'text-yellow-400';
    if (name === 'del') return 'text-pink-400';
    if (name === 'hr' || name === 'br') return 'text-amber-300';
    return 'text-amber-400';
  };

  const lines = useMemo(() => {
    if (!code) return [];
    return code.split('\n').filter((l, idx, arr) => !(idx === arr.length - 1 && l.trim() === ''));
  }, [code]);

  const hasContent = lines.length > 0 && code.trim() !== '';

  // Calculate Partner Pairs (e.g. matching <div> and </div> across lines, Start/End, Repeat/End Repeat)
  const partnerMap = useMemo(() => {
    const map: Record<number, number[]> = {};

    const linkPair = (idxA: number, idxB: number) => {
      if (idxA === idxB || idxA < 0 || idxB < 0) return;
      if (!map[idxA]) map[idxA] = [];
      if (!map[idxB]) map[idxB] = [];
      if (!map[idxA].includes(idxB)) map[idxA].push(idxB);
      if (!map[idxB].includes(idxA)) map[idxB].push(idxA);
    };

    if (isHtml) {
      const stack: { tag: string; lineIndex: number }[] = [];

      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        // Comments are never partner lines - ignore completely
        if (trimmed.startsWith('<!--')) return;

        const tagMatches = Array.from(trimmed.matchAll(/<(\/?)([a-zA-Z0-9]+)(?:[\s\S]*?)(\/?)>/g));

        tagMatches.forEach((m) => {
          const isClosing = m[1] === '/';
          const tagName = m[2].toLowerCase();
          const isSelfClosing = m[3] === '/' || ['hr', 'br', 'img', 'input', 'meta'].includes(tagName);

          if (isSelfClosing) return;

          if (!isClosing) {
            stack.push({ tag: tagName, lineIndex: idx });
          } else {
            for (let sIdx = stack.length - 1; sIdx >= 0; sIdx--) {
              if (stack[sIdx].tag === tagName) {
                const matched = stack.splice(sIdx, 1)[0];
                const openIdx = matched.lineIndex;
                const closeIdx = idx;

                linkPair(openIdx, closeIdx);
                break;
              }
            }
          }
        });
      });
    } else {
      // Pseudocode & JavaScript loop/block pairing (Repeat / End Repeat, Start / End, { / })
      const loopStack: number[] = [];
      const braceStack: number[] = [];
      let startIdx: number | null = null;
      let endIdx: number | null = null;

      lines.forEach((line, idx) => {
        const trimmed = line.trim().toLowerCase();

        if (trimmed.startsWith('when the program runs') || trimmed.startsWith('start')) {
          startIdx = idx;
        } else if (trimmed.startsWith('end the program') || trimmed === 'end') {
          endIdx = idx;
        }

        if (trimmed.startsWith('repeat') || trimmed.startsWith('while') || trimmed.startsWith('for') || trimmed.startsWith('if')) {
          loopStack.push(idx);
        } else if (
          trimmed.startsWith('end repeat') ||
          trimmed.startsWith('end loop') ||
          trimmed.startsWith('end if') ||
          trimmed === 'end'
        ) {
          if (loopStack.length > 0) {
            const openIdx = loopStack.pop()!;
            linkPair(openIdx, idx);
          }
        }

        if (trimmed.includes('{')) braceStack.push(idx);
        if (trimmed.includes('}') && braceStack.length > 0) {
          const openIdx = braceStack.pop()!;
          linkPair(openIdx, idx);
        }
      });

      if (startIdx !== null && endIdx !== null) {
        linkPair(startIdx, endIdx);
      }
    }

    return map;
  }, [lines, isHtml]);

  // Active line for inspector: Hover takes precedence, otherwise Selected/Clicked line
  const activeLineIndex = hoveredLineIndex !== null ? hoveredLineIndex : selectedLineIndex;

  const activeExplanation = activeLineIndex !== null && lines[activeLineIndex]
    ? getSyntaxExplanation(lines[activeLineIndex], isHtml)
    : null;

  // Click on a line selects or deselects it
  const handleLineClick = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    if (selectedLineIndex === idx) {
      setSelectedLineIndex(null);
    } else {
      setSelectedLineIndex(idx);
    }
  };

  // Click on blank / empty background deselects the line
  const handleBlankAreaClick = () => {
    if (selectedLineIndex !== null) {
      setSelectedLineIndex(null);
    }
  };

  const renderHtmlLineTokens = (line: string) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('<!--') && trimmed.endsWith('-->')) {
      return <span className="text-gray-400 italic font-mono">{trimmed}</span>;
    }

    const tokens = trimmed.split(/(<\/?[\w-]+(?:(?:\s+[\w-]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?)*\s*\/?)?>)/g);

    return tokens.map((token, tIdx) => {
      if (!token) return null;

      const tagMatch = token.match(/^<(\/?)([\w-]+)([\s\S]*?)(\/?)>$/);
      if (tagMatch) {
        const isClosing = tagMatch[1] === '/';
        const tagName = tagMatch[2];
        const attributesStr = tagMatch[3];
        const isSelfClosing = tagMatch[4] === '/';
        const colorClass = getTagColor(tagName);

        return (
          <span key={tIdx} className="font-bold">
            <span className={colorClass}>
              &lt;{isClosing ? '/' : ''}{tagName}
            </span>
            {attributesStr && (
              <span className="text-purple-300 font-normal">
                {attributesStr.split(/(\s*[\w-]+="[^"]*")/g).map((attr, aIdx) => {
                  if (attr.includes('=')) {
                    const [k, v] = attr.split(/=(.+)/);
                    return (
                      <span key={aIdx}>
                        <span className="text-sky-300">{k}</span>=
                        <span className="text-amber-300">{v}</span>
                      </span>
                    );
                  }
                  return attr;
                })}
              </span>
            )}
            <span className={colorClass}>
              {isSelfClosing ? ' /' : ''}&gt;
            </span>
          </span>
        );
      }

      return (
        <span key={tIdx} className="text-gray-100 font-medium">
          {token}
        </span>
      );
    });
  };

  const renderPseudocodeLineTokens = (line: string) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('Start') || trimmed.startsWith('When the program')) {
      return <span className="text-emerald-400 font-bold">{trimmed}</span>;
    }
    if (trimmed.startsWith('End') || trimmed === 'End') {
      return <span className="text-rose-400 font-bold">{trimmed}</span>;
    }
    if (trimmed.startsWith('Move the rover')) {
      return (
        <span>
          <span className="text-sky-300 font-semibold">Move the rover </span>
          <span className="text-amber-300 font-bold">{trimmed.replace('Move the rover ', '').replace(' 1 space.', '')} </span>
          <span className="text-emerald-300 font-medium">1 space.</span>
        </span>
      );
    }
    if (trimmed.startsWith('Turn the rover')) {
      return (
        <span>
          <span className="text-sky-300 font-semibold">Turn the rover to the </span>
          <span className="text-amber-300 font-bold">{trimmed.replace('Turn the rover to the ', '').replace('.', '')}</span>
          <span className="text-gray-400">.</span>
        </span>
      );
    }
    if (trimmed.startsWith('Repeat') || trimmed.startsWith('while') || trimmed.startsWith('for')) {
      return <span className="text-purple-300 font-bold">{trimmed}</span>;
    }
    if (trimmed.startsWith('If')) {
      return <span className="text-orange-400 font-bold">{trimmed}</span>;
    }

    return <span className="text-gray-200">{trimmed}</span>;
  };

  return (
    <div
      ref={containerRef}
      onClick={handleBlankAreaClick}
      className="w-full h-full flex flex-col bg-[#0e031a] p-4 sm:p-5 overflow-hidden select-none"
    >
      {/* Top Header */}
      <div
        onClick={handleBlankAreaClick}
        className="flex items-center justify-between border-b border-white/10 pb-3 mb-3 shrink-0"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff912d] shadow-[0_0_8px_#ff912d]" />
          <h3 className="text-sm sm:text-base font-display font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Code2 size={17} className="text-[#ff912d]" />
            What does this code do?
          </h3>
        </div>

        <button
          onClick={handleCopy}
          disabled={!hasContent}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono text-gray-300 hover:text-white transition-all cursor-pointer active:scale-95"
          title="Copy Code"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      {/* Main Container: Code Lines Area + Dynamic Inspector Card */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Code Canvas (clicking blank space deselects) */}
        <div
          onClick={handleBlankAreaClick}
          className="flex-1 min-h-[80px] bg-black/60 border border-white/10 rounded-xl p-3 sm:p-4 overflow-auto font-mono text-xs sm:text-sm leading-relaxed custom-syntax-scroll cursor-default"
        >
          {hasContent ? (
            <div className="space-y-0.5">
              {lines.map((line, idx) => {
                const indentMatch = line.match(/^(\s*)/);
                const leadingSpaces = indentMatch ? indentMatch[1].length : 0;
                const isSelectedDirect = selectedLineIndex === idx;
                const isSelectedPartner = selectedLineIndex !== null && (partnerMap[selectedLineIndex] || []).includes(idx);
                const isHoveredDirect = hoveredLineIndex === idx;
                const isHoveredPartner = hoveredLineIndex !== null && (partnerMap[hoveredLineIndex] || []).includes(idx);

                const isSelectedGroup = isSelectedDirect || isSelectedPartner;
                const isHoveredGroup = !selectedLineIndex && (isHoveredDirect || isHoveredPartner);

                return (
                  <div
                    key={idx}
                    onClick={(e) => handleLineClick(e, idx)}
                    onMouseEnter={() => setHoveredLineIndex(idx)}
                    onMouseLeave={() => setHoveredLineIndex(null)}
                    className={`flex items-center justify-between gap-3 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                      isSelectedDirect
                        ? 'bg-[#ff912d]/30 border-l-4 border-[#ff912d] shadow-[0_0_18px_rgba(255,145,45,0.4)] ring-1 ring-[#ff912d]/80 text-white font-medium'
                        : isSelectedPartner
                        ? 'bg-[#ff912d]/20 border-l-4 border-[#ff912d] shadow-[0_0_15px_rgba(255,145,45,0.3)] ring-1 ring-[#ff912d]/60 text-white font-medium'
                        : isHoveredDirect
                        ? 'bg-purple-600/35 border-l-4 border-purple-400 shadow-[0_0_14px_rgba(168,85,247,0.4)] ring-1 ring-purple-400/60 text-white'
                        : isHoveredPartner
                        ? 'bg-purple-600/25 border-l-4 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)] ring-1 ring-purple-400/40 text-white'
                        : 'hover:bg-white/5 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Line Number & Selection Arrow Indicator */}
                      <div className="w-8 flex items-center justify-end gap-1 font-mono text-xs select-none shrink-0">
                        {isSelectedDirect ? (
                          <span className="text-[#ff912d] text-[10px] font-black animate-pulse">▶</span>
                        ) : null}
                        <span className={`${
                          isSelectedGroup ? 'text-amber-300 font-bold' : isHoveredGroup ? 'text-purple-300 font-bold' : 'text-gray-500'
                        }`}>
                          {idx + 1}
                        </span>
                      </div>

                      {/* Code Line Tokens */}
                      <div
                        style={{ paddingLeft: `${leadingSpaces * 10}px` }}
                        className="flex-1 flex items-center flex-wrap leading-relaxed font-mono text-xs sm:text-sm"
                      >
                        {isHtml ? renderHtmlLineTokens(line) : renderPseudocodeLineTokens(line)}
                      </div>
                    </div>

                    {/* Partner Line Status Badge */}
                    {isSelectedPartner ? (
                      <span className="shrink-0 text-[10px] font-mono font-bold bg-[#ff912d]/25 border border-[#ff912d]/60 text-amber-200 px-2 py-0.5 rounded shadow-sm flex items-center gap-1 animate-in fade-in duration-200">
                        <span>⟷</span>
                        <span>Partner Line</span>
                      </span>
                    ) : isHoveredPartner ? (
                      <span className="shrink-0 text-[10px] font-mono font-bold bg-purple-950/90 border border-purple-400/60 text-purple-200 px-2 py-0.5 rounded shadow-sm flex items-center gap-1 animate-in fade-in duration-200">
                        <span>⟷</span>
                        <span>Partner Line</span>
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-500 font-mono text-xs sm:text-sm">
              <Code2 size={24} className="mb-2 text-gray-600" />
              <p>Connect blocks on the canvas to inspect your live code syntax and explanations here.</p>
            </div>
          )}
        </div>

        {/* Static Section Divider */}
        <div className="h-px my-2 w-full bg-white/10" />

        {/* Description & Function Explanation Card */}
        <div className="h-[145px] shrink-0 overflow-y-auto">
          {activeExplanation ? (
            <div className="h-full bg-[#160a28]/98 border border-purple-500/40 rounded-xl p-3 sm:p-3.5 shadow-[0_4px_25px_rgba(0,0,0,0.6)] flex flex-col justify-between animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-1.5 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  <span className="font-display font-black text-sm sm:text-base text-white uppercase tracking-wider">
                    {activeExplanation.title}
                  </span>
                  <span className="font-mono text-xs bg-purple-950/90 border border-purple-400/50 text-purple-200 px-2 py-0.5 rounded font-bold">
                    {activeExplanation.tagOrCommand}
                  </span>
                </div>
                <span className="text-xs font-mono text-amber-300 font-bold bg-amber-950/70 border border-amber-500/40 px-2.5 py-0.5 rounded">
                  {activeExplanation.category}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1 min-h-0 overflow-y-auto">
                <div className="bg-black/50 border border-white/10 rounded-lg p-2.5 flex flex-col justify-start">
                  <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider block mb-1">
                    Description
                  </span>
                  <p className="text-gray-100 text-xs sm:text-sm leading-relaxed font-sans">
                    {activeExplanation.description}
                  </p>
                </div>

                <div className="bg-orange-950/40 border border-orange-500/40 rounded-lg p-2.5 flex flex-col justify-start">
                  <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-orange-400 shrink-0" />
                    Function
                  </span>
                  <p className="text-orange-100 font-medium text-xs sm:text-sm leading-relaxed font-sans">
                    {activeExplanation.functionPurpose}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-[#120722]/90 border border-white/10 rounded-xl p-3 flex items-center text-xs sm:text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <HelpCircle size={16} className="text-[#ff912d] shrink-0" />
                <span>Click or hover on any code line to inspect its Description, Function, and matching partner tags.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
