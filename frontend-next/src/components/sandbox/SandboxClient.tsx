"use client";

import React, { useState, useEffect, useRef } from 'react';
import LanguageSelect from './LanguageSelect';
import CodeEditor from './CodeEditor';
import OutputPanel from './OutputPanel';
import { LANGUAGES, LanguageConfig } from '@/lib/sandbox/languages';
import { generateWebRunnerSrc } from '@/lib/sandbox/runners/webRunner';
import { generateJsWorkerUrl } from '@/lib/sandbox/runners/jsRunner';
import { generatePythonWorkerUrl } from '@/lib/sandbox/runners/pythonRunner';
import { Play, RotateCcw, ChevronUp, ChevronDown, Square, FileCode, X } from 'lucide-react';
import * as acorn from 'acorn';
import { ProjectBlueprint, CheckResult } from '@/lib/sandbox/projects/types';
import { runWebChecks } from '@/lib/sandbox/projects/webChecker';
import CoachPanel from './CoachPanel';
import ProjectPicker, { ProjectProgress } from './ProjectPicker';
import { projects } from '@/lib/sandbox/projects';
import MusicToggleButton from '@/components/MusicToggleButton';

export type ProjectState = {
  files: Record<string, string>;
  currentStepIndex: number;
  unlockedSteps: number;
  hintTiers: Record<number, number>;
  checkResults: CheckResult[] | null;
  score: number | null;
};

