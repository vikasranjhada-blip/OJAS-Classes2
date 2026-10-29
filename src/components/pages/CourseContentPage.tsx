import React, { useState } from 'react';
import { Course, Section, Lesson, LessonType } from '../../types';
import { storage } from '../../services/storage';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import {
  FolderTree,
  Plus,
  Video,
  FileText,
  FileSpreadsheet,
  HelpCircle,
  UploadCloud,
  ChevronDown,
  ChevronRight,
  Eye,
  Trash2,
  FileCode,
  CheckCircle2,
  Clock,
  BookOpen,
  Play,
  Download,
  Award,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface CourseContentPageProps {
  initialCourseId?: string;
}

export const CourseContentPage: React.FC<CourseContentPageProps> = ({ initialCourseId }) => {
  const courses = storage.getCourses();
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    initialCourseId || courses[0]?.id || ''
  );

  const [sections, setSections] = useState<Section[]>(() =>
    storage.getSections(selectedCourseId)
  );
  const [lessons, setLessons] = useState<Lesson[]>(() => storage.getLessons());

  // Collapsible state for sections
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Modals state
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [activeSectionIdForLesson, setActiveSectionIdForLesson] = useState<string | null>(null);
  const [previewingLesson, setPreviewingLesson] = useState<Lesson | null>(null);

  // Add Section form state
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionDesc, setSectionDesc] = useState('');

  // Add Lesson / Note / PYQ form state
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState<LessonType>('video');
  const [lessonDuration, setLessonDuration] = useState(45);
  const [lessonPages, setLessonPages] = useState(18);
  const [lessonUrl, setLessonUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [lessonTextBody, setLessonTextBody] = useState('');
  const [lessonFreePreview, setLessonFreePreview] = useState(false);
  const [lessonQuizCount, setLessonQuizCount] = useState(25);
  // Specific PYQ & Notes fields
  const [pyqExamName, setPyqExamName] = useState('UPPCL Assistant Accountant');
  const [pyqExamYear, setPyqExamYear] = useState('2024');
  const [pyqCount, setPyqCount] = useState(40);
  const [notesCategory, setNotesCategory] = useState<'pdf_notes' | 'ppt_notes' | 'handwritten_notes'>('pdf_notes');

  // Upload simulation state
  const [simulatedFile, setSimulatedFile] = useState<File | null>(null);
  const [simulatedProgress, setSimulatedProgress] = useState<number | null>(null);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  const reloadData = (courseId: string = selectedCourseId) => {
    setSections(storage.getSections(courseId));
    setLessons(storage.getLessons());
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setSections(storage.getSections(courseId));
  };

  const toggleSectionCollapse = (secId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [secId]: !prev[secId],
    }));
  };

  // Add Section
  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionTitle.trim()) return;

    const newSection: Section = {
      id: `sec-${Date.now()}`,
      courseId: selectedCourseId,
      title: sectionTitle,
      order: sections.length + 1,
      description: sectionDesc,
    };
    storage.saveSection(newSection);

    if (selectedCourse) {
      storage.saveCourse({
        ...selectedCourse,
        sectionsCount: selectedCourse.sectionsCount + 1,
      });
    }

    setSectionTitle('');
    setSectionDesc('');
    setIsAddSectionModalOpen(false);
    reloadData();
  };

  // Delete Section
  const handleDeleteSection = (secId: string, title: string) => {
    if (confirm(`Delete section "${title}" and all its lessons?`)) {
      storage.deleteSection(secId);
      if (selectedCourse) {
        storage.saveCourse({
          ...selectedCourse,
          sectionsCount: Math.max(0, selectedCourse.sectionsCount - 1),
        });
      }
      reloadData();
    }
  };

  // Open Add Lesson Modal with preset type
  const openAddLesson = (secId: string, presetType: LessonType = 'video') => {
    setActiveSectionIdForLesson(secId);
    setLessonType(presetType);
    setLessonDuration(45);
    setLessonPages(presetType === 'ppt' ? 32 : 18);
    setLessonTextBody('');
    setLessonFreePreview(false);
    setSimulatedFile(null);
    setSimulatedProgress(null);
    setPyqExamName(selectedCourse?.targetExam || 'UPPCL Assistant Accountant');
    setPyqExamYear('2024');
    setPyqCount(40);

    if (presetType === 'video') {
      setLessonTitle('Chapter Live Session / Video Lecture');
      setLessonUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    } else if (presetType === 'ppt') {
      setLessonTitle('Classroom PPT Presentation Slide Deck');
      setNotesCategory('ppt_notes');
    } else if (presetType === 'pdf') {
      setLessonTitle('Chapter Comprehensive PDF Study Notes');
      setNotesCategory('pdf_notes');
    } else if (presetType === 'pyq') {
      setLessonTitle(`${selectedCourse?.targetExam || 'Exam'} Previous Year Solved Questions (PYQ)`);
    } else if (presetType === 'quiz') {
      setLessonTitle('Chapter Assessment MCQ Practice Quiz');
    } else {
      setLessonTitle('');
    }

    setIsAddLessonModalOpen(true);
  };

  // Simulated File Upload Dropzone
  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSimulatedFile(file);
      setLessonTitle(file.name.replace(/\.[^/.]+$/, ''));
      setSimulatedProgress(10);
      const interval = setInterval(() => {
        setSimulatedProgress((p) => {
          if (p === null || p >= 100) {
            clearInterval(interval);
            return 100;
          }
          return p + 30;
        });
      }, 150);
    }
  };

  // Save Lesson
  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !activeSectionIdForLesson) return;

    const currentSecLessons = lessons.filter((l) => l.sectionId === activeSectionIdForLesson);

    const newLesson: Lesson = {
      id: `lsn-${Date.now()}`,
      sectionId: activeSectionIdForLesson,
      courseId: selectedCourseId,
      title: lessonTitle,
      order: currentSecLessons.length + 1,
      type: lessonType,
      durationMinutes: lessonType === 'video' ? Number(lessonDuration) : undefined,
      pageCount: ['pdf', 'ppt'].includes(lessonType) ? Number(lessonPages) : undefined,
      contentUrl: lessonUrl || (simulatedFile ? `https://storage.ojasclasses.edu/${simulatedFile.name}` : undefined),
      textBody: lessonType === 'text' ? lessonTextBody : undefined,
      quizQuestionCount: lessonType === 'quiz' ? Number(lessonQuizCount) : undefined,
      isFreePreview: lessonFreePreview,
      pyqYear: lessonType === 'pyq' ? pyqExamYear : undefined,
      pyqExam: lessonType === 'pyq' ? pyqExamName : undefined,
      pyqQuestionsCount: lessonType === 'pyq' ? Number(pyqCount) : undefined,
      notesType: lessonType === 'ppt' ? 'ppt_notes' : lessonType === 'pdf' ? notesCategory : undefined,
    };

    storage.saveLesson(newLesson);

    if (selectedCourse) {
      storage.saveCourse({
        ...selectedCourse,
        lessonsCount: selectedCourse.lessonsCount + 1,
      });
    }

    setIsAddLessonModalOpen(false);
    reloadData();
  };

  // Delete Lesson
  const handleDeleteLesson = (lsnId: string, title: string) => {
    if (confirm(`Delete item "${title}"?`)) {
      storage.deleteLesson(lsnId);
      if (selectedCourse) {
        storage.saveCourse({
          ...selectedCourse,
          lessonsCount: Math.max(0, selectedCourse.lessonsCount - 1),
        });
      }
      reloadData();
    }
  };

  const getLessonTypeIcon = (type: LessonType) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-red-600" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'ppt':
        return <FileSpreadsheet className="w-4 h-4 text-amber-600" />;
      case 'pyq':
        return <Award className="w-4 h-4 text-emerald-600" />;
      case 'text':
        return <BookOpen className="w-4 h-4 text-teal-600" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4 text-purple-600" />;
    }
  };

  // Helper to get embeddable YouTube URL
  const getEmbedUrl = (url?: string) => {
    if (!url) return 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ';
    if (url.includes('embed/')) return url;
    if (url.includes('youtube.com/watch?v=')) {
      const vid = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube-nocookie.com/embed/${vid}`;
    }
    if (url.includes('youtu.be/')) {
      const vid = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube-nocookie.com/embed/${vid}`;
    }
    if (url.includes('youtube.com/live/')) {
      const vid = url.split('live/')[1]?.split('?')[0];
      return `https://www.youtube-nocookie.com/embed/${vid}`;
    }
    return 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ';
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Course Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Curriculum & Chapter Sessions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organized hierarchy: Course → Chapters → Video Classes (YouTube Private), PPT Notes, PDF Notes, PYQs and Quizzes
          </p>
        </div>

        {/* Course Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
            Selected Course:
          </span>
          <select
            value={selectedCourseId}
            onChange={(e) => handleSelectCourse(e.target.value)}
            className="py-2 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs max-w-sm"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Course Banner */}
      {selectedCourse && (
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-lg bg-gradient-to-r ${selectedCourse.thumbnailGradient} flex items-center justify-center text-white shrink-0 shadow-xs`}
            >
              <FolderTree className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {selectedCourse.code}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {selectedCourse.targetExam}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                {selectedCourse.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4 self-end md:self-center shrink-0">
            <div className="text-right text-xs text-slate-500 font-mono">
              <span className="font-bold text-slate-900">{sections.length}</span> Chapters ·{' '}
              <span className="font-bold text-slate-900">
                {lessons.filter((l) => l.courseId === selectedCourseId).length}
              </span>{' '}
              Materials (Classes, PPTs, PDFs, PYQs)
            </div>
            <button
              onClick={() => setIsAddSectionModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Chapter / Section</span>
            </button>
          </div>
        </div>
      )}

      {/* Sections and Lessons List */}
      {sections.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No Chapters in this Course"
          description="Create your first chapter session to start adding YouTube live/video classes, PPT notes, PDF notes, or Previous Year Questions (PYQs)."
          actionLabel="Add Chapter / Section"
          onAction={() => setIsAddSectionModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {sections.map((section) => {
            const sectionLessons = lessons.filter((l) => l.sectionId === section.id);
            const isCollapsed = !!collapsedSections[section.id];

            return (
              <div
                key={section.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all"
              >
                {/* Section Header with Quick Option Buttons */}
                <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleSectionCollapse(section.id)}
                      className="p-1 text-slate-500 hover:text-slate-800 rounded transition-colors"
                      aria-label="Toggle Section"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{section.title}</h4>
                      {section.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{section.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Option Buttons: Create Class, Add PPT Notes, Add PDF Notes, Add PYQ */}
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0 pl-7 md:pl-0">
                    <button
                      onClick={() => openAddLesson(section.id, 'video')}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors"
                      title="Add Video or YouTube Class"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>+ Class/Video</span>
                    </button>

                    <button
                      onClick={() => openAddLesson(section.id, 'ppt')}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors"
                      title="Add PPT Presentation Slides"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>+ PPT Notes</span>
                    </button>

                    <button
                      onClick={() => openAddLesson(section.id, 'pdf')}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
                      title="Add PDF Study Notes"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>+ PDF Notes</span>
                    </button>

                    <button
                      onClick={() => openAddLesson(section.id, 'pyq')}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
                      title="Add Previous Year Questions"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>+ PYQs</span>
                    </button>

                    <button
                      onClick={() => handleDeleteSection(section.id, section.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors ml-1"
                      title="Delete Section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Lessons Accordion Body */}
                {!isCollapsed && (
                  <div className="divide-y divide-slate-100">
                    {sectionLessons.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No materials in this chapter yet. Use the buttons above to add YouTube Class, PPT Notes, PDF Notes, or PYQs.
                      </div>
                    ) : (
                      sectionLessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                              {getLessonTypeIcon(lesson.type)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                  {lesson.title}
                                </span>
                                {lesson.type === 'pyq' && (
                                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 whitespace-nowrap">
                                    PYQ {lesson.pyqYear || 'Exam'}
                                  </span>
                                )}
                                {lesson.type === 'ppt' && (
                                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 whitespace-nowrap">
                                    PPT Deck
                                  </span>
                                )}
                                {lesson.type === 'pdf' && (
                                  <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 whitespace-nowrap">
                                    PDF Notes
                                  </span>
                                )}
                                {lesson.isFreePreview && (
                                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 whitespace-nowrap">
                                    Free Sample
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                                <span className="uppercase font-semibold tracking-wider text-slate-400">
                                  {lesson.type === 'pyq' ? 'Previous Year Questions' : lesson.type}
                                </span>
                                {lesson.durationMinutes && (
                                  <>
                                    <span>·</span>
                                    <span>{lesson.durationMinutes} mins lecture</span>
                                  </>
                                )}
                                {lesson.pageCount && (
                                  <>
                                    <span>·</span>
                                    <span>{lesson.pageCount} {lesson.type === 'ppt' ? 'slides' : 'pages'}</span>
                                  </>
                                )}
                                {lesson.pyqQuestionsCount && (
                                  <>
                                    <span>·</span>
                                    <span>{lesson.pyqQuestionsCount} solved MCQs</span>
                                  </>
                                )}
                                {lesson.quizQuestionCount && (
                                  <>
                                    <span>·</span>
                                    <span>{lesson.quizQuestionCount} MCQs</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setPreviewingLesson(lesson)}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Preview</span>
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Section Modal */}
      {isAddSectionModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddSectionModalOpen(false)}
          title="Add Chapter / Section Session"
          subtitle={`Under: ${selectedCourse?.title}`}
          maxWidth="md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setIsAddSectionModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSection}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
              >
                Create Chapter
              </button>
            </div>
          }
        >
          <form onSubmit={handleSaveSection} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Chapter / Section Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                placeholder="e.g. 07. Partnership Accounts & Dissolution of Firms"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Summary / Learning Objectives
              </label>
              <textarea
                rows={2}
                value={sectionDesc}
                onChange={(e) => setSectionDesc(e.target.value)}
                placeholder="Key concepts, syllabus scope and exam weightage..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Add Lesson Modal (Option boxes for Video, PPT Notes, PDF Notes, PYQs, Text, Quiz) */}
      {isAddLessonModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddLessonModalOpen(false)}
          title="Add Learning Resource to Chapter"
          subtitle="Support for YouTube Private Video Lectures, PPT Presentation Notes, PDF Notes, and Solved PYQ Papers"
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => setIsAddLessonModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLesson}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
              >
                Save to Chapter
              </button>
            </div>
          }
        >
          <form onSubmit={handleSaveLesson} className="space-y-4 text-xs">
            {/* OPTION BOX SELECTOR (6 Options) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Select Resource Option Box <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'video',
                    label: 'Video / YouTube Class',
                    icon: Video,
                    color: 'text-red-600',
                    desc: 'Private YouTube Live or recorded video',
                  },
                  {
                    id: 'ppt',
                    label: 'PPT Notes',
                    icon: FileSpreadsheet,
                    color: 'text-amber-600',
                    desc: 'Classroom slide decks & visuals',
                  },
                  {
                    id: 'pdf',
                    label: 'PDF Notes',
                    icon: FileText,
                    color: 'text-blue-600',
                    desc: 'Handwritten & typed chapter notes',
                  },
                  {
                    id: 'pyq',
                    label: "PYQ's (Past Papers)",
                    icon: Award,
                    color: 'text-emerald-600',
                    desc: 'Previous year questions with solutions',
                  },
                  {
                    id: 'text',
                    label: 'Text / Theory Article',
                    icon: BookOpen,
                    color: 'text-teal-600',
                    desc: 'In-app readable rules & summaries',
                  },
                  {
                    id: 'quiz',
                    label: 'Chapter Quiz',
                    icon: HelpCircle,
                    color: 'text-purple-600',
                    desc: 'Speed MCQ mock tests',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSel = lessonType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLessonType(item.id as LessonType)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        isSel
                          ? 'bg-blue-50/80 border-blue-600 ring-1 ring-blue-500 text-blue-950 font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${item.color}`} />
                        <span className="text-xs font-bold leading-tight">{item.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-normal leading-tight">
                        {item.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Resource Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="e.g. Double Entry System Ledger Posting Rules"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-medium"
              />
            </div>

            {/* SPECIFIC CONFIGURATION FOR PYQ's */}
            {lessonType === 'pyq' && (
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Previous Year Questions (PYQ) Specifications</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Exam Name</label>
                    <input
                      type="text"
                      value={pyqExamName}
                      onChange={(e) => setPyqExamName(e.target.value)}
                      placeholder="e.g. UPPCL Assistant Accountant"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Exam Year</label>
                    <input
                      type="text"
                      value={pyqExamYear}
                      onChange={(e) => setPyqExamYear(e.target.value)}
                      placeholder="2024 / 2023 / 2018-2024"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Number of PYQs</label>
                    <input
                      type="number"
                      value={pyqCount}
                      onChange={(e) => setPyqCount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SPECIFIC CONFIGURATION FOR PPT NOTES */}
            {lessonType === 'ppt' && (
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-amber-900 font-bold text-xs">
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                    <span>Classroom Presentation PPT Slide Deck</span>
                  </span>
                  <span className="text-[11px] font-mono text-amber-700">Format: .pptx / .pdf</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Total Slide Count</label>
                    <input
                      type="number"
                      value={lessonPages}
                      onChange={(e) => setLessonPages(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Slide Deck Link / Cloud URL</label>
                    <input
                      type="text"
                      value={lessonUrl}
                      onChange={(e) => setLessonUrl(e.target.value)}
                      placeholder="https://slides.ojasclasses.edu/deck.pptx"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SPECIFIC CONFIGURATION FOR PDF NOTES */}
            {lessonType === 'pdf' && (
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-blue-900 font-bold text-xs">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>PDF Classroom Study Notes & Handouts</span>
                  </span>
                  <span className="text-[11px] font-mono text-blue-700">Printable PDF</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Total Page Count</label>
                    <input
                      type="number"
                      value={lessonPages}
                      onChange={(e) => setLessonPages(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Notes Category</label>
                    <select
                      value={notesCategory}
                      onChange={(e) => setNotesCategory(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                    >
                      <option value="pdf_notes">Faculty Typed Notes (Color PDF)</option>
                      <option value="handwritten_notes">Toppers Handwritten Revision Notes</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* VIDEO & YOUTUBE CLASS LINK */}
            {lessonType === 'video' && (
              <div className="space-y-3 p-4 bg-red-50/50 border border-red-200 rounded-xl">
                <div className="flex items-center justify-between text-red-950 font-bold text-xs">
                  <span className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-red-600" />
                    <span>YouTube Live / Private Video Stream</span>
                  </span>
                  <span className="text-[10px] text-red-700 font-mono">Private/Unlisted Supported</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    YouTube Stream / Video URL (Supports Unlisted & Private)
                  </label>
                  <input
                    type="text"
                    value={lessonUrl}
                    onChange={(e) => setLessonUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or https://youtube.com/live/..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono text-[11px]"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Paste your private unlisted YouTube Live link or recorded lecture link. Students will watch securely in the OJAS in-app player.
                  </p>
                </div>

                <div className="w-full sm:w-1/2">
                  <label className="block font-semibold text-slate-700 mb-1">Lecture Duration (Mins)</label>
                  <input
                    type="number"
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-mono"
                  />
                </div>
              </div>
            )}

            {/* Drag & Drop File Upload Placeholder */}
            {['pdf', 'ppt', 'pyq'].includes(lessonType) && (
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center">
                <UploadCloud className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
                <div className="font-semibold text-slate-700">
                  {simulatedFile ? simulatedFile.name : `Attach Document / File`}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select {lessonType.toUpperCase()} file to upload into batch storage (Max 250MB)
                </p>

                {simulatedProgress !== null && (
                  <div className="mt-2 max-w-xs mx-auto">
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                      <span>Simulated Storage Upload</span>
                      <span>{simulatedProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${simulatedProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <label className="mt-2.5 inline-block cursor-pointer px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-xs">
                  <span>Browse Local File</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleSimulateUpload}
                  />
                </label>
              </div>
            )}

            {/* Text Lesson Editor */}
            {lessonType === 'text' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Theory Article / Concept Summary
                </label>
                <textarea
                  rows={5}
                  value={lessonTextBody}
                  onChange={(e) => setLessonTextBody(e.target.value)}
                  placeholder="Write ledger rules, tax slabs, or auditing standards notes..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-xs"
                />
              </div>
            )}

            {/* Quiz Configuration */}
            {lessonType === 'quiz' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Number of Practice MCQs
                </label>
                <input
                  type="number"
                  value={lessonQuizCount}
                  onChange={(e) => setLessonQuizCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
            )}

            {/* Free Sample Check */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="freePreviewCheck"
                checked={lessonFreePreview}
                onChange={(e) => setLessonFreePreview(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <label htmlFor="freePreviewCheck" className="font-semibold text-slate-700">
                Enable as Free Sample Resource for Unenrolled Students
              </label>
            </div>
          </form>
        </Modal>
      )}

      {/* Lesson Preview Modal */}
      {previewingLesson && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewingLesson(null)}
          title={`Preview: ${previewingLesson.title}`}
          subtitle={`Resource Type: ${previewingLesson.type.toUpperCase()}`}
          maxWidth="3xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500 font-mono">
                {previewingLesson.isFreePreview ? 'Public Free Sample' : 'Protected: Enrolled Students Only'}
              </span>
              <button
                onClick={() => setPreviewingLesson(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Close Preview
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* VIDEO & YOUTUBE PLAYER PREVIEW */}
            {previewingLesson.type === 'video' && (
              <div className="space-y-3">
                <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-md">
                  <iframe
                    src={getEmbedUrl(previewingLesson.contentUrl)}
                    title={previewingLesson.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-xs text-red-900">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-red-600" />
                    <span>In-App Private YouTube Player (Watermarked & Enrolled Access Protected)</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold">{previewingLesson.durationMinutes} mins</span>
                </div>
              </div>
            )}

            {/* PPT NOTES PREVIEW */}
            {previewingLesson.type === 'ppt' && (
              <div className="p-8 bg-amber-50/60 rounded-xl border border-amber-200 text-center space-y-3">
                <FileSpreadsheet className="w-14 h-14 text-amber-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">{previewingLesson.title}</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  {previewingLesson.pageCount || 32} Slides · Classroom Presentation Slide Deck with Diagrams & Ledger T-Accounts
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-amber-900 shadow-xs">
                  <Download className="w-4 h-4 text-amber-600" />
                  <span>Download Presentation (.pptx)</span>
                </div>
              </div>
            )}

            {/* PDF NOTES PREVIEW */}
            {previewingLesson.type === 'pdf' && (
              <div className="p-8 bg-blue-50/60 rounded-xl border border-blue-200 text-center space-y-3">
                <FileText className="w-14 h-14 text-blue-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">{previewingLesson.title}</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  {previewingLesson.pageCount || 24} Pages · Comprehensive Chapter Notes & Practice Problem Solutions
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 rounded-lg text-xs font-bold text-blue-900 shadow-xs">
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>Download PDF Notes</span>
                </div>
              </div>
            )}

            {/* PYQ PREVIEW */}
            {previewingLesson.type === 'pyq' && (
              <div className="p-6 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950">{previewingLesson.title}</h4>
                      <p className="text-[11px] text-emerald-700">
                        Exam: {previewingLesson.pyqExam || 'UPPCL / UPSSSC'} · Year: {previewingLesson.pyqYear || '2024'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">
                    {previewingLesson.pyqQuestionsCount || 40} Solved PYQs
                  </Badge>
                </div>

                <div className="p-4 bg-white rounded-lg border border-emerald-200 text-xs text-slate-700 space-y-2">
                  <span className="font-bold text-slate-900">Sample Question from Paper:</span>
                  <p className="text-slate-800 font-medium">
                    "Under Schedule III of the Companies Act 2013, Proposed Dividend is disclosed under which heading in the Balance Sheet?"
                  </p>
                  <p className="text-emerald-700 font-semibold text-[11px]">
                    ✓ Correct Answer: Contingent Liabilities & Commitments (Notes to Accounts)
                  </p>
                </div>
              </div>
            )}

            {/* TEXT PREVIEW */}
            {previewingLesson.type === 'text' && (
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2 whitespace-pre-wrap font-sans leading-relaxed">
                {previewingLesson.textBody || 'No text content provided.'}
              </div>
            )}

            {/* QUIZ PREVIEW */}
            {previewingLesson.type === 'quiz' && (
              <div className="p-6 bg-purple-50/60 rounded-xl border border-purple-200 space-y-3">
                <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                  <HelpCircle className="w-4 h-4 text-purple-600" />
                  <span>Chapter Speed Assessment ({previewingLesson.quizQuestionCount || 25} MCQs)</span>
                </div>
                <p className="text-xs text-purple-700">
                  Timed test aligned with UPPCL / UPSSSC negative marking rules. Automatic score generation and chapter rank list.
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
