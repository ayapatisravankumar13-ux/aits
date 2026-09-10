export type UserRole = 'student' | 'faculty' | 'parent' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  phone: string;
  department: string;
  // Role specific
  rollNumber?: string;
  semester?: number;
  batch?: string;
  cgpa?: number;
  wardName?: string;
  wardRollNumber?: string;
  designation?: string;
  employeeId?: string;
  adminPrivilegeLevel?: string;
}

export interface SubjectAttendance {
  id: string;
  code: string;
  name: string;
  faculty: string;
  attended: number;
  total: number;
  credits: number;
  lastUpdated: string;
  history: { date: string; status: 'present' | 'absent' | 'duty' }[];
}

export interface SubjectMarks {
  id: string;
  subjectCode: string;
  subjectName: string;
  t1: number;
  t2: number;
  assignment: number;
  quiz: number;
  maxT1: number;
  maxT2: number;
  maxAssignment: number;
  maxQuiz: number;
  totalPercentage: number;
}

export interface SemesterResult {
  semester: number;
  sgpa: number;
  cgpa: number;
  credits: number;
  passed: boolean;
  courses: {
    code: string;
    title: string;
    grade: string;
    gradePoints: number;
    credits: number;
  }[];
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  facultyName: string;
  dueDate: string;
  maxMarks: number;
  status: 'pending' | 'submitted' | 'graded';
  submittedFile?: string;
  submittedAt?: string;
  score?: number;
  feedback?: string;
  instructions: string;
}

export interface TimetableSlot {
  id: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  startTime: string;
  endTime: string;
  subject: string;
  code: string;
  room: string;
  faculty: string;
  type: 'Lecture' | 'Lab' | 'Tutorial';
}

export interface ExamScheduleItem {
  id: string;
  code: string;
  subject: string;
  date: string;
  time: string;
  hall: string;
  seatRange: string;
  syllabus: string;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  type: 'Medical' | 'On-Duty' | 'Casual';
  startDate: string;
  endDate: string;
  reason: string;
  documentName?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewRemarks?: string;
}

export interface NoticeItem {
  id: string;
  title: string;
  message: string;
  category: 'Academic' | 'Exam' | 'Campus' | 'Fee' | 'Urgent';
  date: string;
  author: string;
  targetRoles: UserRole[];
  pinned?: boolean;
}

export interface CampusFacility {
  id: string;
  name: string;
  code: string;
  type: 'department' | 'laboratory' | 'classroom' | 'library' | 'amenity';
  block: string;
  floor: number;
  capacity: number;
  isAvailable: boolean;
  currentActivity?: string;
  nextAvailableSlot?: string;
  coordinates: { x: number; y: number }; // percentage 0-100 on campus map
  equipment?: string[];
  contactPerson?: string;
}

export interface FeeRecord {
  id: string;
  semester: number;
  academicYear: string;
  tuitionFee: number;
  labFee: number;
  examFee: number;
  totalFee: number;
  amountPaid: number;
  dueAmount: number;
  status: 'Paid' | 'Partial' | 'Overdue';
  dueDate: string;
  lastPaymentDate?: string;
  transactionId?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
  category?: string;
}
