import React, { useEffect } from 'react';
import { ShieldAlert, Terminal, X } from 'lucide-react';

export default function AdminToast({ 
  message, 
  type, 
  onClose 
}: { 
  message: string; 
  type: 'success' | 'error' | 'info'; 
  onClose: () => void 
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getBorderColor = () => {
    switch (type) {
      case 'success': return 'border-amber-500';
      case 'error': return 'border-red-500';
      case 'info': return 'border-blue-500';
      default: return 'border-slate-500';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success': return 'text-amber-500';
      case 'error': return 'text-red-500';
      case 'info': return 'text-blue-500';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 px-6 py-4 rounded-md shadow-2xl z-[9999] flex items-center gap-4 animate-fade-in bg-slate-900 border-l-4 ${getBorderColor()}`}>
      <div className={`shrink-0 ${getIconColor()}`}>
        {type === 'error' ? <ShieldAlert size={24} /> : <Terminal size={24} />}
      </div>
      <div className="font-mono text-slate-200 text-sm tracking-tight flex-1">
        {message}
      </div>
      <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors shrink-0">
        <X size={18} />
      </button>
    </div>
  );
}
