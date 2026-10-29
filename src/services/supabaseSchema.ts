export const SUPABASE_SQL_SCHEMA = `-- ====================================================================
-- MY ACADEMY - PRODUCTION SUPABASE / POSTGRESQL SCHEMA
-- Generated for seamless transition from UI Prototype to Live Backend
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(25) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  qualification VARCHAR(200) NOT NULL,
  experience_years INT DEFAULT 0,
  bio TEXT,
  rating NUMERIC(3,2) DEFAULT 5.0,
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'On Leave')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Batches Table
CREATE TABLE IF NOT EXISTS batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  target_exam VARCHAR(100) NOT NULL,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  timing VARCHAR(100) NOT NULL,
  capacity INT DEFAULT 100,
  mode VARCHAR(30) DEFAULT 'Online Live' CHECK (mode IN ('Online Live', 'Hybrid', 'Recorded')),
  classroom_name VARCHAR(100) DEFAULT 'Virtual Studio 1',
  status VARCHAR(20) DEFAULT 'Ongoing' CHECK (status IN ('Upcoming', 'Ongoing', 'Completed', 'Archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Students Table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roll_no VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(25) NOT NULL,
  guardian_name VARCHAR(150),
  guardian_phone VARCHAR(25),
  city VARCHAR(100),
  state VARCHAR(100),
  target_exam VARCHAR(100) NOT NULL,
  attendance_pct NUMERIC(5,2) DEFAULT 0.0,
  test_average_pct NUMERIC(5,2) DEFAULT 0.0,
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Completed')),
  joined_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Student-Batch Enrollment Junction
CREATE TABLE IF NOT EXISTS student_batch_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, batch_id)
);

-- 6. Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  target_exam VARCHAR(100) NOT NULL,
  description TEXT,
  thumbnail_gradient VARCHAR(100) DEFAULT 'from-blue-600 to-indigo-800',
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  mrp NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'Draft' CHECK (status IN ('Published', 'Draft')),
  language VARCHAR(30) DEFAULT 'Hinglish' CHECK (language IN ('Hinglish', 'English', 'Hindi')),
  duration_weeks INT DEFAULT 12,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Course Sections Table
CREATE TABLE IF NOT EXISTS course_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  section_order INT NOT NULL DEFAULT 1,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Course Lessons Table
CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  lesson_order INT NOT NULL DEFAULT 1,
  type VARCHAR(20) NOT NULL CHECK (type IN ('video', 'pdf', 'ppt', 'text', 'quiz')),
  duration_minutes INT,
  page_count INT,
  content_url TEXT,
  text_body TEXT,
  is_free_preview BOOLEAN DEFAULT FALSE,
  quiz_question_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Live Classes Table
CREATE TABLE IF NOT EXISTS live_classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  subject VARCHAR(100) NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 60,
  meeting_link TEXT NOT NULL,
  platform VARCHAR(50) DEFAULT 'Google Meet',
  status VARCHAR(20) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Live Now', 'Completed')),
  attendee_count INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Question Bank Table
CREATE TABLE IF NOT EXISTS question_bank (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  statement TEXT NOT NULL,
  subject VARCHAR(100) NOT NULL,
  topic VARCHAR(150) NOT NULL,
  exam_type VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  options JSONB NOT NULL, -- e.g. [{"id": "A", "text": "..."}, {"id": "B", "text": "..."}]
  correct_answer VARCHAR(5) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  marks INT DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Products Table (Physical Kits & Books)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  mrp NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  stock INT NOT NULL DEFAULT 0,
  min_stock_alert INT DEFAULT 10,
  status VARCHAR(20) DEFAULT 'In Stock' CHECK (status IN ('In Stock', 'Low Stock', 'Out of Stock')),
  description TEXT,
  target_exam VARCHAR(100),
  badge VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  student_name VARCHAR(150) NOT NULL,
  student_phone VARCHAR(25) NOT NULL,
  student_email VARCHAR(150),
  order_type VARCHAR(30) DEFAULT 'Course',
  items JSONB NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  payment_method VARCHAR(30) DEFAULT 'UPI',
  status VARCHAR(20) DEFAULT 'Paid' CHECK (status IN ('Paid', 'Pending', 'Failed', 'Refunded')),
  transaction_id VARCHAR(100),
  shipping_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Academy Settings Table
CREATE TABLE IF NOT EXISTS academy_settings (
  id INT PRIMARY KEY DEFAULT 1,
  name VARCHAR(200) NOT NULL,
  tagline TEXT,
  contact_email VARCHAR(150),
  support_phone VARCHAR(50),
  address TEXT,
  gst_number VARCHAR(50),
  currency VARCHAR(10) DEFAULT 'INR',
  primary_color VARCHAR(20) DEFAULT '#1d4ed8',
  accent_color VARCHAR(20) DEFAULT '#0d9488',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row_check CHECK (id = 1)
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_students_roll_no ON students(roll_no);
CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);
CREATE INDEX IF NOT EXISTS idx_live_classes_start_time ON live_classes(start_time);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON question_bank(subject);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
`;

export const SUPABASE_CONNECTION_GUIDE = `
### How to connect Supabase to "My Academy":

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com) and create a new project.
   - Choose your database region (e.g., South Asia / Mumbai for lowest latency in India).

2. **Execute the SQL Schema**:
   - Navigate to the **SQL Editor** tab in the Supabase Dashboard.
   - Copy the generated SQL script above and click **Run**.
   - All 13 tables, relations, and indexes will be created.

3. **Install Supabase Client Library**:
   \`\`\`bash
   npm install @supabase/supabase-js
   \`\`\`

4. **Add Environment Variables**:
   In your \`.env\` file, add:
   \`\`\`env
   VITE_SUPABASE_URL="https://your-project-id.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-key-here"
   \`\`\`

5. **Initialize Client in \`src/lib/supabase.ts\`**:
   \`\`\`typescript
   import { createClient } from '@supabase/supabase-js';

   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

   export const supabase = createClient(supabaseUrl, supabaseAnonKey);
   \`\`\`

6. **Switch Data Access in \`src/services/storage.ts\`**:
   - The UI components call the centralized repository interface (\`storage.getStudents()\`, \`storage.saveStudent()\`, etc.).
   - Replace the localStorage calls with asynchronous \`await supabase.from('students').select('*')\` or create a parallel \`supabaseService.ts\` with the exact same interface.
`;
