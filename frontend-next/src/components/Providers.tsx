"use client";

import { SessionProvider } from "next-auth/react";
import { MusicProvider } from "@/context/MusicContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={true}>
      <MusicProvider>
        {children}
      </MusicProvider>
    </SessionProvider>
  );
}
