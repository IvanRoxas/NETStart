import React from 'react';
import { prisma } from '@/lib/auth';
import { requireAdmin } from '@/app/admin/actions';
import { Activity } from 'lucide-react';
import { formatActionName, formatLogDetails } from '@/lib/formatters/logs';
import LogsFilter from './LogsFilter';

export default async function GlobalLogsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  await requireAdmin();
  const params = await searchParams;

  const actionFilter = typeof params.action === 'string' ? params.action : undefined;
  const roleFilter = typeof params.role === 'string' ? params.role : undefined;

  const where: any = {};
  if (actionFilter) where.action = actionFilter;
  if (roleFilter) where.actorRole = roleFilter;

  const logs = await prisma.systemLog.findMany({
    where,
    take: 100,
    orderBy: { createdAt: 'desc' }
  });

  const actorIds = [...new Set(logs.map(log => log.actorId))];
  const targetUserIds = [...new Set(logs.map(log => log.targetUserId).filter(Boolean) as string[])];

  const admins = await prisma.systemAdmin.findMany({ where: { id: { in: actorIds } } });
  const users = await prisma.user.findMany({ where: { id: { in: [...actorIds, ...targetUserIds] } } });

  const adminMap = Object.fromEntries(admins.map(a => [a.id, a.username]));
  const userMap = Object.fromEntries(users.map(u => [u.id, u.email]));

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 relative">
      <div className="flex items-center justify-between bg-[#1e0a2d] p-6 rounded-2xl border border-white/5 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-500/20 border-2 border-slate-500/50 flex items-center justify-center">
            <Activity className="text-slate-400" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Global System Logs</h2>
            <p className="text-sm text-gray-400">Viewing the most recent 100 system events.</p>
          </div>
        </div>
        <LogsFilter />
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
                    No logs found.
                  </td>
                </tr>
              ) : logs.map((log) => {
                const actorName = adminMap[log.actorId] || userMap[log.actorId] || log.actorId;
                const targetName = log.targetUserId ? (userMap[log.targetUserId] || log.targetUserId) : '-';
                
                return (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                      {actorName} <span className="text-xs text-gray-500 ml-1">({log.actorRole})</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-white flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        {formatActionName(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 truncate max-w-[200px]" title={targetName}>
                      {targetName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 w-full">
                      {formatLogDetails(log.action, log.details)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
