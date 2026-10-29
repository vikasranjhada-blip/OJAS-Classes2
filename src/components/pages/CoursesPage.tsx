import React, { useState } from 'react';
import { Course, PageId } from '../../types';
import { storage } from '../../services/storage';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import {
  BookOpen,
  Plus,
  Search,
  IndianRupee,
  FolderTree,
  Edit2,
  Trash2,
  Users,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface CoursesPageProps {
  onNavigateToContent: (courseId: string) => void;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({ onNavigateToContent }) => {
  const [courses, setCourses] = useState<Course[]>(() => storage.getCourses());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Published' | 'Draft'>('All');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    category: 'UPPCL Accountant',
    targetExam: 'UPPCL Assistant Accountant 2026',
    description: '',
    price: 3499,
    mrp: 6999,
    status: 'Published' as 'Published' | 'Draft',
    language: 'Hinglish' as 'Hinglish' | 'English' | 'Hindi',
    durationWeeks: 24,
    thumbnailGradient: 'from-blue-600 to-indigo-800',
    isFeatured: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const reloadData = () => {
    setCourses(storage.getCourses());
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCreateModal = () => {
    const nextCode = `CRS-UPPCL-${String(courses.length + 1).padStart(2, '0')}`;
    setFormData({
      title: '',
      code: nextCode,
      category: 'UPPCL Accountant',
      targetExam: 'UPPCL Assistant Accountant 2026',
      description: '',
      price: 3499,
      mrp: 6999,
      status: 'Published',
      language: 'Hinglish',
      durationWeeks: 24,
      thumbnailGradient: 'from-blue-600 to-indigo-800',
      isFeatured: true,
    });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const openEditModal = (c: Course) => {
    setEditingCourse(c);
    setFormData({
      title: c.title,
      code: c.code,
      category: c.category,
      targetExam: c.targetExam,
      description: c.description,
      price: c.price,
      mrp: c.mrp,
      status: c.status,
      language: c.language,
      durationWeeks: c.durationWeeks,
      thumbnailGradient: c.thumbnailGradient,
      isFeatured: c.isFeatured,
    });
    setFormErrors({});
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.title.trim()) errs.title = 'Course title is required';
    if (!formData.code.trim()) errs.code = 'Course code is required';
    if (formData.price < 0) errs.price = 'Price must be positive';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingCourse) {
      const updated: Course = {
        ...editingCourse,
        title: formData.title,
        code: formData.code,
        category: formData.category,
        targetExam: formData.targetExam,
        description: formData.description,
        price: Number(formData.price),
        mrp: Number(formData.mrp),
        status: formData.status,
        language: formData.language,
        durationWeeks: Number(formData.durationWeeks),
        thumbnailGradient: formData.thumbnailGradient,
        isFeatured: formData.isFeatured,
      };
      storage.saveCourse(updated);
      setEditingCourse(null);
    } else {
      const newCourse: Course = {
        id: `crs-${Date.now()}`,
        title: formData.title,
        code: formData.code,
        category: formData.category,
        targetExam: formData.targetExam,
        description: formData.description,
        price: Number(formData.price),
        mrp: Number(formData.mrp),
        status: formData.status,
        language: formData.language,
        durationWeeks: Number(formData.durationWeeks),
        thumbnailGradient: formData.thumbnailGradient,
        isFeatured: formData.isFeatured,
        enrolledCount: 0,
        sectionsCount: 0,
        lessonsCount: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      storage.saveCourse(newCourse);
      setIsCreateModalOpen(false);
    }
    reloadData();
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete course "${title}"? All section outlines will be removed.`)) {
      storage.deleteCourse(id);
      reloadData();
    }
  };

  const togglePublishStatus = (course: Course) => {
    const nextStatus = course.status === 'Published' ? 'Draft' : 'Published';
    storage.saveCourse({ ...course, status: nextStatus });
    reloadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Courses & Curriculum</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage comprehensive academic packages, pricing, discounts, and section structures
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Course</span>
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
            placeholder="Search courses by title, category, exam..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center p-1 bg-slate-100 rounded-lg w-full md:w-auto">
          {(['All', 'Published', 'Draft'] as const).map((tab) => (
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

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Courses Found"
          description="No published or draft courses match your search criteria. Create a course to begin."
          actionLabel="Create Course"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const discountPct = course.mrp > course.price
              ? Math.round(((course.mrp - course.price) / course.mrp) * 100)
              : 0;

            return (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Thumbnail / Header Gradient Banner */}
                  <div
                    className={`h-36 bg-gradient-to-r ${course.thumbnailGradient} p-4 text-white flex flex-col justify-between relative`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-wider uppercase bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded">
                        {course.category}
                      </span>
                      <button
                        onClick={() => togglePublishStatus(course)}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded transition-colors ${
                          course.status === 'Published'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-amber-400 text-slate-900'
                        }`}
                        title="Click to toggle status"
                      >
                        {course.status}
                      </button>
                    </div>

                    <div>
                      <span className="text-[11px] text-white/80 font-mono">
                        {course.code}
                      </span>
                      <h4 className="text-sm font-bold text-white line-clamp-1 leading-snug">
                        {course.targetExam}
                      </h4>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Metadata line (Zero-pill discipline) */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                      <span className="font-medium text-slate-700">{course.language}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{course.durationWeeks} weeks</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1 font-mono tabular-nums">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {course.enrolledCount} enrolled
                      </span>
                    </div>

                    {/* Pricing Block */}
                    <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                            ₹{course.price.toLocaleString('en-IN')}
                          </span>
                          {course.mrp > course.price && (
                            <span className="text-xs text-slate-400 line-through font-mono tabular-nums">
                              ₹{course.mrp.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        {discountPct > 0 && (
                          <span className="text-[11px] text-emerald-600 font-semibold font-mono">
                            {discountPct}% instant scholarship
                          </span>
                        )}
                      </div>
                      <div className="text-right text-xs text-slate-500 font-mono">
                        <div>{course.sectionsCount} Sections</div>
                        <div>{course.lessonsCount} Lessons</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onNavigateToContent(course.id)}
                    className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors"
                  >
                    <FolderTree className="w-3.5 h-3.5" />
                    <span>Manage Content</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(course)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-md transition-colors"
                      title="Edit Course"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id, course.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition-colors"
                      title="Delete Course"
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

      {/* Create / Edit Course Modal */}
      {(isCreateModalOpen || editingCourse) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingCourse(null);
          }}
          title={editingCourse ? `Edit Course: ${editingCourse.title}` : 'Create New Course Package'}
          subtitle="Configure title, fee structure, exam taxonomy, and public listing status"
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingCourse(null);
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
                {editingCourse ? 'Save Changes' : 'Create Course'}
              </button>
            </div>
          }
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Course Package Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Complete Master Package: IIT-JEE 2026"
                  className={`w-full px-3 py-2 border rounded-lg ${
                    formErrors.title ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Course Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="CRS-JEE-2026"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="UPPCL Accountant">UPPCL Assistant Accountant</option>
                  <option value="UPSSSC Accounting">UPSSSC Auditor & Accountant</option>
                  <option value="One-Day Govt">One-Day Govt Exams (SSC/Police/RRB)</option>
                  <option value="Computer Certification">Computer CCC / O-Level Certification</option>
                  <option value="Specialization">Subject Specialization</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Exam</label>
                <input
                  type="text"
                  value={formData.targetExam}
                  onChange={(e) => setFormData({ ...formData, targetExam: e.target.value })}
                  placeholder="e.g. UPPCL Assistant Accountant 2026 / UPSSSC Auditor"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medium of Instruction</label>
                <select
                  value={formData.language}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      language: e.target.value as 'Hinglish' | 'English' | 'Hindi',
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Hinglish">Hinglish (Hindi + English)</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Course Fee / Offer Price (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Original MRP (₹)
                </label>
                <input
                  type="number"
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Publication Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'Published' | 'Draft',
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Published">Published (Live to Students)</option>
                  <option value="Draft">Draft (Internal)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Duration (Weeks)
                </label>
                <input
                  type="number"
                  value={formData.durationWeeks}
                  onChange={(e) =>
                    setFormData({ ...formData, durationWeeks: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Thumbnail Gradient Theme
                </label>
                <select
                  value={formData.thumbnailGradient}
                  onChange={(e) => setFormData({ ...formData, thumbnailGradient: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="from-blue-600 to-indigo-800">Deep Sapphire Blue</option>
                  <option value="from-emerald-600 to-teal-800">Medical Emerald Teal</option>
                  <option value="from-violet-600 to-purple-800">Advanced Royal Violet</option>
                  <option value="from-amber-600 to-orange-800">UPSC Foundation Amber</option>
                  <option value="from-cyan-600 to-blue-700">Class 10th Cyan Wave</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Description & Syllabus Overview</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline course objectives, live doubt support, and study material included..."
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
