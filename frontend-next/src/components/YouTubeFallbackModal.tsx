"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Lightbulb, 
  Sparkles, 
  CheckCircle2, 
  PlayCircle,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { 
  getVideoFallbackForMission, 
  EducationalVideoInfo 
} from '@/lib/videoFallbackData';

interface YouTubeFallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionId: string;
  failureCount?: number;
  missionTitle?: string;
  onRetry?: () => void;
}

export function YouTubeFallbackModal({
  isOpen,
  onClose,
  missionId,
  failureCount = 5,
  missionTitle,
  onRetry,
}: YouTubeFallbackModalProps) {
  const [videoData, setVideoData] = useState<EducationalVideoInfo | null>(() => 
    getVideoFallbackForMission(missionId)
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState<boolean>(false);

  // Fetch or update video when modal opens or missionId changes
  useEffect(() => {
    if (!isOpen) {
      setIsVideoLoaded(false);
      return;
    }

    // Initialize immediately with local curated fallback to eliminate any wait time
    const initialFallback = getVideoFallbackForMission(missionId);
    setVideoData(initialFallback);
    setIsVideoLoaded(false);

    // Asynchronously check endpoint (in case YouTube API v3 returns a fresher query result)
    let isCancelled = false;
    const fetchVideo = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/ai/video-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            missionId,
            failureCount,
          }),
        });

        if (res.ok && !isCancelled) {
          const data = await res.json();
          if (data?.video?.embedUrl) {
            setVideoData(data.video);
          }
        }
      } catch (err) {
        // Safe silent fallback: local curated videoData is already set
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchVideo();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, missionId, failureCount]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !videoData) return null;

  const youtubeWatchUrl = `https://www.youtube.com/watch?v=${videoData.youtubeVideoId}`;

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl bg-[#120722] border-2 border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.25)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glowing Header Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-orange-400 to-amber-400" />

        {/* Header Bar */}
        <div className="flex items-start justify-between p-4 sm:p-6 pb-3 border-b border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-inner shrink-0">
              <PlayCircle className="w-6 h-6 fill-red-500 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  {failureCount} Failed Attempts
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {videoData.planet}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white/10 text-gray-300">
                  Concept Intervention
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-bold font-display text-white tracking-wide">
                {videoData.title}
              </h2>
              <p className="text-xs text-gray-300 mt-0.5 line-clamp-1">
                {missionTitle ? `${missionTitle} • ` : ''}Concept: <span className="text-amber-300 font-semibold">{videoData.concept}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-2"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 custom-scrollbar">
          {/* Nova Encouragement Banner */}
          <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-purple-950/40 border border-purple-500/20">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-purple-200 leading-relaxed">
              Nova noticed you&apos;re encountering repeated roadblocks on this challenge. Don&apos;t worry! Take a short breath and watch this visual walkthrough to refresh your understanding of <span className="text-amber-300 font-bold">{videoData.concept}</span>.
            </p>
          </div>

          {/* YouTube Video Player Container */}
          <div className="relative w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black/90 border border-white/10 shadow-2xl">
            {!isVideoLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#180a30] text-gray-400 gap-2">
                <div className="w-10 h-10 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                <span className="text-xs font-mono text-gray-300">Loading concept tutorial...</span>
              </div>
            )}
            <iframe
              src={`${videoData.embedUrl}?rel=0&modestbranding=1`}
              title={videoData.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => setIsVideoLoaded(true)}
            />
          </div>

          {/* Video Description & Concept Takeaways */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Overview Card */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-300 font-mono uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Overview
              </div>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {videoData.description}
              </p>
            </div>

            {/* Key Tips Card */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Key Takeaways
              </div>
              <ul className="space-y-1.5 text-xs text-gray-300">
                {videoData.keyTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 pt-3 border-t border-white/10 bg-black/30 flex flex-wrap items-center justify-between gap-3">
          <a
            href={youtubeWatchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-red-400" />
            Watch on YouTube
          </a>

          <div className="flex items-center gap-2 ml-auto">
            {onRetry && (
              <button
                onClick={() => {
                  onClose();
                  onRetry();
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset & Try Again
              </button>
            )}

            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:via-orange-400 hover:to-amber-400 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-500/25 active:scale-95 cursor-pointer"
            >
              Back to Challenge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
