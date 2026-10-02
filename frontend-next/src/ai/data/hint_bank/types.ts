export type ErrorType = "syntax" | "logic" | "wrong_output" | "missing_step" | "none";

export interface HintBankEntry {
  hint_id: string;
  mission_id: string;
  section: number | string;
  error_type: ErrorType;
  concept_tag: string;
  applies_when: string;
  hint_text: string;
}

export interface SectionHints {
  generic_hint: string;
  hints: HintBankEntry[];
}
