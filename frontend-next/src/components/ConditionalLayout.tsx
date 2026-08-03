"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import SpaceBackground from "@/components/SpaceBackground";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import AdminProviders from "@/components/AdminProviders";
import AppLayout from "@/components/AppLayout";

import AchievementPopupProvider from "@/components/AchievementPopupProvider";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isAppPage = pathname === "/sandbox" || pathname?.startsWith("/dashboard") || pathname === "/settings" || pathname === "/modules" || pathname === "/missions" || pathname === "/profile" || pathname === "/notifications" || pathname === "/achievements" || pathname === "/shop";
  const isAdminPage = pathname?.startsWith("/admin") || pathname === "/admin-login";

  if (isAdminPage) {
    return (
      <AdminProviders>
        <main className="relative z-10 h-screen w-screen flex flex-col bg-[#1a082c] overflow-hidden">
          {children}
        </main>
      </AdminProviders>
    );
  }

  if (isAppPage) {
    return (
      <Providers>
        <AchievementPopupProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </AchievementPopupProvider>
      </Providers>
    );
  }

  if (isAuthPage) {
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
