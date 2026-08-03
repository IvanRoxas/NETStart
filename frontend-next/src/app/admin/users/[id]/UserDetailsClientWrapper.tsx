"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, CheckCircle, Ban, Zap, Star, Trophy, Package, Target, Users as UsersIcon, X, Check, RefreshCcw, History, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { editGamificationStats, deleteUser } from '@/app/admin/actions';
import AdminToast from '@/components/AdminToast';
import { getXPDetails } from '@/lib/leveling';

export default function UserDetailsClientWrapper({ user: initialUser }: { user: any }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  // Edit Gamification Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'XP_LEVEL' | 'GEARS'>('GEARS');
  const [editTarget, setEditTarget] = useState<'XP' | 'GEARS' | 'LEVEL'>('GEARS');
  const [editAction, setEditAction] = useState<'ADD' | 'REMOVE' | 'SET'>('ADD');
  const [editValue, setEditValue] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  
  const { level, progress: progressPercentage, nextThreshold } = getXPDetails(user.xp);
  const xpToNextLevel = level < 10 ? nextThreshold - user.xp : 0;

  const handleEditStats = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editValue < 0) return;
    
    try {
      setLoading(true);
      await editGamificationStats(user.id, editAction, editTarget, editValue);
      
      setModalOpen(false);
      setToast({ message: `Successfully updated ${editTarget}.`, type: 'success' });
      
      // Simple reload to get updated stats and level correctly
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || "Failed to update stats.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm("Are you sure you want to PERMANENTLY delete this user? This action cannot be undone.")) return;
    try {
      setLoading(true);
      await deleteUser(user.id);
      router.push('/admin');
    } catch (err: any) {
      console.error(err);
      setToast({ message: "Failed to delete user.", type: 'error' });
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 relative pb-12">
      {toast && <AdminToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Users</span>
        </Link>
        
        <div className="flex items-center gap-3">
          <Link 
            href={`/admin/users/${user.id}/logs`} 
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 font-bold transition-colors border border-slate-500/20 text-sm"
          >
            <History size={16} />
            User Logs
          </Link>
          <button 
            onClick={handleDeleteUser}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold transition-colors border border-red-500/20 text-sm disabled:opacity-50"
          >
            {loading ? <RefreshCcw className="animate-spin" size={16} /> : <Trash2 size={16} />}
            Delete User
          </button>
        </div>
      </div>

      {/* Main Profile Header */}
      <div className="bg-[#1e0a2d] border border-white/5 rounded-3xl shadow-2xl overflow-hidden relative">
        {/* Banner */}
        <div className="h-48 w-full bg-gradient-to-r from-indigo-900/50 to-purple-900/50 relative">
          {user.banner && (
            <img src={user.banner} alt="Banner" className="w-full h-full object-cover opacity-60" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e0a2d] to-transparent"></div>
        </div>

        {/* Profile Info */}
        <div className="px-8 pb-8 relative -mt-16 flex flex-col md:flex-row gap-6 md:items-end">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full border-4 border-[#1e0a2d] bg-black/50 overflow-hidden relative z-10 shrink-0">
            {user.image ? (
              <img src={user.image} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 z-10">
            <div>
              <h1 className="text-3xl font-black text-white tracking-wide">
                {user.displayName || 'No Display Name'}
              </h1>
              <p className="text-gray-400 font-medium">{user.email}</p>
              
              <div className="flex items-center gap-3 mt-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  user.isVerified ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {user.isVerified ? <CheckCircle size={14} /> : <ShieldAlert size={14} />}
                  {user.isVerified ? 'Verified' : 'Unverified'}
                </span>
                
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  user.isBanned ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' : 'bg-[#ff912d]/10 text-[#ff912d] border border-[#ff912d]/20'
                }`}>
                  {user.isBanned ? <Ban size={14} /> : <CheckCircle size={14} />}
                  {user.isBanned ? 'Banned' : 'Active'}
                </span>
                
                {user.activeTitle && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Title: {user.activeTitle}
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500 font-medium">Joined {new Date(user.createdAt).toLocaleDateString()}</div>
              {user.name && <div className="text-sm text-gray-400 mt-1">Username: @{user.name}</div>}
            </div>
          </div>
        </div>

        {user.bio && (
          <div className="px-8 pb-8 pt-0">
            <div className="bg-black/20 rounded-xl p-4 border border-white/5">
              <p className="text-gray-300 italic">"{user.bio}"</p>
            </div>
          </div>
        )}
      </div>

      {/* Gamification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1e0a2d] border border-white/5 rounded-3xl shadow-xl flex flex-col overflow-hidden">
          <div className="p-6 flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-full bg-blue-500/20 border-2 border-blue-500/30 flex items-center justify-center">
              <Star className="text-blue-400" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-gray-400 font-bold text-sm uppercase tracking-wider">Level {level}</h3>
              <div className="text-2xl font-black text-white">{user.xp} <span className="text-sm text-blue-400 font-bold">XP</span></div>
              <div className="w-full bg-black/40 h-2 mt-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">{xpToNextLevel} XP to Level {level + 1}</div>
            </div>
          </div>
          <button 
            onClick={() => { setModalMode('XP_LEVEL'); setEditTarget('XP'); setEditAction('ADD'); setEditValue(0); setModalOpen(true); }} 
            className="w-full py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold text-sm transition-colors border-t border-blue-500/20"
          >
            Edit XP/Level
          </button>
        </div>

        <div className="bg-[#1e0a2d] border border-white/5 rounded-3xl shadow-xl flex flex-col overflow-hidden">
          <div className="p-6 flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-full bg-[#ff912d]/20 border-2 border-[#ff912d]/30 flex items-center justify-center">
              <Zap className="text-[#ff912d]" size={24} />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-gray-400 font-bold text-sm uppercase tracking-wider">Gears Balance</h3>
                <div className="text-3xl font-black text-white mt-1">{user.gears}</div>
                <div className="text-xs text-gray-500 mt-1">Virtual Currency</div>
              </div>
            </div>
          </div>
          <button 
            onClick={() => { setModalMode('GEARS'); setEditTarget('GEARS'); setEditAction('ADD'); setEditValue(0); setModalOpen(true); }} 
            className="w-full py-3 bg-[#ff912d]/10 hover:bg-[#ff912d]/20 text-[#ff912d] font-bold text-sm transition-colors border-t border-[#ff912d]/20"
          >
            Edit Currency
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Achievements */}
        <div className="bg-[#1e0a2d] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col h-[400px]">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="text-[#ff912d]" size={24} />
            <h2 className="text-xl font-bold text-white">Unlocked Achievements</h2>
            <span className="ml-auto bg-black/40 text-gray-400 px-3 py-1 rounded-full text-xs font-bold">
              {user.userAchievements.length} Total
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {user.userAchievements.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                <Trophy size={48} className="opacity-20 mb-3" />
                <p>No achievements unlocked yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.userAchievements.map((ua: any) => (
                  <div key={ua.achievementId} className="bg-black/20 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-white/10 transition-colors">
                    <img src={ua.achievement.iconUrl} alt={ua.achievement.name} className="w-12 h-12 rounded-full border-2 border-[#ff912d]/30" />
                    <div>
                      <h4 className="text-sm font-bold text-white">{ua.achievement.name}</h4>
                      <div className="text-xs text-gray-400">{new Date(ua.unlockedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-[#1e0a2d] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col h-[400px]">
          <div className="flex items-center gap-3 mb-6">
            <Package className="text-indigo-400" size={24} />
            <h2 className="text-xl font-bold text-white">Inventory Items</h2>
            <span className="ml-auto bg-black/40 text-gray-400 px-3 py-1 rounded-full text-xs font-bold">
              {user.inventory.length} Owned
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {user.inventory.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                <Package size={48} className="opacity-20 mb-3" />
                <p>Inventory is empty.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.inventory.map((inv: any) => (
                  <div key={inv.id} className="bg-black/20 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-white/10 transition-colors relative">
                    <img src={inv.shopItem.imageUrl} alt={inv.shopItem.title} className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{inv.shopItem.title}</h4>
                      <div className="text-xs text-indigo-400 font-medium">{inv.shopItem.type} / {inv.shopItem.subCategory}</div>
                    </div>
                    {inv.isEquipped && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" title="Equipped"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
      </div>

      {/* Gamification Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1e0a2d] border border-white/10 rounded-3xl p-8 max-w-md w-full relative flex flex-col shadow-2xl">
            <div className="flex justify-center">
              <div className={`w-16 h-16 mb-6 rounded-full border-2 flex items-center justify-center ${
                modalMode === 'GEARS' ? 'bg-[#ff912d]/20 border-[#ff912d]/50 text-[#ff912d]' : 'bg-blue-500/20 border-blue-500/50 text-blue-400'
              }`}>
                {modalMode === 'GEARS' ? <Zap size={32} /> : <Star size={32} />}
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2 text-center">
              {modalMode === 'GEARS' ? 'Edit Currency' : 'Edit XP/Level'}
            </h2>
            <p className="text-sm text-gray-400 mb-6 text-center">
              Editing: <strong className="text-white">{user.email}</strong>
            </p>

            <form onSubmit={handleEditStats} className="w-full flex flex-col gap-4">
              
              {modalMode === 'XP_LEVEL' && (
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-1">Target</label>
                  <select 
                    value={editTarget} 
                    onChange={(e) => setEditTarget(e.target.value as any)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="XP" className="bg-[#1e0a2d]">Experience Points (XP)</option>
                    <option value="LEVEL" className="bg-[#1e0a2d]">Level</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1">Action</label>
                <select 
                  value={editAction} 
                  onChange={(e) => setEditAction(e.target.value as any)}
                  className={`w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none ${modalMode === 'GEARS' ? 'focus:border-[#ff912d]' : 'focus:border-blue-500'}`}
                >
                  <option value="ADD" className="bg-[#1e0a2d]">Add (Grant)</option>
                  <option value="REMOVE" className="bg-[#1e0a2d]">Remove (Take)</option>
                  <option value="SET" className="bg-[#1e0a2d]">Set Exact Value</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1">Amount / Value</label>
                <input 
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={editValue}
                  onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                  className={`w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none ${modalMode === 'GEARS' ? 'focus:border-[#ff912d]' : 'focus:border-blue-500'}`}
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading || editValue < 0}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-white ${
                    modalMode === 'GEARS' ? 'bg-[#ff912d] hover:bg-[#e07b22]' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {loading ? <RefreshCcw className="animate-spin" size={20} /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
