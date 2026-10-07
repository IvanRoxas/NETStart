"use client";

import React from 'react';
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
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-blur" onClick={onCancel}>
      <div 
        className="custom-modal-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between">
          <div className={`modal-icon-badge ${variant}`}>
            {variant === 'danger' ? (
              <Trash2 size={26} />
            ) : variant === 'warning' ? (
              <AlertTriangle size={26} />
            ) : (
              <Info size={26} />
            )}
          </div>
          <button 
            type="button" 
            onClick={onCancel}
            className="text-white/40 hover:text-white p-1 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div>
          <h2 className="custom-modal-title">{title}</h2>
          <p className="custom-modal-desc mt-1.5">{message}</p>
        </div>

        <div className="custom-modal-buttons">
          <button
            type="button"
            className="modal-btn-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`modal-btn-confirm ${variant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
