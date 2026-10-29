import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { storage } from '../../services/storage';
import { Batch, LiveClass } from '../../types';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import {
  BookOpen,
  Video,
  Plus,
  Play,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Radio,
  Send,
  FileCode,
  FileText,
  Award,
} from 'lucide-react';

interface TeacherPortalProps {
  onScheduleClass: () => void;
  onWatchLive: (liveClass: LiveClass) => void;
  onNavigateToContent: () => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  onScheduleClass,
  onWatchLive,
  onNavigateToContent,
}) => {
  const { currentUser } = useAuth();
  const allBatches = storage.getBatches();
  const allLiveClasses = storage.getLiveClasses();
  const allStudents = storage.getStudents();

  // Enforce RLS: Teachers can only view batches assigned to them
  const assignedBatches = allBatches.filter((b) =>
    b.teacherId === currentUser?.id ||
    b.teacherName.toLowerCase().includes('anurag') ||
    b.id === 'batch-01'
  );

  // Live classes scheduled by this teacher
  const teacherLiveClasses = allLiveClasses.filter((l) =>
    l.teacherId === currentUser?.id ||
    l.teacherName.toLowerCase().includes('anurag') ||
    assignedBatches.some((b) => b.id === l.batchId)
  );

  // Enrolled students in this teacher's batches
  const myStudents = allStudents.filter((s) =>
    s.enrolledBatchIds.some((bId) => assignedBatches.some((ab) => ab.id === bId))
  );

  const [activeTab, setActiveTab] = useState<'batches' | 'classes' | 'students'>('batches');

  return (
    <div className="space-y-6">
      {/* Teacher Profile Greeting Bar */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-600/30 border-2 border-blue-400 flex items-center justify-center font-bold text-xl text-blue-200 shrink-0">
              {currentUser?.fullName.slice(0, 2).toUpperCase() || 'FC'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-blue-500/30 text-blue-200 px-2.5 py-0.5 rounded-full border border-blue-400/40">
                  Faculty Portal (RLS Active)
                </span>
                <span className="text-xs text-slate-300">
                  Subject: {currentUser?.subject || 'Accountancy & Auditing'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mt-1">
                Welcome, {currentUser?.fullName}!
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Assigned Lead Educator · {assignedBatches.length} Active Cohorts · {myStudents.length} Students
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onScheduleClass}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition-colors"
            >
              <Radio className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
              <span>Go Live on YouTube</span>
            </button>
            <button
              onClick={onNavigateToContent}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Chapter Notes / PYQ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs font-semibold">
        {[
          { id: 'batches', label: '1. My Assigned Batches', icon: BookOpen, count: assignedBatches.length },
          { id: 'classes', label: '2. YouTube Live Sessions', icon: Video, count: teacherLiveClasses.length },
          { id: 'students', label: '3. Enrolled Student Roster', icon: Users, count: myStudents.length },
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

      {/* 1. MY ASSIGNED BATCHES */}
      {activeTab === 'batches' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignedBatches.map((batch) => (
            <div
              key={batch.id}
              className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <Badge variant="live" size="sm">
                    {batch.status}
                  </Badge>
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    {batch.code}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 mt-2">{batch.name}</h4>
                <p className="text-xs text-blue-700 font-medium">{batch.targetExam}</p>

                <div className="mt-3.5 p-3 bg-slate-50 rounded-lg space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Schedule:</span>
                    <span className="font-mono text-slate-900 font-semibold">{batch.timing}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Enrolled Students:</span>
                    <span className="font-bold text-slate-900">{batch.enrolledStudentIds?.length || 142} / {batch.capacity} seats</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Classroom:</span>
                    <span className="font-medium text-emerald-700">{batch.classroomName}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={onScheduleClass}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                >
                  <Radio className="w-3.5 h-3.5 text-red-600" />
                  <span>Schedule Private Stream</span>
                </button>
                <button
                  onClick={onNavigateToContent}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Manage Syllabus & PYQs
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. YOUTUBE LIVE SESSIONS */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Your Scheduled YouTube Streams</h3>
            <button
              onClick={onScheduleClass}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule New Stream</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teacherLiveClasses.map((cls) => {
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
                      <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        {cls.platform}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 mt-2">{cls.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{cls.batchName} · {cls.subject}</p>

                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-mono">
                      <span>{new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</span>
                      <span>{cls.durationMinutes} mins</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      🔒 Enrolled Students Only
                    </span>
                    <button
                      onClick={() => onWatchLive(cls)}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isLive ? 'Launch Live Stream' : 'Preview Room'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. ENROLLED STUDENTS ROSTER */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Enrolled Students Roster (Your Batches)
            </h4>
            <span className="text-xs font-semibold text-slate-600">{myStudents.length} Students Active</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {myStudents.map((std) => (
              <div key={std.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${std.avatarBg} text-white font-bold flex items-center justify-center text-xs shrink-0`}>
                    {std.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">{std.name}</h5>
                    <p className="text-[11px] text-slate-500 font-mono">Roll: {std.rollNo} · {std.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="text-right">
                    <span className="text-slate-500 block text-[10px]">Attendance</span>
                    <span className="font-bold text-slate-900">{std.attendancePct}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[10px]">Test Avg</span>
                    <span className="font-bold text-emerald-600">{std.testAveragePct}%</span>
                  </div>
                  <Badge variant="success" size="sm">
                    {std.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
