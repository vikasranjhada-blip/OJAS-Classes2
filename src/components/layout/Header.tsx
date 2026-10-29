import React, { useState } from 'react';
import { PageId, UserRole } from '../../types';
import { useAuth, DEMO_USERS } from '../../contexts/AuthContext';
import {
  Menu,
  Database,
  RotateCcw,
  User,
  ShieldCheck,
  Search,
  ExternalLink,
  Shield,
  GraduationCap,
  BookOpen,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  currentPage: PageId;
  onOpenMobileSidebar: () => void;
  onOpenSupabaseGuide: () => void;
  onResetDemo: () => void;
  adminName: string;
  adminRole: string;
}

const PAGE_TITLES: Record<PageId, { title: string; category: string }> = {
  dashboard: { title: 'Executive Overview', category: 'Dashboard' },
  students: { title: 'Student Directory & Admissions', category: 'Enrollments' },
  teachers: { title: 'Faculty & Educators', category: 'Academics' },
  batches: { title: 'Batches & Cohorts', category: 'Classrooms' },
  courses: { title: 'Course Catalog & Pricing', category: 'Curriculum' },
  'course-content': { title: 'Course Content & Syllabus', category: 'Curriculum' },
  'live-classes': { title: 'Live Streaming Classrooms', category: 'Interactive' },
  'question-bank': { title: 'Question Bank & MCQs', category: 'Assessments' },
  reports: { title: 'Analytics & Performance Reports', category: 'Insights' },
  orders: { title: 'Purchases & Invoices', category: 'Revenue' },
  products: { title: 'Study Material & Store', category: 'Inventory' },
  settings: { title: 'Academy & System Settings', category: 'Configuration' },
  'student-portal': { title: 'My Enrolled Learning Portal', category: 'Student Area' },
  'teacher-portal': { title: 'Assigned Cohorts & Studio', category: 'Faculty Area' },
};

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onOpenMobileSidebar,
  onOpenSupabaseGuide,
  onResetDemo,
}) => {
  const { currentUser, role, isConfigured, switchRolePersona, openAuthModal, logout } = useAuth();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const pageInfo = PAGE_TITLES[currentPage] || { title: 'OJAS Console', category: 'Platform' };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="font-semibold text-slate-700">OJAS Classes</span>
            <span aria-hidden="true">/</span>
            <span className="text-blue-600 font-medium">{pageInfo.category}</span>
          </div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight truncate">
            {pageInfo.title}
          </h1>
        </div>
      </div>

      {/* Right Zone: Controls, Role Switcher & Auth Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Supabase Status Pill */}
        <button
          onClick={onOpenSupabaseGuide}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
            isConfigured
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
          title="Supabase Database & Authentication Configuration"
        >
          <Database className={`w-3.5 h-3.5 ${isConfigured ? 'text-emerald-600' : 'text-blue-600'}`} />
          <span className="hidden sm:inline">
            {isConfigured ? 'Supabase: Connected' : 'Supabase Setup'}
          </span>
          <span className="sm:hidden">{isConfigured ? 'Online' : 'Setup'}</span>
        </button>

        {/* Instant Role Testing Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 transition-colors"
          >
            {role === 'super_admin' && <Shield className="w-3.5 h-3.5 text-indigo-600" />}
            {role === 'teacher' && <BookOpen className="w-3.5 h-3.5 text-blue-600" />}
            {role === 'student' && <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />}
            <span className="hidden md:inline">Role:</span>
            <span className="capitalize">{role.replace('_', ' ')}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 text-xs">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                <span>Test Role & RLS Policies</span>
                <Sparkles className="w-3 h-3 text-amber-500" />
              </div>

              <button
                onClick={() => {
                  switchRolePersona('super_admin');
                  setIsRoleDropdownOpen(false);
                }}
                className={`w-full px-3 py-2 text-left flex items-start gap-2.5 hover:bg-slate-50 transition-colors ${
                  role === 'super_admin' ? 'bg-indigo-50/70 text-indigo-900 font-bold' : 'text-slate-700'
                }`}
              >
                <Shield className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold block">Super Admin Account</span>
                  <span className="text-[10px] text-slate-500">Unrestricted access across all 12 modules</span>
                </div>
              </button>

              <button
                onClick={() => {
                  switchRolePersona('teacher');
                  setIsRoleDropdownOpen(false);
                }}
                className={`w-full px-3 py-2 text-left flex items-start gap-2.5 hover:bg-slate-50 transition-colors ${
                  role === 'teacher' ? 'bg-blue-50/70 text-blue-900 font-bold' : 'text-slate-700'
                }`}
              >
                <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold block">Faculty Member Account</span>
                  <span className="text-[10px] text-slate-500">Assigned batches, student roster & live studio</span>
                </div>
              </button>

              <button
                onClick={() => {
                  switchRolePersona('student');
                  setIsRoleDropdownOpen(false);
                }}
                className={`w-full px-3 py-2 text-left flex items-start gap-2.5 hover:bg-slate-50 transition-colors ${
                  role === 'student' ? 'bg-emerald-50/70 text-emerald-900 font-bold' : 'text-slate-700'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold block">Student Learner Account</span>
                  <span className="text-[10px] text-slate-500">Enrolled batches & authorized syllabus only</span>
                </div>
              </button>

              <div className="p-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    openAuthModal('signup');
                    setIsRoleDropdownOpen(false);
                  }}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-bold"
                >
                  + Create New Account
                </button>
                <button
                  onClick={() => {
                    openAuthModal('login');
                    setIsRoleDropdownOpen(false);
                  }}
                  className="text-[11px] text-slate-600 hover:text-slate-800 font-medium"
                >
                  Custom Login
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {currentUser.fullName
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                {currentUser.fullName}
              </div>
              <div className="text-[10px] text-slate-500 capitalize leading-tight">
                {currentUser.role.replace('_', ' ')}
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => openAuthModal('login')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
