"use client";

import React from 'react';
import { CheckCircle2, Wind, Shield, Flame, Compass } from 'lucide-react';

export interface LevelThreeTabsProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
  isOxygenFixed: boolean;
  isShieldFixed: boolean;
  isEngineFixed: boolean;
}

export default function LevelThreeTabs({
  activeTab,
  onTabChange,
  isOxygenFixed,
  isShieldFixed,
  isEngineFixed,
}: LevelThreeTabsProps) {
  const tabs = [
    {
      id: 1,
      label: "Oxygen Room",
      subtitle: "Life Support",
      isFixed: isOxygenFixed,
      icon: Wind,
      color: "text-cyan-400",
      activeBg: "bg-cyan-950/40 border-cyan-500",
    },
    {
      id: 2,
      label: "Shield Room",
      subtitle: "Defense Grid",
      isFixed: isShieldFixed,
      icon: Shield,
      color: "text-purple-400",
      activeBg: "bg-purple-950/40 border-purple-500",
    },
    {
      id: 3,
      label: "Engine Room",
      subtitle: "Thruster Mix",
      isFixed: isEngineFixed,
      icon: Flame,
      color: "text-orange-400",
      activeBg: "bg-orange-950/40 border-orange-500",
    },
    {
      id: 4,
      label: "The Cockpit",
      subtitle: "Launch Control",
      isFixed: isOxygenFixed && isShieldFixed && isEngineFixed,
      icon: Compass,
      color: "text-yellow-400",
      activeBg: "bg-yellow-950/40 border-yellow-500",
    },
  ];

  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-2.5 p-2 bg-slate-900/90 border-b border-purple-900/40 rounded-xl">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const IconComponent = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            type="button"
            className={`relative flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
              isActive
                ? `${tab.activeBg} shadow-[0_0_15px_rgba(168,85,247,0.25)]`
                : tab.isFixed
                ? 'bg-emerald-950/20 border-emerald-500/50 hover:border-emerald-400'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`p-2 rounded-lg ${
                  tab.isFixed ? 'bg-emerald-900/50 text-emerald-400' : `${tab.color} bg-slate-900`
                }`}
              >
                <IconComponent className="w-4 h-4 shrink-0" />
              </div>
              <div className="text-left truncate">
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 truncate">
                  <span>{tab.label}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  {tab.subtitle}
                </div>
              </div>
            </div>

            {/* Visual Success Indicator */}
            {tab.isFixed ? (
              <div className="flex items-center gap-1 shrink-0 ml-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-500/20 text-emerald-400" />
                <span className="text-[9px] font-mono font-bold uppercase hidden sm:inline">READY</span>
              </div>
            ) : tab.id === 4 ? (
              <span className="text-[9px] font-mono text-yellow-400/70 shrink-0 ml-1">
                {`${[isOxygenFixed, isShieldFixed, isEngineFixed].filter(Boolean).length}/3`}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
