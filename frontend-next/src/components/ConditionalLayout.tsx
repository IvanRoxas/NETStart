"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import SpaceBackground from "@/components/SpaceBackground";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCustomLayoutPage = pathname === "/login" || pathname === "/register" || pathname === "/sandbox" || pathname?.startsWith("/dashboard");

  if (isCustomLayoutPage) {
    // Render without Navbar, Footer, and SpaceBackground
    return (
      <Providers>
        <main className="relative z-10 min-h-screen flex flex-col">
          {children}
        </main>
      </Providers>
    );
  }

  return (
    <Providers>
      <SpaceBackground />
      <Navbar />
      <main className="pt-20 relative z-10 flex-grow">
        {children}
      </main>
      <Footer />
    </Providers>
  );
}
