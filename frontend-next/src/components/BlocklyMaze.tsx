"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import * as En from 'blockly/msg/en';
import { javascriptGenerator } from 'blockly/javascript';
import '@/lib/customblocks';
import { Play, RotateCcw, ChevronRight, Rocket, ArrowLeft, Zap, Settings } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

Blockly.setLocale(En as any);

const INITIAL_STATES = [
  { x: 1, y: 1, direction: 1 }, // Level 1
  { x: 1, y: 1, direction: 2 }, // Level 2
];

const MAZES = [
  // Level 1
  [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 0, 0, 1, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 3, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ],
  // Level 2
  [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 1, 0, 0, 0, 3, 1],
    [1, 0, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ]
];

const toolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Movement',
      colour: '230',
      contents: [
        { kind: 'block', type: 'move_forward' },
        { kind: 'block', type: 'turn_left' },
        { kind: 'block', type: 'turn_right' },
      ],
    },
    {
      kind: 'category',
      name: 'Logic',
      colour: '210',
      contents: [
        { kind: 'block', type: 'repeat_until_goal' },
        { kind: 'block', type: 'repeat_x_times' },
        { kind: 'block', type: 'if_path_ahead' },
      ],
    }
  ],
};

export default function BlocklyMaze() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const missionId = searchParams.get('missionId');

  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);
  
  const [currentLevel, setCurrentLevel] = useState(0);
  const [charState, setCharState] = useState(INITIAL_STATES[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const [rewards, setRewards] = useState<{ xpEarned: number; gearsEarned: number } | null>(null);
  const [apiSaving, setApiSaving] = useState(false);

  // Refs for tracking synchronous execution state during async evaluation
  const execState = useRef({ ...INITIAL_STATES[0] });
  const hitWall = useRef(false);
  const isGoal = useRef(false);

  const triggerMissionCompletion = async (codeStr: string) => {
    if (!missionId) return;
    setApiSaving(true);
    setRewards(null);
    try {
      const response = await fetch('/api/missions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId, submittedCode: codeStr })
      });
      const data = await response.json();
      if (data.success) {
        setRewards({ xpEarned: data.xpEarned, gearsEarned: data.gearsEarned });
      }
    } catch (error) {
      console.error("Failed to save progress:", error);
    } finally {
      setApiSaving(false);
    }
  };

  useEffect(() => {
    if (blocklyDiv.current && !workspace.current) {
      const netStartTheme = Blockly.Theme.defineTheme('netstart', {
        name: 'netstart',
        base: Blockly.Themes.Classic,
        componentStyles: {
          workspaceBackgroundColour: '#1e0a2d',
          toolboxBackgroundColour: '#270d3c',
          toolboxForegroundColour: '#ffffff',
          flyoutBackgroundColour: '#361d57',
          flyoutForegroundColour: '#ffffff',
          flyoutOpacity: 1,
          scrollbarColour: '#ff912d',
          insertionMarkerColour: '#fff',
          insertionMarkerOpacity: 0.3,
          scrollbarOpacity: 0.4,
          cursorColour: '#d0d0d0',
        }
      });

      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolbox,
        scrollbars: true,
        trashcan: true,
        theme: netStartTheme,
      });
    }
  }, []);

  useEffect(() => {
    if (!missionId) return;

    const startMission = async () => {
      try {
        await fetch('/api/missions/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ missionId })
        });
      } catch (error) {
        console.error("Failed to start/resume mission:", error);
      }
    };

    startMission();
  }, [missionId]);

  const loadLevel = (levelIndex: number) => {
    setCurrentLevel(levelIndex);
    setCharState(INITIAL_STATES[levelIndex]);
    setIsRunning(false);
    setMessage('');
    setShowPopup(false);
    setGeneratedCode('');
    if (workspace.current) {
      workspace.current.clear();
    }
  };

  const resetGame = () => {
    setCharState(INITIAL_STATES[currentLevel]);
    setIsRunning(false);
    setMessage('');
    setShowPopup(false);
    setGeneratedCode('');
  };

  const runCode = async () => {
    if (isRunning) return;
    
    // Reset state for execution
    const startState = INITIAL_STATES[currentLevel];
    setCharState(startState);
    execState.current = { ...startState };
    hitWall.current = false;
    isGoal.current = false;
    
    setIsRunning(true);
    setMessage('Running...');

    const code = javascriptGenerator.workspaceToCode(workspace.current!);
    const maze = MAZES[currentLevel];

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    const checkGameStatus = async () => {
      await delay(10);
      if (hitWall.current) throw new Error("Hit Wall");
    };

    const moveForward = async () => {
      if (hitWall.current || isGoal.current) return;
      
      let nextX = execState.current.x;
      let nextY = execState.current.y;
      const dir = execState.current.direction;
      
      if (dir === 0) nextY -= 1;
      else if (dir === 1) nextX += 1;
      else if (dir === 2) nextY += 1;
      else if (dir === 3) nextX -= 1;

      if (maze[nextY] && maze[nextY][nextX] !== 1) {
        execState.current.x = nextX;
        execState.current.y = nextY;
        setCharState({ ...execState.current });
        
        if (maze[nextY][nextX] === 3) {
          isGoal.current = true;
        }
        await delay(400); // Animation delay
      } else {
        hitWall.current = true;
        setMessage('Ouch! Hit a wall.');
        throw new Error("Hit Wall");
      }
    };

    const turnLeft = async () => {
      if (hitWall.current || isGoal.current) return;
      execState.current.direction = (execState.current.direction + 3) % 4;
      setCharState({ ...execState.current });
      await delay(400);
    };

    const turnRight = async () => {
      if (hitWall.current || isGoal.current) return;
      execState.current.direction = (execState.current.direction + 1) % 4;
      setCharState({ ...execState.current });
      await delay(400);
    };

    const isPathAhead = () => {
      let nextX = execState.current.x;
      let nextY = execState.current.y;
      const dir = execState.current.direction;
      
      if (dir === 0) nextY -= 1;
      else if (dir === 1) nextX += 1;
      else if (dir === 2) nextY += 1;
      else if (dir === 3) nextX -= 1;
      
      return maze[nextY] && maze[nextY][nextX] !== 1;
    };

    const isAtGoal = () => {
      return isGoal.current;
    };

    try {
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const executeFn = new AsyncFunction('moveForward', 'turnLeft', 'turnRight', 'isPathAhead', 'isAtGoal', 'checkGameStatus', code);
      
      await executeFn(moveForward, turnLeft, turnRight, isPathAhead, isAtGoal, checkGameStatus);
      
      if (isGoal.current) {
        setMessage('Goal Reached! You Win!');
        setGeneratedCode(code);
        setShowPopup(true);
        triggerMissionCompletion(code);
      } else {
        setMessage('Finished execution. Goal not reached.');
      }
    } catch (e: any) {
      if (e.message !== "Hit Wall") {
        setMessage('Error in code logic: ' + e.message);
      }
    }
    
    setIsRunning(false);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-main">
      {/* Top Navbar for the Game */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#1e0a2d] border-b border-white/10 shadow-lg shrink-0">
        <div className="flex items-center gap-4">
          <Link 
            href={missionId ? `/modules/${missionId.split('-')[0]}` : "/modules"} 
            className="flex items-center gap-2 font-mono text-white/80 hover:text-[#ff912d] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-px h-6 bg-white/20"></div>
          <h1 className="text-white font-display text-xl md:text-2xl font-bold">
            {missionId 
              ? `Lab: ${missionId.toUpperCase().replace('-', ' Level ')}` 
              : 'Maze Explorer'
            }
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-[#ff912d] font-sans font-bold uppercase tracking-widest text-sm">
            Level {currentLevel + 1}
          </span>
          <div className="flex items-center gap-3">
            <button 
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center justify-center gap-2 bg-buttons text-white font-sans font-bold py-2 px-5 rounded-full shadow-[4px_4px_0_#150524] hover:shadow-[6px_6px_0_#150524] hover:-translate-y-1 hover:-translate-x-1 transition-all active:translate-y-1 active:translate-x-1 active:shadow-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_#150524]"
            >
              <Play className="w-4 h-4 fill-white" />
              Run Code
            </button>
            <button 
              onClick={resetGame}
              disabled={isRunning}
              className="flex items-center justify-center gap-2 bg-[#361d57] border border-white/10 text-white font-sans font-bold py-2 px-5 rounded-full hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Blockly Workspace */}
        <div className="w-full lg:w-1/2 h-1/2 lg:h-full relative border-b lg:border-b-0 lg:border-r border-white/10 bg-white">
          <div ref={blocklyDiv} className="absolute inset-0" />
        </div>

        {/* Game Area */}
        <div className="w-full lg:w-1/2 h-1/2 lg:h-full bg-subs flex flex-col items-center justify-center relative p-8">
          
          {message && (
            <div className={`absolute top-6 px-6 py-3 rounded-lg font-sans font-bold shadow-lg z-20 ${message.includes('Win') ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
              {message}
            </div>
          )}

          <div 
            className="relative bg-[#1e0a2d] border-[6px] border-[#361d57] rounded-xl overflow-hidden shadow-[8px_8px_0_#150524]"
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(8, 44px)', 
              gridTemplateRows: 'repeat(8, 44px)',
              gap: '2px',
              padding: '2px',
              backgroundColor: '#150524'
            }}
          >
            {MAZES[currentLevel].map((row, y) => (
              row.map((cell, x) => {
                let cellColor = '#270d3c'; // Path
                if (cell === 1) cellColor = '#361d57'; // Wall
                else if (cell === 2) cellColor = '#10b981'; // Start (Emerald)
                else if (cell === 3) cellColor = '#ef4444'; // Goal (Red)

                return (
                  <div 
                    key={`${x}-${y}`} 
                    style={{ width: '44px', height: '44px', backgroundColor: cellColor, borderRadius: '4px' }} 
                  />
                );
              })
            ))}

            {/* Character Overlay */}
            <div 
              className="absolute top-[2px] left-[2px] w-[44px] h-[44px] flex items-center justify-center transition-transform duration-300 ease-in-out z-10"
              style={{
                transform: `translate(${charState.x * 46}px, ${charState.y * 46}px)`,
              }}
            >
              <div 
                className="w-[36px] h-[36px] bg-[#ff912d] rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 ease-in-out"
                style={{
                  transform: `rotate(${charState.direction * 90}deg)`,
                }}
              >
                <Rocket className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-[#1e0a2d] border border-white/20 rounded-2xl w-full max-w-lg p-8 shadow-[0_0_50px_rgba(255,145,45,0.15)] animate-in zoom-in-95 duration-200">
            <h2 className="text-3xl font-display font-bold text-white mb-2">
              {missionId ? 'Mission Successful!' : `Level ${currentLevel + 1} Complete!`}
            </h2>
            <p className="text-white/70 font-sans mb-6">Excellent job! Here is the asynchronous JavaScript code you generated:</p>
            
            <div className="bg-black/50 p-4 rounded-xl border border-white/10 mb-6 overflow-auto max-h-[180px]">
              <pre className="text-[#ff912d] font-mono text-sm leading-relaxed">
                <code>{generatedCode}</code>
              </pre>
            </div>

            {/* Rewards Summary Overlay */}
            {missionId && (
              <div className="bg-[#ff912d]/5 border border-[#ff912d]/20 rounded-2xl p-4 mb-6 flex flex-col gap-2">
                <span className="text-xs font-black uppercase text-[#ff912d] font-display">Mission Rewards</span>
                <div className="flex gap-6 items-center">
                  {apiSaving ? (
                    <span className="text-xs text-gray-400 font-mono animate-pulse">Syncing rewards to database...</span>
                  ) : rewards ? (
                    <>
                      <span className="flex items-center gap-1 text-sm font-bold font-mono text-white">
                        <Zap size={14} className="text-yellow-400" /> +{rewards.xpEarned} XP
                      </span>
                      <span className="flex items-center gap-1 text-sm font-bold font-mono text-white">
                        <Settings size={14} className="text-[#a855f7]" /> +{rewards.gearsEarned} Gears
                      </span>
                      {rewards.xpEarned === 0 && (
                        <span className="text-[10px] text-gray-400 font-sans italic ml-auto">
                          (Already completed)
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-red-400 font-mono">Failed to award rewards</span>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => {
                  setShowPopup(false);
                  if (missionId) {
                    const baseMod = missionId.split('-')[0];
                    router.push(`/modules/${baseMod}`);
                  }
                }}
                className="px-6 py-3 rounded-full font-sans font-bold text-white hover:bg-white/10 transition-colors cursor-pointer text-sm"
              >
                {missionId ? 'Return to List' : 'Close'}
              </button>

              {missionId ? (
                <button 
                  onClick={() => {
                    setShowPopup(false);
                    router.push('/modules');
                  }}
                  className="flex items-center gap-2 bg-[#ff912d] hover:bg-orange-400 text-black font-sans font-extrabold py-3 px-6 rounded-full shadow-lg shadow-[#ff912d]/10 active:scale-95 transition-all cursor-pointer text-sm"
                >
                  <Rocket size={16} />
                  Return to Sector Map
                </button>
              ) : currentLevel < MAZES.length - 1 ? (
                <button 
                  onClick={() => loadLevel(currentLevel + 1)}
                  className="flex items-center gap-2 bg-buttons text-white font-sans font-bold py-3 px-6 rounded-full shadow-[4px_4px_0_#150524] hover:shadow-[6px_6px_0_#150524] hover:-translate-y-1 hover:-translate-x-1 transition-all active:translate-y-1 active:translate-x-1 active:shadow-none cursor-pointer"
                >
                  Next Level <ChevronRight className="w-4 h-4" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
