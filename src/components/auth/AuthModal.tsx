import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../../contexts/AuthContext';
import { Modal } from '../common/Modal';
import { UserRole } from '../../types';
import {
  Lock,
  Mail,
  User,
  Shield,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Phone,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    login,
    signup,
    isLoading,
    error,
    isConfigured,
    switchRolePersona,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>(authModalMode);
  const [showPassword, setShowPassword] = useState(false);

  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [targetExam, setTargetExam] = useState('UPPCL Assistant Accountant 2026');
  const [subject, setSubject] = useState('Accountancy & Auditing');
  const [formError, setFormError] = useState<string | null>(null);

  // Sync mode with context
  React.useEffect(() => {
    setMode(authModalMode);
    setFormError(null);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid email address');
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setFormError('Full name is required');
        return;
      }
      if (password && password.length < 6) {
        setFormError('Password must be at least 6 characters');
        return;
      }

      const res = await signup({
        email,
        password: password || undefined,
        fullName,
        role,
        phone,
        targetExam,
        subject: role === 'teacher' ? subject : undefined,
      });

      if (!res.success) {
        setFormError(res.error || 'Registration failed');
      }
    } else {
      const res = await login(email, password || undefined);
      if (!res.success) {
        setFormError(res.error || 'Authentication failed');
      }
    }
  };

  const selectDemoAccount = (targetRole: UserRole) => {
    switchRolePersona(targetRole);
    closeAuthModal();
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      title={mode === 'login' ? 'Sign In to OJAS Classes' : 'Create Student / Faculty Account'}
      subtitle={
        isConfigured
          ? 'Connected to live Supabase Authentication & PostgreSQL'
          : 'Running in Local Sandbox Mode (Instant login or connect Supabase in Settings)'
      }
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Mode Toggle Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setFormError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setFormError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error notification */}
        {(formError || error) && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{formError || error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ravi Shankar Shukla"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Account Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'student', label: 'Student', icon: GraduationCap },
                    { id: 'teacher', label: 'Faculty', icon: BookOpen },
                    { id: 'super_admin', label: 'Admin', icon: Shield },
                  ].map((r) => {
                    const Icon = r.icon;
                    const isSel = role === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id as UserRole)}
                        className={`p-2.5 rounded-lg border text-center flex flex-col items-center gap-1 transition-all ${
                          isSel
                            ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSel ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className="text-[11px]">{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {role === 'student' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Exam Goal</label>
                  <select
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="UPPCL Assistant Accountant 2026">UPPCL Assistant Accountant 2026</option>
                    <option value="UPSSSC Auditor & Assistant Accountant">UPSSSC Auditor & Assistant Accountant</option>
                    <option value="SSC CGL / CHSL (Govt Exam)">SSC CGL / CHSL (Govt Exam)</option>
                    <option value="UP Police SI & Constable">UP Police SI & Constable</option>
                    <option value="Railway RRB NTPC">Railway RRB NTPC</option>
                  </select>
                </div>
              )}

              {role === 'teacher' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teaching Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Accountancy & Auditing">Accountancy & Auditing</option>
                    <option value="Income Tax & TDS">Income Tax & TDS</option>
                    <option value="Computer CCC / O-Level">Computer CCC / O-Level Qualifying</option>
                    <option value="General Hindi">General Hindi (Samanya Hindi)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@ojas.edu or email@domain.com"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">
                Password {isConfigured && <span className="text-rose-500">*</span>}
              </label>
              {!isConfigured && (
                <span className="text-[10px] text-slate-400">(Optional in Local Sandbox)</span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-9 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Account' : 'Register & Enter Platform'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Role Testing Switcher */}
        <div className="pt-3 border-t border-slate-200">
          <p className="text-[11px] font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant Role & RLS Testing Personas:</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => selectDemoAccount('super_admin')}
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-left transition-colors"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-900">
                <Shield className="w-3 h-3 text-indigo-600" />
                <span>Super Admin</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">Full Academy Management</p>
            </button>

            <button
              type="button"
              onClick={() => selectDemoAccount('teacher')}
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-left transition-colors"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold text-blue-900">
                <BookOpen className="w-3 h-3 text-blue-600" />
                <span>Faculty Mentor</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">Assigned Batches & Live</p>
            </button>

            <button
              type="button"
              onClick={() => selectDemoAccount('student')}
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-left transition-colors"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-900">
                <GraduationCap className="w-3 h-3 text-emerald-600" />
                <span>Student</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">Enrolled Batches & Content</p>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
