"use client";

import React from 'react';
import SimulationConsole from './SimulationConsole';
import type { MarsLevel3Validation } from '@/lib/mars/marsLevel3Definitions';

interface MarsLevel3Props {
  validation: MarsLevel3Validation;
  isRunning: boolean;
  onSimulationComplete?: (success: boolean, failureReason?: string) => void;
}

export default function MarsLevel3({
  validation,
  isRunning,
  onSimulationComplete,
}: MarsLevel3Props) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden relative">
      <SimulationConsole
        validation={validation}
        isRunning={isRunning}
        onSimulationComplete={onSimulationComplete}
      />
    </div>
  );
}
