"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Unlock,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ClipboardList,
  Target,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  Code2,
  Layers,
  Copy,
  Check,
  AlertCircle,
  Hash,
  Type as TypeIcon,
  ToggleLeft,
  ToggleRight,
  Radio,
  Sliders,
  Cpu,
  ShieldAlert,
  Flame
} from 'lucide-react';
import { useProgression } from '@/context/ProgressionContext';
import { useNavigationGuard } from '@/context/NavigationGuardContext';
import { XP_REWARDS } from '@/lib/leveling';
import { isDemoModeActive } from '@/lib/demoMode';
import { getUserStorageItem, setUserStorageItem } from '@/lib/userStorage';
import { useSession } from 'next-auth/react';

// =============================================================================
// TYPES & DATA DEFINITIONS
// =============================================================================

export type DataType = 'String' | 'int' | 'boolean';
export type ValueType = 'text' | 'number' | 'boolean_toggle' | 'text_trap';

export interface IDCardRow {
  id: number;
  type: DataType | null;
  varName: string;
  value: string | number | boolean | null;
  valueType: ValueType | null;
}

export interface PhysicalLockState {
  id: number;
  label: string;
  hardwareType: 'scanner' | 'keypad' | 'breaker';
  expectedType: DataType;
  expectedValue: string | number | boolean;
  status: 'locked' | 'injecting' | 'unlocked' | 'failed';
  displayValue: string;
  errorReason?: string;
  disengaged: boolean;
}

export interface Objective {
  id: number;
  title: string;
  completed: boolean;
  xpReward: number;
}

export interface NovaModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'info' | 'error' | 'warning' | 'success';
}

const NOVA_AVATAR = '/assets/global/npcs/Nova Idle.svg';
const JUPITER_ICON = '/assets/planets/celestial/Jupiter.svg';

