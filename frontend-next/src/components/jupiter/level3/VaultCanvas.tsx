"use client";

import React from 'react';
import DatapadNode from './DatapadNode';
import ClueModal from './ClueModal';
import { PlayerBlueprint } from '@/lib/jupiter/jupiterLevel3Definitions';
import { ShieldAlert, ShieldCheck, KeyRound, Cpu, UserCheck } from 'lucide-react';

interface VaultCanvasProps {
  vaultStatus: 'LOCKED' | 'UNLOCKED';
  scanState: 'idle' | 'scanning' | 'failed' | 'success';
  blueprint: PlayerBlueprint | null;
  failedSlot?: 1 | 2 | 3 | 4;
  activeScanSlot?: 1 | 2 | 3 | 4 | null;
  clueStatus: Record<1 | 2 | 3 | 4, boolean>;
  activeClue: 1 | 2 | 3 | 4 | null;
  onOpenClue: (id: 1 | 2 | 3 | 4) => void;
  onCloseClue: () => void;
}

export default function VaultCanvas({
  vaultStatus,
  scanState,
  blueprint,
  failedSlot,
  activeScanSlot,
  clueStatus,
  activeClue,
  onOpenClue,
  onCloseClue,
}: VaultCanvasProps) {
  const isLocked = vaultStatus === 'LOCKED';
  const isScanning = scanState === 'scanning';
  const isFailed = scanState === 'failed';
  const isSuccess = scanState === 'success';

  // Live profile check satisfaction for the 4 Datapads & 4 Slots
  const admin = blueprint?.classes?.['AdminProfile'];
  const adminHasUnlock = Boolean(admin?.methods?.includes('UNLOCK_DOORS') || admin?.methods?.includes('OVERRIDE'));
  const adminHasAlarm = Boolean(admin?.methods?.includes('SOUND_ALARM') || admin?.methods?.includes('REBOOT'));
  const isCheck1Passed = Boolean(
    admin &&
    Boolean(admin.hasPrivateClearance || (admin.isPrivate && !admin.hasPublicLeak)) &&
    ((admin.clearanceLevel || 0) === 4 || (admin.clearanceLevel || 0) === 5) &&
    (admin.role === 'Admin' || (admin.role || '').toLowerCase() === 'admin') &&
    Boolean(admin.hasPublicRole || admin.role) &&
    adminHasUnlock &&
    adminHasAlarm
  );

  const tech = blueprint?.classes?.['TechProfile'];
  const techHasFix = Boolean(tech?.methods?.includes('FIX_ERRORS') || tech?.methods?.includes('DIAGNOSTICS'));
  const techHasHealth = Boolean(tech?.methods?.includes('CHECK_HEALTH') || tech?.methods?.includes('CALIBRATE'));
  const isCheck2Passed = Boolean(
    tech &&
    Boolean(tech.hasPrivateClearance || (tech.isPrivate && !tech.hasPublicLeak)) &&
    (tech.clearanceLevel || 0) === 3 &&
    (tech.role || '').trim().toLowerCase() === 'maintenance' &&
    Boolean(tech.hasPublicRole || tech.role) &&
    techHasFix &&
    techHasHealth
  );

  const sec = blueprint?.classes?.['SecurityProfile'];
  const secHasAlarm = Boolean(sec?.methods?.includes('SOUND_ALARM') || sec?.methods?.includes('OVERRIDE'));
  const secHasScan = Boolean(sec?.methods?.includes('SCAN_ROOM') || sec?.methods?.includes('SCAN_INTRUDERS'));
  const isCheck3Passed = Boolean(
    sec &&
    Boolean(sec.hasPrivateClearance || (sec.isPrivate && !sec.hasPublicLeak)) &&
    (sec.clearanceLevel || 0) === 2 &&
    (sec.role || '').trim().toLowerCase() === 'security' &&
    Boolean(sec.hasPublicRole || sec.role) &&
    ((secHasAlarm && secHasScan) || sec?.methods?.includes('SCAN_INTRUDERS'))
  );

  const visitor = blueprint?.classes?.['VisitorProfile'];
  const visitorHasTour = Boolean(visitor?.methods?.includes('TAKE_TOUR') || visitor?.methods?.includes('TOUR'));
  const isCheck4Passed = Boolean(
    visitor &&
    Boolean(visitor.hasPrivateClearance || (visitor.isPrivate && !visitor.hasPublicLeak)) &&
    (visitor.clearanceLevel || 0) === 1 &&
    (visitor.role || '').trim().toLowerCase() === 'visitor' &&
    Boolean(visitor.hasPublicRole || visitor.role) &&
    visitorHasTour
  );

  const hasAdminBadge = Boolean(blueprint?.instantiations?.includes('AdminProfile'));
  const hasTechBadge = Boolean(blueprint?.instantiations?.includes('TechProfile'));
  const hasSecurityBadge = Boolean(blueprint?.instantiations?.includes('SecurityProfile'));
  const hasVisitorBadge = Boolean(blueprint?.instantiations?.includes('VisitorProfile'));

  // Detailed profile inspection evaluation for each slot (Private Clearance & Public Role)
  const slotsData = [
    {
      slotNum: 1 as const,
      roleTitle: 'ADMIN',
      targetClass: 'AdminProfile',
      Icon: KeyRound,
      hasBadge: hasAdminBadge,
      isPassed: isCheck1Passed,
      hasBlueprint: Boolean(admin),
      isClearanceOk: Boolean(
        admin &&
        Boolean(admin.hasPrivateClearance || (admin.isPrivate && !admin.hasPublicLeak)) &&
        ((admin.clearanceLevel || 0) === 4 || (admin.clearanceLevel || 0) === 5)
      ),
      clearanceText: !admin ? 'Missing' : admin.clearanceLevel ? `Level ${admin.clearanceLevel}` : 'Missing',
      isRoleOk: Boolean(admin && Boolean(admin.hasPublicRole || admin.role) && (admin.role === 'Admin' || (admin.role || '').toLowerCase() === 'admin')),
      roleText: !admin ? 'Missing' : admin.role || 'Missing',
      isActionsOk: Boolean(admin && adminHasUnlock && adminHasAlarm),
      actionsText: !admin
        ? '0/2 Actions'
        : `${(adminHasUnlock ? 1 : 0) + (adminHasAlarm ? 1 : 0)}/2 Actions`,
    },
    {
      slotNum: 2 as const,
      roleTitle: 'TECH',
      targetClass: 'TechProfile',
      Icon: Cpu,
      hasBadge: hasTechBadge,
      isPassed: isCheck2Passed,
      hasBlueprint: Boolean(tech),
      isClearanceOk: Boolean(
        tech &&
        Boolean(tech.hasPrivateClearance || (tech.isPrivate && !tech.hasPublicLeak)) &&
        (tech.clearanceLevel || 0) === 3
      ),
      clearanceText: !tech ? 'Missing' : tech.clearanceLevel ? `Level ${tech.clearanceLevel}` : 'Missing',
      isRoleOk: Boolean(tech && Boolean(tech.hasPublicRole || tech.role) && (tech.role || '').toLowerCase() === 'maintenance'),
      roleText: !tech ? 'Missing' : tech.role || 'Missing',
      isActionsOk: Boolean(tech && techHasFix && techHasHealth),
      actionsText: !tech
        ? '0/2 Actions'
        : `${(techHasFix ? 1 : 0) + (techHasHealth ? 1 : 0)}/2 Actions`,
    },
    {
      slotNum: 3 as const,
      roleTitle: 'SECURITY',
      targetClass: 'SecurityProfile',
      Icon: ShieldCheck,
      hasBadge: hasSecurityBadge,
      isPassed: isCheck3Passed,
      hasBlueprint: Boolean(sec),
      isClearanceOk: Boolean(
        sec &&
        Boolean(sec.hasPrivateClearance || (sec.isPrivate && !sec.hasPublicLeak)) &&
        (sec.clearanceLevel || 0) === 2
      ),
      clearanceText: !sec ? 'Missing' : sec.clearanceLevel ? `Level ${sec.clearanceLevel}` : 'Missing',
      isRoleOk: Boolean(sec && Boolean(sec.hasPublicRole || sec.role) && (sec.role || '').toLowerCase() === 'security'),
      roleText: !sec ? 'Missing' : sec.role || 'Missing',
      isActionsOk: Boolean(sec && ((secHasAlarm && secHasScan) || sec?.methods?.includes('SCAN_INTRUDERS'))),
      actionsText: !sec
        ? '0/2 Actions'
        : `${(secHasAlarm ? 1 : 0) + (secHasScan ? 1 : 0)}/2 Actions`,
    },
    {
      slotNum: 4 as const,
      roleTitle: 'VISITOR',
      targetClass: 'VisitorProfile',
      Icon: UserCheck,
      hasBadge: hasVisitorBadge,
      isPassed: isCheck4Passed,
      hasBlueprint: Boolean(visitor),
      isClearanceOk: Boolean(
        visitor &&
        Boolean(visitor.hasPrivateClearance || (visitor.isPrivate && !visitor.hasPublicLeak)) &&
        (visitor.clearanceLevel || 0) === 1
      ),
      clearanceText: !visitor ? 'Missing' : visitor.clearanceLevel ? `Level ${visitor.clearanceLevel}` : 'Missing',
      isRoleOk: Boolean(visitor && Boolean(visitor.hasPublicRole || visitor.role) && (visitor.role || '').toLowerCase() === 'visitor'),
      roleText: !visitor ? 'Missing' : visitor.role || 'Missing',
      isActionsOk: Boolean(visitor && visitorHasTour),
      actionsText: !visitor
        ? '0/1 Action'
        : visitorHasTour ? '1/1 Action' : '0/1 Action',
    },
  ];

  return (
    <div
      className={`relative w-full h-full bg-[#0d1117] overflow-hidden select-none transition-all duration-1000 ${
        isLocked
          ? 'shadow-[inset_0_0_60px_rgba(239,68,68,0.25)]'
          : 'shadow-[inset_0_0_60px_rgba(16,185,129,0.2)]'
      }`}
    >
      {/* Background Server Racks & Grid Lines */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
        }}
      />

      {/* Atmospheric Server Room LED Columns */}
      <div className="absolute left-4 top-6 bottom-6 w-5 flex flex-col justify-between py-3 opacity-40 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={`led-l-${i}`}
            className={`w-2.5 h-1.5 rounded-xs transition-colors duration-500 ${
              isLocked
                ? i % 3 === 0
                  ? 'bg-rose-500 animate-pulse'
                  : 'bg-rose-900/60'
                : 'bg-emerald-400'
            }`}
          />
        ))}
      </div>
      <div className="absolute right-4 top-6 bottom-6 w-5 flex flex-col justify-between py-3 opacity-40 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={`led-r-${i}`}
            className={`w-2.5 h-1.5 rounded-xs transition-colors duration-500 ${
              isLocked
                ? i % 2 === 0
                  ? 'bg-rose-500 animate-pulse'
                  : 'bg-rose-900/60'
                : 'bg-emerald-400'
            }`}
          />
        ))}
      </div>

      {/* Upper Chamber Console / Blast Shield */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[88%] max-w-xl h-36 z-10 flex items-center justify-between">
        {/* Left Blast Plate */}
        <div
          className={`w-[48%] h-full bg-[#121927]/90 border border-white/10 rounded-xl p-3.5 flex flex-col justify-between transition-transform duration-700 ease-out shadow-lg pointer-events-none ${
            isLocked ? 'translate-x-0' : '-translate-x-14 opacity-75'
          }`}
        >
          <div className="space-y-2">
            <div className="h-0.5 w-full bg-white/15 rounded" />
            <div className="h-0.5 w-2/3 bg-white/10 rounded" />
          </div>
        </div>

        {/* Center Vertical Red Laser Line */}
        <div
          className={`absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-0.5 z-20 pointer-events-none transition-all duration-500 ${
            isLocked
              ? isScanning
                ? 'bg-[#ff912d] shadow-[0_0_15px_#ff912d]'
                : isFailed
                ? 'bg-rose-500 shadow-[0_0_18px_#f43f5e]'
                : 'bg-rose-500/80 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
              : 'bg-emerald-400/40 shadow-[0_0_10px_#34d399]'
          }`}
        />

        {/* Central AI Core Eye */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center pointer-events-none">
          <div
            className={`relative w-22 h-22 rounded-full border-2 flex items-center justify-center transition-all duration-700 ${
              isLocked
                ? isScanning
                  ? 'border-[#ff912d] bg-amber-950/60 shadow-[0_0_40px_#ff912d]'
                  : isFailed
                  ? 'border-rose-500 bg-rose-950/80 shadow-[0_0_45px_#f43f5e]'
                  : 'border-rose-500 bg-rose-950/50 shadow-[0_0_30px_rgba(244,63,94,0.4)]'
                : 'border-emerald-400 bg-emerald-950/60 shadow-[0_0_45px_#10b981]'
            }`}
          >
            {/* Inner Iris Ring */}
            <div
              className={`w-16 h-16 rounded-full border border-dashed flex items-center justify-center transition-all duration-500 ${
                isLocked
                  ? isScanning
                    ? 'border-[#ff912d] animate-spin'
                    : 'border-rose-400/60'
                  : 'border-emerald-300 animate-pulse'
              }`}
            >
              {isLocked ? (
                <ShieldAlert
                  size={28}
                  className={
                    isScanning
                      ? 'text-[#ff912d] animate-pulse'
                      : isFailed
                      ? 'text-rose-500 animate-bounce'
                      : 'text-rose-400'
                  }
                />
              ) : (
                <ShieldCheck size={30} className="text-emerald-300 animate-in zoom-in-50" />
              )}
            </div>
          </div>

          {/* Status Capsule */}
          {isScanning && (
            <div className="mt-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-[9px] font-mono text-amber-300 uppercase tracking-widest animate-pulse whitespace-nowrap">
              SCANNING...
            </div>
          )}
          {!isScanning && (isFailed || isSuccess) && (
            <div
              className={`mt-1.5 px-2.5 py-0.5 rounded-full border text-[9px] font-mono uppercase tracking-widest font-bold whitespace-nowrap ${
                isFailed
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                  : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
              }`}
            >
              {isFailed ? 'ACCESS DENIED' : 'AUTHORIZED'}
            </div>
          )}
        </div>

        {/* Right Blast Plate */}
        <div
          className={`w-[48%] h-full bg-[#121927]/90 border border-white/10 rounded-xl p-3.5 flex flex-col justify-between items-end transition-transform duration-700 ease-out shadow-lg pointer-events-none ${
            isLocked ? 'translate-x-0' : 'translate-x-14 opacity-75'
          }`}
        >
          <div className="space-y-2 w-full flex flex-col items-end">
            <div className="h-0.5 w-full bg-white/15 rounded" />
            <div className="h-0.5 w-2/3 bg-white/10 rounded" />
          </div>
        </div>
      </div>

      {/* 4 Interactive Floor Datapads (Lowered so they do not overlap the top console) */}
      <DatapadNode
        id={1}
        label="The Admin"
        isSatisfied={isCheck1Passed}
        xPercent={22}
        yPercent={50}
        onClick={isScanning ? () => {} : onOpenClue}
      />
      <DatapadNode
        id={2}
        label="The Technician"
        isSatisfied={isCheck2Passed}
        xPercent={78}
        yPercent={50}
        onClick={isScanning ? () => {} : onOpenClue}
      />
      <DatapadNode
        id={3}
        label="Security Officer"
        isSatisfied={isCheck3Passed}
        xPercent={22}
        yPercent={72}
        onClick={isScanning ? () => {} : onOpenClue}
      />
      <DatapadNode
        id={4}
        label="The Visitor"
        isSatisfied={isCheck4Passed}
        xPercent={78}
        yPercent={72}
        onClick={isScanning ? () => {} : onOpenClue}
      />

      {/* 4-Slot Holographic Scanner Pedestal (Bottom Center - Compact & Sleek) */}
      <div className="absolute left-1/2 bottom-2 -translate-x-1/2 flex flex-col items-center z-20 w-full max-w-md px-3">
        {/* Holographic Projection Field */}
        <div className="relative w-full py-1.5 flex items-center justify-center">
          {/* Pastel Orange Hologram Column */}
          <div
            className={`absolute bottom-0 inset-x-3 h-20 bg-gradient-to-t from-[#ff912d]/25 via-[#ff912d]/10 to-transparent rounded-t-2xl transition-opacity duration-300 pointer-events-none ${
              isScanning || isSuccess ? 'opacity-100' : 'opacity-35'
            }`}
          />

          {/* 4 Scanner Slots Side by Side (Smaller Cards) */}
          <div className="relative z-20 grid grid-cols-4 gap-1.5 w-full">
            {slotsData.map((slot, idx) => {
              const {
                slotNum,
                roleTitle,
                targetClass,
                Icon,
                hasBadge,
                isPassed,
                hasBlueprint,
                isClearanceOk,
                clearanceText,
                isRoleOk,
                roleText,
                isActionsOk,
                actionsText,
              } = slot;

              const hasValidated = isSuccess || isFailed;
              const isSlotApproved = hasValidated && hasBadge && isPassed && (isSuccess || failedSlot !== slotNum);
              const isSlotFailed = isFailed && (failedSlot === slotNum || !hasBadge || !isPassed);
              const isActive = activeScanSlot === slotNum;

              // Popover positioning logic
              const popoverAlignClass =
                idx === 0
                  ? 'left-0'
                  : idx === 3
                  ? 'right-0'
                  : 'left-1/2 -translate-x-1/2';

              return (
                <div key={slotNum} className="relative">
                  {/* Zoom Inspection Card Popover when this slot is actively scanning */}
                  {isActive && (
                    <div
                      className={`absolute bottom-[calc(100%+12px)] ${popoverAlignClass} w-56 bg-[#0a0f1d]/98 border-2 border-[#ff912d] shadow-[0_0_30px_rgba(255,145,45,0.45)] rounded-xl p-2.5 z-50 animate-in zoom-in-95 duration-200 pointer-events-none text-left backdrop-blur-md`}
                    >
                      {/* Popover Header */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#ff912d] animate-ping" />
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-300">
                            SCANNING {roleTitle}...
                          </span>
                        </div>
                        <span className="text-[8px] font-mono text-gray-400">SLOT {slotNum}/4</span>
                      </div>

                      {/* Detail Inspection Rows glowing green/red based on correctness */}
                      <div className="space-y-1 text-[9px] font-mono">
                        {/* 1. Blueprint */}
                        <div
                          className={`flex items-center justify-between px-2 py-0.5 rounded border transition-all ${
                            hasBlueprint
                              ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                              : 'bg-rose-950/70 border-rose-500/50 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                          }`}
                        >
                          <span className="text-gray-300">Blueprint</span>
                          <span className="font-bold">{hasBlueprint ? targetClass : 'Missing'}</span>
                        </div>

                        {/* 2. Private Clearance Level */}
                        <div
                          className={`flex items-center justify-between px-2 py-0.5 rounded border transition-all ${
                            isClearanceOk
                              ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                              : 'bg-rose-950/70 border-rose-500/50 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                          }`}
                        >
                          <span className="text-gray-300">Private Clearance</span>
                          <span className="font-bold">{clearanceText}</span>
                        </div>

                        {/* 3. Public Role */}
                        <div
                          className={`flex items-center justify-between px-2 py-0.5 rounded border transition-all ${
                            isRoleOk
                              ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                              : 'bg-rose-950/70 border-rose-500/50 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                          }`}
                        >
                          <span className="text-gray-300">Public Role</span>
                          <span className="font-bold">{roleText}</span>
                        </div>

                        {/* 4. Actions */}
                        <div
                          className={`flex items-center justify-between px-2 py-0.5 rounded border transition-all ${
                            isActionsOk
                              ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                              : 'bg-rose-950/70 border-rose-500/50 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                          }`}
                        >
                          <span className="text-gray-300">Actions</span>
                          <span className="font-bold">{actionsText}</span>
                        </div>

                        {/* 5. Physical Print */}
                        <div
                          className={`flex items-center justify-between px-2 py-0.5 rounded border transition-all ${
                            hasBadge
                              ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                              : 'bg-rose-950/70 border-rose-500/50 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                          }`}
                        >
                          <span className="text-gray-300">Badge Print</span>
                          <span className="font-bold">{hasBadge ? 'Printed' : 'Missing'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Smaller Slot Card with Zoom Animation */}
                  <div
                    className={`rounded-lg border px-1.5 py-1.5 flex flex-col items-center justify-center gap-0.5 backdrop-blur-md transition-all duration-300 transform ${
                      isActive
                        ? 'scale-105 -translate-y-1 z-40 border-[#ff912d] bg-[#1a0f2b] text-amber-200 ring-2 ring-[#ff912d] shadow-[0_0_20px_#ff912d]'
                        : isSlotApproved
                        ? 'border-emerald-500/70 bg-[#071810]/90 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : isSlotFailed
                        ? 'border-rose-500 bg-rose-950/90 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse'
                        : isScanning
                        ? 'border-[#ff912d]/60 bg-[#160d24]/90 text-amber-200'
                        : hasBadge
                        ? 'border-[#ff912d]/50 bg-[#120d1c]/80 text-gray-200'
                        : 'border-dashed border-gray-700 bg-black/40 text-gray-500'
                    }`}
                  >
                    <Icon
                      size={13}
                      className={
                        isActive
                          ? 'text-[#ff912d] animate-bounce'
                          : isSlotApproved
                          ? 'text-emerald-400'
                          : isSlotFailed
                          ? 'text-rose-400'
                          : 'text-[#ff912d]'
                      }
                    />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider">
                      {roleTitle}
                    </span>
                    <span className="text-[7px] font-mono opacity-80">
                      {isActive
                        ? 'SCANNING...'
                        : hasBadge
                        ? isSlotApproved
                          ? 'APPROVED'
                          : isSlotFailed
                          ? 'REJECTED'
                          : 'PRESENT'
                        : 'EMPTY SLOT'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Physical Pedestal Base */}
        <div className="w-full h-2 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-full border border-white/20 shadow-md flex items-center justify-center mt-0.5">
          <div className="w-3/4 h-0.5 bg-[#ff912d] rounded-full shadow-[0_0_8px_#ff912d]" />
        </div>
      </div>

      {/* Datapad Clue Modal */}
      {activeClue && <ClueModal id={activeClue} onClose={onCloseClue} />}
    </div>
  );
}
