"use client";

import { SessionProvider } from "next-auth/react";
import AuthSyncProvider from "@/components/AuthSyncProvider";

export default function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath="/api/admin-auth" refetchOnWindowFocus={true}>
      <AuthSyncProvider realm="admin">
        {children}
      </AuthSyncProvider>
    </SessionProvider>
  );
}
