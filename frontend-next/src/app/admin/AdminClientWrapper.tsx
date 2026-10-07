"use client";

import React, { useState } from 'react';
import { 
  Search, 
  ShieldAlert, 
  CheckCircle, 
  Ban, 
  RefreshCcw, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Brain,
  GraduationCap,
  X,
  Unlock,
  Lock
} from 'lucide-react';
import Link from 'next/link';
import { 
  toggleUserBan, 
  forceVerifyUser, 
  assignStudentToSection, 
  removeStudentFromSection,
  toggleUserDemoModePrivilege
} from './actions';
import AdminToast from '@/components/AdminToast';
import ConfirmModal from '@/components/ConfirmModal';

interface SectionInfo {
  id: string;
  name: string;
  gradeLevel: number;
  strand: string;
  schoolYear: string;
}

export default function AdminClientWrapper({ 
  initialUsers,
  sections = [],
  currentUserRole = 'SUPER_ADMIN'
}: { 
  initialUsers: any[];
  sections?: SectionInfo[];
  currentUserRole?: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED' | 'BANNED'>('ALL');
  const [sectionFilter, setSectionFilter] = useState<string>('ALL');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;
  
  // Modal State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Assign Section Modal
  const [assignTargetUser, setAssignTargetUser] = useState<any | null>(null);
  const [targetSectionId, setTargetSectionId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Demo Mode Privilege Confirm Modal
  const [demoPrivilegeTarget, setDemoPrivilegeTarget] = useState<any | null>(null);
  const [isUpdatingDemoPrivilege, setIsUpdatingDemoPrivilege] = useState(false);

  const isTeacher = currentUserRole === 'TEACHER';

  const filteredUsers = users.filter(u => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (u.email?.toLowerCase() || '').includes(query) ||
                          (u.displayName?.toLowerCase() || '').includes(query);
    
    let matchesStatus = true;
    if (statusFilter === 'VERIFIED') matchesStatus = u.isVerified;
    else if (statusFilter === 'UNVERIFIED') matchesStatus = !u.isVerified;
    else if (statusFilter === 'BANNED') matchesStatus = u.isBanned;

    let matchesSection = true;
    if (sectionFilter === 'UNASSIGNED') {
      matchesSection = !u.sectionId;
    } else if (sectionFilter !== 'ALL') {
      matchesSection = u.sectionId === sectionFilter;
    }

    return matchesSearch && matchesStatus && matchesSection;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleToggleBan = async (userId: string, currentStatus: boolean) => {
    try {
      setLoadingAction(`ban-${userId}`);
      await toggleUserBan(userId, currentStatus);
      setUsers(users.map(u => u.id === userId ? { ...u, isBanned: !currentStatus } : u));
      setToast({ message: `User successfully ${currentStatus ? 'unbanned' : 'banned'}.`, type: 'success' });
    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || "Failed to toggle ban status.", type: 'error' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleForceVerify = async (userId: string) => {
    try {
      setLoadingAction(`verify-${userId}`);
      await forceVerifyUser(userId);
      setUsers(users.map(u => u.id === userId ? { ...u, isVerified: true } : u));
      setToast({ message: "User successfully verified.", type: 'success' });
    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || "Failed to verify user.", type: 'error' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleOpenAssign = (user: any) => {
    setAssignTargetUser(user);
    setTargetSectionId(user.sectionId || '');
  };

  const handleSaveSectionAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTargetUser) return;

    try {
      setIsAssigning(true);
      if (targetSectionId) {
        await assignStudentToSection(assignTargetUser.id, targetSectionId);
        const assignedSection = sections.find(s => s.id === targetSectionId);
        setUsers(users.map(u => u.id === assignTargetUser.id ? {
          ...u,
          sectionId: targetSectionId,
          section: assignedSection ? {
            id: assignedSection.id,
            name: assignedSection.name,
            gradeLevel: assignedSection.gradeLevel,
            strand: assignedSection.strand,
            schoolYear: assignedSection.schoolYear,
          } : u.section
        } : u));
        setToast({ 
          message: `${assignTargetUser.displayName || assignTargetUser.email} assigned to section.`, 
          type: 'success' 
        });
      } else {
        await removeStudentFromSection(assignTargetUser.id);
        setUsers(users.map(u => u.id === assignTargetUser.id ? {
          ...u,
          sectionId: null,
          section: null
        } : u));
        setToast({ 
          message: `${assignTargetUser.displayName || assignTargetUser.email} removed from section.`, 
          type: 'success' 
        });
      }
      setAssignTargetUser(null);
    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || "Failed to update section assignment.", type: 'error' });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleConfirmToggleDemoPrivilege = async () => {
    if (!demoPrivilegeTarget) return;
    try {
      setIsUpdatingDemoPrivilege(true);
      const res = await toggleUserDemoModePrivilege(demoPrivilegeTarget.id, demoPrivilegeTarget.canUseDemoMode);
      setUsers(users.map(u => u.id === demoPrivilegeTarget.id ? { ...u, canUseDemoMode: res.canUseDemoMode } : u));
      setToast({
        message: `Demo Mode privilege ${res.canUseDemoMode ? 'granted to' : 'revoked from'} ${demoPrivilegeTarget.displayName || demoPrivilegeTarget.email}.`,
        type: 'success'
      });
      setDemoPrivilegeTarget(null);
    } catch (err: any) {
      setToast({ message: err.message || "Failed to update demo mode privilege.", type: 'error' });
    } finally {
      setIsUpdatingDemoPrivilege(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 relative">
      {toast && <AdminToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#1e0a2d] p-6 rounded-2xl border border-white/5 shadow-lg gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">
            {isTeacher ? "My Students" : "User Management"}
          </h2>
          <p className="text-sm text-gray-400">
            {isTeacher 
              ? `Students enrolled in your sections: ${users.length}`
              : `Total registered students: ${users.length}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Section Filter */}
          <select
            value={sectionFilter}
            onChange={(e) => {
              setSectionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#ff912d] cursor-pointer"
          >
            <option value="ALL" className="bg-[#1e0a2d]">All Sections</option>
            <option value="UNASSIGNED" className="bg-[#1e0a2d]">Unassigned</option>
            {sections.map(s => (
              <option key={s.id} value={s.id} className="bg-[#1e0a2d]">
                {s.name} (Gr {s.gradeLevel})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#ff912d] cursor-pointer"
          >
            <option value="ALL" className="bg-[#1e0a2d]">All Statuses</option>
            <option value="VERIFIED" className="bg-[#1e0a2d]">Verified</option>
            <option value="UNVERIFIED" className="bg-[#1e0a2d]">Unverified</option>
            <option value="BANNED" className="bg-[#1e0a2d]">Banned</option>
          </select>

          {/* Search Box */}
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#ff912d] transition-all"
              placeholder="Search user or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#1e0a2d] border border-white/5 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-white/5">
            <thead className="bg-black/20">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Section</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Aptitude</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Account State</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Demo Access</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Stats</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-transparent">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No users found matching your current search and filter criteria.
                  </td>
                </tr>
              ) : paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">{user.email || 'No Email'}</span>
                      {user.displayName && <span className="text-xs text-gray-500">{user.displayName}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.section ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        <GraduationCap size={13} />
                        {user.section.name} (Gr {user.section.gradeLevel})
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.isVerified ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {user.isVerified ? <CheckCircle size={14} /> : <ShieldAlert size={14} />}
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.hasTakenAptitudeTest ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}>
                      <Brain size={14} />
                      {user.hasTakenAptitudeTest ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.isBanned ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' : 'bg-[#ff912d]/10 text-[#ff912d] border border-[#ff912d]/20'
                    }`}>
                      {user.isBanned ? <Ban size={14} /> : <CheckCircle size={14} />}
                      {user.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setDemoPrivilegeTarget(user)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                        user.canUseDemoMode
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                      title={user.canUseDemoMode ? "Click to revoke Demo Mode privilege" : "Click to grant Demo Mode privilege"}
                    >
                      {user.canUseDemoMode ? <Unlock size={12} className="text-amber-400" /> : <Lock size={12} className="text-gray-400" />}
                      {user.canUseDemoMode ? 'GRANTED' : 'DISABLED'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="text-blue-400 font-medium">{user.xp} XP</span>
                      <span className="text-[#ff912d] font-medium">{user.gears} Gears</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenAssign(user)}
                        title="Assign Section"
                        className="p-2 rounded-lg bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors cursor-pointer"
                      >
                        <GraduationCap size={16} />
                      </button>
                      <Link href={`/admin/users/${user.id}`} className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors" title="View Profile">
                        <Eye size={16} />
                      </Link>
                      <button
                        onClick={() => handleToggleBan(user.id, user.isBanned)}
                        disabled={loadingAction === `ban-${user.id}`}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          user.isBanned ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        } disabled:opacity-50`}
                        title={user.isBanned ? "Unban User" : "Ban User"}
                      >
                        {loadingAction === `ban-${user.id}` ? <RefreshCcw className="animate-spin" size={16} /> : <Ban size={16} />}
                      </button>
                      
                      {!user.isVerified && (
                        <button
                          onClick={() => handleForceVerify(user.id)}
                          disabled={loadingAction === `verify-${user.id}`}
                          className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                          title="Force Verify"
                        >
                          {loadingAction === `verify-${user.id}` ? <RefreshCcw className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-black/30 border-t border-white/5 text-sm text-gray-400">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length} users
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 font-mono text-white text-xs bg-white/10 rounded-md">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Assign Section Modal */}
      {assignTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1e0a2d] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <GraduationCap className="text-[#ff912d]" size={20} />
                Assign Student Section
              </h3>
              <button
                onClick={() => setAssignTargetUser(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-300 mb-4">
              Set the section for <span className="font-bold text-white">{assignTargetUser.displayName || assignTargetUser.email}</span>.
            </p>

            <form onSubmit={handleSaveSectionAssignment} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Choose Section
                </label>
                <select
                  value={targetSectionId}
                  onChange={(e) => setTargetSectionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff912d] cursor-pointer"
                >
                  <option value="" className="bg-[#1e0a2d]">-- Unassigned (No Section) --</option>
                  {sections.map(sec => (
                    <option key={sec.id} value={sec.id} className="bg-[#1e0a2d]">
                      {sec.name} • Grade {sec.gradeLevel} ({sec.strand})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setAssignTargetUser(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="px-5 py-2 text-sm font-bold bg-[#ff912d] hover:bg-[#ff912d]/90 text-white rounded-xl transition-all shadow-lg shadow-[#ff912d]/20 disabled:opacity-50 cursor-pointer"
                >
                  {isAssigning ? "Saving..." : "Save Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Demo Mode Privilege Confirm Modal */}
      {demoPrivilegeTarget && (
        <ConfirmModal
          isOpen={!!demoPrivilegeTarget}
          title={demoPrivilegeTarget.canUseDemoMode ? "Revoke Demo Mode Privilege" : "Grant Demo Mode Privilege"}
          message={
            demoPrivilegeTarget.canUseDemoMode
              ? `Are you sure you want to revoke Demo Mode privilege from ${demoPrivilegeTarget.displayName || demoPrivilegeTarget.email}? They will no longer be able to activate Demo Mode.`
              : `Grant Demo Mode privilege to ${demoPrivilegeTarget.displayName || demoPrivilegeTarget.email}? This will allow the student to access the Demo Unlock toggle to explore all modules.`
          }
          confirmLabel={demoPrivilegeTarget.canUseDemoMode ? "Revoke Privilege" : "Grant Privilege"}
          variant={demoPrivilegeTarget.canUseDemoMode ? "warning" : "primary"}
          loading={isUpdatingDemoPrivilege}
          onConfirm={handleConfirmToggleDemoPrivilege}
          onCancel={() => setDemoPrivilegeTarget(null)}
        />
      )}
    </div>
  );
}
