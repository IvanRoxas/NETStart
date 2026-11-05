"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { KeyRound, Mail, ArrowLeft, Eye, EyeOff, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        let displayError = res.error;
        if (
          displayError.includes('TURBOPACK') ||
          displayError.includes('invocation in') ||
          displayError.includes('Prisma') ||
          displayError.includes('ECONNREFUSED')
        ) {
          displayError = "Unable to connect to the database. Please ensure the database server is running.";
        }
        setError(displayError);
        setLoading(false);
      } else {
        window.location.href = '/admin';
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f0f4f8] flex items-center justify-center p-4 relative">
      <Link href="/login" className="absolute top-6 left-6 text-slate-600 hover:text-blue-700 flex items-center gap-2 transition-colors font-bold text-sm bg-white px-4 py-2 rounded-full shadow-xs border border-slate-200">
        <ArrowLeft size={16} />
        Back to Platform
      </Link>

      <div className="w-full max-w-sm relative z-10">
        <div className="bg-white border-2 border-blue-100 rounded-3xl p-8 shadow-xl">
          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-md shadow-blue-500/20">
              <Shield size={28} />
            </div>
            <h1 className="text-2xl font-black font-display text-blue-950 tracking-wide">Faculty & Admin Portal</h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">Authorized personnel only</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-bold mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input 
                  id="admin-username"
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-sm pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                  placeholder="Username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <KeyRound className="h-4 w-4 text-slate-400" />
                </div>
                <input 
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-sm pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer shadow-md shadow-blue-600/20 active:scale-98"
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
