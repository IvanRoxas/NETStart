"use client";

import React, { useState } from 'react';

const icons = {
  html: <svg viewBox="0 0 24 24" className="w-11 h-11 md:w-12 md:h-12 fill-current" aria-hidden="true"><path d="M2.5 2.5L4.4 20l7.6 2 7.6-2 1.9-17.5H2.5zm14.6 5l-.2 1.9h-8l-.1 1.1h8l-.3 3.6-4.5 1.3-4.5-1.3-.2-2h2.2l.1.9 2.4.7 2.4-.7.1-1.4H6.8l-.5-6h10.8z"/></svg>,
  css: <svg viewBox="0 0 24 24" className="w-11 h-11 md:w-12 md:h-12 fill-current" aria-hidden="true"><path d="M2.5 2.5L4.4 20l7.6 2 7.6-2 1.9-17.5H2.5zm14.5 5.5l-.2 1.9h-8l-.1 1.1h8l-.3 3.6-4.5 1.3-4.5-1.3-.2-2h2.2l.1.9 2.4.7 2.4-.7.1-1.4H6.8l-.5-6h10.2z"/></svg>,
  js: <svg viewBox="0 0 24 24" className="w-11 h-11 md:w-12 md:h-12 fill-current" aria-hidden="true"><path d="M0 0h24v24H0V0zm22.03 22.03V2.19H1.97v19.84h20.06zM11.66 17.51c0 2.1-1.32 3.12-3.32 3.12-1.92 0-3.08-1-3.23-2.61h1.77c.07.75.52 1.3 1.48 1.3.87 0 1.46-.42 1.46-1.5v-6.95h1.84v6.64zm6.09.28c-1.39 0-2.45-.66-2.85-1.93h1.8c.16.53.59.81 1.11.81.5 0 .84-.3.84-.7 0-.5-.38-.68-1.46-.96-1.63-.44-2.5-1.08-2.5-2.47 0-1.43 1.12-2.38 2.65-2.38 1.4 0 2.27.67 2.66 1.76l-1.73.53c-.15-.46-.53-.7-1.01-.7-.47 0-.79.25-.79.6 0 .42.36.58 1.28.84 1.77.49 2.66 1.1 2.66 2.53.02 1.6-1.21 2.55-2.66 2.55z"/></svg>,
  java: <svg viewBox="0 0 24 24" className="w-11 h-11 md:w-12 md:h-12 fill-current" aria-hidden="true"><path d="M2 19.5c0 .83.67 1.5 1.5 1.5h13c.83 0 1.5-.67 1.5-1.5v-1H2v1zm17.5-14H4v8c0 2.21 1.79 4 4 4h4c2.21 0 4-1.79 4-4v-3h3.5c1.38 0 2.5-1.12 2.5-2.5v-3c0-1.38-1.12-2.5-2.5-2.5zm.5 5.5c0 .28-.22.5-.5.5H18V7.5h1.5c.28 0 .5.22.5.5v2zM6 3c0-.55.45-1 1-1s1 .45 1 1v1H6V3zm4 0c0-.55.45-1 1-1s1 .45 1 1v1h-2V3zm4 0c0-.55.45-1 1-1s1 .45 1 1v1h-2V3z"/></svg>,
  cpp: <svg viewBox="0 0 24 24" className="w-11 h-11 md:w-12 md:h-12 fill-current" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm4.1 14.6H14v1.5h-1.5v-1.5h-2v-1.5h2v-1.5H14v1.5h2.1v1.5zm-5.4-1.5h-1.5v1.5H7.7v-1.5h-2v-1.5h2v-1.5h1.5v1.5h1.5v1.5z"/></svg>,
  python: <svg viewBox="0 0 24 24" className="w-11 h-11 md:w-12 md:h-12 fill-current" aria-hidden="true"><path d="M14.25.18l.9.2.73.26.59.3.45.32L17 1.4l.22.2.14.34v.58l-1.05.02-2.34.02-2.5.02h-1.63L8.4 2.56l-1.05.07-.75.14-.56.2-.42.27-.27.34-.14.4-.04.48v1.65l.03.44.07.4.15.34.22.27.3.2.36.14.4.1.48.02h4.52V9H6.28l-.54-.03-.5-.1-.44-.15-.4-.2-.3-.27-.24-.34-.16-.4-.1-.47L3.48 6h-1.7l-.02 1.05-.02 2.34-.02 2.5V13.5l.02 1.43.07 1.05.14.75.2.56.27.42.34.27.4.14.48.04h1.65l.44-.03.4-.07.34-.15.27-.22.2-.3.14-.36.1-.4.02-.48V15h4.52l.03.54.1.5.15.44.2.4.27.3.34.24.4.16.47.1 1.45.02h1.7l.02-1.05.02-2.34.02-2.5v-1.6l-.02-1.44-.07-1.05-.14-.75-.2-.56-.27-.42-.34-.27-.4-.14-.48-.04zM8.9 3.55a1.28 1.28 0 1 1 0 2.56 1.28 1.28 0 0 1 0-2.56zM15.1 17.9a1.28 1.28 0 1 1 0 2.56 1.28 1.28 0 0 1 0-2.56z"/></svg>
};

