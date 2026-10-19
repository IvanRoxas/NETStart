import { SectionHints } from "./types";

export const mercuryHints: Record<string, SectionHints> = {
  "mercury-1": {
    generic_hint:
      "Biodome temperatures are critical! First target '#ventilation' by ID and run 'openVentilation()', then target both the sprinklers and the Star Flower so it receives both water and fertilizer.",
    hints: [
      {
        hint_id: "mercury_1_syntax_empty",
        mission_id: "mercury-1",
        section: 0,
        error_type: "syntax",
        concept_tag: "dom_empty_workspace",
        applies_when:
          "Workspace is empty or triggers 'Your workspace is empty! Add Target and Action blocks to start.'",
        hint_text:
          "The Biodome console is idle! Grab a 'Select by ID:' or 'Select by Class:' block from the toolbox and snap an action block inside it.",
      },
      {
        hint_id: "mercury_1_syntax_unattached_action",
        mission_id: "mercury-1",
        section: 0,
        error_type: "syntax",
        concept_tag: "dom_block_nesting",
        applies_when:
          "Triggers 'Check your blocks! Snap actions inside the container cutout.' or 'Your container is empty! Snap an action block inside.'",
        hint_text:
          "An action block needs to know which biodome device to control! Snap your action block directly inside the cutout of a 'Select by' container block.",
      },
      {
        hint_id: "mercury_1_syntax_unset_dropdown",
        mission_id: "mercury-1",
        section: 0,
        error_type: "syntax",
        concept_tag: "dom_selector_dropdown",
        applies_when:
          "Triggers 'Choose both a selector type and target from the dropdowns.'",
        hint_text:
          "One of your selector dropdowns is still unset! Pick both the selector method and the specific greenhouse target name on your block.",
      },
      {
        hint_id: "mercury_1_logic_broad_selector",
        mission_id: "mercury-1",
        section: 0,
        error_type: "logic",
        concept_tag: "dom_selector_specificity",
        applies_when:
          "Triggers 'Target is too broad! Pick a specific element.' because the student targeted a generic tag like 'div'.",
        hint_text:
          "Selecting every generic tag in the greenhouse will overload the system! Use 'Select by ID:' or 'Select by Class:' to target the exact equipment you need.",
      },
      {
        hint_id: "mercury_1_logic_vents_closed",
        mission_id: "mercury-1",
        section: 0,
        error_type: "logic",
        concept_tag: "execution_order_vents",
        applies_when:
          "Triggers 'The greenhouse is too hot to tend to the Star Flower! Turn on the vents first.'",
        hint_text:
          "It's scorching inside the dome! Before watering or fertilizing the Star Flower, target 'ventilation' by ID and run 'openVentilation()' at the top of your sequence.",
      },
      {
        hint_id: "mercury_1_missing_step_water",
        mission_id: "mercury-1",
        section: 0,
        error_type: "missing_step",
        concept_tag: "dom_class_action_water",
        applies_when:
          "Triggers 'The Star Flower received fertilizer, but it also needs water to fully bloom!'",
        hint_text:
          "The Star Flower has nutrients, but the soil is bone dry! Target the '.sprinkler' class and snap 'water(Sprinkler)' inside so it can bloom.",
      },
      {
        hint_id: "mercury_1_missing_step_fertilizer",
        mission_id: "mercury-1",
        section: 0,
        error_type: "missing_step",
        concept_tag: "dom_action_fertilize",
        applies_when:
          "Triggers 'The Star Flower received water, but it also needs fertilizer to fully bloom!'",
        hint_text:
          "The sprinklers are running, but the Star Flower still needs nutrients! Add a target for the Star Flower and run 'fertilize(Star Flower)'.",
      },
    ],
  },
  "mercury-2": {
    generic_hint:
      "To sort all 20 cargo crates on the conveyor belt, start with a 'Repeat 20 Times' loop. Inside the loop, scan the crate into a variable first, then use 'if / else if / else' branches to route each cargo type to its matching bay.",
    hints: [
      {
        hint_id: "mercury_2_syntax_empty",
        mission_id: "mercury-2",
        section: 0,
        error_type: "syntax",
        concept_tag: "js_loop_conditional_empty",
        applies_when:
          "Triggers 'Your workspace is empty! Add a Loop, Variable, and If/Else blocks.'",
        hint_text:
          "The conveyor belt is waiting for your sorting script! Start by dragging out a 'Repeat 20 Times' loop block from the toolbox.",
      },
      {
        hint_id: "mercury_2_missing_step_loop",
        mission_id: "mercury-2",
        section: 0,
        error_type: "missing_step",
        concept_tag: "js_repeat_loop",
        applies_when:
          "Triggers 'Add a Repeat block from Events / Loops to process the crates!' or 'Enter how many times to repeat the loop!'",
        hint_text:
          "One scan only handles a single crate! Wrap your sorting logic inside a 'Repeat 20 Times' block so the claw processes the entire shipment.",
      },
      {
        hint_id: "mercury_2_syntax_outside_loop",
        mission_id: "mercury-2",
        section: 0,
        error_type: "syntax",
        concept_tag: "js_loop_scoping",
        applies_when:
          "Triggers 'Place all logic blocks inside the Repeat loop!'",
        hint_text:
          "Some of your scanning or routing blocks are sitting outside the loop! Snap the scanner and all 'if / else' blocks inside the jaws of the 'Repeat' block.",
      },
      {
        hint_id: "mercury_2_missing_step_scanner",
        mission_id: "mercury-2",
        section: 0,
        error_type: "missing_step",
        concept_tag: "js_variable_assignment",
        applies_when:
          "Triggers 'The claw needs to scan each crate first! Add Read the X-Ray Scanner inside the loop.'",
        hint_text:
          "The claw is guessing blindly! Place 'let current_cargo = scan_crate()' (Read the X-Ray Scanner) at the very top inside your Repeat loop before checking any 'if' conditions.",
      },
      {
        hint_id: "mercury_2_syntax_missing_condition_var",
        mission_id: "mercury-2",
        section: 0,
        error_type: "syntax",
        concept_tag: "js_conditional_variable",
        applies_when:
          "Triggers 'Drag Scan Result into the empty slot of your If block!'",
        hint_text:
          "Your 'if' condition has an empty slot! Drag the 'current_cargo' (Scan Result) variable pill into your 'if' and 'else if' comparison slots.",
      },
      {
        hint_id: "mercury_2_logic_branch_order",
        mission_id: "mercury-2",
        section: 0,
        error_type: "logic",
        concept_tag: "js_if_else_hierarchy",
        applies_when:
          "Triggers 'Check the order of your If / Else blocks!' because 'else' or 'else if' blocks are placed before 'if'.",
        hint_text:
          "Conditional chains must start with 'if', followed by any 'else if' checks, and finish with the catch-all 'else' at the bottom.",
      },
      {
        hint_id: "mercury_2_missing_step_empty_branch",
        mission_id: "mercury-2",
        section: 0,
        error_type: "missing_step",
        concept_tag: "js_branch_action",
        applies_when:
          "Triggers 'Don't leave logic blocks empty! Snap a Send crate to block inside.'",
        hint_text:
          "One of your 'if / else' branches has no routing instruction inside it! Snap a 'Route to:' block into every branch so no crate gets stuck on the belt.",
      },
    ],
  },
  "mercury-3": {
    generic_hint:
      "Building the orbital transmitter requires all three tabs: assemble the form and '#sendBtn' in HTML, style the Flexbox layout and button colors in CSS, and attach a 'click' event listener that calls 'transmitSignal()' in JS.",
    hints: [
      {
        hint_id: "mercury_3_missing_step_multitab",
        mission_id: "mercury-3",
        section: 0,
        error_type: "missing_step",
        concept_tag: "fullstack_multitab_audit",
        applies_when:
          "Triggers 'Fix code requirements across all three tabs before running simulation.'",
        hint_text:
          "The transmitter needs all three layers working together! Check the audit checklist across the HTML, CSS, and JS tabs to see which layer still needs blocks.",
      },
      {
        hint_id: "mercury_3_missing_step_html",
        mission_id: "mercury-3",
        section: 0,
        error_type: "missing_step",
        concept_tag: "html_transmitter_form",
        applies_when:
          "HTML tab is missing the form container, planet dropdown, message box, or send/clear buttons.",
        hint_text:
          "In the HTML tab, make sure your form container holds the title, planet dropdown with options, message input box, and the Send/Clear buttons.",
      },
      {
        hint_id: "mercury_3_missing_step_css",
        mission_id: "mercury-3",
        section: 0,
        error_type: "missing_step",
        concept_tag: "css_transmitter_styling",
        applies_when:
          "CSS tab is missing selector wrappers, flex alignment, or color/border properties.",
        hint_text:
          "Switch to the CSS tab and wrap your Flexbox layout, gap, color picker, and glass border blocks inside the CSS selector containers.",
      },
      {
        hint_id: "mercury_3_logic_js_listener",
        mission_id: "mercury-3",
        section: 0,
        error_type: "logic",
        concept_tag: "js_event_listener_click",
        applies_when:
          "JS tab is missing the element selector, the 'addEventListener' click wrapper, or the 'beam_signal' / 'clear_message' actions inside the listener.",
        hint_text:
          "In the JS tab, select the Send button element, attach an 'addEventListener' block for 'click', and snap the signal transmission blocks inside the listener!",
      },
    ],
  },
};
