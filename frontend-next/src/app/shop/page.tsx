"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Settings, Image as ImageIcon, Smile, Shirt, Zap, Brush, Footprints, CheckCircle, X, Sparkles, Tag, ShieldCheck, Search } from 'lucide-react';
import TopHeader from '@/components/TopHeader';
import { getShopItems, getUserInventory, purchaseItem, claimVerificationReward } from '@/app/actions/shop';
import VerifyModal from '@/components/VerifyModal';
import DailyTaskTracker from '@/components/DailyTaskTracker';

type ShopItem = {
  id: string;
  title: string;
  type: string;
  category: string;
  subCategory: string;
  price: number;
  imageUrl: string;
  tag?: string;
  description?: string;
};

export default function ShopPage() {
  const { data: session } = useSession();
  const [activeCategory, setActiveCategory] = useState('Background');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'owned'>('all');
  const [gears, setGears] = useState(0);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [inventoryIds, setInventoryIds] = useState<Set<string>>(new Set());
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showVerifyBanner, setShowVerifyBanner] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  
  // Custom Modal & Toast States
  const [modalItem, setModalItem] = useState<ShopItem | null>(null);
  const [celebrationItem, setCelebrationItem] = useState<ShopItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);

  const showToast = (message: string, type: 'error' | 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (session?.user && !(session.user as any).isVerified) {
      setShowVerifyBanner(true);
    }
  }, [session]);

  const categories = [
    {
      title: 'PROFILE',
      items: [
        { name: 'Background', label: 'Backgrounds', icon: <ImageIcon size={18} /> },
        { name: 'Icons', label: 'Profile Icons', icon: <Smile size={18} /> }
      ]
    },
    {
      title: 'AVATAR',
      items: [
        { name: 'Hats', label: 'Hats', icon: <Shirt size={18} /> },
        { name: 'Accessories', label: 'Accessories', icon: <Zap size={18} /> },
        { name: 'Outfits', label: 'Outfits', icon: <Footprints size={18} /> },
        { name: 'Paints', label: 'Paints', icon: <Brush size={18} /> },
        { name: 'Shoes', label: 'Shoes', icon: <Footprints size={18} /> }
      ]
    }
  ];

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [shopRes, invRes] = await Promise.all([
          getShopItems(),
          getUserInventory()
        ]);

        if (shopRes.success) {
          setItems(shopRes.items || []);
        }
        if (invRes.success) {
          setGears(invRes.gears || 0);
          const ownedIds = new Set((invRes.inventory || []).map((i: any) => i.shopItemId));
          setInventoryIds(ownedIds);
        }
        
        const rewardRes = await claimVerificationReward();
        if (rewardRes && rewardRes.claimed) {
          setRewardAmount(rewardRes.amount || 0);
          setRewardModalOpen(true);
          setGears(prev => prev + (rewardRes.amount || 0));
        }
      } catch (e) {
        console.error("Error loading shop data:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [(session?.user as any)?.id]);

  const handleOpenBuyModal = (item: ShopItem) => {
    setModalItem(item);
  };

  const handleConfirmPurchase = async (item: ShopItem) => {
    if (inventoryIds.has(item.id)) {
      showToast("You already own this item!", "error");
      return;
    }

    if (gears < item.price) {
      showToast(`Not enough gears! You need ${(item.price - gears).toLocaleString()} more gears.`, "error");
      return;
    }

    setLoadingItems(prev => new Set(prev).add(item.id));
    const res = await purchaseItem(item.id);
    
    if (res.success) {
      setGears(prev => prev - item.price);
      setInventoryIds(prev => new Set(prev).add(item.id));
      setModalItem(null); // close the buy modal
      setCelebrationItem(item); // trigger the celebration vignette & cartoony rays popup!
    } else {
      showToast((res as any).error || "Failed to purchase item", "error");
    }
    
    setLoadingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(item.id);
      return newSet;
    });
  };

  // Filter items for current category and search query
  const filteredCategoryItems = items.filter(item => {
    if (item.subCategory !== activeCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.tag && item.tag.toLowerCase().includes(q))
    );
  });

  const availableItems = filteredCategoryItems.filter(item => !inventoryIds.has(item.id));
  const ownedItems = filteredCategoryItems.filter(item => inventoryIds.has(item.id));

  const showAvailable = statusFilter === 'all' || statusFilter === 'available';
  const showOwned = statusFilter === 'all' || statusFilter === 'owned';

  const hasVisibleItems = (showAvailable && availableItems.length > 0) || (showOwned && ownedItems.length > 0);

  const getItemCategoryTag = (item: ShopItem) => {
    if (item.subCategory === 'Background') return 'Background';
    if (item.subCategory === 'Icons') return 'Profile Icon';
    return item.subCategory || item.type;
  };

  return (
    <div className="flex h-full text-white overflow-hidden font-sans bg-transparent">
      <DailyTaskTracker taskIds={["task-explore-1", "task-explore-3"]} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopHeader title="Rewards Shop" />
        
        <div className="flex flex-1 overflow-hidden relative">
          
          {/* Left Sidebar (Shop Navigation) */}
          <div className="w-64 bg-[#140624]/90 backdrop-blur-md border-r border-white/10 flex flex-col z-10 hidden md:flex">
            {/* Gears Balance */}
            <div className="p-6 border-b border-white/10 bg-gradient-to-b from-[#200938] to-transparent">
              <p className="text-amber-400/80 text-[11px] font-bold mb-2 tracking-widest uppercase flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#ff912d]" /> Your Balance
              </p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#ff912d]/20 flex items-center justify-center border border-[#ff912d]/60 shadow-[0_0_15px_rgba(255,145,45,0.25)]">
                  <Settings className="text-[#ff912d] animate-[spin_10s_linear_infinite]" size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-amber-300 font-display tracking-wide">{gears.toLocaleString()}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">GEARS</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
              {categories.map((group, idx) => (
                <div key={idx}>
                  <h3 className="px-3 text-gray-400/70 text-[11px] font-bold mb-2 tracking-widest uppercase">{group.title}</h3>
                  <ul className="space-y-1">
                    {group.items.map((cat, catIdx) => {
                      const isActive = activeCategory === cat.name;
                      return (
                        <li key={catIdx}>
                          <button
                            onClick={() => {
                              setActiveCategory(cat.name);
                              setSearchQuery('');
                              setStatusFilter('all');
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-semibold text-sm ${
                              isActive 
                                ? 'bg-gradient-to-r from-[#ff912d]/20 to-[#ff912d]/5 border border-[#ff912d]/50 text-white shadow-lg' 
                                : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                            }`}
                          >
                            <span className={isActive ? 'text-[#ff912d]' : 'text-gray-400'}>
                              {cat.icon}
                            </span>
                            <span>{cat.label || cat.name}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 overflow-y-auto relative bg-gradient-to-br from-[#0c0316] via-[#120521] to-[#07010e]">
            {/* Background space ambient glow simulation */}
            <div className="absolute inset-0 opacity-40 pointer-events-none" style={{
              backgroundImage: 'radial-gradient(circle at 40% 10%, #4a157a 0%, transparent 60%), radial-gradient(circle at 80% 80%, #ff912d18 0%, transparent 50%)',
            }}></div>
            
            <div className="relative z-10 p-6 md:p-8 max-w-7xl mx-auto">
              
              {/* Header Title & Balance */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight flex items-center gap-3">
                    {activeCategory === 'Background' ? 'Space Backgrounds' : activeCategory === 'Icons' ? 'Profile Icons' : activeCategory}
                    <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-300 font-semibold border border-white/10">
                      {filteredCategoryItems.length} items
                    </span>
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">Explore space-themed items and custom rewards for your collection.</p>
                </div>

                {/* Mobile Balance Chip */}
                <div className="md:hidden flex items-center gap-2 bg-[#1a082c] border border-[#ff912d]/40 px-4 py-2 rounded-xl self-start">
                  <Settings size={16} className="text-[#ff912d]" />
                  <span className="font-bold text-amber-300">{gears.toLocaleString()} Gears</span>
                </div>
              </div>

              {/* Search Engine & Ownership Filter Controls Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
                {/* Search Input Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${activeCategory === 'Background' ? 'backgrounds' : 'profile icons'}...`}
                    className="w-full bg-[#18072c]/90 border border-white/15 focus:border-[#ff912d] focus:outline-none rounded-xl py-2.5 pl-11 pr-10 text-sm text-white placeholder-gray-400 shadow-inner transition-colors"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 rounded-full"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* Ownership Filter Button Tabs */}
                <div className="flex items-center gap-1.5 bg-[#18072c]/90 p-1 rounded-xl border border-white/15 self-start sm:self-auto">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      statusFilter === 'all'
                        ? 'bg-[#ff912d] text-[#140624] shadow-md'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    All ({filteredCategoryItems.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('available')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      statusFilter === 'available'
                        ? 'bg-[#ff912d] text-[#140624] shadow-md'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Available for Purchase ({availableItems.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('owned')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      statusFilter === 'owned'
                        ? 'bg-[#ff912d] text-[#140624] shadow-md'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Owned ({ownedItems.length})
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="flex flex-col items-center justify-center h-72 gap-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff912d]"></div>
                  <span className="text-sm font-semibold text-gray-400">Loading shop inventory...</span>
                </div>
              ) : !hasVisibleItems ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md p-8 text-center">
                  <Search size={44} className="mb-3 opacity-40 text-[#ff912d]" />
                  <p className="text-lg font-bold text-white">
                    {searchQuery 
                      ? `No items found matching "${searchQuery}"`
                      : statusFilter === 'owned' 
                        ? 'No owned items in this category yet' 
                        : statusFilter === 'available' 
                          ? 'You own all items in this section!' 
                          : 'No items found in this section'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {searchQuery 
                      ? "Try searching for a different keyword or adjusting your filter."
                      : statusFilter === 'owned' 
                        ? 'Items you purchase will show up here.' 
                        : 'Check back later as new supplies arrive.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-12">
                  
                  {/* ======================================================== */}
                  {/* AVAILABLE ITEMS SECTION                                  */}
                  {/* ======================================================== */}
                  {showAvailable && availableItems.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2.5 mb-6">
                        <Sparkles size={20} className="text-[#ff912d]" />
                        <h2 className="text-2xl font-display font-extrabold text-white">Available for Purchase</h2>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ff912d]/20 text-amber-300 font-bold border border-[#ff912d]/40">
                          {availableItems.length}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {availableItems.map(item => {
                          const isProcessing = loadingItems.has(item.id);
                          const isAvatar = item.subCategory === 'Icons';
                          const categoryTag = getItemCategoryTag(item);
                          
                          return (
                            <div 
                              key={item.id} 
                              onClick={() => handleOpenBuyModal(item)}
                              className="group relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#160728]/80 backdrop-blur-sm flex flex-col transition-all duration-300 hover:scale-[1.02] hover:border-[#ff912d]/60 hover:shadow-[0_10px_30px_rgba(255,145,45,0.15)] cursor-pointer"
                            >
                              {/* Tag Badge (Category Name) */}
                              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[11px] font-bold text-amber-300 shadow-md">
                                <Tag size={11} className="text-[#ff912d]" />
                                <span>{categoryTag}</span>
                              </div>

                              {/* Item Image Container */}
                              <div className={`relative bg-gradient-to-b from-[#1c0a34] to-[#120521] overflow-hidden flex items-center justify-center p-4 ${
                                isAvatar ? 'h-52' : 'h-48'
                              }`}>
                                {isAvatar ? (
                                  <div className="w-28 h-28 rounded-2xl bg-black/40 border-2 border-white/20 p-2 flex items-center justify-center shadow-inner group-hover:scale-105 group-hover:border-[#ff912d] transition-all duration-300">
                                    <img 
                                      src={item.imageUrl} 
                                      alt={item.title}
                                      className="w-full h-full object-contain rounded-xl"
                                    />
                                  </div>
                                ) : (
                                  <img 
                                    src={item.imageUrl} 
                                    alt={item.title}
                                    className="w-full h-full object-cover rounded-xl shadow-inner group-hover:scale-105 transition-transform duration-500"
                                  />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#160728] via-transparent to-transparent opacity-60"></div>
                              </div>
                              
                              {/* Item Info Card Body */}
                              <div className="p-4 flex flex-col flex-1 bg-gradient-to-b from-[#18082c] to-[#110420] border-t border-white/5">
                                <h3 className="font-display font-bold text-white text-base leading-snug group-hover:text-amber-300 transition-colors line-clamp-1">
                                  {item.title}
                                </h3>
                                <p className="text-gray-400 text-xs mt-1 line-clamp-2 leading-relaxed flex-1">
                                  {item.description || "A special space item for your journey!"}
                                </p>
                                
                                {/* Price & Buy Action */}
                                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                                    <Settings size={15} className="text-[#ff912d]" />
                                    <span className="font-black text-sm text-amber-300 font-display">{item.price.toLocaleString()}</span>
                                  </div>

                                  <button 
                                    disabled={isProcessing}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenBuyModal(item);
                                    }}
                                    className="flex items-center gap-1.5 py-1.5 px-4 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 bg-[#ff912d] hover:bg-[#ffa34d] text-[#1a082c] font-black shadow-[0_0_12px_rgba(255,145,45,0.3)]"
                                  >
                                    {isProcessing ? (
                                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-[#1a082c]/40 border-t-[#1a082c]"></div>
                                    ) : (
                                      <span>Buy Item</span>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ======================================================== */}
                  {/* OWNED ITEMS SECTION (Omit Buy/Inspect Buttons)           */}
                  {/* ======================================================== */}
                  {showOwned && ownedItems.length > 0 && (
                    <div className={showAvailable && availableItems.length > 0 ? "pt-8 border-t border-white/10" : ""}>
                      <div className="flex items-center gap-2.5 mb-6">
                        <CheckCircle size={20} className="text-emerald-400" />
                        <h2 className="text-2xl font-display font-extrabold text-white">Owned Items</h2>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 font-bold border border-emerald-500/40">
                          {ownedItems.length}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {ownedItems.map(item => {
                          const isAvatar = item.subCategory === 'Icons';
                          const categoryTag = getItemCategoryTag(item);
                          
                          return (
                            <div 
                              key={item.id} 
                              onClick={() => handleOpenBuyModal(item)}
                              className="group relative rounded-2xl overflow-hidden shadow-xl border border-emerald-500/30 bg-[#120a22]/90 backdrop-blur-sm flex flex-col transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/60 hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)] cursor-pointer"
                            >
                              {/* Tag Badge (Category Name) */}
                              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[11px] font-bold text-amber-300 shadow-md">
                                <Tag size={11} className="text-[#ff912d]" />
                                <span>{categoryTag}</span>
                              </div>

                              {/* Owned Status Pill */}
                              <div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/90 backdrop-blur-md border border-emerald-500/60 text-[11px] font-bold text-emerald-400 shadow-md">
                                <CheckCircle size={12} />
                                <span>Owned</span>
                              </div>

                              {/* Item Image Container */}
                              <div className={`relative bg-gradient-to-b from-[#180b2a] to-[#0f041c] overflow-hidden flex items-center justify-center p-4 ${
                                isAvatar ? 'h-52' : 'h-48'
                              }`}>
                                {isAvatar ? (
                                  <div className="w-28 h-28 rounded-2xl bg-black/40 border-2 border-emerald-500/30 p-2 flex items-center justify-center shadow-inner group-hover:scale-105 group-hover:border-emerald-400 transition-all duration-300">
                                    <img 
                                      src={item.imageUrl} 
                                      alt={item.title} 
                                      className="w-full h-full object-contain rounded-xl"
                                    />
                                  </div>
                                ) : (
                                  <img 
                                    src={item.imageUrl} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover rounded-xl shadow-inner group-hover:scale-105 transition-transform duration-500"
                                  />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#120a22] via-transparent to-transparent opacity-60"></div>
                              </div>
                              
                              {/* Item Info Card Body (NO BUTTONS OMITTED AS REQUESTED) */}
                              <div className="p-4 flex flex-col flex-1 bg-gradient-to-b from-[#140826] to-[#0d0318] border-t border-emerald-500/10">
                                <h3 className="font-display font-bold text-white text-base leading-snug group-hover:text-emerald-300 transition-colors line-clamp-1">
                                  {item.title}
                                </h3>
                                <p className="text-gray-400 text-xs mt-1 line-clamp-2 leading-relaxed flex-1">
                                  {item.description || "A special space item in your collection!"}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. "Buy Item" / "Item Preview" Modal                     */}
      {/* ======================================================== */}
      {modalItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 sm:p-6">
          <div className="bg-[#18072c] border-2 border-[#ff912d]/50 rounded-3xl p-5 md:p-6 max-w-xl w-full shadow-[0_0_50px_rgba(255,145,45,0.25)] flex flex-col gap-4 relative overflow-hidden max-h-[92vh] overflow-y-auto">
            
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#ff912d]/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#9d4edd]/15 rounded-full blur-3xl pointer-events-none"></div>

            {/* Modal Header */}
            <div className="flex justify-between items-center relative z-10 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  inventoryIds.has(modalItem.id) 
                    ? 'bg-purple-900/30 border border-purple-500/40 text-purple-300'
                    : 'bg-[#ff912d]/20 border border-[#ff912d]/40 text-[#ff912d]'
                }`}>
                  <Sparkles size={16} />
                </div>
                <h3 className="text-lg font-display font-extrabold text-white tracking-wide">
                  {inventoryIds.has(modalItem.id) ? 'Item Preview' : 'Buy Item'}
                </h3>
              </div>
              <button 
                onClick={() => setModalItem(null)} 
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex flex-col gap-3 relative z-10">
              
              {/* Item Showcase Section */}
              {modalItem.subCategory === 'Icons' ? (
                /* Profile Icon: Horizontal side-by-side layout (Icon on Left, Tag/Title/Desc on Right) */
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-gradient-to-b from-[#11041f] to-[#0a0214] border border-white/10 shadow-inner">
                  {/* Left: Profile Image Box */}
                  <div className="w-32 h-32 md:w-36 md:h-36 flex-shrink-0 rounded-2xl overflow-hidden flex items-center justify-center bg-black/60 border border-white/15 p-2 shadow-2xl">
                    <img 
                      src={modalItem.imageUrl} 
                      alt={modalItem.title} 
                      className="w-full h-full object-contain rounded-xl" 
                    />
                  </div>

                  {/* Right: Tag, Title & Description */}
                  <div className="flex flex-col flex-1 min-w-0 justify-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff912d]/15 border border-[#ff912d]/40 text-xs font-bold text-amber-300 self-start">
                      <Tag size={12} className="text-[#ff912d]" />
                      <span>{getItemCategoryTag(modalItem)}</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-display font-extrabold text-white tracking-tight leading-snug">
                      {modalItem.title}
                    </h2>
                    <p className="text-gray-300 text-xs md:text-sm leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                      {modalItem.description || "A special space item for your journey!"}
                    </p>
                  </div>
                </div>
              ) : (
                /* Background Showcase: Landscape container on top, Title/Desc below */
                <div className="flex flex-col gap-3">
                  <div className="relative rounded-2xl bg-gradient-to-b from-[#11041f] to-[#0a0214] border border-white/10 p-3 flex flex-col items-center shadow-inner overflow-hidden">
                    <div className="self-start mb-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff912d]/15 border border-[#ff912d]/40 text-xs font-bold text-amber-300">
                      <Tag size={12} className="text-[#ff912d]" />
                      <span>{getItemCategoryTag(modalItem)}</span>
                    </div>

                    <div className="w-full h-36 md:h-44 rounded-xl overflow-hidden flex items-center justify-center bg-black/40 border border-white/10 shadow-2xl">
                      <img 
                        src={modalItem.imageUrl} 
                        alt={modalItem.title} 
                        className="w-full h-full object-cover rounded-lg shadow-lg" 
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <h2 className="text-xl font-display font-extrabold text-white tracking-tight">
                      {modalItem.title}
                    </h2>
                    <p className="text-gray-300 text-xs md:text-sm leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                      {modalItem.description || "A special space item for your journey!"}
                    </p>
                  </div>
                </div>
              )}

              {/* Cost & Balance Bar (Only shown for unowned items) */}
              {!inventoryIds.has(modalItem.id) && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Item Cost</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Settings size={16} className="text-[#ff912d]" />
                      <span className="font-extrabold text-base text-amber-300 font-display">{modalItem.price.toLocaleString()} Gears</span>
                    </div>
                  </div>

                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Gears</span>
                    <span className={`font-bold text-sm mt-0.5 ${gears >= modalItem.price ? 'text-emerald-400' : 'text-red-400'}`}>
                      {gears.toLocaleString()} Gears
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Bottom Action Buttons */}
            <div className="flex gap-3 w-full relative z-10 pt-2 border-t border-white/10">
              <button 
                onClick={() => setModalItem(null)}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-white transition-colors active:scale-95 cursor-pointer"
              >
                {inventoryIds.has(modalItem.id) ? 'Close' : 'Cancel'}
              </button>

              {inventoryIds.has(modalItem.id) ? (
                <button 
                  disabled
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-[#0e0417]/80 text-gray-400 border border-white/5 flex items-center justify-center gap-2 cursor-not-allowed select-none shadow-inner"
                >
                  <span>Already Owned</span>
                </button>
              ) : (
                <div className="flex-1 relative group/btn">
                  <button 
                    disabled={loadingItems.has(modalItem.id) || gears < modalItem.price}
                    onClick={() => handleConfirmPurchase(modalItem)}
                    className={`w-full py-2.5 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                      gears < modalItem.price
                        ? 'bg-gray-700/40 text-gray-400 border border-gray-600/30 cursor-not-allowed opacity-80'
                        : 'bg-gradient-to-r from-[#ff912d] to-[#ffaa40] hover:from-[#ffa34d] hover:to-[#ffb75e] text-[#140624] shadow-[0_0_20px_rgba(255,145,45,0.4)] cursor-pointer'
                    }`}
                  >
                    {loadingItems.has(modalItem.id) ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#140624]/40 border-t-[#140624]"></div>
                    ) : (
                      <>
                        <Settings size={16} className={gears < modalItem.price ? "text-gray-400" : "text-[#140624]"} />
                        <span>Buy for {modalItem.price.toLocaleString()} Gears</span>
                      </>
                    )}
                  </button>

                  {/* Hover Tooltip when player does not have enough gears */}
                  {gears < modalItem.price && (
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 bg-red-950/95 border border-red-500/60 text-red-300 text-xs font-bold px-3 py-1 rounded-lg shadow-xl whitespace-nowrap z-30">
                      You do not have enough gears!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. Celebration Popup Modal (Single Rotating Rays)        */}
      {/* ======================================================== */}
      {celebrationItem && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden p-4">
          {/* Deep Screen Vignette Overlay */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(20, 6, 36, 0.6) 0%, rgba(8, 2, 16, 0.94) 65%, rgba(0, 0, 0, 0.99) 100%)'
            }}
          />

          {/* SINGLE Clean Cartoony Radiating Rotating Sunburst Rays */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <style>{`
              @keyframes celebrationRaysSpin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
            <div 
              className="w-[900px] h-[900px] md:w-[1300px] md:h-[1300px] rounded-full pointer-events-none"
              style={{
                background: 'repeating-conic-gradient(from 0deg, rgba(255, 183, 3, 0.55) 0deg 12deg, transparent 12deg 24deg, rgba(255, 145, 45, 0.4) 24deg 36deg, transparent 36deg 48deg)',
                animation: 'celebrationRaysSpin 20s linear infinite',
                willChange: 'transform'
              }}
            />
          </div>

          {/* Celebration Card Dialog */}
          <div className="relative z-10 bg-[#19072e]/95 backdrop-blur-xl border-2 border-amber-400/70 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-[0_0_60px_rgba(255,183,3,0.35)] flex flex-col items-center text-center">
            
            {/* Sparkling Top Badge */}
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 text-xs font-black uppercase tracking-widest mb-3 shadow-[0_0_15px_rgba(255,183,3,0.3)]">
              <Sparkles size={14} className="text-amber-400" />
              <span>Item Unlocked!</span>
              <Sparkles size={14} className="text-amber-400" />
            </div>

            {/* Cartoony Headline */}
            <h2 className="text-3xl md:text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 tracking-tight drop-shadow-[0_2px_10px_rgba(255,145,45,0.5)]">
              You got a new item!
            </h2>
            <p className="text-gray-300 text-xs md:text-sm mt-1 mb-5 font-medium">
              Added to your collection
            </p>

            {/* Center Stage Floating Item */}
            <div className="relative mb-5 animate-float-reward">
              <div className="w-44 h-44 md:w-52 md:h-52 rounded-2xl bg-gradient-to-b from-black/80 to-[#120524] border-2 border-amber-400/60 p-3 flex items-center justify-center shadow-[0_0_30px_rgba(255,183,3,0.3)] overflow-hidden">
                <img 
                  src={celebrationItem.imageUrl} 
                  alt={celebrationItem.title} 
                  className="max-h-full max-w-full object-contain rounded-xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                />
              </div>

              {/* Tag Overlay (Category Name) */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-[#ff912d] text-[#140624] font-black text-[11px] shadow-lg uppercase tracking-wider flex items-center gap-1 border border-white/40">
                <Tag size={11} />
                <span>{getItemCategoryTag(celebrationItem)}</span>
              </div>
            </div>

            {/* Item Title & Lore */}
            <h3 className="text-xl md:text-2xl font-display font-extrabold text-white mt-1 mb-2">
              {celebrationItem.title}
            </h3>
            <p className="text-gray-300 text-xs line-clamp-3 bg-black/40 p-3 rounded-xl border border-white/10 mb-6 leading-relaxed">
              {celebrationItem.description || "A special space item in your collection!"}
            </p>

            {/* Celebration Action Button */}
            <button 
              onClick={() => setCelebrationItem(null)}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:brightness-110 text-[#140624] font-black text-base transition-all shadow-[0_0_25px_rgba(255,183,3,0.5)] active:scale-95 cursor-pointer uppercase tracking-wider"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}

      {/* Verify Account Banner Popup */}
      {showVerifyBanner && (
        <div className="absolute bottom-6 right-6 z-50 w-80 bg-[#1a082c] border border-[#ff912d]/30 rounded-xl shadow-2xl p-4 flex flex-col gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <button 
            onClick={() => setShowVerifyBanner(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ff912d]/20 flex items-center justify-center border border-[#ff912d]/50 flex-shrink-0">
              <Settings className="text-[#ff912d]" size={20} />
            </div>
            <h3 className="font-bold text-white leading-tight text-sm">Want 150 free gears?</h3>
          </div>
          
          <p className="text-gray-400 text-xs">Verify your account to unlock exclusive features and instantly claim 150 Gears.</p>
          
          <button onClick={() => setIsVerifyModalOpen(true)} className="w-full py-2 bg-[#ff912d] hover:bg-[#ff912d]/90 text-[#1a082c] font-bold text-xs rounded-lg text-center transition-colors">
            Verify Now
          </button>
        </div>
      )}

      <VerifyModal isOpen={isVerifyModalOpen} onClose={() => setIsVerifyModalOpen(false)} />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[150] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 fade-in duration-300 backdrop-blur-md ${
          toast.type === 'success' ? 'bg-emerald-950/90 border border-emerald-500/60 text-emerald-300' : 'bg-red-950/90 border border-red-500/60 text-red-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <X size={18} />}
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Verification Reward Modal */}
      {rewardModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1e0a2d] border border-[#ff912d]/50 rounded-3xl p-8 max-w-md w-full relative flex flex-col items-center text-center shadow-[0_0_40px_rgba(255,145,45,0.2)]">
             <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-[#ffb703]/20 to-[#ff912d]/20 border-2 border-[#ff912d] flex items-center justify-center shadow-[0_0_20px_rgba(255,145,45,0.4)] animate-bounce">
                <Settings size={48} className="text-[#ff912d]" />
             </div>
             
             <h3 className="text-3xl font-display font-bold text-white mb-2 tracking-wide uppercase">Verification Reward!</h3>
             <p className="text-white/70 mb-6">Thank you for verifying your account. As a reward, you have received:</p>
             
             <div className="bg-black/40 border border-[#ff912d]/30 px-6 py-3 rounded-2xl flex items-center gap-3 mb-8 shadow-inner">
                <Settings size={24} className="text-[#ff912d]" />
                <span className="text-[#ff912d] text-4xl font-bold">{rewardAmount}</span>
                <span className="text-white/60 font-bold uppercase tracking-wider text-sm mt-2">Gears</span>
             </div>
             
             <button 
               onClick={() => setRewardModalOpen(false)}
               className="w-full bg-[#ff912d] hover:bg-[#ff912d]/80 text-black font-bold py-3.5 rounded-full transition-all active:scale-95 text-lg shadow-lg"
             >
               Awesome!
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

