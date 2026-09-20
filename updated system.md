# NETStart System Architecture & User Flow
**Document:** Flow Analysis from Login to Modules
**Date:** September 20, 2026

This document details the current state of the application's core user journey, focusing on file interactions, recent changes, and exactly how the system routes a user from their initial login through the cutscene and onto the interactive curriculum.

---

## 1. The User Journey Flow

### Phase 1: Authentication & Gating
When a user logs into the platform, they are authenticated via NextAuth. If they attempt to navigate to the core learning curriculum (`/modules`), the system intercepts them:
* **Unverified Users:** Blocked by a rigid modal forcing them to verify their email (redirects to `/dashboard`).
* **Untested Users:** If verified but lacking an aptitude score, they are locked out by a glowing diagnostic modal. They are forced to click "Take Assessment Now," routing them to `/aptitude-test?openModal=true`.

### Phase 2: The Assessment & Cutscene Engine
Once in `/aptitude-test`, the user goes through a multi-state progression:
1. `BRIEFING`: Instructions and context.
2. `QUIZ`: The actual aptitude diagnostic.
3. `COMPLETED`: Score calculation and database update.
4. `CUTSCENE`: The narrative reward. At this stage, the Next.js app mounts the `VisualNovelCutscene` component in full-screen over the DOM.

### Phase 3: The Narrative & Resolution
Inside the cutscene, the user is fed a dialogue sequence pulled from JSON data. 
* They can click through the slow-typing text.
* They can hit "SKIP", which pauses the narrative and triggers a central **Story Summary** popup (bypassing the long dialogue but ensuring they understand the lore).
* Upon finishing either the cutscene or the summary, the component fires a client-side routing event pushing them back to `/modules`, but this time appending a URL parameter: `?fromCutscene=true`.

### Phase 4: The Dramatic Reveal
Landing back on `/modules`, the client-side code intercepts the URL parameter. Because they just came from a narrative experience, the screen starts completely pitch black, holding for a split second to cover up loading times, and then slowly and dramatically fades out over 3 seconds to reveal the unlocked interactive planetary map.

---

## 2. File Architecture & Interactions

Here is how the specific files we updated interact to make this flow possible:

### `frontend-next/src/app/modules/ModulesClient.tsx`
* **Role:** The core dashboard and interactive planetary map (HTML, CSS, JS, React).
* **Interactions:** Acts as the traffic cop. It reads database stats passed down from `page.tsx` and conditionally blocks the UI with modals if `isVerified` or `hasTakenAptitudeTest` are false.
* **Recent Changes:** Imported `useSearchParams` to sniff the URL for `fromCutscene=true`. We added React state logic and CSS tailwind transitions (`animate-[fadeOut]`) to generate the 3-second black overlay reveal.

### `frontend-next/src/app/aptitude-test/AptitudeTestClient.tsx`
* **Role:** Manages the diagnostic test lifecycle.
* **Interactions:** Keeps track of a state machine (`viewState`). Once the quiz is over, it flips to the `'CUTSCENE'` state and injects `VisualNovelCutscene`.
* **Recent Changes:** We updated the `onFinished` callback provided to the cutscene. Instead of just refreshing or pushing to the dashboard, it executes a clean, client-side route: `router.push('/modules?fromCutscene=true')`.

### `frontend-next/src/components/VisualNovelCutscene.tsx`
* **Role:** The engine rendering the dialogue, backgrounds, sprites, and animations.
* **Interactions:** Ingests the JSON data arrays. Uses React `createPortal` to break out of the standard CSS layout and render directly onto `document.body`. 
* **Recent Changes:**
  * Added the `showSummaryModal` state to intercept the "SKIP" button.
  * Overhauled the UI (rounded nested speaker boxes, padded text, animated chevrons).
  * Built the "Story Summary" modal UI, featuring a custom injected `<style>` block for Nova's `animate-wobble` effect.

### `frontend-next/src/data/introduction_scenes.json`
* **Role:** The database holding the sequential narrative frames, speaker names, and background references.
* **Interactions:** Directly imported and mapped over by `VisualNovelCutscene.tsx`.
* **Recent Changes:** Replaced all hardcoded `"Y/N"` placeholders with `"Operator"`. This acts as a graceful fail-safe; if the NextAuth session fails to fetch the user's name, the cutscene seamlessly defaults to calling them Operator.

### `frontend-next/src/data/story_summaries.json`
* **Role:** A new dedicated data store for condensed lore.
* **Interactions:** Imported by `VisualNovelCutscene.tsx` and injected specifically into the skip modal.
* **Recent Changes:** Created entirely from scratch today to hold the `skip_summary` text block.

### The Asset Pipeline (`frontend-next/public/scenes/`)
* **Role:** The directory serving raw media.
* **Interactions:** The cutscene engine uses relative paths (`/scenes/backgrounds/bg_001.png`, `/scenes/stars_bg.png`) to effortlessly render these on the client side without needing heavy Webpack imports.
* **Recent Changes:** Migrated external staging assets into this folder so they are properly bundled by Next.js.
