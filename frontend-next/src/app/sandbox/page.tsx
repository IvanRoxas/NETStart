"use client";

import dynamic from 'next/dynamic';
import React from 'react';
import SpaceLoader from '@/components/SpaceLoader';

const BlocklyMaze = dynamic(() => import('@/components/BlocklyMaze'), {
  ssr: false,
  loading: () => <SpaceLoader fullScreen text="loading..." />
});

export default function SandboxPage() {
  return (
    <div className="w-full h-full bg-[#0d0418] overflow-hidden relative flex flex-col">
      <BlocklyMaze />
    </div>
  );
}
