"use client";

import { useState } from 'react';
import Image from 'next/image';

const teamMembers = [
  { 
    name: "Katherine Supan", 
    role: "UI/UX Designer",
    image: "/kath.jpg",
    links: { fb: "https://www.facebook.com/inklerine", linkedin: "https://www.linkedin.com/in/katherine-supan-83a86438b/", email: "mailto:katherinealfarosupan@gmail.com" }
  },
  { 
    name: "John Ivan Roxas", 
    role: "Lead Systems Developer",
    image: "/ivan.png",
    links: { fb: "https://www.facebook.com/IvanRoxas2004", linkedin: "https://www.linkedin.com/in/john-ivan-roxas-b4b85a38b/", email: "mailto:johnivanroxas@gmail.com" }
  },
  { 
    name: "Matt Christian Magbanua", 
    role: "Frontend Developer",
    image: "/matt.jpg",
    links: { fb: "https://www.facebook.com/mcsm195", linkedin: "https://www.linkedin.com/in/matt-christian-magbanua-b47055180/", email: "mailto:matt.magbanua01@gmail.com" }
  }
];

function TeamCard({ name, role, image, links }: { name: string, role: string, image: string, links: { fb: string, linkedin: string, email: string } }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative h-full min-h-[300px] rounded-2xl overflow-hidden group border border-white/10 bg-main/80 shadow-[6px_6px_0_#150524] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0_#150524] transition-all flex flex-col">
      {/* Image Background */}
      <div className="absolute inset-0 w-full h-full bg-main">
        <Image src={image} alt={name} fill className="object-cover object-top opacity-70 group-hover:opacity-100 transition-opacity duration-300" sizes="(max-width: 768px) 100vw, 33vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-subs via-transparent to-transparent opacity-80" />
      </div>
      
      {/* Info Block (Full Width Bottom) */}
      <div className="absolute bottom-0 left-0 bg-subs/80 backdrop-blur-md p-4 w-full border-t border-white/20 flex flex-col justify-center items-center text-center shadow-lg">
        <h3 className="font-display font-bold text-lg text-white truncate drop-shadow-md w-full">{name}</h3>
        <p className="font-sans text-xs text-white/70 truncate mt-1 w-full">{role}</p>
      </div>

      {/* Social Tab (Slides down from the top-right toggle button) */}
      <div 
        className={`absolute top-3 right-3 w-10 bg-subs/95 backdrop-blur-xl rounded-full border border-white/20 flex flex-col items-center pt-14 pb-4 gap-4 transition-all duration-500 z-10 origin-top shadow-2xl ${
          isOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'
        }`}
      >
        <a href={links.email} className="text-white/70 hover:text-white transition-colors hover:scale-110" title="Email">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"/></svg>
        </a>
        <a href={links.fb} className="text-white/70 hover:text-white transition-colors hover:scale-110" title="Facebook" target="_blank" rel="noopener noreferrer">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 16.84 5.44 20.87 10 21.8V15H8V12H10V9.5C10 7.53 11.19 6.4 13.06 6.4C13.93 6.4 14.85 6.56 14.85 6.56V8.5H13.84C12.85 8.5 12.5 9.12 12.5 9.77V12H15.14L14.72 15H12.5V21.86C17.2 21.03 22 16.96 22 12Z"/></svg>
        </a>
        <a href={links.linkedin} className="text-white/70 hover:text-white transition-colors hover:scale-110" title="LinkedIn" target="_blank" rel="noopener noreferrer">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M18.5 18.5V13.2A3.26 3.26 0 0 0 15.24 9.94C13.86 9.94 13.2 10.7 12.82 11.23V10.15H9.72C9.76 11.02 9.72 18.5 9.72 18.5H12.83V13.83C12.83 13.58 12.85 13.33 12.92 13.16C13.13 12.67 13.57 12.17 14.33 12.17C15.32 12.17 15.72 12.92 15.72 14.1V18.5H18.5M6.86 8.56C7.94 8.56 8.65 7.85 8.65 6.94C8.63 6 7.94 5.32 6.88 5.32C5.83 5.32 5.12 6 5.12 6.94C5.12 7.85 5.81 8.56 6.84 8.56H6.86M5.31 18.5H8.41V10.15H5.31V18.5Z"/></svg>
        </a>
      </div>

      {/* Circular Toggle Button (Top Right) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-buttons/90 backdrop-blur-md flex items-center justify-center text-white hover:bg-borders transition-colors z-20 shadow-xl border border-white/20 cursor-pointer"
      >
        <svg className={`w-5 h-5 transition-transform duration-500 ${isOpen ? 'rotate-[135deg]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
      </button>
    </div>
  );
}

export default function OurTeam() {
  return (
    <section className="bg-transparent py-16 px-6 min-h-[calc(100vh-80px)] flex flex-col items-center">
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end w-full mb-6">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold drop-shadow-lg text-white mb-2">
              Meet the <span className="text-borders">Developers</span>
            </h2>
            <p className="font-sans text-xs text-white/70 uppercase tracking-widest font-medium">The Capstone 2 team behind the Next-Gen Essential Technology (NETStart) platform.</p>
          </div>
        </div>

        {/* Grid Section - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full items-stretch">
          {teamMembers.map((member, idx) => (
            <TeamCard key={idx} name={member.name} role={member.role} image={member.image} links={member.links} />
          ))}
        </div>

        {/* Capstone Adviser Section (Solid Banner) */}
        <div className="w-full bg-main/80 backdrop-blur-md rounded-[32px] border border-white/10 shadow-[6px_6px_0_#150524] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0_#150524] transition-all overflow-hidden p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-10 mt-6 relative">
          {/* Left: Image Placeholder */}
          <div className="w-full md:w-[35%] h-[200px] md:h-[280px] bg-white rounded-[24px] shrink-0 flex items-center justify-center relative z-10 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
             <span className="text-black/30 font-sans font-medium text-base">Image Placeholder</span>
          </div>
          
          {/* Right: Text Content */}
          <div className="w-full md:w-[65%] flex flex-col items-start justify-center text-left relative z-10">
             <span className="bg-buttons/20 text-buttons font-sans font-bold text-[10px] uppercase tracking-widest py-1 px-3 rounded-full mb-4 border border-buttons/30 shadow-lg">
               Capstone Adviser & Mentor
             </span>
             <h3 className="font-display text-3xl lg:text-4xl font-bold text-white mb-4 drop-shadow-lg leading-tight">
               Jasmin <span className="text-borders">Gas</span>
             </h3>
             <p className="font-sans text-white/85 leading-relaxed text-sm md:text-base mb-6">
               We extend our heartfelt gratitude to our Capstone Adviser, Ms. Jasmin Gas, for her invaluable mentorship, unwavering patience, and expert guidance throughout the entire duration of our capstone journey. Her constructive feedback and technical steering played a pivotal role in shaping NETStart from an ambitious concept into a fully realized, student-centric learning platform.
             </p>
             <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-4 py-2 rounded-full text-white/90 font-sans text-xs font-semibold tracking-wide">
               <span className="text-[#ffc107]">★</span> With Sincere Appreciation from the NETStart Developers
             </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}
