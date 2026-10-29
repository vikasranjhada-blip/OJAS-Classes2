import {
  Student,
  Teacher,
  Batch,
  Course,
  Section,
  Lesson,
  LiveClass,
  Question,
  Order,
  Product,
  AcademySettings,
  ActivityItem,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_BATCHES,
  INITIAL_COURSES,
  INITIAL_SECTIONS,
  INITIAL_LESSONS,
  INITIAL_LIVE_CLASSES,
  INITIAL_QUESTIONS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  INITIAL_ACTIVITIES,
} from './mockData';

const STORAGE_KEYS = {
  STUDENTS: 'ojas_classes_v2_students',
  TEACHERS: 'ojas_classes_v2_teachers',
  BATCHES: 'ojas_classes_v2_batches',
  COURSES: 'ojas_classes_v2_courses',
  SECTIONS: 'ojas_classes_v2_sections',
  LESSONS: 'ojas_classes_v2_lessons',
  LIVE_CLASSES: 'ojas_classes_v2_live_classes',
  QUESTIONS: 'ojas_classes_v2_questions',
  ORDERS: 'ojas_classes_v2_orders',
  PRODUCTS: 'ojas_classes_v2_products',
  SETTINGS: 'ojas_classes_v2_settings',
  ACTIVITIES: 'ojas_classes_v2_activities',
};

function getStoredItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage`, e);
    return defaultValue;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error writing ${key} to localStorage`, e);
  }
}

// ---------------- API REPOSITORY ----------------

