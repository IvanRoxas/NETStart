# PROGRESS_AUDIT.md

**Repository:** IvanRoxas/NETStart  
**Audit Date:** October 3, 2026  
**Auditor:** Antigravity AI Code Auditor  
**Workspace Root:** `c:\Users\Melben\Downloads\Netstart Actual`  

---

## 1. PROJECT OVERVIEW

### 1.1 Directory Tree (3 Levels Deep)
*(Excluding `node_modules`, `.next`, `.git`, `build`, and `pgdata`)*

```text
.
├── .agents/
│   └── AGENTS.md
├── .vscode/
│   └── settings.json
├── archive/
│   └── root_legacy_assets/
│       ├── Landing Page Assets/
│       ├── Missions/
│       ├── FloatingAstronaut.svg
│       ├── Landing Page BG.png
│       └── login page background.jpg
├── backend/
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
├── explainer docs/
│   └── progression level.md
├── frontend-next/
│   ├── Netstart-Blockly-componets/
│   ├── prisma/
│   │   ├── clean_locks.js
│   │   ├── schema.prisma
│   │   └── seed_admin.js
│   ├── public/
│   │   ├── assets/
│   │   ├── scenes/
│   │   ├── Earth-Python.svg
│   │   ├── Jupiter-Java.svg
│   │   ├── Mars-HTML.svg
│   │   ├── Mercury-JavaScript.svg
│   │   ├── PASSPORT DESIGN no box.webp
│   │   ├── PASSPORT DESIGN.webp
│   │   ├── Saturn-C++.svg
│   │   └── Venus-CSS.svg
│   ├── scripts/
│   │   └── list-models.mjs
│   ├── src/
│   │   ├── ai/
│   │   ├── app/
│   │   ├── components/
│   │   ├── context/
│   │   ├── data/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── server/
│   │   ├── types/
│   │   └── middleware.ts
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── AGENTS.md
│   ├── CLAUDE.md
│   ├── eslint.config.mjs
│   ├── EXPLAINER.md
│   ├── init.sql
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── passport-statistics.md
│   ├── postcss.config.mjs
│   ├── prisma.config.ts
│   ├── README.md
│   ├── test.png
│   ├── tsconfig.json
│   └── tsconfig.tsbuildinfo
├── New Assets/
│   ├── New Badges/
│   │   ├── AccountVerified.svg
│   │   ├── Aptitude Test.svg
│   │   └── ... (16 SVG badges)
│   ├── Point Shop Background/
│   │   └── ... (15 JPG wallpapers)
│   ├── Point Shop Profile/
│   │   └── ... (25 PNG portraits)
│   └── ... (10 pet icons)
├── staging/
│   ├── backgrounds/
│   ├── jupiter background/
│   ├── mars backgrounds/
│   ├── mercury background/
│   ├── saturn background/
│   ├── Venus backgroud/
│   ├── jupiter.json
│   ├── mars.json
│   ├── mercury.json
│   ├── moon.json
│   ├── saturn.json
│   ├── story_summaries.json
│   ├── venus.json
│   └── ... (16 character sprites)
├── .gitignore
├── AI and cutscenes.md
├── animations_and_cutscenes_2026-09-21.md
├── aptitude_test_plan.md
├── cutscene added.md
├── instructions.md
├── mars_cutscenes.md
├── restrictions.md
├── updated system.md
└── venus added.md
```

### 1.2 Languages, Frameworks, and Key Dependencies

#### Frontend Application (`frontend-next`)
*Source: [frontend-next/package.json](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/package.json)*
- **Language:** TypeScript 5.x (`typescript@^5`), Node.js (v20+ types)
- **Primary Framework:** Next.js 16.2.10 (App Router, Turbopack, Server Actions)
- **UI & Runtime Library:** React 19.2.4 (`react@19.2.4`, `react-dom@19.2.4`)
- **Styling:** Tailwind CSS 4.x (`tailwindcss@^4`, `@tailwindcss/postcss@^4`, PostCSS 8)
- **Database ORM & Drivers:**
  - Prisma Client & CLI: `prisma@^7.8.0`, `@prisma/client@^7.8.0`
  - Postgres Driver & Adapters: `pg@^8.22.0`, `@prisma/adapter-pg@^7.8.0`
  - Embedded Postgres (Dev/PGLite): `@electric-sql/pglite@^0.4.1`, `pglite-prisma-adapter@^0.7.2`, `prisma-pglite@^3.0.0`
- **Authentication:**
  - `@next-auth/prisma-adapter@^1.0.7`
  - `next-auth@4.24.14` *(Installed in `node_modules` and locked in `package-lock.json`, but missing from `package.json` dependencies)*
  - `bcryptjs@^3.0.3`
- **AI & LLM Integration:**
  - Google Gen AI SDK: `@google/genai@^2.25.0`
- **Blockly Visual Programming Engine:**
  - `blockly@^13.1.1`
- **Validation & Utility:**
  - `zod@^4.6.5`
  - `date-fns@^4.4.0`
  - `dotenv@^17.4.2`
- **Icons, Charts & Canvas:**
  - `lucide-react@^1.24.0`
  - `recharts@^3.10.1`
  - `html-to-image@^1.11.13`
  - `html2canvas@^1.4.1`
  - `react-image-crop@^11.1.2`
- **Mail Service:**
  - `nodemailer@^7.0.13`
- **Development Tooling:**
  - `concurrently@^10.0.4`, `wait-on@^9.1.0`, `eslint@^9`, `eslint-config-next@16.2.10`

