import React from 'react';
import { requireSuperAdmin } from '@/app/admin/actions';
import AptitudeManagement from '@/app/admin/AptitudeManagement';

export const dynamic = "force-dynamic";

export default async function AdminAptitudePage() {
  await requireSuperAdmin();

  return <AptitudeManagement />;
}