export const storage = {
  // Students
  getStudents: (): Student[] => getStoredItem(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS),
  saveStudent: (student: Student): Student => {
    const list = storage.getStudents();
    const idx = list.findIndex((s) => s.id === student.id);
    let updated: Student[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = student;
    } else {
      updated = [student, ...list];
      storage.addActivity({
        id: `act-${Date.now()}`,
        type: 'admission',
        title: `New Student Added: ${student.name}`,
        description: `Roll No ${student.rollNo} registered for ${student.targetExam}.`,
        timestamp: 'Just now',
        user: 'Admin',
      });
    }
    setStoredItem(STORAGE_KEYS.STUDENTS, updated);
    return student;
  },
  deleteStudent: (id: string): void => {
    const list = storage.getStudents();
    setStoredItem(STORAGE_KEYS.STUDENTS, list.filter((s) => s.id !== id));
  },

  // Teachers
  getTeachers: (): Teacher[] => getStoredItem(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS),
  saveTeacher: (teacher: Teacher): Teacher => {
    const list = storage.getTeachers();
    const idx = list.findIndex((t) => t.id === teacher.id);
    let updated: Teacher[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = teacher;
    } else {
      updated = [teacher, ...list];
    }
    setStoredItem(STORAGE_KEYS.TEACHERS, updated);
    return teacher;
  },
  deleteTeacher: (id: string): void => {
    const list = storage.getTeachers();
    setStoredItem(STORAGE_KEYS.TEACHERS, list.filter((t) => t.id !== id));
  },

  // Batches
  getBatches: (): Batch[] => getStoredItem(STORAGE_KEYS.BATCHES, INITIAL_BATCHES),
  saveBatch: (batch: Batch): Batch => {
    const list = storage.getBatches();
    const idx = list.findIndex((b) => b.id === batch.id);
    let updated: Batch[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = batch;
    } else {
      updated = [batch, ...list];
      storage.addActivity({
        id: `act-${Date.now()}`,
        type: 'batch_create',
        title: `Batch Created: ${batch.name}`,
        description: `Code: ${batch.code} assigned to ${batch.teacherName}.`,
        timestamp: 'Just now',
        user: 'Admin',
      });
    }
    setStoredItem(STORAGE_KEYS.BATCHES, updated);
    return batch;
  },
  archiveBatch: (id: string): void => {
    const list = storage.getBatches();
    const updated = list.map((b) => (b.id === id ? { ...b, status: 'Archived' as const } : b));
    setStoredItem(STORAGE_KEYS.BATCHES, updated);
  },
  deleteBatch: (id: string): void => {
    const list = storage.getBatches();
    setStoredItem(STORAGE_KEYS.BATCHES, list.filter((b) => b.id !== id));
  },

  // Courses
  getCourses: (): Course[] => getStoredItem(STORAGE_KEYS.COURSES, INITIAL_COURSES),
  saveCourse: (course: Course): Course => {
    const list = storage.getCourses();
    const idx = list.findIndex((c) => c.id === course.id);
    let updated: Course[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = course;
    } else {
      updated = [course, ...list];
    }
    setStoredItem(STORAGE_KEYS.COURSES, updated);
    return course;
  },
  deleteCourse: (id: string): void => {
    const list = storage.getCourses();
    setStoredItem(STORAGE_KEYS.COURSES, list.filter((c) => c.id !== id));
  },

  // Sections
  getSections: (courseId?: string): Section[] => {
    const all = getStoredItem(STORAGE_KEYS.SECTIONS, INITIAL_SECTIONS);
    if (!courseId) return all;
    return all.filter((s) => s.courseId === courseId).sort((a, b) => a.order - b.order);
  },
  saveSection: (section: Section): Section => {
    const list = storage.getSections();
    const idx = list.findIndex((s) => s.id === section.id);
    let updated: Section[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = section;
    } else {
      updated = [...list, section];
    }
    setStoredItem(STORAGE_KEYS.SECTIONS, updated);
    return section;
  },
  deleteSection: (id: string): void => {
    const sections = storage.getSections().filter((s) => s.id !== id);
    const lessons = storage.getLessons().filter((l) => l.sectionId !== id);
    setStoredItem(STORAGE_KEYS.SECTIONS, sections);
    setStoredItem(STORAGE_KEYS.LESSONS, lessons);
  },

  // Lessons
  getLessons: (sectionId?: string): Lesson[] => {
    const all = getStoredItem(STORAGE_KEYS.LESSONS, INITIAL_LESSONS);
    if (!sectionId) return all;
    return all.filter((l) => l.sectionId === sectionId).sort((a, b) => a.order - b.order);
  },
  saveLesson: (lesson: Lesson): Lesson => {
    const list = storage.getLessons();
    const idx = list.findIndex((l) => l.id === lesson.id);
    let updated: Lesson[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = lesson;
    } else {
      updated = [...list, lesson];
    }
    setStoredItem(STORAGE_KEYS.LESSONS, updated);
    return lesson;
  },
  deleteLesson: (id: string): void => {
    const list = storage.getLessons();
    setStoredItem(STORAGE_KEYS.LESSONS, list.filter((l) => l.id !== id));
  },

  // Live Classes
  getLiveClasses: (): LiveClass[] => getStoredItem(STORAGE_KEYS.LIVE_CLASSES, INITIAL_LIVE_CLASSES),
  saveLiveClass: (liveClass: LiveClass): LiveClass => {
    const list = storage.getLiveClasses();
    const idx = list.findIndex((c) => c.id === liveClass.id);
    let updated: LiveClass[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = liveClass;
    } else {
      updated = [liveClass, ...list];
      storage.addActivity({
        id: `act-${Date.now()}`,
        type: 'live_class',
        title: `Live Class Scheduled: ${liveClass.title}`,
        description: `Batch: ${liveClass.batchName} with ${liveClass.teacherName}.`,
        timestamp: 'Just now',
        user: 'Admin',
      });
    }
    setStoredItem(STORAGE_KEYS.LIVE_CLASSES, updated);
    return liveClass;
  },
  deleteLiveClass: (id: string): void => {
    const list = storage.getLiveClasses();
    setStoredItem(STORAGE_KEYS.LIVE_CLASSES, list.filter((c) => c.id !== id));
  },

  // Question Bank
  getQuestions: (): Question[] => getStoredItem(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS),
  saveQuestion: (question: Question): Question => {
    const list = storage.getQuestions();
    const idx = list.findIndex((q) => q.id === question.id);
    let updated: Question[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = question;
    } else {
      updated = [question, ...list];
    }
    setStoredItem(STORAGE_KEYS.QUESTIONS, updated);
    return question;
  },
  deleteQuestion: (id: string): void => {
    const list = storage.getQuestions();
    setStoredItem(STORAGE_KEYS.QUESTIONS, list.filter((q) => q.id !== id));
  },

  // Orders
  getOrders: (): Order[] => getStoredItem(STORAGE_KEYS.ORDERS, INITIAL_ORDERS),
  saveOrder: (order: Order): Order => {
    const list = storage.getOrders();
    const idx = list.findIndex((o) => o.id === order.id);
    let updated: Order[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = order;
    } else {
      updated = [order, ...list];
      storage.addActivity({
        id: `act-${Date.now()}`,
        type: 'order',
        title: `New Order: ${order.orderNumber}`,
        description: `${order.studentName} paid ₹${order.totalAmount.toLocaleString('en-IN')}.`,
        timestamp: 'Just now',
        user: 'Store System',
      });
    }
    setStoredItem(STORAGE_KEYS.ORDERS, updated);
    return order;
  },

  // Products
  getProducts: (): Product[] => getStoredItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS),
  saveProduct: (product: Product): Product => {
    const list = storage.getProducts();
    const idx = list.findIndex((p) => p.id === product.id);
    let updated: Product[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = product;
    } else {
      updated = [product, ...list];
    }
    setStoredItem(STORAGE_KEYS.PRODUCTS, updated);
    return product;
  },
  deleteProduct: (id: string): void => {
    const list = storage.getProducts();
    setStoredItem(STORAGE_KEYS.PRODUCTS, list.filter((p) => p.id !== id));
  },

  // Settings
  getSettings: (): AcademySettings => {
    const s = getStoredItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    if (!s.logoUrl || s.name === 'My Academy') {
      s.name = 'OJAS Classes';
      s.logoUrl = '/assets/aistudio/2141b4f9-0816-4ef1-92ae-3ef08e0d2955_7d83b97c.jpg';
      s.contactEmail = 'contact@ojasclasses.edu.in';
      s.tagline = 'Empowering Future Rankers in IIT-JEE, NEET-UG & Olympiads';
      setStoredItem(STORAGE_KEYS.SETTINGS, s);
    }
    return s;
  },
  saveSettings: (settings: AcademySettings): AcademySettings => {
    setStoredItem(STORAGE_KEYS.SETTINGS, settings);
    return settings;
  },

  // Activity Feed
  getActivities: (): ActivityItem[] => getStoredItem(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES),
  addActivity: (activity: ActivityItem): void => {
    const list = storage.getActivities();
    setStoredItem(STORAGE_KEYS.ACTIVITIES, [activity, ...list].slice(0, 30));
  },

  // Reset to factory mock data
  resetAll: (): void => {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
