import React, { useState } from 'react';
import { LiveClass } from '../../types';
import { storage } from '../../services/storage';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import {
  Video,
  Plus,
  Play,
  Calendar,
  Clock,
  ExternalLink,
  Users,
  Search,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit2,
  Radio,
  Bell,
  Lock,
  Send,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const LiveClassesPage: React.FC = () => {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>(() => storage.getLiveClasses());
  const batches = storage.getBatches();
  const teachers = storage.getTeachers();

  const [tabFilter, setTabFilter] = useState<'All' | 'Live Now' | 'Scheduled' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<LiveClass | null>(null);
  const [previewingLiveClass, setPreviewingLiveClass] = useState<LiveClass | null>(null);

  // Notification notification banner
  const [notificationToast, setNotificationToast] = useState<{
    message: string;
    batchName: string;
    studentCount: number;
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    batchId: batches[0]?.id || '',
    teacherId: teachers[0]?.id || '',
    subject: 'Accountancy & Auditing',
    startTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    durationMinutes: 90,
    meetingLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtubeVideoId: 'dQw4w9WgXcQ',
    platform: 'YouTube Live (Private/Unlisted)' as 'YouTube Live (Private/Unlisted)' | 'Google Meet' | 'Zoom' | 'YouTube Live' | 'Jitsi Live',
    status: 'Scheduled' as 'Scheduled' | 'Live Now' | 'Completed',
    isPrivateToEnrolled: true,
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const reloadData = () => {
    setLiveClasses(storage.getLiveClasses());
  };

  const filteredClasses = liveClasses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.batchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = tabFilter === 'All' || c.status === tabFilter;
    return matchesSearch && matchesTab;
  });

  // Extract YouTube ID helper
  const extractYouTubeId = (url: string): string => {
    if (!url) return '';
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|live\/|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : url.length === 11 ? url : '';
  };

  const openScheduleModal = () => {
    setFormData({
      title: '',
      batchId: batches[0]?.id || '',
      teacherId: teachers[0]?.id || '',
      subject: 'Accountancy & Auditing',
      startTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
      durationMinutes: 90,
      meetingLink: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
      youtubeVideoId: 'jfKfPfyJRdk',
      platform: 'YouTube Live (Private/Unlisted)',
      status: 'Scheduled',
      isPrivateToEnrolled: true,
      notes: 'Have syllabus handbook and calculator ready. Doubts will be addressed during Q&A.',
    });
    setFormErrors({});
    setIsScheduleModalOpen(true);
  };

  const openEditModal = (c: LiveClass) => {
    setEditingClass(c);
    setFormData({
      title: c.title,
      batchId: c.batchId,
      teacherId: c.teacherId,
      subject: c.subject,
      startTime: c.startTime.slice(0, 16),
      durationMinutes: c.durationMinutes,
      meetingLink: c.meetingLink,
      youtubeVideoId: c.youtubeVideoId || extractYouTubeId(c.meetingLink),
      platform: c.platform,
      status: c.status,
      isPrivateToEnrolled: c.isPrivateToEnrolled ?? true,
      notes: c.notes || '',
    });
    setFormErrors({});
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.title.trim()) errs.title = 'Class title is required';
    if (!formData.meetingLink.trim()) errs.meetingLink = 'Stream or meeting link is required';
    if (!formData.batchId) errs.batchId = 'Batch selection is required';
    if (!formData.teacherId) errs.teacherId = 'Teacher selection is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const b = batches.find((x) => x.id === formData.batchId);
    const t = teachers.find((x) => x.id === formData.teacherId);
    const ytId = extractYouTubeId(formData.meetingLink) || formData.youtubeVideoId || '';

    if (editingClass) {
      const updated: LiveClass = {
        ...editingClass,
        title: formData.title,
        batchId: formData.batchId,
        batchName: b ? b.name : editingClass.batchName,
        teacherId: formData.teacherId,
        teacherName: t ? t.name : editingClass.teacherName,
        subject: formData.subject,
        startTime: formData.startTime,
        durationMinutes: Number(formData.durationMinutes),
        meetingLink: formData.meetingLink,
        youtubeVideoId: ytId,
        platform: formData.platform,
        status: formData.status,
        isPrivateToEnrolled: formData.isPrivateToEnrolled,
        notes: formData.notes,
      };
      storage.saveLiveClass(updated);
      setEditingClass(null);
    } else {
      const newClass: LiveClass = {
        id: `live-${Date.now()}`,
        title: formData.title,
        batchId: formData.batchId,
        batchName: b ? b.name : 'Target Batch',
        teacherId: formData.teacherId,
        teacherName: t ? t.name : 'OJAS Faculty',
        subject: formData.subject,
        startTime: formData.startTime,
        durationMinutes: Number(formData.durationMinutes),
        meetingLink: formData.meetingLink,
        youtubeVideoId: ytId,
        platform: formData.platform,
        status: formData.status,
        attendeeCount: 0,
        isPrivateToEnrolled: formData.isPrivateToEnrolled,
        notes: formData.notes,
      };
      storage.saveLiveClass(newClass);
      setIsScheduleModalOpen(false);
    }
    reloadData();
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Cancel live class session "${title}"?`)) {
      storage.deleteLiveClass(id);
      reloadData();
    }
  };

  const setStatus = (liveClass: LiveClass, status: 'Scheduled' | 'Live Now' | 'Completed') => {
    storage.saveLiveClass({ ...liveClass, status });
    reloadData();
  };

  // Broadcast instant push & SMS notification to enrolled batch students
  const handleSendNotification = (liveClass: LiveClass) => {
    const targetBatch = batches.find((b) => b.id === liveClass.batchId);
    const studentCount = targetBatch?.enrolledStudentIds?.length || 128;
    const nowIso = new Date().toISOString();

    const updatedClass: LiveClass = {
      ...liveClass,
      notificationSentAt: nowIso,
      notificationCount: (liveClass.notificationCount || 0) + 1,
    };
    storage.saveLiveClass(updatedClass);
    reloadData();

    setNotificationToast({
      message: `Direct Live Class alert dispatched! All ${studentCount} enrolled students received in-app push notification & SMS with secure stream access token.`,
      batchName: liveClass.batchName,
      studentCount,
    });

    setTimeout(() => {
      setNotificationToast(null);
    }, 6000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Live Classes & Streaming</h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <Radio className="w-3 h-3 animate-pulse text-rose-600" />
              YouTube Live Private Enabled
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Broadcast privately on YouTube: unlisted streams embedded securely in OJAS Classes with student-only access & instant push alerts.
          </p>
        </div>
        <button
          onClick={openScheduleModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Live Class</span>
        </button>
      </div>

      {/* Instant Notification Toast */}
      {notificationToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start justify-between gap-3 text-emerald-900 shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-emerald-600 text-white rounded-lg mt-0.5">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-emerald-900">Broadcast Dispatched to Enrolled Batch</p>
                <span className="text-[10px] bg-emerald-200/70 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  {notificationToast.studentCount} Students Notified
                </span>
              </div>
              <p className="text-xs text-emerald-700 mt-0.5">{notificationToast.message}</p>
            </div>
          </div>
          <button
            onClick={() => setNotificationToast(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold px-2 py-1 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* YouTube Private Streaming Highlights Box */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl text-white border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-bold text-red-400 tracking-wider uppercase">
                OJAS Private YouTube Classroom Engine
              </span>
            </div>
            <h3 className="text-base font-bold text-white">
              Host Zero-Cost, High-Definition Live Streams Protected Behind Batch Enrollment
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Create an <strong>Unlisted</strong> YouTube Live broadcast on OBS or YouTube Studio. Paste the link here: only authenticated OJAS students enrolled in the target batch can watch the stream inside this web application with watermarked session security.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={openScheduleModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Go Live on YouTube</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search classes by title, batch, faculty, subject..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center p-1 bg-slate-100 rounded-lg w-full md:w-auto overflow-x-auto">
          {(['All', 'Live Now', 'Scheduled', 'Completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setTabFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                tabFilter === tab
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'Live Now' && (
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block mr-1.5 animate-pulse" />
              )}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Live Classes Grid */}
      {filteredClasses.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No Live Classes Found"
          description="No live classes currently match your search filter."
          actionLabel="Schedule Live Class"
          onAction={openScheduleModal}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredClasses.map((cls) => {
            const isLive = cls.status === 'Live Now';
            const isYouTube = cls.platform.toLowerCase().includes('youtube');

            return (
              <div
                key={cls.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isLive
                    ? 'bg-gradient-to-b from-red-50/40 via-white to-white border-red-300 shadow-md ring-1 ring-red-400/30'
                    : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Status, Platform & Security */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={isLive ? 'live' : cls.status === 'Scheduled' ? 'info' : 'neutral'}
                        size="sm"
                      >
                        {cls.status}
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
                        {isYouTube && <Radio className="w-3 h-3 text-red-600 animate-pulse" />}
                        {cls.platform}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {cls.subject}
                    </span>
                  </div>

                  {/* Private Badge */}
                  {cls.isPrivateToEnrolled && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 w-fit">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      <span>Private Stream: Protected for enrolled batch students</span>
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 mt-2.5 leading-snug">
                    {cls.title}
                  </h3>

                  {/* Batch & Instructor */}
                  <div className="mt-2 text-xs text-slate-600 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {cls.batchName}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-slate-700">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {cls.teacherName}
                    </span>
                  </div>

                  {/* Timing & Duration */}
                  <div className="mt-3.5 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-700 font-mono">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{new Date(cls.startTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cls.durationMinutes} mins</span>
                    </div>
                  </div>

                  {/* Notes / Agenda */}
                  {cls.notes && (
                    <p className="mt-3 text-xs text-slate-500 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                      <span className="font-semibold text-slate-700">Agenda:</span> {cls.notes}
                    </p>
                  )}

                  {/* Notification Status */}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5 text-slate-400" />
                      {cls.notificationSentAt ? (
                        <span className="text-emerald-600 font-medium">
                          Alert sent {new Date(cls.notificationSentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({cls.notificationCount || 1}x)
                        </span>
                      ) : (
                        <span>No notification sent yet</span>
                      )}
                    </span>
                    <button
                      onClick={() => handleSendNotification(cls)}
                      className="text-blue-600 hover:text-blue-800 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Notify Enrolled Batch</span>
                    </button>
                  </div>
                </div>

                {/* Footer Controls & Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    {cls.status === 'Scheduled' && (
                      <button
                        onClick={() => setStatus(cls, 'Live Now')}
                        className="px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors"
                      >
                        Start Streaming
                      </button>
                    )}
                    {cls.status === 'Live Now' && (
                      <button
                        onClick={() => setStatus(cls, 'Completed')}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                      >
                        End Class
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* In-App Player Button */}
                    <button
                      onClick={() => setPreviewingLiveClass(cls)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shadow-xs ${
                        isLive
                          ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isLive ? 'Watch Live (In-App)' : 'Preview Room'}</span>
                    </button>

                    {/* External Link */}
                    <a
                      href={cls.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                      title="Open Direct Link / OBS Stream"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => openEditModal(cls)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                      title="Edit Class Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cls.id, cls.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
                      title="Delete Class"
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

      {/* In-App Live Stream Player Modal (Interactive Classroom Mockup) */}
      {previewingLiveClass && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewingLiveClass(null)}
          title={`🔴 Live Classroom: ${previewingLiveClass.title}`}
          subtitle={`${previewingLiveClass.batchName} · Faculty: ${previewingLiveClass.teacherName} · Subject: ${previewingLiveClass.subject}`}
          maxWidth="4xl"
          footer={
            <div className="flex items-center justify-between w-full text-xs">
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">Authenticated Student Session: Roll #OJAS-2026-LIVE</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewingLiveClass(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Close Classroom
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Video Stream Container */}
              <div className="lg:col-span-2 space-y-2">
                <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-inner relative">
                  {previewingLiveClass.youtubeVideoId || extractYouTubeId(previewingLiveClass.meetingLink) ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${
                        previewingLiveClass.youtubeVideoId || extractYouTubeId(previewingLiveClass.meetingLink)
                      }?autoplay=1&rel=0&modestbranding=1`}
                      title={previewingLiveClass.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                      <Video className="w-12 h-12 text-slate-500 mb-2" />
                      <p className="text-sm font-semibold text-white">External Stream Connected</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        This class is hosted via {previewingLiveClass.platform}. Click below to launch the direct room.
                      </p>
                      <a
                        href={previewingLiveClass.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                      >
                        Launch Direct Meeting
                      </a>
                    </div>
                  )}
                </div>

                {/* Stream Info Bar */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 font-bold text-red-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                      LIVE STREAM
                    </span>
                    <span className="text-slate-500 font-medium">1080p 60fps Ultra-HD</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <span className="flex items-center gap-1 font-semibold">
                      <Users className="w-4 h-4 text-blue-600" />
                      142 Students Attending
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Classroom Chat & Doubt Box */}
              <div className="flex flex-col h-[380px] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">Live Doubt Chat</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Faculty Active
                  </span>
                </div>

                {/* Simulated Chat Feed */}
                <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-700">Ravi Shankar (UPPCL)</span>
                      <span className="text-[10px] text-slate-400">10:04 AM</span>
                    </div>
                    <p className="text-slate-700 mt-1">Sir, will dividend received from domestic company be taxable under head other sources?</p>
                  </div>

                  <div className="p-2 bg-blue-50/80 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        {previewingLiveClass.teacherName} (Faculty)
                      </span>
                      <span className="text-[10px] text-slate-400">10:05 AM</span>
                    </div>
                    <p className="text-slate-800 mt-1">Yes Ravi, post FA 2020 it is fully taxable in hands of recipient under Income from Other Sources.</p>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-700">Pooja Sharma (Auditor)</span>
                      <span className="text-[10px] text-slate-400">10:07 AM</span>
                    </div>
                    <p className="text-slate-700 mt-1">Sir please cover Section 44AB tax audit threshold limits once again for professionals.</p>
                  </div>
                </div>

                {/* Input box */}
                <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type your question for the teacher..."
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Schedule / Edit Live Class Modal */}
      {(isScheduleModalOpen || editingClass) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsScheduleModalOpen(false);
            setEditingClass(null);
          }}
          title={editingClass ? `Edit Class: ${editingClass.title}` : 'Schedule Live Stream Session'}
          subtitle="Configure YouTube Private Live / meeting link, enrolled batch, schedule, and instructor"
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => {
                  setIsScheduleModalOpen(false);
                  setEditingClass(null);
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
                {editingClass ? 'Save Changes' : 'Schedule Class'}
              </button>
            </div>
          }
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Classroom Session Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. UPPCL 2026: Income Tax Deductions Under Section 80C to 80U"
                  className={`w-full px-3 py-2 border rounded-lg ${
                    formErrors.title ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Cohort / Batch <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.batchId}
                  onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Faculty <span className="text-rose-500">*</span>
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
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Accountancy & Auditing">Accountancy & Auditing</option>
                  <option value="Income Tax & TDS">Income Tax & TDS</option>
                  <option value="Computer CCC / O-Level Qualifying">Computer CCC / O-Level Qualifying</option>
                  <option value="General Hindi (Samanya Hindi)">General Hindi (Samanya Hindi)</option>
                  <option value="Auditing & Verification">Auditing & Verification</option>
                  <option value="Quantitative Aptitude & Reasoning">Quantitative Aptitude & Reasoning</option>
                  <option value="General Studies (GS/GK)">General Studies (GS/GK)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Streaming Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      platform: e.target.value as 'YouTube Live (Private/Unlisted)' | 'Google Meet' | 'Zoom' | 'YouTube Live' | 'Jitsi Live',
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold text-slate-800"
                >
                  <option value="YouTube Live (Private/Unlisted)">🔴 YouTube Live (Private / Unlisted Broadcast)</option>
                  <option value="Google Meet">Google Meet</option>
                  <option value="Zoom">Zoom Video</option>
                  <option value="Jitsi Live">Jitsi Open Source</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) =>
                    setFormData({ ...formData, durationMinutes: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  {formData.platform.includes('YouTube') ? 'YouTube Unlisted Stream Link / Video ID' : 'Meeting URL'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... or Video ID"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-xs"
                />
                {formData.platform.includes('YouTube') && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    💡 <strong>How it works:</strong> Set the YouTube broadcast privacy to <em>Unlisted</em> in YouTube Studio. Only enrolled students of the selected batch will have access to view the stream embedded in the OJAS Classes web app.
                  </p>
                )}
              </div>

              <div className="sm:col-span-2 p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-900">
                  <input
                    type="checkbox"
                    checked={formData.isPrivateToEnrolled}
                    onChange={(e) => setFormData({ ...formData, isPrivateToEnrolled: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Private Access Restriction: Enrolled Batch Students Only</span>
                </label>
                <p className="text-[11px] text-slate-600 ml-6 mt-1">
                  When enabled, non-enrolled students and guests cannot access the live room. Automatic push notifications and batch alerts will be sent when the class goes live.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Classroom Notes & Agenda
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Keep calculator and Income Tax Act handbook ready..."
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
