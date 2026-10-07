import { HintBankEntry, SectionHints } from "./types";

export const moonHints: Record<string, SectionHints> = {
  // Moon Tutorial 1: The Assessment
  "moon-1": {
    // TODO: [Melben] customize generic fallback hint for moon-1
    generic_hint: "Check your movement blocks and make sure each command guides the rover toward the target tile.",
    hints: [
      {
        hint_id: "moon_1_syntax_disconnected",
        mission_id: "moon-1",
        section: 1,
        error_type: "syntax",
        concept_tag: "block_connection",
        applies_when: "Blocks are placed on the workspace but not connected to the main starting block.",
        // TODO: [Melben] customize hint copy
        hint_text: "Ensure all your movement blocks snap tightly under the main start block so the rover receives the instructions.",
      },
      {
        hint_id: "moon_1_logic_direction",
        mission_id: "moon-1",
        section: 1,
        error_type: "logic",
        concept_tag: "turning_direction",
        applies_when: "The rover turns left instead of right or turns into an obstacle.",
        // TODO: [Melben] customize hint copy
        hint_text: "Double-check your turn blocks. Make sure you are turning in the correct direction to face the open path.",
      },
      {
        hint_id: "moon_1_missing_step_short",
        mission_id: "moon-1",
        section: 1,
        error_type: "missing_step",
        concept_tag: "step_count",
        applies_when: "The rover stops short of the destination landing marker.",
        // TODO: [Melben] customize hint copy
        hint_text: "You are on the right track, but the rover needs one or more additional move forward steps to reach the target.",
      },
      {
        hint_id: "moon_1_wrong_output_overshoot",
        mission_id: "moon-1",
        section: 1,
        error_type: "wrong_output",
        concept_tag: "step_bounds",
        applies_when: "The rover moves too many steps and overshoots the landing point.",
        // TODO: [Melben] customize hint copy
        hint_text: "Count the tiles between your start and the landing marker to avoid moving too far.",
      },
    ],
  },

  // Moon Tutorial 2: Mini Sorting Game
  "moon-2": {
    // TODO: [Melben] customize generic fallback hint for moon-2
    generic_hint: "Review each item type and verify that your sorting conditions route it to the right bay.",
    hints: [
      {
        hint_id: "moon_2_syntax_slot",
        mission_id: "moon-2",
        section: 2,
        error_type: "syntax",
        concept_tag: "sorting_containers",
        applies_when: "Sorting commands are placed outside of the sorting handler.",
        // TODO: [Melben] customize hint copy
        hint_text: "Place your sorting conditions inside the container handler block.",
      },
      {
        hint_id: "moon_2_logic_mismatch",
        mission_id: "moon-2",
        section: 2,
        error_type: "logic",
        concept_tag: "classification",
        applies_when: "An item is routed to the wrong container category.",
        // TODO: [Melben] customize hint copy
        hint_text: "Check your item criteria. Compare the item label with the box label before sorting.",
      },
      {
        hint_id: "moon_2_missing_step_unprocessed",
        mission_id: "moon-2",
        section: 2,
        error_type: "missing_step",
        concept_tag: "loop_completion",
        applies_when: "Some items remain unclassified in the input tray.",
        // TODO: [Melben] customize hint copy
        hint_text: "Make sure your loop continues until every single item in the cargo bay is sorted.",
      },
    ],
  },

  // Moon Tutorial 3: Reboot the Spaceship
  "moon-3": {
    // TODO: [Melben] customize generic fallback hint for moon-3
    generic_hint: "Follow the spaceship console checklist to reboot the subsystems in the proper sequence.",
    hints: [
      {
        hint_id: "moon_3_syntax_init",
        mission_id: "moon-3",
        section: 3,
        error_type: "syntax",
        concept_tag: "initialization",
        applies_when: "The boot procedure lacks a starting execution trigger.",
        // TODO: [Melben] customize hint copy
        hint_text: "Attach the subsystem sequence directly under the reboot startup trigger.",
      },
      {
        hint_id: "moon_3_logic_subsystem_order",
        mission_id: "moon-3",
        section: 3,
        error_type: "logic",
        concept_tag: "sequence_order",
        applies_when: "Thrusters are fired before life support or power is restored.",
        // TODO: [Melben] customize hint copy
        hint_text: "Power systems must come online before you can ignite the main engine thrusters.",
      },
      {
        hint_id: "moon_3_missing_step_fuel",
        mission_id: "moon-3",
        section: 3,
        error_type: "missing_step",
        concept_tag: "prerequisites",
        applies_when: "Fuel calibration was skipped before engine test.",
        // TODO: [Melben] customize hint copy
        hint_text: "Remember to include the fuel calibration step so the thrusters receive enough propellant.",
      },
    ],
  },
};
