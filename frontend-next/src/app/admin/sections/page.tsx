import React from 'react';
import { getSections, getAvailableTeachers } from '@/app/admin/actions/sections';
import { requireAdmin } from '@/app/admin/actions';
import SectionsClient from './SectionsClient';

export default async function SectionsPage() {
  const session = await requireAdmin();
  const role = (session.user as any).role || "SUPER_ADMIN";
  const userId = (session.user as any).id;

  const [sections, availableTeachers] = await Promise.all([
    getSections(),
    getAvailableTeachers()
  ]);

  return (
    <SectionsClient
      initialSections={sections}
      availableTeachers={availableTeachers}
      currentUserRole={role}
      currentUserId={userId}
    />
  );
}
