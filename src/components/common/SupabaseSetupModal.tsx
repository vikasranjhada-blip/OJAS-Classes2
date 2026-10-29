import React, { useState } from 'react';
import { Modal } from './Modal';
import { isSupabaseConfigured, testSupabaseConnection } from '../../services/supabase';
import {
  Database,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Terminal,
  Lock,
  Server,
  Layers,
} from 'lucide-react';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    connected: boolean;
    message: string;
    url?: string;
    latencyMs?: number;
  } | null>(null);

  const [copiedMigration, setCopiedMigration] = useState(false);

  const configured = isSupabaseConfigured();

  const handleTest = async () => {
    setTesting(true);
    const result = await testSupabaseConnection();
    setTestResult(result);
    setTesting(false);
  };

  const copyMigrationPath = () => {
    navigator.clipboard.writeText('/supabase/migrations/20261029000000_init_ojas_academy.sql');
    setCopiedMigration(true);
    setTimeout(() => setCopiedMigration(false), 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supabase PostgreSQL & Auth Integration Guide"
      subtitle="Complete walkthrough: schema migration, Row Level Security (RLS), and environment configuration"
      maxWidth="3xl"
      footer={
        <div className="flex items-center justify-between w-full text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span>Never expose <code>service_role</code> key in client applications.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="space-y-5 text-xs">
        {/* Status Banner */}
        <div
          className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
            configured
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/70 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-lg text-white mt-0.5 ${
                configured ? 'bg-emerald-600' : 'bg-amber-600'
              }`}
            >
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm">
                  {configured ? 'Supabase Credentials Detected' : 'Local Prototype & Sandbox Mode Active'}
                </h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    configured ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
                  }`}
                >
                  {configured ? 'Connected' : 'Offline / Seed Storage'}
                </span>
              </div>
              <p className="mt-1 leading-relaxed text-xs opacity-90">
                {configured
                  ? 'Your web client is targeting live Supabase authentication & relational tables.'
                  : 'The platform is operating with persistent local demo data. You can switch between Super Admin, Teacher, and Student roles at any time using the top bar to verify access restrictions.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleTest}
            disabled={testing}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold rounded-lg shadow-2xs transition-colors shrink-0 flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>Test Connection</span>
          </button>
        </div>

        {/* Diagnostic Test Output */}
        {testResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs ${
              testResult.connected
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 font-bold mb-1">
              {testResult.connected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600" />
              )}
              <span>Connection Test Result</span>
              {testResult.latencyMs && (
                <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                  {testResult.latencyMs}ms
                </span>
              )}
            </div>
            <p className="leading-relaxed">{testResult.message}</p>
          </div>
        )}

        {/* Step-by-Step Setup Instructions */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 text-sm">4-Step Production Setup Instructions</h4>

          {/* Step 1 */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Step 1: Create Supabase Project</span>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
              >
                <span>Supabase Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Create a new project in your nearest region (e.g. Mumbai <code>ap-south-1</code> for Indian Edtech latency optimization).
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Step 2: Run the Provided SQL Migration</span>
              <button
                onClick={copyMigrationPath}
                className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedMigration ? 'Copied Path!' : 'Copy Migration Path'}</span>
              </button>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Open the <strong>SQL Editor</strong> in your Supabase dashboard and execute the migration file located at:
            </p>
            <div className="p-2 bg-slate-900 text-teal-300 font-mono text-[11px] rounded-lg overflow-x-auto">
              supabase/migrations/20261029000000_init_ojas_academy.sql
            </div>
            <p className="text-[11px] text-slate-500">
              This migration creates all 6 tables (<code>profiles</code>, <code>courses</code>, <code>batches</code>, <code>batch_enrollments</code>, <code>course_sections</code>, <code>lessons</code>), indexes, and activates Row Level Security (RLS) on all tables.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900">Step 3: Configure Environment Variables</span>
            <p className="text-slate-600 leading-relaxed">
              In your Supabase project settings under <strong>Project Settings → API</strong>, copy the Project URL and anon public key:
            </p>
            <div className="p-3 bg-slate-900 text-slate-200 font-mono text-[11px] rounded-lg space-y-1">
              <div className="text-slate-400"># In your .env file:</div>
              <div>VITE_SUPABASE_URL="https://xyzcompany.supabase.co"</div>
              <div>VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6..."</div>
            </div>
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
              <span><strong>Security Requirement 10:</strong> Never put the secret <code>service_role</code> key in the frontend. Only the public <code>anon</code> key is safe.</span>
            </div>
          </div>

          {/* Step 4: Row Level Security Matrix */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900">Step 4: Row Level Security (RLS) Access Matrix</span>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-200/70 font-bold text-slate-800">
                  <tr>
                    <th className="p-2">Table</th>
                    <th className="p-2">Super Admin</th>
                    <th className="p-2">Teacher</th>
                    <th className="p-2">Student</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  <tr>
                    <td className="p-2 font-mono font-bold">profiles</td>
                    <td className="p-2 text-emerald-700">Full CRUD</td>
                    <td className="p-2 text-blue-700">Self + Enrolled Students</td>
                    <td className="p-2 text-slate-700">Self Only</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono font-bold">courses</td>
                    <td className="p-2 text-emerald-700">Full CRUD</td>
                    <td className="p-2 text-blue-700">Assigned Courses</td>
                    <td className="p-2 text-slate-700">Published Only</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono font-bold">batches</td>
                    <td className="p-2 text-emerald-700">Full CRUD</td>
                    <td className="p-2 text-blue-700">Assigned Batches Only</td>
                    <td className="p-2 text-slate-700">Enrolled Batches Only</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono font-bold">lessons</td>
                    <td className="p-2 text-emerald-700">Full CRUD</td>
                    <td className="p-2 text-blue-700">Manage Course Lessons</td>
                    <td className="p-2 text-slate-700">Free Preview + Enrolled Only</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
