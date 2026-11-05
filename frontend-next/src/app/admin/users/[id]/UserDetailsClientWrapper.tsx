"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, CheckCircle, Ban, Zap, Star, Trophy, Package, Target, Users as UsersIcon, X, Check, RefreshCcw, History, Trash2, Brain, GraduationCap, Unlock, Lock, Sparkles, AlertTriangle, Compass, Video, Bot, CheckCircle2, Clock } from 'lucide-react';
import Image from 'next/image';
import { editGamificationStats, deleteUser, adminResetAptitudeTest, adminSetAptitudeStatus, assignStudentToSection, removeStudentFromSection, toggleUserDemoModePrivilege, toggleUserVerification } from '@/app/admin/actions';
import AdminToast from '@/components/AdminToast';
import ConfirmModal from '@/components/ConfirmModal';
import { getXPDetails, LEVEL_THRESHOLDS } from '@/lib/leveling';
import TitleBadge from '@/components/TitleBadge';
import { checkSessionMismatch, useAuthSync } from '@/components/AuthSyncProvider';

export default function UserDetailsClientWrapper({ 
  user: initialUser,
  sections = [],
  currentUserRole = 'SUPER_ADMIN'
}: { 
  user: any;
  sections?: any[];
  currentUserRole?: string;
}) {
  const router = useRouter();
  const { isStale, pinnedUserId } = useAuthSync();
  const isTeacher = currentUserRole === "TEACHER";
  const [user, setUser] = useState(initialUser);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [showResetAptitudeModal, setShowResetAptitudeModal] = useState(false);

  // Edit Gamification Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'XP_LEVEL' | 'GEARS'>('GEARS');
  const [editTarget, setEditTarget] = useState<'XP' | 'GEARS' | 'LEVEL'>('GEARS');
  const [editAction, setEditAction] = useState<'ADD' | 'REMOVE' | 'SET'>('ADD');
  const [editValue, setEditValue] = useState<number>(100);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);

  // Section Assignment Modal State
  const [showAssignSectionModal, setShowAssignSectionModal] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string>(initialUser?.sectionId || '');
  const [isAssigningSection, setIsAssigningSection] = useState(false);

  // Demo Mode Privilege Modal State
  const [showDemoPrivilegeModal, setShowDemoPrivilegeModal] = useState(false);
  const [isUpdatingDemoPrivilege, setIsUpdatingDemoPrivilege] = useState(false);

  const handleEditStats = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editValue < 0) return;
    
    try {
      setLoading(true);
      await editGamificationStats(user.id, editAction, editTarget, editValue);
      
      setModalOpen(false);
      setToast({ message: `Successfully updated ${editTarget}.`, type: 'success' });
      
      setUser((prev: any) => {
        let newXp = prev.xp;
        let newGears = prev.gears;
        if (editTarget === 'XP') {
          if (editAction === 'ADD') newXp = prev.xp + editValue;
          else if (editAction === 'REMOVE') newXp = Math.max(0, prev.xp - editValue);
          else if (editAction === 'SET') newXp = editValue;
        } else if (editTarget === 'GEARS') {
          if (editAction === 'ADD') newGears = prev.gears + editValue;
          else if (editAction === 'REMOVE') newGears = Math.max(0, prev.gears - editValue);
          else if (editAction === 'SET') newGears = editValue;
        } else if (editTarget === 'LEVEL') {
          if (editValue <= 1) newXp = 0;
          else if (editValue >= 10) newXp = LEVEL_THRESHOLDS[8].cumulativeXp;
          else newXp = LEVEL_THRESHOLDS[editValue - 2].cumulativeXp;
        }
        return { ...prev, xp: newXp, gears: newGears };
      });
    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || "Failed to update stats.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDemoPrivilege = async () => {
    setShowDemoPrivilegeModal(false);
    try {
      setIsUpdatingDemoPrivilege(true);
      const res = await toggleUserDemoModePrivilege(user.id, user.canUseDemoMode);
      setUser((prev: any) => ({
        ...prev,
        canUseDemoMode: res.canUseDemoMode
      }));
      setToast({
        message: `Demo Mode privilege ${res.canUseDemoMode ? 'granted' : 'revoked'} successfully.`,
        type: 'success'
      });
    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || "Failed to update demo mode privilege.", type: 'error' });
    } finally {
      setIsUpdatingDemoPrivilege(false);
    }
  };

  const handleToggleVerification = async () => {
    try {
      setLoading(true);
      const res = await toggleUserVerification(user.id, !user.isVerified);
      setUser((prev: any) => ({
        ...prev,
        isVerified: res.isVerified
      }));
      setToast({
        message: `Student verification ${res.isVerified ? 'granted' : 'revoked'} successfully.`,
        type: 'success'
      });
    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || "Failed to update verification.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  const { level, progress: progressPercentage, nextThreshold, xpToNextLevel } = getXPDetails(user.xp);

  const handleResetAptitudeTest = async () => {
    setShowResetAptitudeModal(false);
    try {
      setLoading(true);
      await adminResetAptitudeTest(user.id);
      setUser((prev: any) => ({
        ...prev,
        hasTakenAptitudeTest: false,
        logicScore: null,
        patternRecognitionScore: null,
        recommendedLearningPath: null,
      }));
      setToast({ message: "Aptitude Test reset successfully.", type: 'success' });
    } catch (err: any) {
      console.error(err);
      setToast({ message: "Failed to reset aptitude test.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAptitudeTest = async () => {
    const target = !user.hasTakenAptitudeTest;
    try {
      setLoading(true);
      await adminSetAptitudeStatus(user.id, target);
      setUser((prev: any) => ({
        ...prev,
        hasTakenAptitudeTest: target,
      }));
      setToast({ message: `Aptitude test status updated to ${target ? 'Completed' : 'Pending'}.`, type: 'success' });
    } catch (err: any) {
      console.error(err);
      setToast({ message: "Failed to update aptitude test status.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteUser = async () => {
    setShowDeleteUserModal(false);
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

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStale) return;
    try {
      setIsAssigningSection(true);
      if (selectedSectionId) {
        const res = await assignStudentToSection(user.id, selectedSectionId, pinnedUserId || undefined);
        if (checkSessionMismatch(res)) return;
        const assignedSec = sections.find(s => s.id === selectedSectionId);
        setUser((prev: any) => ({
          ...prev,
          sectionId: selectedSectionId,
          section: assignedSec ? {
            id: assignedSec.id,
            name: assignedSec.name,
            gradeLevel: assignedSec.gradeLevel,
            strand: assignedSec.strand,
            schoolYear: assignedSec.schoolYear
          } : prev.section
        }));
        setToast({ message: "Student assigned to section successfully.", type: 'success' });
      } else {
        const res = await removeStudentFromSection(user.id, pinnedUserId || undefined);
        if (checkSessionMismatch(res)) return;
        setUser((prev: any) => ({
          ...prev,
          sectionId: null,
          section: null
        }));
        setToast({ message: "Student removed from section.", type: 'success' });
      }
      setShowAssignSectionModal(false);
    } catch (err: any) {
      setToast({ message: err.message || "Failed to update section.", type: 'error' });
    } finally {
      setIsAssigningSection(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 relative pb-12">
      {toast && <AdminToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <Link 
          href="/admin" 
          className={`flex items-center gap-2 font-bold text-sm transition-colors ${
            isTeacher ? 'text-slate-600 hover:text-emerald-700' : 'text-slate-600 hover:text-blue-700'
          }`}
        >
          <ArrowLeft size={18} />
          <span>Back to Users</span>
        </Link>
        
        <div className="flex items-center gap-3">
          <Link 
            href={`/admin/users/${user.id}/logs`} 
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white font-bold transition-all border text-xs shadow-xs ${
              isTeacher ? 'border-emerald-200 text-emerald-800 hover:bg-emerald-50' : 'border-blue-200 text-blue-800 hover:bg-blue-50'
            }`}
          >
            <History size={15} />
            User Logs
          </Link>
          {currentUserRole === 'SUPER_ADMIN' && (
            <button 
              onClick={() => setShowDeleteUserModal(true)}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-red-700 hover:bg-red-50 hover:text-red-800 font-bold transition-all border border-red-200 text-xs shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {loading ? <RefreshCcw className="animate-spin" size={15} /> : <Trash2 size={15} />}
              Delete User
            </button>
          )}
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className={`bg-white border rounded-2xl shadow-sm overflow-hidden relative ${isTeacher ? 'border-emerald-200' : 'border-blue-200'}`}>
        {/* Banner */}
        <div className={`h-36 sm:h-44 w-full relative overflow-hidden ${
          isTeacher 
            ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700' 
            : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700'
        }`}>
          {user.banner && (
            <img src={user.banner} alt="Banner" className="w-full h-full object-cover opacity-75" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        </div>

        {/* Profile Info Row */}
        <div className="px-6 sm:px-8 pb-6 pt-3 relative">
          <div className="flex flex-col md:flex-row gap-5 md:items-end justify-between">
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end">
              {/* Avatar overlapping banner cleanly */}
              <div className="-mt-16 sm:-mt-20 w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-lg bg-slate-100 overflow-hidden shrink-0 z-10 flex items-center justify-center">
                {user.image ? (
                  <img src={user.image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center text-3xl font-black text-white ${
                    isTeacher ? 'bg-emerald-600' : 'bg-blue-600'
                  }`}>
                    {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>

              {/* Identity */}
              <div className="flex flex-col">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                    {user.displayName || 'No Display Name'}
                  </h1>
                  {user.studentId && (
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-300 text-slate-700 text-xs font-mono font-bold">
                      {user.studentId}
                    </span>
                  )}
                  {user.activeTitle && (
                    <TitleBadge title={user.activeTitle} size="sm" />
                  )}
                </div>
                <p className="text-slate-500 font-semibold text-sm mt-0.5">{user.email}</p>
              </div>
            </div>

            {/* Meta */}
            <div className="text-left md:text-right text-xs font-medium text-slate-500 shrink-0">
              <div>Joined: <strong className="text-slate-700">{new Date(user.createdAt).toLocaleDateString()}</strong></div>
              {user.name && <div className="mt-0.5">Username: <strong className="text-slate-700">@{user.name}</strong></div>}
            </div>
          </div>

          {/* Badges & Actions Strip */}
          <div className="flex flex-wrap items-center gap-2.5 mt-5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleToggleVerification}
              disabled={loading}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs border ${
                user.isVerified 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                  : 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100'
              }`}
              title={user.isVerified ? "Click to revoke verification" : "Click to verify student"}
            >
              {user.isVerified ? <CheckCircle size={14} className="text-emerald-600" /> : <ShieldAlert size={14} className="text-red-600" />}
              {user.isVerified ? 'Verified' : 'Unverified'}
            </button>
            
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-xs ${
              user.isBanned 
                ? 'bg-red-100 text-red-800 border-red-300' 
                : (isTeacher ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-blue-100 text-blue-800 border-blue-300')
            }`}>
              {user.isBanned ? <Ban size={14} className="text-red-600" /> : <CheckCircle size={14} className={isTeacher ? 'text-emerald-600' : 'text-blue-600'} />}
              {user.isBanned ? 'Banned' : 'Active'}
            </span>

            <button
              type="button"
              onClick={() => {
                setSelectedSectionId(user.sectionId || '');
                setShowAssignSectionModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer bg-purple-50 text-purple-800 border border-purple-300 hover:bg-purple-100 shadow-xs"
              title="Click to assign or change section"
            >
              <GraduationCap size={15} className="text-purple-600" />
              {user.section ? `Section: ${user.section.name} (Gr ${user.section.gradeLevel})` : 'Assign Section'}
            </button>

            <button
              type="button"
              onClick={() => setShowDemoPrivilegeModal(true)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs border ${
                user.canUseDemoMode
                  ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
              title="Click to toggle Demo Mode privilege"
            >
              {user.canUseDemoMode ? <Unlock size={14} className="text-amber-700" /> : <Lock size={14} className="text-slate-500" />}
              {user.canUseDemoMode ? 'Demo Mode: Allowed' : 'Demo Mode: Disabled'}
            </button>
          </div>
        </div>

        {user.bio && (
          <div className="px-6 sm:px-8 pb-6 pt-0">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-slate-700 text-sm italic">"{user.bio}"</p>
            </div>
          </div>
        )}
      </div>

      {/* Gamification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Level / XP */}
        <div className={`bg-white border rounded-2xl shadow-sm flex flex-col overflow-hidden ${isTeacher ? 'border-emerald-200' : 'border-blue-200'}`}>
          <div className="p-5 flex items-center gap-4 flex-1">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              isTeacher ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <Star size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider">Level {level}</h3>
              <div className="text-2xl font-black text-slate-900 mt-0.5">
                {user.xp} <span className={`text-xs font-bold ${isTeacher ? 'text-emerald-700' : 'text-blue-700'}`}>XP</span>
              </div>
              <div className="w-full bg-slate-100 border border-slate-200 h-2 mt-2 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${isTeacher ? 'bg-emerald-600' : 'bg-blue-600'}`} style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">{xpToNextLevel} XP to Level {level + 1}</div>
            </div>
          </div>
          <button
            onClick={() => {
              setModalMode('XP_LEVEL');
              setEditTarget('XP');
              setEditAction('ADD');
              setEditValue(100);
              setModalOpen(true);
            }}
            className={`w-full py-2.5 px-4 font-bold text-xs border-t transition-colors cursor-pointer ${
              isTeacher ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-100' : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-100'
            }`}
          >
            Adjust XP
          </button>
        </div>

        {/* Gears */}
        <div className={`bg-white border rounded-2xl shadow-sm flex flex-col overflow-hidden ${isTeacher ? 'border-emerald-200' : 'border-blue-200'}`}>
          <div className="p-5 flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
              <Zap size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider">Gears Balance</h3>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{user.gears}</div>
              <div className="text-[11px] text-slate-500 mt-1">Virtual Lab Currency</div>
            </div>
          </div>
          <button
            onClick={() => {
              setModalMode('GEARS');
              setEditTarget('GEARS');
              setEditAction('ADD');
              setEditValue(50);
              setModalOpen(true);
            }}
            className="w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border-t border-amber-100 transition-colors cursor-pointer"
          >
            Adjust Gears
          </button>
        </div>

        {/* Aptitude Status */}
        <div className={`bg-white border rounded-2xl shadow-sm flex flex-col overflow-hidden ${isTeacher ? 'border-emerald-200' : 'border-blue-200'}`}>
          <div className="p-5 flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-xs">
              <Brain size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider">Aptitude Status</h3>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  user.hasTakenAptitudeTest ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {user.hasTakenAptitudeTest ? 'COMPLETED' : 'PENDING'}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 mt-1 truncate">
                {user.recommendedLearningPath || 'No Path Assigned'}
              </div>
              {user.hasTakenAptitudeTest && (
                <div className="text-[11px] text-slate-500 mt-1">
                  Logic: <strong className="text-slate-800">{user.logicScore ?? 0}%</strong> | Pattern: <strong className="text-slate-800">{user.patternRecognitionScore ?? 0}%</strong>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 border-t border-slate-100 text-center">
            <button 
              onClick={() => setShowResetAptitudeModal(true)}
              disabled={loading}
              className="py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition-colors border-r border-slate-100 cursor-pointer disabled:opacity-50"
            >
              Reset Test
            </button>
            <button 
              onClick={handleToggleAptitudeTest}
              disabled={loading}
              className="py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {user.hasTakenAptitudeTest ? 'Set Pending' : 'Set Completed'}
            </button>
          </div>
        </div>

        {/* Demo Mode Privilege Card */}
        <div className={`bg-white border rounded-2xl shadow-sm flex flex-col overflow-hidden ${isTeacher ? 'border-emerald-200' : 'border-blue-200'}`}>
          <div className="p-5 flex items-center gap-4 flex-1">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              user.canUseDemoMode ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {user.canUseDemoMode ? <Unlock size={22} /> : <Lock size={22} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider">Demo Privilege</h3>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  user.canUseDemoMode
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-100 text-slate-600 border border-slate-300'
                }`}>
                  {user.canUseDemoMode ? 'GRANTED' : 'DISABLED'}
                </span>
              </div>
              <div className="text-xs text-slate-600 mt-1 line-clamp-2">
                {user.canUseDemoMode
                  ? 'Student can use the Demo toggle to explore missions.'
                  : 'Normal progression. Student cannot preview locked levels.'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowDemoPrivilegeModal(true)}
            disabled={isUpdatingDemoPrivilege}
            className={`w-full py-2.5 font-bold text-xs transition-colors border-t cursor-pointer disabled:opacity-50 ${
              user.canUseDemoMode
                ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-100'
                : (isTeacher ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-100' : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-100')
            }`}
          >
            {user.canUseDemoMode ? 'Revoke Demo Privilege' : 'Grant Demo Privilege'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Achievements */}
        <div className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col h-[400px] ${isTeacher ? 'border-emerald-200' : 'border-blue-200'}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Trophy size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Unlocked Achievements</h2>
              <p className="text-xs text-slate-500">Student milestones and badges</p>
            </div>
            <span className="ml-auto bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
              {user.userAchievements.length} Total
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {user.userAchievements.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <Trophy size={40} className="opacity-30 mb-2" />
                <p className="text-sm font-medium">No achievements unlocked yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.userAchievements.map((ua: any) => (
                  <div key={ua.achievementId} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3 hover:bg-slate-100 transition-colors">
                    <img src={ua.achievement.iconUrl} alt={ua.achievement.name} className="w-10 h-10 rounded-full border border-slate-300" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{ua.achievement.name}</h4>
                      <div className="text-[11px] text-slate-500">{new Date(ua.unlockedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Inventory */}
        <div className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col h-[400px] ${isTeacher ? 'border-emerald-200' : 'border-blue-200'}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Package size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Inventory Items</h2>
              <p className="text-xs text-slate-500">Unlocked customization gear</p>
            </div>
            <span className="ml-auto bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
              {user.inventory.length} Owned
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {user.inventory.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <Package size={40} className="opacity-30 mb-2" />
                <p className="text-sm font-medium">Inventory is empty.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.inventory.map((inv: any) => (
                  <div key={inv.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3 hover:bg-slate-100 transition-colors relative">
                    <img src={inv.shopItem.imageUrl} alt={inv.shopItem.title} className="w-10 h-10 rounded-lg object-cover border border-slate-300" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{inv.shopItem.title}</h4>
                      <div className="text-[11px] text-indigo-600 font-medium">{inv.shopItem.type} / {inv.shopItem.subCategory}</div>
                    </div>
                    {inv.isEquipped && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full" title="Equipped"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Progress & Remediation Monitoring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mission Progression & Sandbox Performance */}
        <div className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col h-[440px] ${isTeacher ? 'border-emerald-200' : 'border-blue-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Compass size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Curriculum & Sandbox Progress</h2>
              <p className="text-xs text-slate-500">Lesson missions and completion status</p>
            </div>
            <span className="ml-auto bg-slate-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full text-xs font-bold">
              {user.missionProgresses?.length || 0} Missions
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {(!user.missionProgresses || user.missionProgresses.length === 0) ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <Compass size={40} className="opacity-30 mb-2" />
                <p className="text-sm font-medium">No sandbox missions attempted yet.</p>
                <p className="text-xs text-slate-500 mt-0.5">Student has not started any coding exercises.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {user.missionProgresses.map((mp: any) => {
                  const isCompleted = mp.status === 'COMPLETED';
                  const isStruggling = (mp.failureCount || 0) >= 2;
                  return (
                    <div 
                      key={mp.id} 
                      className={`p-3.5 rounded-xl border transition-all ${
                        isStruggling 
                          ? 'bg-amber-50 border-amber-300' 
                          : isCompleted 
                            ? 'bg-emerald-50/50 border-emerald-200' 
                            : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {isCompleted ? (
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                          ) : (
                            <Clock size={16} className="text-blue-600 shrink-0" />
                          )}
                          <span className="text-xs font-bold text-slate-900 truncate font-mono">
                            {mp.missionId}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isStruggling && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                              <AlertTriangle size={10} />
                              {mp.failureCount} Retries
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isCompleted 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}>
                            {mp.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                        <span>Retries Recorded: <strong className="text-slate-700">{mp.failureCount || 0}</strong></span>
                        <span>
                          {mp.completedAt ? `Completed: ${new Date(mp.completedAt).toLocaleDateString()}` : 'In Progress'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* AI Assistance & Remediation Telemetry */}
        <div className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col h-[440px] ${isTeacher ? 'border-emerald-200' : 'border-blue-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">AI Diagnostics & Intervention Logs</h2>
              <p className="text-xs text-slate-500">Gemini scaffolding and video fallback telemetry</p>
            </div>
            <span className="ml-auto bg-purple-100 text-purple-800 border border-purple-300 px-2.5 py-0.5 rounded-full text-xs font-bold">
              {user.interventionLogs?.length || 0} Events
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {(!user.interventionLogs || user.interventionLogs.length === 0) ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <Bot size={40} className="opacity-30 mb-2" />
                <p className="text-sm font-medium">No remediation events recorded.</p>
                <p className="text-xs text-slate-500 mt-0.5">Student has completed missions without code failovers.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {user.interventionLogs.map((log: any) => (
                  <div 
                    key={log.id} 
                    className={`p-3.5 rounded-xl border transition-all ${
                      log.fallbackUsed 
                        ? 'bg-pink-50 border-pink-300' 
                        : 'bg-purple-50 border-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-300 shadow-xs">
                        {log.missionId}
                      </span>
                      {log.fallbackUsed ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-100 text-pink-800 border border-pink-300 flex items-center gap-1">
                          <Video size={10} />
                          Video Fallback Triggered
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1">
                          <Sparkles size={10} />
                          AI Hint Provided
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-slate-700">
                      <span className="text-slate-500 font-medium">Error Pattern:</span> <span className="text-purple-900 font-bold">{log.errorType}</span>
                    </div>
                    {log.hintId && (
                      <div className="mt-1 text-[11px] text-slate-500">
                        Remediation Key: <span className="font-mono text-slate-700">{log.hintId}</span>
                      </div>
                    )}
                    <div className="mt-2 pt-1.5 border-t border-slate-200/60 text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={showDeleteUserModal}
        title="Delete User Permanently?"
        message="Are you sure you want to PERMANENTLY delete this user? This action cannot be undone."
        confirmLabel="Delete User"
        cancelLabel="Cancel"
        variant="danger"
        loading={loading}
        onConfirm={handleDeleteUser}
        onCancel={() => setShowDeleteUserModal(false)}
      />

      <ConfirmModal
        isOpen={showResetAptitudeModal}
        title="Reset Aptitude Test?"
        message="Are you sure you want to reset this user's Aptitude Test status and scores?"
        confirmLabel="Reset Test"
        cancelLabel="Cancel"
        variant="warning"
        loading={loading}
        onConfirm={handleResetAptitudeTest}
        onCancel={() => setShowResetAptitudeModal(false)}
      />

      <ConfirmModal
        isOpen={showDemoPrivilegeModal}
        title={user.canUseDemoMode ? "Revoke Demo Mode Privilege?" : "Grant Demo Mode Privilege?"}
        message={user.canUseDemoMode 
          ? `Are you sure you want to revoke Demo Mode access for ${user.displayName || user.email}? The user will immediately lose the ability to preview locked sectors and test modules.`
          : `Grant Demo Mode access to ${user.displayName || user.email}? The user will gain the ability to toggle Demo Mode on modules and sector overviews.`}
        confirmLabel={user.canUseDemoMode ? "Revoke Access" : "Grant Access"}
        cancelLabel="Cancel"
        variant={user.canUseDemoMode ? "warning" : "primary"}
        loading={isUpdatingDemoPrivilege}
        onConfirm={handleToggleDemoPrivilege}
        onCancel={() => setShowDemoPrivilegeModal(false)}
      />

      {/* Assign Section Modal */}
      {showAssignSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className={isTeacher ? "text-emerald-600" : "text-blue-600"} size={20} />
                Assign Student Section
              </h3>
              <button
                type="button"
                onClick={() => setShowAssignSectionModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              Select a section for <strong className="text-slate-900">{user.displayName || user.email}</strong>.
            </p>

            <form onSubmit={handleSaveSection} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Section
                </label>
                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">-- Unassigned (No Section) --</option>
                  {sections.map(sec => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name} • Grade {sec.gradeLevel} ({sec.strand})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignSectionModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigningSection}
                  className={`px-5 py-2 text-sm font-bold text-white rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer ${
                    isTeacher ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isAssigningSection ? "Saving..." : "Save Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gamification Adjust Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-md w-full relative flex flex-col shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs ${
                modalMode === 'GEARS' ? 'bg-amber-100 text-amber-700' : (isTeacher ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700')
              }`}>
                {modalMode === 'GEARS' ? <Zap size={28} /> : <Star size={28} />}
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 mb-1 text-center font-display">
              {modalMode === 'GEARS' ? 'Adjust Gears Balance' : 'Adjust Experience Points (XP)'}
            </h2>
            <p className="text-xs text-slate-500 mb-5 text-center">
              Student: <strong className="text-slate-800">{user.displayName || user.email}</strong>
            </p>

            <form onSubmit={handleEditStats} className="w-full flex flex-col gap-4">
              {modalMode === 'XP_LEVEL' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Target</label>
                  <select 
                    value={editTarget} 
                    onChange={(e) => setEditTarget(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="XP">Experience Points (XP)</option>
                    <option value="LEVEL">Direct Level</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Action</label>
                <select 
                  value={editAction} 
                  onChange={(e) => setEditAction(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="ADD">Add (Credit Points)</option>
                  <option value="REMOVE">Deduct Points</option>
                  <option value="SET">Set Exact Value</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Amount / Value</label>
                <input 
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={editValue}
                  onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 mt-2 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading || editValue < 0}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-bold transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 text-white text-sm cursor-pointer ${
                    modalMode === 'GEARS' 
                      ? 'bg-amber-600 hover:bg-amber-700' 
                      : (isTeacher ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700')
                  }`}
                >
                  {loading ? <RefreshCcw className="animate-spin" size={16} /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}