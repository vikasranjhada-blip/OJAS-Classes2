import React, { useState } from 'react';
import { storage } from '../../services/storage';
import { Badge } from '../common/Badge';
import {
  BarChart3,
  Calendar,
  Download,
  Users,
  CheckCircle2,
  TrendingUp,
  Award,
  BookOpen,
  HelpCircle,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [activeDimension, setActiveDimension] = useState<
    'attendance' | 'completion' | 'practice' | 'tests'
  >('attendance');

  const students = storage.getStudents();
  const batches = storage.getBatches();
  const courses = storage.getCourses();

  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Mock test leaderboard data for UPPCL & UPSSSC
  const testResults = [
    { rank: 1, name: 'Ravi Shankar Shukla', rollNo: 'OJAS-2026-0145', score: 182, maxScore: 200, percentile: 99.85, batch: 'UPPCL Assistant Accountant 2026 - Alpha' },
    { rank: 2, name: 'Pooja Verma', rollNo: 'OJAS-2026-0142', score: 178, maxScore: 200, percentile: 99.42, batch: 'UPSSSC Auditor & Accountant Ranker' },
    { rank: 3, name: 'Siddharth Trivedi', rollNo: 'OJAS-2026-0099', score: 172, maxScore: 200, percentile: 99.20, batch: 'UPPCL Assistant Accountant 2026 - Alpha' },
    { rank: 4, name: 'Aditya Srivastava', rollNo: 'OJAS-2026-0147', score: 168, maxScore: 200, percentile: 98.70, batch: 'One-Day Govt Exams Master Foundation' },
    { rank: 5, name: 'Ananya Bajpai', rollNo: 'OJAS-2026-0146', score: 164, maxScore: 200, percentile: 97.90, batch: 'UPSSSC Auditor & Accountant Ranker' },
    { rank: 6, name: 'Priya Sharma', rollNo: 'OJAS-2026-0143', score: 159, maxScore: 200, percentile: 97.10, batch: 'UPPCL Assistant Accountant 2026 - Alpha' },
  ];

  // Subject accuracy practice metrics
  const subjectAccuracy = [
    { subject: 'Accountancy & Auditing', attempted: 6420, correct: 5392, accuracy: 84.0, color: 'bg-blue-600' },
    { subject: 'Income Tax & TDS', attempted: 4890, correct: 3960, accuracy: 81.0, color: 'bg-emerald-600' },
    { subject: 'Computer CCC / O-Level Qualifying', attempted: 7120, correct: 6194, accuracy: 87.0, color: 'bg-purple-600' },
    { subject: 'General Hindi (Samanya Hindi)', attempted: 5800, correct: 5162, accuracy: 89.0, color: 'bg-teal-600' },
    { subject: 'Quantitative Aptitude & Reasoning', attempted: 4320, correct: 3326, accuracy: 77.0, color: 'bg-amber-600' },
    { subject: 'General Studies (GS/GK)', attempted: 3900, correct: 3042, accuracy: 78.0, color: 'bg-indigo-600' },
  ];

  const handleExport = () => {
    setExportNotice('Academic performance report downloaded as PDF/CSV summary.');
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Academic Analytics & Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor attendance fidelity, curriculum pacing, question accuracy, and All India Test Series standings
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors self-start sm:self-auto whitespace-nowrap"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export Analytics Report</span>
        </button>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center justify-between">
          <span>✓ {exportNotice}</span>
          <button onClick={() => setExportNotice(null)} className="text-emerald-700 hover:text-emerald-900">Dismiss</button>
        </div>
      )}

      {/* Dimension Selector Tabs */}
      <div className="p-1.5 bg-slate-100 rounded-xl flex items-center gap-1 overflow-x-auto">
        {[
          { id: 'attendance', label: '1. Attendance Analytics', icon: Users },
          { id: 'completion', label: '2. Syllabus & Lesson Completion', icon: BookOpen },
          { id: 'practice', label: '3. Practice Questions & Accuracy', icon: HelpCircle },
          { id: 'tests', label: '4. Test Series Scores & AIR', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSel = activeDimension === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveDimension(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                isSel
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSel ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. ATTENDANCE ANALYTICS */}
      {activeDimension === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Average Academy Attendance
              </span>
              <div className="text-2xl font-bold text-emerald-600 font-mono mt-1">91.4%</div>
              <p className="text-[11px] text-slate-500 mt-1">
                +2.4% higher compared to last term
              </p>
            </div>
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Live Classroom Punctuality
              </span>
              <div className="text-2xl font-bold text-blue-600 font-mono mt-1">96.8%</div>
              <p className="text-[11px] text-slate-500 mt-1">
                Average join time &lt; 2 minutes after stream start
              </p>
            </div>
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">
                Low Attendance Flag (&lt;75%)
              </span>
              <div className="text-2xl font-bold text-rose-600 font-mono mt-1">
                {students.filter((s) => s.attendancePct < 75).length} Students
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Automated SMS sent to parents</p>
            </div>
          </div>

          {/* Batch-wise Attendance Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Batch-wise Attendance Breakdown</h3>
              <span className="text-xs text-slate-500 font-mono">Last 30 Days Record</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <th className="py-3 px-4">Cohort Name</th>
                    <th className="py-3 px-4">Faculty Incharge</th>
                    <th className="py-3 px-4">Total Students</th>
                    <th className="py-3 px-4 text-center">Attendance Rate</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {batches.map((b) => {
                    const rate = b.status === 'Archived' ? 95 : b.code.includes('JEE') ? 94.5 : 89.2;
                    return (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {b.name}
                          <span className="block text-[11px] font-normal text-slate-500 font-mono">
                            {b.code}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{b.teacherName}</td>
                        <td className="py-3 px-4 font-mono">{b.enrolledStudentIds.length}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600">
                          {rate}%
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="success" size="sm">
                            Optimal
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. LESSON COMPLETION */}
      {activeDimension === 'completion' && (
        <div className="space-y-6">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Curriculum Progression & Syllabus Completion
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Track video lecture watch rate, PDF notes downloads, and chapter progress
            </p>

            <div className="space-y-5">
              {courses.map((c) => {
                const completedPct = c.status === 'Draft' ? 0 : Math.round(55 + (c.lessonsCount % 35));
                return (
                  <div key={c.id} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{c.title}</span>
                        <span className="text-slate-400 ml-2 font-mono text-[11px]">
                          ({c.category})
                        </span>
                      </div>
                      <div className="font-mono text-slate-700">
                        <span className="font-bold text-slate-900">{completedPct}%</span> syllabus
                        unlocked
                      </div>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${completedPct}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{c.sectionsCount} Sections organized</span>
                      <span className="font-mono">{c.lessonsCount} video/text lessons</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. PRACTICE QUESTIONS & ACCURACY */}
      {activeDimension === 'practice' && (
        <div className="space-y-6">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Practice Question Solving & Accuracy by Subject
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Aggregated accuracy of student submissions from Chapter Quizzes and DPP (Daily Practice Problems)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjectAccuracy.map((sub) => (
                <div
                  key={sub.subject}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{sub.subject}</span>
                    <span className="font-mono font-bold text-base text-slate-900">
                      {sub.accuracy}%
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full ${sub.color} rounded-full`}
                      style={{ width: `${sub.accuracy}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span>{sub.correct.toLocaleString('en-IN')} correct answers</span>
                    <span>{sub.attempted.toLocaleString('en-IN')} attempted</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. TEST SCORES & LEADERBOARD */}
      {activeDimension === 'tests' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                All India Grand Mock Test #4 Scorecard
              </h3>
              <p className="text-xs text-slate-500">
                Conducted October 2026 across 4,200+ registered aspirants
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
              Standardized Testing
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-4">AIR Rank</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Assigned Cohort</th>
                  <th className="py-3 px-4 text-center">Score / Max</th>
                  <th className="py-3 px-4 text-center">Percentile</th>
                  <th className="py-3 px-4 text-center">Standing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {testResults.map((res) => (
                  <tr key={res.rollNo} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      #{res.rank}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{res.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{res.rollNo}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{res.batch}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                      {res.score} / {res.maxScore}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600">
                      {res.percentile}%ile
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="success" size="sm">
                        Top Tier
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
