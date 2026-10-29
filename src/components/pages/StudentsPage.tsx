import React, { useState, useMemo } from 'react';
import { Student, Batch, Course } from '../../types';
import { storage } from '../../services/storage';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import {
  Search,
  Plus,
  Download,
  Filter,
  Eye,
  Edit2,
  Trash2,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Check,
  User,
  BookOpen,
} from 'lucide-react';

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(() => storage.getStudents());
  const batches = useMemo(() => storage.getBatches(), []);
  const courses = useMemo(() => storage.getCourses(), []);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Completed'>('All');
  const [examFilter, setExamFilter] = useState<string>('All');

  // Modals state
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    email: '',
    phone: '',
    guardianName: '',
    guardianPhone: '',
    city: '',
    state: '',
    targetExam: 'UPPCL Assistant Accountant 2026',
    status: 'Active' as 'Active' | 'Inactive' | 'Completed',
    enrolledBatchId: '',
    enrolledCourseId: '',
    attendancePct: 90,
    testAveragePct: 80,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const reloadData = () => {
    setStudents(storage.getStudents());
  };

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery);

      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      const matchesExam = examFilter === 'All' || s.targetExam === examFilter;

      return matchesSearch && matchesStatus && matchesExam;
    });
  }, [students, searchQuery, statusFilter, examFilter]);

  // Unique exams for filter dropdown
  const examOptions = useMemo(() => {
    const set = new Set(students.map((s) => s.targetExam));
    return ['All', ...Array.from(set)];
  }, [students]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Roll No',
      'Name',
      'Email',
      'Phone',
      'Target Exam',
      'Status',
      'Attendance %',
      'Test Avg %',
      'Joined Date',
      'City',
    ];
    const rows = filteredStudents.map((s) => [
      `"${s.rollNo}"`,
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.phone}"`,
      `"${s.targetExam}"`,
      `"${s.status}"`,
      `"${s.attendancePct}"`,
      `"${s.testAveragePct}"`,
      `"${s.joinedDate}"`,
      `"${s.city}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `My_Academy_Students_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openAddModal = () => {
    const nextRoll = `MA-2026-${String(students.length + 143).padStart(4, '0')}`;
    setFormData({
      name: '',
      rollNo: nextRoll,
      email: '',
      phone: '',
      guardianName: '',
      guardianPhone: '',
      city: '',
      state: 'Rajasthan',
      targetExam: 'IIT-JEE (Advanced)',
      status: 'Active',
      enrolledBatchId: batches[0]?.id || '',
      enrolledCourseId: courses[0]?.id || '',
      attendancePct: 92,
      testAveragePct: 82,
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      rollNo: student.rollNo,
      email: student.email,
      phone: student.phone,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      city: student.city,
      state: student.state,
      targetExam: student.targetExam,
      status: student.status,
      enrolledBatchId: student.enrolledBatchIds[0] || '',
      enrolledCourseId: student.enrolledCourseIds[0] || '',
      attendancePct: student.attendancePct,
      testAveragePct: student.testAveragePct,
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.rollNo.trim()) errors.rollNo = 'Roll Number is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errors.email = 'Valid email required';
    if (!formData.phone.trim() || formData.phone.length < 10) errors.phone = 'Valid phone number required';
    if (!formData.guardianName.trim()) errors.guardianName = 'Guardian name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingStudent) {
      const updated: Student = {
        ...editingStudent,
        name: formData.name,
        rollNo: formData.rollNo,
        email: formData.email,
        phone: formData.phone,
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone,
        city: formData.city,
        state: formData.state,
        targetExam: formData.targetExam,
        status: formData.status,
        enrolledBatchIds: formData.enrolledBatchId ? [formData.enrolledBatchId] : editingStudent.enrolledBatchIds,
        enrolledCourseIds: formData.enrolledCourseId ? [formData.enrolledCourseId] : editingStudent.enrolledCourseIds,
        attendancePct: Number(formData.attendancePct),
        testAveragePct: Number(formData.testAveragePct),
      };
      storage.saveStudent(updated);
      setEditingStudent(null);
    } else {
      const newStudent: Student = {
        id: `std-${Date.now()}`,
        name: formData.name,
        rollNo: formData.rollNo,
        email: formData.email,
        phone: formData.phone,
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone,
        city: formData.city || 'Kota',
        state: formData.state || 'Rajasthan',
        targetExam: formData.targetExam,
        status: formData.status,
        enrolledBatchIds: formData.enrolledBatchId ? [formData.enrolledBatchId] : [],
        enrolledCourseIds: formData.enrolledCourseId ? [formData.enrolledCourseId] : [],
        attendancePct: Number(formData.attendancePct),
        testAveragePct: Number(formData.testAveragePct),
        joinedDate: new Date().toISOString().slice(0, 10),
        avatarBg: 'bg-blue-600',
      };
      storage.saveStudent(newStudent);
      setIsAddModalOpen(false);
    }
    reloadData();
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove student "${name}"?`)) {
      storage.deleteStudent(id);
      reloadData();
      if (viewingStudent?.id === id) setViewingStudent(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Student Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student registrations, academic standing, and batch enrollments
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Admit New Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, roll no, email..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        {/* Status Segmented Tabs */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg shrink-0">
            {(['All', 'Active', 'Inactive', 'Completed'] as const).map((tab) => (
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

          {/* Exam Filter */}
          <select
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium shrink-0 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            {examOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt === 'All' ? 'All Target Exams' : opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No Students Found"
          description={
            searchQuery || statusFilter !== 'All' || examFilter !== 'All'
              ? 'No student matches your current search criteria or status filter. Try clearing filters.'
              : 'Start by admitting your first student to the academy.'
          }
          actionLabel="Admit New Student"
          onAction={openAddModal}
          secondaryActionLabel={
            searchQuery || statusFilter !== 'All' || examFilter !== 'All'
              ? 'Clear Filters'
              : undefined
          }
          onSecondaryAction={() => {
            setSearchQuery('');
            setStatusFilter('All');
            setExamFilter('All');
          }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Student & Roll No</th>
                  <th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4">Target Exam & Batch</th>
                  <th className="py-3 px-4 text-center">Attendance</th>
                  <th className="py-3 px-4 text-center">Test Avg</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const studentBatch = batches.find((b) => student.enrolledBatchIds.includes(b.id));
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full ${student.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0`}
                          >
                            {student.name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {student.name}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500">
                              {student.rollNo}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-700">{student.email}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {student.phone}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{student.targetExam}</div>
                        <div className="text-[11px] text-slate-500">
                          {studentBatch ? studentBatch.name : 'No batch assigned'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums">
                        <span
                          className={`font-semibold ${
                            student.attendancePct >= 90
                              ? 'text-emerald-600'
                              : student.attendancePct >= 75
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {student.attendancePct}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums">
                        <span className="font-semibold text-slate-800">
                          {student.testAveragePct}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={
                            student.status === 'Active'
                              ? 'success'
                              : student.status === 'Inactive'
                              ? 'neutral'
                              : 'info'
                          }
                          size="sm"
                        >
                          {student.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingStudent(student)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="View Student Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(student)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            title="Edit Student"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id, student.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Showing {filteredStudents.length} of {students.length} students</span>
            <span>Tabular metrics recorded in real-time</span>
          </div>
        </div>
      )}

      {/* View Student Profile Modal */}
      {viewingStudent && (
        <Modal
          isOpen={true}
          onClose={() => setViewingStudent(null)}
          title={viewingStudent.name}
          subtitle={`Roll No: ${viewingStudent.rollNo} · ${viewingStudent.targetExam}`}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => {
                  const s = viewingStudent;
                  setViewingStudent(null);
                  openEditModal(s);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => setViewingStudent(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Top Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl ${viewingStudent.avatarBg} text-white flex items-center justify-center font-bold text-lg`}
                >
                  {viewingStudent.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">{viewingStudent.name}</h4>
                  <p className="text-xs text-slate-500">
                    Enrolled on {viewingStudent.joinedDate} · {viewingStudent.city}, {viewingStudent.state}
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  viewingStudent.status === 'Active'
                    ? 'success'
                    : viewingStudent.status === 'Inactive'
                    ? 'neutral'
                    : 'info'
                }
              >
                {viewingStudent.status}
              </Badge>
            </div>

            {/* Academic KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Attendance Rate
                </span>
                <div className="text-xl font-bold text-emerald-600 font-mono mt-0.5">
                  {viewingStudent.attendancePct}%
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Test Score Average
                </span>
                <div className="text-xl font-bold text-blue-600 font-mono mt-0.5">
                  {viewingStudent.testAveragePct}%
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-center col-span-2 sm:col-span-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Target Program
                </span>
                <div className="text-sm font-bold text-slate-900 mt-1 truncate">
                  {viewingStudent.targetExam}
                </div>
              </div>
            </div>

            {/* Contact & Guardian Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Student Contact</span>
                </div>
                <div className="text-slate-600 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{viewingStudent.email}</span>
                </div>
                <div className="text-slate-600 flex items-center gap-2 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{viewingStudent.phone}</span>
                </div>
                <div className="text-slate-600 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{viewingStudent.city}, {viewingStudent.state}</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  <span>Parent / Guardian</span>
                </div>
                <div className="text-slate-700 font-medium">{viewingStudent.guardianName}</div>
                <div className="text-slate-600 flex items-center gap-2 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{viewingStudent.guardianPhone}</span>
                </div>
              </div>
            </div>

            {/* Enrolled Batches & Courses */}
            <div className="space-y-2 text-xs">
              <h5 className="font-semibold text-slate-900">Assigned Cohorts & Courses</h5>
              <div className="space-y-1.5">
                {viewingStudent.enrolledBatchIds.map((batchId) => {
                  const b = batches.find((x) => x.id === batchId);
                  return (
                    <div
                      key={batchId}
                      className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-900">{b ? b.name : batchId}</span>
                        <div className="text-[11px] text-slate-500">
                          {b ? `${b.timing} · Lead: ${b.teacherName}` : ''}
                        </div>
                      </div>
                      <Badge variant="info" size="sm">
                        Batch
                      </Badge>
                    </div>
                  );
                })}
                {viewingStudent.enrolledCourseIds.map((courseId) => {
                  const c = courses.find((x) => x.id === courseId);
                  return (
                    <div
                      key={courseId}
                      className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-600" />
                        <span className="font-medium text-slate-900">{c ? c.title : courseId}</span>
                      </div>
                      <Badge variant="neutral" size="sm">
                        Course Pack
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Student Modal */}
      {(isAddModalOpen || editingStudent) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingStudent(null);
          }}
          title={editingStudent ? `Edit Student: ${editingStudent.name}` : 'Admit New Student'}
          subtitle="All fields marked with * are required. Student will receive credentials via SMS & Email."
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStudent(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStudent}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
              >
                {editingStudent ? 'Save Changes' : 'Complete Admission'}
              </button>
            </div>
          }
        >
          <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Aarav Singhania"
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
                  Roll Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  placeholder="e.g. MA-2026-0150"
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
                  placeholder="student@example.com"
                  className={`w-full px-3 py-2 border rounded-lg ${
                    formErrors.email ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200'
                  }`}
                />
                {formErrors.email && (
                  <p className="text-[11px] text-rose-500 mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mobile Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className={`w-full px-3 py-2 border rounded-lg font-mono ${
                    formErrors.phone ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200'
                  }`}
                />
                {formErrors.phone && (
                  <p className="text-[11px] text-rose-500 mt-1">{formErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Parent / Guardian Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.guardianName}
                  onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                  placeholder="Guardian's name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Guardian Phone Number
                </label>
                <input
                  type="text"
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                  placeholder="+91 98765 43219"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Kota / Jaipur"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
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
                  <option value="SSC CGL / CHSL (Govt Exam)">SSC CGL / CHSL (Govt Exam)</option>
                  <option value="UP Police SI & Constable">UP Police SI & Constable</option>
                  <option value="Railway RRB NTPC">Railway RRB NTPC</option>
                  <option value="General Govt. Exams">General Govt. Exams</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign to Batch</label>
                <select
                  value={formData.enrolledBatchId}
                  onChange={(e) => setFormData({ ...formData, enrolledBatchId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="">No Batch Assigned Yet</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'Active' | 'Inactive' | 'Completed',
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
