import React from 'react';
import { getTeachers } from '@/app/admin/actions/teachers';
import TeachersClient from './TeachersClient';

export default async function TeachersPage() {
  const teachers = await getTeachers();

  return (
    <TeachersClient initialTeachers={teachers} />
  );
}
