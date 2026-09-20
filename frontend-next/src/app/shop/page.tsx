"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Settings, Image as ImageIcon, Smile, Shirt, Zap, Brush, Footprints, CheckCircle, X } from 'lucide-react';
import TopHeader from '@/components/TopHeader';
import { getShopItems, getUserInventory, purchaseItem, claimVerificationReward } from '@/app/actions/shop';
import VerifyModal from '@/components/VerifyModal';
import DailyTaskTracker from '@/components/DailyTaskTracker';
import Image from 'next/image';

type ShopItem = {
  id: string;
  title: string;
  type: string;
  category: string;
  subCategory: string;
  price: number;
  imageUrl: string;
};

export default function ShopPage() {
  const { data: session } = useSession();
  const [activeCategory, setActiveCategory] = useState('Background');
  const [gears, setGears] = useState(0);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [inventoryIds, setInventoryIds] = useState<Set<string>>(new Set());
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showVerifyBanner, setShowVerifyBanner] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  
  // Custom Modal & Toast States
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'error' | 'success' } | null>(null);
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);

  const showToast = (message: string, type: 'error' | 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
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
        { name: 'Background', icon: <ImageIcon size={18} /> },
        { name: 'Icons', icon: <Smile size={18} /> }
      ]
    },
    {
      title: 'AVATAR',
      items: [
        { name: 'Hats', icon: <Shirt size={18} /> },
        { name: 'Accessories', icon: <Zap size={18} /> },
        { name: 'Outfits', icon: <Footprints size={18} /> },
        { name: 'Paints', icon: <Brush size={18} /> },
        { name: 'Shoes', icon: <Footprints size={18} /> }
      ]
    }
  ];

  useEffect(() => {
    async function loadData() {
      setLoading(true);
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
      
      setLoading(false);
    }
    loadData();
  }, []);

  const handlePurchaseClick = (item: ShopItem) => {
    if (gears < item.price) {
      showToast("Not enough gears!", "error");
      return;
    }
    setSelectedItem(item);
  };

  const confirmPurchase = async () => {
    if (!selectedItem) return;
    const item = selectedItem;
    setSelectedItem(null); // close modal

    setLoadingItems(prev => new Set(prev).add(item.id));
    const res = await purchaseItem(item.id);
    
    if (res.success) {
      setGears(prev => prev - item.price);
      setInventoryIds(prev => new Set(prev).add(item.id));
      showToast(`Successfully purchased ${item.title}!`, "success");
    } else {
      showToast((res as any).error || "Failed to purchase item", "error");
    }
    
    setLoadingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(item.id);
      return newSet;
    });
  };

  const displayedItems = items.filter(item => item.subCategory === activeCategory);

  return (
    <div className="flex h-full text-white overflow-hidden font-sans bg-transparent">
      <DailyTaskTracker taskIds={["task-explore-1", "task-explore-3"]} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopHeader title="Points Shop" />
        
        <div className="flex flex-1 overflow-hidden relative">
          
          {/* Left Sidebar (Shop Navigation) */}
          <div className="w-64 bg-[#1a082c] border-r border-white/10 flex flex-col z-10 hidden md:flex">
            {/* Gears Balance */}
            <div className="p-6 border-b border-white/10">
              <p className="text-gray-400 text-xs font-bold mb-2 tracking-wider">YOUR BALANCE</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ff912d]/20 flex items-center justify-center border border-[#ff912d]/50">
                  <Settings className="text-[#ff912d]" size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-[#ff912d] font-display">{gears.toLocaleString()}</span>
                  <span className="text-xs text-gray-400 font-medium">GEARS</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
              {categories.map((group, idx) => (
                <div key={idx} className="mb-6">
                  <h3 className="px-6 text-gray-500 text-xs font-bold mb-2 tracking-widest">{group.title}</h3>
                  <ul>
                    {group.items.map((cat, catIdx) => (
                      <li key={catIdx}>
                        <button
                          onClick={() => setActiveCategory(cat.name)}
                          className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
                            activeCategory === cat.name 
                              ? 'bg-white/10 border-l-4 border-[#ff912d] text-white' 
                              : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                          }`}
                        >
                          <span className={activeCategory === cat.name ? 'text-[#ff912d]' : ''}>
                            {cat.icon}
                          </span>
                          <span className="font-medium text-sm">{cat.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 overflow-y-auto relative bg-gradient-to-br from-[#10061e] to-[#0a0210]">
            {/* Background space image simulation */}
            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
              backgroundImage: 'radial-gradient(circle at 50% 0%, #3a1c61 0%, transparent 50%), radial-gradient(circle at 80% 80%, #ff912d22 0%, transparent 50%)',
            }}></div>
            
            <div className="relative z-10 p-8">
              <h1 className="text-4xl font-display font-bold mb-8 text-white">{activeCategory}</h1>
              
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff912d]"></div>
                </div>
              ) : displayedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">
                  <Settings size={48} className="mb-4 opacity-50" />
                  <p className="text-lg">No items found in this category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {displayedItems.map(item => {
                    const isOwned = inventoryIds.has(item.id);
                    const isProcessing = loadingItems.has(item.id);
                    
                    return (
                      <div key={item.id} className="rounded-xl overflow-hidden shadow-2xl border border-white/10 flex flex-col transition-transform hover:scale-[1.02] duration-300">
                        {/* Top half - Image */}
                        <div className="h-48 bg-[#1a082c] relative flex items-center justify-center p-4">
                          <img 
                            src={item.imageUrl} 
                            alt={item.title}
                            className="w-full h-full object-cover rounded-lg shadow-inner"
                          />
                        </div>
                        
                        {/* Bottom half - Details */}
                        <div className="bg-[#ff912d] p-4 flex flex-col gap-2">
                          <h3 className="font-bold text-[#1a082c] text-lg leading-tight truncate">{item.title}</h3>
                          <p className="text-[#1a082c]/70 text-xs font-semibold uppercase tracking-wider mb-2">{item.type}</p>
                          
                          <button 
                            disabled={isOwned || isProcessing}
                            onClick={() => handlePurchaseClick(item)}
                            className={`mt-auto flex items-center justify-center gap-2 py-2 px-4 rounded-full font-bold text-sm transition-all shadow-lg ${
                              isOwned 
                                ? 'bg-[#1a082c]/50 text-white/50 cursor-not-allowed'
                                : 'bg-[#1a082c] text-white hover:bg-[#2a1347]'
                            }`}
                          >
                            {isProcessing ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                            ) : isOwned ? (
                              <>
                                <CheckCircle size={16} />
                                <span>Owned</span>
                              </>
                            ) : (
                              <>
                                <Settings size={16} className="text-[#ff912d]" />
                                <span>{item.price.toLocaleString()}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>

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

      {/* Purchase Confirmation Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1a082c] border border-[#ff912d]/50 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-display font-bold text-white">Confirm Purchase</h3>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-lg bg-black/40 p-2 shadow-inner border border-white/10 flex items-center justify-center">
                <img src={selectedItem.imageUrl} alt={selectedItem.title} className="max-w-full max-h-full object-contain rounded-md" />
              </div>
              <p className="text-center text-gray-300 text-sm">
                Are you sure you want to purchase <span className="font-bold text-white">{selectedItem.title}</span>?
              </p>
              <div className="flex items-center gap-2 bg-[#ff912d]/10 px-4 py-2 rounded-lg border border-[#ff912d]/30">
                <Settings size={18} className="text-[#ff912d]" />
                <span className="font-bold text-[#ff912d]">{selectedItem.price.toLocaleString()} Gears</span>
              </div>
            </div>
            
            <div className="flex gap-3 w-full mt-2">
              <button 
                onClick={() => setSelectedItem(null)}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-white transition-colors active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={confirmPurchase}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-[#ff912d] hover:bg-[#ff912d]/90 text-[#1a082c] transition-colors shadow-[0_0_15px_rgba(255,145,45,0.4)] active:scale-95"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[110] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 fade-in duration-300 ${
          toast.type === 'success' ? 'bg-green-500/20 border border-green-500/50 text-green-400' : 'bg-red-500/20 border border-red-500/50 text-red-400'
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
