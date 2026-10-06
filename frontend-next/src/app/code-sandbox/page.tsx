import React from 'react';
import SandboxClient from '@/components/sandbox/SandboxClient';

export default function CodeSandboxPage() {
  return (
    <div className="w-full h-[calc(100vh-80px)] overflow-hidden bg-[#0d0418] relative">
      <SandboxClient />
    </div>
  );
}
