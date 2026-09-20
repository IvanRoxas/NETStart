[SYSTEM DIRECTIVE: STRICT COMPLIANCE & ANTI-OVERENGINEERING]
Act as a Senior Next.js and React Architect. We are building Section 1 (The Oxygen Vents) of Level 3.

PREREQUISITE: Strictly adhere to instructions.md. Keep the UI minimalist. Do NOT invent new external assets. Use pure Tailwind CSS and standard icons (e.g., lucide-react).

THE TASK: SECTION 1 (THE DETOUR MAZE)
Section 1 is a 2D grid maze. The player controls "Air" trying to reach the "Cabin". They must use an If/Else block to dodge hazards via a bypass vent.

Phase 1: The Grid Component (OxygenMaze.tsx)
Build a 2D React grid using this exact 9x4 matrix:

JavaScript
const oxygenMazeGrid = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 2, 3, 2, 2, 3, 2, 2, 4],
  [0, 2, 2, 2, 0, 2, 2, 2, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0]
];
0 (Wall): Dark gray square (bg-gray-800).

1 (Player/Air Start): Render a Wind icon.

2 (Open Vent): Light gray square (bg-gray-600).

3 (Hazard/Broken Fan): Render a red Fan icon with a pulsing animation.

4 (Goal/Cabin): Render a Target icon.

State Mutation: As the player moves over a 2 tile, mutate it to 5. Render 5 as a bright cyan square (bg-cyan-500/50) to leave a visual trail.

Phase 2: Blockly Custom Blocks & Toolbox
Define the JSON blocks and toolbox for this section:

Movement: move_forward, turn_left, turn_right.

Loops: repeat_until_goal.

Conditionals: controls_ifelse, and a custom sensor is_hazard_ahead.

Phase 3: Execution Logic
Create the execution runner that translates the Blockly workspace into grid movement with a slight delay (setTimeout) between steps for animation.

If they step on a 3 (Fan), halt execution, turn the tile bright red, and trigger a toast: "Airflow destroyed by broken fan!"

Victory Condition: If player coordinates match 4, trigger a massive success toast: "OXYGEN RESTORED! You unlocked the 'Run_Oxygen' function!" and update the parent React state (setOxygenFixed(true)).

Output Requirement:
Output ONLY the code for Phase 1, Phase 2, and Phase 3. Ensure it is modular. Do NOT write code for Sections 2, 3, or 4 yet. Acknowledge this constraint first.

Here is the exact prompt to feed your AI agent for Section 1.

It strictly enforces the minimalist design (no crazy assets), brings back the grid navigation you wanted, adds the "blue trail" visual feedback, and ensures the code gives them the Run_Oxygen block as a reward.

Copy/Paste Prompt for Your AI Agent: Section 1
[SYSTEM DIRECTIVE: STRICT COMPLIANCE & ANTI-OVERENGINEERING]
Act as a Senior Next.js and React Architect. We are building Section 1 (The Oxygen Vents) of Level 3.

PREREQUISITE: You MUST strictly adhere to instructions.md. Keep the UI minimalist. Do NOT invent new SVG files, 3D assets, or complex CSS animations. Use pure Tailwind CSS and standard icons (e.g., lucide-react or standard emojis).

THE TASK: SECTION 1 (OXYGEN MAZE)
Section 1 is a top-down 2D grid maze. The player controls a puff of "Air" trying to reach the "Cabin Vents". They must use Movement, Loops, and If/Else blocks to navigate around hazards.

Phase 1: The Grid & UI Component (OxygenMaze.tsx)
Build a 2D React grid (e.g., 7x7 matrix). Map the following integers to these visual Tailwind designs:

0 (Empty Path): Dark gray square.

1 (Player/Air): Render a Wind icon (💨 or Lucide Wind).

2 (Goal/Vent): Render a Vent/Target icon.

3 (Hazard 1 - Broken Fan): Render a red Fan icon.

4 (Hazard 2 - Locked Hatch): Render a Lock icon.

5 (Visited Path): When the player moves over a 0 tile, mutate it to 5. Render this as a bright blue square (bg-cyan-500/50) to leave a visual "blue trail" showing where the oxygen has traveled.

Phase 2: Blockly Toolbox & Custom Blocks
Define the JSON blocks and a static toolbox configuration specifically for this section:

Movement: move_forward, turn_left, turn_right.

Loops: A custom repeat_until_goal block.

Conditionals: A standard Blockly controls_ifelse block, and custom sensor blocks: is_path_clear_forward, is_hazard_ahead.

Phase 3: Execution & Validation Logic
Create the execution runner that translates the Blockly workspace into grid movement.

As the player moves, immediately update the grid state to leave the 5 (blue trail) behind them.

If they hit a 3 (Fan) or 4 (Hatch), halt execution and trigger an error toast: "Airflow blocked by hazard!"

Victory Condition: If the player coordinates match the Goal coordinates (2), halt execution and trigger a massive success toast: "OXYGEN RESTORED! You unlocked the 'Run_Oxygen' function!"

On victory, update the parent state (e.g., setOxygenFixed(true)).