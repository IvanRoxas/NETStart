"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { resetPassword } from '../../actions/reset-password';

function NewPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (!token) {
      showToast("Reset token is missing from the link.", 'error');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showToast("Cannot reset password without token.", 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match.", 'error');
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters long.", 'error');
      return;
    }

    setLoading(true);
    setToast(null);

    try {
      const res = await resetPassword(token, password);
      if (res.success) {
        showToast("Password reset successfully! Redirecting to login...", 'success');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        showToast((res.error as string) || "Invalid or expired token.", 'error');
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred. Please try again.", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen w-full flex bg-[#1e0a2d] relative overflow-hidden items-center justify-center p-4">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl font-sans font-bold flex items-center gap-2 animate-in slide-in-from-top-4 duration-300
          ${toast.type === 'error' ? 'bg-red-500/90 text-white backdrop-blur-sm border border-red-400' : 'bg-green-500/90 text-white backdrop-blur-sm border border-green-400'}
        `}>
          {toast.text}
        </div>
      )}

      {/* Back Button */}
      <Link 
        href="/login" 
        className="absolute top-8 left-8 z-20 flex items-center gap-2 font-mono text-white/80 hover:text-white hover:-translate-x-1 transition-transform group bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/10"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Login
      </Link>

      <div className="w-full max-w-[420px] bg-[#150a21]/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl relative shadow-2xl flex flex-col gap-6 items-center">
        {/* Brand Logo/Header */}
        <div className="flex items-center gap-2 mb-2">
          <Image src="/NETStartIcon.png" alt="NETStart Logo" width={40} height={40} className="object-contain" />
          <span className="font-display font-bold text-2xl tracking-wide text-white leading-none pt-1">
            NET<span className="text-[#ff912d]">Start</span>
          </span>
        </div>

        <div className="text-center w-full">
          <h1 className="font-display text-2xl font-bold text-[#ff912d] mb-2">Reset Password</h1>
          <p className="font-sans text-white/60 text-sm leading-relaxed">
            Please enter and confirm your new secure password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-white/80 text-sm font-semibold">New Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#361d57]/50 text-white font-sans text-sm px-4 py-3 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-[#ff912d] transition-all"
                placeholder="At least 6 characters"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-white/80 text-sm font-semibold">Confirm New Password</label>
            <input 
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#361d57]/50 text-white font-sans text-sm px-4 py-3 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-[#ff912d] transition-all"
              placeholder="Confirm password"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading || !token}
            className="w-full bg-buttons text-white font-sans font-bold text-sm py-3 px-6 mt-2 rounded-full shadow-[4px_4px_0_#150524] hover:shadow-[6px_6px_0_#150524] hover:brightness-110 hover:-translate-y-1 hover:-translate-x-1 transition-all active:translate-y-1 active:translate-x-1 active:shadow-none active:scale-95 disabled:opacity-70 disabled:active:scale-100 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_#150524] cursor-pointer"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default function NewPasswordPage() {
  return (
    <Suspense fallback={
      <section className="min-h-screen w-full flex bg-[#1e0a2d] items-center justify-center p-4">
        <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-t-[#ff912d] animate-spin"></div>
      </section>
    }>
      <NewPasswordContent />
    </Suspense>
  );
}
