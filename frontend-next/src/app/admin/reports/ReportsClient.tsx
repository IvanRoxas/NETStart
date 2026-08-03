"use client";

import React, { useState } from 'react';
import { Search, Eye, X, CheckCircle, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';

type Report = {
  id: string;
  userId: string;
  type: string;
  description: string;
  attachments: string[];
  status: string;
  createdAt: Date;
  user: {
    name: string | null;
    email: string | null;
  };
};

export default function ReportsClient({ initialReports }: { initialReports: Report[] }) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');

  const filteredReports = reports.filter(r => {
    if (filter !== 'ALL' && r.status !== filter) return false;
    return (r.user.name || '').toLowerCase().includes(search.toLowerCase()) || 
           r.type.toLowerCase().includes(search.toLowerCase()) ||
           r.description.toLowerCase().includes(search.toLowerCase());
  });

  const handleResolve = async (id: string) => {
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RESOLVED' })
      });
      if (res.ok) {
        setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'RESOLVED' } : r));
        if (selectedReport?.id === id) {
          setSelectedReport(prev => prev ? { ...prev, status: 'RESOLVED' } : null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-white mb-2">User Reports</h2>
          <p className="text-white/60">Review and resolve issues reported by users.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-black/40 border border-[#ff912d]/30 rounded-xl p-1">
            {['ALL', 'PENDING', 'RESOLVED'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-[#ff912d] text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                {f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 bg-black/40 border border-[#ff912d]/30 text-white pl-10 pr-4 py-2 rounded-xl outline-none focus:border-[#ff912d] transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="bg-black/20 border border-[#ff912d]/10 rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#ff912d]/10 border-b border-[#ff912d]/20">
                <th className="p-4 text-white/80 font-semibold text-sm">User</th>
                <th className="p-4 text-white/80 font-semibold text-sm">Type</th>
                <th className="p-4 text-white/80 font-semibold text-sm">Preview</th>
                <th className="p-4 text-white/80 font-semibold text-sm">Attachments</th>
                <th className="p-4 text-white/80 font-semibold text-sm">Status</th>
                <th className="p-4 text-white/80 font-semibold text-sm">Date</th>
                <th className="p-4 text-white/80 font-semibold text-sm text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="text-white font-medium">{report.user.name || 'Unknown User'}</div>
                      <div className="text-white/50 text-xs">{report.user.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded bg-white/10 text-white text-xs uppercase tracking-wider font-bold">
                        {report.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-white/70 text-sm max-w-[200px] truncate">
                      {report.description}
                    </td>
                    <td className="p-4 text-white/70">
                      <div className="flex items-center gap-1">
                        <ImageIcon size={14} className={report.attachments.length > 0 ? 'text-[#ff912d]' : 'text-white/20'} />
                        <span className="text-xs font-bold">{report.attachments.length}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${report.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="p-4 text-white/60 text-sm">
                      {format(new Date(report.createdAt), 'MMM d, yyyy h:mm a')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors tooltip"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {report.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleResolve(report.id)}
                            className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors tooltip"
                            title="Mark Resolved"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-white/40">
                    No reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#1e0a2d] border border-white/10 rounded-2xl max-w-3xl w-full flex flex-col my-auto relative">
            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#1e0a2d] rounded-t-2xl z-10">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  Report Details
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${selectedReport.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                    {selectedReport.status}
                  </span>
                </h3>
                <p className="text-white/50 text-sm mt-1">Submitted by {selectedReport.user.name || 'Unknown User'} on {format(new Date(selectedReport.createdAt), 'MMM d, yyyy h:mm a')}</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-2 text-white/50 hover:text-white transition-colors bg-white/5 rounded-full hover:bg-white/10">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-6 overflow-y-auto max-h-[70vh] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full">
              <div>
                <h4 className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-2">Category</h4>
                <div className="inline-block px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white font-medium">
                  {selectedReport.type.replace('_', ' ').toUpperCase()}
                </div>
              </div>

              <div>
                <h4 className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-2">Description</h4>
                <div className="p-4 bg-[#130927] rounded-lg border border-gray-700 text-gray-300 min-h-[100px] whitespace-pre-wrap">
                  {selectedReport.description}
                </div>
              </div>

              {selectedReport.attachments.length > 0 && (
                <div>
                  <h4 className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-3">
                    Attachments ({selectedReport.attachments.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedReport.attachments.map((src, idx) => (
                      <div key={idx} className="relative rounded-md overflow-hidden bg-black/40 group">
                        <button type="button" onClick={() => setSelectedImage(src)} className="block w-full text-left">
                          <img 
                            src={src} 
                            alt={`Attachment ${idx + 1}`} 
                            className="w-full h-48 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10 flex justify-end gap-3 sticky bottom-0 bg-[#1e0a2d] rounded-b-2xl z-10">
              <button 
                onClick={() => setSelectedReport(null)}
                className="px-6 py-2 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors font-medium"
              >
                Close
              </button>
              {selectedReport.status !== 'RESOLVED' && (
                <button 
                  onClick={() => handleResolve(selectedReport.id)}
                  className="px-6 py-2 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors font-bold flex items-center gap-2"
                >
                  <CheckCircle size={18} />
                  Mark as Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-8" onClick={() => setSelectedImage(null)}>
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10 shadow-lg border border-white/10"
          >
            <X size={24} />
          </button>
          <img 
            src={selectedImage} 
            alt="Preview" 
            className="object-contain max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
