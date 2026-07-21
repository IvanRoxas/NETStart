"use client";

import React, { useState } from 'react';

const problemSolutionData = [
  {
    id: 1,
    tagline: "The Problem",
    title: "Coding shouldn't be intimidating.",
    description: "Introductory computing is often taught passively through lectures, leaving students without a safe place to practice. The fear of breaking the system or getting a failing grade stops undecided learners from even trying to learn programming.",
    icon: (
      <svg className="w-8 h-8 text-buttons mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    )
  },
  {
    id: 2,
    tagline: "Our Solution",
    title: "A Risk-Free Learning Sandbox.",
    description: "NETStart was built to replace passive learning with hands-on, constructivist exploration. We provide an AI-enhanced, gamified environment where students can write, test, and debug code safely in their browsers without affecting their academic standing.",
    icon: (
      <svg className="w-8 h-8 text-buttons mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    )
  }
];

const missionVisionData = [
  {
    id: 'mission',
    title: "Our Mission",
    description: "To democratize computing education by providing a universally accessible, interactive platform that empowers beginners to build real-world coding skills through constructivist, hands-on learning without the fear of failure."
  },
  {
    id: 'vision',
    title: "The Vision",
    description: "Our goal is to reduce technical intimidation and build self-confidence. We want to help students accurately measure their logical aptitude and prepare them for an IT degree without the heavy academic stress."
  }
];

function AccordionItem({ title, description }: { title: string, description: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-[#361d57]/75 backdrop-blur-[10px] rounded-3xl border border-[#ffc107]/25 overflow-hidden transition-all duration-300 shadow-[6px_6px_0_#150524] hover:-translate-y-1 hover:-translate-x-1 hover:border-[#ffc107]/60 hover:shadow-[10px_10px_0_#150524]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-8 flex justify-between items-center text-left cursor-pointer"
      >
        <h3 className="font-display text-white text-2xl font-bold">{title}</h3>
        <svg className={`w-8 h-8 text-[#ff912d] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
      </button>
      <div 
        className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-8 pb-8">
          <p className="font-sans text-white/80 leading-relaxed text-lg border-t border-white/10 pt-6">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AboutUs() {
  return (
    <>
      <section className="bg-transparent py-24 min-h-[calc(100vh-80px)] flex flex-col items-center">
        <h2 className="font-display text-white text-4xl md:text-5xl font-bold mb-16 text-center drop-shadow-lg">
          About <span className="text-borders">NETStart</span>
        </h2>

        <div className="max-w-6xl mx-auto px-6 w-full flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 w-full">
            {problemSolutionData.map((item) => (
              <div
                key={item.id}
                className="bg-subs rounded-3xl p-10 transition-all duration-300 shadow-[6px_6px_0_#150524] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0_#150524] hover:ring-2 hover:ring-borders flex flex-col"
              >
                {item.icon}
                <span className="font-sans uppercase tracking-wider text-buttons text-sm font-bold mb-3">
                  {item.tagline}
                </span>
                <h3 className="font-display text-white text-3xl font-bold mb-4 leading-snug">
                  {item.title}
                </h3>
                <p className="font-sans text-gray-300 leading-relaxed text-lg">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="w-full flex flex-col gap-6">
            {missionVisionData.map((item) => (
              <AccordionItem key={item.id} title={item.title} description={item.description} />
            ))}
          </div>
        </div>
      </section>

      {/* "By The Numbers" Section */}
      <section className="bg-transparent py-24 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
          <h2 className="font-display text-4xl font-bold text-white mb-4 text-center">
            By The <span className="text-borders">Numbers</span>
          </h2>
          <p className="font-sans text-white/70 max-w-2xl text-center mx-auto mb-16 text-base leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full text-center">
            {/* Stat 1 */}
            <div className="flex flex-col items-center bg-subs/50 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-[6px_6px_0_#150524] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0_#150524] transition-all duration-300">
               <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                 <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                   <path className="text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                   <path className="text-buttons" strokeDasharray="50, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                 </svg>
                 <span className="font-display text-3xl font-bold text-white">50%</span>
               </div>
               <p className="font-sans text-white/70 leading-relaxed text-sm">
                 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
               </p>
            </div>
            
            {/* Stat 2 */}
            <div className="flex flex-col items-center bg-subs/50 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-[6px_6px_0_#150524] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0_#150524] transition-all duration-300">
               <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                 <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                   <path className="text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                   <path className="text-borders" strokeDasharray="50, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                 </svg>
                 <span className="font-display text-3xl font-bold text-white">50%</span>
               </div>
               <p className="font-sans text-white/70 leading-relaxed text-sm">
                 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
               </p>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col items-center bg-subs/50 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-[6px_6px_0_#150524] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0_#150524] transition-all duration-300">
               <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                 <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                   <path className="text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                   <path className="text-blue-400" strokeDasharray="50, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                 </svg>
                 <span className="font-display text-3xl font-bold text-white">50%</span>
               </div>
               <p className="font-sans text-white/70 leading-relaxed text-sm">
                 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pedagogical Framework & Beneficiaries Section */}
      <section className="bg-transparent py-24 px-6 border-t border-white/10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Column One: Pedagogical Framework */}
          <div className="flex flex-col gap-8 h-full">
            <h2 className="font-display text-2xl font-bold uppercase tracking-widest text-[#ff912d]">
              Pedagogical Framework
            </h2>
            <div className="flex flex-col gap-6 flex-1">
              {/* Card 1 */}
              <div className="flex-1 bg-[#361d57]/75 backdrop-blur-[10px] p-8 rounded-3xl border border-[#ffc107]/25 shadow-[6px_6px_0_#150524] hover:-translate-y-1 hover:-translate-x-1 hover:border-[#ffc107]/60 hover:shadow-[10px_10px_0_#150524] transition-all duration-300">
                <h3 className="font-display text-white text-xl font-bold mb-3">Constructivist Learning</h3>
                <p className="font-sans text-white/80 leading-relaxed">
                  The platform operates on the principle of &apos;learning by doing&apos; through sandbox environments, rather than passive video consumption.
                </p>
              </div>
              {/* Card 2 */}
              <div className="flex-1 bg-[#361d57]/75 backdrop-blur-[10px] p-8 rounded-3xl border border-[#ffc107]/25 shadow-[6px_6px_0_#150524] hover:-translate-y-1 hover:-translate-x-1 hover:border-[#ffc107]/60 hover:shadow-[10px_10px_0_#150524] transition-all duration-300">
                <h3 className="font-display text-white text-xl font-bold mb-3">Adaptive Learning Systems (ALS)</h3>
                <p className="font-sans text-white/80 leading-relaxed">
                  The platform uses cognitive profiling to dynamically adjust task difficulties, preventing student frustration and reducing the drop-out rate of early programming learners.
                </p>
              </div>
            </div>
          </div>

          {/* Column Two: System Beneficiaries */}
          <div className="flex flex-col gap-8 h-full">
            <h2 className="font-display text-2xl font-bold uppercase tracking-widest text-[#ff912d]">
              System Beneficiaries
            </h2>
            <div className="flex flex-col gap-6 flex-1">
              {/* Card 1 */}
              <div className="flex-1 bg-[#361d57]/75 backdrop-blur-[10px] p-8 rounded-3xl border border-[#ffc107]/25 shadow-[6px_6px_0_#150524] hover:-translate-y-1 hover:-translate-x-1 hover:border-[#ffc107]/60 hover:shadow-[10px_10px_0_#150524] transition-all duration-300">
                <h3 className="flex items-center gap-2 font-display text-[#ff912d] text-xl font-bold mb-3">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  For Students
                </h3>
                <p className="font-sans text-white/80 leading-relaxed">
                  A pressure-free, interactive environment to safely test-drive an expensive career choice before paying college tuition.
                </p>
              </div>
              {/* Card 2 */}
              <div className="flex-1 bg-[#361d57]/75 backdrop-blur-[10px] p-8 rounded-3xl border border-[#ffc107]/25 shadow-[6px_6px_0_#150524] hover:-translate-y-1 hover:-translate-x-1 hover:border-[#ffc107]/60 hover:shadow-[10px_10px_0_#150524] transition-all duration-300">
                <h3 className="flex items-center gap-2 font-display text-white text-xl font-bold mb-3">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                  Programming Beginners
                </h3>
                <p className="font-sans text-white/80 leading-relaxed">
                  A structured, gamified approach to foundational coding concepts, eliminating the steep learning curve of traditional computer science education.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
