import { HintBankEntry, SectionHints } from "./types";

export const moonHints: Record<string, SectionHints> = {
  // Moon Tutorial 1: The Assessment
  "moon-1": {
    generic_hint: "Telemetry shows the rover is off course. Take another look at your path—make sure each instruction nudges your rover one tile closer to the landing pad.",
    hints: [
      {
        hint_id: "moon_1_syntax_disconnected",
        mission_id: "moon-1",
        section: 1,
        error_type: "syntax",
        concept_tag: "block_connection",
        applies_when: "Blocks are placed on the workspace but not connected to the main starting block.",
        hint_text: "Telemetry link is quiet! Check that your instructions are snapped securely into the sequence so the rover can hear them.",
      },
      {
        hint_id: "moon_1_logic_direction",
        mission_id: "moon-1",
        section: 1,
        error_type: "logic",
        concept_tag: "turning_direction",
        applies_when: "The rover turns left instead of right or turns into an obstacle.",
        hint_text: "Notice where the rover is facing after each turn. A quick check of your left and right will point you toward clear ground.",
      },
      {
        hint_id: "moon_1_missing_step_short",
        mission_id: "moon-1",
        section: 1,
        error_type: "missing_step",
        concept_tag: "step_count",
        applies_when: "The rover stops short of the destination landing marker.",
        hint_text: "You have the right heading! Count the remaining tiles—your rover just needs a little extra distance to reach the marker.",
      },
      {
        hint_id: "moon_1_wrong_output_overshoot",
        mission_id: "moon-1",
        section: 1,
        error_type: "wrong_output",
        concept_tag: "step_bounds",
        applies_when: "The rover moves too many steps and overshoots the landing point.",
        hint_text: "Whoa, plenty of momentum! Count each tile step along the way so your rover stops right on the landing zone.",
      },
    ],
  },

  // Moon Tutorial 2: Mini Sorting Game
  "moon-2": {
    generic_hint: "Good work organizing the cargo bay! Check that every item matches the rules for its container before you store it.",
    hints: [
      {
        hint_id: "moon_2_syntax_slot",
        mission_id: "moon-2",
        section: 2,
        error_type: "syntax",
        concept_tag: "sorting_containers",
        applies_when: "Sorting commands are placed outside of the sorting handler.",
        hint_text: "The sorter needs clear boundaries! Group your sorting rules inside the container zone so the scanner knows where to look.",
      },
      {
        hint_id: "moon_2_logic_mismatch",
        mission_id: "moon-2",
        section: 2,
        error_type: "logic",
        concept_tag: "classification",
        applies_when: "An item is routed to the wrong container category.",
        hint_text: "Take a closer look at the cargo labels. Check what makes each item unique before choosing where it belongs.",
      },
      {
        hint_id: "moon_2_missing_step_unprocessed",
        mission_id: "moon-2",
        section: 2,
        error_type: "missing_step",
        concept_tag: "loop_completion",
        applies_when: "Some items remain unclassified in the input tray.",
        hint_text: "Almost finished! Keep the sorting cycle repeating until every last piece of cargo is safely stowed away.",
      },
    ],
  },

  // Moon Tutorial 3: Reboot the Spaceship
  "moon-3": {
    generic_hint: "The console is waiting for your boot checklist! Make sure each spaceship system powers up in the right sequence.",
    hints: [
      {
        hint_id: "moon_3_syntax_init",
        mission_id: "moon-3",
        section: 3,
        error_type: "syntax",
        concept_tag: "initialization",
        applies_when: "The boot procedure lacks a starting execution trigger.",
        hint_text: "The ship's computer needs a launch signal to begin. Connect your checklist right at the very beginning of the boot stream.",
      },
      {
        hint_id: "moon_3_logic_subsystem_order",
        mission_id: "moon-3",
        section: 3,
        error_type: "logic",
        concept_tag: "sequence_order",
        applies_when: "Thrusters are fired before life support or power is restored.",
        hint_text: "Think about dependencies! Main power must be online and stable before the engines can draw any energy.",
      },
      {
        hint_id: "moon_3_missing_step_fuel",
        mission_id: "moon-3",
        section: 3,
        error_type: "missing_step",
        concept_tag: "prerequisites",
        applies_when: "Fuel calibration was skipped before engine test.",
        hint_text: "Double-check your pre-flight prep. The engines need a steady propellant flow before you run ignition.",
      },
    ],
  },
};
