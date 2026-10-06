# Cutscene System Updates
**Date:** September 20, 2026

## 1. Core Cutscene Logic & Layout
* **Full-Screen Immersion:** Shifted `VisualNovelCutscene.tsx` to render over the entire viewport using React `createPortal` (`fixed inset-0 z-50`). This bypasses any inherited layout constraints.
* **Instant Start:** Removed the initial title divider scene from `introduction_scenes.json` so the animations begin the exact moment the user clicks "Start Journey."
* **Reset Bug Fixed:** Stabilized internal timer states and dependency callbacks (`onFinished`, `onMissionGate`) to prevent the cutscene from sporadically jumping back to the beginning.

## 2. Dialogue UI & Cosmetic Polish
* **Speaker Name Badges:** Shifted speaker names into an independent floating box anchored slightly above the main dialogue container with refined border radiuses.
* **Typographic Readability:** Scaled up font sizes significantly across the text body and UI elements for better legibility.
* **Centering Adjustments:** Increased the horizontal padding on the dialogue box (`px-12 sm:px-24`) to push the text lines closer to the center of the screen.
* **Progress Bar:** Replaced the text-based scene counter (`SCENE X / Y`) with a sleek visual progress bar that gradually fills up, while retaining the pulsing orange indicator dot.
* **Advance Hint:** Enlarged the "Click to continue / quick-reveal" text and glowing chevron.

## 3. Name Glitch & "Operator" Fallback 
* **The "Y/N" Glitch Fixed:** The dialogue used to randomly revert to "Y/N" when users skipped the typing animation. The logic was restructured so the user's fetched name is embedded into the text at the component level, guaranteeing it's used for both the slow typing effect and the quick-skip bypassing.
* **Graceful Degradation:** Modified the raw JSON data file (`introduction_scenes.json`), changing all literal instances of `"Y/N"` to `"Operator"`. If the server fails to fetch the user's name for any reason, the story gracefully defaults to addressing the user as "Operator" rather than a broken placeholder.

## 4. Skip Button & Story Summary Modal
* **Modal Trigger:** Clicking the "SKIP" button now pauses the cutscene, blurs the screen background (`backdrop-blur-sm`), and triggers a custom modal rather than instantly ejecting the user.
* **Modal Layout:** 
  * Features a custom top-overhanging "Story Summary" title and a bottom-overhanging "Next >" button.
  * The entire modal container is seamlessly overlaid with `stars_bg.png` sitting at 14% opacity.
* **Wobble Animation:** The `Nova_Shrug_Sideways.png` asset on the left side of the modal is powered by a custom-injected CSS keyframe (`animate-wobble`) that gracefully oscillates and rotates the character continuously.
* **Dynamic Content:** Created `src/data/story_summaries.json` to feed the summary paragraph into the modal dynamically.

## 5. Modules Transition & Reveal Animation
* **Routing Logic:** Advancing past the cutscene or completing the Story Summary modal safely routes the user to `/modules?fromCutscene=true`.
* **Smooth Reveal Overlay:** Implemented a new fade-reveal system in `ModulesClient.tsx`. 
  * The page detects if you arrived via the cutscene using `useSearchParams`. 
  * If true, it holds a solid pitch-black screen for 0.8 seconds (to hide loading flashes), then elegantly fades the black away into transparency over a sprawling 3-second CSS transition. 
  * If users manually navigate to `/modules`, the route skips this effect for a fast load. 

## 6. Asset Migration & Cleanup
* Assessed and migrated all localized assets (`Nova_Shrug_Sideways.png`, `stars_bg.png`) directly into the Next.js `public/scenes/` folder.
* Confirmed the external staging `scenes` folder was fully integrated and safely deletable.
