import { moonHints } from "./moon";
import { marsHints } from "./mars";
import { HintBankEntry, SectionHints } from "./types";

export * from "./types";

const ALL_HINTS: Record<string, SectionHints> = {
  ...moonHints,
  ...marsHints,
};

export function getSectionHints(missionId: string): SectionHints {
  if (ALL_HINTS[missionId]) {
    return ALL_HINTS[missionId];
  }

  // Fallback for unexpected mission ids
  return {
    generic_hint: "Check your code structure and follow the mission objectives carefully.",
    hints: [],
  };
}

export function getHintsForMission(missionId: string): HintBankEntry[] {
  return getSectionHints(missionId).hints;
}

export function getGenericHintForMission(missionId: string): string {
  return getSectionHints(missionId).generic_hint;
}
