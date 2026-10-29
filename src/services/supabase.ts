import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, UserRole } from '../types';

// Safely retrieve Supabase Environment Variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project-id') &&
    supabaseAnonKey.length > 20
  );
};

// Initialize Supabase Client if configured, or create a mock-ready instance
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Safe client accessor that throws informative error if accessed while unconfigured
export const getSupabaseClient = (): SupabaseClient => {
  if (!supabase) {
    throw new Error(
      'Supabase client is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
    );
  }
  return supabase;
};

// Diagnostic test connection helper
export const testSupabaseConnection = async (): Promise<{
  connected: boolean;
  message: string;
  url?: string;
  latencyMs?: number;
}> => {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      message: 'Supabase credentials not configured in environment (Running in Local Prototype & Demo Sandbox mode).',
      url: supabaseUrl || 'None',
    };
  }

  const start = performance.now();
  try {
    const { error } = await supabase!.from('profiles').select('id').limit(1);
    const latency = Math.round(performance.now() - start);

    if (error) {
      return {
        connected: false,
        message: `Connected to Supabase URL, but query returned: ${error.message}. Ensure database migration is executed.`,
        url: supabaseUrl,
        latencyMs: latency,
      };
    }

    return {
      connected: true,
      message: `Successfully connected to Supabase PostgreSQL database (${latency}ms latency).`,
      url: supabaseUrl,
      latencyMs: latency,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Failed to connect: ${err.message || 'Network error'}`,
      url: supabaseUrl,
    };
  }
};
