"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="bg-transparent border-2 border-buttons text-buttons font-sans font-bold text-sm uppercase tracking-widest py-3 px-8 rounded-full hover:bg-buttons hover:text-white transition-all shadow-[4px_4px_0_rgba(255,145,45,0.4)] hover:shadow-[6px_6px_0_rgba(255,145,45,0.4)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:scale-95 active:shadow-none"
    >
      Sign Out
    </button>
  );
}
