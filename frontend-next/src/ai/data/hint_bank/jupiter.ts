import { SectionHints } from "./types";

export const jupiterHints: Record<string, SectionHints> = {
  "jupiter-1": {
    generic_hint:
      "Java requires strict data types! Declare a 'String' for the security code, an 'int' for the numeric clearance level, and a 'boolean' (unquoted true/false) for the gate override before calling 'unlockGates()'.",
    hints: [
      {
        hint_id: "jupiter_1_syntax_empty",
        mission_id: "jupiter-1",
        section: 0,
        error_type: "syntax",
        concept_tag: "java_empty_workspace",
        applies_when:
          "Triggers 'Your workspace is empty! Build variables to unlock the gate.'",
        hint_text:
          "The airlock terminal is waiting for your Java declarations! Drag out variable declaration blocks from the toolbox to get started.",
      },
      {
        hint_id: "jupiter_1_syntax_blank_name",
        mission_id: "jupiter-1",
        section: 0,
        error_type: "syntax",
        concept_tag: "java_identifier_naming",
        applies_when:
          "Triggers 'Give your variables descriptive names! Don't leave variable names blank.'",
        hint_text:
          "Every Java variable needs an identifier! Type a clear name like 'securityCode', 'clearanceLevel', or 'gateOverride' into each variable slot.",
      },
      {
        hint_id: "jupiter_1_syntax_duplicate_name",
        mission_id: "jupiter-1",
        section: 0,
        error_type: "syntax",
        concept_tag: "java_unique_identifiers",
        applies_when:
          "Triggers 'Duplicate variable name! Each variable must have a unique identifier.'",
        hint_text:
          "Two of your variables share the exact same name! In Java, every variable in the same scope must have a unique identifier.",
      },
      {
        hint_id: "jupiter_1_syntax_quoted_boolean",
        mission_id: "jupiter-1",
        section: 0,
        error_type: "syntax",
        concept_tag: "java_boolean_literal",
        applies_when:
          "Triggers 'Type Mismatch: Do not wrap booleans in quotes. Use boolean true/false, not \"true\".'",
        hint_text:
          "Wrapping 'true' in quotation marks turns it into a String! For a Java 'boolean', use the raw keyword 'true' or 'false' without quotes.",
      },
      {
        hint_id: "jupiter_1_logic_type_mismatch",
        mission_id: "jupiter-1",
        section: 0,
        error_type: "logic",
        concept_tag: "java_strong_typing",
        applies_when:
          "A variable's declared data type ('String', 'int', 'boolean') does not match the value assigned to it.",
        hint_text:
          "Check your Java data types! Text in quotes belongs in a 'String', whole numbers belong in an 'int', and true/false switches belong in a 'boolean'.",
      },
      {
        hint_id: "jupiter_1_missing_step_unlock",
        mission_id: "jupiter-1",
        section: 0,
        error_type: "missing_step",
        concept_tag: "java_method_invocation",
        applies_when:
          "Variables are declared properly, but the 'unlockGates' action block is missing at the end of the sequence.",
        hint_text:
          "Your security credentials are declared, but you haven't transmitted them to the airlock! Snap the 'unlockGates' action block at the bottom of your program.",
      },
    ],
  },
  "jupiter-2": {
    generic_hint:
      "Protect the telemetry core by snapping 'Start Data Stream' inside a 'Try Running:' block, then attach 'When [Exception] occurs:' catch rules into the 'unless:' slot with a recovery action inside each rule.",
    hints: [
      {
        hint_id: "jupiter_2_missing_step_try",
        mission_id: "jupiter-2",
        section: 0,
        error_type: "missing_step",
        concept_tag: "java_try_block",
        applies_when:
          "Triggers 'RADAR SCANNER MISSING: A Try Running: wrapper block is required to scan incoming data.'",
        hint_text:
          "Unprotected telemetry will crash the radar! Pull out a 'Try Running: ... unless:' wrapper block first so the system can monitor for exceptions.",
      },
      {
        hint_id: "jupiter_2_missing_step_stream",
        mission_id: "jupiter-2",
        section: 0,
        error_type: "missing_step",
        concept_tag: "java_try_body",
        applies_when:
          "Triggers 'DATA STREAM INACTIVE: Snap the Start Data Stream block inside the Try Running: block to begin streaming data.'",
        hint_text:
          "Your 'Try Running:' block is empty! Snap the 'Start Data Stream' block inside the top section of 'Try Running:' to start scanning incoming packets.",
      },
      {
        hint_id: "jupiter_2_missing_step_catch",
        mission_id: "jupiter-2",
        section: 0,
        error_type: "missing_step",
        concept_tag: "java_catch_clause",
        applies_when:
          "Triggers 'DEFENSE GRID OFFLINE: Snap at least one When [error] occurs: rule into the unless: slot of the Try Running: block to intercept threats.'",
        hint_text:
          "You have a 'try' block, but no 'catch' defenses! Snap 'When [Exception] occurs:' blocks into the 'unless:' slot to intercept incoming errors.",
      },
      {
        hint_id: "jupiter_2_syntax_empty_catch",
        mission_id: "jupiter-2",
        section: 0,
        error_type: "syntax",
        concept_tag: "java_catch_handler_body",
        applies_when:
          "Triggers 'SYNTAX ERROR: Each When [error] occurs: rule requires an action block inside it to resolve the threat.'",
        hint_text:
          "Catching an exception isn't enough—you need to handle it! Snap a defense action block inside every 'When [error] occurs:' rule.",
      },
      {
        hint_id: "jupiter_2_logic_wave_exception_mismatch",
        mission_id: "jupiter-2",
        section: 1,
        error_type: "logic",
        concept_tag: "java_exception_matching",
        applies_when:
          "An incoming exception wave breaches the defense grid because the specific Exception type for the current wave (NullPointerException, ArithmeticException, NumberFormatException, ClassCastException, or general Exception) is missing.",
        hint_text:
          "An unhandled exception slipped past the shield! Check the threat readout for this wave and make sure you have a 'When [error] occurs:' block matching every active exception type.",
      },
    ],
  },
  "jupiter-3": {
    generic_hint:
      "Lock down the AI Core using Object-Oriented Programming: wrap your blueprint in 'public class UserProfile', declare encapsulated 'private' fields inside it, include your class methods, and instantiate 'new UserProfile(...)' at the end.",
    hints: [
      {
        hint_id: "jupiter_3_missing_step_class",
        mission_id: "jupiter-3",
        section: 0,
        error_type: "missing_step",
        concept_tag: "java_class_definition",
        applies_when:
          "Workspace is missing the outer 'public class UserProfile { ... }' wrapper block.",
        hint_text:
          "In Java, properties and methods must live inside a class blueprint! Start by placing the 'public class UserProfile' container block.",
      },
      {
        hint_id: "jupiter_3_logic_encapsulation",
        mission_id: "jupiter-3",
        section: 0,
        error_type: "logic",
        concept_tag: "java_private_encapsulation",
        applies_when:
          "Class fields like 'clearanceLevel' or 'role'/'badgeId' are missing or not declared as 'private' inside the class wrapper.",
        hint_text:
          "To prevent unauthorized tampering, use encapsulation! Snap the 'private' field blocks ('private int clearanceLevel;' and 'private String role;') inside 'public class UserProfile'.",
      },
      {
        hint_id: "jupiter_3_missing_step_methods",
        mission_id: "jupiter-3",
        section: 0,
        error_type: "missing_step",
        concept_tag: "java_class_methods",
        applies_when:
          "The class has private fields but is missing its constructor or public method blocks inside the class body.",
        hint_text:
          "Your fields are private, so the class needs a constructor and public methods inside 'UserProfile' to initialize and access them safely!",
      },
      {
        hint_id: "jupiter_3_missing_step_instantiate",
        mission_id: "jupiter-3",
        section: 0,
        error_type: "missing_step",
        concept_tag: "java_object_instantiation",
        applies_when:
          "The 'UserProfile' class blueprint is complete, but the 'new UserProfile(...)' instantiation block is missing.",
        hint_text:
          "A class is just a blueprint until you build an object from it! Use the 'new UserProfile(...)' instantiation block to create an active profile instance.",
      },
    ],
  },
};
