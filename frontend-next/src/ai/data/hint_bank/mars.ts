import { HintBankEntry, SectionHints } from "./types";

export const marsHints: Record<string, SectionHints> = {
  // Mars Level 1A: Fix Name Billboard (Headings & Paragraphs)
  "mars-1": {
    generic_hint: "Great start on the billboard! Check that every piece of text has a opening and closing tag to keep the display neat.",
    hints: [
      {
        hint_id: "mars_1_syntax_unclosed_tag",
        mission_id: "mars-1",
        section: 1,
        error_type: "syntax",
        concept_tag: "html_syntax",
        applies_when: "An opening tag like <h1> or <p> is not properly closed with a matching </tag>.",
        hint_text: "Every tag you open needs a matching closing partner with a slash, like wrapping a gift neatly.",
      },
      {
        hint_id: "mars_1_missing_heading",
        mission_id: "mars-1",
        section: 1,
        error_type: "missing_step",
        concept_tag: "heading_hierarchy",
        applies_when: "The main title is missing an <h1> tag.",
        hint_text: "Every great billboard needs a big headline at the top. Wrap your title so it stands out above the rest.",
      },
      {
        hint_id: "mars_1_missing_paragraph",
        mission_id: "mars-1",
        section: 1,
        error_type: "missing_step",
        concept_tag: "paragraph_formatting",
        applies_when: "The description text is rendered without a <p> tag.",
        hint_text: "Body text reads best when it is marked as a story paragraph. Group your description text into a paragraph container.",
      },
      {
        hint_id: "mars_1_wrong_output_tag_level",
        mission_id: "mars-1",
        section: 1,
        error_type: "wrong_output",
        concept_tag: "heading_hierarchy",
        applies_when: "A smaller heading tag like <h6> was used instead of a primary heading.",
        hint_text: "The headline looks a bit small on the screen! Heading sizes follow a hierarchy from largest to smallest—aim for the top tier.",
      },
    ],
  },

  // Mars Level 1B: Fix Container Billboard (Div Structure)
  "mars-1-part2": {
    generic_hint: "You're building great structure! Make sure your billboard pieces are grouped together inside a single card.",
    hints: [
      {
        hint_id: "mars_1b_syntax_unclosed_div",
        mission_id: "mars-1-part2",
        section: 1,
        error_type: "syntax",
        concept_tag: "div_closing",
        applies_when: "The opening <div> is not paired with a closing </div>.",
        hint_text: "Your layout container is still open! Place a closing tag at the end so the browser knows where the card finishes.",
      },
      {
        hint_id: "mars_1b_logic_nesting",
        mission_id: "mars-1-part2",
        section: 1,
        error_type: "logic",
        concept_tag: "element_nesting",
        applies_when: "Child elements are closed outside of the parent div tag.",
        hint_text: "Keep everything tucked inside! Make sure inner elements close before the outer container finishes.",
      },
      {
        hint_id: "mars_1b_missing_container",
        mission_id: "mars-1-part2",
        section: 1,
        error_type: "missing_step",
        concept_tag: "container_wrapper",
        applies_when: "Elements exist but are not wrapped inside a <div>.",
        hint_text: "To make your billboard move and style as one piece, wrap all the parts inside a single layout box.",
      },
    ],
  },

  // Mars Level 2: Fix Images Billboard (Images)
  "mars-2": {
    generic_hint: "Looking sharp! Make sure your image knows where to find its picture file and has a description ready.",
    hints: [
      {
        hint_id: "mars_2_syntax_closing_tag",
        mission_id: "mars-2",
        section: 2,
        error_type: "syntax",
        concept_tag: "void_elements",
        applies_when: "Student wrote </img> instead of treating <img> as self-closing / void.",
        hint_text: "Images are special standalone elements in HTML—they stand on their own without needing an extra closing tag.",
      },
      {
        hint_id: "mars_2_missing_src",
        mission_id: "mars-2",
        section: 2,
        error_type: "missing_step",
        concept_tag: "image_src",
        applies_when: "The src attribute is missing or misspelled.",
        hint_text: "The image frame is blank! Give your picture element an attribute that tells the browser the exact file location.",
      },
      {
        hint_id: "mars_2_missing_alt",
        mission_id: "mars-2",
        section: 2,
        error_type: "missing_step",
        concept_tag: "accessibility_alt",
        applies_when: "The alt attribute is omitted.",
        hint_text: "Every explorer needs accessibility! Add a short text description so screen readers can describe the picture.",
      },
    ],
  },

  // Mars Level 3: Final AstroLink Repair (Hyperlinks)
  "mars-3": {
    generic_hint: "AstroLink is almost online! Check that your links have a destination address and words for astronauts to click.",
    hints: [
      {
        hint_id: "mars_3_syntax_quotes",
        mission_id: "mars-3",
        section: 3,
        error_type: "syntax",
        concept_tag: "attribute_syntax",
        applies_when: "Quotes are missing around the href attribute value.",
        hint_text: "Attribute values need to stay together! Wrap your destination address in quote marks so the browser reads the full link.",
      },
      {
        hint_id: "mars_3_missing_href",
        mission_id: "mars-3",
        section: 3,
        error_type: "missing_step",
        concept_tag: "anchor_href",
        applies_when: "The <a> tag has no href attribute.",
        hint_text: "The link button has nowhere to go yet! Add a destination reference attribute pointing to your target coordinates.",
      },
      {
        hint_id: "mars_3_missing_link_text",
        mission_id: "mars-3",
        section: 3,
        error_type: "missing_step",
        concept_tag: "anchor_content",
        applies_when: "There is no text between <a> and </a>.",
        hint_text: "The link works, but nobody can see where to click! Put some descriptive words between your link tags.",
      },
    ],
  },
};
