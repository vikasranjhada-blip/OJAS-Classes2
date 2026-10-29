import React from 'react';
import { PageId } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Layers,
  BookOpen,
  FolderTree,
  Video,
  HelpCircle,
  BarChart3,
  Receipt,
  Package,
  Settings,
  Database,
  RotateCcw,
  Sparkles,
  ChevronRight,
  X,
  Shield,
  Lock,
} from 'lucide-react';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenSupabaseGuide: () => void;
  onResetDemo: () => void;
  liveClassesCount: number;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: 'live' | 'neutral';
  adminOnly?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  onOpenSupabaseGuide,
  onResetDemo,
  liveClassesCount,
}) => {
  const { role, isConfigured } = useAuth();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'student-portal', label: 'Student Portal', icon: GraduationCap },
    { id: 'teacher-portal', label: 'Faculty Studio', icon: BookOpen },
    { id: 'students', label: 'Students', icon: GraduationCap, adminOnly: true },
    { id: 'teachers', label: 'Teachers', icon: Users, adminOnly: true },
    { id: 'batches', label: 'Batches', icon: Layers },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'course-content', label: 'Course Content', icon: FolderTree },
    {
      id: 'live-classes',
      label: 'Live Classes',
      icon: Video,
      badge: liveClassesCount > 0 ? `${liveClassesCount} LIVE` : undefined,
      badgeVariant: 'live',
    },
    { id: 'question-bank', label: 'Question Bank', icon: HelpCircle },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'orders', label: 'Orders', icon: Receipt, adminOnly: true },
    { id: 'products', label: 'Products', icon: Package, adminOnly: true },
    { id: 'settings', label: 'Settings', icon: Settings, adminOnly: true },
  ];

  const handleItemClick = (pageId: PageId) => {
    onNavigate(pageId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 border-r border-slate-800 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 flex items-center justify-between px-4 border-b border-slate-800 shrink-0 bg-slate-950/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-white rounded-lg p-1.5 shrink-0 shadow-sm border border-slate-700/60 flex items-center justify-center">
              <img
                src="/assets/aistudio/2141b4f9-0816-4ef1-92ae-3ef08e0d2955_7d83b97c.jpg"
                alt="OJAS Classes Logo"
                className="h-7 w-auto object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const fallback = target.parentElement?.querySelector('.fallback-logo');
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              <div className="fallback-logo hidden text-xs font-black text-slate-900 px-1 font-sans">
                OJĀS
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-white tracking-tight leading-tight truncate">
                OJAS Classes
              </div>
              <div className="text-[10px] text-teal-400 font-medium tracking-wide">
                All-Exam Coaching Platform
              </div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase flex items-center justify-between">
            <span>Navigation Menu</span>
            <span className="text-[9px] font-mono text-blue-400 capitalize">({role.replace('_', ' ')})</span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const isRestrictedForUser = role === 'student' && item.adminOnly;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : isRestrictedForUser
                    ? 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-400 opacity-70'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : isRestrictedForUser ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge ? (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      item.badgeVariant === 'live'
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : isRestrictedForUser ? (
                  <span title="RLS Restricted">
                    <Lock className="w-3 h-3 text-slate-500" />
                  </span>
                ) : isActive ? (
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Supabase Status Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 shrink-0 space-y-2">
          {/* Supabase Status Card */}
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center justify-between text-slate-300 font-medium mb-1">
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConfigured ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                {isConfigured ? 'SUPABASE ONLINE' : 'LOCAL DEMO SANDBOX'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {isConfigured ? 'Postgres' : 'Local DB'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              {isConfigured
                ? 'Row Level Security active on profiles, courses & batches.'
                : 'RLS simulator running. Switch roles anytime in top bar.'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={onOpenSupabaseGuide}
              className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 transition-colors"
              title="View Supabase PostgreSQL Schema & RLS"
            >
              <Database className="w-3.5 h-3.5 text-teal-400" />
              <span>Supabase</span>
            </button>
            <button
              onClick={onResetDemo}
              className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 transition-colors"
              title="Reset sample data back to default"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
