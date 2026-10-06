"use client";

import React from 'react';
import VenusLevel3Viewport, { Venus3ScanResult } from './VenusLevel3Viewport';
import {
  Venus3ParsedStyles,
  Venus3SectorId,
  Venus3TabId,
  VenusLevel3Validation,
} from '@/lib/venus/venusLevel3Definitions';

interface VenusLevel3Props {
  validation?: VenusLevel3Validation;
  activeSector: Venus3TabId;
  setActiveSector: (sector: Venus3TabId) => void;
  solvedSectors: Record<Venus3SectorId, boolean>;
  onSectorSolved?: (sector: Venus3SectorId) => void;
  isRunning?: boolean;
  sectorStyles?: Venus3ParsedStyles;
  linkedStylesheets?: string[];
  failedSectors?: Venus3SectorId[];
  inlineStyles?: { tower?: string; background?: string };
  scanPhase?: Venus3SectorId | 'done' | null;
  scanResults?: Record<Venus3SectorId, Venus3ScanResult>;
}

export default function VenusLevel3({
  validation,
  activeSector,
  setActiveSector,
  solvedSectors,
  isRunning = false,
  sectorStyles,
  linkedStylesheets,
  failedSectors,
  inlineStyles,
  scanPhase,
  scanResults,
}: VenusLevel3Props) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden relative">
      <VenusLevel3Viewport
        validation={validation}
        activeSector={activeSector}
        onSelectSector={setActiveSector}
        solvedSectors={solvedSectors}
        isRunning={isRunning}
        sectorStyles={sectorStyles}
        linkedStylesheets={linkedStylesheets}
        failedSectors={failedSectors}
        inlineStyles={inlineStyles}
        scanPhase={scanPhase}
        scanResults={scanResults}
      />
    </div>
  );
}
