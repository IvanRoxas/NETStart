"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Check, X, RefreshCcw, Settings, Award, FileText, Sparkles, AlertTriangle } from 'lucide-react';
import { createAchievement, updateAchievement, deleteAchievement } from '../actions/achievements';
import ImageCropModal from '@/components/ImageCropModal';
import AdminToast from '@/components/AdminToast';

export default function AchievementClientWrapper({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(initialItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sorting and Category/Batch Filtering State
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'xp_high' | 'xp_low' | 'gears_high' | 'gears_low'>('name_asc');
  const [filterBatch, setFilterBatch] = useState<'all' | 'special' | 'modules' | 'custom'>('all');

  // Delete Confirmation Modal State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Crop Modal State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    iconUrl: '',
    xpReward: 100,
    gearsReward: 0,
    triggerCode: ''
  });

  // Process items (Search + Filter + Sort)
  let processedItems = items.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.triggerCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply Batch / Category Filtering
  if (filterBatch !== 'all') {
    processedItems = processedItems.filter(item => {
      const code = (item.triggerCode || '').toUpperCase();
      if (filterBatch === 'special') {
        return code.startsWith('B_') || code.includes('ACCOUNT') || code.includes('VERIFIED');
      }
      if (filterBatch === 'modules') {
        return code.includes('_M') || code.includes('MODULE') || code.includes('HTML') || code.includes('CSS') || code.includes('JS') || code.includes('GIT') || code.includes('DB') || code.includes('API');
      }
      if (filterBatch === 'custom') {
        const isSpecial = code.startsWith('B_') || code.includes('ACCOUNT') || code.includes('VERIFIED');
        const isModule = code.includes('_M') || code.includes('MODULE') || code.includes('HTML') || code.includes('CSS') || code.includes('JS') || code.includes('GIT') || code.includes('DB') || code.includes('API');
        return !isSpecial && !isModule;
      }
      return true;
    });
  }

  // Apply Sorting
  processedItems.sort((a, b) => {
    if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
    if (sortBy === 'xp_high') return b.xpReward - a.xpReward;
    if (sortBy === 'xp_low') return a.xpReward - b.xpReward;
    if (sortBy === 'gears_high') return (b.gearsReward || 0) - (a.gearsReward || 0);
    if (sortBy === 'gears_low') return (a.gearsReward || 0) - (b.gearsReward || 0);
    return 0;
  });

  const openModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        iconUrl: item.iconUrl,
        xpReward: item.xpReward,
        gearsReward: item.gearsReward || 0,
        triggerCode: item.triggerCode
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        iconUrl: '',
        xpReward: 100,
        gearsReward: 0,
        triggerCode: ''
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingItem) {
        await updateAchievement(editingItem.id, formData);
        setItems(items.map(i => i.id === editingItem.id ? { ...i, ...formData } : i));
        setToast({ message: "Achievement updated successfully.", type: "success" });
      } else {
        await createAchievement(formData);
        window.location.reload();
      }
      setModalOpen(false);
    } catch (err: any) {
      setToast({ message: err.message || "Failed to save achievement.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    const id = deleteConfirmId;
    setDeleteConfirmId(null);
    setDeletingId(id);
    try {
      await deleteAchievement(id);
      setItems(items.filter(i => i.id !== id));
      setToast({ message: "Achievement deleted successfully.", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "Failed to delete achievement.", type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 relative">
      {toast && <AdminToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between bg-[#1e0a2d] p-6 rounded-2xl border border-white/5 shadow-lg flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Achievement System</h2>
          <p className="text-sm text-gray-400">Configure global badges and XP rewards.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-white/10 rounded-xl bg-black/20 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#ff912d] transition-all text-xs"
              placeholder="Search achievements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter by Batch */}
          <select
            value={filterBatch}
            onChange={(e: any) => setFilterBatch(e.target.value)}
            className="bg-[#1e0a2d] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#ff912d] cursor-pointer"
          >
            <option value="all">All Batches</option>
            <option value="special">Academic Milestones</option>
            <option value="modules">Module Badges</option>
            <option value="custom">Custom / Other</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-[#1e0a2d] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#ff912d] cursor-pointer"
          >
            <option value="name_asc">Sort: Name (A-Z)</option>
            <option value="name_desc">Sort: Name (Z-A)</option>
            <option value="xp_high">Sort: XP (High to Low)</option>
            <option value="xp_low">Sort: XP (Low to High)</option>
            <option value="gears_high">Sort: Gears (High to Low)</option>
            <option value="gears_low">Sort: Gears (Low to High)</option>
          </select>

          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-[#ff912d] hover:bg-[#ff912d]/90 text-black font-extrabold rounded-xl transition-all shadow-lg text-xs cursor-pointer active:scale-95"
          >
            <Plus size={14} />
            Create Badge
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedItems.length === 0 ? (
          <div className="col-span-full bg-[#1e0a2d] border border-white/5 rounded-2xl p-12 text-center text-gray-500">
            No achievements found.
          </div>
        ) : processedItems.map((item) => (
          <div key={item.id} className="bg-[#1e0a2d] border border-white/5 hover:border-[#ff912d]/30 hover:shadow-[0_0_20px_rgba(255,145,45,0.1)] rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            {/* Background glowing gradient */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:from-indigo-500/20 transition-all duration-300" />

            <div className="flex gap-4">
              {/* Badge Icon */}
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border-2 border-white/10 flex items-center justify-center overflow-hidden p-1 group-hover:border-[#ff912d]/50 transition-colors">
                {item.iconUrl ? (
                  <img src={item.iconUrl} alt={item.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-[#ff912d] font-bold text-2xl">🏆</span>
                )}
              </div>

              {/* Text details */}
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <h3 className="text-base font-bold text-white truncate leading-snug">{item.name}</h3>
                <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-indigo-400">+{item.xpReward} XP</span>
                {item.gearsReward > 0 && (
                  <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                    <Settings size={12} /> +{item.gearsReward} Gears
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openModal(item)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-bold transition-all border border-blue-500/10 active:scale-95 cursor-pointer">
                  <Edit size={14} /> Edit
                </button>
                <button onClick={() => setDeleteConfirmId(item.id)} disabled={deletingId === item.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-all border border-red-500/10 active:scale-95 cursor-pointer disabled:opacity-50">
                  {deletingId === item.id ? <RefreshCcw size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#1e0a2d]/95 backdrop-blur-md border border-white/10 rounded-3xl p-8 max-w-md w-full relative shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/5"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6 pr-6">{editingItem ? 'Edit Achievement' : 'Create Achievement'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Badge Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Award size={18} />
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => {
                      const newName = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        name: newName,
                        triggerCode: editingItem ? prev.triggerCode : newName.toUpperCase().replace(/[^A-Z0-9]/g, '_')
                      }));
                    }}
                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#ff912d] focus:ring-1 focus:ring-[#ff912d] transition-all text-sm font-sans"
                    placeholder="e.g. Master Hacker"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
                <div className="relative">
                  <span className="absolute top-3.5 left-3.5 flex items-start pointer-events-none text-gray-500">
                    <FileText size={18} />
                  </span>
                  <textarea
                    required
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#ff912d] focus:ring-1 focus:ring-[#ff912d] resize-none h-24 transition-all text-sm leading-relaxed font-sans"
                    placeholder="How is this unlocked?"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">XP Reward</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                      <Sparkles size={16} />
                    </span>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.xpReward}
                      onChange={e => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 0 })}
                      className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#ff912d] focus:ring-1 focus:ring-[#ff912d] transition-all text-sm font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Gears Reward</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                      <Settings size={16} />
                    </span>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.gearsReward}
                      onChange={e => setFormData({ ...formData, gearsReward: parseInt(e.target.value) || 0 })}
                      className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#ff912d] focus:ring-1 focus:ring-[#ff912d] transition-all text-sm font-sans"
                    />
                  </div>
                </div>
              </div>

              <div>
                {/* Consolidated section: Flex row with preview left and button right */}
                <div className="flex items-center space-x-4 mt-2">
                  <div className="shrink-0">
                    {formData.iconUrl ? (
                      <img
                        src={formData.iconUrl}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-lg border border-gray-600 bg-black/20"
                      />
                    ) : (
                      <div className="w-24 h-24 flex items-center justify-center rounded-lg border border-gray-600 bg-black/40 text-gray-500">
                        <span className="text-3xl">🏆</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5">
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Badge Image</span>
                    <label className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors active:scale-95 shadow-md flex items-center gap-1.5 w-max">
                      Upload File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
                            
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const resultStr = ev.target?.result as string;
                              if (resultStr) {
                                if (isSvg) {
                                  setFormData(prev => ({ ...prev, iconUrl: resultStr }));
                                  setToast({ message: "SVG uploaded directly (vector quality preserved).", type: "success" });
                                } else {
                                  setCropImageSrc(resultStr);
                                  setCropModalOpen(true);
                                }
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 border-t border-white/5 pt-5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white/70 font-bold hover:text-white hover:bg-white/5 transition-colors text-sm cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#ff912d] hover:bg-[#ff912d]/90 text-black font-extrabold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-95 shadow-lg shadow-[#ff912d]/10"
                >
                  {loading ? <RefreshCcw size={18} className="animate-spin" /> : 'Save Achievement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        imageSrc={cropImageSrc}
        aspect={1}
        title="Crop Achievement Icon"
        onSave={(base64) => {
          setFormData({ ...formData, iconUrl: base64 });
          setCropModalOpen(false);
        }}
      />
      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#1e0a2d]/95 backdrop-blur-md border border-red-500/20 rounded-3xl p-8 max-w-sm w-full relative shadow-[0_0_50px_rgba(239,68,68,0.15)] text-center flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 text-red-500">
              <AlertTriangle size={32} className="animate-pulse" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Achievement?</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Are you sure you want to delete this achievement? This will remove it from all users who have unlocked it!
              </p>
            </div>

            <div className="flex gap-3 w-full mt-4">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white/70 font-bold hover:text-white hover:bg-white/5 transition-colors text-sm cursor-pointer active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-95 shadow-lg shadow-red-600/10"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
