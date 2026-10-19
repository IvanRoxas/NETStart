import { SectionHints } from "./types";

export const earthHints: Record<string, SectionHints> = {
  "earth-1": {
    generic_hint:
      "Clean up the Master Ledger in Python! Load the raw telemetry string, use 'data[start:stop]' slicing (remembering Python starts at index 0 and stops just before the 'stop' index) or '.replace()' / '.split()', and 'print(data)' to commit the clean record.",
    hints: [
      {
        hint_id: "earth_1_syntax_empty",
        mission_id: "earth-1",
        section: 0,
        error_type: "syntax",
        concept_tag: "python_empty_workspace",
        applies_when:
          "Triggers 'Workspace is empty! Drag out Load Data to start.' or is missing the Python Start/End script blocks.",
        hint_text:
          "The Master Ledger terminal is empty! Place your 'Start / Begin Python Script' and 'data = \"...\"' (Load Data) blocks to load the corrupted packet.",
      },
      {
        hint_id: "earth_1_wrong_output_slice_bounds",
        mission_id: "earth-1",
        section: 0,
        error_type: "wrong_output",
        concept_tag: "python_string_slicing",
        applies_when:
          "The sliced output still contains noise characters or cuts off part of the valid record because the '[start:stop]' indices are off by one or more characters.",
        hint_text:
          "Your string slice captured some static! Remember that Python indices start at 0, and in 'data[start:stop]', the character at 'stop' is excluded.",
      },
      {
        hint_id: "earth_1_missing_step_replace_split",
        mission_id: "earth-1",
        section: 1,
        error_type: "missing_step",
        concept_tag: "python_string_methods",
        applies_when:
          "Corrupted delimiters or noise tokens remain inside the string because 'data.replace()' or 'data.split()' was not applied.",
        hint_text:
          "Slicing trims the edges, but there's still corruption inside the packet! Use 'data.replace()' or 'data.split()' to strip out the noise.",
      },
      {
        hint_id: "earth_1_missing_step_print",
        mission_id: "earth-1",
        section: 0,
        error_type: "missing_step",
        concept_tag: "python_print_output",
        applies_when:
          "Data is loaded and sliced/cleaned, but 'print(data)' is missing before the End block.",
        hint_text:
          "You cleaned the telemetry string in memory, but haven't written it to the ledger! Snap 'print(data)' before the 'End' block to output the result.",
      },
    ],
  },
  "earth-2": {
    generic_hint:
      "In Tab 1, build all 6 planetary profile dictionaries with their 'name' and 'ONLINE' status. Then switch to Tab 2, initialize the 'solar_system = [ ... ]' / 'master_archive' list, and append every planet profile in order.",
    hints: [
      {
        hint_id: "earth_2_syntax_empty_tab1",
        mission_id: "earth-2",
        section: 0,
        error_type: "syntax",
        concept_tag: "python_dict_empty",
        applies_when:
          "Triggers 'Workspace is empty! Drag out Planet dictionary blocks to profile the planets.' on Tab 1.",
        hint_text:
          "Tab 1 needs the planetary records! Drag out the Python dictionary blocks to define each planet's profile.",
      },
      {
        hint_id: "earth_2_syntax_empty_tab2",
        mission_id: "earth-2",
        section: 1,
        error_type: "syntax",
        concept_tag: "python_list_empty",
        applies_when:
          "Triggers 'Workspace is empty! Drag out the solar_system = [ ... ] list block to arrange the orbits.' on Tab 2.",
        hint_text:
          "Switch to Tab 2 and drag out the 'solar_system = [ ... ]' list block so you can assemble the planetary archive!",
      },
      {
        hint_id: "earth_2_missing_step_dicts",
        mission_id: "earth-2",
        section: 0,
        error_type: "missing_step",
        concept_tag: "python_dict_key_values",
        applies_when:
          "Not all 6 planet profile dictionaries are defined or some have missing/incorrect key-value pairs in Tab 1.",
        hint_text:
          "The archive is missing planet records! Check Tab 1 and make sure all six planets have a dictionary with their correct name and 'ONLINE' status.",
      },
      {
        hint_id: "earth_2_missing_step_append",
        mission_id: "earth-2",
        section: 1,
        error_type: "missing_step",
        concept_tag: "python_list_append",
        applies_when:
          "Planet dictionaries exist in Tab 1, but Tab 2 does not append all 6 planet profiles into the master list in the right order.",
        hint_text:
          "Your planet dictionaries are ready, but they aren't all stored in the master list! In Tab 2, append each planet dictionary into your list in sequence.",
      },
    ],
  },
  "earth-3": {
    generic_hint:
      "To execute the Master Reboot in Python: import all 6 planetary modules at the top of the script, define 'def reboot_planetary_network():', nest every '[module].reboot()' call inside that function, and call 'reboot_planetary_network()' at the bottom.",
    hints: [
      {
        hint_id: "earth_3_syntax_empty",
        mission_id: "earth-3",
        section: 0,
        error_type: "syntax",
        concept_tag: "python_modules_empty",
        applies_when:
          "Triggers 'Your workspace is empty! Place import blocks to begin.'",
        hint_text:
          "The Master Reboot console is waiting! Start by placing 'import' blocks at the top of your script to load the planetary modules.",
      },
      {
        hint_id: "earth_3_syntax_name_error",
        mission_id: "earth-3",
        section: 0,
        error_type: "syntax",
        concept_tag: "python_import_before_use",
        applies_when:
          "Triggers 'NameError: You must import the module before accessing its functions.' or a planetary module is missing its 'import' statement.",
        hint_text:
          "Python raised a NameError because a planet's module wasn't imported yet! Make sure you place 'import' blocks for all six planets at the very top of your workspace.",
      },
      {
        hint_id: "earth_3_logic_scope_error",
        mission_id: "earth-3",
        section: 0,
        error_type: "logic",
        concept_tag: "python_function_indentation_scope",
        applies_when:
          "Triggers 'Structure Error: Nest all module calls inside master_reboot().' because '.reboot()' blocks are placed outside the 'def' function wrapper.",
        hint_text:
          "Keep your reboot sequence encapsulated! Snap every '[module].reboot()' block inside the body of your 'def reboot_planetary_network():' function block.",
      },
      {
        hint_id: "earth_3_missing_step_call_func",
        mission_id: "earth-3",
        section: 0,
        error_type: "missing_step",
        concept_tag: "python_function_invocation",
        applies_when:
          "Triggers 'Function defined, but never called. The system is waiting for you to synchronize the execution.'",
        hint_text:
          "Defining a 'def' function prepares the instructions, but doesn't run them! Snap the 'reboot_planetary_network()' call block at the very bottom (outside the function) to trigger the reboot.",
      },
    ],
  },
};
