import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert, ArrowRight, RefreshCw, GraduationCap, Shield } from 'lucide-react';
import { PageId } from '../../types';

interface UnauthorizedStateProps {
  requiredRole?: string;
  onNavigate: (page: PageId) => void;
}

export const UnauthorizedState: React.FC<UnauthorizedStateProps> = ({
  requiredRole = 'Super Admin',
  onNavigate,
}) => {
  const { currentUser, role, switchRolePersona, openAuthModal } = useAuth();

  return (
    <div className="min-h-[420px] p-8 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-slate-200 shadow-xs max-w-xl mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-2xs">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <span className="text-[11px] font-bold text-rose-700 bg-rose-100/70 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
        Row Level Security (RLS) Restricted Area
      </span>

      <h3 className="text-xl font-bold text-slate-900">
        Access Restricted to {requiredRole}
      </h3>

      <p className="text-xs text-slate-500 mt-2 max-w-md leading-relaxed">
        You are currently signed in as <strong>{currentUser?.fullName || 'User'}</strong> with the role of{' '}
        <span className="font-semibold text-slate-800 capitalize bg-slate-100 px-1.5 py-0.5 rounded font-mono">
          {role}
        </span>. Under Supabase Row Level Security policies, this administrative section is restricted to authorized {requiredRole} accounts.
      </p>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {role === 'student' ? (
          <button
            onClick={() => onNavigate('student-portal')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Go to My Student Portal</span>
          </button>
        ) : role === 'teacher' ? (
          <button
            onClick={() => onNavigate('teacher-portal')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Go to Faculty Portal</span>
          </button>
        ) : null}

        <button
          onClick={() => switchRolePersona('super_admin')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
        >
          <Shield className="w-4 h-4 text-amber-400" />
          <span>Switch to Super Admin Test Account</span>
        </button>

        <button
          onClick={() => openAuthModal('login')}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
        >
          Sign In as Different User
        </button>
      </div>
    </div>
  );
};
