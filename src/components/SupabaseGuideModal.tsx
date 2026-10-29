import React, { useState } from 'react';
import { Modal } from './common/Modal';
import { SUPABASE_SQL_SCHEMA, SUPABASE_CONNECTION_GUIDE } from '../services/supabaseSchema';
import { Copy, Check, Database, Code2, Server, ExternalLink } from 'lucide-react';

interface SupabaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseGuideModal: React.FC<SupabaseGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'guide'>('sql');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supabase Backend Architecture & Migration Guide"
      subtitle="Complete PostgreSQL schema & integration guide for taking My Academy from UI Prototype to Live Production"
      maxWidth="3xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>13 Relational Tables Configured with Foreign Keys & Indexes</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
          >
            Close Guide
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Architecture callout */}
        <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-lg flex items-start gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0 mt-0.5">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900">
              Clean Decoupled Architecture Ready for Supabase
            </h4>
            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
              All UI components in My Academy interface query the standardized repository layer in{' '}
              <code className="bg-blue-100 px-1 py-0.5 rounded font-mono text-[11px] text-blue-900">
                src/services/storage.ts
              </code>
              . When ready to go live, you can replace the local storage provider with the official{' '}
              <code className="bg-blue-100 px-1 py-0.5 rounded font-mono text-[11px] text-blue-900">
                @supabase/supabase-js
              </code>{' '}
              client without touching a single component!
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setActiveTab('sql')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'sql'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>PostgreSQL SQL DDL Schema</span>
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'guide'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Step-by-Step Connection Instructions</span>
            </button>
          </div>

          {activeTab === 'sql' && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">SQL Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy SQL Schema</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Tab content */}
        {activeTab === 'sql' ? (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Ready to paste directly into Supabase SQL Editor:</span>
              <span className="font-mono text-[11px]">13 Tables · 5 Indexes · Cascading Foreign Keys</span>
            </div>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto max-h-[380px] leading-relaxed selection:bg-blue-500">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none text-slate-700 space-y-4 max-h-[380px] overflow-y-auto pr-2">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h5 className="font-semibold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-2">
                Step 1: Setup Supabase Project
              </h5>
              <p className="text-xs text-slate-600">
                Log into Supabase and create a new project. Select region (e.g. South Asia - Mumbai for
                Indian edtech platforms for ultra-low latency).
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h5 className="font-semibold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-2">
                Step 2: Run Database DDL
              </h5>
              <p className="text-xs text-slate-600">
                Open the Supabase SQL Editor and run the SQL script from the SQL tab. It builds the complete
                schema for students, batches, teachers, courses, sections, lessons, live classes, questions,
                products, orders, and academy settings.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h5 className="font-semibold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-2">
                Step 3: Install SDK & Add Environment Variables
              </h5>
              <div className="p-2.5 bg-slate-900 text-slate-200 rounded font-mono text-xs my-2">
                npm install @supabase/supabase-js
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Set <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">VITE_SUPABASE_URL</code>{' '}
                and{' '}
                <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">
                  VITE_SUPABASE_ANON_KEY
                </code>{' '}
                in your production environment or Settings tab.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h5 className="font-semibold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-2">
                Step 4: Enable Authentication & Storage Buckets
              </h5>
              <p className="text-xs text-slate-600">
                Create Supabase Storage buckets named <code className="font-mono text-xs">course-assets</code>,{' '}
                <code className="font-mono text-xs">lecture-notes-pdf</code>, and{' '}
                <code className="font-mono text-xs">student-avatars</code> with public read policies.
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
