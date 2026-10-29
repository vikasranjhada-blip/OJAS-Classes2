import React, { useState } from 'react';
import { Batch, Teacher, Student } from '../../types';
import { storage } from '../../services/storage';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import {
  Layers,
  Plus,
  Search,
  Calendar,
  Clock,
  Users,
  Archive,
  RotateCcw,
  Edit2,
  Trash2,
  User,
  GraduationCap,
} from 'lucide-react';

export const BatchesPage: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>(() => storage.getBatches());
  const teachers = storage.getTeachers();
  const students = storage.getStudents();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Ongoing' | 'Upcoming' | 'Completed' | 'Archived'>('All');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [viewingBatchStudents, setViewingBatchStudents] = useState<Batch | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    targetExam: 'UPPCL Assistant Accountant 2026',
    teacherId: teachers[0]?.id || '',
    startDate: '2026-05-01',
    endDate: '2026-11-30',
    timing: '07:30 AM - 10:00 AM (Mon-Sat)',
    capacity: 250,
    mode: 'Online Live' as 'Online Live' | 'Hybrid' | 'Recorded',
    classroomName: 'Virtual Room Kautilya (YouTube Live)',
    status: 'Ongoing' as 'Upcoming' | 'Ongoing' | 'Completed' | 'Archived',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const reloadData = () => {
    setBatches(storage.getBatches());
  };

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.targetExam.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCreateModal = () => {
    const nextCode = `BATCH-UPPCL-${String(batches.length + 1).padStart(2, '0')}`;
    setFormData({
      code: nextCode,
      name: '',
      targetExam: 'UPPCL Assistant Accountant 2026',
      teacherId: teachers[0]?.id || '',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '2026-11-30',
      timing: '07:30 AM - 10:00 AM (Mon-Sat)',
      capacity: 250,
      mode: 'Online Live',
      classroomName: 'Virtual Room Kautilya (YouTube Live)',
      status: 'Ongoing',
    });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const openEditModal = (batch: Batch) => {
    setEditingBatch(batch);
    setFormData({
      code: batch.code,
      name: batch.name,
      targetExam: batch.targetExam,
      teacherId: batch.teacherId,
      startDate: batch.startDate,
      endDate: batch.endDate,
      timing: batch.timing,
      capacity: batch.capacity,
      mode: batch.mode,
      classroomName: batch.classroomName,
      status: batch.status,
    });
    setFormErrors({});
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Batch name is required';
    if (!formData.code.trim()) errs.code = 'Batch code is required';
    if (!formData.timing.trim()) errs.timing = 'Timings are required';
    if (!formData.teacherId) errs.teacherId = 'Assigned faculty is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const teacher = teachers.find((t) => t.id === formData.teacherId);
    const teacherName = teacher ? teacher.name : 'Unassigned';

    if (editingBatch) {
      const updated: Batch = {
        ...editingBatch,
        code: formData.code,
        name: formData.name,
        targetExam: formData.targetExam,
        teacherId: formData.teacherId,
        teacherName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        timing: formData.timing,
        capacity: Number(formData.capacity),
        mode: formData.mode,
        classroomName: formData.classroomName,
        status: formData.status,
      };
      storage.saveBatch(updated);
      setEditingBatch(null);
    } else {
      const newBatch: Batch = {
        id: `btc-${Date.now()}`,
        code: formData.code,
        name: formData.name,
        targetExam: formData.targetExam,
        teacherId: formData.teacherId,
        teacherName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        timing: formData.timing,
        capacity: Number(formData.capacity),
        enrolledStudentIds: [],
        status: formData.status,
        mode: formData.mode,
        classroomName: formData.classroomName,
      };
      storage.saveBatch(newBatch);
      setIsCreateModalOpen(false);
    }
    reloadData();
  };

  const handleArchive = (id: string) => {
    storage.archiveBatch(id);
    reloadData();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete batch "${name}" permanently?`)) {
      storage.deleteBatch(id);
      reloadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Batches & Cohorts</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize student cohorts, allocate lead educators, manage seat caps, and archive past batches
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Batch</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search batches by name, code, exam..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center p-1 bg-slate-100 rounded-lg w-full md:w-auto overflow-x-auto">
          {(['All', 'Ongoing', 'Upcoming', 'Completed', 'Archived'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Batches Grid */}
      {filteredBatches.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No Batches Found"
          description="No batches match your filter criteria. Try changing the status filter or search query."
          actionLabel="Create Batch"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBatches.map((batch) => {
            const enrolled = batch.enrolledStudentIds.length;
            const pct = Math.min(100, Math.round((enrolled / batch.capacity) * 100));

            return (
              <div
                key={batch.id}
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Status & Code */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-slate-400 font-semibold">
                      {batch.code}
                    </span>
                    <Badge
                      variant={
                        batch.status === 'Ongoing'
                          ? 'success'
                          : batch.status === 'Upcoming'
                          ? 'info'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {batch.status}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 mt-2 leading-snug">
                    {batch.name}
                  </h3>
                  <div className="text-xs text-blue-600 font-medium mt-0.5">
                    {batch.targetExam}
                  </div>

                  {/* Lead Educator */}
                  <div className="mt-4 p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <div>
                        <div className="font-semibold text-slate-900">{batch.teacherName}</div>
                        <div className="text-[10px] text-slate-500">{batch.classroomName}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {batch.mode}
                    </span>
                  </div>

                  {/* Schedule Details */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-[11px]">{batch.timing}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-[11px]">
                        {batch.startDate} to {batch.endDate}
                      </span>
                    </div>
                  </div>

                  {/* Enrollment Capacity Gauge */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Enrolled Students</span>
                      </span>
                      <span className="font-mono text-slate-800 font-semibold tabular-nums">
                        {enrolled} / {batch.capacity} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          pct >= 90 ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setViewingBatchStudents(batch)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>View Roster ({enrolled})</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(batch)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      title="Edit Batch"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {batch.status !== 'Archived' ? (
                      <button
                        onClick={() => handleArchive(batch.id)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                        title="Archive Batch"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDelete(batch.id, batch.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete Batch Permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Enrolled Students Modal */}
      {viewingBatchStudents && (
        <Modal
          isOpen={true}
          onClose={() => setViewingBatchStudents(null)}
          title={`Enrolled Students: ${viewingBatchStudents.name}`}
          subtitle={`Batch Code: ${viewingBatchStudents.code} · ${viewingBatchStudents.timing}`}
          maxWidth="2xl"
          footer={
            <button
              onClick={() => setViewingBatchStudents(null)}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Done
            </button>
          }
        >
          <div className="space-y-4">
            {viewingBatchStudents.enrolledStudentIds.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No students currently assigned to this batch. You can assign students from the Student Directory.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {viewingBatchStudents.enrolledStudentIds.map((stdId) => {
                  const s = students.find((x) => x.id === stdId);
                  if (!s) return null;
                  return (
                    <div
                      key={s.id}
                      className="py-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full ${s.avatarBg} text-white flex items-center justify-center font-bold text-[11px]`}
                        >
                          {s.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{s.name}</div>
                          <div className="text-[11px] font-mono text-slate-500">{s.rollNo}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-slate-600">Att: {s.attendancePct}%</span>
                        <Badge variant="success" size="sm">
                          {s.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Create / Edit Batch Modal */}
      {(isCreateModalOpen || editingBatch) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingBatch(null);
          }}
          title={editingBatch ? `Edit Batch: ${editingBatch.name}` : 'Create New Batch'}
          subtitle="Configure cohort academic calendar, instructor allocation, and classroom settings"
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingBatch(null);
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
                {editingBatch ? 'Save Batch' : 'Create Batch'}
              </button>
            </div>
          }
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Batch Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Arjuna JEE Advanced 2026 (Batch Bravo)"
                  className={`w-full px-3 py-2 border rounded-lg ${
                    formErrors.name ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Batch Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. JEE-ADV-2026-B"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Exam</label>
                <select
                  value={formData.targetExam}
                  onChange={(e) => setFormData({ ...formData, targetExam: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="UPPCL Assistant Accountant 2026">UPPCL Assistant Accountant 2026</option>
                  <option value="UPSSSC Auditor & Assistant Accountant">UPSSSC Auditor & Assistant Accountant</option>
                  <option value="SSC CGL / CHSL (Govt Exam)">SSC CGL / CHSL (Govt. Exam)</option>
                  <option value="UP Police SI & Constable">UP Police SI & Constable</option>
                  <option value="Railway RRB NTPC">Railway RRB NTPC</option>
                  <option value="General Govt. Exams">General Govt. Exams</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Lead Educator <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Batch Mode</label>
                <select
                  value={formData.mode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mode: e.target.value as 'Online Live' | 'Hybrid' | 'Recorded',
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Online Live">Online Live</option>
                  <option value="Hybrid">Hybrid (Online + Kota Classroom)</option>
                  <option value="Recorded">Recorded Masterclass</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Weekly Schedule & Timing <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.timing}
                  onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                  placeholder="08:00 AM - 11:30 AM (Mon-Fri)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Maximum Seat Capacity
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Virtual Hall / Classroom Name
                </label>
                <input
                  type="text"
                  value={formData.classroomName}
                  onChange={(e) => setFormData({ ...formData, classroomName: e.target.value })}
                  placeholder="Virtual Hall Ramanujan / Hall 204"
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