#### Legacy Mock Backend (`backend`)
*Source: [backend/package.json](file:///c:/Users/Melben/Downloads/Netstart%20Actual/backend/package.json)*
- **Language:** JavaScript (CommonJS, Node.js)
- **Primary Framework:** Express 5.2.1 (`express@^5.2.1`)
- **Middleware & Auth:** `cors@^2.8.6`, `jsonwebtoken@^9.0.3`

### 1.3 Names of Required Environment Variables
*(Strictly names only; no secret values or credentials)*
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `AI_MOCK`
- `EMAIL_USER` (or `SMTP_USER`)
- `EMAIL_APP_PASSWORD` (or `SMTP_PASS`)
- `SMTP_HOST`
- `SMTP_PORT`
- `ADMIN_SEED_PASSWORD`
- `NEXT_PUBLIC_APP_URL`
- *(Requirement for YouTube fallback: `YOUTUBE_API_KEY` is specified in project documentation, but not present or used in the codebase)*

---

## 2. FUNCTIONAL REQUIREMENTS

| FR Code | Requirement | Status | Evidence (File & Symbol) | What's Missing / Blocked |
| :--- | :--- | :--- | :--- | :--- |
| **FR-01** | Google OAuth Authentication | **Partial** | [auth.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/lib/auth.ts#L28-L38) (`GoogleProvider`), [login/page.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/login/page.tsx#L144), [register/route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/auth/register/route.ts#L39) | `next-auth` missing from `frontend-next/package.json` dependencies. Separate Express backend [backend/server.js](file:///c:/Users/Melben/Downloads/Netstart%20Actual/backend/server.js#L36-L43) uses mock plaintext in-memory credentials without Google OAuth. |
| **FR-02** | Aptitude Diagnostic | **Partial** | [aptitude_questions.server.json](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/server/data/aptitude_questions.server.json), [aptitude/grade/route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/aptitude/grade/route.ts#L69-L258), [AptitudeTestClient.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/aptitude-test/AptitudeTestClient.tsx) | Disconnected Admin Question Bank: Questions managed in `AptitudeQuestion` DB table by admin are never served to students. Student quiz is hardcoded to 15 JSON questions. True/False and Short Answer questions are unsupported in quiz UI. |
| **FR-03** | Blockly Programming Sandbox | **Partial** | [BlocklyMaze.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/components/BlocklyMaze.tsx#L899-L920), [htmlBlocklyDefinitions.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/lib/mars/htmlBlocklyDefinitions.ts), [sandbox/page.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/sandbox/page.tsx) | **CSS, JS, Java, C++, and Python tracks are completely unimplemented in the sandbox**. Navigating to them defaults to Moon Level 1 rover grid. No server-side code execution container. Purely client-side `AsyncFunction` evaluation. |
| **FR-04** | Modular Progression / Adaptive Sequencing | **Partial** | [ModulesClient.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/modules/ModulesClient.tsx#L245-L260), [modules/[id]/page.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/modules/%5Bid%5D/page.tsx#L152-L168), [missions/complete/route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/missions/complete/route.ts#L106-L135) | **Progress is strictly linear, NOT adaptive**. `recommendedLearningPath` is only displayed as a text string and does not influence sequencing. **Blocking bug:** `modules/[id]/page.tsx` checks `>= 5` completed missions per planet to unlock the next, but planets only have 3 missions, blocking Venus and beyond. |
| **FR-05** | Student Readiness & Performance Dashboard | **Partial** | [dashboard/page.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/dashboard/page.tsx#L75-L235), [PassportStatsCard.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/components/PassportStatsCard.tsx#L40-L65), [HexagonStatsWeb.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/components/HexagonStatsWeb.tsx) | Aptitude scores (`logicScore`, `patternRecognitionScore`, `taskDecompositionScore`) are not displayed on `/dashboard`. In `PassportStatsCard.tsx`, radar chart checks obsolete `html-` and `css-` prefixes instead of `mars-` and `venus-`, showing 0% for completed tracks. Python, Java, C++ hardcoded to 0%. |
| **FR-06** | Admin Dashboard (Developer-Only) | **Done** | [admin/ClientLayout.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/admin/ClientLayout.tsx), [middleware.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/middleware.ts#L9-L25), [adminAuth.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/lib/adminAuth.ts), [admin/actions/aptitudeAdmin.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/admin/actions/aptitudeAdmin.ts) | Fully functional dedicated admin portal (User management, Shop configuration, Achievements, System audit logs, User bug reports). Gaps: Question bank does not sync to student quiz; lacks aggregate analytics dashboard. |

### Detailed Analysis of Functional Requirements

#### FR-01: Google OAuth Authentication
- **Provider & Library:** `next-auth` (v4.24.14) configured with `GoogleProvider` and `PrismaAdapter` in [src/lib/auth.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/lib/auth.ts#L25-L38).
- **Stored Passwords:**
  - Google OAuth users: **No stored passwords** (`password` field is `null` in `User` table; tokens stored in `Account` table).
  - Credentials registration ([src/app/api/auth/register/route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/auth/register/route.ts#L39)): Passwords are securely hashed with `bcryptjs` (salt rounds: 10).
  - Admin account: Password hashed using `bcryptjs` via [prisma/seed_admin.js](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/prisma/seed_admin.js#L24).
  - **Exception / Security Issue:** The separate mock Express server ([backend/server.js](file:///c:/Users/Melben/Downloads/Netstart%20Actual/backend/server.js#L35-L42)) stores raw plaintext passwords in an in-memory array (`users = []`).

#### FR-02: Aptitude Diagnostic
- **Question Set:** 15 multiple-choice questions (5 Pattern Recognition, 5 Task Decomposition, 5 Logical Reasoning) stored in static JSON at [src/server/data/aptitude_questions.server.json](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/server/data/aptitude_questions.server.json).
- **Scoring Logic:** Strictly deterministic algorithmic server-side grading in [src/app/api/aptitude/grade/route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/aptitude/grade/route.ts#L69-L146). Compares answers against static keys, computes percentages per category, assigns recommended learning paths based on thresholds (e.g. $\ge 80\%$ in pattern & logic $\to$ Fullstack Systems), updates `User` table via Prisma transaction (`logicScore`, `patternRecognitionScore`, `taskDecompositionScore`, `recommendedLearningPath`), and awards 150 XP + 50 gears.
- **How Gemini is Used:** Only invoked **after** database persistence (lines 215-258). Gemini generates qualitative personalized feedback (`summary` and `advice`) using [src/ai/prompts/aptitude.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/ai/prompts/aptitude.ts). If Gemini fails or times out, it falls back to deterministic rule-based advice via `getAptitudeFallback(aiContext)`.

#### FR-03: Blockly Programming Sandbox
- **Tracks Actually Working:**
  1. **Moon (Tutorial Track):** 3 fully functional levels in [BlocklyMaze.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/components/BlocklyMaze.tsx). Level 1 (rover 2D maze pathfinding), Level 2 (conveyor belt sorting simulation with repeat/if blocks), Level 3 (oxygen maze, fuel synthesis, flight simulator).
  2. **Mars (HTML Track):** 3 functional levels. Level 1 ([htmlBlocklyDefinitions.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/lib/mars/htmlBlocklyDefinitions.ts): headings & paragraph blocks), Level 2 ([marsLevel2Definitions.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/lib/mars/marsLevel2Definitions.ts): billboard images & captions), Level 3 ([marsLevel3Definitions.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/lib/mars/marsLevel3Definitions.ts): anchor hyperlinks and targets).
  3. **Venus (CSS), Mercury (JS), Jupiter (Java), Saturn (C++), Earth (Python):** **NOT WORKING**. In [BlocklyMaze.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/components/BlocklyMaze.tsx#L899-L920), any `missionId` not matching Moon or Mars defaults to `LEVEL_1_SECTIONS` (Moon Level 1 rover grid).
- **Execution Mechanism:** Purely client-side execution in browser runtime.
  - Moon: Code is converted to JavaScript via `javascriptGenerator.blockToCode`, instrumented with `await highlightBlock()`, and executed via `new AsyncFunction(...)` with injected simulation handlers ([BlocklyMaze.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/components/BlocklyMaze.tsx#L4096-L4097)).
  - Mars: Custom AST parsers (`parseWorkspaceHtml`, `parseMarsLevel2Workspace`, `parseMarsLevel3Workspace`) traverse Blockly XML/DOM nodes and validate tag hierarchies.
- **Pass/Fail Determination:** Evaluated against 3 section objectives. Moon checks simulation grid coordinates (`charState.x === goal.x`), obstacle collisions (`hitWall`, `steppedOnBomb`), and conveyor sorting counts (`validateConveyorVictory`). Mars checks AST property matching (`validation.matchedCount === 3`, `validation.hasEarthLink`).

#### FR-04: Modular Progression / Adaptive Sequencing
- **How Next Module is Chosen:** Progress is strictly linear: $\text{Moon} \to \text{Mars} \to \text{Venus} \to \text{Mercury} \to \text{Jupiter} \to \text{Saturn} \to \text{Earth}$.
- **Adaptive Sequencing Status:** **Missing**. The aptitude test recommendation (`recommendedLearningPath`) is purely cosmetic (rendered as a label in [ModulesClient.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/modules/ModulesClient.tsx#L493-L497)) and has zero effect on unlocking, skipping, or re-ordering modules.
- **Blocking Defect:** In [src/app/modules/[id]/page.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/modules/%5Bid%5D/page.tsx#L152-L168), the server-side route guard requires $\ge 5$ completed missions for Mars, Venus, Mercury, Jupiter, and Saturn:
  ```typescript
  const marsCompleted = getCompletedCount("mars") >= 5;
  ```
  Since each planet only provides 3 missions, `marsCompleted` can never reach 5. Although [ModulesClient.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/modules/ModulesClient.tsx#L246) checks $\ge 3$ and unlocks Venus on the map, clicking to enter `/modules/venus` triggers the server-side guard and shows "Module Locked".

#### FR-05: Student Readiness and Performance Dashboard
- **Main Dashboard (`/dashboard`):** Implemented in [src/app/dashboard/page.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/dashboard/page.tsx). Renders user XP, level calculations via [src/lib/leveling.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/lib/leveling.ts), current active planet track, daily rotating coding challenge with PHT midnight countdown, and daily tasks.
- **Profile / Passport Dashboard (`/profile`):** Implemented in [PassportStatsCard.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/components/PassportStatsCard.tsx) and [HexagonStatsWeb.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/components/HexagonStatsWeb.tsx). Renders a Recharts Radar Chart plotting 6 skill axes.
- **Gaps:**
  - Aptitude diagnostic scores are not surfaced on `/dashboard`.
  - [PassportStatsCard.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/components/PassportStatsCard.tsx#L41-L43) checks `id.startsWith('html-')` and `id.startsWith('css-')`, but actual mission IDs are `mars-1..3` and `venus-1..3`. As a result, completed levels fail to increment radar scores.
  - Python, Java, and C++ radar scores are hardcoded to `0`.

#### FR-06: Admin Dashboard (Developer-Only)
- **Features Implemented:**
  - User Management ([src/app/admin/users/page.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/admin/users/page.tsx)): Ban/unban, student ID verification, password reset, aptitude status reset, role management.
  - Shop Management ([src/app/admin/shop/page.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/admin/shop/page.tsx)): Create/edit items and pricing.
  - Achievements ([src/app/admin/achievements/page.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/admin/achievements/page.tsx)): Trigger code definitions, XP rewards.
  - System Logs ([src/app/admin/logs/page.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/admin/logs/page.tsx)): Audit trails logged by `logSystemAction`.
  - User Reports ([src/app/admin/reports/page.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/admin/reports/page.tsx)): Review bug reports and resolve tickets.
  - Aptitude Management ([src/app/admin/AptitudeManagement.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/admin/AptitudeManagement.tsx)): Question creator and AI question generator.
- **Access Restriction:** Enforced at edge via [src/middleware.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/middleware.ts#L9-L25) inspecting dedicated cookie `admin-next-auth.session-token` (or `__Secure-admin-next-auth.session-token`), requiring `adminToken.type === 'admin'`. Server actions verify `session.user.type === "admin"` via [src/lib/adminAuth.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/lib/adminAuth.ts).

---

## 3. CORE MECHANISMS

### 3.1 Gemini Integration
Every Gemini call site in the repository is detailed below:

| # | Call Site (File & Line) | Trigger / Purpose | Model Name | System & User Prompts | Error Handling & Retries | Rate Limiting & Caching |
| :- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | [aptitude/grade/route.ts:L232](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/aptitude/grade/route.ts#L232) | Post-diagnostic test completion: generates personalized summary & advice. | `process.env.GEMINI_MODEL` (configured as `gemini-3.8-flash` in `.env`, fallback text cites `gemini-2.5-flash`) | System: `NOVA_SYSTEM_INSTRUCTION` ([shared.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/ai/prompts/shared.ts)). Prompt: `getAptitudePrompt(aiContext)` ([aptitude.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/ai/prompts/aptitude.ts)). | 8s timeout via `Promise.race()`. 1 automatic retry on failure. If retry fails, falls back to deterministic template `getAptitudeFallback()`. | **No caching**. **No rate limiting** on endpoint. |
| **2** | [ai/evaluate/route.ts:L120](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/ai/evaluate/route.ts#L120) | Sandbox code failure: analyzes student pseudocode + JS and picks candidate hint. | `process.env.GEMINI_MODEL` | System: `NOVA_SYSTEM_INSTRUCTION`. Prompt: `getEvaluatePrompt()` ([evaluate.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/ai/prompts/evaluate.ts)). | 8s timeout. 1 automatic retry. Falls back to static hints from hint bank (`hint_bank/`). | In-memory 3000ms cooldown map per user (`Map<string, number>`). **No caching**. |
| **3** | [dev/ai-playground/actions.ts:L66](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/dev/ai-playground/actions.ts#L66) | Dev playground: interactive testing of prompt evaluation. | `process.env.GEMINI_MODEL` | System: `NOVA_SYSTEM_INSTRUCTION`. Prompt: `getEvaluatePrompt()`. | 8s timeout. 1 automatic retry. | Production-disabled route check. **No caching**. |
| **4** | [aptitudeAdmin.ts:L222](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/admin/actions/aptitudeAdmin.ts#L222) | Admin console: generates batches of new diagnostic questions. | `process.env.GEMINI_MODEL \|\| "gemini-2.5-flash"` | Direct REST call to `https://generativelanguage.googleapis.com/v1beta/models/...:generateContent`. Prompt: admin custom text or 3-question prompt. | Standard `try/catch`. On failure, falls back to hardcoded mock questions array. | **No rate limiting**. **No caching**. |

### 3.2 AI Queueing and Throttling
- **Message Bus / Queue:** **None**. There is no message bus, task queue (e.g. BullMQ, Celery, SQS), or asynchronous worker.
- **Throttling:** Every AI call executes synchronously within the HTTP request lifecycle. The only throttling is an in-memory 3-second cooldown (`COOLDOWN_MS = 3000`) in [api/ai/evaluate/route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/ai/evaluate/route.ts#L22), which resets whenever the server restarts and fails across multi-container deployments.

### 3.3 Hardcoded Hints
- **Storage Location:** [frontend-next/src/ai/data/hint_bank/](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/ai/data/hint_bank) (`index.ts`, `moon.ts`, `mars.ts`).
- **Coverage:** Only Moon missions (`moon-1`, `moon-2`, `moon-3`) and Mars missions (`mars-1`, `mars-2`, `mars-3`) have hardcoded hints. Hints for Venus, Mercury, Jupiter, Saturn, and Earth do not exist.
- **Trigger Mechanism:** Triggered when the student's code fails in [BlocklyMaze.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/components/BlocklyMaze.tsx#L1748). When `showErrorToast` is set, `requestAiHintEvaluation` posts to `/api/ai/evaluate`. If Gemini returns low confidence, fails, times out, or selects an invalid ID, the system selects `generic_hint` or a rule-matched hint from `hint_bank/`.

### 3.4 Error Threshold Counter
- **Counter Location:** `failureCount` column on `MissionProgress` model in Prisma ([schema.prisma](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/prisma/schema.prisma#L120)).
- **Database Increment:** In [api/ai/evaluate/route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/ai/evaluate/route.ts#L161), every evaluation increments `failureCount: { increment: 1 }`.
- **Threshold Value & Trigger Action:** **No threshold trigger exists in the code**. While the API returns `failureCount` in its JSON response ([route.ts:L187](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/ai/evaluate/route.ts#L187)), the client [BlocklyMaze.tsx:L1727](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/components/BlocklyMaze.tsx#L1727) completely ignores `failureCount`. There is no logic triggering interventions at 3, 5, or $N$ failures.

### 3.5 YouTube Fallback
- **Status:** **Missing / Stubbed**.
- **Evidence:**
  - [src/app/api/ai/video-query/route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/ai/video-query/route.ts#L11-L15) is a stub returning `{ message: "Video query endpoint placeholder.", status: "not_implemented" }`.
  - The only reference to YouTube in the entire codebase is marketing text in [src/app/what-we-offer/page.tsx:L10](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/what-we-offer/page.tsx#L10).
  - No YouTube Data API v3 integration, SDK, search queries, or curated video databases exist.

### 3.6 Client-Side Exposure of API Keys
- **Audit Result:** **Not Exposed**.
- **Verification:** All calls to `process.env.GEMINI_API_KEY`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, and `EMAIL_APP_PASSWORD` occur strictly inside Next.js server actions, API routes, or server components. No secret keys use the `NEXT_PUBLIC_` prefix.

---

## 4. DATABASE

### 4.1 Actual Schema vs. Planned ERD

| Planned ERD Table | Actual Database Entity | Model / Table Name | Columns Present | Keys & Indexes | Discrepancies vs. Planned ERD |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Users** | User Model | `users` | `user_id`, `username`, `display_name`, `email`, `email_verified`, `password`, `image`, `banner`, `status`, `bio`, `is_banned`, `created_at`, `showcasedBadges`, `student_id`, `is_verified`, `has_taken_aptitude_test`, `logic_score`, `pattern_recognition_score`, `task_decomposition_score`, `aptitude_result`, `recommended_learning_path`, `xp`, `gears`, `verified_reward_claimed`, `active_title` | PK: `user_id`. Unique: `username`, `display_name`, `email`, `student_id`. | Planned ERD separates Aptitude Assessment scores into an external table. Actual schema denormalizes aptitude results and gamification scores directly onto `users`. |
| **Aptitude_Assessments** | *None* | *None (Denormalized onto `users`)* | `logic_score`, `pattern_recognition_score`, `task_decomposition_score`, `aptitude_result`, `recommended_learning_path` on `users` table | N/A | **Table does not exist**. Historical assessment attempts are not stored; taking the test overwrites previous scores on the `users` row. |
| **Laboratory_Modules** | *None* | *None* | *None* | *None* | **Table does not exist**. Laboratory modules, missions, tracks, and metadata are hardcoded in application code ([MODULE_MISSIONS](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/modules/%5Bid%5D/page.tsx#L8-L74) and [pathNodes](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/modules/ModulesClient.tsx#L105-L200)). |
| **Student_Progress** | MissionProgress Model | `mission_progresses` | `id`, `user_id`, `mission_id`, `status`, `failure_count`, `submitted_code`, `completed_at`, `started_at` | PK: `id`. Unique: `[user_id, mission_id]`. FK: `user_id` $\to$ `users.user_id`. | Named `mission_progresses`. Tracks overall mission completion and failure counts, but does NOT track section-level progress in DB (sections are stored in browser `localStorage`). |
| **Intervention_Logs** | InterventionLog Model | `Intervention_Logs` | `id`, `user_id`, `mission_id`, `error_type`, `hint_id`, `prompt_version`, `confidence`, `fallback_used`, `timestamp` | PK: `id`. Index: `[user_id, mission_id]`. FK: `user_id` $\to$ `users.user_id`. | Matches planned design. Records error type, selected hint, prompt version, confidence, and fallback flags. |

#### Additional Tables Present in Actual Schema:
- **Authentication:** `accounts`, `sessions`, `verification_tokens`, `verification_codes`
- **Gamification & Social:** `achievements`, `user_achievements`, `friendships`, `notifications`
- **Point Shop:** `shop_items`, `user_inventories`
- **Administration & Audit:** `SystemAdmin`, `system_logs`, `audit_logs`, `reports`
- **Question Bank:** `aptitude_questions` *(Admin-managed question store)*

### 4.2 Migrations and Seed Data
- **Migrations Present:** **No**. The `frontend-next/prisma/migrations` directory does not exist. The repo relies on manual SQL execution ([init.sql](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/init.sql)) or `npx prisma db push`. Furthermore, `init.sql` is missing 8 tables that exist in `schema.prisma` (`shop_items`, `user_inventories`, `SystemAdmin`, `system_logs`, `audit_logs`, `aptitude_questions`, `reports`, `Intervention_Logs`).
- **Seed Data Present:**
  - Modules: **0 modules seeded in database** (all hardcoded in TypeScript).
  - Questions: **0 questions seeded in database**. [seed_admin.js](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/prisma/seed_admin.js) only seeds 1 admin account (`NETStart_Admin`). Diagnostic questions are read from `aptitude_questions.server.json` (15 questions).

---

## 5. API ROUTES

| Method | Path | Auth Required? | Purpose | Evidence |
| :--- | :--- | :---: | :--- | :--- |
| `GET`, `POST` | `/api/auth/[...nextauth]` | N | NextAuth student session handler (Google OAuth & Credentials). | [route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/auth/%5B...nextauth%5D/route.ts) |
| `POST` | `/api/auth/register` | N | Student account registration with bcrypt password hashing. | [route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/auth/register/route.ts) |
| `GET`, `POST` | `/api/admin-auth/[...nextauth]` | N | Dedicated NextAuth admin session handler. | [route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/admin-auth/%5B...nextauth%5D/route.ts) |
| `GET` | `/api/aptitude/questions` | N | Serves 15 diagnostic questions (stripped of answers/explanations). | [route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/aptitude/questions/route.ts) |
| `POST` | `/api/aptitude/grade` | Y (Student) | Grades diagnostic test, updates DB scores, triggers Gemini advice. | [route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/aptitude/grade/route.ts) |
| `POST` | `/api/ai/evaluate` | Y (Student) | Evaluates student code errors via Gemini and selects candidate hints. | [route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/ai/evaluate/route.ts) |
| `POST` | `/api/ai/video-query` | Y (Student) | **Placeholder / Stub** for video query recommendations. | [route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/ai/video-query/route.ts) |
| `POST` | `/api/missions/start` | Y (Student) | Records mission start timestamp (`startedAt`) in `MissionProgress`. | [route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/missions/start/route.ts) |
| `POST` | `/api/missions/complete` | Y (Student) | Marks mission completed, increments XP/gears, emits unlock event. | [route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/missions/complete/route.ts) |
| `POST` | `/api/daily-tasks/complete` | Y (Student) | Records completion of specific daily task, awards task XP/gears. | [route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/daily-tasks/complete/route.ts) |
| `POST` | `/api/daily-tasks/claim` | Y (Student) | Claims daily commission completion bonus (10 XP, 50 gears). | [route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/daily-tasks/claim/route.ts) |
| `GET` | `/api/profile` | Y (Student) | Retrieves student profile, showcased badges, and mission history. | [route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/profile/route.ts#L6) |
| `PUT` | `/api/profile` | Y (Student) | Updates profile fields (name, bio, banner, avatar, title, badges). | [route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/profile/route.ts#L102) |
| `GET` | `/api/profile/avatar` | N | Streams user avatar image buffer by query param `?id=...`. | [route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/profile/avatar/route.ts) |
| `POST` | `/api/settings` | Y (Student) | Updates account username and password. | [route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/settings/route.ts) |
| `PUT` | `/api/settings/security` | Y (Student) | Updates email or changes password (validates current password). | [route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/settings/security/route.ts#L8) |
| `DELETE` | `/api/settings/security` | Y (Student) | Deletes user account from database. | [route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/settings/security/route.ts#L75) |
| `GET` | `/api/users/search` | Y (Student) | Searches registered users by name/email and returns friend status. | [route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/users/search/route.ts) |
| `GET` | `/api/notifications` | Y (Student) | Retrieves user notification list. | [route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/notifications/route.ts) |
| `PATCH` | `/api/notifications/read-all` | Y (Student) | Marks all user notifications as read. | [route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/notifications/read-all/route.ts) |
| `GET` | `/api/notifications/unread-count`| Y (Student) | Returns count of unread notifications. | [route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/notifications/unread-count/route.ts) |
| `DELETE` | `/api/notifications/[id]` | Y (Student) | Dismisses / deletes a specific notification. | [route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/notifications/%5Bid%5D/route.ts) |
| `PATCH` | `/api/notifications/[id]/read` | Y (Student) | Marks a specific notification as read. | [route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/notifications/%5Bid%5D/read/route.ts) |
| `POST` | `/api/reports` | Y (Student) | Submits student bug or feedback report with optional attachments. | [route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/reports/route.ts) |
| `PATCH` | `/api/reports/[id]` | Y (Admin) | Updates report status (Admin authorization enforced). | [route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/reports/%5Bid%5D/route.ts) |

---

## 6. NON-FUNCTIONAL CHECK

### 6.1 Role-Based Access Control (RBAC) Enforced Server-Side?
- **Admin RBAC:** **Yes**. Enforced at two layers:
  1. Edge middleware ([src/middleware.ts:L9-L25](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/middleware.ts#L9-L25)) intercepts `/admin/:path*` and checks `adminToken.type === 'admin'`, redirecting unauthorized requests to `/admin-login`.
  2. Server actions ([src/app/admin/actions.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/admin/actions.ts#L22) and [aptitudeAdmin.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/admin/actions/aptitudeAdmin.ts#L20)) and API routes ([api/reports/[id]/route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/reports/%5Bid%5D/route.ts#L14)) verify `session.user.type === "admin"`.
- **Student RBAC & Gating:** Enforced via `middleware.ts` for `/dashboard`, `/profile`, `/sandbox`, `/missions`. Unverified users are blocked from sandbox routes.
- **Middleware Gap:** The `/modules` route is **omitted** from the `config.matcher` in [src/middleware.ts:L49](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/middleware.ts#L49). While `/modules` checks `getServerSession` in its Server Component ([modules/page.tsx:L13](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/modules/page.tsx#L13)), edge-level protection does not intercept it.

### 6.2 Input Validation and Rate Limiting
- **Input Validation:**
  - Robust: [api/ai/evaluate/route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/ai/evaluate/route.ts#L25-L41) uses strict Zod schemas with string bounds (`max(4000)`, `max(2000)`).
  - Basic: Most other API endpoints rely on manual `if (!field)` checks without schema validation or type sanitization.
- **Rate Limiting:**
  - [api/ai/evaluate/route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/ai/evaluate/route.ts#L22): In-memory map enforcing a 3-second cooldown per user.
  - [admin-login/page.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/admin-login/page.tsx): Tracks `failedLoginAttempts` in DB and sets `lockedUntil` after 5 failures.
  - **Missing on Public Endpoints:** `/api/auth/register`, `/api/aptitude/grade`, `/api/users/search`, and `/api/reports` have **no rate limiting**, leaving them vulnerable to registration spam, search enumeration, and denial-of-service attacks.

### 6.3 Hardcoded Credentials or Secrets in Repository
- **[CRITICAL]** [frontend-next/.env.example:L9](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/.env.example#L9) contains an exposed live Google Gemini API key:
  `GEMINI_API_KEY="[REDACTED_GEMINI_KEY]"`
- **[CRITICAL]** [frontend-next/.env](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/.env) is tracked/present in the workspace and contains live Google OAuth client credentials, Gmail SMTP app passwords, database URLs, and Gemini API keys.
- **[HIGH]** [backend/server.js:L7](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/../backend/server.js#L7) defines a hardcoded JWT signing secret:
  `const SECRET_KEY = '[REDACTED_SECRET_KEY]'`
- **[HIGH]** [frontend-next/prisma/seed_admin.js:L18](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/prisma/seed_admin.js#L18) defines a hardcoded fallback admin password:
  `seedPassword = '[REDACTED_DEV_ADMIN_PASSWORD]'`

### 6.4 Concurrency and Scalability Concerns
1. **Synchronous AI Calls:** Gemini calls in `/api/ai/evaluate` and `/api/aptitude/grade` block the Node.js request thread with an 8-second timeout and an immediate retry (up to 16 seconds total wait time). In a classroom setting where 30+ students run code simultaneously, this will cause socket timeouts, connection pool exhaustion, and Google rate-limit errors (429 RESOURCE_EXHAUSTED).
2. **In-Memory Cooldown State:** The cooldown map in `evaluate/route.ts` is an in-memory `Map<string, number>`. In serverless or load-balanced environments (Vercel, AWS ECS, Kubernetes), state is not shared across instances.
3. **Database Connection Limits:** In `.env`, `DATABASE_URL` specifies `connection_limit=10`. Under concurrent student load, 10 connections will be quickly starved.
4. **Large Uncompressed Media:** Multiple PNG background assets in `staging/` and `frontend-next/public` exceed 2.4 MB each (`Angry AI.png` is 2.46 MB, `Good AI.png` is 2.1 MB, `Nova Idle.png` is 1.74 MB), leading to network bottlenecks on school networks.

---

## 7. QUALITY AND DEPLOYMENT

### 7.1 Build and Install Validation

#### Build Test Result: **FAILED**
- **Command:** `npm run build` in `frontend-next`
- **Exit Code:** `1`
- **Real Output:**
  ```text
  > frontend-next@0.1.0 build
  > next build

  ▲ Next.js 16.2.10 (Turbopack)
  - Environments: .env
  - Experiments (use with caution):
    · serverActions

  ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
    Creating an optimized production build ...

  > Build error occurred
  Error: Turbopack build failed with 4 errors:
  ./src/data/jupiter.json:1:1
  Unable to make a module from invalid JSON
  > 1 | ﻿[
      | ^
    2 |   {
    3 |     "id": "jupiter-001",
    4 |     "type": "divider",

  expected value at line 1 column 1

  ./src/data/mercury.json:1:1
  Unable to make a module from invalid JSON
  ./src/data/saturn.json:1:1
  Unable to make a module from invalid JSON
  ./src/data/story_summaries.json:1:1
  Unable to make a module from invalid JSON
  ```
- **Cause:** `jupiter.json`, `mercury.json`, `saturn.json`, and `story_summaries.json` contain a leading UTF-8 Byte Order Mark (`\uFEFF`), which causes Turbopack's strict JSON parser to fail compilation.

#### Install Test Result: **Succeeded with Warnings**
- **Command:** `npm install --dry-run` in `frontend-next`
- **Exit Code:** `0`
- **Output:** Added 126 packages in 2s.
- **Warning:** `next-auth` is not listed in `frontend-next/package.json` `dependencies`. If `node_modules` is cleared and `package-lock.json` is not honored or pruned, `next-auth` fails to resolve.

### 7.2 Automated Test Suite
- **Test Command in `frontend-next`:** No test script configured in `package.json`.
- **Test Command in `backend`:** `npm test`
- **Exit Code:** `1`
- **Real Output:**
  ```text
  > backend@1.0.0 test
  > echo "Error: no test specified" && exit 1

  "Error: no test specified"
  ```
- **Test Files Present:** **0 test files in workspace** (excluding `node_modules`). There are zero unit tests, zero integration tests, and zero end-to-end tests.

### 7.3 TODO, FIXME, and Placeholder Occurrences

```text
frontend-next/src/app/api/ai/evaluate/route.ts:21
  // TODO: Move to a persistent store (such as Redis or Upstash) for multi-instance production deployment

frontend-next/src/ai/data/hint_bank/mars.ts:6, 16, 26, 36, 46, 54, 64, 74, 84, 92, 102, 112, 122, 130, 140, 150, 160
  // TODO: [Melben] customize generic fallback hint for mars-1
  // TODO: [Melben] customize hint copy (repeated 16 times across Mars levels)

frontend-next/src/ai/data/hint_bank/moon.ts:6, 16, 26, 36, 46, 54, 64, 74, 84, 92, 102, 112, 122, 130, 140, 150, 160
  // TODO: [Melben] customize generic fallback hint for moon-1
  // TODO: [Melben] customize hint copy (repeated 16 times across Moon levels)

frontend-next/src/components/PassportStatsCard.tsx:94
  <span className="text-[#ff912d]/40 font-mono text-[10px] lg:text-xs uppercase text-center px-2">
    [Avatar System Coming Soon]
  </span>

frontend-next/src/app/api/ai/video-query/route.ts:11-14
  // Shell placeholder for future video query features
  return NextResponse.json({
    message: "Video query endpoint placeholder.",
    status: "not_implemented",
  });
```

### 7.4 Deployment Configuration
- **Dockerfile / Containerization:** None.
- **Docker Compose:** None.
- **CI/CD Pipelines:** None (no `.github/workflows/` in repo root).
- **Infrastructure as Code (IaC):** None (no Terraform, Pulumi, CloudFormation, CDK).
- **Cloud Configuration:** None (no AWS/GCP/Vercel configuration files).

---

## 8. SUMMARY

### 8.1 Completion Status per Functional Requirement

| Requirement | Completion | Justification |
| :--- | :---: | :--- |
| **FR-01: Google OAuth Authentication** | **85%** | Production-grade NextAuth Google provider & bcrypt credential flows work; missing package.json dependency entry and dual-backend sync. |
| **FR-02: Aptitude Diagnostic** | **75%** | Full diagnostic flow, local deterministic grading, Gemini insight generation, and DB storage work; questions are static and disconnected from admin bank. |
| **FR-03: Blockly Programming Sandbox** | **35%** | Moon rover/conveyor/starship and Mars HTML billboard work well; CSS, JS, Java, C++, and Python tracks are completely unimplemented. |
| **FR-04: Modular Progression / Adaptive Sequencing** | **40%** | Visual constellation map and completion hooks exist, but progression is strictly linear (not adaptive) and blocked by a `>= 5` route guard defect. |
| **FR-05: Student Readiness & Performance Dashboard** | **70%** | Rich dashboard with XP, levels, PHT daily quests, and passport card works; aptitude scores missing from main view; radar mission IDs mismatched. |
| **FR-06: Admin Dashboard (Developer-Only)** | **90%** | Comprehensive admin console with user management, logs, reports, and shop configs; question bank does not propagate to student quiz. |
| **OVERALL PROJECT COMPLETION** | **66%** | Polished frontend presentation and functional Moon/Mars tracks, but blocked by build errors, missing tracks (5 of 7), and zero automated tests. |

### 8.2 Top 10 Gaps and Risks (Ordered by Severity)

1. **[CRITICAL] Production Build Failure (`npm run build` fails):**  
   Four JSON files in `src/data/` (`jupiter.json`, `mercury.json`, `saturn.json`, `story_summaries.json`) contain leading UTF-8 Byte Order Marks (`\uFEFF`). Next.js Turbopack fails immediately with 4 fatal compilation errors, completely blocking production deployments.
2. **[CRITICAL] Curriculum Lockout Bug in Route Guard:**  
   [src/app/modules/[id]/page.tsx:L153](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/modules/%5Bid%5D/page.tsx#L153) checks `getCompletedCount("mars") >= 5` to unlock Venus. Since Mars only has 3 missions, `marsCompleted` evaluates to `false` forever, blocking all access to Venus, Mercury, Jupiter, Saturn, and Earth.
3. **[CRITICAL] Five Out of Seven Programming Tracks Unimplemented in Sandbox:**  
   Venus (CSS), Mercury (JavaScript), Jupiter (Java), Saturn (C++), and Earth (Python) have no custom Blockly blocks, no code generators, and no simulation validation in [BlocklyMaze.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/components/BlocklyMaze.tsx). They default to Moon Level 1 rover grid.
4. **[HIGH] Secret Keys and Live Credentials Committed in Repository:**  
   A live Gemini API key is committed in [frontend-next/.env.example:L9](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/.env.example#L9). The workspace `.env` contains live Google OAuth client secrets, Gmail app passwords, and database credentials. Hardcoded secrets exist in [backend/server.js:L7](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/../backend/server.js#L7) and [prisma/seed_admin.js:L18](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/prisma/seed_admin.js#L18).
5. **[HIGH] Missing Dependency Declaration for `next-auth`:**  
   `next-auth` is imported across the application but is missing from `frontend-next/package.json` `dependencies`. Clean container builds running `npm install` without package-lock will fail.
6. **[HIGH] Automated Video Fallbacks & YouTube Data API v3 Completely Absent:**  
   Despite being featured in marketing copy ([what-we-offer/page.tsx](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/what-we-offer/page.tsx#L10)) and project specifications, [api/ai/video-query/route.ts](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/api/ai/video-query/route.ts) is an empty stub. No YouTube API client or video UI exists.
7. **[HIGH] Total Absence of Automated Testing:**  
   Zero unit, integration, or E2E tests exist across both front and back ends. `npm test` fails with code 1.
8. **[MEDIUM] Disconnected Diagnostic Question Bank:**  
   Aptitude questions created or edited in the Admin Console (`AptitudeQuestion` DB table) are never loaded by students. The student quiz API reads exclusively from a static JSON file.
9. **[MEDIUM] Passport Radar Chart Prefix Mismatch:**  
   [PassportStatsCard.tsx:L41-L43](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/components/PassportStatsCard.tsx#L41-L43) checks for `html-` and `css-` prefixes instead of `mars-` and `venus-`, resulting in 0% proficiency display for completed levels on student passports.
10. **[MEDIUM] Complete Lack of Deployment Configuration:**  
    No Dockerfile, docker-compose, CI workflows, or cloud deployment infrastructure exists in the project.

### 8.3 Documentation vs. Codebase Contradictions

1. **BOM Encoding Contradiction:**  
   In [AI and cutscenes.md:L100](file:///c:/Users/Melben/Downloads/Netstart%20Actual/AI%20and%20cutscenes.md#L100), the document asserts:  
   *"Re-encoded JSON files to strict UTF-8 without Byte Order Marks (BOM), eliminating runtime JSON.parse syntax errors."*  
   **Fact:** `jupiter.json`, `mercury.json`, `saturn.json`, and `story_summaries.json` still contain the UTF-8 BOM, causing `npm run build` to fail fatal compilation errors.
2. **Database Migrations Contradiction:**  
   In [AI and cutscenes.md:L67](file:///c:/Users/Melben/Downloads/Netstart%20Actual/AI%20and%20cutscenes.md#L67), the document claims:  
   *"Synced schema changes using Prisma migrations."*  
   **Fact:** The `frontend-next/prisma/migrations` folder does not exist. No Prisma migrations have ever been generated or applied.
3. **Automated Video Fallback Contradiction:**  
   In [src/app/what-we-offer/page.tsx:L10](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/what-we-offer/page.tsx#L10), the platform claims:  
   *"Our Error Threshold Counter tracks repeated logic loops, automatically embedding targeted YouTube tutorial videos to keep you moving forward."*  
   **Fact:** The error threshold counter does not trigger anything, the video query route is an un-implemented stub, and no YouTube player exists in the sandbox.
4. **Adaptive Learning Path Contradiction:**  
   In [aptitude_test_plan.md](file:///c:/Users/Melben/Downloads/Netstart%20Actual/aptitude_test_plan.md), the system states that student diagnostic scores will adaptively customize the learning sequence.  
   **Fact:** `recommendedLearningPath` is only printed as a decorative header string in [ModulesClient.tsx:L497](file:///c:/Users/Melben/Downloads/Netstart%20Actual/frontend-next/src/app/modules/ModulesClient.tsx#L497). The curriculum progression is 100% linear and identical for all students.
5. **Planned Database ERD Contradiction:**  
   Project plans reference 5 core tables (`Users`, `Aptitude_Assessments`, `Laboratory_Modules`, `Student_Progress`, `Intervention_Logs`).  
   **Fact:** Neither `Aptitude_Assessments` nor `Laboratory_Modules` exists as a database table. `Aptitude_Assessments` is denormalized onto `users`, while `Laboratory_Modules` is entirely hardcoded in client TypeScript files.
