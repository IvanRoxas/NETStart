import React from 'react';
import Sidebar from '@/components/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-screen bg-[#1e0a2d] flex overflow-hidden font-sans text-white relative">
      {/* Background Ambience (Global) */}
      <div className="absolute top-[-200px] left-1/4 w-96 h-96 bg-[#ff912d] rounded-full blur-[150px] opacity-[0.07] pointer-events-none z-0 transition-opacity"></div>
      <div className="absolute bottom-[-100px] right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[150px] opacity-[0.07] pointer-events-none z-0 transition-opacity"></div>
      <div className="absolute top-[40%] left-[50%] w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-[#361d57] rounded-full blur-[150px] opacity-10 pointer-events-none z-0 transition-opacity"></div>

      {/* Left Sidebar Component */}
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 h-full overflow-hidden relative z-10 [&>*]:h-full">
        {children}
      </div>
    </div>
  );
}