const nodes = {
  html: {
    id: 'html',
    x: 26,
    y: 30,
    name: 'HTML',
    track: 'Web Development Track',
    tagline: 'The Blueprint of Every Website',
    intro: 'HTML (HyperText Markup Language) is where all web creation starts. Think of it as the blueprints or skeleton of a house—it puts the text, images, buttons, and video players right where they belong on the screen.',
    whyLearn: 'If you want to build websites, portfolios, or web apps, HTML is your essential first step. It is super fast to pick up and gives you instant visual results on your screen.',
    highlights: ['Beginner-Friendly', 'Instant Visual Results', 'Backbone of the Web']
  },
  css: {
    id: 'css',
    x: 54,
    y: 12,
    name: 'CSS',
    track: 'Web Design & Styling Track',
    tagline: 'Make Websites Look Sleek, Colorful & Modern',
    intro: 'CSS (Cascading Style Sheets) brings web pages to life with color, glowing space themes, and layouts. If HTML is the skeleton, CSS is the style, personality, and awesome visual flair.',
    whyLearn: 'With CSS, you control fonts, smooth button animations, 3D hover cards, and responsive layouts that look great on both phones and laptops.',
    highlights: ['Creative Styling', 'Smooth UI Animations', 'Mobile & Desktop Responsive']
  },
  js: {
    id: 'js',
    x: 82,
    y: 30,
    name: 'JavaScript',
    track: 'Frontend & Full-Stack Track',
    tagline: 'The Engine of Interactive Web Apps and Games',
    intro: 'JavaScript makes web pages do real things—like popups, interactive game mechanics, search filters, and live chat. It turns static web pages into living, interactive applications.',
    whyLearn: 'JavaScript runs on every computer and smartphone in the world. Once you learn it, you can build full-stack web applications, mobile games, and interactive digital experiences.',
    highlights: ['Powers Web Interactivity', 'Runs on All Devices', 'High Industry Demand']
  },
  java: {
    id: 'java',
    x: 82,
    y: 66,
    name: 'Java',
    track: 'Object-Oriented Architecture Track',
    tagline: 'Build Rock-Solid Enterprise Apps & Android Systems',
    intro: 'Java is famous for its "Write Once, Run Anywhere" superpower. It powers massive software systems at global companies, banking platforms, Android mobile apps, and games like Minecraft.',
    whyLearn: 'Learning Java teaches you clean, organized coding discipline. It is one of the most widely taught languages in universities and a heavyweight for enterprise software careers.',
    highlights: ['High Industry Demand', 'Android & Game Modding', 'Clean Structured Logic']
  },
  cpp: {
    id: 'cpp',
    x: 54,
    y: 84,
    name: 'C++',
    track: 'Software Engineering & Performance Track',
    tagline: 'Blazing Speed for 3D Games, Graphics & Robotics',
    intro: 'C++ is the powerhouse behind high-performance 3D game engines (like Unreal Engine), flight simulators, operating systems, and robotics where lightning-fast execution speed is crucial.',
    whyLearn: 'C++ gives you direct control over hardware and memory. If you dream of creating AAA games, fast simulations, or high-performance software, C++ gives you ultimate control.',
    highlights: ['Extreme Performance', 'AAA Game Engines', 'Direct Hardware Control']
  },
  python: {
    id: 'python',
    x: 26,
    y: 66,
    name: 'Python',
    track: 'Data Science, AI & Automation Track',
    tagline: 'The #1 Language for Artificial Intelligence and Beginners',
    intro: 'Python reads almost like plain English, making it the friendliest language to learn first. Despite its simple syntax, it is the undisputed #1 language for Artificial Intelligence and Data Science.',
    whyLearn: 'From automating repetitive everyday tasks to analyzing big datasets and training smart AI models, Python lets you bring ideas to life in just a few lines of code.',
    highlights: ['Reads Like English', '#1 in AI & Machine Learning', 'Fast & Fun Prototyping']
  }
};

