"use client";

import { usePathname } from 'next/navigation';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden min-h-0">
      {children}
    </div>
  );
}
