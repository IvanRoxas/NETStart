"use client";

import dynamic from 'next/dynamic';
import React from 'react';
import SpaceLoader from '@/components/SpaceLoader';

// Blockly requires the window object and cannot be SSR'd
const BlocklyMaze = dynamic(() => import('@/components/BlocklyMaze'), {
  ssr: false,
  loading: () => <SpaceLoader fullScreen text="...initializing lab..." />
});

export default function SandboxPage() {
  return (
    <div className="w-full h-full bg-main overflow-hidden relative">
      <BlocklyMaze />
    </div>
  );
}
