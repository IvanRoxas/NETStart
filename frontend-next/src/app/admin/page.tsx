import React from 'react';
import { getUsers, requireAdmin } from './actions';
import { getSections } from './actions/sections';
import AdminClientWrapper from './AdminClientWrapper';

export default async function AdminPage() {
  const session = await requireAdmin();
  const role = (session.user as any).role || "SUPER_ADMIN";

  const [users, sections] = await Promise.all([
    getUsers(),
    getSections()
  ]);
  
  return (
    <AdminClientWrapper 
      initialUsers={users} 
      sections={sections}
      currentUserRole={role}
    />
  );
}
