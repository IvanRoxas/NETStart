"use client";

import React, { useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Users, 
  Archive, 
  RefreshCw, 
  Search, 
  X, 
  CheckCircle, 
  AlertTriangle,
  UserX,
  BookOpen,
  Pencil,
  Brain
} from 'lucide-react';
import { createSection, updateSection, archiveSection, getSectionRoster } from '@/app/admin/actions/sections';
import { removeStudentFromSection, toggleUserVerification, adminSetAptitudeStatus } from '@/app/admin/actions';
import AdminToast from '@/components/AdminToast';
import ConfirmModal from '@/components/ConfirmModal';

interface TeacherInfo {
  id: string;
  username: string;
  displayName: string | null;
  role?: string;
}

interface SectionItem {
  id: string;
  name: string;
  gradeLevel: number;
  strand: string;
  schoolYear: string;
  isArchived: boolean;
  createdAt: Date | string;
  teacherId: string;
  teacher: TeacherInfo;
  _count: {
    students: number;
  };
}

interface StudentRosterItem {
  id: string;
  email: string;
  displayName: string | null;
  xp: number;
  gears: number;
  isVerified: boolean;
  isBanned: boolean;
  hasTakenAptitudeTest: boolean;
}

export default function SectionsClient({
  initialSections,
  availableTeachers,
  currentUserRole,
  currentUserId
}: {
  initialSections: SectionItem[];
  availableTeachers: TeacherInfo[];
  currentUserRole: string;
  currentUserId: string;
}) {
  const [sections, setSections] = useState<SectionItem[]>(initialSections);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<'ALL' | '11' | '12'>('ALL');
  const [strandFilter, setStrandFilter] = useState<string>('ALL');
  const [archiveFilter, setArchiveFilter] = useState<'ACTIVE' | 'ARCHIVED' | 'ALL'>('ACTIVE');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Create Section Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createGrade, setCreateGrade] = useState<number>(11);
  const [createStrand, setCreateStrand] = useState('STEM');
  const [createSchoolYear, setCreateSchoolYear] = useState('2026-2027');
  const [createTeacherId, setCreateTeacherId] = useState<string>(currentUserId);
  const [isCreating, setIsCreating] = useState(false);

  // Edit Section Modal
  const [editTargetSection, setEditTargetSection] = useState<SectionItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editGrade, setEditGrade] = useState<number>(11);
  const [editStrand, setEditStrand] = useState('STEM');
  const [editSchoolYear, setEditSchoolYear] = useState('2026-2027');
  const [editTeacherId, setEditTeacherId] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  // Roster Modal
  const [rosterSection, setRosterSection] = useState<SectionItem | null>(null);
  const [rosterStudents, setRosterStudents] = useState<StudentRosterItem[]>([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);

  // Remove from Section Confirm
  const [removeStudentTarget, setRemoveStudentTarget] = useState<StudentRosterItem | null>(null);
  const [isRemovingStudent, setIsRemovingStudent] = useState(false);

  // Archive Section Confirm
  const [archiveTarget, setArchiveTarget] = useState<SectionItem | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const isSuperAdmin = currentUserRole === 'SUPER_ADMIN';

  const filteredSections = sections.filter(sec => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = sec.name.toLowerCase().includes(q) ||
                          sec.strand.toLowerCase().includes(q) ||
                          (sec.teacher?.displayName?.toLowerCase() || '').includes(q) ||
                          (sec.teacher?.username?.toLowerCase() || '').includes(q);

    let matchesGrade = true;
    if (gradeFilter === '11') matchesGrade = sec.gradeLevel === 11;
    if (gradeFilter === '12') matchesGrade = sec.gradeLevel === 12;

    let matchesStrand = true;
    if (strandFilter !== 'ALL') matchesStrand = sec.strand.toUpperCase() === strandFilter;

    let matchesArchive = true;
    if (archiveFilter === 'ACTIVE') matchesArchive = !sec.isArchived;
    if (archiveFilter === 'ARCHIVED') matchesArchive = sec.isArchived;

    return matchesSearch && matchesGrade && matchesStrand && matchesArchive;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) {
      setToast({ message: "Please provide a section name.", type: 'error' });
      return;
    }

    try {
      setIsCreating(true);
      const res = await createSection({
        name: createName,
        gradeLevel: createGrade,
        strand: createStrand,
        schoolYear: createSchoolYear,
        teacherId: isSuperAdmin ? createTeacherId : currentUserId
      });

      const assignedTeacher = availableTeachers.find(t => t.id === (isSuperAdmin ? createTeacherId : currentUserId));

      setSections(prev => [
        {
          id: res.section.id,
          name: res.section.name,
          gradeLevel: res.section.gradeLevel,
          strand: res.section.strand,
          schoolYear: res.section.schoolYear,
          isArchived: false,
          createdAt: new Date().toISOString(),
          teacherId: res.section.teacherId,
          teacher: {
            id: res.section.teacherId,
            username: assignedTeacher?.username || 'Teacher',
            displayName: assignedTeacher?.displayName || assignedTeacher?.username || 'Teacher'
          },
          _count: { students: 0 }
        },
        ...prev
      ]);

      setToast({ message: `Section "${createName}" created successfully.`, type: 'success' });
      setIsCreateOpen(false);
      setCreateName('');
    } catch (err: any) {
      setToast({ message: err.message || "Failed to create section.", type: 'error' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEdit = (sec: SectionItem) => {
    setEditTargetSection(sec);
    setEditName(sec.name);
    setEditGrade(sec.gradeLevel);
    setEditStrand(sec.strand);
    setEditSchoolYear(sec.schoolYear);
    setEditTeacherId(sec.teacherId || currentUserId);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTargetSection) return;
    try {
      setIsEditing(true);
      const res = await updateSection(editTargetSection.id, {
        name: editName,
        gradeLevel: editGrade,
        strand: editStrand,
        schoolYear: editSchoolYear,
        ...(isSuperAdmin ? { teacherId: editTeacherId } : {})
      });

      setSections(prev => prev.map(s => s.id === editTargetSection.id ? { ...s, ...res.section } : s));
      if (rosterSection && rosterSection.id === editTargetSection.id) {
        setRosterSection(prev => prev ? { ...prev, ...res.section } : null);
      }
      setToast({ message: `Section "${editName}" updated successfully.`, type: 'success' });
      setEditTargetSection(null);
    } catch (err: any) {
      setToast({ message: err.message || "Failed to update section.", type: 'error' });
    } finally {
      setIsEditing(false);
    }
  };

  const handleToggleVerificationInRoster = async (student: StudentRosterItem) => {
    try {
      const res = await toggleUserVerification(student.id, !student.isVerified);
      setRosterStudents(prev => prev.map(s => s.id === student.id ? { ...s, isVerified: res.isVerified } : s));
      setToast({ message: `Student ${res.isVerified ? 'verified' : 'unverified'} successfully.`, type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || "Failed to update verification status.", type: 'error' });
    }
  };

  const handleToggleAptitudeInRoster = async (student: StudentRosterItem) => {
    try {
      const target = !student.hasTakenAptitudeTest;
      await adminSetAptitudeStatus(student.id, target);
      setRosterStudents(prev => prev.map(s => s.id === student.id ? { ...s, hasTakenAptitudeTest: target } : s));
      setToast({ message: `Aptitude requirement ${target ? 'waived / marked completed' : 'reset / marked required'}.`, type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || "Failed to update aptitude status.", type: 'error' });
    }
  };

  const handleOpenRoster = async (section: SectionItem) => {
    setRosterSection(section);
    setIsLoadingRoster(true);
    try {
      const data = await getSectionRoster(section.id);
      setRosterStudents(data.students as StudentRosterItem[]);
    } catch (err: any) {
      setToast({ message: err.message || "Failed to load section roster.", type: 'error' });
    } finally {
      setIsLoadingRoster(false);
    }
  };

  const handleConfirmRemoveStudent = async () => {
    if (!removeStudentTarget || !rosterSection) return;
    try {
      setIsRemovingStudent(true);
      await removeStudentFromSection(removeStudentTarget.id);

      setRosterStudents(prev => prev.filter(s => s.id !== removeStudentTarget.id));
      setSections(prev => prev.map(sec => 
        sec.id === rosterSection.id 
          ? { ...sec, _count: { students: Math.max(0, sec._count.students - 1) } }
          : sec
      ));

      setToast({ 
        message: `${removeStudentTarget.displayName || removeStudentTarget.email} removed from section.`, 
        type: 'success' 
      });
      setRemoveStudentTarget(null);
    } catch (err: any) {
      setToast({ message: err.message || "Failed to remove student from section.", type: 'error' });
    } finally {
      setIsRemovingStudent(false);
    }
  };

  const handleConfirmArchive = async () => {
    if (!archiveTarget) return;
    try {
      setIsArchiving(true);
      await archiveSection(archiveTarget.id, archiveTarget.isArchived);

      setSections(prev => prev.map(sec => 
        sec.id === archiveTarget.id 
          ? { ...sec, isArchived: !archiveTarget.isArchived } 
          : sec
      ));

      setToast({ 
        message: `Section "${archiveTarget.name}" ${archiveTarget.isArchived ? 'restored' : 'archived'} successfully.`, 
        type: 'success' 
      });
      setArchiveTarget(null);
    } catch (err: any) {
      setToast({ message: err.message || "Failed to archive section.", type: 'error' });
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 relative">
      {toast && <AdminToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#1e0a2d] p-6 rounded-2xl border border-white/5 shadow-lg gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <GraduationCap className="text-[#ff912d]" size={26} />
            <h2 className="text-2xl font-bold text-white">
              {isSuperAdmin ? "Senior High Sections" : "My Assigned Sections"}
            </h2>
          </div>
          <p className="text-sm text-gray-400">
            {isSuperAdmin
              ? "Oversee school sections, assign class teachers, and view student rosters."
              : "View student rosters and manage students assigned to your sections."}
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#ff912d] hover:bg-[#ff912d]/90 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-[#ff912d]/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={18} />
          Create Section
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-[#1e0a2d] p-4 rounded-xl border border-white/5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search section name or strand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-black/20 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff912d]"
          />
        </div>

        {/* Grade Filter */}
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value as any)}
          className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ff912d] cursor-pointer"
        >
          <option value="ALL" className="bg-[#1e0a2d]">All Grades</option>
          <option value="11" className="bg-[#1e0a2d]">Grade 11</option>
          <option value="12" className="bg-[#1e0a2d]">Grade 12</option>
        </select>

        {/* Strand Filter */}
        <select
          value={strandFilter}
          onChange={(e) => setStrandFilter(e.target.value)}
          className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ff912d] cursor-pointer"
        >
          <option value="ALL" className="bg-[#1e0a2d]">All Strands</option>
          <option value="STEM" className="bg-[#1e0a2d]">STEM</option>
          <option value="ICT" className="bg-[#1e0a2d]">ICT</option>
          <option value="ABM" className="bg-[#1e0a2d]">ABM</option>
          <option value="HUMSS" className="bg-[#1e0a2d]">HUMSS</option>
          <option value="TVL" className="bg-[#1e0a2d]">TVL</option>
          <option value="GAS" className="bg-[#1e0a2d]">GAS</option>
        </select>

        {/* Archive Filter */}
        <select
          value={archiveFilter}
          onChange={(e) => setArchiveFilter(e.target.value as any)}
          className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ff912d] cursor-pointer"
        >
          <option value="ACTIVE" className="bg-[#1e0a2d]">Active Sections</option>
          <option value="ARCHIVED" className="bg-[#1e0a2d]">Archived</option>
          <option value="ALL" className="bg-[#1e0a2d]">All Statuses</option>
        </select>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSections.length === 0 ? (
          <div className="col-span-full bg-[#1e0a2d] p-12 rounded-2xl border border-white/5 text-center text-gray-400">
            No sections found matching your filters.
          </div>
        ) : (
          filteredSections.map((sec) => (
            <div
              key={sec.id}
              className={`bg-[#1e0a2d] rounded-2xl border p-5 flex flex-col justify-between transition-all hover:border-[#ff912d]/40 shadow-lg ${
                sec.isArchived ? 'border-white/5 opacity-60' : 'border-white/10'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-wide">{sec.name}</h3>
                    <p className="text-xs text-gray-400 font-medium">SY {sec.schoolYear}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#ff912d]/10 text-[#ff912d] border border-[#ff912d]/20">
                    Grade {sec.gradeLevel} • {sec.strand}
                  </span>
                </div>

                <div className="flex flex-col gap-2 my-4 pt-3 border-t border-white/5 text-xs text-gray-300">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Adviser:</span>
                    <span className="font-semibold text-white">
                      {sec.teacher?.displayName || sec.teacher?.username || "Unassigned"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Enrolled Students:</span>
                    <span className="font-semibold text-[#ff912d] text-sm">
                      {sec._count?.students ?? 0} students
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/5">
                <button
                  onClick={() => handleOpenRoster(sec)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white/5 hover:bg-[#ff912d]/10 text-white hover:text-[#ff912d] font-semibold text-xs rounded-xl transition-all border border-white/10 hover:border-[#ff912d]/30 cursor-pointer"
                >
                  <Users size={14} />
                  View Roster
                </button>
                <button
                  onClick={() => handleOpenEdit(sec)}
                  title="Edit Section Name & Details"
                  className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setArchiveTarget(sec)}
                  title={sec.isArchived ? "Restore Section" : "Archive Section"}
                  className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                >
                  <Archive size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Section Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1e0a2d] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="text-[#ff912d]" size={20} />
                Create Section
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Section Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. 12-Einstein or STEM-A"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff912d]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Grade Level
                  </label>
                  <select
                    value={createGrade}
                    onChange={(e) => setCreateGrade(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff912d] cursor-pointer"
                  >
                    <option value={11} className="bg-[#1e0a2d]">Grade 11</option>
                    <option value={12} className="bg-[#1e0a2d]">Grade 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Strand
                  </label>
                  <select
                    value={createStrand}
                    onChange={(e) => setCreateStrand(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff912d] cursor-pointer"
                  >
                    <option value="STEM" className="bg-[#1e0a2d]">STEM</option>
                    <option value="ICT" className="bg-[#1e0a2d]">ICT</option>
                    <option value="ABM" className="bg-[#1e0a2d]">ABM</option>
                    <option value="HUMSS" className="bg-[#1e0a2d]">HUMSS</option>
                    <option value="TVL" className="bg-[#1e0a2d]">TVL</option>
                    <option value="GAS" className="bg-[#1e0a2d]">GAS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  School Year
                </label>
                <input
                  type="text"
                  placeholder="2026-2027"
                  value={createSchoolYear}
                  onChange={(e) => setCreateSchoolYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff912d]"
                  required
                />
              </div>

              {isSuperAdmin && availableTeachers.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Assign Teacher / Adviser
                  </label>
                  <select
                    value={createTeacherId}
                    onChange={(e) => setCreateTeacherId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff912d] cursor-pointer"
                  >
                    {availableTeachers.map(t => (
                      <option key={t.id} value={t.id} className="bg-[#1e0a2d]">
                        {t.displayName || t.username} ({t.username})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 text-sm font-bold bg-[#ff912d] hover:bg-[#ff912d]/90 text-white rounded-xl transition-all shadow-lg shadow-[#ff912d]/20 disabled:opacity-50 cursor-pointer"
                >
                  {isCreating ? "Creating..." : "Create Section"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Roster Modal */}
      {rosterSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1e0a2d] border border-white/10 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="text-[#ff912d]" size={20} />
                    Section Roster: {rosterSection.name}
                  </h3>
                  <button
                    onClick={() => handleOpenEdit(rosterSection)}
                    title="Rename Section / Edit Roster Name"
                    className="p-1 bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Grade {rosterSection.gradeLevel} • {rosterSection.strand} • {rosterStudents.length} Students
                </p>
              </div>
              <button
                onClick={() => setRosterSection(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {isLoadingRoster ? (
                <div className="py-12 text-center text-gray-400">Loading student roster...</div>
              ) : rosterStudents.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  No students assigned to this section yet.
                  <p className="text-xs text-gray-500 mt-1">
                    Assign students from the User Management page.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3">XP</th>
                      <th className="py-2.5 px-3">Gears</th>
                      <th className="py-2.5 px-3">Verification</th>
                      <th className="py-2.5 px-3">Aptitude Test</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {rosterStudents.map(student => (
                      <tr key={student.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">
                              {student.displayName || "Anonymous"}
                            </span>
                            <span className="text-xs text-gray-400">{student.email}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-gray-300 font-mono text-xs">{student.xp}</td>
                        <td className="py-3 px-3 text-[#ff912d] font-mono text-xs">{student.gears}</td>
                        <td className="py-3 px-3">
                          <button
                            type="button"
                            onClick={() => handleToggleVerificationInRoster(student)}
                            title={student.isVerified ? "Click to revoke verification" : "Click to verify student"}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                              student.isVerified 
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            }`}
                          >
                            {student.isVerified ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                            {student.isVerified ? 'Verified' : 'Unverified'}
                          </button>
                        </td>
                        <td className="py-3 px-3">
                          <button
                            type="button"
                            onClick={() => handleToggleAptitudeInRoster(student)}
                            title={student.hasTakenAptitudeTest ? "Click to require aptitude test" : "Click to waive aptitude test"}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                              student.hasTakenAptitudeTest 
                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' 
                                : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                            }`}
                          >
                            <Brain size={10} />
                            {student.hasTakenAptitudeTest ? 'Completed' : 'Pending'}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleVerificationInRoster(student)}
                              title={student.isVerified ? "Revoke Verification" : "Verify Student"}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                student.isVerified ? 'bg-green-500/10 text-green-400 hover:bg-red-500/20 hover:text-red-400' : 'bg-red-500/10 text-red-400 hover:bg-green-500/20 hover:text-green-400'
                              }`}
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleAptitudeInRoster(student)}
                              title={student.hasTakenAptitudeTest ? "Require Aptitude Test" : "Waive Aptitude Test"}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                student.hasTakenAptitudeTest ? 'bg-emerald-500/10 text-emerald-400 hover:bg-amber-500/20 hover:text-amber-400' : 'bg-amber-500/10 text-amber-400 hover:bg-emerald-500/20 hover:text-emerald-400'
                              }`}
                            >
                              <Brain size={14} />
                            </button>
                            <button
                              onClick={() => setRemoveStudentTarget(student)}
                              title="Remove from Section"
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer"
                            >
                              <UserX size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setRosterSection(null)}
                className="px-4 py-2 text-sm font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Student Confirm */}
      <ConfirmModal
        isOpen={!!removeStudentTarget}
        title="Remove Student from Section"
        message={`Are you sure you want to remove ${removeStudentTarget?.displayName || removeStudentTarget?.email} from section "${rosterSection?.name}"? The student will become unassigned.`}
        confirmLabel="Remove Student"
        variant="warning"
        loading={isRemovingStudent}
        onConfirm={handleConfirmRemoveStudent}
        onCancel={() => setRemoveStudentTarget(null)}
      />

      {/* Edit Section Modal */}
      {editTargetSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1e0a2d] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2">
                <Pencil className="text-[#ff912d]" size={20} />
                <h3 className="text-lg font-bold text-white">Edit Section / Roster</h3>
              </div>
              <button 
                onClick={() => setEditTargetSection(null)} 
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Section / Roster Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Section Andromeda"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff912d]/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Grade Level
                  </label>
                  <select
                    value={editGrade}
                    onChange={e => setEditGrade(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#140620] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff912d]/50 cursor-pointer"
                  >
                    <option value={11}>Grade 11</option>
                    <option value={12}>Grade 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Strand
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STEM"
                    value={editStrand}
                    onChange={e => setEditStrand(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff912d]/50 uppercase transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  School Year
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026-2027"
                  value={editSchoolYear}
                  onChange={e => setEditSchoolYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff912d]/50 transition-colors"
                />
              </div>

              {isSuperAdmin && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Assigned Teacher
                  </label>
                  <select
                    value={editTeacherId}
                    onChange={e => setEditTeacherId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#140620] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#ff912d]/50 cursor-pointer"
                  >
                    {availableTeachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.displayName || t.username} ({t.username})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditTargetSection(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#ff912d] hover:bg-[#ff912d]/90 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {isEditing ? <RefreshCw className="animate-spin" size={16} /> : null}
                  {isEditing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive Section Confirm */}
      <ConfirmModal
        isOpen={!!archiveTarget}
        title={archiveTarget?.isArchived ? "Restore Section" : "Archive Section"}
        message={
          archiveTarget?.isArchived
            ? `Are you sure you want to unarchive "${archiveTarget?.name}"? It will become active again.`
            : `Are you sure you want to archive "${archiveTarget?.name}"? Archived sections are hidden by default from active views.`
        }
        confirmLabel={archiveTarget?.isArchived ? "Restore" : "Archive"}
        variant={archiveTarget?.isArchived ? "primary" : "warning"}
        loading={isArchiving}
        onConfirm={handleConfirmArchive}
        onCancel={() => setArchiveTarget(null)}
      />
    </div>
  );
}
