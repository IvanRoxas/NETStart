"use client";

import React from 'react';
import { Wind, Fan, Target } from 'lucide-react';

// =============================================================================
// PHASE 1: 8x8 HAZARD LABYRINTH MATRIX & COMPONENT
// =============================================================================

export interface OxygenPlayerState {
  x: number; // Column (0 to 7)
  y: number; // Row (0 to 7)
  direction: number; // 0: North/Up, 1: East/Right, 2: South/Down, 3: West/Left
}

// 7x7 Cross Layout with 3 Fans and Wall at 1st row, 4th column (Row 0, Col 3)
export const INITIAL_OXYGEN_GRID = [
  [0, 0, 1, 0, 1, 0, 0], // Row 1 / idx 0 (Wall at Column 4 / idx 3)
  [1, 1, 1, 1, 1, 1, 1], // Row 2 / idx 1 (Full Open Street)
  [1, 0, 1, 0, 1, 0, 3], // Row 3 / idx 2 (Fan 3 at Col 7 / idx 6, directly above Goal)
  [1, 1, 1, 3, 1, 1, 4], // Row 4 / idx 3 (Start at (0,3), Fan 1 at (3,3), Goal at (6,3))
  [1, 0, 1, 0, 1, 0, 1], // Row 5 / idx 4
  [1, 1, 1, 1, 3, 1, 1], // Row 6 / idx 5 (Fan 2 at (4,5))
  [0, 0, 1, 0, 1, 0, 0], // Row 7 / idx 6
];

export interface OxygenMazeProps {
  grid?: number[][];
  playerState?: OxygenPlayerState;
  isBumping?: boolean;
  isFailed?: boolean;
  isSuccess?: boolean;
  failCoords?: { x: number; y: number } | null;
}

