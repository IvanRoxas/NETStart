# Mars Cutscenes Implementation Log
**Date and Time:** 2026-09-23 05:30:54 +08:00

## 1. Asset Migration & Setup
- Successfully transferred Mars character sprite assets from the `staging` directory to `frontend-next/public/scenes/characters/`.
- Included assets: `MARK.png`, `EMMA_G.png`, `PENNY_G.png`.

## 2. UI & Character Configuration (`VisualNovelCutscene.tsx`)
- Configured dedicated speaker profiles for **Mark**, **Emma G**, and **Penny G**, complete with unique color palettes, glowing borders, and specialized roles.
- Implemented a custom side-by-side rendering state for **"Emma G and Penny G"** so they appear together on-screen when speaking in unison.

## 3. Data Integration (`mars.json`)
- Linked the `mars.json` cutscene dialogue script to the main `sandbox/page.tsx` cutscene router.
- **Mission ID Standardization Bug Fix**: Discovered and fixed a critical bug where the JSON file used sub-level identifiers (`mars-1a`, `mars-2a`, `mars-3a`) which prevented the sandbox engine from locating the cutscenes. Replaced these with `mars-1`, `mars-2`, and `mars-3` to sync perfectly with the system router.
- **Dynamic Username Injection**: Replaced all hardcoded `"Y/N"` placeholders in the story dialogue with `"Operator"`. This allows the `VisualNovelCutscene` component to dynamically insert the logged-in player's actual username into the dialogue text and character nametags.

## 4. Cutscene Trigger Logic (`ModuleDetailsClient.tsx`)
- Overhauled the `skipCutscene` parameter logic to intelligently handle the four main player actions based on mission state:
  - **START (New Level)**: `skipCutscene=false` ➔ The cutscene plays fully, then transitions to the sandbox.
  - **RESUME (Active Level)**: `skipCutscene=true` ➔ Instantly resumes the user's progress in the sandbox, skipping the cutscene.
  - **REPLAY (Completed Level)**: `skipCutscene=false` ➔ Forces the cutscene to replay before launching the sandbox.
  - **RETRY (Completed Level)**: `skipCutscene=true` ➔ Directly launches the sandbox for practice, skipping the cutscene.

## 5. Environment Stability
- Resolved an environment crash caused by the `wait-on` library pinging the Prisma server port too early. Separated the backend database server and the Next.js frontend boot sequences to keep the Turbopack server stable.
