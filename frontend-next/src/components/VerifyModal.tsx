"use client";

import React, { useState, useEffect } from 'react';
import { SessionContext } from 'next-auth/react';
import { generateAndSendCode, verifyCode } from '@/app/actions/verification';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VerifyModal({ isOpen, onClose }: VerifyModalProps) {
  const sessionContext = React.useContext(SessionContext);
  const session = sessionContext?.data;
  const update = sessionContext?.update || (async () => null);
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [cooldown, setCooldown] = useState(0);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (!isOpen) return null;

  const handleSendCode = async () => {
    if (!session?.user?.email) return;
    
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    const result = await generateAndSendCode(session.user.email, session.user.name || '');
    
    if (result.success) {
      setMessage({ text: 'Verification code sent to your email.', type: 'success' });
      setCooldown(60);
    } else {
      setMessage({ text: result.error || 'Failed to send code.', type: 'error' });
    }
    
    setLoading(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email || !code) return;

    setLoading(true);
    setMessage({ text: '', type: '' });

    const result = await verifyCode(session.user.email, code);

    if (result.success) {
      setMessage({ text: 'Account verified successfully.', type: 'success' });
      
      await update({ isVerified: true });
      window.dispatchEvent(new Event('notifications_updated'));
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setMessage({ text: result.error || 'Invalid or expired code.', type: 'error' });
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-mono text-white selection:bg-[#ff912d] selection:text-[#0a0510]">
      <div className="relative w-full max-w-md bg-[#150a21] border border-white/10 rounded-xl p-8 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-20">
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <h1 className="text-xl font-bold tracking-widest text-[#ff912d] uppercase mb-2">Account Verification</h1>
          <p className="text-xs text-white/50">Please verify your email address to continue</p>
        </div>

        <div className="space-y-6 relative z-10">
          <div className="bg-black/40 p-4 rounded border border-white/5 text-sm">
            <p className="text-white/70 mb-2">Current Identity:</p>
            <p className="text-[#ff912d] font-bold">{session?.user?.email}</p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleSendCode}
              disabled={loading || cooldown > 0}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 px-4 rounded text-sm uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && !code ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Request Verification Code'}
            </button>
          </div>

          <form onSubmit={handleVerify} className="space-y-4 pt-4 border-t border-white/5">
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Enter 6-Digit Code</label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-black/50 border border-white/10 focus:border-[#ff912d] text-center text-3xl tracking-[1rem] py-4 rounded outline-none transition-colors font-bold text-white placeholder:text-white/10"
                placeholder="000000"
                required
              />
            </div>

            {message.text && (
              <div className={`p-3 rounded text-sm text-center ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-[#ff912d]/10 text-[#ff912d] border border-[#ff912d]/20'}`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-[#ff912d] hover:bg-[#ffaa55] text-black font-bold py-4 px-4 rounded uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,145,45,0.3)] hover:shadow-[0_0_25px_rgba(255,145,45,0.5)]"
            >
              {loading && code ? 'Verifying...' : 'Verify Account'}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
