import { SectionHints } from "./types";

export const saturnHints: Record<string, SectionHints> = {
  "saturn-1": {
    generic_hint:
      "To process Saturn's C++ diagnostic stream, start with 'int main()', declare your storage variables ('string', 'int', 'bool'), run a 'while (cin >> ...)' stream loop that reads input before printing with 'cout <<', and finish with 'return 0;'.",
    hints: [
      {
        hint_id: "saturn_1_syntax_empty",
        mission_id: "saturn-1",
        section: 0,
        error_type: "syntax",
        concept_tag: "cpp_empty_pipeline",
        applies_when:
          "Triggers 'The pipeline is empty! Drag some blocks over to catch the data.'",
        hint_text:
          "The C++ telemetry bus is wide open! Start by placing the 'Start / int main()' block on the workspace.",
      },
      {
        hint_id: "saturn_1_missing_step_declarations",
        mission_id: "saturn-1",
        section: 0,
        error_type: "missing_step",
        concept_tag: "cpp_variable_declaration",
        applies_when:
          "Stream loop runs without first declaring storage variables ('string word;', 'int number;', 'bool flag;').",
        hint_text:
          "In C++, you need memory containers ready before reading from the stream! Declare your variable storage blocks above the stream loop.",
      },
      {
        hint_id: "saturn_1_missing_step_loop",
        mission_id: "saturn-1",
        section: 0,
        error_type: "missing_step",
        concept_tag: "cpp_stream_loop",
        applies_when:
          "Triggers 'Stream closed early: Telemetry loop missing!' because no 'while (cin >> ...)' loop is present.",
        hint_text:
          "A single read won't catch the continuous telemetry burst! Use the stream loop block so your program keeps reading packets until the stream ends.",
      },
      {
        hint_id: "saturn_1_logic_stream_order",
        mission_id: "saturn-1",
        section: 0,
        error_type: "logic",
        concept_tag: "cpp_cin_cout_order",
        applies_when:
          "'cout <<' output block is placed before 'cin >>' input block, or 'cout <<' is missing inside the loop.",
        hint_text:
          "Check your data bus direction! Read incoming sensor data with 'cin >>' first, then forward the result to the cockpit display with 'cout <<'.",
      },
    ],
  },
  "saturn-2": {
    generic_hint:
      "Wrap your ring-sorting program between 'Start' and 'End', then use a 'switch (material)' block with 'case' branches for Ice, Rock, Metal, and Alien Debris so every ring fragment is routed to the proper orbital chute.",
    hints: [
      {
        hint_id: "saturn_2_syntax_missing_start",
        mission_id: "saturn-2",
        section: 0,
        error_type: "syntax",
        concept_tag: "cpp_program_entry",
        applies_when:
          "Triggers 'PROGRAM NOTICE: Every program needs a Start block to run.' or is missing the 'End' block.",
        hint_text:
          "C++ execution needs clear entry and exit points! Make sure your blocks begin with 'Start' at the top and finish with 'End' at the bottom.",
      },
      {
        hint_id: "saturn_2_missing_step_switch",
        mission_id: "saturn-2",
        section: 0,
        error_type: "missing_step",
        concept_tag: "cpp_switch_statement",
        applies_when:
          "Workspace is missing the 'switch (material)' control block.",
        hint_text:
          "To sort multiple ring debris types cleanly in C++, drag out a 'switch (material)' block and snap your 'case' branches inside it.",
      },
      {
        hint_id: "saturn_2_missing_step_cases",
        mission_id: "saturn-2",
        section: 0,
        error_type: "missing_step",
        concept_tag: "cpp_switch_cases",
        applies_when:
          "One or more material cases ('Ice', 'Rock', 'Metal', or 'Alien Debris') are missing from the 'switch' block.",
        hint_text:
          "Unmatched debris is slamming into the sorting chute! Make sure your 'switch' block includes 'case' branches for every incoming ring material.",
      },
      {
        hint_id: "saturn_2_wrong_output_chute_routing",
        mission_id: "saturn-2",
        section: 0,
        error_type: "wrong_output",
        concept_tag: "cpp_case_routing_action",
        applies_when:
          "A 'case' branch routes a material to the wrong chute or fails to call 'activate_shield()' when needed.",
        hint_text:
          "A fragment went down the wrong chute! Double-check which routing action or shield defense is snapped inside each 'case' label.",
      },
    ],
  },
  "saturn-3": {
    generic_hint:
      "Manage C++ heap memory carefully: allocate a dynamic core with 'EnergyCore* core = new EnergyCore()', transfer its power with 'core->transferEnergy()', and always free the memory using 'delete core; core = nullptr;' before 'End'.",
    hints: [
      {
        hint_id: "saturn_3_missing_step_allocate",
        mission_id: "saturn-3",
        section: 0,
        error_type: "missing_step",
        concept_tag: "cpp_heap_allocation",
        applies_when:
          "'core->transferEnergy()' or 'delete core;' is called without first allocating the pointer via 'EnergyCore* core = new EnergyCore()'.",
        hint_text:
          "You're trying to use a pointer that doesn't point to a valid EnergyCore yet! Allocate the object on the heap with 'EnergyCore* core = new EnergyCore()' first.",
      },
      {
        hint_id: "saturn_3_missing_step_transfer",
        mission_id: "saturn-3",
        section: 0,
        error_type: "missing_step",
        concept_tag: "cpp_pointer_dereference",
        applies_when:
          "An EnergyCore is allocated and deleted, but 'core->transferEnergy()' was never called before deletion.",
        hint_text:
          "You recycled the EnergyCore before draining its power! Call 'core->transferEnergy()' right after allocating it, and before deleting the pointer.",
      },
      {
        hint_id: "saturn_3_logic_memory_leak",
        mission_id: "saturn-3",
        section: 0,
        error_type: "logic",
        concept_tag: "cpp_memory_deallocation",
        applies_when:
          "'new EnergyCore()' is used without 'delete core; core = nullptr;', causing a heap memory leak or dangling pointer.",
        hint_text:
          "Memory leak detected in the reactor! Every object created on the heap with 'new' must be freed using 'delete core; core = nullptr;' once you're done with it.",
      },
      {
        hint_id: "saturn_3_syntax_missing_end",
        mission_id: "saturn-3",
        section: 0,
        error_type: "syntax",
        concept_tag: "cpp_program_termination",
        applies_when:
          "The pointer sequence is missing the 'End' termination block at the bottom.",
        hint_text:
          "Don't leave the C++ diagnostic routine hanging! Snap the 'End' block at the very bottom of your sequence to close out the program.",
      },
    ],
  },
};
