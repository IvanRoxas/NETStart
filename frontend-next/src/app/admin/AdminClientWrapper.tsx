"use client";

import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, CheckCircle, Ban, Settings, RefreshCcw, X, Check, Eye, Trash2, History } from 'lucide-react';
import Link from 'next/link';
import { toggleUserBan, forceVerifyUser, deleteUser } from './actions';
import AdminToast from '@/components/AdminToast';

export default function AdminClientWrapper({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED' | 'BANNED'>('ALL');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  
  // Modal State
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'VERIFIED') matchesStatus = u.isVerified;
    else if (statusFilter === 'UNVERIFIED') matchesStatus = !u.isVerified;
    else if (statusFilter === 'BANNED') matchesStatus = u.isBanned;

    return matchesSearch && matchesStatus;
  });

  const handleToggleBan = async (userId: string, currentStatus: boolean) => {
    try {
      setLoadingAction(`ban-${userId}`);
      await toggleUserBan(userId, currentStatus);
      setUsers(users.map(u => u.id === userId ? { ...u, isBanned: !currentStatus } : u));
      setToast({ message: `User successfully ${currentStatus ? 'unbanned' : 'banned'}.`, type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to toggle ban status.", type: 'error' });
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
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to verify user.", type: 'error' });
    } finally {
      setLoadingAction(null);
    }
  };


  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 relative">
      {toast && <AdminToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Search Header */}
      <div className="flex items-center justify-between bg-[#1e0a2d] p-6 rounded-2xl border border-white/5 shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">User Management</h2>
          <p className="text-sm text-gray-400">View, search, and manage all registered users.</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-black/20 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-white text-sm focus:outline-none focus:border-[#ff912d] cursor-pointer appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
          >
            <option value="ALL" className="bg-[#1e0a2d]">All Statuses</option>
            <option value="VERIFIED" className="bg-[#1e0a2d]">Verified</option>
            <option value="UNVERIFIED" className="bg-[#1e0a2d]">Unverified</option>
            <option value="BANNED" className="bg-[#1e0a2d]">Banned</option>
          </select>
          <div className="relative w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-black/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff912d] focus:border-transparent transition-all"
              placeholder="Search email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Account State</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Stats</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-transparent">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No users found matching your current search and filter criteria.
                  </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">{user.email || 'No Email'}</span>
                      {user.displayName && <span className="text-xs text-gray-500">{user.displayName}</span>}
                    </div>
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
                      user.isBanned ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' : 'bg-[#ff912d]/10 text-[#ff912d] border border-[#ff912d]/20'
                    }`}>
                      {user.isBanned ? <Ban size={14} /> : <CheckCircle size={14} />}
                      {user.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="text-blue-400 font-medium">{user.xp} XP</span>
                      <span className="text-[#ff912d] font-medium">{user.gears} Gears</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/users/${user.id}`} className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors" title="View Profile">
                        <Eye size={16} />
                      </Link>
                      <button
                        onClick={() => handleToggleBan(user.id, user.isBanned)}
                        disabled={loadingAction === `ban-${user.id}`}
                        className={`p-2 rounded-lg transition-colors ${
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
                          className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50"
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
      </div>

    </div>
  );
}
