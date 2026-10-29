-- ==============================================================================
-- OJAS Classes (My Academy) - Supabase PostgreSQL Schema & Security Policies
-- Migration: 20261029000000_init_ojas_academy.sql
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'teacher', 'student')) DEFAULT 'student',
  phone TEXT,
  target_exam TEXT DEFAULT 'UPPCL Assistant Accountant 2026',
  subject TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for role lookup and queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 3. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  target_exam TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  mrp NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('Published', 'Draft')) DEFAULT 'Published',
  language TEXT DEFAULT 'Hinglish',
  thumbnail_gradient TEXT DEFAULT 'from-blue-600 to-indigo-800',
  is_featured BOOLEAN DEFAULT false,
  duration_weeks INTEGER DEFAULT 24,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);

-- 4. BATCHES TABLE
CREATE TABLE IF NOT EXISTS public.batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  target_exam TEXT NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  timing TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 100,
  mode TEXT DEFAULT 'Online Live',
  classroom_name TEXT DEFAULT 'Virtual Classroom (YouTube Live)',
  status TEXT NOT NULL CHECK (status IN ('Upcoming', 'Ongoing', 'Completed', 'Archived')) DEFAULT 'Ongoing',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_batches_teacher ON public.batches(teacher_id);
CREATE INDEX IF NOT EXISTS idx_batches_course ON public.batches(course_id);

