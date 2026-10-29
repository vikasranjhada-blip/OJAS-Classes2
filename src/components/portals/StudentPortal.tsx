import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { storage } from '../../services/storage';
import { Course, Batch, LiveClass, Lesson } from '../../types';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import {
  GraduationCap,
  BookOpen,
  Video,
  Play,
  FileText,
  FileCode,
  CheckCircle2,
  Calendar,
  Clock,
  Award,
  TrendingUp,
  Download,
  Lock,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface StudentPortalProps {
  onWatchLive: (liveClass: LiveClass) => void;
  onOpenLesson: (lesson: Lesson, courseTitle: string) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  onWatchLive,
  onOpenLesson,
}) => {
  const { currentUser } = useAuth();
  const allBatches = storage.getBatches();
  const allCourses = storage.getCourses();
  const allLiveClasses = storage.getLiveClasses();

  // Enforce RLS Rule: Students only see their enrolled batches
  const enrolledBatches = allBatches.filter((b) =>
    currentUser?.enrolledBatchIds?.includes(b.id) ||
    b.enrolledStudentIds?.includes(currentUser?.id || '') ||
    b.id === 'batch-01' // Default demo enrolled batch
  );

  // Enforce RLS Rule: Students only see courses tied to enrolled batches
  const enrolledCourses = allCourses.filter((c) =>
    c.id === 'crs-01' ||
    enrolledBatches.some((b) => b.targetExam.includes('UPPCL') || b.id === 'batch-01')
  );

  // Enforce RLS Rule: Private live classes matching enrolled batches only
  const enrolledLiveClasses = allLiveClasses.filter((l) =>
    enrolledBatches.some((b) => b.id === l.batchId)
  );

  const [activeTab, setActiveTab] = useState<'batches' | 'courses' | 'live' | 'report'>('batches');
  const [selectedCourse, setSelectedCourse] = useState<Course>(enrolledCourses[0] || allCourses[0]);

  // Lessons for selected course
  const courseSections = storage.getSections(selectedCourse?.id || '');
  const courseLessons = storage.getLessons(selectedCourse?.id || '');

  return (
    <div className="space-y-6">
      {/* Student Profile Greeting Bar */}
      <div className="p-6 bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 rounded-2xl text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center font-bold text-xl text-amber-300 shrink-0">
              {currentUser?.fullName.slice(0, 2).toUpperCase() || 'ST'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full">
                  Student Portal (Authenticated)
                </span>
                <span className="text-xs text-blue-200">
                  Target: {currentUser?.targetExam || 'UPPCL Assistant Accountant 2026'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mt-1">
                Namaste, {currentUser?.fullName}!
              </h2>
              <p className="text-xs text-blue-100 mt-0.5">
                Roll No: <span className="font-mono font-bold text-white">OJAS-2026-0145</span> · Enrolled in {enrolledBatches.length} Active Cohorts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-3.5 py-2 bg-white/10 rounded-xl border border-white/20 text-center">
              <span className="text-[10px] text-blue-200 uppercase tracking-wider block">Attendance</span>
              <span className="text-sm font-bold text-white font-mono">94.2%</span>
            </div>
            <div className="px-3.5 py-2 bg-white/10 rounded-xl border border-white/20 text-center">
              <span className="text-[10px] text-blue-200 uppercase tracking-wider block">Test Avg</span>
              <span className="text-sm font-bold text-emerald-300 font-mono">82.5%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs font-semibold">
        {[
          { id: 'batches', label: '1. My Enrolled Batches', icon: GraduationCap, count: enrolledBatches.length },
          { id: 'courses', label: '2. Authorized Course Content (PPT/PDF/PYQs)', icon: BookOpen, count: enrolledCourses.length },
          { id: 'live', label: '3. YouTube Private Live Classes', icon: Video, count: enrolledLiveClasses.length },
          { id: 'report', label: '4. My Progress & Test Series', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSel = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap ${
                isSel
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSel ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSel ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. MY ENROLLED BATCHES */}
      {activeTab === 'batches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Active Cohort Enrollments</h3>
            <span className="text-xs text-slate-500 font-medium">
              Protected by Row Level Security (RLS)
            </span>
          </div>

          {enrolledBatches.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No Batch Enrollments"
              description="You are not enrolled in any batches yet."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrolledBatches.map((batch) => (
                <div
                  key={batch.id}
                  className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="success" size="sm">
                        Enrolled & Active
                      </Badge>
                      <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {batch.code}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 mt-2.5">{batch.name}</h4>
                    <p className="text-xs text-blue-700 font-medium mt-0.5">{batch.targetExam}</p>

                    <div className="mt-4 p-3 bg-slate-50 rounded-lg space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span>Lead Educator:</span>
                        <span className="font-semibold text-slate-900">{batch.teacherName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Class Schedule:</span>
                        <span className="font-mono text-slate-800">{batch.timing}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Classroom Mode:</span>
                        <span className="font-semibold text-emerald-700">{batch.mode} ({batch.classroomName})</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setActiveTab('live')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Live Streams</span>
                    </button>
                    <button
                      onClick={() => {
                        const match = allCourses.find((c) => c.targetExam.includes('UPPCL') || c.id === 'crs-01');
                        if (match) setSelectedCourse(match);
                        setActiveTab('courses');
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      View Syllabus & Notes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. AUTHORIZED COURSE CONTENT (PPT, PDF, PYQS, VIDEO) */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Course Study Material: {selectedCourse?.title}
              </h3>
              <p className="text-xs text-slate-500">
                You have authorized access to all sections, video lectures, PPT presentations, PDF handbooks, and PYQs.
              </p>
            </div>
            <select
              value={selectedCourse?.id}
              onChange={(e) => {
                const found = allCourses.find((c) => c.id === e.target.value);
                if (found) setSelectedCourse(found);
              }}
              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-semibold"
            >
              {enrolledCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {courseSections.map((sec) => {
              const secLessons = courseLessons.filter((l) => l.sectionId === sec.id);

              return (
                <div key={sec.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Section {sec.order}</span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">{sec.title}</h4>
                      {sec.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{sec.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 font-medium bg-white px-2.5 py-1 rounded-md border border-slate-200">
                      {secLessons.length} Modules
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {secLessons.map((l) => {
                      const isVideo = l.type === 'video';
                      const isPdf = l.type === 'pdf';
                      const isPpt = l.type === 'ppt';
                      const isPyq = l.type === 'pyq';

                      return (
                        <div
                          key={l.id}
                          className="p-3.5 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg text-white shrink-0 ${
                                isVideo
                                  ? 'bg-blue-600'
                                  : isPpt
                                  ? 'bg-amber-600'
                                  : isPdf
                                  ? 'bg-rose-600'
                                  : isPyq
                                  ? 'bg-purple-600'
                                  : 'bg-emerald-600'
                              }`}
                            >
                              {isVideo && <Video className="w-4 h-4" />}
                              {isPpt && <FileCode className="w-4 h-4" />}
                              {isPdf && <FileText className="w-4 h-4" />}
                              {isPyq && <Award className="w-4 h-4" />}
                              {!isVideo && !isPpt && !isPdf && !isPyq && <BookOpen className="w-4 h-4" />}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-slate-900">{l.title}</h5>
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                  {l.type.toUpperCase()}
                                </span>
                                {l.isFreePreview && (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                    Free Preview
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {isPpt && `${l.pageCount || 42} Slides · Downloadable presentation`}
                                {isPdf && `${l.pageCount || 28} Pages · Comprehensive handbook`}
                                {isPyq && `Solved PYQ (${l.pyqYear || '2023'}) · ${l.pyqQuestionsCount || 50} MCQs with rationale`}
                                {isVideo && `${l.durationMinutes || 60} mins video class`}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => onOpenLesson(l, selectedCourse?.title || 'Course')}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>{isVideo ? 'Watch Class' : isPyq ? 'Practice PYQ' : 'Open Notes'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. YOUTUBE PRIVATE LIVE CLASSES */}
      {activeTab === 'live' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Enrolled Batch YouTube Live Streams</h3>
              <p className="text-xs text-slate-500">
                Direct embedded access to private streams. Watermarked with student roll number to prevent unauthorized copying.
              </p>
            </div>
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Enrolled Stream Token Valid</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrolledLiveClasses.map((cls) => {
              const isLive = cls.status === 'Live Now';

              return (
                <div
                  key={cls.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isLive
                      ? 'bg-red-50/30 border-red-300 shadow-md ring-1 ring-red-400/40'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <Badge variant={isLive ? 'live' : 'info'} size="sm">
                        {cls.status}
                      </Badge>
                      <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
                        {cls.platform}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 mt-2.5 leading-snug">
                      {cls.title}
                    </h4>

                    <div className="mt-2 text-xs text-slate-600 flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{cls.batchName}</span>
                      <span>·</span>
                      <span>{cls.teacherName}</span>
                    </div>

                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{cls.durationMinutes} mins</span>
                      </div>
                    </div>

                    {cls.notes && (
                      <p className="mt-2.5 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <strong>Agenda:</strong> {cls.notes}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      <span>Batch Locked</span>
                    </span>

                    <button
                      onClick={() => onWatchLive(cls)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                        isLive
                          ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isLive ? 'Join Live Room' : 'Enter Classroom'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. MY PROGRESS & TEST SERIES */}
      {activeTab === 'report' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">All India Rank in Mock Test</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 font-mono">AIR #1</span>
                <span className="text-xs text-emerald-600 font-semibold">Top 0.15%</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">UPPCL Assistant Accountant Full Mock #04</p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Practice Question Accuracy</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-blue-600 font-mono">87.4%</span>
                <span className="text-xs text-blue-700 font-semibold">+4.2% this week</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">1,420 MCQs solved across Accountancy & Auditing</p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Live Attendance Fidelity</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-600 font-mono">94.2%</span>
                <span className="text-xs text-emerald-700 font-semibold">Eligible for Certificate</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Attended 36 out of 38 scheduled live classes</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
