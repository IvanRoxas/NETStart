import React from 'react';
import { getUsers } from './actions';
import AdminClientWrapper from './AdminClientWrapper';

export default async function AdminPage() {
  const users = await getUsers();
  
  return (
    <AdminClientWrapper initialUsers={users} />
  );
}
