"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { setUserStorageItem } from '@/lib/userStorage';
import {
  X,
  Check,
  RotateCcw,
  ShoppingBag,
  Palette,
  Sparkles,
  Layers,
  Shirt,
  Footprints,
  Glasses,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import AvatarDisplay, { AvatarLayers, DEFAULT_AVATAR_LAYERS } from '@/components/AvatarDisplay';
import { getAvatarItemStyle } from '@/lib/shopCatalog';
import { triggerDailyTaskCompletion } from '@/lib/dailyTasks';

export interface AvatarCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarUpdated?: (newLayers: AvatarLayers) => void;
}

interface InventoryItem {
  id: string;
  shopItemId: string;
  isEquipped: boolean;
  item: {
    id: string;
    title: string;
    category: string;
    subCategory: string;
    imageUrl: string;
  };
}

export interface BaseSkin {
  id: string;
  name: string;
  hex: string;
  category: string;
  url: string;
}

// 16 Available Base Skins (ordered and grouped consecutively by similar color harmony)
export const BASE_SKINS: BaseSkin[] = [
  // Natural & Earth Tones
  { id: 'skin-light-fair', name: 'Light Fair', hex: '#ead0c3', category: 'human', url: '/assets/global/shop/avatar/base/Skin 1 Faceless.svg' },
  { id: 'skin-warm-peach', name: 'Warm Peach', hex: '#efb8a1', category: 'human', url: '/assets/global/shop/avatar/base/New Skin 1 Faceless.svg' },
  { id: 'skin-golden-sand', name: 'Golden Sand', hex: '#e7ad85', category: 'human', url: '/assets/global/shop/avatar/base/New Skin 4 Faceless.svg' },
  { id: 'skin-amber-tan', name: 'Amber Tan', hex: '#8d6346', category: 'human', url: '/assets/global/shop/avatar/base/Skin 5 Faceless.svg' },
  { id: 'skin-chestnut-bronze', name: 'Chestnut Bronze', hex: '#895c42', category: 'human', url: '/assets/global/shop/avatar/base/New Skin 5 Faceless.svg' },
  { id: 'skin-deep-espresso', name: 'Deep Espresso', hex: '#4e3c2f', category: 'human', url: '/assets/global/shop/avatar/base/Skin 2 Faceless.svg' },
  // Solar & Ember Tones
  { id: 'skin-solar-amber', name: 'Solar Amber', hex: '#fea343', category: 'cosmic', url: '/assets/global/shop/avatar/base/New Skin 7 Faceless.svg' },
  { id: 'skin-terracotta-coral', name: 'Terracotta Coral', hex: '#f07458', category: 'cosmic', url: '/assets/global/shop/avatar/base/New Skin 3 Faceless.svg' },
  // Rose & Nebula Tones
  { id: 'skin-blossom-pink', name: 'Blossom Pink', hex: '#e1c5d4', category: 'cosmic', url: '/assets/global/shop/avatar/base/Skin 8 Faceless.svg' },
  { id: 'skin-nebula-rose', name: 'Nebula Rose', hex: '#ff90be', category: 'cosmic', url: '/assets/global/shop/avatar/base/New Skin 8 Faceless.svg' },
  { id: 'skin-mystic-orchid', name: 'Mystic Orchid', hex: '#c15a9f', category: 'cosmic', url: '/assets/global/shop/avatar/base/New Skin 6 Faceless.svg' },
  { id: 'skin-deep-violet', name: 'Deep Violet', hex: '#c3bcd5', category: 'cosmic', url: '/assets/global/shop/avatar/base/Skin 7 Faceless.svg' },
  // Flora & Cyber Tones
  { id: 'skin-alien-sage', name: 'Alien Sage', hex: '#bacc8f', category: 'cosmic', url: '/assets/global/shop/avatar/base/Skin 4 Faceless.svg' },
  { id: 'skin-cyber-olive', name: 'Cyber Olive', hex: '#89b433', category: 'cosmic', url: '/assets/global/shop/avatar/base/New Skin 2 Faceless.svg' },
  // Celestial & Frost Tones
  { id: 'skin-lunar-pearl', name: 'Lunar Pearl', hex: '#ffffff', category: 'cosmic', url: '/assets/global/shop/avatar/base/New Skin 9 Faceless.svg' },
  { id: 'skin-cosmic-ice', name: 'Cosmic Ice', hex: '#bfd0e6', category: 'cosmic', url: '/assets/global/shop/avatar/base/Skin 6 Faceless.svg' },
];

