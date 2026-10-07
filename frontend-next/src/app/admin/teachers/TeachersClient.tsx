"use client";

import React, { useState } from 'react';
import { UserCheck, Plus, Key, Power, Search, Shield, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { createTeacher, toggleTeacherStatus, resetTeacherPassword } from '@/app/admin/actions/teachers';
import AdminToast from '@/components/AdminToast';
import ConfirmModal from '@/components/ConfirmModal';

interface TeacherItem {
  id: string;
  username: string;
  displayName: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date | string;
  _count: {
    sections: number;
  };
}

export default function TeachersClient({ initialTeachers }: { initialTeachers: TeacherItem[] }) {
  const [teachers, setTeachers] = useState<TeacherItem[]>(initialTeachers);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createUsername, setCreateUsername] = useState('');
  const [createDisplayName, setCreateDisplayName] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Reset Password Modal
  const [resetTarget, setResetTarget] = useState<TeacherItem | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Toggle Status Confirm
  const [statusTarget, setStatusTarget] = useState<TeacherItem | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const filteredTeachers = teachers.filter(t => {
    const q = searchQuery.toLowerCase();
    return (
      t.username.toLowerCase().includes(q) ||
      (t.displayName?.toLowerCase() || '').includes(q)
    );
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createUsername || !createDisplayName || !createPassword) {
      setToast({ message: "Please fill out all fields.", type: 'error' });
      return;
    }

    try {
      setIsCreating(true);
      await createTeacher({
        username: createUsername,
        displayName: createDisplayName,
        password: createPassword,
      });

      // Optimistically add or reload
      setTeachers(prev => [
        {
          id: 'temp-' + Date.now(),
          username: createUsername,
          displayName: createDisplayName,
          role: 'TEACHER',
          isActive: true,
          createdAt: new Date().toISOString(),
          _count: { sections: 0 }
        },
        ...prev
      ]);

      setToast({ message: `Teacher account "${createUsername}" created successfully.`, type: 'success' });
      setIsCreateOpen(false);
      setCreateUsername('');
      setCreateDisplayName('');
      setCreatePassword('');
    } catch (err: any) {
      setToast({ message: err.message || "Failed to create teacher account.", type: 'error' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!statusTarget) return;
    try {
      setIsUpdatingStatus(true);
      await toggleTeacherStatus(statusTarget.id, statusTarget.isActive);
      setTeachers(prev => prev.map(t => t.id === statusTarget.id ? { ...t, isActive: !statusTarget.isActive } : t));
      setToast({
        message: `Account "${statusTarget.username}" ${statusTarget.isActive ? 'deactivated' : 'activated'} successfully.`,
        type: 'success'
      });
      setStatusTarget(null);
    } catch (err: any) {
      setToast({ message: err.message || "Failed to update account status.", type: 'error' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget || !newPassword) return;

    try {
      setIsResetting(true);
      await resetTeacherPassword(resetTarget.id, newPassword);
      setToast({ message: `Password for "${resetTarget.username}" reset successfully.`, type: 'success' });
      setResetTarget(null);
      setNewPassword('');
    } catch (err: any) {
      setToast({ message: err.message || "Failed to reset password.", type: 'error' });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 relative">
      {toast && <AdminToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#1e0a2d] p-6 rounded-2xl border border-white/5 shadow-lg gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <UserCheck className="text-[#ff912d]" size={26} />
            <h2 className="text-2xl font-bold text-white">Teacher Accounts</h2>
          </div>
          <p className="text-sm text-gray-400">
            Create and manage teacher credentials for section advisory and student tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff912d]"
            />
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#ff912d] hover:bg-[#ff912d]/90 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-[#ff912d]/20 cursor-pointer"
          >
            <Plus size={18} />
            New Teacher
          </button>
        </div>
      </div>

      {/* Teacher List Table */}
      <div className="bg-[#1e0a2d] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/30 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-6">Name & Username</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Assigned Sections</th>
                <th className="py-4 px-6">Account Status</th>
                <th className="py-4 px-6">Created Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No teacher accounts found matching your query.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{t.displayName || t.username}</span>
                        <span className="text-xs text-gray-400 font-mono">@{t.username}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                        t.role === 'SUPER_ADMIN'
                          ? 'bg-[#ff912d]/10 text-[#ff912d] border border-[#ff912d]/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        <Shield size={12} />
                        {t.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Teacher'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-300 font-semibold">{t._count?.sections ?? 0}</span>
                      <span className="text-xs text-gray-500 ml-1">section(s)</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                        t.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {t.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-400 text-xs">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setResetTarget(t)}
                          title="Reset Password"
                          className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <Key size={16} />
                        </button>
                        {t.role !== 'SUPER_ADMIN' && (
                          <button
                            onClick={() => setStatusTarget(t)}
                            title={t.isActive ? "Deactivate Account" : "Activate Account"}
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${
                              t.isActive
                                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                                : 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                            }`}
                          >
                            <Power size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Teacher Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1e0a2d] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserCheck className="text-[#ff912d]" size={20} />
                Create Teacher Account
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Full / Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maria Santos"
                  value={createDisplayName}
                  onChange={(e) => setCreateDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff912d]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Login Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. msantos"
                  value={createUsername}
                  onChange={(e) => setCreateUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff912d]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Temporary Password
                </label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff912d]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 text-sm font-bold bg-[#ff912d] hover:bg-[#ff912d]/90 text-white rounded-xl transition-all shadow-lg shadow-[#ff912d]/20 disabled:opacity-50 cursor-pointer"
                >
                  {isCreating ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1e0a2d] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Key className="text-[#ff912d]" size={20} />
                Reset Password
              </h3>
              <button
                onClick={() => setResetTarget(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-300 mb-4">
              Enter a new password for <span className="font-bold text-white">@{resetTarget.username}</span> ({resetTarget.displayName}).
            </p>

            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff912d]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setResetTarget(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-5 py-2 text-sm font-bold bg-[#ff912d] hover:bg-[#ff912d]/90 text-white rounded-xl transition-all shadow-lg shadow-[#ff912d]/20 disabled:opacity-50 cursor-pointer"
                >
                  {isResetting ? "Updating..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Status Confirmation Modal */}
      <ConfirmModal
        isOpen={!!statusTarget}
        title={statusTarget?.isActive ? "Deactivate Teacher Account" : "Activate Teacher Account"}
        message={
          statusTarget?.isActive
            ? `Are you sure you want to deactivate @${statusTarget?.username}? They will no longer be able to log in to the admin panel.`
            : `Are you sure you want to reactivate @${statusTarget?.username}? They will regain access to their assigned sections.`
        }
        confirmLabel={statusTarget?.isActive ? "Deactivate" : "Activate"}
        variant={statusTarget?.isActive ? "danger" : "primary"}
        loading={isUpdatingStatus}
        onConfirm={handleConfirmToggleStatus}
        onCancel={() => setStatusTarget(null)}
      />
    </div>
  );
}
