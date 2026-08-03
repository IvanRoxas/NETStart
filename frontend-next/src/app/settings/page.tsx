"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import TopHeader from '@/components/TopHeader';
import ImageCropModal from '@/components/ImageCropModal';
import { createPortal } from 'react-dom';

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('General');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Cropping State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  // Local Auth State
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditingSecurity, setIsEditingSecurity] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // General settings state
  const [pushNotifs, setPushNotifs] = useState(true);
  const [sounds, setSounds] = useState(true);

  // Notifications settings state
  const [systemAnnouncements, setSystemAnnouncements] = useState(true);
  const [academicAlerts, setAcademicAlerts] = useState(true);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReportSubmitted, setIsReportSubmitted] = useState(false);
  const [reportIssueType, setReportIssueType] = useState('bug');
  const [reportDescription, setReportDescription] = useState('');
  const [reportAttachments, setReportAttachments] = useState<string[]>([]);
  const reportImageInputRef = useRef<HTMLInputElement>(null);


  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    // Load persisted settings
    if (typeof window !== 'undefined') {
      setPushNotifs(localStorage.getItem('setting_pushNotifs') !== 'false');
      setSounds(localStorage.getItem('setting_sounds') !== 'false');
      setSystemAnnouncements(localStorage.getItem('setting_systemAnnouncements') !== 'false');
      setAcademicAlerts(localStorage.getItem('setting_academicAlerts') !== 'false');
    }
  }, []);

  const handleToggle = (key: string, val: boolean, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(val);
    localStorage.setItem(`setting_${key}`, String(val));
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (session?.user) {
      setEmail(session.user.email || '');
      
      // Fetch latest profile from DB to override any stale session cookies
      fetch(`/api/profile?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUsername(data.user.name || session.user?.name || '');
            // Always use the API route because it handles SVG initial generation if image is null
            setAvatarUrl(`/api/profile/avatar?id=${(session.user as any).id}&t=${Date.now()}`);
          }
        })
        .catch(err => {
          setUsername(session?.user?.name || '');
          setAvatarUrl(`/api/profile/avatar?id=${(session.user as any).id}&t=${Date.now()}`);
        });
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.name && !username) {
      setUsername(session.user.name);
    }
  }, [session?.user?.name]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCropImageSrc(event.target.result as string);
          setCropModalOpen(true);
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleCropSave = async (base64String: string) => {
    setAvatarUrl(base64String);
    setCropModalOpen(false);
    
    // Automatically save profile after cropping
    setLoading(true);
    try {
      const payload: any = { image: base64String };
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const nextAuthImageUrl = `/api/profile/avatar?id=${(session?.user as any)?.id}&t=${Date.now()}`;
      await update({ image: nextAuthImageUrl });
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e?: React.FormEvent | React.FocusEvent) => {
    if (e) e.preventDefault();
    if (!username.trim()) return; // Don't save empty usernames
    setLoading(true);
    
    try {
      const payload: any = { name: username };
      if (avatarUrl && avatarUrl.startsWith('data:')) {
        payload.image = avatarUrl;
      }

      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      // Update next-auth session with dynamic URL to avoid cookie size limit
      const nextAuthImageUrl = `/api/profile/avatar?id=${(session?.user as any)?.id}&t=${Date.now()}`;
      await update({ name: username, image: nextAuthImageUrl });
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    if (password && password !== confirmPassword) {
      setMessage({ text: 'New passwords do not match', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/settings/security', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          currentPassword,
          newPassword: password || undefined 
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: 'Security settings updated successfully!', type: 'success' });
        setCurrentPassword('');
        setPassword('');
        setConfirmPassword('');
        setIsEditingSecurity(false);
      } else {
        setMessage({ text: data.error || 'Failed to update settings', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Something went wrong', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteAccount = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteAccount = async () => {
    setIsDeleteModalOpen(false);
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/settings/security', { method: 'DELETE' });
      if (res.ok) {
        setMessage({ text: 'Your account has been deleted.', type: 'success' });
        
        // Clear saved auto-login credentials
        localStorage.removeItem('netstart_remember_email');
        localStorage.removeItem('netstart_remember_password');
        
        // Immediately sign out and redirect to prevent stale session
        await signOut({ redirect: true, callbackUrl: '/login?deleted=true' });
      } else {
        const data = await res.json();
        setMessage({ text: data.error || "Failed to delete account", type: 'error' });
      }
    } catch (e) {
      setMessage({ text: "An error occurred", type: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleReportImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const remainingSlots = 5 - reportAttachments.length;
      
      if (remainingSlots <= 0) {
        e.target.value = '';
        return; // Max 5 attachments
      }
      
      const filesToProcess = newFiles.slice(0, remainingSlots);
      
      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setReportAttachments(prev => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
      
      e.target.value = '';
    }
  };

  const removeReportAttachment = (indexToRemove: number) => {
    setReportAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDescription.trim()) return;
    
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: reportIssueType, 
          description: reportDescription,
          attachments: reportAttachments
        })
      });
      
      setIsReportSubmitted(true);
      setTimeout(() => {
        setIsReportModalOpen(false);
        setIsReportSubmitted(false);
        setReportDescription('');
        setReportIssueType('bug');
        setReportAttachments([]);
      }, 2500);
    } catch (err) {
      console.error('Failed to submit report', err);
    }
  };



  if (status === 'loading') {
    return <div className="h-screen bg-[#1e0a2d] flex items-center justify-center text-white">Loading...</div>;
  }

  const tabs = ['General', 'Account', 'Help & Support'];

  const Toggle = ({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) => (
    <div 
      onClick={() => onChange(!checked)}
      className={`w-10 h-6 shrink-0 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ease-in-out ${checked ? 'bg-[#ff912d]' : 'bg-white/10'}`}
    >
      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${checked ? 'translate-x-4' : 'translate-x-0'}`}></div>
    </div>
  );

  const SettingItem = ({ title, description, control }: { title: string, description: string, control: React.ReactNode }) => (
    <div className="flex items-center justify-between py-5 border-b border-white/5">
      <div>
        <h3 className="text-white font-medium text-[15px]">{title}</h3>
        <p className="text-white/50 text-[13px] mt-1">{description}</p>
      </div>
      <div className="pl-4">
        {control}
      </div>
    </div>
  );

  return (
    <>
      <main className="flex-1 flex flex-col z-10 w-full h-full overflow-hidden relative">
        <TopHeader title="Settings" />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto w-full flex flex-col items-start pl-8 lg:pl-16 pr-12 lg:pr-48 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          <div className="w-full max-w-[1000px] pt-12">
            {/* Tabs */}
            <div className="flex gap-8 border-b border-white/10">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 font-medium text-sm transition-colors relative cursor-pointer ${activeTab === tab ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff912d] rounded-t-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full max-w-[1000px] py-8">
            {activeTab === 'General' && (
              <div className="flex flex-col">
                <h2 className="font-display text-2xl font-bold text-[#ff912d] mb-4 mt-2">Preferences</h2>
                <SettingItem 
                  title="Sound Effects"
                  description="Play sounds for interactions and incoming messages."
                  control={<Toggle checked={sounds} onChange={(v) => handleToggle('sounds', v, setSounds)} />}
                />
                
                <h2 className="font-display text-2xl font-bold text-[#ff912d] mb-4 mt-8">Notifications</h2>
                <SettingItem 
                  title="Push Notifications"
                  description="Receive browser alerts when a module is completed or when your code runs successfully."
                  control={<Toggle checked={pushNotifs} onChange={(v) => handleToggle('pushNotifs', v, setPushNotifs)} />}
                />
                <SettingItem 
                  title="System Announcements"
                  description="Receive emails regarding platform updates, maintenance, or downtime."
                  control={<Toggle checked={systemAnnouncements} onChange={(v) => handleToggle('systemAnnouncements', v, setSystemAnnouncements)} />}
                />
                <SettingItem 
                  title="Academic Alerts"
                  description="Get notified when a new coding module is unlocked or assigned."
                  control={<Toggle checked={academicAlerts} onChange={(v) => handleToggle('academicAlerts', v, setAcademicAlerts)} />}
                />
              </div>
            )}

            {activeTab === 'Help & Support' && (
              <div className="flex flex-col">
                <h2 className="font-display text-2xl font-bold text-[#ff912d] mb-4 mt-2">Help & Support</h2>
                <div className="flex items-center justify-between py-5 border-b border-white/5">
                  <div>
                    <h3 className="text-white font-medium text-[15px]">Tell us how we can help you!</h3>
                    <p className="text-white/50 text-[13px] mt-1">Let us know so we can fix it as soon as possible.</p>
                  </div>
                  <div className="pl-4">
                    <button 
                      onClick={() => setIsReportModalOpen(true)}
                      className="bg-white/10 hover:bg-white/20 text-white font-medium text-sm py-2 px-6 rounded-full transition-colors cursor-pointer"
                    >
                      File a Report
                    </button>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'Account' && (
              <div className="flex flex-col gap-10">
                <div>
                  <h2 className="font-display text-2xl font-bold text-[#ff912d] mb-6">Account Details</h2>
                  
                  {/* Crop Modal */}
                  <ImageCropModal
                    isOpen={cropModalOpen}
                    onClose={() => setCropModalOpen(false)}
                    imageSrc={cropImageSrc}
                    aspect={1}
                    title="Crop your Avatar"
                    onSave={handleCropSave}
                  />

                  <form onSubmit={handleProfileUpdate} className="flex flex-col gap-8">
                    {/* Avatar Component */}
                    <div className="flex items-end gap-6">
                      <div className="relative">
                        <div className="w-24 h-24 bg-[#2a133d] rounded-full flex items-center justify-center overflow-hidden">
                          {avatarUrl ? (
                            <Image src={avatarUrl} alt="Profile Picture" width={96} height={96} className="object-cover w-full h-full" />
                          ) : (
                            <Image src="/Profile.svg" alt="Default Profile" width={96} height={96} className="object-cover w-full h-full" />
                          )}
                        </div>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleAvatarChange} 
                          accept="image/*" 
                          className="hidden" 
                        />
                        <button 
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 bg-[#ff912d] w-7 h-7 rounded-full flex items-center justify-center text-white border-2 border-[#1e0a2d] hover:bg-orange-500 transition-colors cursor-pointer"
                          title="Edit Profile Picture"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-white/70 text-sm font-medium">Profile Picture</p>
                        <p className="text-white/40 text-xs mt-1">JPG, GIF or PNG. Max size of 800K</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 max-w-md">
                      <label className="text-white/70 text-[13px] font-medium">Username</label>
                      <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onBlur={handleProfileUpdate}
                        className="w-full bg-[#2a133d] text-white px-4 py-2.5 rounded-lg border border-gray-700 outline-none focus:ring-1 focus:ring-[#ff912d] transition-colors text-sm"
                        required
                      />
                    </div>



                    {message.text && !isEditingSecurity && (
                      <div className={`px-4 py-3 rounded-lg font-medium text-sm max-w-md ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {message.text}
                      </div>
                    )}

                    <div className="pt-2">
                      <button 
                        type="submit"
                        disabled={loading}
                        className="bg-[#ff912d] text-white font-bold text-sm py-2.5 px-6 rounded-lg hover:bg-orange-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="pt-8 border-t border-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-2xl font-bold text-[#ff912d]">Account Security</h2>
                    {!isEditingSecurity ? (
                      <button 
                        type="button" 
                        onClick={() => setIsEditingSecurity(true)}
                        className="text-sm font-medium text-[#ff912d] hover:text-orange-400 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        Edit Credentials
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        onClick={() => setIsEditingSecurity(false)}
                        className="text-sm font-medium text-white/50 hover:text-white transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  
                  <form onSubmit={handleSecurityUpdate} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2 max-w-md">
                      <label className="text-white/70 text-[13px] font-medium">Email Address</label>
                      {!isEditingSecurity ? (
                        <div className="w-full bg-white/5 text-white/50 px-4 py-2.5 rounded-lg border border-white/5 text-sm cursor-not-allowed">
                          {email || 'Loading...'}
                        </div>
                      ) : (
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[#2a133d] text-white px-4 py-2.5 rounded-lg border border-gray-700 outline-none focus:ring-1 focus:ring-[#ff912d] transition-colors text-sm"
                          required
                        />
                      )}
                    </div>

                    {!isEditingSecurity ? (
                      <div className="flex flex-col gap-2 max-w-md">
                        <label className="text-white/70 text-[13px] font-medium">Password</label>
                        <div className="w-full bg-white/5 text-white/50 px-4 py-2.5 rounded-lg border border-white/5 text-sm cursor-not-allowed">
                          ••••••••••••
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col gap-2 max-w-md">
                          <label className="text-white/70 text-[13px] font-medium">Current Password</label>
                          <input 
                            type="password" 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full bg-[#2a133d] text-white px-4 py-2.5 rounded-lg border border-gray-700 outline-none focus:ring-1 focus:ring-[#ff912d] transition-colors text-sm"
                            placeholder="••••••••"
                            required
                          />
                          <p className="text-white/40 text-xs">Enter your current password to authorize security changes.</p>
                        </div>

                        <div className="flex flex-col gap-2 max-w-md">
                          <label className="text-white/70 text-[13px] font-medium">New Password</label>
                          <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#2a133d] text-white px-4 py-2.5 rounded-lg border border-gray-700 outline-none focus:ring-1 focus:ring-[#ff912d] transition-colors text-sm"
                            placeholder="••••••••"
                            minLength={8}
                          />
                          <p className="text-white/40 text-xs">Must be at least 8 characters. Leave blank to keep your current password.</p>
                        </div>

                        <div className="flex flex-col gap-2 max-w-md">
                          <label className="text-white/70 text-[13px] font-medium">Confirm Password</label>
                          <input 
                            type="password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-[#2a133d] text-white px-4 py-2.5 rounded-lg border border-gray-700 outline-none focus:ring-1 focus:ring-[#ff912d] transition-colors text-sm"
                            placeholder="••••••••"
                            minLength={8}
                          />
                        </div>
                      </>
                    )}

                    {isEditingSecurity && message.text && (
                      <div className={`px-4 py-3 rounded-lg font-medium text-sm max-w-md ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {message.text}
                      </div>
                    )}

                    {isEditingSecurity && (
                      <div className="pt-2">
                        <button 
                          type="submit"
                          disabled={loading}
                          className="bg-[#ff912d] text-white font-bold text-sm py-2.5 px-6 rounded-lg hover:bg-orange-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </form>
                </div>

                {!isEditingSecurity && (
                  <div className="pt-8 border-t border-white/5">
                    <h2 className="font-display text-2xl font-bold text-[#ff912d] mb-4">Account Deletion</h2>
                    <div className="flex flex-col gap-4 max-w-2xl">
                      <p className="text-white/60 text-sm">Once you delete your account, there is no going back. All your progress, missions, and data will be permanently wiped.</p>
                      <button 
                        onClick={confirmDeleteAccount}
                        disabled={deleteLoading}
                        className="self-start bg-red-500 hover:bg-red-600 text-white font-bold text-sm py-2.5 px-6 rounded-lg transition-colors cursor-pointer shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleteLoading ? 'Deleting...' : 'Delete Account'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Report Issue Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#1e0a2d] border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-4xl shadow-2xl relative transition-all duration-300">

            {isReportSubmitted ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="font-display text-2xl font-bold text-white mb-3">Report submitted!</h2>
                <p className="text-white/60 text-sm text-center">Your report has been sent to the admin successfully. Thank you for your feedback!</p>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl font-bold text-white mb-2">Report an Issue</h2>
                <p className="text-white/50 text-sm mb-6">Please provide details about the problem you are experiencing.</p>
                
                <form onSubmit={handleReportSubmit} className="flex flex-col space-y-6">
                  <div className="w-full flex flex-col space-y-2">
                    <label className="text-white/80 text-[13px] font-medium">Issue Type</label>
                    <select 
                      value={reportIssueType}
                      onChange={(e) => setReportIssueType(e.target.value)}
                      className="w-full bg-white/5 text-white px-4 py-3 rounded-lg border border-white/10 outline-none focus:border-[#ff912d]/50 transition-colors text-sm appearance-none cursor-pointer"
                      style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '0.65em auto' }}
                    >
                      <option value="bug" className="bg-[#1e0a2d]">General Bug</option>
                      <option value="blockly" className="bg-[#1e0a2d]">Broken Blockly Component</option>
                      <option value="page_error" className="bg-[#1e0a2d]">Page Loading Error</option>
                      <option value="other" className="bg-[#1e0a2d]">Other</option>
                    </select>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-stretch w-full">
                    {/* Description Section (Left) */}
                    <div className="w-full flex-1 flex flex-col space-y-2">
                      <label className="text-white/80 text-[13px] font-medium">Description</label>
                      <textarea 
                        value={reportDescription}
                        onChange={(e) => setReportDescription(e.target.value)}
                        placeholder="Describe the issue here..."
                        required
                        className="w-full h-full min-h-[140px] resize-none rounded-md bg-[#1a082c] border border-gray-700 p-3 text-white placeholder-gray-500 focus:border-[#ff912d] focus:ring-1 focus:ring-[#ff912d]"
                      ></textarea>
                    </div>

                    {/* Attachments Section (Right) */}
                    <div className="w-full md:w-[320px] flex flex-col space-y-2">
                      <div className="flex justify-between items-center w-full">
                        <span className="text-white/80 text-[13px] font-medium">Attachments</span>
                        <span className="text-gray-500 text-sm">{reportAttachments.length}/5 attachments</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 items-start h-full">
                        {reportAttachments.map((src, idx) => (
                          <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-600 bg-black/40 group">
                            <Image src={src} alt={`Attachment ${idx + 1}`} width={96} height={96} className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                              <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeReportAttachment(idx); }}
                                className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                                title="Remove attachment"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        {reportAttachments.length < 5 && (
                          <div className="flex flex-col items-center gap-2">
                            <button
                              type="button"
                              onClick={() => reportImageInputRef.current?.click()}
                              className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg hover:border-[#ff912d] cursor-pointer text-gray-500 hover:text-[#ff912d] transition-colors"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                              <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">Add Image</span>
                            </button>
                          </div>
                        )}
                        <input 
                          type="file"
                          multiple
                          ref={reportImageInputRef}
                          onChange={handleReportImageChange}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
                    <button 
                      type="button"
                      onClick={() => setIsReportModalOpen(false)}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white font-medium text-sm py-2.5 rounded-full transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 bg-[#ff912d] hover:bg-orange-500 text-white font-bold text-sm py-2.5 rounded-full transition-colors shadow-lg shadow-[#ff912d]/20 cursor-pointer"
                    >
                      Submit Report
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      
      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#1e0a2d] border border-red-500/20 rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative transition-all duration-300">
            <h2 className="font-display text-2xl font-bold text-red-500 mb-2">Delete Account</h2>
            <p className="text-white/60 text-sm mb-6">Are you ABSOLUTELY sure you want to delete your account? This action cannot be undone and you will lose all your progress.</p>
            
            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
              <button 
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-medium text-sm py-2.5 rounded-full transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold text-sm py-2.5 rounded-full transition-colors shadow-lg shadow-red-500/20 cursor-pointer"
              >
                Yes, Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && typeof document !== 'undefined' && createPortal(
        <div className="fixed top-24 right-8 z-[9999] animate-slide-in">
          <div className="bg-[#00D26A] text-black px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 font-bold border border-black/10">
            <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-[15px]">Profile updated!</span>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
