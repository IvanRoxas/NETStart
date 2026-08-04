import { getServerSession } from "next-auth/next";
import { authOptions, prisma } from "@/lib/auth";
import { redirect } from "next/navigation";
import ModuleMissionsClient from "./ModuleMissionsClient";

const MODULE_MISSIONS: Record<string, { id: string; title: string; desc: string }[]> = {
  html: [
    { id: "html-1", title: "HTML Level 1: Core Tags", desc: "Embark on learning fundamental HTML tags like headings, paragraphs, and list components." },
    { id: "html-2", title: "HTML Level 2: Structured Forms", desc: "Build input fields, select elements, textareas, and master form attributes." },
    { id: "html-3", title: "HTML Level 3: Tables and Frames", desc: "Master the structure of rows, headers, cells, and embed framing details." },
    { id: "html-4", title: "HTML Level 4: Layout Schemas", desc: "Create semantic webpage hierarchies using nav, footer, sections, and articles." },
    { id: "html-5", title: "HTML Level 5: Media Embeds", desc: "Embed audios, videos, images, and configure frame overrides." },
  ],
  css: [
    { id: "css-1", title: "CSS Level 1: Style Selectors", desc: "Master targeting classes, ids, properties, and the cascade tree." },
    { id: "css-2", title: "CSS Level 2: Box Model Schemas", desc: "Style border widths, margins, padding constraints, and display blocks." },
    { id: "css-3", title: "CSS Level 3: Flexbox Systems", desc: "Master flex-direction, justify-content, align-items, and alignment layouts." },
    { id: "css-4", title: "CSS Level 4: Grid Architectures", desc: "Design structured column-row layouts, grid-areas, and alignments." },
    { id: "css-5", title: "CSS Level 5: Transits & Keyframes", desc: "Implement active transforms, smooth animations, and transitions." },
  ],
  javascript: [
    { id: "javascript-1", title: "JS Level 1: Core Bindings", desc: "Learn variables, let, const, primitive types, and math routines." },
    { id: "javascript-2", title: "JS Level 2: Control Logic", desc: "Master branching structures (if-else), switch cases, and loops." },
    { id: "javascript-3", title: "JS Level 3: Function Declarations", desc: "Implement reusable function expressions, closures, and scoping." },
    { id: "javascript-4", title: "JS Level 4: Array Iterators", desc: "Master maps, filters, reductions, and sorting loops." },
    { id: "javascript-5", title: "JS Level 5: DOM Injections", desc: "Query elements, inject styles, dynamic texts, and event listeners." },
  ],
  react: [
    { id: "react-1", title: "React Level 1: JSX Injections", desc: "Master building functional components using declarative JSX tags." },
    { id: "react-2", title: "React Level 2: State Hooks", desc: "Master React state hooks, inputs, re-renders, and lifecycle binds." },
    { id: "react-3", title: "React Level 3: Prop Transits", desc: "Pass data down parent components, configure defaults, and handle callbacks." },
    { id: "react-4", title: "React Level 4: Context Providers", desc: "Share states globally across subtrees using Context wrappers." },
    { id: "react-5", title: "React Level 5: Hooks Customizer", desc: "Build reusable hooks encapsulating state routines." },
  ],
  node: [
    { id: "node-1", title: "Node Level 1: File Actions", desc: "Read and write local configuration assets using fs bindings." },
    { id: "node-2", title: "Node Level 2: HTTP Hosts", desc: "Spin up HTTP servers listening to custom ports." },
    { id: "node-3", title: "Node Level 3: Express Routing", desc: "Design route controllers handling GET and POST payloads." },
    { id: "node-4", title: "Node Level 4: DB Bindings", desc: "Integrate queries connecting schema layouts." },
    { id: "node-5", title: "Node Level 5: Middlewares", desc: "Build pipeline controllers filtering inbound requests." },
  ],
};

const MODULE_META: Record<string, { title: string; category: string; desc: string }> = {
  html: { title: "HTML Basics", category: "HyperText Markup", desc: "Embark on creating your first structured webpage schemas with clean layouts." },
  css: { title: "Cascading Styles", category: "Style & Layout", desc: "Elevate your visuals with custom themes, colors, and layout flex grids." },
  javascript: { title: "JavaScript Logic", category: "Core Dynamic Scripting", desc: "Infuse your apps with branching loops, operations, and dynamic API events." },
  react: { title: "React Components", category: "Modern SPA Framework", desc: "Architect component structures using states, hook bindings, and transit props." },
  node: { title: "Node Backend", category: "Server Side Operations", desc: "Build REST route microservices, http hosts, and database schema layers." },
};

interface Params {
  id: string;
}

export default async function ModuleMissionsPage({ params }: { params: Promise<Params> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const moduleId = resolvedParams.id.toLowerCase();
  const missions = MODULE_MISSIONS[moduleId];
  const meta = MODULE_META[moduleId];

  // Redirect on unsupported module path
  if (!missions || !meta) {
    redirect("/modules");
  }

  const userId = (session.user as any).id;

  // Retrieve user completed missions
  const completedMissions = await prisma.missionProgress.findMany({
    where: {
      userId,
      status: "COMPLETED",
    },
    select: {
      missionId: true,
    }
  });

  const getCompletedCount = (modId: string) => {
    return completedMissions.filter(m => m.missionId.toLowerCase().startsWith(modId.toLowerCase())).length;
  };

  // Enforce progression checking
  const htmlCompleted = getCompletedCount("html") >= 5;
  const cssCompleted = getCompletedCount("css") >= 5;
  const jsCompleted = getCompletedCount("javascript") >= 8 || getCompletedCount("js") >= 8;
  const reactCompleted = getCompletedCount("react") >= 10;

  const isModuleLocked = () => {
    if (moduleId === "html") return false;
    if (moduleId === "css") return !htmlCompleted;
    if (moduleId === "javascript") return !(htmlCompleted && cssCompleted);
    if (moduleId === "react") return !(htmlCompleted && cssCompleted && jsCompleted);
    if (moduleId === "node") return !(htmlCompleted && cssCompleted && jsCompleted && reactCompleted);
    return true;
  };

  const isLocked = isModuleLocked();

  return (
    <ModuleMissionsClient 
      moduleId={moduleId}
      missions={missions}
      meta={meta}
      completedMissions={completedMissions}
      isLocked={isLocked}
    />
  );
}
