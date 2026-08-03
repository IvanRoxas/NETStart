"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Check, X, RefreshCcw, AlertTriangle } from 'lucide-react';
import { createShopItem, updateShopItem, deleteShopItem } from '../actions/shop';

import AdminToast from '@/components/AdminToast';

export default function ShopClientWrapper({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(initialItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sorting and Filtering State
  const [sortBy, setSortBy] = useState<'title_asc' | 'title_desc' | 'price_high' | 'price_low'>('title_asc');
  const [filterType, setFilterType] = useState<'all' | 'PROFILE_BACKGROUND' | 'PROFILE_TITLE' | 'AVATAR_HAT' | 'AVATAR_OUTFIT'>('all');

  // Delete Confirmation Modal State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'COSMETIC',
    category: 'PROFILE',
    subCategory: 'BACKGROUND',
    price: 0,
    imageUrl: ''
  });

  // Process items (Search + Filters + Sort)
  let processedItems = items.filter(i => 
    i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter Type (Merged Category + Sub-category)
  if (filterType !== 'all') {
    const [cat, sub] = filterType.split('_');
    processedItems = processedItems.filter(i => i.category === cat && i.subCategory === sub);
  }

  // Sort
  processedItems.sort((a, b) => {
    if (sortBy === 'title_asc') return a.title.localeCompare(b.title);
    if (sortBy === 'title_desc') return b.title.localeCompare(a.title);
    if (sortBy === 'price_high') return b.price - a.price;
    if (sortBy === 'price_low') return a.price - b.price;
    return 0;
  });

  const openModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        type: item.type,
        category: item.category,
        subCategory: item.subCategory,
        price: item.price,
        imageUrl: item.imageUrl
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        type: 'COSMETIC',
        category: 'PROFILE',
        subCategory: 'BACKGROUND',
        price: 0,
        imageUrl: ''
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingItem) {
        await updateShopItem(editingItem.id, formData);
        setItems(items.map(i => i.id === editingItem.id ? { ...i, ...formData } : i));
        setToast({ message: "Item updated successfully.", type: "success" });
      } else {
        await createShopItem(formData);
        // Optimistic refresh would be better, but we can just reload the page or add mock for now.
        // For accurate IDs, window.location.reload() or revalidatePath will handle it.
        window.location.reload();
      }
      setModalOpen(false);
    } catch (err: any) {
      setToast({ message: err.message || "Failed to save item.", type: "error" });
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
      await deleteShopItem(id);
      setItems(items.filter(i => i.id !== id));
      setToast({ message: "Item deleted successfully.", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "Failed to delete item.", type: "error" });
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
          <h2 className="text-2xl font-bold text-white mb-1">Shop Configuration</h2>
          <p className="text-sm text-gray-400">Manage store items, pricing, and assets.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative w-60">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-white/10 rounded-xl bg-black/20 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#ff912d] transition-all text-xs"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Category & Sub-category */}
          <select 
            value={filterType} 
            onChange={(e: any) => setFilterType(e.target.value)}
            className="bg-[#1e0a2d] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#ff912d] cursor-pointer"
          >
            <option value="all">All Items</option>
            <option value="PROFILE_BACKGROUND">Profile Backgrounds</option>
            <option value="PROFILE_TITLE">Profile Titles</option>
            <option value="AVATAR_HAT">Avatar Hats</option>
            <option value="AVATAR_OUTFIT">Avatar Outfits</option>
          </select>

          {/* Sort By */}
          <select 
            value={sortBy} 
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-[#1e0a2d] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#ff912d] cursor-pointer"
          >
            <option value="title_asc">Sort: Title (A-Z)</option>
            <option value="title_desc">Sort: Title (Z-A)</option>
            <option value="price_high">Sort: Price (High to Low)</option>
            <option value="price_low">Sort: Price (Low to High)</option>
          </select>

          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-[#ff912d] hover:bg-[#ff912d]/90 text-black font-extrabold rounded-xl transition-all shadow-lg text-xs cursor-pointer active:scale-95"
          >
            <Plus size={14} />
            Add Item
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1e0a2d] border border-white/5 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-white/5">
            <thead className="bg-black/20">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Preview</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Details</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Price</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {processedItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No items found.</td>
                </tr>
              ) : processedItems.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img src={item.imageUrl} alt={item.title} className="w-12 h-12 object-cover rounded-lg border border-white/10 bg-black/50" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-white block">{item.title}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md font-medium border border-indigo-500/20">{item.category} / {item.subCategory}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-[#ff912d]">{item.price} Gears</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openModal(item)} className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => setDeleteConfirmId(item.id)} disabled={deletingId === item.id} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50">
                        {deletingId === item.id ? <RefreshCcw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1e0a2d] border border-white/10 rounded-3xl p-8 max-w-lg w-full relative shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">{editingItem ? 'Edit Shop Item' : 'Create Shop Item'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1">Title</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff912d]" placeholder="e.g. Neon Hat" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-1">Category</label>
                  <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff912d]">
                    <option value="PROFILE">PROFILE</option>
                    <option value="AVATAR">AVATAR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-1">Sub-Category</label>
                  <select required value={formData.subCategory} onChange={e => setFormData({...formData, subCategory: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff912d]">
                    <option value="BACKGROUND">BACKGROUND</option>
                    <option value="TITLE">TITLE</option>
                    <option value="HAT">HAT</option>
                    <option value="OUTFIT">OUTFIT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-1">Type</label>
                  <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff912d]">
                    <option value="COSMETIC">COSMETIC</option>
                    <option value="UTILITY">UTILITY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-1">Price (Gears)</label>
                  <input type="number" min="0" required value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff912d]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1">Image URL / Upload Image</label>
                <div className="flex gap-2">
                  <input type="text" required value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff912d]" placeholder="/shop/neon-hat.png or base64" />
                  <label className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl cursor-pointer transition-colors flex items-center justify-center shrink-0">
                    Upload
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) setFormData({...formData, imageUrl: ev.target.result as string});
                        };
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }} />
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 py-3 px-4 rounded-xl bg-[#ff912d] hover:bg-[#ff912d]/90 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <RefreshCcw size={20} className="animate-spin" /> : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#1e0a2d]/95 backdrop-blur-md border border-red-500/20 rounded-3xl p-8 max-w-sm w-full relative shadow-[0_0_50px_rgba(239,68,68,0.15)] text-center flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 text-red-500">
              <AlertTriangle size={32} className="animate-pulse" />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Store Item?</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Are you sure you want to delete this store item? This action is permanent and cannot be undone.
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