type CustomizationTab = 'skin' | 'hair' | 'accessories' | 'tops' | 'bottoms' | 'shoes';

const TABS: { id: CustomizationTab; label: string; icon: any; desc: string }[] = [
  { id: 'skin', label: 'Skin Color', icon: Palette, desc: 'Select your astronaut base skin complexion' },
  { id: 'hair', label: 'Hairstyles', icon: Sparkles, desc: 'Style your hair with unlocked hairstyles' },
  { id: 'accessories', label: 'Accessories', icon: Glasses, desc: 'Equip hats, glasses, and face accessories' },
  { id: 'tops', label: 'Tops', icon: Shirt, desc: 'Wear jackets, hoodies, dresses, and shirts' },
  { id: 'bottoms', label: 'Bottoms', icon: Layers, desc: 'Equip pants, skirts, shorts, and kilts' },
  { id: 'shoes', label: 'Shoes', icon: Footprints, desc: 'Wear sneakers, boots, and space footwear' },
];

export default function AvatarCustomizeModal({
  isOpen,
  onClose,
  onAvatarUpdated,
}: AvatarCustomizeModalProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [activeTab, setActiveTab] = useState<CustomizationTab>('skin');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Live customizable state
  const [selectedSkin, setSelectedSkin] = useState<string>(BASE_SKINS[0].url);
  const [equippedItems, setEquippedItems] = useState<{
    hair?: InventoryItem;
    accessory?: InventoryItem;
    top?: InventoryItem;
    bottom?: InventoryItem;
    shoes?: InventoryItem;
  }>({});

  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  // Fetch avatar configuration and user inventory on modal open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadAvatarData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/avatar?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (!isMounted) return;

          if (data.skin) setSelectedSkin(data.skin);
          if (Array.isArray(data.inventory)) {
            setInventory(data.inventory);

            // Determine initially equipped items
            const newEquipped: typeof equippedItems = {};
            data.inventory.forEach((inv: InventoryItem) => {
              if (inv.isEquipped) {
                const sub = (inv.item.subCategory || '').toLowerCase();
                if (sub === 'hair' || sub === 'hairstyles') newEquipped.hair = inv;
                else if (sub === 'accessories' || sub === 'hats') newEquipped.accessory = inv;
                else if (sub === 'tops') newEquipped.top = inv;
                else if (sub === 'bottoms') newEquipped.bottom = inv;
                else if (sub === 'shoes') newEquipped.shoes = inv;
              }
            });
            setEquippedItems(newEquipped);
          }
        }
      } catch (err) {
        console.error('Failed to load avatar configuration:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAvatarData();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Toast Auto-clear
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // Compute live layers for the showcase
  const currentLayers: AvatarLayers = useMemo(() => {
    return {
      skin: selectedSkin,
      face: DEFAULT_AVATAR_LAYERS.face,
      underwear: DEFAULT_AVATAR_LAYERS.underwear,
      hair: equippedItems.hair?.item.imageUrl,
      accessory: equippedItems.accessory?.item.imageUrl,
      top: equippedItems.top?.item.imageUrl,
      bottom: equippedItems.bottom?.item.imageUrl,
      shoes: equippedItems.shoes?.item.imageUrl,
    };
  }, [selectedSkin, equippedItems]);

  // Filter owned items for current tab
  const tabItems = useMemo(() => {
    if (activeTab === 'skin') return [];
    return inventory.filter((inv) => {
      const sub = (inv.item.subCategory || '').toLowerCase();
      if (activeTab === 'hair') return sub === 'hair' || sub === 'hairstyles';
      if (activeTab === 'accessories') return sub === 'accessories' || sub === 'hats';
      if (activeTab === 'tops') return sub === 'tops';
      if (activeTab === 'bottoms') return sub === 'bottoms';
      if (activeTab === 'shoes') return sub === 'shoes';
      return false;
    });
  }, [activeTab, inventory]);

  // Handle equipping an item
  const handleSelectItem = (item: InventoryItem) => {
    setEquippedItems((prev) => {
      const copy = { ...prev };
      if (activeTab === 'hair') copy.hair = item;
      else if (activeTab === 'accessories') copy.accessory = item;
      else if (activeTab === 'tops') copy.top = item;
      else if (activeTab === 'bottoms') copy.bottom = item;
      else if (activeTab === 'shoes') copy.shoes = item;
      return copy;
    });
  };

  // Handle unequipping an item for the active slot
  const handleUnequipSlot = () => {
    setEquippedItems((prev) => {
      const copy = { ...prev };
      if (activeTab === 'hair') delete copy.hair;
      else if (activeTab === 'accessories') delete copy.accessory;
      else if (activeTab === 'tops') delete copy.top;
      else if (activeTab === 'bottoms') delete copy.bottom;
      else if (activeTab === 'shoes') delete copy.shoes;
      return copy;
    });
  };

  // Reset all to default baseline
  const handleResetAll = () => {
    setSelectedSkin(BASE_SKINS[0].url);
    const defaultTop = inventory.find(
      (inv) => inv.shopItemId === 'top-astro-suit' || inv.item.imageUrl.includes('AstroSuit')
    );
    const defaultBottom = inventory.find(
      (inv) => inv.shopItemId === 'bot-astro-pants' || inv.item.imageUrl.includes('AstroPants')
    );
    const defaultShoes = inventory.find(
      (inv) => inv.shopItemId === 'shoe-astro-boots' || inv.item.imageUrl.includes('AstroBoots')
    );
    const newEquipped: typeof equippedItems = {};
    if (defaultTop) newEquipped.top = defaultTop;
    if (defaultBottom) newEquipped.bottom = defaultBottom;
    if (defaultShoes) newEquipped.shoes = defaultShoes;
    setEquippedItems(newEquipped);
    setToastMessage({ text: 'Reset avatar to default astronaut outfit.', type: 'success' });
  };

  // Save changes to backend & update dashboard
  const handleSave = async () => {
    setSaving(true);
    try {
      const equippedIds: string[] = [];
      if (equippedItems.hair) equippedIds.push(equippedItems.hair.shopItemId);
      if (equippedItems.accessory) equippedIds.push(equippedItems.accessory.shopItemId);
      if (equippedItems.top) equippedIds.push(equippedItems.top.shopItemId);
      if (equippedItems.bottom) equippedIds.push(equippedItems.bottom.shopItemId);
      if (equippedItems.shoes) equippedIds.push(equippedItems.shoes.shopItemId);

      const res = await fetch('/api/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skin: selectedSkin,
          equippedItemIds: equippedIds,
        }),
      });

      if (res.ok) {
        // Persist to user-scoped local storage for zero-latency client retrieval
        if (typeof window !== 'undefined') {
          if (userId) {
            setUserStorageItem('avatar_layers', JSON.stringify(currentLayers), userId);
          }
          window.dispatchEvent(new CustomEvent('netstart_avatar_updated', { detail: currentLayers }));
        }

        // Trigger daily task for avatar customization
        triggerDailyTaskCompletion('task-explore-1');

        if (onAvatarUpdated) {
          onAvatarUpdated(currentLayers);
        }

        setToastMessage({ text: 'Avatar appearance saved successfully!', type: 'success' });
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setToastMessage({ text: 'Failed to save changes. Please try again.', type: 'error' });
      }
    } catch (e) {
      console.error('Error saving avatar:', e);
      setToastMessage({ text: 'An unexpected error occurred.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const renderSkinButton = (skin: typeof BASE_SKINS[0]) => {
    const isSelected = selectedSkin === skin.url;
    return (
      <button
        key={skin.id}
        onClick={() => setSelectedSkin(skin.url)}
        className={`relative p-2 sm:p-2.5 rounded-2xl border transition-all flex flex-col items-center gap-1.5 sm:gap-2 text-center cursor-pointer group ${isSelected
          ? 'bg-[#ff912d]/20 border-[#ff912d] shadow-[0_0_15px_rgba(255,145,45,0.3)]'
          : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
          }`}
      >
        {/* Check badge when selected */}
        {isSelected && (
          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#ff912d] text-black flex items-center justify-center shadow-md">
            <Check size={10} className="stroke-[3]" />
          </div>
        )}

        {/* Head Avatar Preview with Full Face on Top */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-white/20 bg-black/40 flex items-center justify-center shadow-inner">
          <div
            className="relative w-full h-full"
            style={{ transform: 'scale(2.4) translateY(18%)', transformOrigin: 'center center' }}
          >
            <img
              src={skin.url}
              alt={skin.name}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              style={{ zIndex: 1 }}
            />
            <img
              src={DEFAULT_AVATAR_LAYERS.face}
              alt="Face"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              style={{ zIndex: 2 }}
            />
          </div>
        </div>

        {/* Swatch & Title */}
        <div className="flex items-center justify-center gap-1.5 w-full px-1">
          <span
            className="w-3 h-3 rounded-full border border-white/40 shadow-sm shrink-0"
            style={{ backgroundColor: skin.hex }}
          />
          <span className="text-[11px] sm:text-xs font-display font-black text-white truncate">
            {skin.name}
          </span>
        </div>
      </button>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      {/* Toast Notification Modal */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[210] flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-top-4 duration-300 bg-[#1e0a2d] border-[#ff912d]/60 text-white">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-red-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-sans font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* Main Customization Modal Container */}
      <div className="relative w-full max-w-5xl h-[88vh] max-h-[720px] min-h-[460px] my-auto bg-[#1a082c]/95 border-2 border-[#ff912d]/50 rounded-[24px] sm:rounded-[32px] shadow-[0_0_50px_rgba(255,145,45,0.25)] flex flex-col overflow-hidden text-white">
        {/* Subtle Ambient Cosmic Background Elements */}
        <img
          src="/assets/global/ui/Landing Page BG.png"
          alt="Stars"
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        />
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#ff912d]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#a855f7]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Header Bar */}
        <div className="relative z-10 shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 border-b border-white/10 bg-[#160627]/90">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#ff912d]/20 border border-[#ff912d]/40 flex items-center justify-center text-[#ff912d] shadow-inner shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-display font-black tracking-wide text-white uppercase">
                Customize Avatar
              </h2>
              <p className="text-[11px] sm:text-xs text-white/60 font-sans line-clamp-1">
                Style your astronaut with unlocked gear.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Main Body (3-Column Layout: Categories Tabs -> Showcase Center -> Options Grid) */}
        <div className="relative z-10 flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[190px_1fr] lg:grid-cols-[205px_1.1fr_310px] xl:grid-cols-[215px_1.15fr_330px] overflow-hidden">

          {/* LEFT COLUMN: Customization Category Tabs */}
          <div className="border-r border-white/10 bg-[#140523]/70 p-2.5 sm:p-3 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto no-scrollbar shrink-0 min-h-0">
            <div className="hidden md:block text-[10px] font-mono uppercase tracking-wider text-white/40 font-bold px-2 py-1 mb-0.5">
              Customization
            </div>

            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              // Count owned items for badge (skin always BASE_SKINS.length)
              const count = tab.id === 'skin' ? BASE_SKINS.length : inventory.filter((inv) => {
                const sub = (inv.item.subCategory || '').toLowerCase();
                if (tab.id === 'hair') return sub === 'hair' || sub === 'hairstyles';
                if (tab.id === 'accessories') return sub === 'accessories' || sub === 'hats';
                if (tab.id === 'tops') return sub === 'tops';
                if (tab.id === 'bottoms') return sub === 'bottoms';
                if (tab.id === 'shoes') return sub === 'shoes';
                return false;
              }).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 sm:py-2.5 rounded-xl font-display font-black text-xs sm:text-sm tracking-wide transition-all cursor-pointer whitespace-nowrap md:whitespace-normal text-left ${isActive
                    ? 'bg-gradient-to-r from-[#ff912d] to-amber-500 text-black shadow-lg shadow-[#ff912d]/25'
                    : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/5'
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={15} className={isActive ? 'text-black' : 'text-[#ff912d]'} />
                    <span>{tab.label}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-black/25 text-black' : 'bg-white/10 text-white/60'
                    }`}>
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Quick Visit Shop Link at Bottom of Sidebar */}
            <div className="hidden md:flex flex-col gap-2 mt-auto pt-3 border-t border-white/10 shrink-0">
              <Link
                href="/shop"
                onClick={onClose}
                className="w-full py-2 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-200 text-xs font-bold font-sans flex items-center justify-center gap-2 transition-all"
              >
                <ShoppingBag size={14} className="text-[#ff912d]" />
                Browse Gear Shop
              </Link>
            </div>
          </div>

          {/* MIDDLE COLUMN: The Showcase Center Stage */}
          <div className="relative flex flex-col items-center justify-between p-3 sm:p-5 bg-gradient-to-b from-[#1b082e]/40 via-[#130522]/80 to-[#10031c]/90 border-r border-white/10 min-h-0 overflow-hidden">
            {/* Header tag */}
            <div className="w-full flex items-center justify-between z-10 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-white/50 font-bold">
                  Preview
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetAll}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] sm:text-[11px] font-mono text-white/70 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Reset to default baseline"
                >
                  <RotateCcw size={12} />
                  Reset
                </button>
              </div>
            </div>

            {/* Showcase Stage with Character & Glow */}
            <div className="relative w-full flex-1 min-h-0 flex flex-col items-center justify-center my-1">
              {/* Circular Stage Floor Pedestal */}
              <div className="absolute bottom-2 sm:bottom-4 w-44 sm:w-56 h-12 sm:h-14 rounded-[100%] bg-gradient-to-t from-[#ff912d]/30 via-purple-600/20 to-transparent border border-[#ff912d]/40 shadow-[0_0_35px_rgba(255,145,45,0.35)] pointer-events-none" />
              <div className="absolute bottom-4 sm:bottom-6 w-36 sm:w-44 h-8 sm:h-10 rounded-[100%] bg-white/10 blur-[1px] pointer-events-none" />

              {/* Character Display */}
              <div className="relative z-10 w-full h-full max-h-[290px] sm:max-h-[340px] flex items-center justify-center">
                <AvatarDisplay
                  layers={currentLayers}
                  className="w-full h-full"
                  scale={1.16}
                  offsetYClass="translate-y-2 sm:translate-y-3"
                  shadowBottomClass="bottom-[30px] sm:bottom-[41px]"
                />
              </div>
            </div>

            {/* Showcase Bottom Controls: Save Button */}
            <div className="w-full z-10 shrink-0 flex items-center justify-end pt-2.5 border-t border-white/10">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#ff912d] to-amber-500 hover:from-amber-500 hover:to-[#ff912d] text-black font-sans font-black text-xs uppercase tracking-wider shadow-lg shadow-[#ff912d]/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={14} className="stroke-[3]" />
                    Save & Apply
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Customization Selection Grid */}
          <div className="flex flex-col bg-[#140523]/80 p-3 sm:p-4 min-h-0 overflow-hidden">
            {/* Active Tab Title & Instructions */}
            <div className="shrink-0 pb-2.5 border-b border-white/10 mb-2.5">
              <h3 className="font-display font-black text-xs sm:text-sm text-white tracking-wide uppercase">
                {TABS.find(t => t.id === activeTab)?.label}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-white/60 font-sans mt-0.5">
                {TABS.find(t => t.id === activeTab)?.desc}
              </p>
            </div>

            {/* TAB CONTENT: SKIN COLOR */}
            {activeTab === 'skin' && (
              <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pr-0.5 grid grid-cols-2 gap-2 sm:gap-2.5">
                {BASE_SKINS.map(renderSkinButton)}
              </div>
            )}

            {/* TAB CONTENT: GEAR CATEGORIES (Hair, Accessories, Tops, Bottoms, Shoes) */}
            {activeTab !== 'skin' && (
              <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pr-0.5 flex flex-col gap-2.5 sm:gap-3">
                {/* Unequip / None Option at the top */}
                <button
                  onClick={handleUnequipSlot}
                  className={`p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center gap-2.5 cursor-pointer shrink-0 ${!equippedItems[activeTab === 'hair' ? 'hair' : activeTab === 'accessories' ? 'accessory' : activeTab === 'tops' ? 'top' : activeTab === 'bottoms' ? 'bottom' : 'shoes']
                    ? 'bg-purple-500/20 border-purple-400/60 shadow-md'
                    : 'bg-white/5 hover:bg-white/10 border-white/10'
                    }`}
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 shrink-0">
                    <X size={15} />
                  </div>
                  <span className="text-xs font-display font-black text-white">
                    None
                  </span>
                </button>

                {/* If user owns 0 items in this category */}
                {tabItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-2xl bg-white/5 border border-dashed border-white/10 my-auto">
                    <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 mb-2.5">
                      <ShoppingBag size={22} />
                    </div>
                    <h4 className="text-xs sm:text-sm font-display font-bold text-white mb-1">
                      No {TABS.find(t => t.id === activeTab)?.label} Owned
                    </h4>
                    <p className="text-[11px] sm:text-xs text-white/60 font-sans max-w-[220px] mb-3">
                      You haven&apos;t purchased any items in this category from the Shop yet.
                    </p>
                    <Link
                      href="/shop"
                      onClick={onClose}
                      className="px-3.5 py-1.5 rounded-xl bg-[#ff912d] hover:bg-orange-400 text-black font-sans font-black text-xs uppercase tracking-wider transition-all"
                    >
                      Visit Shop
                    </Link>
                  </div>
                ) : (
                  /* Grid of owned items */
                  <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                    {tabItems.map((inv) => {
                      const isCurrentlyEquipped =
                        equippedItems[activeTab === 'hair' ? 'hair' : activeTab === 'accessories' ? 'accessory' : activeTab === 'tops' ? 'top' : activeTab === 'bottoms' ? 'bottom' : 'shoes']?.shopItemId === inv.shopItemId;

                      return (
                        <button
                          key={inv.id}
                          onClick={() => handleSelectItem(inv)}
                          className={`relative p-2 sm:p-2.5 rounded-2xl border transition-all flex flex-col items-center gap-1.5 sm:gap-2 text-center cursor-pointer group ${isCurrentlyEquipped
                            ? 'bg-[#ff912d]/20 border-[#ff912d] shadow-[0_0_15px_rgba(255,145,45,0.3)]'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
                            }`}
                        >
                          {/* Equipped badge */}
                          {isCurrentlyEquipped && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#ff912d] text-black flex items-center justify-center shadow-md z-20">
                              <Check size={10} className="stroke-[3]" />
                            </div>
                          )}

                          {/* Zoomed Thumbnail using getAvatarItemStyle */}
                          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-purple-950/40 border border-white/10 flex items-center justify-center shadow-inner">
                            <div
                              className="relative w-full h-full"
                              style={getAvatarItemStyle(inv.item.subCategory)}
                            >
                              <img
                                src={inv.item.imageUrl}
                                alt={inv.item.title}
                                className="w-full h-full object-contain pointer-events-none"
                              />
                            </div>
                          </div>

                          {/* Title */}
                          <span className="text-[10px] sm:text-[11px] font-display font-bold text-white line-clamp-2 leading-tight">
                            {inv.item.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>,
    document.body
  );
}
