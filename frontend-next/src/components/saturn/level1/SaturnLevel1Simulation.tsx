'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { HelpCircle, ChevronUp, ChevronDown, X } from 'lucide-react';
import {
  SaturnValidationResult,
  SaturnWorkspaceState,
  SATURN_TEXT_BANK,
  SATURN_MATH_BANK,
  SaturnMathQuestion,
  SATURN_QUESTIONS,
  OpinionQuestion,
} from '@/lib/saturn/saturnLevel1Definitions';

export interface SaturnLevel1SimulationProps {
  validation: SaturnValidationResult;
  workspaceState: SaturnWorkspaceState;
  isRunning: boolean;
  failCount: number;
  isWon: boolean;
  currentWave?: number;
  onSimulationComplete?: (success: boolean, failureReason?: string) => void;
}

interface LogEntry {
  id: string;
  type: 'cin' | 'cout' | 'system' | 'error';
  text: string;
}

type ChallengeType = 'text' | 'number' | 'bool';

export default function SaturnLevel1Simulation({
  validation,
  workspaceState,
  isRunning,
  isWon,
  onSimulationComplete,
}: SaturnLevel1SimulationProps) {
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [typedInput, setTypedInput] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [loggedItems, setLoggedItems] = useState<string[]>([]);
  const [showResultsModal, setShowResultsModal] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', type: 'system', text: '> Data Terminal Ready.' },
  ]);

  // Challenge sequence: guarantees at least 2 strings, 2 ints, and 2 booleans in the first 10 items!
  // Breakdown in first 10: 4 Strings, 3 Ints, 3 Booleans (all >= 2)
  const FIRST_TEN_CHALLENGE_SEQUENCE: ChallengeType[] = [
    'text',   // 1. String #1
    'number', // 2. Int #1
    'bool',   // 3. Boolean #1
    'text',   // 4. String #2
    'number', // 5. Int #2
    'bool',   // 6. Boolean #2
    'text',   // 7. String #3
    'number', // 8. Int #3
    'bool',   // 9. Boolean #3
    'text',   // 10. String #4
  ];

  const [challengeType, setChallengeType] = useState<ChallengeType>('text');
  const [currentQuestion, setCurrentQuestion] = useState<OpinionQuestion>(SATURN_QUESTIONS[0]);
  const [currentWord, setCurrentWord] = useState<string>('ORBIT');
  const [currentMathQuestion, setCurrentMathQuestion] = useState<SaturnMathQuestion>(SATURN_MATH_BANK[0]);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const instructionsRef = useRef<HTMLDivElement>(null);
  const challengeIndexRef = useRef<number>(0);
  // Tracks submitted values per session to prevent duplicate scoring
  const usedItemsRef = useRef<Set<string>>(new Set());

  // Prevent entire page from being scrolled/pushed up
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (instructionsRef.current && !instructionsRef.current.contains(e.target as Node)) {
        setShowInstructions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Safe internal scroll only within the CRT log container (never scrolls window)
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Track all required blocks
  const hasStart = workspaceState.hasStart;
  const hasStorage = workspaceState.hasStorage;
  const hasLoop = workspaceState.hasLoop;
  const hasCin = workspaceState.hasCin;
  const hasCout = workspaceState.hasCout;
  const hasEnd = workspaceState.hasEnd;
  const isFullyBuilt =
    hasStart && hasStorage && hasLoop && hasCin && hasCout && hasEnd;

  // Advance challenge mode: guarantees 4 Strings, 3 Ints, 3 Booleans in the first 10 items
  const advanceChallenge = () => {
    challengeIndexRef.current += 1;
    const idx = challengeIndexRef.current;
    const nextType: ChallengeType =
      idx < FIRST_TEN_CHALLENGE_SEQUENCE.length
        ? FIRST_TEN_CHALLENGE_SEQUENCE[idx]
        : ((['number', 'bool', 'text'] as ChallengeType[])[(idx - 10) % 3]);

    setChallengeType(nextType);

    if (nextType === 'text') {
      const remainingWords = SATURN_TEXT_BANK.filter((item) => !usedItemsRef.current.has(item.word));
      const wordPool = remainingWords.length > 0 ? remainingWords : SATURN_TEXT_BANK;
      const nextWord = wordPool[Math.floor(Math.random() * wordPool.length)].word;
      setCurrentWord(nextWord);
    } else if (nextType === 'number') {
      const remainingMath = SATURN_MATH_BANK.filter((m) => !usedItemsRef.current.has(m.display));
      const mathPool = remainingMath.length > 0 ? remainingMath : SATURN_MATH_BANK;
      const nextMath = mathPool[Math.floor(Math.random() * mathPool.length)];
      setCurrentMathQuestion(nextMath);
    } else {
      const remainingQuestions = SATURN_QUESTIONS.filter((q) => !usedItemsRef.current.has(q.question));
      const qPool = remainingQuestions.length > 0 ? remainingQuestions : SATURN_QUESTIONS;
      const nextQ = qPool[Math.floor(Math.random() * qPool.length)];
      setCurrentQuestion(nextQ);
    }
  };

  // Audio synthesis helpers
  const playBuzzer = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.31);
    } catch { }
  };

  const playSuccessChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch { }
  };

  const playPowerDown = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.51);
    } catch { }
  };

  // Start fresh 30s session
  const startSession = () => {
    setShowResultsModal(false);
    setTimeLeft(45);
    setScore(0);
    setLoggedItems([]);
    setTypedInput('');
    challengeIndexRef.current = 0;
    setChallengeType(FIRST_TEN_CHALLENGE_SEQUENCE[0]);
    usedItemsRef.current = new Set();
    const initialWord = SATURN_TEXT_BANK[Math.floor(Math.random() * SATURN_TEXT_BANK.length)].word;
    const initialMath = SATURN_MATH_BANK[Math.floor(Math.random() * SATURN_MATH_BANK.length)];
    const initialQ = SATURN_QUESTIONS[Math.floor(Math.random() * SATURN_QUESTIONS.length)];
    setCurrentWord(initialWord);
    setCurrentMathQuestion(initialMath);
    setCurrentQuestion(initialQ);
    setLogs([
      { id: 'run-1', type: 'system', text: '> 45s Countdown Started! Score at least 1,000 pts to pass (1,500 pts goal):' },
    ]);

    setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 100);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle run trigger with real consequences for missing/misconfigured assets
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeLeft(45);
      setTypedInput('');
      setScore(0);
      setLoggedItems([]);
      setShowResultsModal(false);
      if (!isWon) {
        setLogs([{ id: 'init-1', type: 'system', text: '> Data Terminal Ready.' }]);
      }
      return;
    }

    // SCENARIO 1: Missing Start Program (Main Power Bus Dead)
    if (!hasStart) {
      playBuzzer();
      setLogs([
        { id: 'err-pwr-1', type: 'error', text: '> CRITICAL: Main system offline. Power bus is dark.' },
        { id: 'err-pwr-2', type: 'error', text: '> Hardware halted: Attach Start Program at top.' },
      ]);
      const timer = setTimeout(() => {
        onSimulationComplete?.(false, 'Terminal has no power: attach Start Program at top.');
      }, 1800);
      return () => clearTimeout(timer);
    }

    // SCENARIO 2: Storage Declared After Loop (Variable Scope Inversion)
    if (workspaceState.areStorageBlocksBeforeLoop === false) {
      playBuzzer();
      setLogs([
        { id: 'err-scope-1', type: 'error', text: '> COMPILER FAULT: Variables declared AFTER loop execution.' },
        { id: 'err-scope-2', type: 'error', text: '> In C++, storage must be declared before entering the stream loop.' },
      ]);
      const timer = setTimeout(() => {
        onSimulationComplete?.(false, 'Variables declared too late: move Storage blocks above the loop.');
      }, 1800);
      return () => clearTimeout(timer);
    }

    // SCENARIO 3: Missing Cout (Output Stream Disconnected)
    if (!hasCout) {
      playBuzzer();
      setLogs([
        { id: 'err-cout-1', type: 'error', text: '> HARDWARE FAULT: Screen output stream disconnected.' },
        { id: 'err-cout-2', type: 'error', text: '> Display dark: Add Print Screen (cout <<) inside loop.' },
      ]);
      const timer = setTimeout(() => {
        onSimulationComplete?.(false, 'Display output offline: add Print Screen (cout <<) inside the loop.');
      }, 1800);
      return () => clearTimeout(timer);
    }

    // SCENARIO 4: Missing Cin (Keyboard Input Stream Disconnected)
    if (!hasCin) {
      playBuzzer();
      setLogs([
        { id: 'err-cin-1', type: 'system', text: '> Power active. Initializing input bus...' },
        { id: 'err-cin-2', type: 'error', text: '> HARDWARE FAULT: Keyboard input stream disconnected.' },
        { id: 'err-cin-3', type: 'error', text: '> Terminal locked: Add Read Keyboard (cin >>) inside loop.' },
      ]);
      const timer = setTimeout(() => {
        onSimulationComplete?.(false, 'Cannot receive input: connect Read Keyboard (cin >>) inside the loop.');
      }, 2000);
      return () => clearTimeout(timer);
    }

    // SCENARIO 5: Stream Blocks Outside Loop
    if (workspaceState.isCinInLoop === false || workspaceState.isCoutInLoop === false) {
      playBuzzer();
      setLogs([
        { id: 'err-pipe-1', type: 'error', text: '> PIPELINE FAULT: Stream blocks connected outside loop.' },
        { id: 'err-pipe-2', type: 'error', text: '> Place Read Keyboard (cin) and Print Screen (cout) inside the loop.' },
      ]);
      const timer = setTimeout(() => {
        onSimulationComplete?.(false, 'Stream blocks misplaced: snap cin and cout inside the Repeat loop.');
      }, 1800);
      return () => clearTimeout(timer);
    }

    // SCENARIO 6: Inverted Stream Order (cout before cin)
    if (workspaceState.isCinBeforeCout === false) {
      playBuzzer();
      setLogs([
        { id: 'err-order-1', type: 'error', text: '> STREAM FAULT: Output executed before receiving input.' },
        { id: 'err-order-2', type: 'error', text: '> Connect Read Keyboard (cin >>) before Print Screen (cout <<).' },
      ]);
      const timer = setTimeout(() => {
        onSimulationComplete?.(false, 'Input before Output: place Read (cin) above Print (cout).');
      }, 1800);
      return () => clearTimeout(timer);
    }

    // SCENARIO 7: Missing Repeat Loop or Missing Specific Storage Buffer (Plays out in live session!)
    startSession();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, hasStart, hasCin, hasCout, workspaceState, validation, isWon]);

  // When timer hits 0: check if End Program block is present or show in-simulation results modal
  useEffect(() => {
    if (isRunning && timeLeft === 0) {
      if (!hasEnd) {
        playBuzzer();
        setLogs((prev) => [
          ...prev,
          { id: String(Date.now()), type: 'error', text: '> PROCESS HANGING: Main function missing return 0 exit code.' },
          { id: String(Date.now() + 1), type: 'error', text: '> Attach End Program at the bottom to exit cleanly.' },
        ]);
        onSimulationComplete?.(false, 'Missing End Program: attach End Program at the bottom to exit cleanly.');
        return;
      }

      setShowResultsModal(true);
      setLogs((prev) => [
        ...prev,
        { id: String(Date.now()), type: 'system', text: `> Time is up! ${score} items completed (${score * 100} pts).` },
      ]);
    }
  }, [timeLeft, isRunning, score, hasEnd]);

  // Handle text, number, or boolean submission with strict datatype checking & asset checks
  const handleSubmission = (valueToSubmit: string) => {
    if (!isRunning || timeLeft === 0) return;

    const trimmed = valueToSubmit.trim();
    if (!trimmed) return;

    const upper = trimmed.toUpperCase();

    // 1. Text challenge mode: expects currentWord
    if (challengeType === 'text') {
      if (upper === currentWord) {
        // CONSEQUENCE: Missing String Storage Buffer
        if (!workspaceState.hasStringStorage) {
          playBuzzer();
          setLogs((prev) => [
            ...prev,
            { id: String(Date.now()), type: 'error', text: '> MEMORY FAULT: Text Storage (string textWord) not allocated!' },
            { id: String(Date.now() + 1), type: 'error', text: '> Cannot store incoming text word without string variable.' },
          ]);
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => {
            onSimulationComplete?.(false, 'Memory Allocation Fault: Add Create Text Storage (string textWord) above the loop.');
          }, 1800);
          return;
        }

        // CONSEQUENCE: Missing Repeat Loop (exits after 1 single cycle!)
        if (!hasLoop) {
          usedItemsRef.current.add(upper);
          setScore(1);
          setLoggedItems([upper]);
          playPowerDown();
          const match = SATURN_TEXT_BANK.find((item) => item.word === upper);
          setLogs((prev) => [
            ...prev,
            { id: String(Date.now()), type: 'cin', text: `In (data):  ${upper}` },
            { id: String(Date.now() + 1), type: 'cout', text: `Out: ${match?.reaction || 'Packet received!'}` },
            { id: String(Date.now() + 2), type: 'error', text: '> PROCESS TERMINATED: Execution halted after 1 packet.' },
            { id: String(Date.now() + 3), type: 'error', text: '> Stream closed early: Telemetry loop missing!' },
          ]);
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => {
            onSimulationComplete?.(false, 'Terminal stopped after 1 packet: add Repeat While Receiving Input loop.');
          }, 1800);
          return;
        }

        usedItemsRef.current.add(upper);
        const newScore = score + 1;
        setScore(newScore);
        playSuccessChime();
        const match = SATURN_TEXT_BANK.find((item) => item.word === upper);
        setLoggedItems((prev) => [...prev, upper]);
        setLogs((prev) => [
          ...prev,
          { id: String(Date.now()), type: 'cin', text: `In (data):  ${upper}` },
          { id: String(Date.now() + 1), type: 'cout', text: `Out: ${match?.reaction || 'Packet received!'}` },
        ]);
        setTypedInput('');
        advanceChallenge();
        return;
      }

      // Wrong text packet
      playBuzzer();
      setLogs((prev) => [
        ...prev,
        { id: String(Date.now()), type: 'error', text: `> Incorrect word "${trimmed}". Check spelling and try again!` },
      ]);
      setTypedInput('');
      return;
    }

    // 2. Number challenge mode: expects math answer
    if (challengeType === 'number') {
      if (trimmed === currentMathQuestion.answer) {
        // CONSEQUENCE: Missing Int Storage Buffer
        if (!workspaceState.hasIntStorage) {
          playBuzzer();
          setLogs((prev) => [
            ...prev,
            { id: String(Date.now()), type: 'error', text: '> MEMORY FAULT: Number Storage (int sensorNum) not allocated!' },
            { id: String(Date.now() + 1), type: 'error', text: '> Cannot store sensor number without int variable.' },
          ]);
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => {
            onSimulationComplete?.(false, 'Memory Allocation Fault: Add Create Number Storage (int sensorNum) above the loop.');
          }, 1800);
          return;
        }

        // CONSEQUENCE: Missing Repeat Loop (exits after 1 single cycle!)
        if (!hasLoop) {
          usedItemsRef.current.add(currentMathQuestion.display);
          setScore(1);
          setLoggedItems([trimmed]);
          playPowerDown();
          setLogs((prev) => [
            ...prev,
            { id: String(Date.now()), type: 'cin', text: `In (data):  ${trimmed}` },
            { id: String(Date.now() + 1), type: 'cout', text: `Out: ${currentMathQuestion.reaction}` },
            { id: String(Date.now() + 2), type: 'error', text: '> PROCESS TERMINATED: Execution halted after 1 packet.' },
            { id: String(Date.now() + 3), type: 'error', text: '> Stream closed early: Telemetry loop missing!' },
          ]);
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => {
            onSimulationComplete?.(false, 'Terminal stopped after 1 packet: add Repeat While Receiving Input loop.');
          }, 1800);
          return;
        }

        usedItemsRef.current.add(currentMathQuestion.display);
        const newScore = score + 1;
        setScore(newScore);
        playSuccessChime();
        setLoggedItems((prev) => [...prev, trimmed]);
        setLogs((prev) => [
          ...prev,
          { id: String(Date.now()), type: 'cin', text: `In (data):  ${trimmed}` },
          { id: String(Date.now() + 1), type: 'cout', text: `Out: ${currentMathQuestion.reaction}` },
        ]);
        setTypedInput('');
        advanceChallenge();
        return;
      }

      // Wrong sensor number / calculation
      playBuzzer();
      setLogs((prev) => [
        ...prev,
        { id: String(Date.now()), type: 'error', text: `> Incorrect calculation "${trimmed}". Check your math and try again!` },
      ]);
      setTypedInput('');
      return;
    }

    // 3. Choice challenge mode: expects TRUE/FALSE
    if (challengeType === 'bool') {
      if (upper === 'TRUE' || upper === 'T' || upper === '1') {
        handleBoolChoice(true);
        setTypedInput('');
        return;
      }
      if (upper === 'FALSE' || upper === 'F' || upper === '0') {
        handleBoolChoice(false);
        setTypedInput('');
        return;
      }

      playBuzzer();
      setLogs((prev) => [
        ...prev,
        { id: String(Date.now()), type: 'error', text: `> Choice "${trimmed}" not recognized. Type TRUE or FALSE (or click the buttons).` },
      ]);
      setTypedInput('');
      return;
    }
  };

  // Handle true/false question choice
  const handleBoolChoice = (choice: boolean) => {
    if (!isRunning || timeLeft === 0 || challengeType !== 'bool') return;

    // Check if the choice matches the question's actual correct answer
    // If wrong: skip question, no points awarded (exclusive to true/false)
    if (choice !== currentQuestion.answer) {
      playBuzzer();
      setLogs((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          type: 'error',
          text: `> Incorrect choice "${choice ? 'TRUE' : 'FALSE'}". Skipping question...`,
        },
      ]);
      usedItemsRef.current.add(currentQuestion.question);
      setTypedInput('');
      advanceChallenge();
      return;
    }

    // CONSEQUENCE: Missing Choice Storage Buffer
    if (!workspaceState.hasBoolStorage) {
      playBuzzer();
      setLogs((prev) => [
        ...prev,
        { id: String(Date.now()), type: 'error', text: '> MEMORY FAULT: Choice Storage (bool userChoice) not allocated!' },
        { id: String(Date.now() + 1), type: 'error', text: '> Cannot store boolean choice without bool variable.' },
      ]);
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeout(() => {
        onSimulationComplete?.(false, 'Memory Allocation Fault: Add Create Choice Storage (bool userChoice) above the loop.');
      }, 1800);
      return;
    }

    const label = choice ? 'TRUE' : 'FALSE';
    const reply = currentQuestion.reaction || (choice ? currentQuestion.trueResponse : currentQuestion.falseResponse);

    // CONSEQUENCE: Missing Repeat Loop (exits after 1 single cycle!)
    if (!hasLoop) {
      setScore(1);
      setLoggedItems([label]);
      playPowerDown();
      setLogs((prev) => [
        ...prev,
        { id: String(Date.now()), type: 'cin', text: `In (data):  ${label}` },
        { id: String(Date.now() + 1), type: 'cout', text: `Out: ${reply}` },
        { id: String(Date.now() + 2), type: 'error', text: '> PROCESS TERMINATED: Execution halted after 1 packet.' },
        { id: String(Date.now() + 3), type: 'error', text: '> Stream closed early: Telemetry loop missing!' },
      ]);
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeout(() => {
        onSimulationComplete?.(false, 'Terminal stopped after 1 packet: add Repeat While Receiving Input loop.');
      }, 1800);
      return;
    }

    usedItemsRef.current.add(currentQuestion.question);
    const newScore = score + 1;
    setScore(newScore);
    playSuccessChime();

    setLoggedItems((prev) => [...prev, label]);
    setLogs((prev) => [
      ...prev,
      { id: String(Date.now()), type: 'cin', text: `In (data):  ${label}` },
      { id: String(Date.now() + 1), type: 'cout', text: `Out: ${reply}` },
    ]);
    advanceChallenge();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmission(typedInput);
    }
  };

  const handleProceed = () => {
    setShowResultsModal(false);
    if (score >= 10) {
      onSimulationComplete?.(true);
    } else {
      onSimulationComplete?.(false, `Need at least 10 items (1,000 pts). You completed ${score}.`);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col justify-between bg-[#04020a] select-none p-2 sm:p-2.5 font-sans min-h-0">

      {/* ===================================================================== */}
      {/* INSTRUCTIONS DROPDOWN (TOP-LEFT INSIDE SIMULATION CANVAS)             */}
      {/* ===================================================================== */}
      <div className="absolute top-2 left-2.5 z-50" ref={instructionsRef}>
        <button
          type="button"
          onClick={() => setShowInstructions((prev) => !prev)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/60 text-purple-100 hover:text-white font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(168,85,247,0.35)] active:scale-95 cursor-pointer ring-1 ring-purple-400/30 backdrop-blur-md"
          title="How to Pass Diagnostics"
        >
          <HelpCircle size={13} className="text-purple-300" />
          <span>Instructions</span>
          {showInstructions ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {showInstructions && (
          <div className="absolute top-9 left-0 z-50 w-[340px] sm:w-[420px] max-w-[calc(100vw-3rem)] bg-[#160a2c]/98 border border-purple-500/50 rounded-xl p-3 sm:p-3.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 text-left">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2.5">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
                How to Play
              </span>
              <button
                type="button"
                onClick={() => setShowInstructions(false)}
                className="text-gray-400 hover:text-white p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Kid-Friendly Step-by-Step Instructions with Key Word Highlighting */}
            <div className="space-y-2 text-xs text-gray-200 font-sans">
              <div className="flex items-start gap-2">
                <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold text-[10px] font-mono border border-red-500/40 shrink-0 mt-0.5">
                  STEP 1
                </span>
                <span className="leading-snug">
                  <strong className="text-red-400 font-bold">Start the program</strong> at the top, don't forget to <strong className="text-red-400 font-bold">end it</strong> as well!
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-[10px] font-mono border border-blue-500/40 shrink-0 mt-0.5">
                  STEP 2
                </span>
                <span className="leading-snug">
                  Prepare <strong className="text-blue-300 font-bold">memory boxes</strong> for words, numbers, and yes/no choices before <strong className="text-purple-300 font-bold">looping</strong>.
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] font-mono border border-amber-500/40 shrink-0 mt-0.5">
                  STEP 3
                </span>
                <span className="leading-snug">
                  Put <strong className="text-teal-300 font-bold">Read Keyboard</strong> and <strong className="text-amber-300 font-bold">Print Screen</strong> inside a <strong className="text-cyan-300 font-bold">repeat loop</strong> to keep data flowing.
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold text-[10px] font-mono border border-pink-500/40 shrink-0 mt-0.5">
                  STEP 4
                </span>
                <span className="leading-snug">
                  Run and solve answers before the <strong className="text-amber-300 font-bold">45-second timer</strong> runs out! (Pass: <strong className="text-emerald-300 font-bold">1,000 pts</strong>, Goal: <strong className="text-pink-300 font-bold">1,500 pts</strong>)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 1. COCKPIT CANOPY & BACKGROUND (HANDCRAFTED ARCHITECTURE)             */}
      {/* ===================================================================== */}
      <div className="relative w-full h-[35%] min-h-[100px] max-h-[160px] shrink-0 rounded-2xl overflow-hidden border-2 border-slate-700/80 bg-[#020108] shadow-[0_4px_16px_rgba(0,0,0,0.95)] flex flex-col justify-between">
        {/* ----------------------------------------------------------------- */}
        {/* OVERHEAD FLIGHT CONSOLE (CEILING)                                 */}
        {/* ----------------------------------------------------------------- */}
        <div className="relative z-30 w-full h-5 bg-gradient-to-b from-[#141521] via-[#0d0e17] to-[#07080f] border-b-2 border-slate-700/90 px-3 flex items-center justify-between shadow-md">
          {/* Left overhead switches */}
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            <div className="flex gap-1">
              <span className="w-2.5 h-1 rounded-sm bg-slate-700 border border-slate-600" />
              <span className="w-2.5 h-1 rounded-sm bg-slate-700 border border-slate-600" />
            </div>
          </div>

          {/* Center overhead avionics grid */}
          <div className="flex items-center gap-2">
            <span className="w-8 h-1 rounded bg-slate-800 border border-purple-900/60" />
            <div className="w-2 h-2 rounded-full bg-cyan-400/80 shadow-[0_0_6px_#22d3ee]" />
            <span className="w-8 h-1 rounded bg-slate-800 border border-purple-900/60" />
          </div>

          {/* Right overhead task lamp */}
          <div className="flex items-center gap-1.5">
            <div className="flex gap-1">
              <span className="w-2.5 h-1 rounded-sm bg-slate-700 border border-slate-600" />
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* THREE-PANEL PANORAMIC WINDSHIELD (SPACE VIEW + A-PILLARS)         */}
        {/* ----------------------------------------------------------------- */}
        <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center">
          {/* Deep Space Background: Cosmic Void & Purple Nebula Glow */}
          <div className="absolute inset-0 bg-[#010207] pointer-events-none">
            {/* Stars */}
            <div
              className="absolute inset-0 opacity-50"
              style={{
                backgroundImage:
                  'radial-gradient(1.2px 1.2px at 10% 30%, #fff 100%, transparent), radial-gradient(1.5px 1.5px at 30% 20%, #e9d5ff 100%, transparent), radial-gradient(1.2px 1.2px at 70% 60%, #fff 100%, transparent), radial-gradient(1.5px 1.5px at 85% 25%, #c084fc 100%, transparent), radial-gradient(1px 1px at 50% 80%, #fff 100%, transparent)',
                backgroundSize: '130px 130px, 170px 170px, 110px 110px, 150px 150px, 140px 140px',
              }}
            />

            {/* Glowing Cosmic Purple Nebula Dust */}
            <div
              className="absolute inset-0 opacity-60"
              style={{
                background:
                  'radial-gradient(ellipse at 75% 30%, rgba(147, 51, 234, 0.4) 0%, rgba(76, 29, 149, 0.2) 50%, transparent 80%)',
              }}
            />

            {/* Planetary Atmospheric Blue/Purple Horizon Glow across Horizon */}
            <div
              className="absolute inset-x-0 bottom-0 h-10 pointer-events-none opacity-50"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 120%, rgba(56, 189, 248, 0.45) 0%, rgba(147, 51, 234, 0.25) 50%, transparent 85%)',
              }}
            />
          </div>

          {/* Huge Looming Saturn with Radiant Rings in Space */}
          <div className="absolute -top-14 -right-10 w-68 h-68 sm:w-84 sm:h-84 pointer-events-none flex items-center justify-center z-10 transition-transform duration-1000">
            <div
              className={`relative w-full h-full transition-all duration-1000 ${
                isWon || (isRunning && score >= 10)
                  ? 'drop-shadow-[0_0_80px_rgba(192,132,252,0.95)] scale-105'
                  : 'contrast-125 opacity-90 drop-shadow-[0_0_35px_rgba(147,51,234,0.5)]'
              }`}
            >
              <Image
                src="/assets/planets/celestial/Saturn.svg"
                alt="Saturn"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Cockpit Canopy Multi-Pane A-Pillars & Window Struts (In front of Saturn) */}
          <div className="absolute inset-0 z-20 pointer-events-none flex">
            {/* Left Angled Cockpit Viewport */}
            <div className="relative w-[18%] h-full border-r-4 border-slate-700/90 shadow-[inset_0_0_12px_rgba(0,0,0,0.85)] bg-purple-950/15">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </div>

            {/* Center Main Panoramic Viewport */}
            <div className="relative flex-1 h-full shadow-[inset_0_0_16px_rgba(0,0,0,0.7)] bg-purple-950/10">
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 45%, rgba(168,85,247,0.12) 65%, transparent 100%)',
                }}
              />
            </div>

            {/* Right Angled Cockpit Viewport */}
            <div className="relative w-[22%] h-full border-l-4 border-slate-700/90 shadow-[inset_0_0_12px_rgba(0,0,0,0.85)] bg-purple-950/15">
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/5 to-transparent" />
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* GLARE-SHIELD DASHBOARD LEDGE (BOTTOM OF WINDSHIELD)               */}
        {/* ----------------------------------------------------------------- */}
        <div className="relative z-30 w-full h-3 bg-gradient-to-t from-[#141523] via-[#0d0e17] to-transparent border-t border-slate-700 flex items-center justify-between px-4">
          <div className="w-10 h-0.5 rounded-full bg-slate-700" />
          <div className="flex gap-2">
            <span className="w-1.5 h-1 rounded-full bg-amber-400/70" />
            <span className="w-1.5 h-1 rounded-full bg-emerald-400/70" />
          </div>
          <div className="w-10 h-0.5 rounded-full bg-slate-700" />
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. THE PHYSICAL CRT MONITOR                                           */}
      {/* ===================================================================== */}
      <div className="relative flex-1 min-h-0 w-full mt-1.5 flex flex-col items-center justify-between overflow-hidden">
        <div
          className={`relative w-full flex-1 min-h-0 flex flex-col justify-between rounded-2xl border-3 sm:border-4 p-2 transition-all duration-700 shadow-[0_6px_20px_rgba(0,0,0,0.95)] ${hasStart
              ? 'border-purple-600/80 bg-gradient-to-b from-[#1b142c] via-[#100c1c] to-[#090710] shadow-[0_0_24px_rgba(168,85,247,0.2)]'
              : 'border-slate-800 bg-[#090710] opacity-80'
            }`}
        >
          {/* Corner Screws */}
          <div className="absolute top-1.5 left-2 w-1.5 h-1.5 rounded-full bg-slate-600 border border-slate-500" />
          <div className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-slate-600 border border-slate-500" />
          <div className="absolute bottom-1.5 left-2 w-1.5 h-1.5 rounded-full bg-slate-600 border border-slate-500" />
          <div className="absolute bottom-1.5 right-2 w-1.5 h-1.5 rounded-full bg-slate-600 border border-slate-500" />

          {/* Header with Title and Boxed Countdown/Items (Never Overlaps) */}
          <div className="w-full flex items-center justify-between pb-1 px-1.5 border-b border-purple-900/40 text-xs sm:text-sm gap-2 shrink-0">
            {/* Left: Title */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono font-bold tracking-widest text-purple-200 uppercase text-xs sm:text-sm">
                DATA TERMINAL
              </span>
              <span className="font-mono text-[10px] text-purple-400/70 uppercase tracking-widest hidden md:inline">
                [{hasStart ? 'ONLINE' : 'STANDBY'}]
              </span>
            </div>

            {/* Right: Distinct Boxed Badges for Time & Items */}
            {isRunning && (
              <div className="flex items-center gap-2 font-mono shrink-0 ml-auto">
                <div
                  className={`px-2 py-0.5 rounded border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    timeLeft <= 5
                      ? 'border-red-500/80 bg-red-950/70 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                      : 'border-purple-500/50 bg-purple-950/60 text-purple-200'
                  }`}
                >
                  <span className="text-[10px] text-purple-400 uppercase tracking-wider">TIME</span>
                  <span className={timeLeft <= 5 ? 'text-red-400 font-black animate-pulse' : 'text-purple-100 font-bold'}>
                    {timeLeft}s
                  </span>
                </div>

                <div className="px-2 py-0.5 rounded border border-purple-500/50 bg-purple-950/60 text-xs font-bold flex items-center gap-1.5 text-purple-200">
                  <span className="text-[10px] text-purple-400 uppercase tracking-wider">ITEMS</span>
                  <span className={score >= 15 ? 'text-emerald-400 font-black' : score >= 10 ? 'text-cyan-300 font-bold' : 'text-purple-100 font-bold'}>
                    {score}/20
                  </span>
                  <span className="text-[10px] text-purple-300/80 font-normal hidden sm:inline">
                    ({score * 100} pts)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Recessed CRT Screen Display */}
          <div
            className={`relative flex-1 min-h-0 w-full rounded-xl my-1 p-2 flex flex-col justify-between overflow-hidden border transition-all duration-700 shadow-[inset_0_4px_16px_rgba(0,0,0,0.98)] ${hasCout
                ? 'bg-[#080413] border-purple-900/80 shadow-[inset_0_0_20px_rgba(147,51,234,0.15)]'
                : 'bg-[#030206] border-slate-900'
              }`}
            style={{
              backgroundImage: hasCout
                ? 'repeating-linear-gradient(0deg, rgba(0,0,0,0.45) 0px, rgba(0,0,0,0.45) 1px, transparent 1px, transparent 3px)'
                : 'none',
            }}
          >
            {hasCout ? (
              isRunning && timeLeft > 0 && challengeType === 'bool' ? (
                /* Full Computer Screen True / False View */
                <div className="relative z-20 flex-1 min-h-0 w-full flex flex-col items-center justify-center text-center p-3 animate-in fade-in zoom-in-95 duration-200">
                  <div className="text-xs sm:text-sm text-yellow-400 tracking-wider font-mono font-bold mb-2 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">
                    True or False?
                  </div>

                  <div className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-purple-100 max-w-lg leading-snug px-4 py-2.5 rounded-xl bg-purple-950/80 border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.35)] mb-3">
                    {currentQuestion.question}
                  </div>

                  <div className="flex items-center justify-center gap-4 sm:gap-6 w-full max-w-xs mt-1">
                    <button
                      type="button"
                      onClick={() => handleBoolChoice(true)}
                      className="flex-1 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm sm:text-base tracking-widest transition-all shadow-[0_0_16px_rgba(16,185,129,0.6)] active:scale-95 cursor-pointer ring-2 ring-emerald-400/50"
                    >
                      TRUE
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBoolChoice(false)}
                      className="flex-1 py-2 sm:py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-black text-sm sm:text-base tracking-widest transition-all shadow-[0_0_16px_rgba(236,72,153,0.6)] active:scale-95 cursor-pointer ring-2 ring-pink-400/50"
                    >
                      FALSE
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Log Stream (Safe internal scroll) */}
                  <div
                    ref={logContainerRef}
                    className="relative z-20 flex-1 min-h-0 overflow-y-auto space-y-1 font-mono text-xs sm:text-sm pr-1"
                  >
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className={`leading-relaxed ${log.type === 'cin'
                            ? 'text-purple-300 font-bold drop-shadow-[0_0_6px_rgba(192,132,252,0.8)]'
                            : log.type === 'cout'
                              ? 'text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]'
                              : log.type === 'error'
                                ? 'text-red-400 font-bold'
                                : 'text-purple-300'
                          }`}
                      >
                        {log.text}
                      </div>
                    ))}
                  </div>

                  {/* ONE-BY-ONE Challenge Item Bar (Text / Number) */}
                  {isRunning && timeLeft > 0 && (
                    <div className="relative z-20 w-full mt-1 pt-1.5 border-t border-purple-900/50 flex items-center justify-between gap-2 font-mono shrink-0">
                      {challengeType === 'text' && (
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[11px] sm:text-xs text-purple-400 uppercase tracking-wider shrink-0 font-bold">
                            Target Word:
                          </span>
                          <span className="font-black text-white px-3.5 py-1 rounded-lg bg-purple-900/90 border border-purple-400/80 text-base sm:text-lg md:text-xl tracking-widest shadow-[0_0_14px_rgba(168,85,247,0.5)]">
                            {currentWord}
                          </span>
                        </div>
                      )}

                      {challengeType === 'number' && (
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[11px] sm:text-xs text-blue-400 uppercase tracking-wider shrink-0 font-bold">
                            Solve Math:
                          </span>
                          <span className="font-black text-cyan-200 px-3.5 py-1 rounded-lg bg-blue-950/90 border border-blue-400/80 text-base sm:text-lg md:text-xl tracking-wider shadow-[0_0_14px_rgba(59,130,246,0.5)]">
                            {currentMathQuestion.display}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-3 font-mono">
                <div className="text-red-400 font-bold text-xs sm:text-sm tracking-widest uppercase mb-1 animate-pulse">
                  CRT MONITOR OFFLINE
                </div>
                <div className="text-purple-300/70 text-xs">
                  Output Stream Disconnected — Connect Print Screen (cout &lt;&lt;)
                </div>
              </div>
            )}
          </div>

          {/* Keyboard Input Tray */}
          <div className="w-full pt-1 border-t border-purple-950 shrink-0">
            {hasCin ? (
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-purple-300 tracking-wider shrink-0 font-mono">
                  Input:
                </span>

                <input
                  ref={inputRef}
                  type="text"
                  value={typedInput}
                  onChange={(e) => setTypedInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!isRunning || timeLeft === 0}
                  placeholder={
                    isRunning && timeLeft > 0
                      ? challengeType === 'bool'
                        ? 'Type TRUE or FALSE (or click buttons)...'
                        : challengeType === 'number'
                          ? 'Type in your answer here...'
                          : 'Type in the word here...'
                      : ''
                  }
                  className="flex-1 bg-[#100820] border border-purple-700/60 rounded-lg px-2.5 py-1 text-xs sm:text-sm text-purple-100 placeholder:text-purple-400/40 focus:outline-none focus:border-purple-400 focus:shadow-[0_0_10px_rgba(168,85,247,0.6)] font-mono"
                />

                <button
                  type="button"
                  onClick={() => handleSubmission(typedInput)}
                  disabled={!isRunning || !typedInput.trim() || timeLeft === 0}
                  className="px-4 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:pointer-events-none text-white text-xs sm:text-sm font-bold transition-all shadow-[0_0_8px_rgba(168,85,247,0.5)] shrink-0 cursor-pointer"
                >
                  SEND
                </button>
              </div>
            ) : (
              <div className="w-full py-1 flex items-center justify-center gap-2 text-center text-xs font-mono text-red-400/90 bg-red-950/20 rounded border border-red-900/30">
                <span className="font-bold tracking-wider">INPUT TRAY LOCKED</span>
                <span className="text-purple-300/70 hidden sm:inline">— Keyboard Stream (cin &gt;&gt;) Disconnected</span>
              </div>
            )}
          </div>
        </div>

        {/* Stand Base */}
        <div className="w-20 sm:w-24 h-1.5 shrink-0 bg-gradient-to-t from-slate-900 to-slate-800 rounded-b-md border-x-2 border-b-2 border-slate-700 shadow-sm" />
      </div>

      {/* ===================================================================== */}
      {/* 3. IN-SIMULATION SCORE MODAL (Appears after 30s)                      */}
      {/* ===================================================================== */}
      {showResultsModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm rounded-2xl border-2 border-purple-500 bg-gradient-to-b from-[#1c1233] via-[#100820] to-[#080410] p-5 shadow-[0_0_40px_rgba(168,85,247,0.5)] flex flex-col items-center text-center font-sans">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Terminal Challenge Results
            </span>

            <div className="my-3 flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-purple-300 drop-shadow-[0_0_12px_rgba(192,132,252,0.8)]">
                {score * 100} PTS
              </span>
              <span className="text-sm font-bold text-purple-200 mt-1">
                {score} of 20 Items Completed
              </span>
            </div>

            <div
              className={`w-full py-2 px-3 rounded-xl border text-xs font-bold mb-4 ${score >= 15
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                  : score >= 10
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                }`}
            >
              {score >= 15
                ? 'Mastery Goal Achieved! (1,500+ Points)'
                : score >= 10
                  ? 'Level Passed! (1,000+ Points)'
                  : 'Need at least 1,000 points (10 items) to pass'}
            </div>

            {loggedItems.length > 0 && (
              <div className="w-full mb-4 max-h-24 overflow-y-auto p-2 rounded-xl bg-purple-950/40 border border-purple-900/60 flex flex-wrap gap-1.5 justify-center">
                {loggedItems.map((item, idx) => (
                  <span
                    key={`${item}-${idx}`}
                    className="px-2 py-0.5 rounded bg-purple-900/80 text-[11px] font-bold text-purple-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}

            <div className="w-full flex items-center gap-3">
              <button
                type="button"
                onClick={startSession}
                className="flex-1 py-2.5 rounded-xl border border-purple-500/60 bg-purple-950/70 hover:bg-purple-900 text-purple-200 text-xs sm:text-sm font-bold transition-all hover:scale-[1.02] cursor-pointer"
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={handleProceed}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all hover:scale-[1.02] shadow-lg cursor-pointer ${score >= 10
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_16px_rgba(168,85,247,0.6)]'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
