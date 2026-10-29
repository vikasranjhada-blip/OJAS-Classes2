import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { storage } from '../services/storage';

interface AuthContextType {
  currentUser: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isConfigured: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (params: {
    email: string;
    password?: string;
    fullName: string;
    role: UserRole;
    phone?: string;
    targetExam?: string;
    subject?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchRolePersona: (role: UserRole) => void;
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';
}

// Built-in Demo Accounts for Immediate Role & RLS Testing
export const DEMO_USERS: Record<UserRole, UserProfile> = {
  super_admin: {
    id: 'usr-admin-01',
    email: 'admin@ojas.edu',
    fullName: 'Director Sharma (Admin)',
    role: 'super_admin',
    phone: '+91 98765 00001',
    targetExam: 'All Uttar Pradesh & Govt Exams',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  teacher: {
    id: 'tch-01',
    email: 'teacher.anurag@ojas.edu',
    fullName: 'CA Anurag Mishra',
    role: 'teacher',
    phone: '+91 98765 11111',
    subject: 'Accountancy & Auditing',
    targetExam: 'UPPCL Assistant Accountant 2026',
    assignedBatchIds: ['batch-01'],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    createdAt: '2025-02-01T00:00:00.000Z',
  },
  student: {
    id: 'std-01',
    email: 'student.ravi@ojas.edu',
    fullName: 'Ravi Shankar Shukla',
    role: 'student',
    phone: '+91 98765 22222',
    targetExam: 'UPPCL Assistant Accountant 2026',
    enrolledBatchIds: ['batch-01'],
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    createdAt: '2026-03-01T00:00:00.000Z',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_SESSION_KEY = 'ojas_auth_active_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_SESSION_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Default to Super Admin for admin panel preview
    return DEMO_USERS.super_admin;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const isConfigured = isSupabaseConfigured();

  // Listen to Supabase Auth State changes if configured
  useEffect(() => {
    const client = supabase;
    if (!client) {
      setIsLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const { data: { session } } = await client.auth.getSession();
        if (session?.user) {
          await fetchProfile(session.user.id, session.user.email || '');
        }
      } catch (err: any) {
        console.warn('Supabase auth session load error:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email || '');
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        localStorage.removeItem(LOCAL_SESSION_KEY);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const profile: UserProfile = {
          id: data.id,
          email: data.email || email,
          fullName: data.full_name || email.split('@')[0],
          role: data.role as UserRole,
          phone: data.phone,
          targetExam: data.target_exam,
          subject: data.subject,
          avatarUrl: data.avatar_url,
          createdAt: data.created_at,
        };
        setCurrentUser(profile);
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
      }
    } catch (err: any) {
      console.warn('Failed to fetch user profile:', err.message);
    }
  };

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    setIsLoading(true);

    try {
      if (supabase && password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(error.message);
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          await fetchProfile(data.user.id, data.user.email || email);
          setIsAuthModalOpen(false);
          setIsLoading(false);
          return { success: true };
        }
      }

      // Local / Prototype Mode Fallback
      const normalizedEmail = email.toLowerCase().trim();
      let matched = Object.values(DEMO_USERS).find((u) => u.email.toLowerCase() === normalizedEmail);

      if (!matched) {
        // Construct new student profile
        matched = {
          id: `usr-${Date.now()}`,
          email: normalizedEmail,
          fullName: normalizedEmail.split('@')[0],
          role: 'student',
          phone: '+91 98765 00000',
          targetExam: 'UPPCL Assistant Accountant 2026',
          enrolledBatchIds: ['batch-01'],
          createdAt: new Date().toISOString(),
        };
      }

      setCurrentUser(matched);
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(matched));
      setIsAuthModalOpen(false);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  const signup = async (params: {
    email: string;
    password?: string;
    fullName: string;
    role: UserRole;
    phone?: string;
    targetExam?: string;
    subject?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    setIsLoading(true);

    try {
      if (supabase && params.password) {
        const { data, error } = await supabase.auth.signUp({
          email: params.email,
          password: params.password,
          options: {
            data: {
              full_name: params.fullName,
              role: params.role,
              phone: params.phone,
              target_exam: params.targetExam,
              subject: params.subject,
            },
          },
        });

        if (error) {
          setError(error.message);
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          await fetchProfile(data.user.id, data.user.email || params.email);
          setIsAuthModalOpen(false);
          setIsLoading(false);
          return { success: true };
        }
      }

      // Local / Prototype Signup Fallback
      const newProfile: UserProfile = {
        id: `usr-${Date.now()}`,
        email: params.email,
        fullName: params.fullName,
        role: params.role,
        phone: params.phone,
        targetExam: params.targetExam || 'UPPCL Assistant Accountant 2026',
        subject: params.subject,
        enrolledBatchIds: params.role === 'student' ? ['batch-01'] : undefined,
        assignedBatchIds: params.role === 'teacher' ? ['batch-01'] : undefined,
        createdAt: new Date().toISOString(),
      };

      setCurrentUser(newProfile);
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(newProfile));
      setIsAuthModalOpen(false);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setError(err.message || 'Signup failed');
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } finally {
      setCurrentUser(null);
      localStorage.removeItem(LOCAL_SESSION_KEY);
      setIsLoading(false);
    }
  };

  // Instant Persona Switcher to test all 3 roles (super_admin, teacher, student)
  const switchRolePersona = (newRole: UserRole) => {
    const persona = DEMO_USERS[newRole];
    setCurrentUser(persona);
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(persona));
  };

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setError(null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || 'student',
        isAuthenticated: !!currentUser,
        isLoading,
        error,
        isConfigured,
        login,
        signup,
        logout,
        switchRolePersona,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        authModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
