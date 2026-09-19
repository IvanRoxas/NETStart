# NetStart Project Explainer

This document provides an in-depth breakdown of the **NetStart** codebase. It explains the core technologies, details the file structure, outlines how the routing and links work, and highlights the major systems running the application.

---

## 1. Core Technology Stack

- **Framework**: [Next.js (App Router)](https://nextjs.org/) version 16, utilizing React 19.
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) for utility-first responsive styling.
- **Database & ORM**: [Prisma](https://www.prisma.io/) connected to a Postgres environment (using `@electric-sql/pglite` for lightweight Postgres capabilities).
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (with Prisma Adapter) for user session management and `bcryptjs` for secure credentials hashing.
- **Mailing**: `nodemailer` for sending system emails (like password resets or notifications).
- **Gamification & Mechanics**: Custom engines for block-based logic (`blockly`) and specialized gamified UI (using custom components like `react-image-crop` and dynamic React trees).

---

## 2. Complete File Structure Breakdown

The application primarily resides in the `src/` directory. Next.js 13+ introduced the **App Router**, meaning everything inside `src/app` acts as a direct map to the website's URLs.

### 📂 `src/app/` (Routing & Pages)
Every folder in `app/` that contains a `page.tsx` becomes a web route.

- **`globals.css` / `layout.tsx`**: The global styling and root HTML layout that wraps every single page on the site.
- **Static & Marketing Pages**:
  - `about-us/`, `what-we-offer/`, `our-team/`: Informational pages describing the platform.
- **Authentication Pages**:
  - `login/`, `register/`, `auth/new-password/`: The public-facing flows for user sign-in and account creation.
- **Protected User Portal**:
  - `dashboard/`: The main entry point for logged-in users.
  - `settings/`, `profile/`: Account management, avatar uploading, and user preferences.
  - `notifications/`: A centralized page and inbox for system notifications.
- **Core Platform Features**:
  - `modules/`: Contains the learning and gameplay modules. Dynamic routes like `modules/[id]` load specific level missions.
  - `aptitude-test/`: A dedicated area where users take an initial assessment or evaluation, featuring custom modals and dynamic telemetry cards.
  - `achievements/`, `shop/`: Gamification areas where users can view unlocked badges or spend earned platform currency.
- **Admin Portal**:
  - `admin-login/`: The separated login flow exclusively for administrators.
  - `admin/`: A protected subdirectory (with its own nested routes like `admin/reports`, `admin/users`, `admin/shop`, `admin/achievements`) where admins can manage content, monitor user logs, and update the shop.
- **`api/`**: Contains standard backend API endpoints (RESTful) used for NextAuth (`api/auth/[...nextauth]`), notifications (`api/notifications`), missions, and reports. 

### 📂 `src/actions/` (Server Actions)
Instead of standard API routes, Next.js allows "Server Actions". These are secure, server-only asynchronous functions that can be called directly from client components (e.g., forms or buttons) without manually writing a `fetch` request.
- `achievements.ts`, `aptitudeClient.ts`, `shop.ts`, `verification.ts`: Handles the database operations for achievements, shop purchases, and aptitude grading.
- `admin/actions/`: Segregated server actions strictly for admin-level operations.

### 📂 `src/components/` (Reusable UI Components)
A modular folder containing all the building blocks that make up the user interface.
- **Structural**: `Navbar.tsx`, `Footer.tsx`, `Sidebar.tsx`, `AppLayout.tsx`.
- **Specialized / Gamified**: `BlocklyMaze.tsx` (the logic puzzle interface), `SpaceBackground.tsx`, `PlanetNode.tsx`, `TechConstellation.tsx` (for the highly interactive, themed layouts).
- **Utility**: `Providers.tsx` (wraps the app in Contexts like SessionProvider), `VerifyModal.tsx`, `ImageCropModal.tsx`.

### 📂 `src/lib/` (Utilities & Core Logic)
Shared code, configurations, and helper functions.
- `auth.ts` / `adminAuth.ts`: Contains the configuration for NextAuth (providers, callbacks, session strategies).
- `leveling.ts`, `xp.ts`: Core game math logic to calculate how much XP is needed for the next level, and how levels progress.
- `logger.ts`, `mail.ts`: System utilities for writing server logs and sending emails.
- `queries/`: A dedicated spot for complex Prisma database query abstractions.

---

## 3. How Routing and Links Work in Next.js

Next.js uses a **File-System Based Router**. 

### **The Router Engine**
If you want to create a page at `https://your-site.com/sandbox`, you simply create a folder called `sandbox` inside `src/app/`, and put a `page.tsx` file inside it. 
- `src/app/sandbox/page.tsx` -> `/sandbox`
- `src/app/modules/[id]/page.tsx` -> `/modules/123` (The `[id]` signifies a dynamic URL parameter).

### **How Links Work**
In a traditional React app, you might use `<a href="/about-us">`. This causes the browser to do a full page refresh.
In Next.js, we use the custom `<Link>` component imported from `next/link`.

```tsx
import Link from 'next/link';

export default function MyComponent() {
  return (
    <Link href="/about-us">
      Learn About Us
    </Link>
  );
}
```

**What this does:**
1. **Client-Side Navigation**: Clicking the link intercepts the browser's default behavior. It fetches the JSON data for the next page in the background and renders it instantly without a blank screen or a full reload.
2. **Prefetching**: When the `<Link>` scrolls into the user's view, Next.js automatically starts downloading the destination page in the background. By the time the user clicks it, the page loads almost instantly.

### **Server vs Client Components**
In `src/components/Navbar.tsx` or similar interactive files, you will often see `"use client";` at the very top.
- By default, Next.js renders everything on the **Server** (Server Components). This is great for SEO and performance because no JavaScript is sent to the browser for those parts.
- When you need interactivity (like `onClick`, React `useState`, or using `<Link>` in certain dynamic ways), you declare `"use client";` to tell Next.js to run that specific component in the browser.

---

## 4. Key Systems & Workflows

1. **The Aptitude Assessment Workflow**
   - User navigates to `/aptitude-test`.
   - The UI (`AptitudeTestClient.tsx`) presents a dynamic space-themed dashboard.
   - When the user submits their answers, the component calls a Server Action (`src/actions/aptitudeClient.ts`) to validate their input securely on the backend, update their database record using Prisma, and assign initial XP/Levels.

2. **The Admin Guard**
   - Routes inside `admin/` use a `layout.tsx` that checks the session using `adminAuth.ts`. If a regular user tries to navigate to `/admin`, the layout immediately redirects them away, ensuring strict segregation of privileges.

3. **Gamification (Modules & Blockly)**
   - Inside `/modules/[id]`, the `ModuleMissionsClient.tsx` is rendered. 
   - It utilizes `BlocklyMaze.tsx`, a wrapper around Google's Blockly visual programming language, allowing users to drag-and-drop code blocks to solve puzzles.
   - Upon successful completion, the frontend talks to `/api/missions/complete/route.ts` which utilizes `lib/xp.ts` to calculate and award experience points.
