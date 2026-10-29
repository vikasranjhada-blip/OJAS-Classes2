export type PageId =
  | 'dashboard'
  | 'students'
  | 'teachers'
  | 'batches'
  | 'courses'
  | 'course-content'
  | 'live-classes'
  | 'question-bank'
  | 'reports'
  | 'orders'
  | 'products'
  | 'settings'
  | 'student-portal'
  | 'teacher-portal';

export type UserRole = 'super_admin' | 'teacher' | 'student';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  targetExam?: string;
  subject?: string;
  avatarUrl?: string;
  enrolledBatchIds?: string[];
  assignedBatchIds?: string[];
  createdAt: string;
}

export interface BatchEnrollment {
  id: string;
  batchId: string;
  studentId: string;
  courseId: string;
  status: 'Active' | 'Inactive' | 'Completed';
  enrolledAt: string;
  attendancePct: number;
  testAveragePct: number;
}

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  city: string;
  state: string;
  targetExam: string;
  enrolledBatchIds: string[];
  enrolledCourseIds: string[];
  status: 'Active' | 'Inactive' | 'Completed';
  attendancePct: number;
  testAveragePct: number;
  joinedDate: string;
  avatarBg: string;
}

export interface Teacher {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  qualification: string;
  experienceYears: number;
  bio: string;
  assignedBatchIds: string[];
  status: 'Active' | 'On Leave';
  rating: number;
  avatarBg: string;
}

export interface Batch {
  id: string;
  code: string;
  name: string;
  targetExam: string;
  teacherId: string;
  teacherName: string;
  startDate: string;
  endDate: string;
  timing: string;
  capacity: number;
  enrolledStudentIds: string[];
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Archived';
  mode: 'Online Live' | 'Hybrid' | 'Recorded';
  classroomName: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  category: string;
  targetExam: string;
  description: string;
  thumbnailGradient: string;
  price: number;
  mrp: number;
  status: 'Published' | 'Draft';
  language: 'Hinglish' | 'English' | 'Hindi';
  enrolledCount: number;
  sectionsCount: number;
  lessonsCount: number;
  durationWeeks: number;
  isFeatured: boolean;
  createdAt: string;
}

export type LessonType = 'video' | 'pdf' | 'ppt' | 'pyq' | 'text' | 'quiz';

export interface Lesson {
  id: string;
  sectionId: string;
  courseId: string;
  title: string;
  order: number;
  type: LessonType;
  durationMinutes?: number;
  pageCount?: number;
  contentUrl?: string;
  textBody?: string;
  isFreePreview: boolean;
  quizQuestionCount?: number;
  pyqYear?: string;
  pyqExam?: string;
  pyqQuestionsCount?: number;
  notesType?: 'pdf_notes' | 'ppt_notes' | 'handwritten_notes';
}

export interface Section {
  id: string;
  courseId: string;
  title: string;
  order: number;
  description?: string;
}

export interface LiveClass {
  id: string;
  title: string;
  batchId: string;
  batchName: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  startTime: string; // ISO date string or formatted
  durationMinutes: number;
  meetingLink: string;
  platform: 'YouTube Live (Private/Unlisted)' | 'Google Meet' | 'Zoom' | 'YouTube Live' | 'Jitsi Live';
  status: 'Scheduled' | 'Live Now' | 'Completed';
  attendeeCount?: number;
  notes?: string;
  isPrivateToEnrolled?: boolean;
  youtubeVideoId?: string;
  notificationSentAt?: string;
  notificationCount?: number;
}

export interface Question {
  id: string;
  code: string;
  statement: string;
  subject: string;
  topic: string;
  examType: 'UPPCL' | 'UPSSSC' | 'One-Day Govt' | 'General' | string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  options: {
    id: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  marks: number;
}

export interface OrderItem {
  id: string;
  name: string;
  type: 'Course' | 'Physical Product';
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  studentEmail: string;
  orderType: 'Course' | 'Physical Product' | 'Combo';
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'UPI' | 'Netbanking' | 'Card' | 'Offline Cash';
  status: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  transactionId: string;
  createdAt: string;
  shippingAddress?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: 'Study Modules' | 'Question Bank Book' | 'Formula Sheet' | 'Test Series Kit';
  price: number;
  mrp: number;
  stock: number;
  minStockAlert: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  description: string;
  targetExam: string;
  badge?: string;
}

export interface AcademySettings {
  name: string;
  tagline: string;
  contactEmail: string;
  supportPhone: string;
  address: string;
  gstNumber: string;
  currency: string;
  primaryColor: string;
  accentColor: string;
  adminName: string;
  adminEmail: string;
  adminRole: string;
  demoNoticeEnabled: boolean;
  logoUrl?: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export interface ActivityItem {
  id: string;
  type: 'admission' | 'live_class' | 'test_submit' | 'order' | 'batch_create';
  title: string;
  description: string;
  timestamp: string;
  user: string;
}