export default function JupiterLevel1() {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const { requestNavigation } = useNavigationGuard();

  // Progression Context
  const { addXp: _rawAddXp } = useProgression();
  const addXp = useCallback((amount: number, sourceLabel?: string) => {
    if (isDemoModeActive()) return;
    _rawAddXp(amount, sourceLabel);
  }, [_rawAddXp]);

  // =============================================================================
  // GAME STATE
  // =============================================================================

  // Workspace Tabs: 'blocks' | 'syntax'
  const [activeTab, setActiveTab] = useState<'blocks' | 'syntax'>('blocks');

  // Toolbox Tabs: 'boxTypes' | 'passwords'
  const [toolboxTab, setToolboxTab] = useState<'boxTypes' | 'passwords'>('boxTypes');

  // The 3 Blockly Variable Skeleton Rows
  const [rows, setRows] = useState<IDCardRow[]>([
    { id: 1, type: null, varName: 'password', value: null, valueType: null },
    { id: 2, type: null, varName: 'pin', value: null, valueType: null },
    { id: 3, type: null, varName: 'override', value: null, valueType: null },
  ]);

  // 3 Physical Hardware Locks Mounted to the Right Station Wall
  const [hardwareLocks, setHardwareLocks] = useState<PhysicalLockState[]>([
    {
      id: 0,
      label: 'BIOMETRIC TEXT SCANNER',
      hardwareType: 'scanner',
      expectedType: 'String',
      expectedValue: 'JupiterSecurity',
      status: 'locked',
      displayValue: '',
      disengaged: false,
    },
    {
      id: 1,
      label: 'HEAVY NUMERIC PINPAD',
      hardwareType: 'keypad',
      expectedType: 'int',
      expectedValue: 1234,
      status: 'locked',
      displayValue: '',
      disengaged: false,
    },
    {
      id: 2,
      label: 'MANUAL OVERRIDE BREAKER',
      hardwareType: 'breaker',
      expectedType: 'boolean',
      expectedValue: true,
      status: 'locked',
      displayValue: '',
      disengaged: false,
    },
  ]);

  // Simulation execution & physical lock states
  const [isSimulating, setIsSimulating] = useState(false);
  const [isDoorOpen, setIsDoorOpen] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [highlightRows, setHighlightRows] = useState<Record<number, boolean>>({});
  const [bouncingSlot, setBouncingSlot] = useState<string | null>(null);

  // Active projection beam animation from workspace into hardware locks
  const [activeProjectionIndex, setActiveProjectionIndex] = useState<number | null>(null);

  // Clipboard UI (Bottom-Left Hint System)
  const [isClipboardOpen, setIsClipboardOpen] = useState(false);

  // Objectives Dropdown & Victory Modal
  const [isObjectivesOpen, setIsObjectivesOpen] = useState(false);
  const [isPauseOpen, setIsPauseOpen] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Kid-Friendly NPC (Nova) Toast/Modal
  const [novaModal, setNovaModal] = useState<NovaModalState>({
    isOpen: false,
    title: 'Nova Assistant',
    message: '',
    type: 'info',
  });

  // Selected item for click-to-place support (along with drag & drop)
  const [selectedToolboxItem, setSelectedToolboxItem] = useState<{
    kind: 'type' | 'value';
    type?: DataType;
    value?: any;
    valueType?: ValueType;
    label: string;
  } | null>(null);

  // Custom toggle for boolean switch in toolbox
  const [toolboxBooleanValue, setToolboxBooleanValue] = useState<boolean>(true);

  // =============================================================================
  // OBJECTIVES TRACKING
  // =============================================================================

  const obj1Completed = useMemo(() => {
    return rows.some(
      r => r.type === 'String' && String(r.value) === 'JupiterSecurity' && r.varName.trim().length > 0
    );
  }, [rows]);

  const obj2Completed = useMemo(() => {
    return rows.some(
      r => r.type === 'int' && (r.value === 1234 || String(r.value).replace(/,/g, '').trim() === '1234') && r.varName.trim().length > 0
    );
  }, [rows]);

  const obj3Completed = useMemo(() => {
    return rows.some(
      r => r.type === 'boolean' && r.value === true && r.valueType === 'boolean_toggle' && r.varName.trim().length > 0
    );
  }, [rows]);

  const objectives: Objective[] = useMemo(() => [
    {
      id: 1,
      title: 'Make a String box to hold the text password.',
      completed: obj1Completed || hardwareLocks[0].disengaged,
      xpReward: XP_REWARDS.CAMPAIGN_GOAL || 20,
    },
    {
      id: 2,
      title: 'Make an int box to hold the 4-digit PIN.',
      completed: obj2Completed || hardwareLocks[1].disengaged,
      xpReward: XP_REWARDS.CAMPAIGN_GOAL || 20,
    },
    {
      id: 3,
      title: 'Make a boolean box and turn the switch to true.',
      completed: obj3Completed || hardwareLocks[2].disengaged,
      xpReward: XP_REWARDS.CAMPAIGN_GOAL || 20,
    },
  ], [obj1Completed, obj2Completed, obj3Completed, hardwareLocks]);

  const completedObjectivesCount = objectives.filter(o => o.completed).length;

  // =============================================================================
  // CODE SYNTAX GENERATOR (REAL-TIME JAVA TRANSLATION)
  // =============================================================================

  const generatedJavaCode = useMemo(() => {
    const lines: string[] = [
      '// Station Airlock Override Protocol',
      '// Generated from Jupiter Blockly Workspace',
      '',
    ];

    rows.forEach((row, idx) => {
      const typeStr = row.type || '/* Type */';
      const nameStr = row.varName.trim() || `id_${idx + 1}`;
      let valStr = '/* Value */';

      if (row.value !== null) {
        if (row.type === 'String' || row.valueType === 'text' || row.valueType === 'text_trap') {
          valStr = `"${row.value}"`;
        } else if (row.type === 'int' || row.valueType === 'number') {
          valStr = String(row.value).replace(/,/g, '');
        } else if (row.type === 'boolean' || row.valueType === 'boolean_toggle') {
          valStr = row.value ? 'true' : 'false';
        }
      }

      if (row.type && row.value !== null) {
        lines.push(`${typeStr} ${nameStr} = ${valStr};`);
      } else if (row.type) {
        lines.push(`${typeStr} ${nameStr} = ${valStr}; // Waiting for password value`);
      } else {
        lines.push(`// Row ${idx + 1}: Incomplete Variable Block`);
      }
    });

    return lines.join('\n');
  }, [rows]);

  // =============================================================================
  // ANTI-MATCHING GAME LOGIC (STRICT TYPE VALIDATION)
  // =============================================================================

  const showNovaToast = useCallback((message: string, type: 'info' | 'error' | 'warning' | 'success' = 'error', title = 'Nova Alert') => {
    setNovaModal({
      isOpen: true,
      title,
      message,
      type,
    });
  }, []);

  const triggerSlotBounce = useCallback((slotKey: string) => {
    setBouncingSlot(slotKey);
    setTimeout(() => {
      setBouncingSlot(null);
    }, 600);
  }, []);

  // Handle snapping Box Type puzzle block into skeleton block
  const handleAssignType = useCallback((rowId: number, newType: DataType) => {
    setRows(prev => prev.map(r => {
      if (r.id !== rowId) return r;

      // Anti-matching validation if row already contains a snapped value
      if (r.value !== null && r.valueType) {
        if (newType === 'int' && (r.valueType === 'text' || r.valueType === 'text_trap' || r.valueType === 'boolean_toggle')) {
          triggerSlotBounce(`type-${rowId}`);
          showNovaToast("Type Mismatch: 'int' can only hold whole numbers! Try using a 'String' box for words!");
          return r;
        }
        if (newType === 'String' && (r.valueType === 'number' || r.valueType === 'boolean_toggle')) {
          triggerSlotBounce(`type-${rowId}`);
          showNovaToast("Type Mismatch: 'String' can only hold text words in quotes!");
          return r;
        }
        if (newType === 'boolean' && r.valueType === 'text_trap') {
          triggerSlotBounce(`type-${rowId}`);
          showNovaToast('Careful! The text word "true" isn\'t the same as a true/false switch. Use the boolean toggle block!');
          return r;
        }
      }

      return { ...r, type: newType };
    }));
    setSelectedToolboxItem(null);
  }, [showNovaToast, triggerSlotBounce]);

  // Handle snapping Password/Value puzzle block into skeleton block
  const handleAssignValue = useCallback((rowId: number, value: any, valueType: ValueType) => {
    const targetRow = rows.find(r => r.id === rowId);
    if (!targetRow) return;

    // STRICT TYPE VALIDATION (ANTI-MATCHING PUZZLE LOGIC)
    if (targetRow.type === 'int') {
      if (valueType === 'text' || valueType === 'text_trap' || (typeof value === 'string' && isNaN(Number(String(value).replace(/,/g, ''))))) {
        triggerSlotBounce(`value-${rowId}`);
        showNovaToast("Oops! An 'int' box is only for numbers. Try using a 'String' box for words!");
        return;
      }
      if (valueType === 'boolean_toggle') {
        triggerSlotBounce(`value-${rowId}`);
        showNovaToast("Oops! An 'int' box is only for numbers. Try using a 'String' box for words!");
        return;
      }
    }

    if (targetRow.type === 'String') {
      if (valueType === 'number' || valueType === 'boolean_toggle') {
        triggerSlotBounce(`value-${rowId}`);
        showNovaToast("Oops! A 'String' box is only for text words in quotes!");
        return;
      }
    }

    if (targetRow.type === 'boolean') {
      if (valueType === 'text_trap' || (valueType === 'text' && String(value).toLowerCase() === 'true')) {
        triggerSlotBounce(`value-${rowId}`);
        showNovaToast('Careful! The text word "true" isn\'t the same as a true/false switch. Use the boolean toggle block!');
        return;
      }
      if (valueType === 'number' || valueType === 'text') {
        triggerSlotBounce(`value-${rowId}`);
        showNovaToast("Oops! A 'boolean' box is only for true or false switches!");
        return;
      }
    }

    // Comma sanitization: if number is typed as 1,234, store sanitized 1234
    let cleanVal = value;
    if (valueType === 'number' || targetRow.type === 'int') {
      cleanVal = String(value).replace(/,/g, '');
    }

    setRows(prev => prev.map(r => {
      if (r.id !== rowId) return r;
      return {
        ...r,
        value: cleanVal,
        valueType,
      };
    }));

    setHighlightRows(prev => ({ ...prev, [rowId]: false }));
    setSelectedToolboxItem(null);
  }, [rows, showNovaToast, triggerSlotBounce]);

  const handleVarNameChange = useCallback((rowId: number, newName: string) => {
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, varName: newName } : r));
    setHighlightRows(prev => ({ ...prev, [rowId]: false }));
  }, []);

  const handleClearRow = useCallback((rowId: number) => {
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, type: null, value: null, valueType: null } : r));
    setHighlightRows(prev => ({ ...prev, [rowId]: false }));
  }, []);

  const handleToggleRowBoolean = useCallback((rowId: number) => {
    setRows(prev => prev.map(r => {
      if (r.id !== rowId || r.type !== 'boolean') return r;
      return { ...r, value: !r.value };
    }));
  }, []);

  // =============================================================================
  // PHYSICAL HARDWARE INJECTION & SIMULATION SEQUENCE
  // =============================================================================

  const handleRunSimulation = useCallback(async () => {
    if (isSimulating || isDoorOpen) return;

    // 1. Missing elements pre-check
    const incompleteRows = rows.filter(r => r.type === null || r.value === null);
    if (incompleteRows.length > 0) {
      const errMap: Record<number, boolean> = {};
      incompleteRows.forEach(r => { errMap[r.id] = true; });
      setHighlightRows(errMap);
      showNovaToast('Make sure all 3 variable blocks have both a Box Type and a Password value before running the simulation!', 'warning', 'Incomplete Blocks');
      return;
    }

    // 2. Missing variable names pre-check
    const emptyNameRows = rows.filter(r => r.varName.trim().length === 0);
    if (emptyNameRows.length > 0) {
      const errMap: Record<number, boolean> = {};
      emptyNameRows.forEach(r => { errMap[r.id] = true; });
      setHighlightRows(errMap);
      showNovaToast("Don't forget to name your boxes so the computer knows what to call them!", 'error', 'Missing Variable Name');
      return;
    }

    // 3. Duplicate variable names pre-check
    const names = rows.map(r => r.varName.trim().toLowerCase());
    const nameSet = new Set(names);
    if (nameSet.size < rows.length) {
      const duplicates: Record<number, boolean> = {};
      rows.forEach((r, idx) => {
        const n = r.varName.trim().toLowerCase();
        if (names.indexOf(n) !== idx || names.lastIndexOf(n) !== idx) {
          duplicates[r.id] = true;
        }
      });
      setHighlightRows(duplicates);
      showNovaToast("Every box needs its own unique name! You can't have two boxes called the same thing.", 'error', 'Duplicate Variable Names');
      return;
    }

    // Start physical hardware injection animation
    setIsSimulating(true);
    setAttemptCount(prev => prev + 1);
    setHighlightRows({});

    // Find candidates in workspace
    const stringCandidate = rows.find(r => r.type === 'String');
    const intCandidate = rows.find(r => r.type === 'int');
    const booleanCandidate = rows.find(r => r.type === 'boolean');

    // -------------------------------------------------------------------------
    // HARDWARE LOCK 0: BIOMETRIC TEXT SCANNER (Top Physical Unit)
    // -------------------------------------------------------------------------
    setActiveProjectionIndex(0);
    setHardwareLocks(prev => [
      { ...prev[0], status: 'injecting', displayValue: 'SCANNING...' },
      prev[1],
      prev[2],
    ]);

    await new Promise(res => setTimeout(res, 500));
    const strVal = stringCandidate ? String(stringCandidate.value) : '';
    setHardwareLocks(prev => [
      { ...prev[0], displayValue: strVal ? `"${strVal}"` : 'NO INPUT' },
      prev[1],
      prev[2],
    ]);

    // -------------------------------------------------------------------------
    // HARDWARE LOCK 1: HEAVY NUMERIC PINPAD (Middle Physical Unit)
    // -------------------------------------------------------------------------
    await new Promise(res => setTimeout(res, 400));
    setActiveProjectionIndex(1);
    setHardwareLocks(prev => [
      prev[0],
      { ...prev[1], status: 'injecting', displayValue: 'KEYING...' },
      prev[2],
    ]);

    await new Promise(res => setTimeout(res, 500));
    const intVal = intCandidate ? String(intCandidate.value).replace(/,/g, '') : '';
    setHardwareLocks(prev => [
      prev[0],
      { ...prev[1], displayValue: intVal || '----' },
      prev[2],
    ]);

    // -------------------------------------------------------------------------
    // HARDWARE LOCK 2: MANUAL OVERRIDE BREAKER (Bottom Physical Unit)
    // -------------------------------------------------------------------------
    await new Promise(res => setTimeout(res, 400));
    setActiveProjectionIndex(2);
    setHardwareLocks(prev => [
      prev[0],
      prev[1],
      { ...prev[2], status: 'injecting', displayValue: 'SWITCHING...' },
    ]);

    await new Promise(res => setTimeout(res, 500));
    const boolVal = booleanCandidate ? (booleanCandidate.value ? 'true' : 'false') : '';
    setHardwareLocks(prev => [
      prev[0],
      prev[1],
      { ...prev[2], displayValue: boolVal ? `POS: ${boolVal.toUpperCase()}` : 'OFF' },
    ]);

    await new Promise(res => setTimeout(res, 500));
    setActiveProjectionIndex(null);

    // -------------------------------------------------------------------------
    // EVALUATE HARDWARE DEADBOLT DISENGAGEMENTS
    // -------------------------------------------------------------------------
    let lock0Pass = false;
    let lock0Error = '';
    if (stringCandidate) {
      const raw = String(stringCandidate.value);
      if (raw === 'JupiterSecurity') {
        lock0Pass = true;
      } else if (raw.toLowerCase() === 'jupitersecurity' || raw.trim() !== raw) {
        lock0Error = 'Access denied! Passwords are exact matches. Check your capital letters and spaces!';
      } else {
        lock0Error = `Text Scanner rejected: "${raw}". Check the security clipboard hint!`;
      }
    } else {
      lock0Error = 'Missing String variable block!';
    }

    let lock1Pass = false;
    let lock1Error = '';
    if (intCandidate) {
      const sanitized = String(intCandidate.value).replace(/,/g, '').trim();
      if (sanitized === '1234') {
        lock1Pass = true;
      } else {
        lock1Error = `PIN Pad rejected: ${sanitized}. Expected 1234.`;
      }
    } else {
      lock1Error = 'Missing int variable block!';
    }

    let lock2Pass = false;
    let lock2Error = '';
    if (booleanCandidate) {
      if (booleanCandidate.valueType === 'text_trap') {
        lock2Error = 'Careful! The text word "true" isn\'t the same as a true/false switch. Use the boolean toggle block!';
      } else if (booleanCandidate.value === true) {
        lock2Pass = true;
      } else {
        lock2Error = 'Breaker is set to FALSE. Flip the mechanical switch to TRUE to override!';
      }
    } else {
      lock2Error = 'Missing boolean variable block!';
    }

    // Partial success handling:
    // Physical locks that pass turn GREEN and physically disengage (deadbolt retracts)!
    // Locks that fail stay red & locked!
    setHardwareLocks(prev => [
      {
        ...prev[0],
        status: lock0Pass ? 'unlocked' : 'failed',
        disengaged: lock0Pass,
        errorReason: lock0Error,
      },
      {
        ...prev[1],
        status: lock1Pass ? 'unlocked' : 'failed',
        disengaged: lock1Pass,
        errorReason: lock1Error,
      },
      {
        ...prev[2],
        status: lock2Pass ? 'unlocked' : 'failed',
        disengaged: lock2Pass,
        errorReason: lock2Error,
      },
    ]);

    setIsSimulating(false);

    // WIN STATE: All 3 physical deadbolts disengaged!
    if (lock0Pass && lock1Pass && lock2Pass) {
      setIsDoorOpen(true);

      if (!isDemoModeActive()) {
        try {
          addXp(XP_REWARDS.SECTION_COMPLETION_BONUS || 150, 'Level 1: Unlock the Gate Cleared');

          fetch('/api/missions/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              missionId: 'jupiter-1',
              level_id: 'jupiter_1',
              status: 'completed',
              attempts: attemptCount + 1,
              fail_count: failCount,
              submittedCode: generatedJavaCode,
            }),
          }).catch(e => console.warn('Telemetry error:', e));

          if (typeof window !== 'undefined' && userId) {
            const completed: string[] = JSON.parse(getUserStorageItem('completed_missions', userId) || '[]');
            if (!completed.includes('jupiter-1')) {
              completed.push('jupiter-1');
            }
            setUserStorageItem('completed_missions', JSON.stringify(completed), userId);
            setUserStorageItem('planet_unlock_pending', 'true', userId);
          }
        } catch (e) {
          console.warn('Persist error:', e);
        }
      }

      setTimeout(() => {
        setShowVictoryModal(true);
      }, 1500);

    } else {
      // FAIL STATE (Partial or complete fail)
      setFailCount(prev => prev + 1);

      const rowErrMap: Record<number, boolean> = {};
      if (!lock0Pass && stringCandidate) rowErrMap[stringCandidate.id] = true;
      if (!lock1Pass && intCandidate) rowErrMap[intCandidate.id] = true;
      if (!lock2Pass && booleanCandidate) rowErrMap[booleanCandidate.id] = true;
      setHighlightRows(rowErrMap);

      const primaryError = lock0Error || lock1Error || lock2Error || 'Deadbolts remain engaged. Check your variable types and passwords!';
      showNovaToast(primaryError, 'error', 'Lockdown Engaged');
    }
  }, [
    isSimulating,
    isDoorOpen,
    rows,
    failCount,
    attemptCount,
    showNovaToast,
    addXp,
    generatedJavaCode,
    userId,
  ]);

  const handleRestart = useCallback(() => {
    setRows([
      { id: 1, type: null, varName: 'password', value: null, valueType: null },
      { id: 2, type: null, varName: 'pin', value: null, valueType: null },
      { id: 3, type: null, varName: 'override', value: null, valueType: null },
    ]);
    setHardwareLocks([
      { id: 0, label: 'BIOMETRIC TEXT SCANNER', hardwareType: 'scanner', expectedType: 'String', expectedValue: 'JupiterSecurity', status: 'locked', displayValue: '', disengaged: false },
      { id: 1, label: 'HEAVY NUMERIC PINPAD', hardwareType: 'keypad', expectedType: 'int', expectedValue: 1234, status: 'locked', displayValue: '', disengaged: false },
      { id: 2, label: 'MANUAL OVERRIDE BREAKER', hardwareType: 'breaker', expectedType: 'boolean', expectedValue: true, status: 'locked', displayValue: '', disengaged: false },
    ]);
    setIsDoorOpen(false);
    setIsSimulating(false);
    setHighlightRows({});
    setIsPauseOpen(false);
    setShowVictoryModal(false);
  }, []);

  const handleCopyCode = useCallback(() => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(generatedJavaCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  }, [generatedJavaCode]);

  // =============================================================================
  // DRAG & DROP HANDLERS (HTML5)
  // =============================================================================

  const handleDragStart = (e: React.DragEvent, item: { kind: 'type' | 'value'; type?: DataType; value?: any; valueType?: ValueType; label: string }) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnTypeSlot = (e: React.DragEvent, rowId: number) => {
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);
      if (data.kind === 'type' && data.type) {
        handleAssignType(rowId, data.type);
      } else {
        triggerSlotBounce(`type-${rowId}`);
        showNovaToast('Drop a Box Type puzzle piece here (String, int, or boolean)!', 'warning');
      }
    } catch (err) {
      console.warn('Drop error:', err);
    }
  };

  const handleDropOnValueSlot = (e: React.DragEvent, rowId: number) => {
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);
      if (data.kind === 'value' && data.valueType) {
        handleAssignValue(rowId, data.value, data.valueType);
      } else {
        triggerSlotBounce(`value-${rowId}`);
        showNovaToast('Drop an interlocking Password value puzzle piece here!', 'warning');
      }
    } catch (err) {
      console.warn('Drop error:', err);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#070212] text-white overflow-hidden select-none font-sans min-h-0 relative">

      {/* ======================================================================= */}
      {/* 1. TOP GLOBAL NAVIGATION HEADER */}
      {/* ======================================================================= */}
      <header className="h-16 px-4 bg-[#110520] border-b border-white/10 flex items-center justify-between shadow-2xl z-30 shrink-0">
        {/* Left: Pause Menu, Jupiter Icon, Title & Tags */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => setIsPauseOpen(true)}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-[#ff912d]/20 border border-white/10 hover:border-[#ff912d]/40 text-gray-300 hover:text-[#ff912d] transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md"
            title="Game Menu"
          >
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-3">
            <img
              src={JUPITER_ICON}
              alt="Jupiter"
              className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(249,115,22,0.5)]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-sm sm:text-base text-white tracking-wide uppercase leading-tight">
                  Level 1: Unlock the Gate
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-orange-500/20 border border-orange-500/40 text-orange-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                  Java
                </span>
              </div>
              <p className="text-[11px] font-mono text-gray-400 leading-tight mt-0.5">
                Jupiter (Java) • Data Types &amp; Variables
              </p>
            </div>
          </div>
        </div>

        {/* Right: Mission Goals & Run Simulation Button */}
        <div className="flex items-center gap-3">
          {/* Mission Goals Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsObjectivesOpen(prev => !prev)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all cursor-pointer text-xs font-mono font-bold shadow-md ${
                isObjectivesOpen
                  ? 'bg-[#1b0830] border-[#ff912d] text-white'
                  : 'bg-white/5 hover:bg-white/10 border-white/15 text-gray-200'
              }`}
            >
              <Target size={16} className="text-[#ff912d] shrink-0" />
              <span className="font-display uppercase tracking-wider hidden sm:inline">Mission Goals</span>
              <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-semibold ${
                completedObjectivesCount === 3
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-[#ff912d]/20 text-[#ff912d] border border-[#ff912d]/30'
              }`}>
                {completedObjectivesCount}/3
              </span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${isObjectivesOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Objectives Dropdown Menu */}
            {isObjectivesOpen && (
              <div className="absolute right-0 top-12 w-80 sm:w-96 bg-[#16062a]/95 backdrop-blur-md border border-white/15 rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
                  <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <Target size={14} className="text-[#ff912d]" />
                    Mission Directives
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {completedObjectivesCount}/3 Achieved
                  </span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {objectives.map((obj) => (
                    <div
                      key={obj.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        obj.completed
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                          : 'bg-white/5 border-white/10 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {obj.completed ? (
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-gray-500 shrink-0" />
                        )}
                        <span className="text-xs font-sans font-medium leading-snug">
                          {obj.title}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-[#ff912d] shrink-0 ml-2">
                        +{obj.xpReward} XP
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Primary Action: Run Simulation Button */}
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating || isDoorOpen}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-black text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 ${
              isDoorOpen
                ? 'bg-emerald-600/50 border border-emerald-400 text-emerald-200 cursor-default'
                : isSimulating
                ? 'bg-[#ff912d]/50 border border-[#ff912d]/50 text-white animate-pulse cursor-wait'
                : 'bg-gradient-to-r from-[#ff912d] to-[#ff7300] hover:from-[#ffa149] hover:to-[#ff831e] text-black border border-[#ffc107] shadow-[0_0_20px_rgba(255,145,45,0.4)]'
            }`}
          >
            <Play size={16} className={isSimulating ? 'animate-spin' : 'fill-current'} />
            <span>{isSimulating ? 'Injecting ID...' : isDoorOpen ? 'Airlock Unlocked' : 'Run Simulation'}</span>
          </button>
        </div>
      </header>

      {/* ======================================================================= */}
      {/* 2. MAIN 2-PANE WORKSPACE LAYOUT */}
      {/* ======================================================================= */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 min-w-0 overflow-hidden relative">

        {/* --------------------------------------------------------------------- */}
        {/* LEFT PANE: STRICT BLOCKLY TACTILE PUZZLE WORKSPACE */}
        {/* --------------------------------------------------------------------- */}
        <div className="w-full md:w-1/2 lg:w-[48%] h-full flex flex-col bg-[#0b0314] border-r border-white/10 overflow-hidden shrink-0 z-10 shadow-2xl">

          {/* Mode Tabs: Blockly Sandbox vs Java Code Syntax */}
          <div className="h-12 px-4 bg-[#140526] border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('blocks')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === 'blocks'
                    ? 'bg-[#ff912d]/20 text-[#ff912d] border border-[#ff912d]/40 shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Layers size={14} />
                <span>Blockly Sandbox</span>
              </button>

              <button
                onClick={() => setActiveTab('syntax')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === 'syntax'
                    ? 'bg-purple-600/30 text-purple-200 border border-purple-400/50 shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Code2 size={14} />
                <span>Java Code Syntax</span>
              </button>
            </div>

            <button
              onClick={handleRestart}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              title="Reset Sandbox"
            >
              <RotateCcw size={15} />
            </button>
          </div>

          {/* TAB 1: BLOCKLY SANDBOX (TACTILE INTERLOCKING PUZZLE BLOCKS) */}
          {activeTab === 'blocks' ? (
            <div className="flex-1 flex flex-col overflow-y-auto p-4 gap-5">

              {/* Categorized Blockly Toolbox */}
              <div className="bg-[#120422] border-2 border-purple-900/50 rounded-2xl p-3.5 shadow-xl shrink-0">
                <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setToolboxTab('boxTypes')}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        toolboxTab === 'boxTypes'
                          ? 'bg-indigo-600/40 text-indigo-200 border border-indigo-400/60 shadow-sm'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      Box Types (Data Types)
                    </button>
                    <button
                      onClick={() => setToolboxTab('passwords')}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        toolboxTab === 'passwords'
                          ? 'bg-amber-600/40 text-amber-200 border border-amber-400/60 shadow-sm'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      Passwords (Values)
                    </button>
                  </div>

                  <span className="text-[10px] font-mono text-gray-400 hidden sm:inline">
                    Interlocking Puzzle Blocks
                  </span>
                </div>

                {/* Toolbox: Box Types Blocks (Puzzle Plugs) */}
                {toolboxTab === 'boxTypes' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* String Puzzle Block */}
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, { kind: 'type', type: 'String', label: 'String' })}
                      onClick={() => setSelectedToolboxItem({ kind: 'type', type: 'String', label: 'String' })}
                      className={`p-3 rounded-xl border-t-2 border-l-2 border-r-2 border-b-4 transition-all cursor-grab active:cursor-grabbing flex items-center justify-between shadow-lg relative ${
                        selectedToolboxItem?.type === 'String'
                          ? 'bg-indigo-600 border-indigo-300 border-b-indigo-900 ring-2 ring-indigo-300 scale-[1.02]'
                          : 'bg-[#4338ca] hover:bg-[#4f46e5] border-indigo-300 border-b-indigo-950 text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <TypeIcon size={16} className="text-indigo-200" />
                        <div>
                          <div className="font-mono font-black text-sm text-white drop-shadow">String</div>
                          <div className="text-[9px] font-mono text-indigo-200">Text in quotes</div>
                        </div>
                      </div>
                      {/* Interlocking Puzzle Tab on the Right */}
                      <div className="w-3.5 h-6 bg-inherit border-t-2 border-r-2 border-b-4 border-indigo-300 border-b-indigo-950 rounded-r-md -mr-4 z-10 shadow-md" />
                    </div>

                    {/* int Puzzle Block */}
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, { kind: 'type', type: 'int', label: 'int' })}
                      onClick={() => setSelectedToolboxItem({ kind: 'type', type: 'int', label: 'int' })}
                      className={`p-3 rounded-xl border-t-2 border-l-2 border-r-2 border-b-4 transition-all cursor-grab active:cursor-grabbing flex items-center justify-between shadow-lg relative ${
                        selectedToolboxItem?.type === 'int'
                          ? 'bg-emerald-600 border-emerald-300 border-b-emerald-900 ring-2 ring-emerald-300 scale-[1.02]'
                          : 'bg-[#059669] hover:bg-[#10b981] border-emerald-300 border-b-emerald-950 text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Hash size={16} className="text-emerald-200" />
                        <div>
                          <div className="font-mono font-black text-sm text-white drop-shadow">int</div>
                          <div className="text-[9px] font-mono text-emerald-200">Whole numbers</div>
                        </div>
                      </div>
                      {/* Interlocking Puzzle Tab on the Right */}
                      <div className="w-3.5 h-6 bg-inherit border-t-2 border-r-2 border-b-4 border-emerald-300 border-b-emerald-950 rounded-r-md -mr-4 z-10 shadow-md" />
                    </div>

                    {/* boolean Puzzle Block */}
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, { kind: 'type', type: 'boolean', label: 'boolean' })}
                      onClick={() => setSelectedToolboxItem({ kind: 'type', type: 'boolean', label: 'boolean' })}
                      className={`p-3 rounded-xl border-t-2 border-l-2 border-r-2 border-b-4 transition-all cursor-grab active:cursor-grabbing flex items-center justify-between shadow-lg relative ${
                        selectedToolboxItem?.type === 'boolean'
                          ? 'bg-amber-600 border-amber-300 border-b-amber-900 ring-2 ring-amber-300 scale-[1.02]'
                          : 'bg-[#d97706] hover:bg-[#f59e0b] border-amber-300 border-b-amber-950 text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ToggleRight size={16} className="text-amber-200" />
                        <div>
                          <div className="font-mono font-black text-sm text-white drop-shadow">boolean</div>
                          <div className="text-[9px] font-mono text-amber-200">true / false switch</div>
                        </div>
                      </div>
                      {/* Interlocking Puzzle Tab on the Right */}
                      <div className="w-3.5 h-6 bg-inherit border-t-2 border-r-2 border-b-4 border-amber-300 border-b-amber-950 rounded-r-md -mr-4 z-10 shadow-md" />
                    </div>
                  </div>
                )}

                {/* Toolbox: Passwords Blocks (Value Puzzle Pieces) */}
                {toolboxTab === 'passwords' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Text String Block: "JupiterSecurity" */}
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, { kind: 'value', value: 'JupiterSecurity', valueType: 'text', label: '"JupiterSecurity"' })}
                      onClick={() => setSelectedToolboxItem({ kind: 'value', value: 'JupiterSecurity', valueType: 'text', label: '"JupiterSecurity"' })}
                      className={`p-2.5 rounded-xl border-t-2 border-l-2 border-r-2 border-b-4 transition-all cursor-grab active:cursor-grabbing flex flex-col gap-0.5 shadow-lg relative ${
                        selectedToolboxItem?.value === 'JupiterSecurity' && selectedToolboxItem?.valueType === 'text'
                          ? 'bg-indigo-600 border-indigo-200 border-b-indigo-950 ring-2 ring-indigo-300 scale-[1.02]'
                          : 'bg-[#3730a3] hover:bg-[#4338ca] border-indigo-300 border-b-indigo-950 text-white'
                      }`}
                    >
                      {/* Left Interlocking Puzzle Plug */}
                      <div className="w-2.5 h-4 bg-inherit border-t-2 border-l-2 border-b-2 border-indigo-200 rounded-l-md -ml-3 absolute top-1/2 -translate-y-1/2" />
                      <span className="text-[9px] font-mono text-indigo-200 uppercase">Text String</span>
                      <span className="font-mono font-black text-xs text-white truncate">&quot;JupiterSecurity&quot;</span>
                    </div>

                    {/* Number PIN Block: 1234 */}
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, { kind: 'value', value: 1234, valueType: 'number', label: '1234' })}
                      onClick={() => setSelectedToolboxItem({ kind: 'value', value: 1234, valueType: 'number', label: '1234' })}
                      className={`p-2.5 rounded-xl border-t-2 border-l-2 border-r-2 border-b-4 transition-all cursor-grab active:cursor-grabbing flex flex-col gap-0.5 shadow-lg relative ${
                        selectedToolboxItem?.value === 1234 && selectedToolboxItem?.valueType === 'number'
                          ? 'bg-emerald-600 border-emerald-200 border-b-emerald-950 ring-2 ring-emerald-300 scale-[1.02]'
                          : 'bg-[#065f46] hover:bg-[#047857] border-emerald-300 border-b-emerald-950 text-white'
                      }`}
                    >
                      {/* Left Interlocking Puzzle Plug */}
                      <div className="w-2.5 h-4 bg-inherit border-t-2 border-l-2 border-b-2 border-emerald-200 rounded-l-md -ml-3 absolute top-1/2 -translate-y-1/2" />
                      <span className="text-[9px] font-mono text-emerald-200 uppercase">Integer PIN</span>
                      <span className="font-mono font-black text-xs text-white">1234</span>
                    </div>

                    {/* Boolean Switch Toggle Block */}
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, { kind: 'value', value: toolboxBooleanValue, valueType: 'boolean_toggle', label: toolboxBooleanValue ? 'true' : 'false' })}
                      onClick={() => setSelectedToolboxItem({ kind: 'value', value: toolboxBooleanValue, valueType: 'boolean_toggle', label: toolboxBooleanValue ? 'true' : 'false' })}
                      className={`p-2.5 rounded-xl border-t-2 border-l-2 border-r-2 border-b-4 transition-all cursor-grab active:cursor-grabbing flex flex-col gap-0.5 shadow-lg relative ${
                        selectedToolboxItem?.valueType === 'boolean_toggle'
                          ? 'bg-amber-600 border-amber-200 border-b-amber-950 ring-2 ring-amber-300 scale-[1.02]'
                          : 'bg-[#92400e] hover:bg-[#b45309] border-amber-300 border-b-amber-950 text-white'
                      }`}
                    >
                      <div className="w-2.5 h-4 bg-inherit border-t-2 border-l-2 border-b-2 border-amber-200 rounded-l-md -ml-3 absolute top-1/2 -translate-y-1/2" />
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono text-amber-200 uppercase">Toggle Switch</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setToolboxBooleanValue(prev => !prev);
                          }}
                          className="text-[9px] font-mono text-amber-300 hover:text-white underline cursor-pointer"
                        >
                          Flip
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {toolboxBooleanValue ? (
                          <ToggleRight size={16} className="text-emerald-300 shrink-0" />
                        ) : (
                          <ToggleLeft size={16} className="text-gray-300 shrink-0" />
                        )}
                        <span className="font-mono font-black text-xs text-white">
                          {toolboxBooleanValue ? 'true' : 'false'}
                        </span>
                      </div>
                    </div>

                    {/* Trap Text Block: "true" (String as a boolean trap) */}
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, { kind: 'value', value: 'true', valueType: 'text_trap', label: '"true"' })}
                      onClick={() => setSelectedToolboxItem({ kind: 'value', value: 'true', valueType: 'text_trap', label: '"true"' })}
                      className={`p-2.5 rounded-xl border-t-2 border-l-2 border-r-2 border-b-4 transition-all cursor-grab active:cursor-grabbing flex flex-col gap-0.5 shadow-lg relative ${
                        selectedToolboxItem?.valueType === 'text_trap'
                          ? 'bg-rose-600 border-rose-200 border-b-rose-950 ring-2 ring-rose-300 scale-[1.02]'
                          : 'bg-[#881337] hover:bg-[#9f1239] border-rose-300 border-b-rose-950 text-white'
                      }`}
                      title="Word block that literally says 'true' in quotes"
                    >
                      <div className="w-2.5 h-4 bg-inherit border-t-2 border-l-2 border-b-2 border-rose-200 rounded-l-md -ml-3 absolute top-1/2 -translate-y-1/2" />
                      <span className="text-[9px] font-mono text-rose-200 uppercase">Word Block (Text)</span>
                      <span className="font-mono font-black text-xs text-rose-100">&quot;true&quot;</span>
                    </div>
                  </div>
                )}
              </div>

              {/* The 3 Blockly Variable Wrapper Blocks */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-xs sm:text-sm text-gray-200 uppercase tracking-wider flex items-center gap-2">
                    <Layers size={16} className="text-[#ff912d]" />
                    Interlocking Variable Blocks
                  </h3>
                  <span className="text-[11px] font-mono text-gray-400">
                    Structure: [ Notched Type ] [ Name Field ] = [ Output Socket ]
                  </span>
                </div>

                {rows.map((row, idx) => {
                  const isRowHighlighted = highlightRows[row.id];
                  const isTypeBouncing = bouncingSlot === `type-${row.id}`;
                  const isValueBouncing = bouncingSlot === `value-${row.id}`;

                  return (
                    <div
                      key={row.id}
                      className={`p-4 rounded-2xl border-t-2 border-l-2 border-r-2 border-b-4 transition-all shadow-xl relative ${
                        isRowHighlighted
                          ? 'bg-[#2a0815] border-red-500 border-b-red-900 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                          : 'bg-[#18082e] border-purple-500/50 border-b-[#0b0314] hover:border-purple-400'
                      }`}
                    >
                      {/* Blockly Header Label */}
                      <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-1.5">
                        <span className="text-[10px] font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-purple-400" />
                          Blockly Variable #{idx + 1}
                        </span>

                        {(row.type || row.value !== null) && (
                          <button
                            onClick={() => handleClearRow(row.id)}
                            className="text-[11px] font-mono text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            Disconnect
                          </button>
                        )}
                      </div>

                      {/* Tactile Interlocking Skeleton Block */}
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">

                        {/* SLOT 1: Notched Input Slot on the Left for [Box Type] */}
                        <div
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDropOnTypeSlot(e, row.id)}
                          onClick={() => {
                            if (selectedToolboxItem?.kind === 'type' && selectedToolboxItem.type) {
                              handleAssignType(row.id, selectedToolboxItem.type);
                            }
                          }}
                          className={`min-w-[130px] sm:w-40 h-14 rounded-xl border-2 flex items-center justify-between px-3 transition-all cursor-pointer relative ${
                            isTypeBouncing ? 'animate-bounce border-red-500 bg-red-950/80 shadow-[0_0_20px_#ef4444]' : ''
                          } ${
                            row.type === 'String'
                              ? 'bg-indigo-600 border-t-2 border-l-2 border-r-2 border-b-4 border-indigo-200 border-b-indigo-950 text-white shadow-md'
                              : row.type === 'int'
                              ? 'bg-emerald-600 border-t-2 border-l-2 border-r-2 border-b-4 border-emerald-200 border-b-emerald-950 text-white shadow-md'
                              : row.type === 'boolean'
                              ? 'bg-amber-600 border-t-2 border-l-2 border-r-2 border-b-4 border-amber-200 border-b-amber-950 text-white shadow-md'
                              : selectedToolboxItem?.kind === 'type'
                              ? 'border-dashed border-[#ff912d] bg-[#ff912d]/15 text-white animate-pulse'
                              : 'border-dashed border-white/30 bg-black/40 text-gray-400 hover:border-white/50'
                          }`}
                        >
                          {row.type ? (
                            <div className="flex items-center gap-2">
                              {row.type === 'String' && <TypeIcon size={16} className="text-indigo-200 shrink-0" />}
                              {row.type === 'int' && <Hash size={16} className="text-emerald-200 shrink-0" />}
                              {row.type === 'boolean' && <ToggleRight size={16} className="text-amber-200 shrink-0" />}
                              <div>
                                <div className="font-mono font-black text-sm text-white drop-shadow">{row.type}</div>
                                <div className="text-[8px] font-mono opacity-80">Snapped Type</div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center w-full">
                              <span className="text-[11px] font-mono text-gray-400">
                                [ Type Slot ]
                              </span>
                            </div>
                          )}

                          {/* Authentic Puzzle Connector Notch Visual */}
                          <div className="w-2.5 h-5 bg-[#0b0314] rounded-l-md -mr-4 border-l border-y border-white/20" />
                        </div>

                        {/* SLOT 2: Tactile Variable Name Field (Center) */}
                        <div className="flex-1 min-w-[130px] flex items-center gap-1.5 px-3 h-14 bg-[#0a0214] border-t-2 border-l-2 border-r-2 border-b-4 border-purple-900/60 border-b-purple-950 rounded-xl shadow-inner">
                          <span className="font-mono font-bold text-xs text-purple-300 shrink-0 hidden sm:inline">
                            name:
                          </span>
                          <input
                            type="text"
                            value={row.varName}
                            onChange={(e) => handleVarNameChange(row.id, e.target.value)}
                            placeholder="box_name"
                            className={`w-full h-9 px-2.5 rounded-lg font-mono font-bold text-sm bg-black/70 border text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 ${
                              isRowHighlighted && row.varName.trim().length === 0
                                ? 'border-red-500 ring-red-400'
                                : 'border-white/15 focus:border-[#ff912d] focus:ring-[#ff912d]/40'
                            }`}
                          />
                        </div>

                        {/* Connector Symbol */}
                        <span className="font-mono font-black text-gray-400 text-lg px-0.5">
                          =
                        </span>

                        {/* SLOT 3: Interlocking Output Slot on the Right for [Password] */}
                        <div
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDropOnValueSlot(e, row.id)}
                          onClick={() => {
                            if (selectedToolboxItem?.kind === 'value' && selectedToolboxItem.valueType) {
                              handleAssignValue(row.id, selectedToolboxItem.value, selectedToolboxItem.valueType);
                            }
                          }}
                          className={`min-w-[140px] flex-1 h-14 rounded-xl border-2 flex items-center justify-between px-3 transition-all cursor-pointer relative ${
                            isValueBouncing ? 'animate-bounce border-red-500 bg-red-950/80 shadow-[0_0_20px_#ef4444]' : ''
                          } ${
                            row.value !== null
                              ? row.valueType === 'boolean_toggle'
                                ? 'bg-amber-600 border-t-2 border-l-2 border-r-2 border-b-4 border-amber-200 border-b-amber-950 text-white shadow-md'
                                : row.valueType === 'text'
                                ? 'bg-indigo-600 border-t-2 border-l-2 border-r-2 border-b-4 border-indigo-200 border-b-indigo-950 text-white shadow-md'
                                : row.valueType === 'number'
                                ? 'bg-emerald-600 border-t-2 border-l-2 border-r-2 border-b-4 border-emerald-200 border-b-emerald-950 text-white shadow-md'
                                : 'bg-rose-600 border-t-2 border-l-2 border-r-2 border-b-4 border-rose-200 border-b-rose-950 text-white shadow-md'
                              : selectedToolboxItem?.kind === 'value'
                              ? 'border-dashed border-[#ff912d] bg-[#ff912d]/15 text-white animate-pulse'
                              : 'border-dashed border-white/30 bg-black/40 text-gray-400 hover:border-white/50'
                          }`}
                        >
                          {/* Left Puzzle Socket Inset */}
                          <div className="w-2.5 h-5 bg-[#0b0314] rounded-r-md -ml-4 border-r border-y border-white/20" />

                          {row.value !== null ? (
                            <div className="flex items-center justify-between w-full pl-2">
                              <span className="font-mono font-black text-sm truncate drop-shadow">
                                {row.valueType === 'text' || row.valueType === 'text_trap' ? `"${row.value}"` : String(row.value)}
                              </span>

                              {row.type === 'boolean' && row.valueType === 'boolean_toggle' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleRowBoolean(row.id);
                                  }}
                                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-amber-200 hover:text-white border border-amber-400/40 ml-2"
                                >
                                  Flip
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="text-center w-full pl-2">
                              <span className="text-[11px] font-mono text-gray-400">
                                [ Value Socket ]
                              </span>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            /* TAB 2: JAVA CODE SYNTAX VIEW */
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                  Real-Time Java Translation
                </span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-mono text-xs transition cursor-pointer"
                >
                  {copiedCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex-1 bg-[#05010b] border border-white/10 rounded-2xl p-4 font-mono text-xs overflow-y-auto leading-relaxed text-gray-300 shadow-inner">
                <pre className="whitespace-pre-wrap">{generatedJavaCode}</pre>
              </div>
            </div>
          )}

        </div>

        {/* --------------------------------------------------------------------- */}
        {/* RIGHT PANE: ENCLOSED INTERIOR AIRLOCK CORRIDOR & PHYSICAL LOCKS */}
        {/* --------------------------------------------------------------------- */}
        <div className="flex-1 h-full flex flex-col bg-[#070913] relative overflow-hidden select-none">

          {/* =================================================================== */}
          {/* HIGH-TECH ENCLOSED INTERIOR AIRLOCK HALLWAY ENVIRONMENT */}
          {/* =================================================================== */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">

            {/* 1. INDUSTRIAL CEILING WITH PERSPECTIVE CROSSBEAMS */}
            <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#0e1626] via-[#090e18] to-transparent border-b border-cyan-500/20">
              {/* Ceiling light conduits */}
              <div className="w-full h-full flex justify-between px-8 relative opacity-40">
                <div className="w-8 h-full bg-[#162238] border-x border-cyan-400/30" />
                <div className="w-16 h-8 bg-cyan-400/20 rounded-b-xl shadow-[0_0_20px_#06b6d4] mx-auto" />
                <div className="w-8 h-full bg-[#162238] border-x border-cyan-400/30" />
              </div>
            </div>

            {/* 2. INDUSTRIAL FLOOR DECK WITH 3D PERSPECTIVE LINES & HAZARD STRIPES */}
            <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-[#0b101c] via-[#080d16] to-transparent border-t border-cyan-500/20">
              {/* Floor Steel Plates Texture */}
              <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,#334155_0,#334155_2px,transparent_2px,transparent_16px)]" />

              {/* Runway Guidance LED Lines leading to blast door */}
              <div className="w-full h-full flex justify-center items-end pb-3 gap-16 opacity-60">
                <div className="w-1 h-28 bg-cyan-400/60 shadow-[0_0_12px_#06b6d4]" />
                <div className="w-1 h-28 bg-cyan-400/60 shadow-[0_0_12px_#06b6d4]" />
              </div>
            </div>

            {/* 3. FLANKING INTERIOR BULKHEAD WALLS */}
            {/* Left Exposed Wall */}
            <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-[#0d1424] to-[#070b14] border-r-2 border-cyan-500/20 flex flex-col justify-around py-12 px-2 opacity-80">
              <div className="h-20 border-y border-white/10 flex flex-col justify-center items-center">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4] mb-1" />
                <span className="font-mono text-[7px] text-cyan-300 rotate-90 uppercase tracking-widest">
                  O2 VENT
                </span>
              </div>
              <div className="h-20 border-y border-white/10 flex flex-col justify-center items-center">
                <span className="font-mono text-[7px] text-gray-400 rotate-90 uppercase tracking-widest">
                  SEC-A1
                </span>
              </div>
            </div>

            {/* Right Exposed Wall (Behind the physical hardware locks) */}
            <div className="absolute top-0 bottom-0 right-0 w-48 sm:w-60 bg-gradient-to-l from-[#0f172a] via-[#0b1120] to-transparent border-l border-white/10" />

          </div>

          {/* =================================================================== */}
          {/* THE BLAST DOOR STAGE (MAX 75% WIDTH, 85% HEIGHT, SET IN WALL FRAME) */}
          {/* =================================================================== */}
          <div className="flex-1 flex items-center justify-center p-3 sm:p-6 min-h-0 relative z-10">

            <div className="w-full max-w-4xl h-full max-h-[520px] flex items-center justify-center relative">

              {/* HEAVY STRUCTURAL WALL FRAME WITH AIRLOCK PORTAL */}
              <div
                className={`w-[75%] max-w-[620px] h-[85%] max-h-[460px] rounded-3xl relative overflow-hidden flex flex-col border-[6px] transition-all duration-700 shadow-2xl ${
                  isDoorOpen
                    ? 'border-emerald-500 shadow-[0_0_55px_rgba(34,197,94,0.7)]'
                    : 'border-red-600 shadow-[0_0_40px_rgba(239,68,68,0.75)] animate-pulse'
                }`}
              >

                {/* THE LED MARQUEE: Physically bolted directly above blast door */}
                <div className="h-11 bg-black border-b-2 border-white/30 flex items-center overflow-hidden relative shrink-0">
                  <div className="absolute inset-0 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:4px_4px] opacity-15 pointer-events-none" />

                  {isDoorOpen ? (
                    <div className="w-full flex items-center justify-center gap-2 text-emerald-400 font-mono font-black text-xs sm:text-sm tracking-widest uppercase drop-shadow-[0_0_12px_rgba(34,197,94,0.9)] animate-in fade-in duration-300">
                      <CheckCircle2 size={16} />
                      <span>ACCESS GRANTED // ID VERIFIED // LOCKDOWN CLEARED</span>
                    </div>
                  ) : (
                    <div className="flex whitespace-nowrap animate-marquee">
                      <span className="text-red-500 font-mono font-black text-xs sm:text-sm tracking-widest uppercase drop-shadow-[0_0_10px_rgba(239,68,68,0.9)] px-4">
                        ERROR! INTRUDER ALERT // MECHANICAL LOCKDOWN ACTIVE // INSERT FORGED DIGITAL ID TO OVERRIDE AIRLOCK //
                      </span>
                      <span className="text-red-500 font-mono font-black text-xs sm:text-sm tracking-widest uppercase drop-shadow-[0_0_10px_rgba(239,68,68,0.9)] px-4">
                        ERROR! INTRUDER ALERT // MECHANICAL LOCKDOWN ACTIVE // INSERT FORGED DIGITAL ID TO OVERRIDE AIRLOCK //
                      </span>
                    </div>
                  )}
                </div>

                {/* AIRLOCK DOOR CONTAINER & INNER CORRIDOR */}
                <div className="flex-1 relative flex overflow-hidden bg-[#040812]">

                  {/* Station Deep Interior Corridor (Revealed when blast doors slide open!) */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#0b172a] via-[#060d18] to-[#02050a] flex flex-col items-center justify-center overflow-hidden">
                    <div className="w-48 h-60 border-2 border-cyan-400/50 rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.4)]">
                      <div className="w-32 h-44 border border-cyan-300/60 rounded-xl flex items-center justify-center text-center p-2">
                        <div>
                          <Sparkles size={28} className="text-cyan-300 mx-auto animate-bounce mb-1" />
                          <div className="font-display font-black text-xs text-white uppercase tracking-wider">
                            STATION ACCESS
                          </div>
                          <div className="font-mono text-[9px] text-cyan-300 mt-1">
                            OVERRIDE SUCCESS
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LEFT SLIDING BLAST DOOR HALF */}
                  <div
                    style={{
                      transform: isDoorOpen ? 'translateX(-100%)' : 'translateX(0%)',
                      transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    className="w-1/2 h-full bg-gradient-to-r from-[#172033] via-[#243048] to-[#141b2a] border-r-2 border-black flex flex-col justify-between p-3 relative z-10 shadow-2xl"
                  >
                    {/* Heavy Steel Reinforcements & Hazard Lines */}
                    <div className="h-6 w-full bg-[repeating-linear-gradient(45deg,#eab308_0,#eab308_10px,#1e293b_10px,#1e293b_20px)] rounded opacity-75 shadow-inner" />
                    <div className="border border-white/10 rounded-xl p-2.5 text-center bg-black/60 shadow-inner">
                      <div className="font-mono font-black text-[10px] text-gray-300 uppercase tracking-widest">
                        BLAST DOOR // SECTOR 1
                      </div>
                    </div>
                    <div className="h-6 w-full bg-[repeating-linear-gradient(45deg,#eab308_0,#eab308_10px,#1e293b_10px,#1e293b_20px)] rounded opacity-75 shadow-inner" />
                  </div>

                  {/* RIGHT SLIDING BLAST DOOR HALF */}
                  <div
                    style={{
                      transform: isDoorOpen ? 'translateX(100%)' : 'translateX(0%)',
                      transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    className="w-1/2 h-full bg-gradient-to-l from-[#172033] via-[#243048] to-[#141b2a] border-l-2 border-black flex flex-col justify-between p-3 relative z-10 shadow-2xl"
                  >
                    {/* Heavy Steel Reinforcements & Hazard Lines */}
                    <div className="h-6 w-full bg-[repeating-linear-gradient(-45deg,#eab308_0,#eab308_10px,#1e293b_10px,#1e293b_20px)] rounded opacity-75 shadow-inner" />
                    <div className="border border-white/10 rounded-xl p-2.5 text-center bg-black/60 shadow-inner">
                      <div className="font-mono font-black text-[10px] text-gray-300 uppercase tracking-widest">
                        BLAST DOOR // SECTOR 2
                      </div>
                    </div>
                    <div className="h-6 w-full bg-[repeating-linear-gradient(-45deg,#eab308_0,#eab308_10px,#1e293b_10px,#1e293b_20px)] rounded opacity-75 shadow-inner" />
                  </div>

                </div>

              </div>

              {/* =============================================================== */}
              {/* THE 3 PHYSICAL HARDWARE LOCKS (MOUNTED TO RIGHT EXPOSED WALL) */}
              {/* =============================================================== */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-3.5 z-20 w-44 sm:w-56">

                {/* 1. TOP HARDWARE: PHYSICAL BIOMETRIC TEXT SCANNER (STRING) */}
                <div
                  className={`p-2.5 rounded-2xl border-2 transition-all relative shadow-2xl flex items-center justify-between ${
                    hardwareLocks[0].disengaged
                      ? 'bg-[#064e3b]/90 border-emerald-400 shadow-[0_0_20px_#10b981]'
                      : hardwareLocks[0].status === 'failed'
                      ? 'bg-[#4c0519]/90 border-red-500 shadow-[0_0_20px_#ef4444] animate-bounce'
                      : activeProjectionIndex === 0
                      ? 'bg-[#164e63]/90 border-cyan-400 shadow-[0_0_25px_#06b6d4]'
                      : 'bg-[#131b2e]/95 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {/* Physical Steel Deadbolt Bolt extending into door seam */}
                  <div
                    style={{
                      transform: hardwareLocks[0].disengaged ? 'translateX(28px)' : 'translateX(0px)',
                      transition: 'transform 0.5s ease-out',
                    }}
                    className={`absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-5 rounded-l-md border-y-2 border-l-2 ${
                      hardwareLocks[0].disengaged
                        ? 'bg-emerald-500 border-emerald-300'
                        : 'bg-[#475569] border-[#94a3b8]'
                    }`}
                    title="Heavy Steel Deadbolt"
                  />

                  <div className="flex-1 pr-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-black text-[9px] text-indigo-300 uppercase tracking-widest flex items-center gap-1">
                        <TypeIcon size={12} />
                        STRING LOCK
                      </span>
                      {/* Diode Lamp */}
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          hardwareLocks[0].disengaged
                            ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                            : 'bg-red-500 shadow-[0_0_6px_#ef4444]'
                        }`}
                      />
                    </div>

                    {/* Optical Scan Slit */}
                    <div className="h-6 px-2 rounded-lg bg-black/80 border border-indigo-400/40 flex items-center overflow-hidden">
                      <span className="font-mono text-[10px] text-indigo-200 truncate">
                        {hardwareLocks[0].displayValue || '[ OPTICAL SCANNER ]'}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center">
                    {hardwareLocks[0].disengaged ? (
                      <Unlock size={16} className="text-emerald-300" />
                    ) : (
                      <Lock size={16} className="text-gray-400" />
                    )}
                  </div>
                </div>

                {/* 2. MIDDLE HARDWARE: HEAVY NUMERIC PINPAD (INT) */}
                <div
                  className={`p-2.5 rounded-2xl border-2 transition-all relative shadow-2xl flex items-center justify-between ${
                    hardwareLocks[1].disengaged
                      ? 'bg-[#064e3b]/90 border-emerald-400 shadow-[0_0_20px_#10b981]'
                      : hardwareLocks[1].status === 'failed'
                      ? 'bg-[#4c0519]/90 border-red-500 shadow-[0_0_20px_#ef4444] animate-bounce'
                      : activeProjectionIndex === 1
                      ? 'bg-[#164e63]/90 border-cyan-400 shadow-[0_0_25px_#06b6d4]'
                      : 'bg-[#131b2e]/95 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {/* Physical Steel Deadbolt Bolt extending into door seam */}
                  <div
                    style={{
                      transform: hardwareLocks[1].disengaged ? 'translateX(28px)' : 'translateX(0px)',
                      transition: 'transform 0.5s ease-out',
                    }}
                    className={`absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-5 rounded-l-md border-y-2 border-l-2 ${
                      hardwareLocks[1].disengaged
                        ? 'bg-emerald-500 border-emerald-300'
                        : 'bg-[#475569] border-[#94a3b8]'
                    }`}
                    title="Heavy Steel Deadbolt"
                  />

                  <div className="flex-1 pr-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-black text-[9px] text-emerald-300 uppercase tracking-widest flex items-center gap-1">
                        <Hash size={12} />
                        PIN LOCK
                      </span>
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          hardwareLocks[1].disengaged
                            ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                            : 'bg-red-500 shadow-[0_0_6px_#ef4444]'
                        }`}
                      />
                    </div>

                    {/* Numeric Keypad LED Segment Readout */}
                    <div className="h-6 px-2 rounded-lg bg-black/80 border border-emerald-400/40 flex items-center justify-between">
                      <span className="font-mono font-bold text-[10px] text-emerald-300 tracking-wider">
                        {hardwareLocks[1].displayValue || 'PIN: ----'}
                      </span>
                      <div className="flex gap-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/50" />
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/50" />
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center">
                    {hardwareLocks[1].disengaged ? (
                      <Unlock size={16} className="text-emerald-300" />
                    ) : (
                      <Lock size={16} className="text-gray-400" />
                    )}
                  </div>
                </div>

                {/* 3. BOTTOM HARDWARE: MANUAL OVERRIDE BREAKER / LEVER (BOOLEAN) */}
                <div
                  className={`p-2.5 rounded-2xl border-2 transition-all relative shadow-2xl flex items-center justify-between ${
                    hardwareLocks[2].disengaged
                      ? 'bg-[#064e3b]/90 border-emerald-400 shadow-[0_0_20px_#10b981]'
                      : hardwareLocks[2].status === 'failed'
                      ? 'bg-[#4c0519]/90 border-red-500 shadow-[0_0_20px_#ef4444] animate-bounce'
                      : activeProjectionIndex === 2
                      ? 'bg-[#164e63]/90 border-cyan-400 shadow-[0_0_25px_#06b6d4]'
                      : 'bg-[#131b2e]/95 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {/* Physical Steel Deadbolt Bolt extending into door seam */}
                  <div
                    style={{
                      transform: hardwareLocks[2].disengaged ? 'translateX(28px)' : 'translateX(0px)',
                      transition: 'transform 0.5s ease-out',
                    }}
                    className={`absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-5 rounded-l-md border-y-2 border-l-2 ${
                      hardwareLocks[2].disengaged
                        ? 'bg-emerald-500 border-emerald-300'
                        : 'bg-[#475569] border-[#94a3b8]'
                    }`}
                    title="Heavy Steel Deadbolt"
                  />

                  <div className="flex-1 pr-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-black text-[9px] text-amber-300 uppercase tracking-widest flex items-center gap-1">
                        <ToggleRight size={12} />
                        BOOLEAN LOCK
                      </span>
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          hardwareLocks[2].disengaged
                            ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                            : 'bg-red-500 shadow-[0_0_6px_#ef4444]'
                        }`}
                      />
                    </div>

                    {/* Mechanical Toggle Position Indicator */}
                    <div className="h-6 px-2 rounded-lg bg-black/80 border border-amber-400/40 flex items-center justify-between">
                      <span className="font-mono font-bold text-[10px] text-amber-300">
                        {hardwareLocks[2].displayValue || 'LEVER: FALSE'}
                      </span>
                      {/* Industrial Breaker Arm */}
                      <div className="flex items-center">
                        {hardwareLocks[2].disengaged ? (
                          <div className="w-5 h-3 bg-emerald-500 rounded-sm shadow-[0_0_8px_#10b981]" />
                        ) : (
                          <div className="w-5 h-3 bg-red-600 rounded-sm shadow-[0_0_6px_#ef4444]" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center">
                    {hardwareLocks[2].disengaged ? (
                      <Unlock size={16} className="text-emerald-300" />
                    ) : (
                      <Lock size={16} className="text-gray-400" />
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* =================================================================== */}
          {/* THE CLIPBOARD UI (BOTTOM-LEFT HINT SYSTEM) */}
          {/* =================================================================== */}
          <div className="absolute bottom-4 left-4 z-30">
            <button
              onClick={() => setIsClipboardOpen(prev => !prev)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer shadow-xl flex items-center gap-2 ${
                failCount >= 3
                  ? 'bg-amber-500 text-black border-amber-300 animate-bounce shadow-[0_0_25px_rgba(245,158,11,0.9)] ring-2 ring-amber-300'
                  : isClipboardOpen
                  ? 'bg-[#ff912d] text-black border-[#ffc107]'
                  : 'bg-[#1b0830] hover:bg-[#2b104c] text-amber-300 border-amber-500/40 hover:border-amber-400'
              }`}
              title="Open Security Bypass Clipboard"
            >
              <ClipboardList size={20} className={failCount >= 3 ? 'animate-spin' : ''} />
              <span className="font-display font-black text-xs uppercase tracking-wider hidden sm:inline">
                Security Codes
              </span>
            </button>

            {/* Clipboard Note Pop-up */}
            {isClipboardOpen && (
              <div className="absolute bottom-16 left-0 w-80 sm:w-88 bg-[#18072e]/98 backdrop-blur-md border-2 border-amber-400/60 rounded-3xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 text-left">
                <div className="flex items-center justify-between border-b border-amber-400/30 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <ClipboardList size={16} className="text-amber-400" />
                    <span className="font-display font-black text-xs text-white uppercase tracking-wider">
                      Security Bypass Codes
                    </span>
                  </div>
                  <button
                    onClick={() => setIsClipboardOpen(false)}
                    className="w-7 h-7 rounded-full bg-black/70 hover:bg-rose-600 border border-white/40 hover:border-rose-400 text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer group"
                    title="Close"
                    aria-label="Close Security Codes"
                  >
                    <X size={16} className="text-white group-hover:scale-110 transition-transform stroke-[2.5]" />
                  </button>
                </div>

                <div className="flex flex-col gap-2.5">
                  <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                    <div className="text-[10px] font-mono text-indigo-300 uppercase">String Password</div>
                    <div className="font-mono font-bold text-sm text-white">&quot;JupiterSecurity&quot;</div>
                    <div className="text-[10px] text-gray-300 mt-0.5">Use double quotes for text words!</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                    <div className="text-[10px] font-mono text-emerald-300 uppercase">int PIN Code</div>
                    <div className="font-mono font-bold text-sm text-white">1234</div>
                    <div className="text-[10px] text-gray-300 mt-0.5">Whole number without any quotes!</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30">
                    <div className="text-[10px] font-mono text-amber-300 uppercase">boolean Switch</div>
                    <div className="font-mono font-bold text-sm text-white">true</div>
                    <div className="text-[10px] text-gray-300 mt-0.5">Set the toggle switch to true!</div>
                  </div>
                </div>

                <div className="mt-3 text-[10px] font-sans text-amber-200/90 leading-tight">
                  Hint: Any creative variable name works (like <code>banana</code> or <code>password</code>). Just make sure the data types and passwords match!
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ======================================================================= */}
      {/* 3. KID-FRIENDLY NPC (NOVA) CUSTOM MODAL / TOAST NOTIFICATION */}
      {/* ======================================================================= */}
      {novaModal.isOpen && (
        <div className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#18072c] border-2 border-orange-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl relative flex flex-col gap-4">

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-400/40 p-1 flex items-center justify-center shadow-inner shrink-0">
                <img src={NOVA_AVATAR} alt="Nova" className="w-full h-full object-contain" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-black text-base text-white tracking-wide">
                    {novaModal.title}
                  </h4>
                  <button
                    onClick={() => setNovaModal(prev => ({ ...prev, isOpen: false }))}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="text-xs font-mono text-orange-400 mt-0.5 uppercase tracking-wider">
                  Station Assistant Telemetry
                </p>
              </div>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-sans text-gray-200 leading-relaxed">
              {novaModal.message}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setNovaModal(prev => ({ ...prev, isOpen: false }))}
                className="px-5 py-2 rounded-xl bg-[#ff912d] hover:bg-[#ffa149] text-black font-display font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md"
              >
                Got It, Nova!
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 4. PAUSE / LEAVE GAME MODAL */}
      {/* ======================================================================= */}
      {isPauseOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#19082a] border border-white/20 rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 text-center">
            <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
              Simulation Paused
            </h3>
            <p className="text-xs font-sans text-gray-300">
              The station airlock is waiting for your forged Blockly variables.
            </p>

            <div className="flex flex-col gap-2.5 mt-2">
              <button
                onClick={() => setIsPauseOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#ff912d] text-black font-display font-black text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Resume Mission
              </button>

              <button
                onClick={handleRestart}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs font-bold transition cursor-pointer"
              >
                Restart Level
              </button>

              <button
                onClick={() => {
                  setIsPauseOpen(false);
                  router.push('/modules/jupiter');
                }}
                className="w-full py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-200 font-mono text-xs font-bold transition cursor-pointer"
              >
                Exit to Modules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 5. VICTORY CELEBRATION MODAL ("PROCEED" UI) */}
      {/* ======================================================================= */}
      {showVictoryModal && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#18072c] border-2 border-emerald-500/60 rounded-[28px] p-6 sm:p-7 max-w-xl w-full shadow-2xl relative flex flex-col gap-5 text-center">

            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3 text-left">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center shadow-inner">
                  <Unlock size={24} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                    <Sparkles size={11} className="text-emerald-400" /> Physical Deadbolts Retracted!
                  </div>
                  <h2 className="text-lg sm:text-2xl font-display font-black text-white uppercase tracking-wide leading-tight">
                    Level 1: Unlock the Gate Cleared!
                  </h2>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-gray-400">
                Attempts: {attemptCount}
              </span>
            </div>

            <div className="flex flex-col gap-2 text-left bg-black/40 rounded-2xl p-3.5 border border-white/10">
              <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider mb-1">
                Completed Objectives:
              </span>
              {objectives.map((obj) => (
                <div key={obj.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 size={15} />
                    <span>{obj.title}</span>
                  </div>
                  <span className="font-mono font-bold text-[#ff912d]">
                    +{obj.xpReward} XP
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
              <span className="font-mono text-xs text-emerald-200">
                Total Mission Rewards:
              </span>
              <span className="font-mono font-black text-emerald-400 text-sm">
                +{(XP_REWARDS.SECTION_COMPLETION_BONUS || 150) + (3 * (XP_REWARDS.CAMPAIGN_GOAL || 20))} XP
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleRestart}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs font-bold transition cursor-pointer"
              >
                Replay Level
              </button>

              <button
                onClick={() => router.push('/modules/jupiter')}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-display font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg flex items-center justify-center gap-2"
              >
                <span>Proceed to Modules</span>
                <ArrowRight size={16} />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
