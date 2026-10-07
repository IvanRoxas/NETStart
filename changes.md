# Summary of Changes & Updates

## 1. Dynamic Aptitude Test & Planet Learning Path System
* **Curriculum-Enforced Track Ordering (`src/ai/pathUtils.ts`)**:
  * Implemented deterministic track computation from raw category scores (`LOGIC`, `WEB`, or `BALANCED`).
  * Enforced fixed curriculum order for the Web track: `MARS (HTML) -> VENUS (CSS) -> MERCURY (JavaScript)`.
  * Implemented affinity-based sorting for Logic planets (`JUPITER`, `SATURN`, `EARTH`), applying a tie-break rule where affinity differences under 5 points fall back to default order.
  * Implemented `BALANCED` interleaving (`web1, logic1, web2, logic2, web3, logic3`), starting with Web. If all three category scores are equal, defaults to the canonical solar system order.
* **Prompt Refinement & Constructive Tone (`src/ai/prompts/aptitude.ts`)**:
  * Tuned Gemini prompts to maintain positive and encouraging pedagogical tone, preventing the model from describing students as "weak" or "deficient".
  * Added planet descriptions and context to help Gemini generate clear, personalized recommendations for each student.
* **Gemini Client & Latency Optimization (`src/ai/client.ts`)**:
  * Upgraded `@google/genai` integration with configurable `thinkingConfig` (using `ThinkingLevel.MINIMAL` by default via `GEMINI_THINKING_LEVEL`).
  * Added request timeout handling (`GEMINI_TIMEOUT_SECONDS`) with single-retry logic and telemetry logging.
  * Tested live profiles and recorded latency and accuracy metrics in `profiles_results.json`.
  * Created analysis scripts:
    * `scripts/test_gemini_profiles.ts`: Live batch benchmark tool across student aptitude archetypes.
    * `scripts/threshold_counter.ts`: Computed track distribution across all 216 score permutations.

---

## 2. AI Failure Handling & Silent Background Retry
* **Fallback Path Guarantee**:
  * On Gemini failure, invalid API keys, timeout, or schema mismatch, the system safely assigns the canonical fallback path (`MOON, MARS, VENUS, MERCURY, JUPITER, SATURN, EARTH`) with `isFallback = true` so students progress uninterrupted.
* **Background Retry Endpoint (`src/app/api/aptitude/retry/route.ts`)**:
  * Implemented background endpoint triggered by the modules view when `isFallback` is active.
  * Added per-user cooldown (`GEMINI_RETRY_COOLDOWN_MIN`, default 10m) and attempt caps (`GEMINI_MAX_RETRIES`, default 5).
  * Automatically re-grades the assessment in the background and updates the user's `pathOrder` and reasons once Gemini succeeds.
* **Database Schema Additions (`prisma/schema.prisma`)**:
  * Added `isFallback`, `fallbackRetryAttempts`, and `lastFallbackRetryAt` fields to the `User` model.

---

## 3. Modules Page & Planet Unlocking Logic
* **Unlock Override Rule (`src/lib/unlockLogic.ts`)**:
  * Recomputed unlocked planets dynamically at render time without locking students out of started or completed planets:
    $$\text{Effective Unlocked} = (\text{Sequential Path Unlocks}) \cup (\text{Planets with In-Progress or Completed Missions})$$
  * Even when a background retry shifts planet positions, started planets remain permanently accessible.
* **Unified Mission Identifier Lookup (`src/lib/missionMapper.ts`)**:
  * Created shared mapping helper to normalize both legacy and modern mission ID styles (e.g., `mars-1` vs `html-1`, `saturn-2` vs `cpp-2`).
* **UI Updates (`src/app/modules/ModulesClient.tsx` & `src/components/PlanetNode.tsx`)**:
  * Integrated Gemini's personalized recommendation reasoning cards directly into the planet node hover/focus tooltips.
  * Connected silent fallback retry triggers on page mount.

---

## 4. Adaptive Hint Tier System
* **Pure Utility (`src/lib/hints.ts`)**:
  * Implemented `getHintTier(scores)`: Classifies student aptitude into `TIER_1` (Advanced), `TIER_2` (Proficient), or `TIER_3` (Foundational).
  * Implemented `getHintDelayMultiplier(tier)`: Calculates hint cooldown delay multipliers based on environment variables (`HINT_DELAY_LOW`, `HINT_DELAY_MID`, `HINT_DELAY_HIGH`).

---

## 5. Visual Novel Cutscenes & Asset Normalization
* **Asset Optimization & Repair**:
  * Replaced corrupted JPG scene backgrounds with high-resolution PNG assets across Jupiter (`jupiter_bg_002.png` - `004.png`), Saturn (`saturn_bg_001.png` - `004.png`), and Mars (`mars_bg_001.png` - `002.png`).
  * Standardized character sprites in `public/scenes/characters/` (added missing `ATLAS.png`, `TITAN.png`, and director aliases).
* **Story & Scene Data**:
  * Updated dialog scripts and scene triggers in `src/data/jupiter.json`, `src/data/saturn.json`, `src/data/mars.json`, and `src/data/mercury.json`.
  * Polished cutscene transitions in `src/components/VisualNovelCutscene.tsx`.

---

## 6. Curriculum Mapping & Architecture Audit
* **Level Topics & Concepts Audit**:
  * Documented all 18 core levels across the 6 main planets:
    * **Mars (HTML)**: Level 1 (Text & Headings), Level 2 (Images & Captions), Level 3 (Hyperlinks & Forms).
    * **Venus (CSS)**: Level 1 (Colors & Borders), Level 2 (Layout & Alignment), Level 3 (CSS Linking & Overrides).
    * **Mercury (JavaScript)**: Level 1 (DOM Selection), Level 2 (Functions & Events), Level 3 (Full-Stack Interface).
    * **Jupiter (Java)**: Level 1 (Data Types & Variables), Level 2 (Try/Catch Exceptions), Level 3 (Classes & Objects).
    * **Saturn (C++)**: Level 1 (Cin/Cout & Variables), Level 2 (Loops & Switch-Case), Level 3 (Pointers & Memory).
    * **Earth (Python)**: Level 1 (Data Types & Slicing), Level 2 (Dictionaries & Lists), Level 3 (Modules & Functions).
* **YouTube Fallback Architecture Review**:
  * Prepared an engineering state report inspecting Next.js version, database schemas, NextAuth session handling, Blockly browser-side validation, failure tracking (`failureCount`), and admin route safeguards.