-- 5. BATCH ENROLLMENTS TABLE (Students in Batches)
CREATE TABLE IF NOT EXISTS public.batch_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('Active', 'Inactive', 'Completed')) DEFAULT 'Active',
  attendance_pct NUMERIC(5, 2) DEFAULT 90.0,
  test_average_pct NUMERIC(5, 2) DEFAULT 80.0,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_batch_student UNIQUE (batch_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.batch_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_batch ON public.batch_enrollments(batch_id);

-- 6. COURSE SECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.course_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sections_course ON public.course_sections(course_id);

-- 7. LESSONS TABLE (Supports video, PDF, PPT, PYQ, text, quiz)
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.course_sections(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 1,
  type TEXT NOT NULL CHECK (type IN ('video', 'pdf', 'ppt', 'pyq', 'text', 'quiz')),
  duration_minutes INTEGER,
  page_count INTEGER,
  content_url TEXT,
  text_body TEXT,
  is_free_preview BOOLEAN DEFAULT false,
  quiz_question_count INTEGER,
  pyq_year TEXT,
  pyq_exam TEXT,
  pyq_questions_count INTEGER,
  notes_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lessons_section ON public.lessons(section_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON public.lessons(course_id);

-- ==============================================================================
-- 8. HELPER SECURITY FUNCTIONS
-- ==============================================================================

-- Check if current authenticated user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = uid AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current authenticated user is teacher
CREATE OR REPLACE FUNCTION public.is_teacher(uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = uid AND role = 'teacher'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current authenticated user is student
CREATE OR REPLACE FUNCTION public.is_student(uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = uid AND role = 'student'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 9. AUTOMATIC USER PROFILE TRIGGER
-- Trigger on Supabase Auth signup to automatically create public.profiles row
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    phone,
    target_exam,
    subject
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'target_exam', 'UPPCL Assistant Accountant 2026'),
    NEW.raw_user_meta_data->>'subject'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) ACTIVATION
-- Enforce RLS on EVERY exposed table
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 11. RLS POLICIES
-- ==============================================================================

-- --- PROFILES POLICIES ---
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (
    -- User sees their own profile
    auth.uid() = id
    -- Super admins see everyone
    OR public.is_super_admin(auth.uid())
    -- Teachers see students enrolled in their batches
    OR (
      public.is_teacher(auth.uid())
      AND id IN (
        SELECT be.student_id FROM public.batch_enrollments be
        JOIN public.batches b ON be.batch_id = b.id
        WHERE b.teacher_id = auth.uid()
      )
    )
    -- Everyone can see teacher directory info
    OR role = 'teacher'
  );

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR public.is_super_admin(auth.uid())
  )
  WITH CHECK (
    -- Prevent non-super_admins from escalating their own role
    (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id OR public.is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
CREATE POLICY "profiles_delete_policy" ON public.profiles
  FOR DELETE USING (
    public.is_super_admin(auth.uid())
  );

-- --- COURSES POLICIES ---
DROP POLICY IF EXISTS "courses_select_policy" ON public.courses;
CREATE POLICY "courses_select_policy" ON public.courses
  FOR SELECT USING (
    -- Public / student view of published courses
    status = 'Published'
    -- Super admins see all including drafts
    OR public.is_super_admin(auth.uid())
    -- Teachers see courses they created or teach in a batch
    OR created_by = auth.uid()
    OR id IN (SELECT course_id FROM public.batches WHERE teacher_id = auth.uid())
  );

DROP POLICY IF EXISTS "courses_write_policy" ON public.courses;
CREATE POLICY "courses_write_policy" ON public.courses
  FOR ALL USING (
    public.is_super_admin(auth.uid())
  );

-- --- BATCHES POLICIES ---
DROP POLICY IF EXISTS "batches_select_policy" ON public.batches;
CREATE POLICY "batches_select_policy" ON public.batches
  FOR SELECT USING (
    -- Super admins see all batches
    public.is_super_admin(auth.uid())
    -- Teachers see batches assigned to them
    OR teacher_id = auth.uid()
    -- Students see only batches where they are actively enrolled
    OR id IN (
      SELECT batch_id FROM public.batch_enrollments
      WHERE student_id = auth.uid() AND status = 'Active'
    )
  );

DROP POLICY IF EXISTS "batches_admin_all" ON public.batches;
CREATE POLICY "batches_admin_all" ON public.batches
  FOR ALL USING (
    public.is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "batches_teacher_update" ON public.batches;
CREATE POLICY "batches_teacher_update" ON public.batches
  FOR UPDATE USING (
    teacher_id = auth.uid()
  );

-- --- BATCH ENROLLMENTS POLICIES ---
DROP POLICY IF EXISTS "enrollments_select_policy" ON public.batch_enrollments;
CREATE POLICY "enrollments_select_policy" ON public.batch_enrollments
  FOR SELECT USING (
    -- Students see only their own enrollments
    student_id = auth.uid()
    -- Super admins see all
    OR public.is_super_admin(auth.uid())
    -- Teachers see students in their batches
    OR batch_id IN (
      SELECT id FROM public.batches WHERE teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "enrollments_write_policy" ON public.batch_enrollments;
CREATE POLICY "enrollments_write_policy" ON public.batch_enrollments
  FOR ALL USING (
    public.is_super_admin(auth.uid())
  );

-- --- COURSE SECTIONS POLICIES ---
DROP POLICY IF EXISTS "sections_select_policy" ON public.course_sections;
CREATE POLICY "sections_select_policy" ON public.course_sections
  FOR SELECT USING (
    public.is_super_admin(auth.uid())
    OR course_id IN (SELECT id FROM public.courses WHERE status = 'Published')
  );

DROP POLICY IF EXISTS "sections_write_policy" ON public.course_sections;
CREATE POLICY "sections_write_policy" ON public.course_sections
  FOR ALL USING (
    public.is_super_admin(auth.uid())
    OR course_id IN (SELECT course_id FROM public.batches WHERE teacher_id = auth.uid())
  );

-- --- LESSONS POLICIES ---
DROP POLICY IF EXISTS "lessons_select_policy" ON public.lessons;
CREATE POLICY "lessons_select_policy" ON public.lessons
  FOR SELECT USING (
    -- Super admins see all
    public.is_super_admin(auth.uid())
    -- Teachers see lessons for their courses
    OR course_id IN (SELECT course_id FROM public.batches WHERE teacher_id = auth.uid())
    -- Free previews are visible to all authenticated users
    OR is_free_preview = true
    -- Students only see lesson content if they are actively enrolled in a batch for this course
    OR EXISTS (
      SELECT 1 FROM public.batch_enrollments be
      WHERE be.student_id = auth.uid()
        AND be.course_id = lessons.course_id
        AND be.status = 'Active'
    )
  );

DROP POLICY IF EXISTS "lessons_write_policy" ON public.lessons;
CREATE POLICY "lessons_write_policy" ON public.lessons
  FOR ALL USING (
    public.is_super_admin(auth.uid())
    OR course_id IN (SELECT course_id FROM public.batches WHERE teacher_id = auth.uid())
  );
