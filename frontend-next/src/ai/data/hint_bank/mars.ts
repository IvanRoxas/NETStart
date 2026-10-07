import { HintBankEntry, SectionHints } from "./types";

export const marsHints: Record<string, SectionHints> = {
  // Mars Level 1A: Fix Name Billboard (Headings & Paragraphs)
  "mars-1": {
    // TODO: [Melben] customize generic fallback hint for mars-1
    generic_hint: "Check that all headings and paragraphs on the billboard have matching opening and closing HTML tags.",
    hints: [
      {
        hint_id: "mars_1_syntax_unclosed_tag",
        mission_id: "mars-1",
        section: 1,
        error_type: "syntax",
        concept_tag: "html_syntax",
        applies_when: "An opening tag like <h1> or <p> is not properly closed with a matching </tag>.",
        // TODO: [Melben] customize hint copy
        hint_text: "Remember to close your HTML tags with a forward slash, such as </h1> or </p>.",
      },
      {
        hint_id: "mars_1_missing_heading",
        mission_id: "mars-1",
        section: 1,
        error_type: "missing_step",
        concept_tag: "heading_hierarchy",
        applies_when: "The main title is missing an <h1> tag.",
        // TODO: [Melben] customize hint copy
        hint_text: "The billboard needs a main title. Wrap the planet name inside an <h1> tag.",
      },
      {
        hint_id: "mars_1_missing_paragraph",
        mission_id: "mars-1",
        section: 1,
        error_type: "missing_step",
        concept_tag: "paragraph_formatting",
        applies_when: "The description text is rendered without a <p> tag.",
        // TODO: [Melben] customize hint copy
        hint_text: "Place the descriptive text inside a <p> tag so it displays as a proper paragraph.",
      },
      {
        hint_id: "mars_1_wrong_output_tag_level",
        mission_id: "mars-1",
        section: 1,
        error_type: "wrong_output",
        concept_tag: "heading_hierarchy",
        applies_when: "A smaller heading tag like <h6> was used instead of a primary heading.",
        // TODO: [Melben] customize hint copy
        hint_text: "Ensure you use the correct heading level (e.g. <h1> for primary, <h2> for secondary).",
      },
    ],
  },

  // Mars Level 1B: Fix Container Billboard (Div Structure)
  "mars-1-part2": {
    // TODO: [Melben] customize generic fallback hint for mars-1-part2
    generic_hint: "Use a container <div> to group related billboard elements together.",
    hints: [
      {
        hint_id: "mars_1b_syntax_unclosed_div",
        mission_id: "mars-1-part2",
        section: 1,
        error_type: "syntax",
        concept_tag: "div_closing",
        applies_when: "The opening <div> is not paired with a closing </div>.",
        // TODO: [Melben] customize hint copy
        hint_text: "Every <div> container must be closed with a matching </div> tag.",
      },
      {
        hint_id: "mars_1b_logic_nesting",
        mission_id: "mars-1-part2",
        section: 1,
        error_type: "logic",
        concept_tag: "element_nesting",
        applies_when: "Child elements are closed outside of the parent div tag.",
        // TODO: [Melben] customize hint copy
        hint_text: "Keep child tags like <h1> or <p> completely inside the opening and closing <div> tags.",
      },
      {
        hint_id: "mars_1b_missing_container",
        mission_id: "mars-1-part2",
        section: 1,
        error_type: "missing_step",
        concept_tag: "container_wrapper",
        applies_when: "Elements exist but are not wrapped inside a <div>.",
        // TODO: [Melben] customize hint copy
        hint_text: "Wrap your billboard elements inside a <div> to form a unified card container.",
      },
    ],
  },

  // Mars Level 2: Fix Images Billboard (Images)
  "mars-2": {
    // TODO: [Melben] customize generic fallback hint for mars-2
    generic_hint: "Verify that your <img> tag has both a valid src and an alt attribute.",
    hints: [
      {
        hint_id: "mars_2_syntax_closing_tag",
        mission_id: "mars-2",
        section: 2,
        error_type: "syntax",
        concept_tag: "void_elements",
        applies_when: "Student wrote </img> instead of treating <img> as self-closing / void.",
        // TODO: [Melben] customize hint copy
        hint_text: "The <img> tag is self-closing, meaning it does not need a closing </img> tag.",
      },
      {
        hint_id: "mars_2_missing_src",
        mission_id: "mars-2",
        section: 2,
        error_type: "missing_step",
        concept_tag: "image_src",
        applies_when: "The src attribute is missing or misspelled.",
        // TODO: [Melben] customize hint copy
        hint_text: "Add the src attribute to your <img> tag pointing to the image filename or URL.",
      },
      {
        hint_id: "mars_2_missing_alt",
        mission_id: "mars-2",
        section: 2,
        error_type: "missing_step",
        concept_tag: "accessibility_alt",
        applies_when: "The alt attribute is omitted.",
        // TODO: [Melben] customize hint copy
        hint_text: "Include an alt attribute (e.g. alt='Billboard preview') for accessibility and error fallbacks.",
      },
    ],
  },

  // Mars Level 3: Final AstroLink Repair (Hyperlinks)
  "mars-3": {
    // TODO: [Melben] customize generic fallback hint for mars-3
    generic_hint: "Ensure the anchor tag <a> contains a valid href attribute and clear link text.",
    hints: [
      {
        hint_id: "mars_3_syntax_quotes",
        mission_id: "mars-3",
        section: 3,
        error_type: "syntax",
        concept_tag: "attribute_syntax",
        applies_when: "Quotes are missing around the href attribute value.",
        // TODO: [Melben] customize hint copy
        hint_text: "Enclose your destination link in quotation marks, for example: href='https://...' or href='#'.",
      },
      {
        hint_id: "mars_3_missing_href",
        mission_id: "mars-3",
        section: 3,
        error_type: "missing_step",
        concept_tag: "anchor_href",
        applies_when: "The <a> tag has no href attribute.",
        // TODO: [Melben] customize hint copy
        hint_text: "An anchor tag requires an href attribute to define where the link should navigate.",
      },
      {
        hint_id: "mars_3_missing_link_text",
        mission_id: "mars-3",
        section: 3,
        error_type: "missing_step",
        concept_tag: "anchor_content",
        applies_when: "There is no text between <a> and </a>.",
        // TODO: [Melben] customize hint copy
        hint_text: "Add clickable label text between the opening <a> and closing </a> tags.",
      },
    ],
  },
};
