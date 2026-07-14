"use client";

import { useState } from 'react';
import TechConstellation from '@/components/TechConstellation';



const services = [
  { id: '01', title: 'Lorem Ipsum Dolor', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', highlight: false },
  { id: '02', title: 'Sit Amet Consectetur', icon: 'M13 10V3L4 14h7v7l9-11h-7z', highlight: true },
  { id: '03', title: 'Adipiscing Elit Sed', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', highlight: false },
  { id: '04', title: 'Do Eiusmod Tempor', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', highlight: false },
  { id: '05', title: 'Incididunt Ut Labore', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', highlight: true },
  { id: '06', title: 'Et Dolore Magna', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', highlight: false },
];

export default function WhatWeOffer() {

  return (
    <section className="min-h-[calc(100vh-80px)] px-6 py-24 flex flex-col items-center">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
        
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-12">
          
          {/* Left: Floating Images */}
          <div className="relative w-full lg:w-1/2 h-[350px] md:h-[400px] flex items-center justify-center gap-6 shrink-0 px-4">
            {/* Image 1 (Left, Higher) */}
            <div className="w-[40%] h-[65%] bg-subs/90 backdrop-blur-md rounded-[30px] border border-white/20 shadow-[6px_6px_0_#150524] z-10 animate-float-planet p-2 mb-12">
               <div className="w-full h-full bg-main/50 rounded-[20px] border border-white/10 flex flex-col items-center justify-center gap-4">
                 <span className="text-white/50 font-sans font-medium text-xs md:text-sm text-center px-2">Lorem Ipsum 1</span>
               </div>
            </div>
            
            {/* Image 2 (Right, Lower) */}
            <div className="w-[40%] h-[65%] bg-main/90 backdrop-blur-md rounded-[30px] border border-white/20 shadow-[6px_6px_0_#150524] z-0 animate-float-planet mt-12" style={{ animationDelay: '-5s' }}>
               <div className="w-full h-full bg-subs/50 rounded-[20px] border border-white/10 flex flex-col items-center justify-center gap-4 p-2">
                 <span className="text-white/50 font-sans font-medium text-xs md:text-sm text-center px-2">Lorem Ipsum 2</span>
               </div>
            </div>
          </div>
          
          {/* Right: Text Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-start text-left z-10 lg:pl-10">
            <span className="bg-buttons/20 text-buttons font-sans font-bold text-xs uppercase tracking-widest py-1.5 px-4 rounded-full mb-6 border border-buttons/30 shadow-lg">
              Lorem Ipsum Dolor
            </span>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-6 drop-shadow-lg leading-[1.15]">
              Lorem Ipsum Dolor Sit <span className="text-borders">Amet</span> Consectetur
            </h2>
            <p className="font-sans text-white/70 mb-10 leading-relaxed text-base md:text-lg">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.
            </p>
          </div>
        </div>

        {/* Bottom Section (Grid) */}
        <div className="flex flex-col items-center w-full z-10 pt-8 border-t border-white/10">
          <span className="bg-buttons/20 text-buttons font-sans font-bold text-xs uppercase tracking-widest py-1.5 px-4 rounded-full mb-6 border border-buttons/30">
            Sed Do Eiusmod
          </span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-16 text-center drop-shadow-lg leading-tight">
            Lorem Ipsum Dolor Sit <br className="hidden md:block" /> Amet Consectetur
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
            {services.map((service) => (
              <div 
                key={service.id} 
                className={`rounded-[30px] p-8 flex flex-col transition-all hover:-translate-y-1 hover:-translate-x-1 shadow-[6px_6px_0_#150524] hover:shadow-[10px_10px_0_#150524] border group cursor-pointer ${
                  service.highlight 
                    ? 'bg-buttons text-white border-white/20' 
                    : 'bg-main/80 backdrop-blur-md text-white border-white/10'
                }`}
              >
                {/* Top Section: Icon & Arrow */}
                <div className="flex justify-between items-start mb-8">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-inner ${
                    service.highlight ? 'bg-white/20 text-white' : 'bg-buttons/20 text-buttons'
                  }`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={service.icon} />
                    </svg>
                  </div>

                </div>
                
                <h3 className="font-display font-bold text-xl mb-4 pr-4">
                  {service.title}
                </h3>
                <p className={`font-sans text-sm mb-12 leading-relaxed ${
                  service.highlight ? 'text-white/90' : 'text-white/60'
                }`}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.
                </p>
                
                {/* Bottom: Number & Line */}
                <div className="mt-auto flex items-center gap-6">
                  <span className={`font-sans font-bold text-2xl md:text-3xl ${
                    service.highlight ? 'text-white' : 'text-buttons'
                  }`}>
                    {service.id}
                  </span>
                  <div className={`h-[3px] flex-grow rounded-full ${
                    service.highlight ? 'bg-white/40' : 'bg-white/10'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Constellation Node Map */}
        <TechConstellation />
        
      </div>
    </section>
  );
}
