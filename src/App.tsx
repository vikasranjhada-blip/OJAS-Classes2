/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { PageId, LiveClass, Lesson } from './types';
import { storage } from './services/storage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AuthModal } from './components/auth/AuthModal';
import { DashboardPage } from './components/pages/DashboardPage';
import { StudentsPage } from './components/pages/StudentsPage';
import { TeachersPage } from './components/pages/TeachersPage';
import { BatchesPage } from './components/pages/BatchesPage';
import { CoursesPage } from './components/pages/CoursesPage';
import { CourseContentPage } from './components/pages/CourseContentPage';
import { LiveClassesPage } from './components/pages/LiveClassesPage';
import { QuestionBankPage } from './components/pages/QuestionBankPage';
import { ReportsPage } from './components/pages/ReportsPage';
import { OrdersPage } from './components/pages/OrdersPage';
import { ProductsPage } from './components/pages/ProductsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { StudentPortal } from './components/portals/StudentPortal';
import { TeacherPortal } from './components/portals/TeacherPortal';
import { UnauthorizedState } from './components/common/UnauthorizedState';
import { SupabaseGuideModal } from './components/SupabaseGuideModal';
import { Modal } from './components/common/Modal';
import { ShieldCheck, Video, Users } from 'lucide-react';

function AppContent() {
  const { role, currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [selectedCourseForContent, setSelectedCourseForContent] = useState<string | undefined>(undefined);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isSupabaseGuideOpen, setIsSupabaseGuideOpen] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  // Student portal modal states
  const [activeLiveRoom, setActiveLiveRoom] = useState<LiveClass | null>(null);
  const [activeLessonPreview, setActiveLessonPreview] = useState<{ lesson: Lesson; courseTitle: string } | null>(null);

  const settings = useMemo(() => storage.getSettings(), [resetNonce]);
  const liveClasses = useMemo(() => storage.getLiveClasses(), [resetNonce]);

  const liveNowCount = liveClasses.filter((c) => c.status === 'Live Now').length;

  const handleResetDemo = () => {
    if (confirm('Reset all demo data back to default initial state? Any custom additions in this session will be refreshed.')) {
      storage.resetAll();
      setResetNonce((n) => n + 1);
      setCurrentPage('dashboard');
    }
  };

  const handleNavigateToContent = (courseId: string) => {
    setSelectedCourseForContent(courseId);
    setCurrentPage('course-content');
  };

  // Enforce Row Level Security (RLS) on Admin Pages
  const isStudentRestricted = (page: PageId): boolean => {
    if (role !== 'student') return false;
    const adminOnlyPages: PageId[] = ['students', 'teachers', 'orders', 'products', 'settings'];
    return adminOnlyPages.includes(page);
  };

  const renderCurrentPage = () => {
    // Check RLS permission boundary
    if (isStudentRestricted(currentPage)) {
      return (
        <UnauthorizedState
          requiredRole="Super Admin"
          onNavigate={setCurrentPage}
        />
      );
    }

    switch (currentPage) {
      case 'student-portal':
        return (
          <StudentPortal
            onWatchLive={(cls) => setActiveLiveRoom(cls)}
            onOpenLesson={(lesson, title) => setActiveLessonPreview({ lesson, courseTitle: title })}
          />
        );

      case 'teacher-portal':
        return (
          <TeacherPortal
            onScheduleClass={() => setCurrentPage('live-classes')}
            onWatchLive={(cls) => setActiveLiveRoom(cls)}
            onNavigateToContent={() => setCurrentPage('course-content')}
          />
        );

      case 'dashboard':
        return (
          <DashboardPage
            key={resetNonce}
            onNavigate={setCurrentPage}
            onOpenSupabaseGuide={() => setIsSupabaseGuideOpen(true)}
          />
        );

      case 'students':
        return <StudentsPage key={resetNonce} />;

      case 'teachers':
        return <TeachersPage key={resetNonce} />;

      case 'batches':
        return <BatchesPage key={resetNonce} />;

      case 'courses':
        return <CoursesPage key={resetNonce} onNavigateToContent={handleNavigateToContent} />;

      case 'course-content':
        return (
          <CourseContentPage
            key={`${resetNonce}-${selectedCourseForContent}`}
            initialCourseId={selectedCourseForContent}
          />
        );

      case 'live-classes':
        return <LiveClassesPage key={resetNonce} />;

      case 'question-bank':
        return <QuestionBankPage key={resetNonce} />;

      case 'reports':
        return <ReportsPage key={resetNonce} />;

      case 'orders':
        return <OrdersPage key={resetNonce} />;

      case 'products':
        return <ProductsPage key={resetNonce} />;

      case 'settings':
        return (
          <SettingsPage
            key={resetNonce}
            onOpenSupabaseGuide={() => setIsSupabaseGuideOpen(true)}
            onResetDemo={handleResetDemo}
          />
        );

      default:
        return (
          <DashboardPage
            key={resetNonce}
            onNavigate={setCurrentPage}
            onOpenSupabaseGuide={() => setIsSupabaseGuideOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      {/* Responsive Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        onOpenSupabaseGuide={() => setIsSupabaseGuideOpen(true)}
        onResetDemo={handleResetDemo}
        liveClassesCount={liveNowCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          currentPage={currentPage}
          onOpenMobileSidebar={() => setIsOpenMobile(true)}
          onOpenSupabaseGuide={() => setIsSupabaseGuideOpen(true)}
          onResetDemo={handleResetDemo}
          adminName={currentUser?.fullName || settings.adminName}
          adminRole={currentUser?.role ? currentUser.role.replace('_', ' ') : settings.adminRole}
        />

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderCurrentPage()}
        </main>
      </div>

      {/* Supabase Guide & SQL DDL Modal */}
      <SupabaseGuideModal
        isOpen={isSupabaseGuideOpen}
        onClose={() => setIsSupabaseGuideOpen(false)}
      />

      {/* Auth Modal for Login, Signup, and Role Selection */}
      <AuthModal />

      {/* Live Room Stream Viewer for Student / Teacher Portals */}
      {activeLiveRoom && (
        <Modal
          isOpen={true}
          onClose={() => setActiveLiveRoom(null)}
          title={`🔴 Private Stream: ${activeLiveRoom.title}`}
          subtitle={`${activeLiveRoom.batchName} · Faculty: ${activeLiveRoom.teacherName}`}
          maxWidth="4xl"
          footer={
            <div className="flex items-center justify-between w-full text-xs">
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">RLS Enrolled Student Access: Authorized</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveLiveRoom(null)}
                className="px-4 py-2 font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Close Stream
              </button>
            </div>
          }
        >
          <div className="space-y-3">
            <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-inner">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeLiveRoom.youtubeVideoId || 'jfKfPfyJRdk'}?autoplay=1&rel=0`}
                title={activeLiveRoom.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">1080p Private YouTube Live Broadcast</span>
              <span className="flex items-center gap-1 text-slate-600 font-mono">
                <Users className="w-4 h-4 text-blue-600" />
                142 Students Attending
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* Lesson Notes & PYQ Viewer Modal */}
      {activeLessonPreview && (
        <Modal
          isOpen={true}
          onClose={() => setActiveLessonPreview(null)}
          title={activeLessonPreview.lesson.title}
          subtitle={`${activeLessonPreview.courseTitle} · Type: ${activeLessonPreview.lesson.type.toUpperCase()}`}
          maxWidth="3xl"
          footer={
            <div className="flex items-center justify-between w-full text-xs">
              <span className="text-slate-500 font-mono">
                {activeLessonPreview.lesson.type === 'ppt' ? `${activeLessonPreview.lesson.pageCount || 42} Slides` : activeLessonPreview.lesson.type === 'pdf' ? `${activeLessonPreview.lesson.pageCount || 28} Pages` : `${activeLessonPreview.lesson.durationMinutes || 60} mins`}
              </span>
              <button
                type="button"
                onClick={() => setActiveLessonPreview(null)}
                className="px-4 py-2 font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Close Reader
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <p className="font-semibold text-slate-900 mb-1">
                Authorized Material for Enrolled Students
              </p>
              <p>
                {activeLessonPreview.lesson.textBody ||
                  'This learning asset is protected by Supabase Row Level Security. Only students enrolled in the corresponding batch can access and review full solved questions, PPT slide decks, and downloadable PDF study notes.'}
              </p>
            </div>
            {activeLessonPreview.lesson.type === 'pyq' && (
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-xs">
                <h4 className="font-bold text-purple-900 mb-2">Previous Year Solved Questions</h4>
                <div className="space-y-2">
                  <div className="p-2.5 bg-white rounded-lg border border-purple-100">
                    <p className="font-semibold text-slate-900">Q1. Depreciation under Companies Act 2013 is calculated on which basis?</p>
                    <p className="text-emerald-700 font-bold mt-1">Answer: Useful life of the asset (Schedule II)</p>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-purple-100">
                    <p className="font-semibold text-slate-900">Q2. Which section of Income Tax Act deals with deduction for tuition fees?</p>
                    <p className="text-emerald-700 font-bold mt-1">Answer: Section 80C (Maximum limit ₹1,50,000)</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
