"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [loading, setLoading] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToastMessage(null);

    // Client-side password validation
    if (password !== confirmPassword) {
      showToast("Passwords do not match");
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      showToast("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      showToast("Password must contain uppercase, lowercase, number, and symbol.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      if (res.ok) {
        showToast('Account created successfully! Redirecting...', 'success');
        setTimeout(() => router.push('/login?registered=true'), 1500);
      } else {
        const data = await res.json();
        showToast(data.message || 'Failed to register');
        setLoading(false);
      }
    } catch (err) {
      showToast('Something went wrong');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <section className="min-h-screen w-full flex flex-col md:flex-row-reverse bg-[#1e0a2d] relative overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl font-sans font-bold flex items-center gap-2 animate-in slide-in-from-top-4 duration-300
          ${toastMessage.type === 'error' ? 'bg-red-500/90 text-white backdrop-blur-sm border border-red-400' : 'bg-green-500/90 text-white backdrop-blur-sm border border-green-400'}
        `}>
          {toastMessage.text}
        </div>
      )}

      {/* Back Button */}
      <Link 
        href="/" 
        className="absolute top-8 right-8 z-20 flex items-center gap-2 font-mono text-white/80 hover:text-white hover:-translate-x-1 transition-transform group bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/10"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Home
      </Link>

      {/* Left Side (Actually Right Side structurally due to flex-row-reverse): Illustration */}
      <div className="relative hidden md:flex md:w-[60%] lg:w-[65%] bg-subs border-l border-white/5 overflow-hidden group">
        <Image 
          src="/login-bg-hq.jpg" 
          alt="Registration Background" 
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-1000 brightness-125" 
          quality={100}
          priority
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e0a2d] via-transparent to-transparent opacity-80"></div>
        
        <div className="relative z-10 w-full h-full flex flex-col justify-end p-12 md:p-16 lg:p-24 pb-20">
          <span className="bg-[#ffc107]/20 text-[#ffc107] font-sans font-bold text-xs uppercase tracking-widest py-1.5 px-4 rounded-full mb-6 border border-[#ffc107]/30 w-max shadow-lg">
            Sign Up
          </span>
          <h2 className="font-display text-5xl lg:text-7xl font-bold text-white leading-tight mb-6 drop-shadow-lg">
            Start Your <br/> <span className="text-[#ff912d]">Adventure</span>
          </h2>
          <p className="font-sans text-white/80 text-base lg:text-lg leading-relaxed max-w-md">
            Create a free account to track your progress and access exclusive modules.
          </p>
        </div>
      </div>

      {/* Right Side (Actually Left Side structurally): Registration Form */}
      <div className="w-full md:w-[40%] lg:w-[35%] min-h-screen p-8 md:p-12 lg:p-16 flex flex-col justify-center relative items-center bg-[#1e0a2d]">
        <div className="w-full max-w-[340px]">
          <div className="mb-8 text-center w-full">
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-[#ff912d] mb-3">Create an Account</h1>
            <p className="font-sans text-white/60 text-sm md:text-base">Your journey begins here!</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-white/80 text-sm font-semibold">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#361d57]/50 text-white font-sans text-sm px-3 py-2 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-[#ff912d] transition-all"
                placeholder="Choose a username"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-white/80 text-sm font-semibold">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#361d57]/50 text-white font-sans text-sm px-3 py-2 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-[#ff912d] transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-white/80 text-sm font-semibold">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#361d57]/50 text-white font-sans text-sm px-3 py-2 pr-10 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-[#ff912d] transition-all"
                  placeholder="Create a strong password"
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
              <p className="text-[10px] text-white/40 mt-1 leading-tight">
                Must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-white/80 text-sm font-semibold">Confirm Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#361d57]/50 text-white font-sans text-sm px-3 py-2 pr-10 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-[#ff912d] transition-all"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
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



            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#ff912d] text-white font-sans font-bold text-sm py-2.5 px-6 mt-2 rounded-full shadow-[4px_4px_0_#150524] hover:shadow-[6px_6px_0_#150524] hover:brightness-110 hover:-translate-y-1 hover:-translate-x-1 transition-all active:translate-y-1 active:translate-x-1 active:shadow-none active:scale-95 disabled:opacity-70 disabled:active:scale-100 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_#150524] cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Register'}
            </button>
          </form>
          
          <div className="w-full flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="font-sans font-semibold text-white/40 text-xs tracking-widest uppercase">Or</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex items-center justify-center gap-4 w-full bg-transparent border-2 border-white/20 text-white hover:bg-white hover:text-[#150524] font-sans font-bold text-sm py-2 px-6 rounded-full transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
               <div className="w-5 h-5 border-2 border-[#150524]/30 border-t-[#150524] rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Sign up with Google
          </button>
          
          <div className="mt-8 text-center w-full">
            <p className="font-sans text-sm text-white/60">
              Already have an account?{' '}
              <Link href="/login" className="text-[#ff912d] hover:text-orange-400 font-bold transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
