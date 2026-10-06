"use client";

import dynamic from 'next/dynamic';
import React, { useState, useEffect, Suspense } from 'react';
import SpaceLoader from '@/components/SpaceLoader';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import VisualNovelCutscene, { SceneItem } from '@/components/VisualNovelCutscene';
import moonScenes from '@/data/moon.json';
import marsScenes from '@/data/mars.json';
import venusScenes from '@/data/venus.json';
import mercuryScenes from '@/data/mercury.json';
import saturnScenes from '@/data/saturn.json';
import jupiterScenes from '@/data/jupiter.json';
import earthScenes from '@/data/earth.json';
import epilogueScenes from '@/data/epilogue.json';

import storySummaries from '@/data/story_summaries.json';
import { getUserStorageItem } from '@/lib/userStorage';
import { useRouter } from 'next/navigation';

const BlocklyMaze = dynamic(() => import('@/components/BlocklyMaze'), {
  ssr: false,
  loading: () => <SpaceLoader fullScreen text="loading..." />
});

function SandboxContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const missionId = searchParams?.get('missionId');
  const skipCutscene = searchParams?.get('skipCutscene') === 'true';
  const { data: session } = useSession();
  
  const [showCutscene, setShowCutscene] = useState(false);
  const [cutsceneData, setCutsceneData] = useState<SceneItem[]>([]);
  const [summaryText, setSummaryText] = useState<string | undefined>(undefined);
  const username = session?.user?.name || 'Operator';

  const checkPythonLast = () => {
    try {
      const uid = session?.user && (session.user as any).id;
      const local = (typeof window !== 'undefined' && uid)
        ? JSON.parse(getUserStorageItem('completed_missions', uid) || '[]')
        : [];
      const fallback = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('completed_missions') || '[]')
        : [];
      const allCompleted: string[] = Array.from(new Set([...local, ...fallback]));
      const hasMars = allCompleted.some(m => m.toLowerCase().startsWith('mars') || m.toLowerCase().startsWith('html'));
      const hasVenus = allCompleted.some(m => m.toLowerCase().startsWith('venus') || m.toLowerCase().startsWith('css'));
      const hasMercury = allCompleted.some(m => m.toLowerCase().startsWith('mercury') || m.toLowerCase().startsWith('js') || m.toLowerCase().startsWith('javascript'));
      const hasJupiter = allCompleted.some(m => m.toLowerCase().startsWith('jupiter') || m.toLowerCase().startsWith('java'));
      const hasSaturn = allCompleted.some(m => m.toLowerCase().startsWith('saturn') || m.toLowerCase().startsWith('cpp'));
      return hasMars && hasVenus && hasMercury && hasJupiter && hasSaturn;
    } catch (e) {
      return true;
    }
  };

  useEffect(() => {
    const planets = ['moon', 'mars', 'venus', 'mercury', 'saturn', 'jupiter', 'earth'];
    const isEpilogue = missionId === 'epilogue' || missionId?.startsWith('epilogue-');
    const isStoryMission = isEpilogue || planets.some(p => missionId?.startsWith(`${p}-`));

    if (!skipCutscene && isStoryMission && missionId) {
      // Epilogue cutscene
      if (isEpilogue) {
        setCutsceneData(epilogueScenes as SceneItem[]);
        setShowCutscene(true);
        setSummaryText((storySummaries as any).skip_summary || undefined);
        return;
      }

      const isPythonLast = checkPythonLast();
      const typedScenes = (() => {
        if (missionId.startsWith('mars-')) return marsScenes;
        if (missionId.startsWith('venus-')) return venusScenes;
        if (missionId.startsWith('mercury-')) return mercuryScenes;
        if (missionId.startsWith('saturn-')) return saturnScenes;
        if (missionId.startsWith('jupiter-')) return jupiterScenes;
        if (missionId.startsWith('earth-')) {
          return (earthScenes as any[]).filter(s => {
            if (!s.when) return true;
            if (s.when === 'pythonLast') return isPythonLast;
            if (s.when === '!pythonLast') return !isPythonLast;
            return true;
          });
        }
        return moonScenes;
      })() as SceneItem[];

      let startIndex = 0;
      let targetIndex = -1;
      
      for (let i = 0; i < typedScenes.length; i++) {
        const scene = typedScenes[i];
        if (scene.type === 'mission' && (scene as any).mission === missionId) {
          targetIndex = i;
          break;
        }
      }
      
      if (targetIndex !== -1) {
        for (let i = targetIndex - 1; i >= 0; i--) {
           if (typedScenes[i].type === 'mission') {
             startIndex = i + 1;
             break;
           }
        }
        
        const sliced = typedScenes.slice(startIndex, targetIndex);
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
        if (moduleName === 'earth') {
          const group = isPythonLast ? (storySummaries as any).earth_last : (storySummaries as any).earth_not_last;
          if (group && group[levelNum]) {
            setSummaryText(group[levelNum]);
          }
        } else if ((storySummaries as any)[moduleName] && (storySummaries as any)[moduleName][levelNum]) {
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
        onFinished={() => {
          if (missionId === 'epilogue' || missionId?.startsWith('epilogue-')) {
            router.push('/modules');
          } else {
            setShowCutscene(false);
          }
        }}
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

