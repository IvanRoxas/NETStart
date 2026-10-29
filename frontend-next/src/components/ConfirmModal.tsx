"use client";

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, Info, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll while modal is open
  useEffect(() => {
    if (!isOpen || !mounted) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, mounted]);

  // Handle Escape key to cancel
  useEffect(() => {
    if (!isOpen || !mounted) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, mounted, onCancel]);

  // Focus dialog on open
  useEffect(() => {
    if (isOpen && mounted && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isOpen, mounted]);

  // Trap focus inside modal
  const handleDialogKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab' && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  };

  if (!isOpen || !mounted) return null;

  const badgeStyles = {
    danger: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    primary: 'bg-[#ff912d]/20 text-[#ff912d] border-[#ff912d]/30',
  }[variant];

  const confirmBtnStyles = variant === 'danger'
    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30 text-white'
    : 'bg-[#ff912d] hover:bg-[#ff912d]/90 shadow-[#ff912d]/30 text-white';

  return createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
      style={{ zIndex: 100000 }}
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-desc"
        onKeyDown={handleDialogKeyDown}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#19072c] border border-[#ff912d]/40 rounded-2xl p-6 shadow-2xl shadow-[#ff912d]/10 flex flex-col gap-5 outline-none animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-start justify-between">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${badgeStyles}`}>
            {variant === 'danger' ? (
              <Trash2 size={24} />
            ) : variant === 'warning' ? (
              <AlertTriangle size={24} />
            ) : (
              <Info size={24} />
            )}
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div>
          <h2 id="confirm-modal-title" className="text-xl font-bold text-white font-display tracking-wide">
            {title}
          </h2>
          <p id="confirm-modal-desc" className="text-sm text-gray-300 leading-relaxed mt-2">
            {message}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50 ${confirmBtnStyles}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
