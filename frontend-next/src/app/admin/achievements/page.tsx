import React from 'react';
import { getAchievements } from '@/app/admin/actions/achievements';
import AchievementClientWrapper from './AchievementClientWrapper';

export default async function AdminAchievementsPage() {
  const initialItems = await getAchievements();

  return <AchievementClientWrapper initialItems={initialItems} />;
}
