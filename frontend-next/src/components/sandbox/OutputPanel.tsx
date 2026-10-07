import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface OutputPanelProps {
  mode: 'web' | 'js' | 'python';
  srcDoc?: string;
  consoleLogs: { type: string; content: string }[];
  iframeRef?: React.RefObject<HTMLIFrameElement | null>;
  onIframeLoad?: () => void;
  inputRequest?: { prompt: string } | null;
  onSubmitInput?: (value: string) => void;
}

function getUtf8Bytes(str: string): number {
  return new TextEncoder().encode(str).length;
}

function truncateToUtf8Bytes(str: string, maxBytes: number): string {
  const encoder = new TextEncoder();
  if (encoder.encode(str).length <= maxBytes) return str;
  const chars = Array.from(str);
  let result = '';
  for (const ch of chars) {
    if (encoder.encode(result + ch).length <= maxBytes) {
      result += ch;
    } else {
      break;
    }
  }
  return result;
}

export default function OutputPanel({ mode, srcDoc, consoleLogs, iframeRef, onIframeLoad, inputRequest, onSubmitInput }: OutputPanelProps) {
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [limitReached, setLimitReached] = useState(false);
  const hasError = consoleLogs.some(log => log.type === 'error');

  useEffect(() => {
    if (hasError) setIsConsoleOpen(true);
  }, [hasError]);

  useEffect(() => {
    setInputValue('');
    setLimitReached(false);
  }, [inputRequest]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const truncated = truncateToUtf8Bytes(raw, 1024);
    const isLimit = getUtf8Bytes(truncated) >= 1024;
    setInputValue(truncated);
    setLimitReached(isLimit);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSubmitInput?.(inputValue);
      setInputValue('');
      setLimitReached(false);
    }
  };

  const renderConsoleLogs = () => (
    <div className="flex-1 overflow-auto p-4 space-y-1 font-mono text-sm bg-[#150524]">
      {consoleLogs.map((log, i) => {
        let color = "text-gray-300";
        if (log.type === "error") color = "text-red-400";
        if (log.type === "warn") color = "text-yellow-400";
        if (log.type === "info") color = "text-blue-400";
        if (log.type === "muted") color = "text-gray-500 italic";
        
        return (
          <div key={i} className={`whitespace-pre-wrap ${color} break-words min-h-[1.25rem]`}>
            <span className="text-gray-500 mr-2 opacity-50">&gt;</span>
            {log.content}
          </div>
        );
      })}
      {consoleLogs.length === 0 && !inputRequest && (
        <div className="text-gray-600 italic">Console is empty. Run some code!</div>
      )}
      {inputRequest && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center text-white whitespace-pre-wrap">
            <span className="text-gray-500 mr-2 opacity-50">&gt;</span>
            <span>{inputRequest.prompt}</span>
            <input 
              autoFocus
              className="bg-transparent outline-none flex-1 ml-1 text-white min-w-[60px]"
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
          </div>
          {limitReached && (
            <div className="text-xs text-amber-400 font-sans ml-5 select-none animate-fade-in">
              Input limit reached
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (mode === 'web') {
    return (
      <div className="w-full h-full bg-white flex flex-col relative overflow-hidden">
        <div className="flex-1 min-h-0">
          <iframe
            ref={iframeRef}
            srcDoc={srcDoc}
            sandbox="allow-scripts allow-modals"
            className="w-full h-full border-none"
            title="Sandbox Preview"
            onLoad={onIframeLoad}
          />
        </div>
        
        {/* Collapsible Console Panel */}
        <div className={`flex flex-col border-t border-white/20 transition-all duration-300 ${isConsoleOpen ? 'h-[250px]' : 'h-10'}`}>
          <button 
            onClick={() => setIsConsoleOpen(!isConsoleOpen)}
            className="h-10 bg-[#1a082c] px-4 flex items-center justify-between text-gray-400 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2 font-mono text-sm">
              Console
              {hasError && !isConsoleOpen && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
            </div>
            {isConsoleOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          {isConsoleOpen && renderConsoleLogs()}
        </div>
      </div>
    );
  }

  // JS Console mode
  return (
    <div className="w-full h-full bg-[#150524] flex flex-col overflow-hidden">
      <div className="bg-[#1a082c] border-b border-white/10 px-4 py-2 font-mono text-gray-400 text-sm">
        Console Output
      </div>
      {renderConsoleLogs()}
    </div>
  );
}
