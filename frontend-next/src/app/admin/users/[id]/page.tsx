import React from 'react';
import { getUserDetails } from '@/app/admin/actions/users';
import UserDetailsClientWrapper from './UserDetailsClientWrapper';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const user = await getUserDetails(resolvedParams.id);
    return <UserDetailsClientWrapper user={user} />;
  } catch (error: any) {
    console.error("Error in AdminUserDetailPage:", error);
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error loading user</h1>
        <p className="text-gray-400 mb-6">{error.message || 'The user you are looking for does not exist or an error occurred.'}</p>
        <Link href="/admin" className="px-6 py-3 bg-[#ff912d] hover:bg-[#ff912d]/90 text-white font-bold rounded-xl flex items-center gap-2 transition-all">
          <ArrowLeft size={18} />
          Back to User Management
        </Link>
      </div>
    );
  }
}
