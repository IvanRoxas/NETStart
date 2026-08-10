# NETStart System Architecture

This document provides an in-depth, extremely detailed overview of the NETStart frontend system architecture, explaining the directory structure, file roles, and how components interact to build the full-stack web application.

## Overview

NETStart is built as a modern full-stack web application using **Next.js (App Router)**. It integrates:
- **Frontend**: React, Tailwind CSS, Lucide React (for icons)
- **Backend/API**: Next.js API Routes (`src/app/api/...`)
- **Database**: PostgreSQL (specifically via `PGlite` for local development) accessed via **Prisma ORM**
- **Authentication**: NextAuth.js
- **Specialized UI**: Google Blockly (for visual programming blocks), `react-image-crop` for avatars.

The legacy `backend` directory appears to be deprecated in favor of Next.js's integrated API routes in `frontend-next`.

---

## High-Level Directory Structure

```text
frontend-next/
├── prisma/                 # Database schema and seed data
├── public/                 # Static assets (images, icons)
├── src/                    # Source code for the application
│   ├── app/                # Next.js App Router (Pages & API Routes)
│   ├── components/         # Reusable React components
│   ├── lib/                # Utilities, configs, and helper functions
│   └── types/              # TypeScript type definitions
├── .env                    # Environment variables (Database URL, Secrets)
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies and scripts
└── postcss.config.mjs / eslint.config.mjs / tailwind.config... # Tooling configs
```

---

## Detailed Directory and File Breakdown

### 1. `prisma/` (Database Layer)
- **`schema.prisma`**: The single source of truth for the database schema. It defines models like `User`, `Account`, `Session`, `Achievement`, `MissionProgress`, `Notification`, and `ShopItem`. It configures the PostgreSQL provider.
- **`seed_admin.js`**: A seed script run during initialization to populate the database with default data (like a default admin account or standard achievements/shop items).
- **`migrations/`**: Auto-generated SQL files that track changes to the database schema over time.

### 2. `src/lib/` (Core Libraries & Utilities)
This folder houses critical backend utilities that bridge the gap between the Next.js API/frontend and the database/external services.
- **`auth.ts`**: Configures **NextAuth.js**. It instantiates the PrismaClient and sets up the Google OAuth provider and a custom Credentials provider. It also handles custom session callbacks (adding `isVerified`, `xp`, `studentId`, `activeTitle` to the JWT session token).
- **`adminAuth.ts`**: Likely handles specialized authentication logic or guards for the Admin dashboard.
- **`mail.ts`**: Uses `nodemailer` to send automated emails (e.g., verification codes, password resets) using the credentials specified in `.env`.
- **`leveling.ts` / `xp.ts`**: Contains the logic and mathematical formulas for the gamification system (calculating levels based on XP).
- **`badgesData.ts`**: Static definitions for badges and achievements available in the system.
- **`customblocks.js`**: Custom block definitions for Google Blockly, tailored to the platform's educational missions.

### 3. `src/app/` (Routing and Pages)
Next.js 13+ App Router uses the filesystem to define routes. Every folder represents a route segment, and `page.tsx` defines the UI for that route.

#### Key Pages (`page.tsx` and layouts)
- **`/ (Root)`**: The landing page. Defined by `src/app/page.tsx` and `src/app/layout.tsx`.
- **`/login` & `/register`**: Authentication pages where users can sign in via Credentials or Google OAuth.
- **`/dashboard`**: The main user hub where authenticated students see their progress, active missions, and stats.
- **`/modules` & `/sandbox`**: The core learning environments. This is where the Blockly integration is used for students to solve visual programming puzzles.
- **`/profile` & `/settings`**: User account management pages. Allows users to change avatars, view acquired achievements, and update info.
- **`/admin` & `/admin-login`**: The administrative control panel for managing users, viewing reports, and monitoring system logs.
- **`/shop` & `/achievements`**: Gamification pages where users can spend "Gears" (currency) and view unlocked badges.

#### Next.js API Routes (`src/app/api/`)
These act as the backend endpoints, handling data mutations and securely interacting with Prisma (as they run on the server).
- **`/api/auth/[...nextauth]`**: Handled dynamically by NextAuth for login/logout/session management.
- **`/api/users` & `/api/profile`**: Endpoints for updating user profiles (e.g., avatar cropping/uploading, bio updates).
- **`/api/missions`**: Endpoints to submit Blockly code, validate answers, and award XP/Gears.
- **`/api/notifications` & `/api/reports`**: Endpoints for fetching real-time alerts and submitting user reports/feedback.
- **`/api/admin-auth`**: Secure endpoints exclusive to system administrators.

### 4. `src/components/` (Reusable UI Components)
These components are assembled together inside the `src/app/.../page.tsx` files.
- **Layout & Navigation**:
  - `Navbar.tsx`, `Sidebar.tsx`, `Footer.tsx`, `TopHeader.tsx`, `AppLayout.tsx`: Provide the consistent shell of the application across different routes.
- **Specialized / Gamified UI**:
  - `TechConstellation.tsx` & `PlanetNode.tsx`: Renders the visual, interactive mission selection map (the "constellation" map).
  - `SpaceBackground.tsx`: Provides the animated cosmic background theme.
  - `BlocklyMaze.tsx`: A heavy client-side component that mounts the Google Blockly workspace and handles visual block execution.
- **Interactive Modals & Providers**:
  - `AchievementPopupProvider.tsx`: A context provider that listens for newly unlocked achievements and triggers a UI popup globally.
  - `VerifyModal.tsx`: A modal for verifying student ID or email.
  - `ImageCropModal.tsx`: Used in the profile settings to crop user avatars before uploading.
  - `Providers.tsx` & `AdminProviders.tsx`: Wraps the app in necessary React Contexts (like `SessionProvider` for NextAuth).

---

## How the Application Fits Together (Data Flow)

1. **Initialization**: When `npm run dev` is executed, it starts both the Prisma PGlite development server (port 51214) and the Next.js server (port 3000).
2. **Authentication Flow**:
   - A user navigates to `/login`.
   - They enter credentials. The form submits to `/api/auth/callback/credentials`.
   - `src/lib/auth.ts` intercepts this, queries the database via Prisma to verify the password using `bcryptjs`.
   - If successful, NextAuth issues a JWT containing the user's ID, XP, and roles.
3. **Page Rendering**:
   - The user is redirected to `/dashboard`.
   - Next.js Server Components (`page.tsx`) read the session token, fetch the user's latest stats directly from Prisma on the server, and render the HTML.
   - Client Components (like `Sidebar.tsx` or `AchievementPopupProvider.tsx`) hydrate on the browser to provide interactivity.
4. **Mission Execution (Blockly)**:
   - The user goes to `/modules`.
   - `BlocklyMaze.tsx` loads the custom blocks from `src/lib/customblocks.js`.
   - The user drags blocks and clicks "Run". The frontend converts blocks to code.
   - If the code passes validation, the frontend sends a `POST` request to `/api/missions`.
   - The API route validates the request, uses Prisma to update the `MissionProgress`, adds XP to the `User`, and checks if any new `Achievement` conditions are met.
   - The API responds with success, and the frontend updates the UI (triggering `AchievementPopupProvider` if a badge was earned).

## Summary
The system relies on Next.js to provide both the frontend React structure and the backend API logic. Prisma acts as the bridge to the PostgreSQL database, ensuring type-safe data access. The UI is highly componentized, separating the complex educational tools (Blockly) and gamification maps (Constellations) into dedicated, reusable pieces.
