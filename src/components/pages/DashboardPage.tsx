import React from 'react';
import { PageId } from '../../types';
import { storage } from '../../services/storage';
import { Badge } from '../common/Badge';
import { HomeShowcaseSlider } from '../dashboard/HomeShowcaseSlider';
import {
  GraduationCap,
  Layers,
  BookOpen,
  Video,
  IndianRupee,
  TrendingUp,
  ArrowRight,
  Plus,
  Play,
  Calendar,
  Clock,
  ExternalLink,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (page: PageId) => void;
  onOpenSupabaseGuide: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenSupabaseGuide,
}) => {
  const students = storage.getStudents();
  const batches = storage.getBatches();
  const courses = storage.getCourses();
  const liveClasses = storage.getLiveClasses();
  const orders = storage.getOrders();
  const activities = storage.getActivities();

  // Metrics
  const activeStudentsCount = students.filter((s) => s.status === 'Active').length;
  const activeBatchesCount = batches.filter((b) => b.status === 'Ongoing').length;
  const publishedCoursesCount = courses.filter((c) => c.status === 'Published').length;
  const liveNowClass = liveClasses.find((c) => c.status === 'Live Now');
  const upcomingClasses = liveClasses.filter((c) => c.status === 'Scheduled');

  const totalRevenue = orders
    .filter((o) => o.status === 'Paid')
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const avgAttendance = (
    students.reduce((acc, s) => acc + s.attendancePct, 0) / (students.length || 1)
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Dynamic Animated Showcase Slider: New Launches, Classes & Batch Details */}
      <HomeShowcaseSlider onNavigate={onNavigate} />

      {/* Live Now Alert Banner if class is in session */}
      {liveNowClass && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <Video className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider uppercase bg-white text-red-700 px-2 py-0.5 rounded">
                  Live Class in Session
                </span>
                <span className="text-xs text-red-100">
                  {liveNowClass.attendeeCount || 114} Students Connected
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold mt-0.5">{liveNowClass.title}</h3>
              <p className="text-xs text-red-100">
                {liveNowClass.batchName} · {liveNowClass.teacherName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <a
              href={liveNowClass.meetingLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-red-700 hover:bg-red-50 text-xs font-bold rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Join Live Classroom
            </a>
            <button
              onClick={() => onNavigate('live-classes')}
              className="px-3 py-2 bg-red-800/60 hover:bg-red-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              Manage
            </button>
          </div>
        </div>
      )}

      {/* Primary KPI Grid (Zero-pill, high scannability) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Students */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Enrolled Students
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {students.length}
            </span>
            <span className="text-xs text-slate-500">
              ({activeStudentsCount} active)
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>Avg Attendance</span>
            <span className="font-semibold text-slate-800 font-mono tabular-nums">
              {avgAttendance}%
            </span>
          </div>
        </div>

        {/* Card 2: Active Batches */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Batches
            </span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {activeBatchesCount}
            </span>
            <span className="text-xs text-slate-500">
              of {batches.length} cohorts
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>Upcoming Batches</span>
            <span className="font-semibold text-slate-800 font-mono tabular-nums">
              {batches.filter((b) => b.status === 'Upcoming').length}
            </span>
          </div>
        </div>

        {/* Card 3: Published Courses */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Published Courses
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {publishedCoursesCount}
            </span>
            <span className="text-xs text-slate-500">
              ({courses.length} total)
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>Total Lessons</span>
            <span className="font-semibold text-slate-800 font-mono tabular-nums">
              {courses.reduce((a, c) => a + c.lessonsCount, 0)} modules
            </span>
          </div>
        </div>

        {/* Card 4: Total Revenue (₹) */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Gross Collections
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>Paid Orders</span>
            <span className="font-semibold text-slate-800 font-mono tabular-nums">
              {orders.filter((o) => o.status === 'Paid').length} invoices
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions Strip */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          <span>Quick Admin Workflows:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('students')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Admit Student</span>
          </button>
          <button
            onClick={() => onNavigate('live-classes')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-white border border-teal-200 hover:bg-teal-50 rounded-lg shadow-xs transition-colors"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Schedule Class</span>
          </button>
          <button
            onClick={() => onNavigate('batches')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 rounded-lg shadow-xs transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Create Batch</span>
          </button>
          <button
            onClick={() => onNavigate('question-bank')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Add MCQ</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Upcoming Classes & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Live Classes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Upcoming Live Classes
                </h3>
                <p className="text-xs text-slate-500">
                  Scheduled live streaming sessions across active cohorts
                </p>
              </div>
              <button
                onClick={() => onNavigate('live-classes')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>View Full Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {upcomingClasses.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No upcoming classes scheduled today.
                </div>
              ) : (
                upcomingClasses.slice(0, 4).map((cls) => (
                  <div
                    key={cls.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-lg transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="info" size="sm">
                          {cls.subject}
                        </Badge>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs font-medium text-slate-600">
                          {cls.batchName}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                        {cls.title}
                      </h4>
                      <div className="text-xs text-slate-500 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {cls.teacherName}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {cls.durationMinutes} mins
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      <a
                        href={cls.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap"
                      >
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                        <span>Link</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Batches Capacity Overview */}
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Batch Enrollment & Seat Capacity
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time admissions fill-rate across flagship programs
                </p>
              </div>
              <button
                onClick={() => onNavigate('batches')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Manage Batches</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {batches.slice(0, 4).map((batch) => {
                const enrolled = batch.enrolledStudentIds.length;
                const pct = Math.min(100, Math.round((enrolled / batch.capacity) * 100));
                return (
                  <div key={batch.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-900">{batch.name}</span>
                        <span className="text-slate-400 ml-2 font-mono text-[11px]">
                          ({batch.code})
                        </span>
                      </div>
                      <div className="text-slate-600 font-mono tabular-nums">
                        <span className="font-bold text-slate-900">{enrolled}</span> /{' '}
                        {batch.capacity} seats ({pct}%)
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          pct >= 90 ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Faculty: {batch.teacherName}</span>
                      <span className="font-mono">{batch.timing}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Recent Activity & Platform Health */}
        <div className="space-y-6">
          {/* Recent Activity Feed */}
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1">
              Recent Activity Feed
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Audit trail of admissions, tests, and classroom events
            </p>

            <div className="flow-root">
              <ul className="-mb-8">
                {activities.slice(0, 6).map((act, idx) => (
                  <li key={act.id}>
                    <div className="relative pb-8">
                      {idx !== activities.slice(0, 6).length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                            <TrendingUp className="w-4 h-4" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <p className="text-xs font-semibold text-slate-900">{act.title}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                            {act.description}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                            <span>{act.timestamp}</span>
                            <span>·</span>
                            <span>{act.user}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Architecture Reminder Card */}
          <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl shadow-xs">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Full Code Ownership</span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              Ready for Supabase Backend
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              All 12 pages operate on a unified repository contract. Export the full PostgreSQL
              schema or test with client-side persistence.
            </p>
            <button
              onClick={onOpenSupabaseGuide}
              className="w-full py-2 px-3 text-xs font-bold text-slate-900 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span>View Schema & Setup Steps</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
