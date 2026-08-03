"use client";

import { useRouter, useSearchParams } from 'next/navigation';

export default function LogsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const action = searchParams.get('action') || '';
  const role = searchParams.get('role') || '';

  const updateFilters = (newAction: string, newRole: string) => {
    const params = new URLSearchParams();
    if (newAction) params.set('action', newAction);
    if (newRole) params.set('role', newRole);
    router.push(`/admin/logs?${params.toString()}`);
  };

  return (
    <div className="flex gap-4">
      <select 
        value={role} 
        onChange={(e) => updateFilters(action, e.target.value)}
        className="bg-black/20 border border-white/10 rounded-xl pl-4 pr-10 py-2 text-white text-sm focus:outline-none focus:border-slate-500 cursor-pointer appearance-none"
        style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
      >
        <option value="" className="bg-[#1e0a2d]">All Roles</option>
        <option value="ADMIN" className="bg-[#1e0a2d]">Admins</option>
        <option value="STUDENT" className="bg-[#1e0a2d]">Students</option>
      </select>

      <select 
        value={action} 
        onChange={(e) => updateFilters(e.target.value, role)}
        className="bg-black/20 border border-white/10 rounded-xl pl-4 pr-10 py-2 text-white text-sm focus:outline-none focus:border-slate-500 cursor-pointer appearance-none"
        style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
      >
        <option value="" className="bg-[#1e0a2d]">All Actions</option>
        <option value="BANNED_USER" className="bg-[#1e0a2d]">Banned User</option>
        <option value="UNBANNED_USER" className="bg-[#1e0a2d]">Unbanned User</option>
        <option value="VERIFIED_USER" className="bg-[#1e0a2d]">Verified User (Admin)</option>
        <option value="EDITED_GAMIFICATION" className="bg-[#1e0a2d]">Edited Gamification</option>
        <option value="DELETED_USER" className="bg-[#1e0a2d]">Deleted User</option>
        <option value="PURCHASED_ITEM" className="bg-[#1e0a2d]">Purchased Item</option>
        <option value="VERIFIED_EMAIL" className="bg-[#1e0a2d]">Verified Email (Self)</option>
      </select>
    </div>
  );
}
