import React, { useState } from 'react';
import { Teacher, Batch } from '../../types';
import { storage } from '../../services/storage';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Award,
  BookOpen,
  Edit2,
  Trash2,
  Star,
  CheckCircle2,
} from 'lucide-react';

export const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>(() => storage.getTeachers());
  const [batches] = useState<Batch[]>(() => storage.getBatches());
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    email: '',
    phone: '',
    subject: 'Accountancy & Auditing',
    qualification: '',
    experienceYears: 10,
    bio: '',
    status: 'Active' as 'Active' | 'On Leave',
    rating: 4.9,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const reloadData = () => {
    setTeachers(storage.getTeachers());
  };

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === 'All' || t.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  const subjects = ['All', ...Array.from(new Set(teachers.map((t) => t.subject)))];

  const openAddModal = () => {
    const nextEmp = `FAC-${formData.subject.slice(0, 3).toUpperCase()}-${teachers.length + 105}`;
    setFormData({
      name: '',
      employeeId: nextEmp,
      email: '',
      phone: '',
      subject: 'Physics',
      qualification: 'M.Sc / M.Tech / Ph.D',
      experienceYears: 10,
      bio: '',
      status: 'Active',
      rating: 4.8,
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const openEditModal = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData({
      name: t.name,
      employeeId: t.employeeId,
      email: t.email,
      phone: t.phone,
      subject: t.subject,
      qualification: t.qualification,
      experienceYears: t.experienceYears,
      bio: t.bio,
      status: t.status,
      rating: t.rating,
    });
    setFormErrors({});
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.employeeId.trim()) errs.employeeId = 'Employee ID is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Valid email required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingTeacher) {
      const updated: Teacher = {
        ...editingTeacher,
        name: formData.name,
        employeeId: formData.employeeId,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        qualification: formData.qualification,
        experienceYears: Number(formData.experienceYears),
        bio: formData.bio,
        status: formData.status,
        rating: Number(formData.rating),
      };
      storage.saveTeacher(updated);
      setEditingTeacher(null);
    } else {
      const newTch: Teacher = {
        id: `tch-${Date.now()}`,
        name: formData.name,
        employeeId: formData.employeeId,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        qualification: formData.qualification,
        experienceYears: Number(formData.experienceYears),
        bio: formData.bio,
        assignedBatchIds: [],
        status: formData.status,
        rating: Number(formData.rating),
        avatarBg: 'bg-indigo-600',
      };
      storage.saveTeacher(newTch);
      setIsAddModalOpen(false);
    }
    reloadData();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remove faculty member "${name}"?`)) {
      storage.deleteTeacher(id);
      reloadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Faculty & Educators</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage subject-matter experts, senior mentors, and assigned batch schedules
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search faculty by name, employee ID, subject..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 whitespace-nowrap">Filter Subject:</span>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Subjects' : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Teachers Grid */}
      {filteredTeachers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Faculty Found"
          description="No teachers match your search filters. Try resetting the query."
          actionLabel="Add Faculty"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeachers.map((teacher) => {
            const assignedBatches = batches.filter((b) => teacher.assignedBatchIds.includes(b.id));
            return (
              <div
                key={teacher.id}
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top card row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl ${teacher.avatarBg} text-white flex items-center justify-center font-bold text-base shrink-0`}
                      >
                        {teacher.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">
                          {teacher.name}
                        </h3>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {teacher.employeeId}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={teacher.status === 'Active' ? 'success' : 'neutral'}
                      size="sm"
                    >
                      {teacher.status}
                    </Badge>
                  </div>

                  {/* Subject & Experience */}
                  <div className="mt-3.5 flex items-center gap-2 text-xs">
                    <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {teacher.subject}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600 font-medium font-mono">
                      {teacher.experienceYears} yrs experience
                    </span>
                  </div>

                  {/* Qualification */}
                  <p className="mt-2 text-xs text-slate-600 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">{teacher.qualification}</span>
                  </p>

                  {/* Bio */}
                  <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {teacher.bio}
                  </p>

                  {/* Assigned Batches */}
                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Assigned Cohorts</span>
                      <span className="font-mono text-slate-400">
                        {assignedBatches.length} batches
                      </span>
                    </div>
                    <div className="space-y-1">
                      {assignedBatches.length === 0 ? (
                        <div className="text-[11px] text-slate-400 italic">
                          No active cohorts assigned currently
                        </div>
                      ) : (
                        assignedBatches.map((b) => (
                          <div
                            key={b.id}
                            className="p-1.5 bg-slate-50 rounded border border-slate-200 text-[11px] flex items-center justify-between"
                          >
                            <span className="font-medium text-slate-800 truncate mr-2">
                              {b.name}
                            </span>
                            <span className="font-mono text-slate-500 shrink-0">
                              {b.timing.split(' ')[0]}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-semibold font-mono">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{teacher.rating} / 5.0</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(teacher)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      title="Edit Faculty Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(teacher.id, teacher.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Remove Faculty"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Faculty Modal */}
      {(isAddModalOpen || editingTeacher) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingTeacher(null);
          }}
          title={editingTeacher ? `Edit Faculty: ${editingTeacher.name}` : 'Add Faculty Member'}
          subtitle="Configure teacher profile, qualifications, and academic specialization"
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingTeacher(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
              >
                {editingTeacher ? 'Save Changes' : 'Add Teacher'}
              </button>
            </div>
          }
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Anurag Verma"
                  className={`w-full px-3 py-2 border rounded-lg ${
                    formErrors.name ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-rose-500 mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Employee ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  placeholder="FAC-PHY-105"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Accountancy & Auditing">Accountancy & Auditing</option>
                  <option value="Income Tax & GST">Income Tax & GST</option>
                  <option value="Computer Knowledge & IT">Computer Knowledge & IT (CCC / O-Level)</option>
                  <option value="General Hindi">General Hindi (Samanya Hindi)</option>
                  <option value="Quantitative Aptitude & Reasoning">Quantitative Aptitude & Reasoning</option>
                  <option value="General Studies (GS/GK)">General Studies (GS/GK)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={formData.experienceYears}
                  onChange={(e) =>
                    setFormData({ ...formData, experienceYears: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="faculty@myacademy.edu.in"
                  className={`w-full px-3 py-2 border rounded-lg ${
                    formErrors.email ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98112 34567"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Highest Degree & Qualifications
                </label>
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="e.g. Ph.D IIT Delhi, B.Tech IIT Kharagpur (15 yrs exp)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Biography & Credentials</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Summary of teaching pedagogy, past rankers mentored, and areas of research."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
