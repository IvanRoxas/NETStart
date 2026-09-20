"use client";

import dynamic from 'next/dynamic';
import React, { useState, useEffect, Suspense } from 'react';
import SpaceLoader from '@/components/SpaceLoader';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import VisualNovelCutscene, { SceneItem } from '@/components/VisualNovelCutscene';
import moonScenes from '@/data/moon.json';

import storySummaries from '@/data/story_summaries.json';

const BlocklyMaze = dynamic(() => import('@/components/BlocklyMaze'), {
  ssr: false,
  loading: () => <SpaceLoader fullScreen text="loading..." />
});

function SandboxContent() {
  const searchParams = useSearchParams();
  const missionId = searchParams?.get('missionId');
  const skipCutscene = searchParams?.get('skipCutscene') === 'true';
  const { data: session } = useSession();
  
  const [showCutscene, setShowCutscene] = useState(false);
  const [cutsceneData, setCutsceneData] = useState<SceneItem[]>([]);
  const [summaryText, setSummaryText] = useState<string | undefined>(undefined);
  const username = session?.user?.name || 'Operator';

  useEffect(() => {
    if (!skipCutscene && missionId?.startsWith('moon-')) {
      const typedMoonScenes = moonScenes as SceneItem[];
      let startIndex = 0;
      let targetIndex = -1;
      
      for (let i = 0; i < typedMoonScenes.length; i++) {
        const scene = typedMoonScenes[i];
        if (scene.type === 'mission' && (scene as any).mission === missionId) {
          targetIndex = i;
          break;
        }
      }
      
      if (targetIndex !== -1) {
        for (let i = targetIndex - 1; i >= 0; i--) {
           if (typedMoonScenes[i].type === 'mission') {
             startIndex = i + 1;
             break;
           }
        }
        
        const sliced = typedMoonScenes.slice(startIndex, targetIndex);
        if (sliced.length > 0) {
          setCutsceneData(sliced);
          setShowCutscene(true);
        }
      }
      
      // Look up specific story summary if available
      try {
        const parts = missionId.split('-');
        const moduleName = parts[0];
        const levelNum = parts[1];
        if ((storySummaries as any)[moduleName] && (storySummaries as any)[moduleName][levelNum]) {
          setSummaryText((storySummaries as any)[moduleName][levelNum]);
        }
      } catch(e) {}
    }
  }, [missionId, skipCutscene]);

  if (showCutscene) {
    return (
      <VisualNovelCutscene
        scenes={cutsceneData}
        username={username}
        summaryText={summaryText}
        onFinished={() => setShowCutscene(false)}
      />
    );
  }

  return <BlocklyMaze />;
}

export default function SandboxPage() {
  return (
    <div className="w-full h-full bg-[#0d0418] overflow-hidden relative flex flex-col">
      <Suspense fallback={<SpaceLoader fullScreen text="loading..." />}>
        <SandboxContent />
      </Suspense>
    </div>
  );
}
