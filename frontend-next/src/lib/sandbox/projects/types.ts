export type CheckType = 
  | { type: 'exists'; selector: string }
  | { type: 'count-at-least'; selector: string; n: number }
  | { type: 'css'; selector: string; prop: string; equals?: string[]; notEquals?: string[]; atLeast?: number; atMost?: number }
  | { type: 'button-text'; texts: string[] }
  | { type: 'click-sequence'; keys: string[]; displaySelector: string; expect: string | string[]; clickBy?: 'text' | 'selector' }
  | { type: 'text-contains'; displaySelector: string; text: string }
  | { type: 'not-contains'; displaySelector: string; strings: string[] }
  | { type: 'no-uncaught-error' }
  | { type: 'attribute'; selector: string; attr: string; scope?: 'all' | 'any'; present?: boolean; nonEmpty?: boolean; equals?: string; minLength?: number }
  | { type: 'text-length-at-least'; selector: string; minLength: number; count: number }
  | { type: 'unique-attribute'; selector: string; attr: string; n: number }
  | { type: 'labels-match-inputs'; minInputs: number }
  | { type: 'images-loaded'; min: number }
  | { type: 'click-style'; mode: 'changes' | 'toggles' | 'cycles'; clickSelector: string; targets: string[]; prop: string; times?: number }
  | { type: 'class-changes-style'; addClass: string; targets: string[]; prop: string }
  | { type: 'click-repeat'; clickSelector: string; times: number[]; displaySelector: string; expect: 'times' };

export type StepCheck = CheckType & { id: string; message: string; isCore?: boolean };

export type ProjectStep = {
  id: string;
  mode: 'guided' | 'your-turn';
  goal: string;
  instructions: string;
  starterCode?: { file: string; code: string }[];
  checks: StepCheck[];
  hints: string[]; // Up to 3 tiers
};

export type ProjectBlueprint = {
  id: string;
  track: 'web' | 'python' | 'js';
  title: string;
  description?: string;
  difficulty?: 'beginner' | 'easy' | 'medium';
  concepts?: string[];
  planets?: string[];
  files: { 'index.html': string; 'style.css': string; 'script.js': string };
  steps: ProjectStep[];
  rubric: { core: string[]; stretch: string[] };
};

export type CheckResult = {
  id: string;
  pass: boolean;
  message: string;
};
