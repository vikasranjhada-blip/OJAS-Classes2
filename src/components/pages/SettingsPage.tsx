import React, { useState } from 'react';
import { AcademySettings } from '../../types';
import { storage } from '../../services/storage';
import {
  Settings,
  Building,
  User,
  Database,
  Check,
  RotateCcw,
  ShieldAlert,
  Save,
  ExternalLink,
  Code2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { testSupabaseConnection, isSupabaseConfigured } from '../../services/supabase';

interface SettingsPageProps {
  onOpenSupabaseGuide: () => void;
  onResetDemo: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onOpenSupabaseGuide,
  onResetDemo,
}) => {
  const [settings, setSettings] = useState<AcademySettings>(() => storage.getSettings());
  const [activeTab, setActiveTab] = useState<'branding' | 'profile' | 'backend'>('branding');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    connected: boolean;
    message: string;
    url?: string;
    latencyMs?: number;
  } | null>(null);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    const res = await testSupabaseConnection();
    setTestResult(res);
    setTestingConnection(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Academy & System Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure institute branding, administrator details, and backend database integrations
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Settings Saved!
            </span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Prototype Disclaimer Banner */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-bold">Prototype Disclaimer & Transition Guide:</span> This is a UI
          prototype demonstrating high-fidelity coaching workflows. As specified in the brief,
          authentication, payments, cloud file uploads, and role security are simulated until a real
          backend (such as Supabase) is connected.
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
        <button
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'branding'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Academy Branding</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'profile'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Admin Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('backend')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'backend'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4 text-teal-600" />
          <span>Supabase & Backend Setup</span>
        </button>
      </div>

      {/* TAB 1: ACADEMY BRANDING */}
      {activeTab === 'branding' && (
        <form onSubmit={handleSave} className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-5 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Institute Identity & Public Profile</h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              These details appear on student invoices, report cards, and course certificates
            </p>
          </div>

          {/* Official Logo Display */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-xs flex items-center justify-center">
                <img
                  src={settings.logoUrl || '/assets/aistudio/2141b4f9-0816-4ef1-92ae-3ef08e0d2955_7d83b97c.jpg'}
                  alt="OJAS Classes Official Logo"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Official Brand Logo</div>
                <div className="text-slate-500 text-[11px]">
                  Loaded from active brand assets (/assets/aistudio/2141b4f9-0816-4ef1-92ae-3ef08e0d2955_7d83b97c.jpg)
                </div>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Active Brand Asset
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Coaching / Academy Name</label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Support Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Student Helpline Phone</label>
              <input
                type="text"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">GSTIN Registration</label>
              <input
                type="text"
                value={settings.gstNumber}
                onChange={(e) => setSettings({ ...settings, gstNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Currency Code</label>
              <input
                type="text"
                value={settings.currency}
                disabled
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono bg-slate-50 text-slate-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Registered Head Office Address
              </label>
              <textarea
                rows={2}
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: ADMIN PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-5 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Administrator Credentials</h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Super-admin role credentials for audit records and notifications
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {settings.adminName
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">{settings.adminName}</div>
              <div className="text-slate-500">{settings.adminRole}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Administrator Name</label>
              <input
                type="text"
                value={settings.adminName}
                onChange={(e) => setSettings({ ...settings, adminName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Admin Email Address</label>
              <input
                type="email"
                value={settings.adminEmail}
                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Role Title</label>
              <input
                type="text"
                value={settings.adminRole}
                onChange={(e) => setSettings({ ...settings, adminRole: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: BACKEND & SUPABASE ARCHITECTURE */}
      {activeTab === 'backend' && (
        <div className="space-y-5 text-xs">
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Supabase Backend Configuration</h3>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  How to link your live Supabase project when ready to move past the prototype stage
                </p>
              </div>
              <button
                onClick={onOpenSupabaseGuide}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-lg transition-colors"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>View Full SQL DDL</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Supabase Project URL (<code className="font-mono text-[11px]">VITE_SUPABASE_URL</code>)
                </label>
                <input
                  type="text"
                  value={settings.supabaseUrl}
                  onChange={(e) => setSettings({ ...settings, supabaseUrl: e.target.value })}
                  placeholder="https://your-project.supabase.co"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Supabase Anon Public API Key (<code className="font-mono text-[11px]">VITE_SUPABASE_ANON_KEY</code>)
                </label>
                <input
                  type="password"
                  value={settings.supabaseAnonKey}
                  onChange={(e) => setSettings({ ...settings, supabaseAnonKey: e.target.value })}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-2xs transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                <span>Test Supabase Connection</span>
              </button>
            </div>

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
                  <span>Status: {testResult.connected ? 'Connected' : 'Diagnostic Info'}</span>
                  {testResult.latencyMs && (
                    <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                      {testResult.latencyMs}ms
                    </span>
                  )}
                </div>
                <p>{testResult.message}</p>
              </div>
            )}

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-slate-600 leading-relaxed">
              <h5 className="font-bold text-slate-900">How to transition this codebase to production:</h5>
              <ol className="list-decimal list-inside space-y-1 text-slate-600">
                <li>Create a free or pro project on Supabase.</li>
                <li>Run the provided 13-table SQL DDL script in the Supabase SQL editor.</li>
                <li>Install <code className="font-mono text-[11px] bg-slate-200 px-1 py-0.5 rounded">@supabase/supabase-js</code>.</li>
                <li>Provide real environment variables in <code className="font-mono text-[11px] bg-slate-200 px-1 py-0.5 rounded">.env</code>.</li>
                <li>Substitute the <code className="font-mono text-[11px] bg-slate-200 px-1 py-0.5 rounded">storage.ts</code> repository methods with Supabase queries.</li>
              </ol>
            </div>
          </div>

          {/* Reset Demo Data Card */}
          <div className="p-5 bg-white rounded-xl border border-rose-200 shadow-xs flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-rose-900">Reset Local Demo Database</h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Clear all custom changes made in this session and restore the initial Indian coaching mock data.
              </p>
            </div>
            <button
              type="button"
              onClick={onResetDemo}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
