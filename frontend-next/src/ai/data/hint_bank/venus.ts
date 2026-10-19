import { SectionHints } from "./types";

export const venusHints: Record<string, SectionHints> = {
  "venus-1": {
    generic_hint:
      "Atmospheric visuals are looking dull, Explorer! Pick at least three Furniture Target blocks from the toolbox, snap style blocks inside them—including at least one border—and finish styling the Caption Banner.",
    hints: [
      {
        hint_id: "venus_1_syntax_empty",
        mission_id: "venus-1",
        section: 0,
        error_type: "syntax",
        concept_tag: "css_empty_workspace",
        applies_when:
          "The workspace is empty or triggers 'Your workspace is empty! Choose Furniture blocks from the toolbox and style them with Colors, Borders, or Typography.'",
        hint_text:
          "Your styling bay is empty! Grab a 'Target:' furniture block from the toolbox and snap color or border properties inside it to bring the lab to life.",
      },
      {
        hint_id: "venus_1_syntax_unattached_style",
        mission_id: "venus-1",
        section: 0,
        error_type: "syntax",
        concept_tag: "css_selector_wrapping",
        applies_when:
          "CSS property blocks like 'Set background-color:' or 'Set border:' are floating on the workspace instead of being nested inside a 'Target:' block.",
        hint_text:
          "Loose style properties won't know what furniture to paint! Snap your 'Set background-color:' and 'Set border:' blocks securely inside a 'Target:' container block.",
      },
      {
        hint_id: "venus_1_missing_step_count",
        mission_id: "venus-1",
        section: 0,
        error_type: "missing_step",
        concept_tag: "css_multiple_targets",
        applies_when:
          "Fewer than 3 furniture items have been styled on the workspace (totalStyled < 3).",
        hint_text:
          "The habitat still looks unfinished! Make sure you place and style at least three different 'Target:' furniture blocks from the toolbox.",
      },
      {
        hint_id: "venus_1_missing_step_border",
        mission_id: "venus-1",
        section: 0,
        error_type: "missing_step",
        concept_tag: "css_borders",
        applies_when:
          "No 'Set border:' block is used on any of the targeted items (!hasAnyBorder).",
        hint_text:
          "One of your lab items needs sharper edges! Snap a 'Set border:' block inside at least one of your furniture targets and pick a width, style, and color.",
      },
      {
        hint_id: "venus_1_missing_step_caption",
        mission_id: "venus-1",
        section: 0,
        error_type: "missing_step",
        concept_tag: "css_typography_banner",
        applies_when:
          "The 'Target: Caption Banner' block is missing or does not have custom text/typography styling applied (!captionValid).",
        hint_text:
          "Don't forget the station signage! Pull out the 'Target: Caption Banner' block and customize its text and styling so the crew can read the display.",
      },
    ],
  },
  "venus-2": {
    generic_hint:
      "Sensor panels are drifting out of alignment! For each Target Screen (#panel-1 through #panel-5), enable 'Set display: flex' first, then tune 'Set justify-content:' and 'Set align-items:' to match the target indicators.",
    hints: [
      {
        hint_id: "venus_2_syntax_empty_panel",
        mission_id: "venus-2",
        section: 0,
        error_type: "syntax",
        concept_tag: "flexbox_empty_container",
        applies_when:
          "The active screen container is empty or triggers 'Please add layout blocks inside your Target Screen container for #panel-...'",
        hint_text:
          "Telemetry screen is blank! Snap your Flexbox layout blocks inside the 'Style Screen:' container for the active panel.",
      },
      {
        hint_id: "venus_2_missing_step_display_flex",
        mission_id: "venus-2",
        section: 0,
        error_type: "missing_step",
        concept_tag: "flexbox_activation",
        applies_when:
          "'Set justify-content:' or 'Set align-items:' is used without first snapping 'Set display: flex' inside the 'Style Screen:' block.",
        hint_text:
          "Flex alignment rules won't fire until Flexbox is active! Snap 'Set display: flex' at the top of your 'Style Screen:' block first.",
      },
      {
        hint_id: "venus_2_wrong_output_justify",
        mission_id: "venus-2",
        section: 0,
        error_type: "wrong_output",
        concept_tag: "flexbox_justify_content",
        applies_when:
          "The horizontal/main-axis positioning of the sensor nodes does not match the target layout due to a missing or wrong 'Set justify-content:' value.",
        hint_text:
          "Your horizontal spacing is slightly off! Adjust the 'Set justify-content:' dropdown—try 'center', 'space-between', or 'space-around' to match the target outline.",
      },
      {
        hint_id: "venus_2_wrong_output_align",
        mission_id: "venus-2",
        section: 0,
        error_type: "wrong_output",
        concept_tag: "flexbox_align_items",
        applies_when:
          "The vertical/cross-axis positioning of the sensor nodes does not match the target layout due to a missing or wrong 'Set align-items:' value.",
        hint_text:
          "Check the vertical height of your sensor nodes! Use 'Set align-items:' inside the screen block to shift them to the top, middle ('center'), or bottom.",
      },
      {
        hint_id: "venus_2_missing_step_all_panels",
        mission_id: "venus-2",
        section: 0,
        error_type: "missing_step",
        concept_tag: "flexbox_multi_screen",
        applies_when:
          "The current panel is aligned, but one or more of the remaining screens (panel-1 through panel-5) have not been styled yet.",
        hint_text:
          "That panel is locked in, but other prototype screens are still misaligned! Check all five 'Style Screen:' panels to complete the calibration.",
      },
    ],
  },
  "venus-3": {
    generic_hint:
      "To restore the dead zones, make sure each sector stylesheet tab (alpha.css, beta.css, gamma.css) has color styling, link all three inside '<head>' on the Main tab, and place the AstroLink hub blocks.",
    hints: [
      {
        hint_id: "venus_3_missing_step_sector_styles",
        mission_id: "venus-3",
        section: 0,
        error_type: "missing_step",
        concept_tag: "css_external_rules",
        applies_when:
          "Validation triggers '... is/are missing colors! Open that/those tab(s) to add styling.'",
        hint_text:
          "One or more planetary sectors still have empty stylesheets! Switch into the alpha.css, beta.css, and gamma.css tabs and snap 'Set fill / background:' blocks inside each sector rule.",
      },
      {
        hint_id: "venus_3_missing_step_links",
        mission_id: "venus-3",
        section: 0,
        error_type: "missing_step",
        concept_tag: "html_link_stylesheet",
        applies_when:
          "Validation triggers 'Almost there! Connect ... inside the Page Header on the Main tab to establish the planetary uplink.'",
        hint_text:
          "Your stylesheets are written, but the Main page isn't connected to them! Open the Main tab and snap '<link rel=\"stylesheet\">' blocks for alpha.css, beta.css, and gamma.css inside the '<head>' block.",
      },
      {
        hint_id: "venus_3_missing_step_astrolink_hub",
        mission_id: "venus-3",
        section: 0,
        error_type: "missing_step",
        concept_tag: "html_inline_elements",
        applies_when:
          "Validation triggers 'All 3 sectors are colored! Now add the ... block in the Main tab (Astrolink category) to power the central hub.'",
        hint_text:
          "All three outer sectors are online! Head back to the Main tab, open the Astrolink category, and place the '<div class=\"tower\">' and '<div class=\"background\">' blocks to power the central hub.",
      },
      {
        hint_id: "venus_3_syntax_link_outside_head",
        mission_id: "venus-3",
        section: 0,
        error_type: "syntax",
        concept_tag: "html_head_structure",
        applies_when:
          "'<link rel=\"stylesheet\">' blocks are placed on the Main tab without being wrapped inside the '<head> ... </head>' container.",
        hint_text:
          "Stylesheet links belong in the document header! Make sure every '<link rel=\"stylesheet\">' block is snapped inside the '<head> ... </head>' block on the Main tab.",
      },
    ],
  },
};
