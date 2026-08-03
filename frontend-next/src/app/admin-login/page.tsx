"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { ShieldAlert, KeyRound, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        username: email,
        loginType: 'admin',
        password,
        rememberMe: 'false'
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push('/admin');
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#11051c] flex items-center justify-center p-4 relative">
      <Link href="/login" className="absolute top-6 left-6 text-gray-500 hover:text-white flex items-center gap-2 transition-colors font-medium text-sm">
        <ArrowLeft size={16} />
        Back to Platform
      </Link>

      <div className="w-full max-w-sm relative z-10">
        <div className="bg-[#1a082c] border border-white/10 rounded-2xl p-8 shadow-xl">
          <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-xl font-bold text-white tracking-wide">Admin Login</h1>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm font-medium mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-1.5">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-500" />
                </div>
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/20 text-white text-sm pl-10 pr-3 py-2.5 rounded-lg border border-white/10 outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="admin_netstart"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-semibold mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-4 w-4 text-gray-500" />
                </div>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/20 text-white text-sm pl-10 pr-3 py-2.5 rounded-lg border border-white/10 outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-sm py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