const connections = [
  { source: 'html', target: 'css' },
  { source: 'css', target: 'js' },
  { source: 'js', target: 'java' },
  { source: 'java', target: 'cpp' },
  { source: 'cpp', target: 'python' },
  { source: 'python', target: 'html' }
];

export default function TechConstellation() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const isStateB = activeNode !== null;
  const activeNodeData = activeNode ? nodes[activeNode as keyof typeof nodes] : null;

  const isLineActive = (source: string, target: string) => {
    return hoveredNode === source || hoveredNode === target || activeNode === source || activeNode === target;
  };

  return (
    <div className="relative w-full bg-transparent mt-16 flex flex-col lg:flex-row items-stretch gap-12 lg:gap-8 min-h-[600px]">
      
      {/* Column One: Typographic Context & Information Panel (40%) */}
      <div className="w-full lg:w-[40%] relative flex items-center justify-center min-h-[400px] lg:min-h-full">
        
        {/* State A (Default View) */}
        <div className={`absolute w-full flex flex-col gap-6 transition-all duration-700 ease-in-out ${isStateB ? 'opacity-0 -translate-x-10 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
          <span className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-[#ff912d]">
            LABORATORY MAP SIMULATION
          </span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white leading-tight">
            Your Personalized Pathway to Tech
          </h2>
          <p className="font-sans text-white/70 text-base md:text-lg leading-relaxed">
            The Adaptive Module Sequencer coordinates progression across key tracks based on your initial diagnostic scores. Click on any language node to explore what you can build with Web Development (HTML/CSS), JavaScript, Java, C++, and Python.
          </p>

          {/* Quote Block */}
          <div className="mt-8 border-l-4 border-[#ff912d] pl-5 py-2 text-white/90 font-sans italic text-lg md:text-xl font-semibold leading-relaxed max-w-md">
            "In games, failure doesn't feel like a dead end. It feels like an invitation to try again, to get curious, and to keep playing."
            <span className="block not-italic text-xs text-white/40 mt-3 font-mono uppercase tracking-widest">— Jane McGonigal (Game Designer)</span>
          </div>
        </div>
        
        {/* State B (Deep Focus View) */}
        <div className={`absolute w-full flex flex-col gap-5 transition-all duration-700 ease-in-out ${!isStateB ? 'opacity-0 translate-x-10 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
          <div className="flex items-center gap-3">
            <span className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-[#ff912d] bg-[#ff912d]/10 px-3 py-1 rounded-full border border-[#ff912d]/30">
              {activeNodeData?.track}
            </span>
          </div>
          
          <div>
            <h2 className="font-display text-4xl lg:text-6xl font-bold text-white leading-tight">
              {activeNodeData?.name}
            </h2>
            <p className="text-[#ffc107] font-sans font-semibold text-sm md:text-base mt-1">
              {activeNodeData?.tagline}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="font-sans text-white/80 text-sm md:text-base leading-relaxed">
              {activeNodeData?.intro}
            </p>
            <p className="font-sans text-white/80 text-sm md:text-base leading-relaxed">
              {activeNodeData?.whyLearn}
            </p>
          </div>

          {/* Key Selling Highlights */}
          {activeNodeData?.highlights && (
            <div className="flex flex-wrap gap-2 pt-1">
              {activeNodeData.highlights.map((highlight, i) => (
                <span key={i} className="text-[11px] font-sans font-semibold text-white/90 bg-white/10 px-3 py-1 rounded-lg border border-white/15">
                  ✓ {highlight}
                </span>
              ))}
            </div>
          )}

          <button 
            onClick={() => setActiveNode(null)}
            className="self-start px-7 py-2.5 rounded-full bg-[#ff912d] text-[#270d3c] font-sans font-bold text-xs uppercase tracking-widest cursor-pointer hover:scale-105 hover:bg-[#ffc107] hover:shadow-[0_0_15px_rgba(255,193,7,0.5)] transition-all duration-300 mt-2 flex items-center gap-2"
          >
            <span className="text-lg leading-none">&larr;</span> Back to Constellation
          </button>
        </div>

      </div>

      {/* Column Two: The Interactive Constellation Canvas (60%) */}
      <div className="relative w-full lg:w-[60%] h-[500px] lg:h-[600px] rounded-[40px] overflow-hidden bg-transparent">
        

        {/* SVG Viewport for Lines (Fade out in State B) */}
        <svg className={`absolute inset-0 w-full h-full pointer-events-none z-10 transition-all duration-700 ease-in-out ${isStateB ? 'opacity-0 translate-y-20' : 'opacity-100 translate-y-0'}`}>
          <defs>
            <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {connections.map((conn, idx) => {
            const s = nodes[conn.source as keyof typeof nodes];
            const t = nodes[conn.target as keyof typeof nodes];
            const active = isLineActive(conn.source, conn.target);
            return (
              <line 
                key={idx} 
                x1={`${s.x}%`} 
                y1={`${s.y}%`} 
                x2={`${t.x}%`} 
                y2={`${t.y}%`}
                stroke={active ? "#ffc107" : "#361d57"}
                strokeWidth={active ? 3.5 : 2.5}
                className="transition-all duration-300"
                filter={active ? "url(#neon-glow)" : "none"}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {Object.values(nodes).map((node) => {
          const isHovered = hoveredNode === node.id;
          const isClicked = activeNode === node.id;
          
          // Determine state transformations
          const isHidden = isStateB && !isClicked;
          const isActiveVisual = isHovered || isClicked;

          return (
            <div
              key={node.id}
              onClick={() => {
                if (isStateB && isClicked) {
                  setActiveNode(null);
                } else {
                  setActiveNode(node.id);
                }
              }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className={`absolute flex flex-col items-center justify-center w-36 h-36 md:w-40 md:h-40 rounded-full cursor-pointer transition-all duration-700 ease-in-out z-20 ${
                isHidden 
                  ? 'opacity-0 translate-y-20 pointer-events-none' 
                  : 'opacity-100'
              } ${
                isActiveVisual 
                  ? 'bg-[#361d57] border-[3.5px] border-[#ffc107] shadow-[0_0_45px_rgba(255,193,7,0.85)]' 
                  : 'bg-[#361d57] border-[3px] border-white text-white hover:border-[#ffc107]'
              }`}
              style={{ 
                left: isClicked ? '50%' : `${node.x}%`, 
                top: isClicked ? '50%' : `${node.y}%`,
                transform: isClicked 
                  ? 'translate(-50%, -50%) scale(2.2)' 
                  : isHovered 
                    ? 'translate(-50%, -50%) scale(1.08)' 
                    : 'translate(-50%, -50%) scale(1)'
              }}
            >
              <div className={isActiveVisual ? 'text-[#ffc107]' : 'text-white'}>
                {icons[node.id as keyof typeof icons]}
              </div>
              <span className={`mt-2 font-display text-xs md:text-sm uppercase font-black tracking-wider ${isActiveVisual ? 'text-[#ffc107]' : 'text-white'}`}>
                {node.name}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
}