export default function SandboxClient() {
  const [selectedLang, setSelectedLang] = useState<LanguageConfig>(LANGUAGES[0]);
  const [freeSelectedLang, setFreeSelectedLang] = useState<LanguageConfig>(LANGUAGES[0]);
  
  // Store code per language/file
  const [filesState, setFilesState] = useState<Record<string, Record<string, string>>>({});
  
  const [projectsState, setProjectsState] = useState<Record<string, ProjectState>>({});
  
  const [sandboxMode, setSandboxMode] = useState<'free' | 'guided'>('free');
  const [activeProject, setActiveProject] = useState<ProjectBlueprint | null>(null);
  const [checking, setChecking] = useState(false);
  const [showModeSwitchConfirm, setShowModeSwitchConfirm] = useState(false);
  const [pendingMode, setPendingMode] = useState<'free' | 'guided' | null>(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  
  const [srcDoc, setSrcDoc] = useState<string>('');
  const [consoleLogs, setConsoleLogs] = useState<{type: string, content: string}[]>([]);
  const [status, setStatus] = useState<'Ready' | 'Loading Python...' | 'Running' | 'Done' | 'Error' | 'Waiting for input' | 'Stopped'>('Ready');
  const [diagnostic, setDiagnostic] = useState<{ fileName: string, line: number, message: string } | null>(null);
  
  const [inputRequest, setInputRequest] = useState<{ prompt: string } | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  
  const [inputText, setInputText] = useState('');
  const [isInputOpen, setIsInputOpen] = useState(false);
  
  const currentRunIdRef = useRef<number>(0);
  const runTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const pythonWorkerRef = useRef<Worker | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const sabRef = useRef<SharedArrayBuffer | null>(null);

  const cleanupWorker = (includePython = false) => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    if (includePython && pythonWorkerRef.current) {
      pythonWorkerRef.current.terminate();
      pythonWorkerRef.current = null;
    }
    setInputRequest(null);
    sabRef.current = null;
  };

  useEffect(() => {
    // Initialize defaults if not present
    setFilesState(prev => {
      const next = { ...prev };
      LANGUAGES.forEach(lang => {
        if (!next[lang.id]) {
          next[lang.id] = {};
          lang.files.forEach(f => {
            next[lang.id][f.name] = f.defaultCode;
          });
        }
      });
      return next;
    });
  }, []);

  const handleSelectProject = (project: ProjectBlueprint) => {
    setActiveProject(project);
    setProjectsState(prev => {
      if (!prev[project.id]) {
        return {
          ...prev,
          [project.id]: {
            files: { ...project.files },
            currentStepIndex: 0,
            unlockedSteps: 0,
            hintTiers: {},
            checkResults: null,
            score: null
          }
        };
      }
      return prev;
    });

    const lang = LANGUAGES.find(l => l.id === project.track);
    if (lang) {
      setSelectedLang(lang);
      setActiveFileIndex(0);
    }
  };

  const handleModeSwitchRequest = (mode: 'free' | 'guided') => {
    if (mode === sandboxMode) return;
    
    if (mode === 'guided') {
      handleStop();
      setConsoleLogs([]);
      setDiagnostic(null);
      setActiveProject(null);
      setSandboxMode('guided');
    } else {
      if (sandboxMode === 'guided' && activeProject) {
        setPendingMode(mode);
        setShowModeSwitchConfirm(true);
      } else {
        setSandboxMode(mode);
        setSelectedLang(freeSelectedLang);
      }
    }
  };

  const confirmModeSwitch = () => {
    if (pendingMode === 'free') {
      setSelectedLang(freeSelectedLang);
    }
    setSandboxMode(pendingMode || 'free');
    setPendingMode(null);
    setShowModeSwitchConfirm(false);
    setActiveProject(null);
  };

  const handleInsertStarter = (fileName: string, code: string) => {
    if (!activeProject) return;
    setProjectsState(prev => {
      const proj = prev[activeProject.id];
      if (!proj) return prev;
      return {
        ...prev,
        [activeProject.id]: {
          ...proj,
          files: {
            ...proj.files,
            [fileName]: (proj.files[fileName] || '') + '\n' + code
          }
        }
      };
    });
  };

  const handleCheckWork = async () => {
    if (!activeProject || !iframeRef.current) return;
    setChecking(true);
    
    const projState = projectsState[activeProject.id];
    if (!projState) {
      setChecking(false);
      return;
    }
    
    setProjectsState(prev => ({ ...prev, [activeProject.id]: { ...prev[activeProject.id], checkResults: null } }));
    const files = projState.files as any;
    
    const isFinalStep = projState.currentStepIndex === activeProject.steps.length - 1;
    const checksToRun = isFinalStep 
      ? activeProject.steps.flatMap(s => s.checks) 
      : activeProject.steps[projState.currentStepIndex].checks;

    const res = await runWebChecks(files, checksToRun, iframeRef);
    
    setProjectsState(prev => {
      const p = prev[activeProject.id];
      const nextP = { ...p };
      
      if (!Array.isArray(res)) {
        nextP.checkResults = [{ id: 'error', pass: false, message: res.message }];
        if (res.line) {
          setDiagnostic({ fileName: 'script.js', line: res.line, message: res.message });
        }
      } else {
        nextP.checkResults = res;
        if (isFinalStep) {
          const corePass = activeProject.rubric.core.every(id => res.find(r => r.id === id)?.pass);
          if (corePass) {
            const stretchPassCount = activeProject.rubric.stretch.filter(id => res.find(r => r.id === id)?.pass).length;
            nextP.score = 70 + Math.round((30 * stretchPassCount) / activeProject.rubric.stretch.length);
          }
        } else {
          const stepCoreChecks = activeProject.steps[p.currentStepIndex].checks.filter(c => c.isCore);
          const allCorePassed = stepCoreChecks.length === 0 || stepCoreChecks.every(c => res.find(r => r.id === c.id)?.pass);
          if (allCorePassed) {
            nextP.unlockedSteps = Math.max(p.unlockedSteps, p.currentStepIndex + 1);
          }
        }
      }
      
      return { ...prev, [activeProject.id]: nextP };
    });
    
    setChecking(false);
  };

  useEffect(() => {
    // Listen for console logs from iframe (web mode)
    const handleMessage = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return;
      
      if (e.data?.source === 'sandbox') {
        setConsoleLogs(prev => {
          if (prev.length >= 500) {
            if (prev.length > 0 && prev[prev.length - 1].content === 'Output truncated') return prev;
            return [...prev, { type: 'warn', content: 'Output truncated' }];
          }
          const text = e.data.content !== undefined ? e.data.content : e.data.message;
          if (typeof text !== 'string') return prev;
          return [...prev, { type: e.data.type, content: text }];
        });
        
        if (e.data.type === 'error') {
          setStatus('Error');
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleLanguageChange = (id: string) => {
    const lang = LANGUAGES.find(l => l.id === id);
    if (lang) {
      setSelectedLang(lang);
      if (sandboxMode === 'free') {
        setFreeSelectedLang(lang);
      }
      setActiveFileIndex(0);
      setConsoleLogs([]);
      setDiagnostic(null);
      setSrcDoc('');
      setStatus('Ready');
      cleanupWorker(true);
      if (runTimeoutRef.current) clearTimeout(runTimeoutRef.current);
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    }
  };

  const handleCodeChange = (val: string) => {
    const activeFileName = selectedLang.files[activeFileIndex].name;
    if (sandboxMode === 'guided' && activeProject) {
      setProjectsState(prev => {
        const proj = prev[activeProject.id];
        if (!proj) return prev;
        return {
          ...prev,
          [activeProject.id]: {
            ...proj,
            files: {
              ...proj.files,
              [activeFileName]: val
            }
          }
        };
      });
    } else {
      setFilesState(prev => ({
        ...prev,
        [selectedLang.id]: {
          ...prev[selectedLang.id],
          [activeFileName]: val
        }
      }));
    }
    setDiagnostic(null);
    setStatus('Ready');
  };

  const handleStop = () => {
    currentRunIdRef.current++;
    if (runTimeoutRef.current) {
      clearTimeout(runTimeoutRef.current);
      runTimeoutRef.current = null;
    }
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }

    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    if (pythonWorkerRef.current) {
      pythonWorkerRef.current.terminate();
      pythonWorkerRef.current = null;
    }

    setInputRequest(null);
    sabRef.current = null;

    if (selectedLang.mode === 'web') {
      setSrcDoc('about:blank');
    }

    setStatus('Stopped');
  };

  const handleReset = () => {
    handleStop();
    setConsoleLogs([]);
    setDiagnostic(null);
    setStatus('Ready');
  };

  const handleConfirmRestore = () => {
    setShowRestoreModal(false);
    handleStop();
    if (sandboxMode === 'guided' && activeProject) {
      // not used in guided anymore, but kept for safety
      setProjectsState(prev => ({
        ...prev,
        [activeProject.id]: {
          ...prev[activeProject.id],
          files: { ...activeProject.files }
        }
      }));
    } else {
      setFilesState(prev => {
        const next = { ...prev };
        next[selectedLang.id] = {};
        selectedLang.files.forEach(f => {
          next[selectedLang.id][f.name] = f.defaultCode;
        });
        return next;
      });
    }
    setConsoleLogs([]);
    setDiagnostic(null);
    setStatus('Ready');
  };

  const handleExitProject = () => {
    handleStop();
    setConsoleLogs([]);
    setDiagnostic(null);
    setActiveProject(null);
  };

  const handleRestartProject = () => {
    if (!activeProject) return;
    handleStop();
    setConsoleLogs([]);
    setDiagnostic(null);
    setProjectsState(prev => ({
      ...prev,
      [activeProject.id]: {
        files: { ...activeProject.files },
        currentStepIndex: 0,
        unlockedSteps: 0,
        hintTiers: {},
        checkResults: null,
        score: null
      }
    }));
  };

  const handleRun = () => {
    const isPythonRunningOrWaiting = selectedLang.mode === 'python' && (status === 'Running' || status === 'Waiting for input');
    
    if (runTimeoutRef.current) {
      clearTimeout(runTimeoutRef.current);
      runTimeoutRef.current = null;
    }
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }

    // Terminate old workers if running/waiting or for JS worker
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    if (isPythonRunningOrWaiting && pythonWorkerRef.current) {
      pythonWorkerRef.current.terminate();
      pythonWorkerRef.current = null;
    }

    setInputRequest(null);
    sabRef.current = null;

    const runId = ++currentRunIdRef.current;

    setConsoleLogs([]);
    setDiagnostic(null);
    
    const files = sandboxMode === 'guided' && activeProject 
      ? (projectsState[activeProject.id]?.files || {})
      : (filesState[selectedLang.id] || {});
    
    let jsCodeToParse = '';
    let jsFileName = '';
    
    if (selectedLang.mode === 'web') {
      jsCodeToParse = files['script.js'] || '';
      jsFileName = 'script.js';
    } else if (selectedLang.mode === 'js') {
      jsCodeToParse = files['main.js'] || '';
      jsFileName = 'main.js';
    }
    
    if (jsCodeToParse) {
      try {
        acorn.parse(jsCodeToParse, { ecmaVersion: "latest", locations: true, sourceType: "script" });
      } catch (e: any) {
        setStatus('Error');
        const line = e.loc?.line;
        const msg = e.message.replace(/\s*\(\d+:\d+\)$/, '');
        const errorText = `SyntaxError: ${msg}${line ? ` (line ${line})` : ''}`;
        
        setConsoleLogs([
          { type: 'error', content: errorText },
          { type: 'muted', content: `Check the spelling and capitalization near line ${line}, and look for missing brackets or quotes.` }
        ]);
        
        if (line) {
          setDiagnostic({ fileName: jsFileName, line, message: errorText });
        }
        return;
      }
    }
    
    if (selectedLang.mode === 'web') {
      setStatus('Running');
      const html = files['index.html'] || '';
      const css = files['style.css'] || '';
      const js = files['script.js'] || '';
      
      const doc = generateWebRunnerSrc(html, css, js);
      setSrcDoc(doc);
      
    } else if (selectedLang.mode === 'js') {
      setStatus('Running');
      const js = files['main.js'] || '';
      const workerUrl = generateJsWorkerUrl(js, runId);
      
      const worker = new Worker(workerUrl);
      workerRef.current = worker;
      
      worker.onmessage = (e) => {
        const data = e.data;
        if (data?.source === 'sandbox') {
          if (data.runId && data.runId !== currentRunIdRef.current) return;

          if (data.type === 'done') {
            if (runTimeoutRef.current) clearTimeout(runTimeoutRef.current);
            setStatus(prev => prev === 'Error' ? 'Error' : 'Done');
          } else {
            const text = data.content !== undefined ? data.content : data.message;
            if (typeof text === 'string') {
              setConsoleLogs(prev => {
                if (prev.length >= 500) {
                  if (prev.length > 0 && prev[prev.length - 1].content === 'Output truncated') return prev;
                  return [...prev, { type: 'warn', content: 'Output truncated' }];
                }
                return [...prev, { type: data.type, content: text }];
              });
            }
            if (data.type === 'error') setStatus('Error');
          }
        }
      };
      
      worker.onerror = (err) => {
        if (runTimeoutRef.current) clearTimeout(runTimeoutRef.current);
        setStatus('Error');
        setConsoleLogs(prev => [...prev, { type: 'error', content: err.message }]);
      };
      
      runTimeoutRef.current = setTimeout(() => {
        if (currentRunIdRef.current !== runId) return;
        cleanupWorker();
        setStatus('Error');
        setConsoleLogs(prev => [...prev, { type: 'error', content: 'Your code took too long.' }]);
      }, 5000);

    } else if (selectedLang.mode === 'python') {
      const pyCode = files['main.py'] || '';
      const mustReloadPyodide = !pythonWorkerRef.current;
      
      if (mustReloadPyodide) {
        setStatus('Loading Python...');
        setConsoleLogs([{ type: 'info', content: 'Loading Python...' }]);

        const url = generatePythonWorkerUrl();
        const worker = new Worker(url, { type: 'module' });
        pythonWorkerRef.current = worker;

        loadTimeoutRef.current = setTimeout(() => {
          if (currentRunIdRef.current !== runId) return;
          worker.terminate();
          pythonWorkerRef.current = null;
          setStatus('Error');
          setConsoleLogs(prev => [
            ...prev.filter(l => l.content !== 'Loading Python...'),
            { type: 'error', content: 'Python is taking too long to load. Check your connection and try again.' }
          ]);
        }, 30000);

        worker.postMessage({
          type: 'load',
          base: window.location.origin + '/pyodide/'
        });
      } else {
        setStatus('Running');
      }
      
      const worker = pythonWorkerRef.current;
      if (!worker) return;
      
      worker.onmessage = (e) => {
        const data = e.data;
        if (data?.source === 'sandbox') {
          if (data.type === 'loaded') {
            // Pyodide finished loading inside worker
            return;
          }

          if (data.runId && data.runId !== currentRunIdRef.current) return;

          if (data.type === 'start') {
            if (loadTimeoutRef.current) {
              clearTimeout(loadTimeoutRef.current);
              loadTimeoutRef.current = null;
            }
            setStatus('Running');
            setConsoleLogs(prev => prev.filter(l => l.content !== 'Loading Python...'));
            
            if (runTimeoutRef.current) clearTimeout(runTimeoutRef.current);
            runTimeoutRef.current = setTimeout(() => {
              if (currentRunIdRef.current !== runId) return;
              worker.terminate();
              pythonWorkerRef.current = null;
              setStatus('Error');
              setConsoleLogs(prev => [...prev, { type: 'error', content: 'Your code took too long.' }]);
            }, 5000);
          } else if (data.type === 'inputRequest') {
            if (runTimeoutRef.current) clearTimeout(runTimeoutRef.current);
            setInputRequest({ prompt: data.prompt });
            setStatus('Waiting for input');
            
            runTimeoutRef.current = setTimeout(() => {
              if (currentRunIdRef.current !== runId) return;
              worker.terminate();
              pythonWorkerRef.current = null;
              setStatus('Error');
              setConsoleLogs(prev => [...prev, { type: 'error', content: 'Input timed out.' }]);
              setInputRequest(null);
            }, 120000);
          } else if (data.type === 'done') {
            if (runTimeoutRef.current) clearTimeout(runTimeoutRef.current);
            setStatus(prev => prev === 'Error' ? 'Error' : 'Done');
          } else {
            const text = data.content !== undefined ? data.content : data.message;
            if (typeof text === 'string') {
              setConsoleLogs(prev => {
                if (prev.length >= 500) {
                  if (prev.length > 0 && prev[prev.length - 1].content === 'Output truncated') return prev;
                  return [...prev, { type: 'warn', content: 'Output truncated' }];
                }
                return [...prev, { type: data.type, content: text }];
              });
            }
            if (data.type === 'error') setStatus('Error');
          }
        }
      };
      
      worker.onerror = (err) => {
        if (runTimeoutRef.current) clearTimeout(runTimeoutRef.current);
        if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
        setStatus('Error');
        console.error("Worker error:", err);
        setConsoleLogs(prev => [
          ...prev.filter(l => l.content !== 'Loading Python...'),
          { type: 'error', content: 'Could not load Python. Check your connection and try again.' }
        ]);
      };
      
      let sab = null;
      if (typeof SharedArrayBuffer !== 'undefined' && typeof crossOriginIsolated !== 'undefined' && crossOriginIsolated) {
        sab = new SharedArrayBuffer(1024 + 8);
        sabRef.current = sab;
      } else {
        sabRef.current = null;
      }
      
      worker.postMessage({ type: 'run', runId, code: pyCode, input: inputText, sab });
    }
  };
  
  const handleInputSubmit = (val: string) => {
    if (sabRef.current) {
      const int32 = new Int32Array(sabRef.current);
      const uint8 = new Uint8Array(sabRef.current, 8);
      const encoded = new TextEncoder().encode(val);
      const len = Math.min(encoded.length, 1024);
      uint8.set(encoded.slice(0, len));
      int32[1] = len;
      
      setConsoleLogs(prev => [...prev, { type: 'log', content: (inputRequest?.prompt || '') + val }]);
      setInputRequest(null);
      setStatus('Running');
      
      Atomics.store(int32, 0, 1);
      Atomics.notify(int32, 0, 1);
      
      const runId = currentRunIdRef.current;
      if (runTimeoutRef.current) clearTimeout(runTimeoutRef.current);
      runTimeoutRef.current = setTimeout(() => {
        if (currentRunIdRef.current !== runId) return;
        pythonWorkerRef.current?.terminate();
        pythonWorkerRef.current = null;
        setStatus('Error');
        setConsoleLogs(prev => [...prev, { type: 'error', content: 'Your code took too long.' }]);
      }, 5000);
    }
  };
  
  const handleIframeLoad = () => {
    if (selectedLang.mode === 'web') {
      setStatus(prev => (prev === 'Error' || prev === 'Stopped') ? prev : 'Done');
    }
  };

  useEffect(() => {
    return () => {
      cleanupWorker(true);
      if (runTimeoutRef.current) clearTimeout(runTimeoutRef.current);
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    };
  }, []);

  const currentFile = selectedLang.files[activeFileIndex];
  const currentStateMap = sandboxMode === 'guided' && activeProject ? projectsState[activeProject.id]?.files : filesState[selectedLang.id];
  const currentValue = currentStateMap?.[currentFile?.name] ?? currentFile?.defaultCode ?? '';

  return (
    <div className="flex flex-col h-full w-full bg-[#0d0418] text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#150524] gap-2 flex-wrap">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex bg-black/40 rounded border border-white/10 overflow-hidden text-sm mr-2 shrink-0">
            <button
              onClick={() => handleModeSwitchRequest('free')}
              className={`px-3 py-1.5 transition-colors ${sandboxMode === 'free' ? 'bg-orange-500 text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
            >
              Free Code
            </button>
            <button
              onClick={() => handleModeSwitchRequest('guided')}
              className={`px-3 py-1.5 transition-colors ${sandboxMode === 'guided' ? 'bg-orange-500 text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
            >
              Guided Projects
            </button>
          </div>
          {sandboxMode === 'guided' && activeProject ? (
            <div className="text-xs font-bold text-orange-400 px-3 py-1.5 rounded bg-black/30 border border-white/10 uppercase tracking-wider">
              {activeProject.track === 'web' ? 'HTML/CSS/JS' : activeProject.track === 'python' ? 'Python' : 'JavaScript'}
            </div>
          ) : (
            <LanguageSelect
              languages={LANGUAGES}
              selectedId={selectedLang.id}
              onSelect={handleLanguageChange}
            />
          )}
          <div className="text-xs font-mono px-3 py-1 rounded bg-black/30 border border-white/10 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              status === 'Ready' || status === 'Stopped' 
                ? 'bg-gray-400' 
                : status === 'Running' 
                ? 'bg-green-400 animate-pulse' 
                : status === 'Waiting for input'
                ? 'bg-yellow-400 animate-pulse'
                : status === 'Loading Python...'
                ? 'bg-blue-400 animate-pulse'
                : status === 'Done' 
                ? 'bg-green-500' 
                : 'bg-red-500'
            }`}></span>
            {status}
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Music Volume & Mute Controls (Modules Page Style) */}
          <MusicToggleButton variant="circle" size="md" />

          {sandboxMode === 'free' && (
            <button
              onClick={() => setShowRestoreModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
              title="Restore starter code"
            >
              <FileCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Restore starter code</span>
              <span className="sm:hidden">Restore</span>
            </button>
          )}
          
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
            title="Stop running program and clear console"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Reset
          </button>

          {(status === 'Running' || status === 'Waiting for input') && (
            <button
              onClick={handleStop}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/40 rounded transition-colors"
              title="Stop Program"
            >
              <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /> Stop
            </button>
          )}

          <button
            onClick={handleRun}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
            title="Run Code (Ctrl+Enter)"
          >
            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" /> Run
          </button>
        </div>
      </div>

      {/* Main Content */}
      {sandboxMode === 'guided' && !activeProject ? (
        <ProjectPicker 
          projects={projects} 
          onSelect={handleSelectProject}
          progressMap={Object.fromEntries(
            Object.entries(projectsState).map(([id, state]) => [
              id,
              {
                unlockedSteps: state.unlockedSteps,
                totalSteps: projects.find(p => p.id === id)?.steps.length || 0,
                score: state.score
              }
            ])
          )}
        />
      ) : (
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {sandboxMode === 'guided' && activeProject && projectsState[activeProject.id] && (
          <CoachPanel
            project={activeProject}
            currentStepIndex={projectsState[activeProject.id].currentStepIndex}
            unlockedSteps={projectsState[activeProject.id].unlockedSteps}
            onStepSelect={(idx) => setProjectsState(prev => ({ ...prev, [activeProject.id]: { ...prev[activeProject.id], currentStepIndex: idx } }))}
            onCheckWork={handleCheckWork}
            onInsertStarter={handleInsertStarter}
            checkResults={projectsState[activeProject.id].checkResults}
            checking={checking}
            score={projectsState[activeProject.id].score}
            onKeepImproving={() => setProjectsState(prev => ({ ...prev, [activeProject.id]: { ...prev[activeProject.id], score: null } }))}
            onExit={handleExitProject}
            onRestart={handleRestartProject}
            hintTiers={projectsState[activeProject.id].hintTiers}
            onHintTiersChange={(tiers) => setProjectsState(prev => ({ ...prev, [activeProject.id]: { ...prev[activeProject.id], hintTiers: tiers } }))}
          />
        )}
        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 border-r border-white/10">
          {/* File Tabs */}
          {selectedLang.files.length > 1 && (
            <div className="flex bg-[#1a082c] border-b border-white/5 overflow-x-auto">
              {selectedLang.files.map((file, idx) => (
                <button
                  key={file.name}
                  onClick={() => setActiveFileIndex(idx)}
                  className={`px-4 py-2 text-sm font-mono border-r border-white/5 transition-colors whitespace-nowrap ${
                    idx === activeFileIndex 
                      ? 'bg-[#150524] text-orange-400 border-b-2 border-b-orange-500' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  {file.name}
                </button>
              ))}
            </div>
          )}
          
          <div className="flex-1 relative">
            <CodeEditor
              value={currentValue}
              language={currentFile?.language ?? 'javascript'}
              onChange={handleCodeChange}
              onRun={handleRun}
              diagnostic={diagnostic?.fileName === currentFile?.name ? diagnostic : null}
            />
          </div>
          
          {/* Input Panel */}
          {selectedLang.mode === 'python' && (
          <div className={`flex flex-col bg-[#150524] border-t border-white/10 transition-all duration-300 ${isInputOpen ? 'h-[150px]' : 'h-10'}`}>
            <button
              onClick={() => setIsInputOpen(!isInputOpen)}
              className="h-10 px-4 flex items-center justify-between text-gray-400 hover:text-white transition-colors shrink-0"
            >
              <span className="text-sm font-mono">
                Input {(!sabRef.current || typeof crossOriginIsolated === 'undefined' || !crossOriginIsolated) && <span className="text-gray-500 italic ml-2">Type your inputs in the Input box</span>}
              </span>
              {isInputOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
            {isInputOpen && (
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter input values here (one per line)..."
                className="flex-1 w-full bg-[#0d0418] text-gray-300 font-mono text-sm p-3 outline-none resize-none border-t border-white/5"
              />
            )}
          </div>
          )}
        </div>

        {/* Output Area */}
        <div className="flex-1 lg:max-w-[50%] min-h-[300px] lg:min-h-0">
          <OutputPanel
            mode={selectedLang.mode}
            srcDoc={srcDoc}
            consoleLogs={consoleLogs}
            iframeRef={iframeRef}
            onIframeLoad={handleIframeLoad}
            inputRequest={inputRequest}
            onSubmitInput={handleInputSubmit}
          />
        </div>
      </div>
      )}

      {/* Custom Confirmation Modal for Restore Starter Code */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-mono text-white selection:bg-[#ff912d] selection:text-[#0a0510] animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[#150a21] border border-white/15 rounded-xl p-6 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <button 
              onClick={() => setShowRestoreModal(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
            <div className="mb-4">
              <h3 className="text-base font-bold text-orange-400 uppercase tracking-wider mb-2">
                Restore Starter Code
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                {selectedLang.mode === 'web'
                  ? "Replace all files (index.html, style.css, script.js) with the starter code? This can't be undone."
                  : "Replace your code with the starter code? This can't be undone."
                }
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowRestoreModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                className="px-4 py-2 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors shadow-lg shadow-orange-500/20"
              >
                Restore Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode Switch Confirm Modal */}
      {showModeSwitchConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-mono text-white animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[#150a21] border border-white/15 rounded-xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-orange-400 uppercase tracking-wider mb-2">Switch Mode?</h3>
            <p className="text-sm text-gray-300 mb-6">Your guided project progress is saved locally, but switching modes will change your workspace. Continue?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModeSwitchConfirm(false)} className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={confirmModeSwitch} className="px-4 py-2 text-xs font-semibold bg-orange-500 hover:bg-orange-600 rounded transition-colors">Switch</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
