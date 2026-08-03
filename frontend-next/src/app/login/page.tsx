"use client";

import React, { useState, useEffect } from 'react';
import { signIn, useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { resetPasswordRequest } from '../actions/reset-password';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [toastMessage, setToastMessage] = useState<{type: 'success' | 'error' | 'deleted', text: string} | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal State
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' | 'deleted' = 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('deleted') === 'true') {
        showToast("Account deleted successfully.", "deleted");
        window.history.replaceState({}, '', '/login');
      } else if (params.get('registered') === 'true') {
        showToast("Account created successfully! Please log in.", "success");
        window.history.replaceState({}, '', '/login');
      }
    }

    const savedEmail = localStorage.getItem('netstart_remember_email');
    const savedPassword = localStorage.getItem('netstart_remember_password');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToastMessage(null);

    if (rememberMe) {
      localStorage.setItem('netstart_remember_email', email);
      localStorage.setItem('netstart_remember_password', password);
    } else {
      localStorage.removeItem('netstart_remember_email');
      localStorage.removeItem('netstart_remember_password');
    }

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
      rememberMe: rememberMe.toString(),
    });

    if (res?.error) {
      showToast("Invalid email or password");
      setLoading(false);
      // Clear stale saved credentials if login fails
      localStorage.removeItem('netstart_remember_email');
      localStorage.removeItem('netstart_remember_password');
      setRememberMe(false);
    } else {
      showToast("Login successful! Redirecting...", 'success');
      setTimeout(() => window.location.href = '/dashboard', 1000);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      const res = await resetPasswordRequest(forgotEmail);
      if (res.success) {
        showToast(res.success as string, 'success');
        setForgotEmail('');
        setForgotPasswordModalOpen(false);
      } else {
        showToast((res.error as string) || "Something went wrong.", 'error');
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred. Please try again.", 'error');
    } finally {
      setForgotLoading(false);
      setShowSendConfirm(false);
    }
  };

  return (
    <section className="min-h-screen w-full flex flex-col md:flex-row bg-[#1e0a2d] relative overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl font-sans font-bold flex items-center gap-2 animate-in slide-in-from-top-4 duration-300
          ${toastMessage.type === 'error' ? 'bg-red-500/90 text-white backdrop-blur-sm border border-red-400' : ''}
          ${toastMessage.type === 'success' ? 'bg-green-500/90 text-white backdrop-blur-sm border border-green-400' : ''}
          ${toastMessage.type === 'deleted' ? 'bg-[#ffc107]/90 text-black backdrop-blur-sm border border-[#ffb703]' : ''}
        `}>
          {toastMessage.text}
        </div>
      )}

      {/* Back Button */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 z-20 flex items-center gap-2 font-mono text-white/80 hover:text-white hover:-translate-x-1 transition-transform group bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/10"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Home
      </Link>

      {/* Left Side: Illustration / Background */}
      <div className="relative hidden md:flex md:w-[60%] lg:w-[65%] bg-subs border-r border-white/5 overflow-hidden group">
        <Image 
          src="/login-bg-hq.jpg" 
          alt="Login Background" 
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-1000 brightness-125" 
          quality={100}
          priority
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e0a2d] via-transparent to-transparent opacity-80"></div>
        
        <div className="relative z-10 w-full h-full flex flex-col justify-end p-12 md:p-16 lg:p-24 pb-20">
          <span className="bg-[#ff912d]/20 text-[#ff912d] font-sans font-bold text-xs uppercase tracking-widest py-1.5 px-4 rounded-full mb-6 border border-[#ff912d]/30 w-max shadow-lg">
            Log In
          </span>
          <h2 className="font-display text-5xl lg:text-7xl font-bold text-white leading-tight mb-6 drop-shadow-lg">
            Resume Your <br/> <span className="text-borders">Journey</span>
          </h2>
          <p className="font-sans text-white/80 text-base lg:text-lg leading-relaxed max-w-md">
            Log in to continue building your skills in a gamified, risk-free coding environment.
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full md:w-[40%] lg:w-[35%] min-h-screen p-8 md:p-12 lg:p-16 flex flex-col justify-center relative items-center bg-[#1e0a2d]">
        <div className="w-full max-w-[340px]">
          <div className="mb-8 text-center w-full">
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-[#ff912d] mb-3">Welcome Back!</h1>
            <p className="font-sans text-white/60 text-sm md:text-base">Ready for another learning adventure?</p>
          </div>

          {status === 'loading' ? (
            <div className="w-full flex justify-center py-12">
              <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-t-[#ff912d] animate-spin"></div>
            </div>
          ) : session?.user ? (
            <div className="w-full flex flex-col gap-4 bg-white/5 p-6 rounded-2xl border border-white/10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-[#361d57] to-[#ff912d] p-[2px] shadow-lg mb-2">
                <div className="w-full h-full bg-[#1e0a2d] rounded-full overflow-hidden flex items-center justify-center">
                  {session.user.image ? (
                    <Image src={session.user.image === '/Planet 1.svg' ? '/Profile.svg' : session.user.image} alt="User Avatar" width={64} height={64} className="object-cover" />
                  ) : (
                    <span className="font-bold text-[#ff912d] text-xl uppercase">{session.user.name?.charAt(0) || 'U'}</span>
                  )}
                </div>
              </div>
              <h3 className="text-white font-bold text-lg">{session.user.name}</h3>
              <p className="text-white/60 text-sm mb-4">{session.user.email}</p>
              
              <Link 
                href="/dashboard"
                className="w-full bg-buttons text-white font-sans font-bold text-sm py-3 px-6 rounded-full shadow-[4px_4px_0_#150524] hover:shadow-[6px_6px_0_#150524] hover:-translate-y-1 hover:-translate-x-1 transition-all active:translate-y-1 active:translate-x-1 active:shadow-none"
              >
                Continue to Dashboard
              </Link>
              
              <button 
                onClick={() => signOut({ redirect: false })}
                className="w-full mt-2 bg-transparent border-2 border-white/20 text-white font-sans font-bold text-sm py-2.5 px-6 rounded-full hover:bg-white hover:text-[#150524] transition-all"
              >
                Sign in to another account
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
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
                  <div className="flex justify-between items-center">
                    <label className="font-sans text-white/80 text-sm font-semibold">Password</label>
                    <button 
                      type="button" 
                      onClick={() => setForgotPasswordModalOpen(true)} 
                      className="text-xs text-[#ff912d] hover:text-[#ffc107] font-bold transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#361d57]/50 text-white font-sans text-sm px-3 py-2 pr-10 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-[#ff912d] transition-all"
                      placeholder="••••••••"
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

                <div className="flex items-center gap-3 mt-1">
                  <label className="relative flex cursor-pointer items-center rounded-full p-1" htmlFor="checkbox">
                    <input
                      type="checkbox"
                      className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-white/20 bg-white/5 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-[#ff912d] checked:bg-[#ff912d] checked:before:bg-[#ff912d] hover:before:opacity-10"
                      id="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <div className="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-[#150524] opacity-0 transition-opacity peer-checked:opacity-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="1"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </div>
                  </label>
                  <label className="mt-px cursor-pointer select-none font-sans text-sm font-semibold text-white/70 hover:text-white transition-colors" htmlFor="checkbox">
                    Remember Me
                  </label>
                </div>


                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-buttons text-white font-sans font-bold text-sm py-2.5 px-6 mt-2 rounded-full shadow-[4px_4px_0_#150524] hover:shadow-[6px_6px_0_#150524] hover:brightness-110 hover:-translate-y-1 hover:-translate-x-1 transition-all active:translate-y-1 active:translate-x-1 active:shadow-none active:scale-95 disabled:opacity-70 disabled:active:scale-100 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_#150524] cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>

              <div className="w-full flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="font-sans font-semibold text-white/40 text-xs tracking-widest uppercase">Or</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              <button 
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                className="flex items-center justify-center gap-4 w-full bg-transparent border-2 border-white/20 text-white hover:bg-white hover:text-[#150524] font-sans font-bold text-sm py-2 px-6 rounded-full transition-all active:scale-95 cursor-pointer"
              >
                <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              
              <div className="mt-8 text-center w-full">
                <p className="font-sans text-sm text-white/60">
                  Need an account?{' '}
                  <Link href="/register" className="text-[#ff912d] hover:text-[#ffc107] font-bold transition-colors">
                    Register here
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#1e0a2d]/95 backdrop-blur-md border border-white/10 rounded-3xl p-8 max-w-sm w-full relative shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button 
              type="button"
              onClick={() => setForgotPasswordModalOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="text-center w-full">
              <h3 className="text-xl font-bold text-white mb-2">Forgot Password</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Enter your email address and we'll send you a secure link to reset your password.
              </p>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setShowSendConfirm(true);
              }} 
              className="w-full flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-white/80 text-sm font-semibold">Email Address</label>
                <input 
                  type="email" 
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full bg-[#361d57]/50 text-white font-sans text-sm px-4 py-3 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-[#ff912d] transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={forgotLoading}
                className="w-full bg-buttons text-white font-sans font-bold text-sm py-3 px-6 mt-2 rounded-full shadow-[4px_4px_0_#150524] hover:shadow-[6px_6px_0_#150524] hover:brightness-110 hover:-translate-y-1 hover:-translate-x-1 transition-all active:translate-y-1 active:translate-x-1 active:shadow-none active:scale-95 disabled:opacity-70 disabled:active:scale-100 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_#150524] cursor-pointer"
              >
                Send Reset Link
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Send Reset Email Confirmation Modal */}
      {showSendConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#1e0a2d]/95 backdrop-blur-md border border-white/10 rounded-3xl p-8 max-w-sm w-full relative shadow-[0_0_50px_rgba(255,145,45,0.15)] text-center flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-[#ff912d]/10 rounded-full flex items-center justify-center border border-[#ff912d]/20 text-[#ff912d]">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Send Reset Email?</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Are you sure you want to send a password reset link to <strong className="text-white break-all">{forgotEmail}</strong>?
              </p>
            </div>

            <div className="flex gap-3 w-full mt-4">
              <button 
                type="button" 
                onClick={() => setShowSendConfirm(false)} 
                className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white/70 font-bold hover:text-white hover:bg-white/5 transition-colors text-sm cursor-pointer active:scale-95"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleForgotSubmit}
                disabled={forgotLoading}
                className="flex-1 py-3 px-4 rounded-xl bg-[#ff912d] hover:bg-orange-400 text-black font-extrabold transition-all flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-95 shadow-lg shadow-[#ff912d]/10"
              >
                {forgotLoading ? 'Sending...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