export const OxygenMaze: React.FC<OxygenMazeProps> = ({
  grid = INITIAL_OXYGEN_GRID,
  playerState = { x: 0, y: 3, direction: 1 },
  isBumping = false,
  isFailed = false,
  isSuccess = false,
  failCoords = null,
}) => {
  const getRotationClass = (dir: number) => {
    switch (dir) {
      case 0: return '-rotate-90'; // Up / North
      case 1: return 'rotate-0';   // Right / East
      case 2: return 'rotate-90';  // Down / South
      case 3: return 'rotate-180'; // Left / West
      default: return 'rotate-0';
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-1 sm:p-2.5 overflow-hidden relative select-none">
      {/* 7x7 Cross Grid Maze Container */}
      <div 
        className="relative grid gap-1.5 sm:gap-2 p-2 sm:p-2.5 bg-[#090314] border-2 border-purple-900/60 rounded-2xl shadow-2xl shrink-0"
        style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(7, minmax(0, 1fr))',
          aspectRatio: '1 / 1',
          height: '100%',
          maxHeight: '100%',
          maxWidth: '100%',
          width: 'auto',
        }}
      >
        {grid.map((row, y) =>
          row.map((cellType, x) => {
            const isPlayerHere = playerState.x === x && playerState.y === y;
            const isFailedTile = failCoords && failCoords.x === x && failCoords.y === y;

            // 0 = WALL (Solid, Impassable Dark Metallic Bulkhead)
            if (cellType === 0) {
              return (
                <div
                  key={`cell-${x}-${y}`}
                  className="w-full h-full aspect-square rounded-xl bg-[#05010a] border-2 border-purple-950/70 shadow-[inset_0_2px_4px_rgba(255,255,255,0.04),inset_0_-2px_6px_rgba(0,0,0,0.9)] flex items-center justify-center relative overflow-hidden"
                >
                  <div className="absolute inset-1 border border-purple-950/40 rounded-lg bg-[radial-gradient(#2e0854_1px,transparent_1px)] [background-size:6px_6px] opacity-30" />
                  <div className="w-2 h-2 rounded bg-purple-950/80 border border-purple-900/40" />
                </div>
              );
            }

            // 3 = FAN (Broken Fan Hazard in Red - Exactly 2 Fans in Grid)
            if (cellType === 3) {
              return (
                <div
                  key={`cell-${x}-${y}`}
                  className={`w-full h-full aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all duration-300 ${
                    isFailedTile || (isFailed && isPlayerHere)
                      ? 'border-2 border-rose-400 bg-rose-600/90 shadow-[0_0_28px_#f43f5e] animate-ping'
                      : 'border-2 border-rose-500/80 bg-rose-950/50 shadow-[inset_0_0_14px_rgba(244,63,94,0.3),0_0_12px_rgba(244,63,94,0.2)] hover:border-rose-400'
                  }`}
                >
                  <Fan className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400 animate-spin" style={{ animationDuration: '3s' }} />
                  <span className="text-[8px] sm:text-[9px] font-mono font-black text-rose-300 mt-0.5 tracking-wider">FAN</span>
                </div>
              );
            }

            // 4 = GOAL (Cabin Goal in Green at (6,3))
            if (cellType === 4) {
              return (
                <div
                  key={`cell-${x}-${y}`}
                  className={`w-full h-full aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all duration-300 ${
                    isSuccess || (isPlayerHere && isSuccess)
                      ? 'border-2 border-emerald-400 bg-emerald-500/40 shadow-[0_0_30px_#10b981] scale-105'
                      : 'border-2 border-emerald-500/80 bg-emerald-950/50 shadow-[0_0_18px_rgba(16,185,129,0.35),inset_0_0_12px_rgba(16,185,129,0.2)] hover:border-emerald-400'
                  }`}
                >
                  {isPlayerHere ? (
                    <div className={`transition-transform duration-300 ${getRotationClass(playerState.direction)}`}>
                      <Wind className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-200 drop-shadow-[0_0_12px_#10b981]" />
                    </div>
                  ) : (
                    <>
                      <Target className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 animate-pulse" />
                      <span className="text-[8px] sm:text-[9px] font-mono font-black text-emerald-300 mt-0.5 tracking-wider">CABIN</span>
                    </>
                  )}
                </div>
              );
            }

            // 5 = TRAIL (Glowing Cyan/Blue Visited Oxygen Path)
            if (cellType === 5) {
              return (
                <div
                  key={`cell-${x}-${y}`}
                  className="w-full h-full aspect-square rounded-xl border-2 border-cyan-400 bg-cyan-500/35 flex items-center justify-center relative shadow-[0_0_20px_rgba(6,182,212,0.7)] transition-all duration-300"
                >
                  {isPlayerHere ? (
                    <div className={`transition-transform duration-300 ${getRotationClass(playerState.direction)} ${isBumping ? 'animate-bounce' : ''}`}>
                      <Wind className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-100 drop-shadow-[0_0_14px_#06b6d4]" />
                    </div>
                  ) : (
                    <div className="relative flex items-center justify-center">
                      <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-cyan-300 shadow-[0_0_14px_#06b6d4] opacity-95 animate-pulse" />
                      <div className="absolute w-6 h-6 rounded-full bg-cyan-400/25 animate-ping" style={{ animationDuration: '2s' }} />
                    </div>
                  )}
                </div>
              );
            }

            // 1 = EMPTY (Distinct, Illuminated Futuristic Airflow Pathway)
            return (
              <div
                key={`cell-${x}-${y}`}
                className="w-full h-full aspect-square rounded-xl border border-cyan-500/40 bg-gradient-to-br from-[#1e0e3a] to-[#120726] shadow-[inset_0_0_12px_rgba(6,182,212,0.12),0_0_8px_rgba(168,85,247,0.06)] flex items-center justify-center relative transition-all duration-300 hover:border-cyan-400"
              >
                {isPlayerHere && (
                  <div className={`transition-transform duration-300 ${getRotationClass(playerState.direction)} ${isBumping ? 'animate-bounce' : ''}`}>
                    <Wind className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-300 drop-shadow-[0_0_14px_#06b6d4]" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// =============================================================================
// PHASE 3: BLOCKLY TOOLBOX CONFIGURATION FOR SECTION 1
// =============================================================================

export const oxygenMazeToolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Events',
      colour: '#EF4444',
      contents: [
        { kind: 'block', type: 'event_start' },
        { kind: 'block', type: 'event_end' },
      ],
    },
    {
      kind: 'category',
      name: 'Movement',
      colour: '#EAB308',
      contents: [
        { kind: 'block', type: 'move_forward' },
        { kind: 'block', type: 'turn_left' },
        { kind: 'block', type: 'turn_right' },
      ],
    },
    {
      kind: 'category',
      name: 'Loops',
      colour: '#8B5CF6',
      contents: [
        { kind: 'block', type: 'repeat_until_goal' },
      ],
    },
    {
      kind: 'category',
      name: 'Conditionals',
      colour: '#3B82F6',
      contents: [
        { kind: 'block', type: 'controls_ifelse' },
        { kind: 'block', type: 'controls_if' },
      ],
    },
    {
      kind: 'category',
      name: 'Sensors',
      colour: '#10B981',
      contents: [
        { kind: 'block', type: 'is_hazard_ahead' },
      ],
    },
  ],
};

// =============================================================================
// PHASE 4: MODULAR EXECUTION & RELATIVE SENSOR RUNNER
// =============================================================================

export interface OxygenExecutionCallbacks {
  onStep?: (pos: OxygenPlayerState, grid: number[][]) => void;
  onBump?: () => void;
  onHazardHit?: (hazardPos: { x: number; y: number }) => void;
  onSuccess?: () => void;
  highlightBlock?: (blockId: string | null) => Promise<void>;
  checkCancelled?: () => void;
}

export async function runOxygenMazeExecution(
  instrumentedCode: string,
  callbacks: OxygenExecutionCallbacks
): Promise<{ success: boolean; error?: string }> {
  // Fresh clone of the 8x8 ventilation grid
  const currentGrid = INITIAL_OXYGEN_GRID.map(row => [...row]);
  const player: OxygenPlayerState = { x: 0, y: 3, direction: 1 }; // Start at (0,3) facing East
  let reachedGoal = false;
  let isHalted = false;

  const delay = async (ms: number) => {
    const start = Date.now();
    while (Date.now() - start < ms) {
      if (callbacks.checkCancelled) callbacks.checkCancelled();
      await new Promise(res => setTimeout(res, 20));
    }
  };

  // Evaluates relative tile based on player's current heading
  const getRelativeTile = (offset: number): { tile: number; x: number; y: number } => {
    const dir = (player.direction + offset) % 4;
    let targetX = player.x;
    let targetY = player.y;

    if (dir === 0) targetY -= 1; // North
    else if (dir === 1) targetX += 1; // East
    else if (dir === 2) targetY += 1; // South
    else if (dir === 3) targetX -= 1; // West

    if (targetY < 0 || targetY >= currentGrid.length || targetX < 0 || targetX >= currentGrid[0].length) {
      return { tile: 0, x: targetX, y: targetY };
    }
    return { tile: currentGrid[targetY][targetX], x: targetX, y: targetY };
  };

  const isAtGoal = (): boolean => reachedGoal;

  const isHazardAhead = (): boolean => {
    const { tile } = getRelativeTile(0);
    return tile === 3;
  };

  const isHazardLeft = (): boolean => {
    const { tile } = getRelativeTile(3);
    return tile === 3;
  };

  const isHazardRight = (): boolean => {
    const { tile } = getRelativeTile(1);
    return tile === 3;
  };

  const isPathClearForward = (): boolean => {
    const { tile } = getRelativeTile(0);
    return tile === 2 || tile === 4 || tile === 5 || tile === 1;
  };

  const isPathClearLeft = (): boolean => {
    const { tile } = getRelativeTile(3);
    return tile === 2 || tile === 4 || tile === 5 || tile === 1;
  };

  const isPathClearRight = (): boolean => {
    const { tile } = getRelativeTile(1);
    return tile === 2 || tile === 4 || tile === 5 || tile === 1;
  };

  const isPathBlockedForward = (): boolean => !isPathClearForward();
  const isPathBlockedLeft = (): boolean => !isPathClearLeft();
  const isPathBlockedRight = (): boolean => !isPathClearRight();

  const isAtDeadEnd = (): boolean => {
    return !isPathClearForward() && !isPathClearLeft() && !isPathClearRight();
  };

  const isPathAhead = (): boolean => isPathClearForward();

  const moveForward = async () => {
    if (isHalted || reachedGoal) return;
    if (callbacks.checkCancelled) callbacks.checkCancelled();

    const { tile, x: nextX, y: nextY } = getRelativeTile(0);

    // Hit Wall or Out of Bounds
    if (tile === 0 || nextY < 0 || nextY >= currentGrid.length || nextX < 0 || nextX >= currentGrid[0].length) {
      if (callbacks.onBump) callbacks.onBump();
      await delay(250);
      return;
    }

    // Step on Hazard (Broken Fan: 3)
    if (tile === 3) {
      isHalted = true;
      if (callbacks.onHazardHit) callbacks.onHazardHit({ x: nextX, y: nextY });
      await delay(300);
      throw new Error("Airflow destroyed by broken fan!");
    }

    // Mark previous tile as visited (5 = Cyan Oxygen Trail)
    if (currentGrid[player.y][player.x] !== 4) {
      currentGrid[player.y][player.x] = 5;
    }

    // Move player
    player.x = nextX;
    player.y = nextY;

    // Check Goal (Cabin: 4)
    if (tile === 4) {
      reachedGoal = true;
      if (callbacks.onStep) callbacks.onStep({ ...player }, currentGrid);
      if (callbacks.onSuccess) callbacks.onSuccess();
      await delay(400);
      return;
    }

    if (callbacks.onStep) callbacks.onStep({ ...player }, currentGrid);
    await delay(350);
  };

  const moveBackward = async () => {
    if (isHalted || reachedGoal) return;
    if (callbacks.checkCancelled) callbacks.checkCancelled();

    const { tile, x: nextX, y: nextY } = getRelativeTile(2);

    if (tile === 0 || nextY < 0 || nextY >= currentGrid.length || nextX < 0 || nextX >= currentGrid[0].length) {
      if (callbacks.onBump) callbacks.onBump();
      await delay(250);
      return;
    }

    if (tile === 3) {
      isHalted = true;
      if (callbacks.onHazardHit) callbacks.onHazardHit({ x: nextX, y: nextY });
      await delay(300);
      throw new Error("Airflow destroyed by broken fan!");
    }

    if (currentGrid[player.y][player.x] !== 4) {
      currentGrid[player.y][player.x] = 5;
    }

    player.x = nextX;
    player.y = nextY;

    if (tile === 4) {
      reachedGoal = true;
      if (callbacks.onStep) callbacks.onStep({ ...player }, currentGrid);
      if (callbacks.onSuccess) callbacks.onSuccess();
      await delay(400);
      return;
    }

    if (callbacks.onStep) callbacks.onStep({ ...player }, currentGrid);
    await delay(350);
  };

  const turnLeft = async () => {
    if (isHalted || reachedGoal) return;
    if (callbacks.checkCancelled) callbacks.checkCancelled();
    player.direction = (player.direction + 3) % 4;
    if (callbacks.onStep) callbacks.onStep({ ...player }, currentGrid);
    await delay(300);
  };

  const turnRight = async () => {
    if (isHalted || reachedGoal) return;
    if (callbacks.checkCancelled) callbacks.checkCancelled();
    player.direction = (player.direction + 1) % 4;
    if (callbacks.onStep) callbacks.onStep({ ...player }, currentGrid);
    await delay(300);
  };

  const moveUp = async () => {
    player.direction = 0;
    await moveForward();
  };

  const moveRight = async () => {
    player.direction = 1;
    await moveForward();
  };

  const moveDown = async () => {
    player.direction = 2;
    await moveForward();
  };

  const moveLeft = async () => {
    player.direction = 3;
    await moveForward();
  };

  const checkGameStatus = async () => {
    if (callbacks.checkCancelled) callbacks.checkCancelled();
  };

  try {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const executeFn = new AsyncFunction(
      'moveForward',
      'moveBackward',
      'turnLeft',
      'turnRight',
      'moveUp',
      'moveDown',
      'moveLeft',
      'moveRight',
      'isHazardAhead',
      'isHazardLeft',
      'isHazardRight',
      'isPathClearForward',
      'isPathBlockedForward',
      'isPathClearLeft',
      'isPathBlockedLeft',
      'isPathClearRight',
      'isPathBlockedRight',
      'isAtDeadEnd',
      'isPathAhead',
      'isAtGoal',
      'checkGameStatus',
      'highlightBlock',
      instrumentedCode
    );

    await executeFn(
      moveForward,
      moveBackward,
      turnLeft,
      turnRight,
      moveUp,
      moveDown,
      moveLeft,
      moveRight,
      isHazardAhead,
      isHazardLeft,
      isHazardRight,
      isPathClearForward,
      isPathBlockedForward,
      isPathClearLeft,
      isPathBlockedLeft,
      isPathClearRight,
      isPathBlockedRight,
      isAtDeadEnd,
      isPathAhead,
      isAtGoal,
      checkGameStatus,
      callbacks.highlightBlock || (async () => {})
    );

    if (reachedGoal) {
      return { success: true };
    }
    return { success: false, error: "Airflow did not reach the Cabin goal." };
  } catch (err: any) {
    return { success: false, error: err?.message || "Execution error" };
  }
}

export default OxygenMaze;
