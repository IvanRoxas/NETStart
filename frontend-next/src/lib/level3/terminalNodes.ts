export interface DiagnosticNode {
  id: number;
  type: 'Start' | 'Ignition' | 'Node';
  color?: 'Blue' | 'Red' | 'Green';
  state?: 'Stable' | 'Blinking' | 'Trap' | 'Depleted';
  label?: string;
  isExtracted?: boolean;
}

export interface DiagnosticSectionConfig {
  sectionId: number | string;
  title: string;
  subtag: string;
  desc: string;
  tip: string;
  nodes: DiagnosticNode[];
  maxBlocks?: number;
}

// Section 1: The AND Gate (1D Stationary Stream)
export const SECTION_1_DIAGNOSTIC: DiagnosticSectionConfig = {
  sectionId: 1,
  title: "Diagnostic Track 1: AND Logic Calibration",
  subtag: "Section 1 of 5",
  desc: "Scan the circuit stream! Use 'Scan Next Node' inside a loop with the AND block to take power only when a node is BOTH Blue AND Stable.",
  tip: "Hint: Repeat 5 times -> Scan Next Node -> If (scan node color == 'Blue' AND scan node state == 'Stable') then extract power.",
  nodes: [
    { id: 1, type: 'Start', label: 'PWR IN' },
    { id: 2, type: 'Node', color: 'Blue', state: 'Stable', label: 'BUS 01' },
    { id: 3, type: 'Node', color: 'Red', state: 'Blinking', label: 'TRAP 01' },
    { id: 4, type: 'Node', color: 'Blue', state: 'Stable', label: 'BUS 02' },
    { id: 5, type: 'Ignition', label: 'IGNITION' },
  ],
  maxBlocks: 8,
};

// Section 2: The NOT Gate (1D Stationary Stream)
export const SECTION_2_DIAGNOSTIC: DiagnosticSectionConfig = {
  sectionId: 2,
  title: "Diagnostic Track 2: NOT Logic Bypass",
  subtag: "Section 2 of 5",
  desc: "Scan the noisy bus! Use the NOT block to skip any Red trap nodes and take clean power from the Green nodes.",
  tip: "Hint: Repeat 6 times -> Scan Next Node -> If NOT (scan node color == 'Red') then extract power.",
  nodes: [
    { id: 1, type: 'Start', label: 'PWR IN' },
    { id: 2, type: 'Node', color: 'Red', state: 'Blinking', label: 'TRAP 01' },
    { id: 3, type: 'Node', color: 'Green', state: 'Stable', label: 'BUS 01' },
    { id: 4, type: 'Node', color: 'Red', state: 'Blinking', label: 'TRAP 02' },
    { id: 5, type: 'Node', color: 'Green', state: 'Stable', label: 'BUS 02' },
    { id: 6, type: 'Ignition', label: 'IGNITION' },
  ],
  maxBlocks: 8,
};

// Section 4 (Hardcore Option B - Sorter Stream)
export const SECTION_4_DIAGNOSTIC: DiagnosticSectionConfig = {
  sectionId: 'hard_sort',
  title: "Diagnostic Stream: High-Speed Node Sorter",
  subtag: "Section 4 of 5",
  desc: "Continuous high-speed data stream! Use 'repeat until engine charged' and conditionals to scan and extract power until 100%.",
  tip: "Hint: While not charged, scan next node and extract from safe Blue and Green nodes.",
  nodes: [
    { id: 1, type: 'Start', label: 'PWR IN' },
    { id: 2, type: 'Node', color: 'Blue', state: 'Stable', label: 'DATA 01' },
    { id: 3, type: 'Node', color: 'Red', state: 'Blinking', label: 'TRAP 01' },
    { id: 4, type: 'Node', color: 'Blue', state: 'Stable', label: 'DATA 02' },
    { id: 5, type: 'Node', color: 'Red', state: 'Blinking', label: 'TRAP 02' },
    { id: 6, type: 'Node', color: 'Blue', state: 'Blinking', label: 'TRAP 03' },
    { id: 7, type: 'Node', color: 'Green', state: 'Stable', label: 'DATA 03' },
    { id: 8, type: 'Node', color: 'Red', state: 'Blinking', label: 'TRAP 04' },
    { id: 9, type: 'Node', color: 'Green', state: 'Stable', label: 'DATA 04' },
    { id: 10, type: 'Ignition', label: 'IGNITION' },
  ],
  maxBlocks: 10,
};

// Section 5 (Hardcore Option C - Master Logic Stream)
export const SECTION_5_DIAGNOSTIC: DiagnosticSectionConfig = {
  sectionId: 'hard_logic',
  title: "Diagnostic Stream: Master Logic Calibration",
  subtag: "Section 5 of 5",
  desc: "An advanced data stream with complex dual properties! Combine AND, OR, and NOT gates to filter valid nodes and ignite the engine.",
  tip: "Hint: Take power if (Blue AND Stable) OR (Green AND Stable).",
  nodes: [
    { id: 1, type: 'Start', label: 'PWR IN' },
    { id: 2, type: 'Node', color: 'Blue', state: 'Stable', label: 'NODE 01' },
    { id: 3, type: 'Node', color: 'Green', state: 'Blinking', label: 'TRAP 01' },
    { id: 4, type: 'Node', color: 'Green', state: 'Stable', label: 'NODE 02' },
    { id: 5, type: 'Node', color: 'Blue', state: 'Blinking', label: 'TRAP 02' },
    { id: 6, type: 'Node', color: 'Red', state: 'Blinking', label: 'TRAP 03' },
    { id: 7, type: 'Node', color: 'Blue', state: 'Stable', label: 'NODE 03' },
    { id: 8, type: 'Node', color: 'Green', state: 'Stable', label: 'NODE 04' },
    { id: 9, type: 'Ignition', label: 'IGNITION' },
  ],
  maxBlocks: 14,
};

export function getDiagnosticConfig(sectionId: number | string): DiagnosticSectionConfig {
  if (sectionId === 1) return SECTION_1_DIAGNOSTIC;
  if (sectionId === 2) return SECTION_2_DIAGNOSTIC;
  if (sectionId === 'hard_sort' || sectionId === 4) return SECTION_4_DIAGNOSTIC;
  if (sectionId === 'hard_logic' || sectionId === 5) return SECTION_5_DIAGNOSTIC;
  return SECTION_1_DIAGNOSTIC;
}
