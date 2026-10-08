import React from 'react';
import { getTeachers } from '@/app/admin/actions/teachers';
import TeachersClient from './TeachersClient';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TeachersPage() {
  const teachers = await getTeachers();

  return (
    <TeachersClient initialTeachers={teachers} />
  );
}
