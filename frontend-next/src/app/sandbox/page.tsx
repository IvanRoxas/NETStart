"use client";

import dynamic from 'next/dynamic';
import React from 'react';

// Blockly requires the window object and cannot be SSR'd
const BlocklyMaze = dynamic(() => import('@/components/BlocklyMaze'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-main flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#ff912d]"></div>
    </div>
  )
});

export default function SandboxPage() {
  return (
    <div className="w-full h-full bg-main overflow-hidden relative">
      <BlocklyMaze />
    </div>
  );
}
