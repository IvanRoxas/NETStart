import React from 'react';
import { prisma } from '@/lib/auth';
import { requireSuperAdmin } from '@/app/admin/actions';
import { Activity } from 'lucide-react';
import { formatActionName, formatLogDetails } from '@/lib/formatters/logs';
import LogsFilter from './LogsFilter';

export default async function GlobalLogsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  await requireSuperAdmin();
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

  // API Request Usage & Telemetry Data (FR-11 & Sprint 3)
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);
  const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const timeoutSeconds = parseInt(process.env.GEMINI_TIMEOUT_SECONDS || "10", 10);
  const maxRetries = parseInt(process.env.GEMINI_MAX_RETRIES || "5", 10);

  const [totalInterventions, fallbackInterventions, totalAptitudeDiagnosed, fallbackAptitude] = await Promise.all([
    prisma.interventionLog.count(),
    prisma.interventionLog.count({ where: { fallbackUsed: true } }),
    prisma.user.count({ where: { hasTakenAptitudeTest: true } }),
    prisma.user.count({ where: { hasTakenAptitudeTest: true, isFallback: true } })
  ]);

  const liveAiInterventions = Math.max(0, totalInterventions - fallbackInterventions);
  const liveAiAptitude = Math.max(0, totalAptitudeDiagnosed - fallbackAptitude);
  const totalAiRequests = totalInterventions + totalAptitudeDiagnosed;
  const totalFallbackRequests = fallbackInterventions + fallbackAptitude;
  const totalLiveGeminiRequests = liveAiInterventions + liveAiAptitude;
  const fallbackRate = totalAiRequests > 0 
    ? Math.round((totalFallbackRequests / totalAiRequests) * 100) 
    : 0;

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 relative">
      <div className="flex items-center justify-between bg-[#1e0a2d] p-6 rounded-2xl border border-white/5 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-500/20 border-2 border-slate-500/50 flex items-center justify-center">
            <Activity className="text-slate-400" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Global System Logs & Telemetry</h2>
            <p className="text-sm text-gray-400">Audit trail, activity stream, and external API request usage monitoring.</p>
          </div>
        </div>
        <LogsFilter />
      </div>

      {/* API Telemetry & Quota Monitor (FR-11 & Sprint 3) */}
      <div className="bg-[#1e0a2d] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <span className={`w-3 h-3 rounded-full ${geminiConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <h3 className="text-base font-bold text-white">External API Telemetry & Quota Monitor</h3>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono font-semibold">
              FR-11 / Sprint 3
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Model: <strong className="text-white font-mono">{geminiModel}</strong></span>
            <span>•</span>
            <span>Guard: <strong className="text-white font-mono">{timeoutSeconds}s timeout / {maxRetries} retries</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total API Calls</span>
            <div className="text-2xl font-black text-white">{totalAiRequests}</div>
            <span className="text-[11px] text-gray-500 mt-1">Diagnostics & Code Interventions</span>
          </div>

          <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Live Gemini AI</span>
            <div className="text-2xl font-black text-purple-400">{totalLiveGeminiRequests}</div>
            <span className="text-[11px] text-gray-500 mt-1">Direct LLM Context Generations</span>
          </div>

          <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">YouTube Fallbacks</span>
            <div className="text-2xl font-black text-amber-400">{totalFallbackRequests}</div>
            <span className="text-[11px] text-gray-500 mt-1">Automated Video Hint Failovers</span>
          </div>

          <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Fallback Failover Rate</span>
            <div className="text-2xl font-black text-emerald-400">{fallbackRate}%</div>
            <span className="text-[11px] text-gray-500 mt-1">
              {geminiConfigured ? "API Health Nominal" : "Fallback Default"}
            </span>
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
