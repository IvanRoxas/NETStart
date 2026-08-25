import React from 'react';
import { prisma } from '@/lib/auth';
import { requireAdmin } from '@/app/admin/actions';
import { History, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function UserLogsPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  await requireAdmin();
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id;

  if (!id) {
    return <div className="text-white p-8">Invalid or missing User ID.</div>;
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { email: true, displayName: true }
  });

  if (!user) {
    return <div className="text-white p-8">User not found.</div>;
  }

  const logs = await prisma.systemLog.findMany({
    where: {
      OR: [
        { targetUserId: id },
        { actorId: id }
      ]
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 relative">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Users</span>
        </Link>
      </div>

      <div className="flex items-center justify-between bg-[#1e0a2d] p-6 rounded-2xl border border-white/5 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-500/20 border-2 border-slate-500/50 flex items-center justify-center">
            <History className="text-slate-400" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">User Audit Logs</h2>
            <p className="text-sm text-gray-400">Viewing events involving <strong className="text-white">{user.email}</strong></p>
          </div>
        </div>
      </div>

      <div className="bg-[#1e0a2d] border border-white/5 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-white/5">
            <thead className="bg-black/20">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Timestamp</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Actor</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Target</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-transparent">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No logs found for this user.
                  </td>
                </tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                    {log.actorId === id ? 'This User' : log.actorId} <span className="text-xs text-gray-500 ml-1">({log.actorRole})</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md text-xs font-bold font-mono">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {log.targetUserId === id ? 'This User' : log.targetUserId || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono text-xs max-w-xs truncate" title={log.details}>
                    {log.details}
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
