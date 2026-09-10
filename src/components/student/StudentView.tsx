import { useState, FormEvent } from 'react';
import {
  initialAttendance,
  initialMarks,
  semesterResults,
  initialAssignments,
  timetableSlots,
  examSchedule,
  initialLeaveRequests,
  initialNotices,
  mockUsers,
} from '../../data/mockData.ts';
import {
  Assignment,
  LeaveRequest,
  SubjectAttendance,
} from '../../types/index.ts';
import { AIAcademicSuite } from '../ai/AIAcademicSuite.tsx';
import { CampusMapView } from '../campus/CampusMapView.tsx';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  QrCode,
  FileText,
  Upload,
  Calendar,
  Sparkles,
  TrendingUp,
  MapPin,
  Send,
  User,
  BookOpen,
  Award,
  ChevronRight,
  ShieldCheck,
  Search,
  Download,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function StudentView() {
  const [studentTab, setStudentTab] = useState<
    'dashboard' | 'attendance' | 'academics' | 'assignments' | 'schedule' | 'leave' | 'ai' | 'campus' | 'profile'
  >('dashboard');

  const student = mockUsers.student;
  const [attendanceList, setAttendanceList] = useState<SubjectAttendance[]>(initialAttendance);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>('Mon');

  // Leave Form State
  const [leaveType, setLeaveType] = useState<'Medical' | 'On-Duty' | 'Casual'>('Medical');
  const [leaveStart, setLeaveStart] = useState('2026-09-18');
  const [leaveEnd, setLeaveEnd] = useState('2026-09-19');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveDocName, setLeaveDocName] = useState('');
  const [leaveSuccessMsg, setLeaveSuccessMsg] = useState(false);

  // Overall Attendance Calculation
  const totalHeld = attendanceList.reduce((acc, c) => acc + c.total, 0);
  const totalAttended = attendanceList.reduce((acc, c) => acc + c.attended, 0);
  const overallPct = totalHeld > 0 ? Number(((totalAttended / totalHeld) * 100).toFixed(1)) : 100;

  // Handle QR Check-in Simulation
  function handleQrScanSuccess() {
    setAttendanceList((prev) =>
      prev.map((item, idx) =>
        idx === 0
          ? {
              ...item,
              attended: item.attended + 1,
              total: item.total + 1,
              lastUpdated: 'Just now (QR Scan Verified)',
            }
          : item
      )
    );
    setQrModalOpen(false);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  }

  // Handle Assignment Submission
  function handleUploadAssignment(asgId: string) {
    setAssignments((prev) =>
      prev.map((asg) =>
        asg.id === asgId
          ? {
              ...asg,
              status: 'submitted',
              submittedFile: `Aarav_Submission_${asg.subject.split(' ')[0]}.pdf`,
              submittedAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : asg
      )
    );
    confetti({ particleCount: 40, spread: 50 });
  }

  // Handle Submit Leave Request
  function handleCreateLeave(e: FormEvent) {
    e.preventDefault();
    if (!leaveReason.trim()) return;

    const newLeave: LeaveRequest = {
      id: 'lv_' + Date.now(),
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber || '21BCE1042',
      type: leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      reason: leaveReason,
      documentName: leaveDocName || 'Attachment_Document.pdf',
      status: 'Pending',
      submittedAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setLeaves([newLeave, ...leaves]);
    setLeaveReason('');
    setLeaveDocName('');
    setLeaveSuccessMsg(true);
    setTimeout(() => setLeaveSuccessMsg(false), 4000);
  }

  return (
    <div className="space-y-4">
      {/* Top Mobile-Styled Navigation Strip */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-2 flex items-center gap-1.5 overflow-x-auto text-xs shadow-sm">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
          { id: 'attendance', label: 'Attendance', icon: CheckCircle2 },
          { id: 'academics', label: 'Marks & Results', icon: Award },
          { id: 'ai', label: 'AI Suite', icon: Sparkles, badge: 'AI' },
          { id: 'assignments', label: 'Assignments', icon: FileText },
          { id: 'schedule', label: 'Timetable', icon: Calendar },
          { id: 'leave', label: 'Leave Portal', icon: Send },
          { id: 'campus', label: 'Campus Map', icon: MapPin },
          { id: 'profile', label: 'Profile', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = studentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStudentTab(tab.id as any)}
              className={`py-2 px-3 rounded-xl flex items-center gap-1.5 whitespace-nowrap font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-400/20 text-blue-300 font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. STUDENT DASHBOARD VIEW */}
      {studentTab === 'dashboard' && (
        <div className="space-y-4">
          {/* Welcome & QR Check-in Banner */}
          <div className="bg-gradient-to-r from-blue-900/50 via-slate-800 to-indigo-900/40 border border-blue-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <img
                src={student.avatarUrl}
                alt={student.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500/40"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-100">{student.name}</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold">
                    Sem {student.semester} • CSE
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Roll No: <span className="font-mono text-slate-300 font-semibold">{student.rollNumber}</span> • Academic Advisor: Dr. Rajesh Menon
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setQrModalOpen(true)}
                className="py-2 px-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
              >
                <QrCode className="w-4 h-4" />
                Scan Class Attendance QR
              </button>
            </div>
          </div>

          {/* Core Metrics: CGPA + Attendance Dial */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* CGPA Card */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Cumulative CGPA</span>
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <div className="my-2">
                <div className="text-3xl font-black text-slate-100">{student.cgpa}</div>
                <div className="text-[11px] text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Top 5% in Department • 103 Credits Cleared
                </div>
              </div>
              <button
                onClick={() => setStudentTab('academics')}
                className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 font-medium"
              >
                View Marksheets & Results <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Attendance Percentage Card */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Overall Attendance</span>
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
              <div className="my-2">
                <div className="text-3xl font-black text-blue-400">{overallPct}%</div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  {totalAttended} of {totalHeld} Total Classes Attended
                </div>
              </div>
              <button
                onClick={() => setStudentTab('attendance')}
                className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 font-medium"
              >
                Subject-Wise Log & Risk <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Pending Assignments */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Action Items</span>
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <div className="my-2">
                <div className="text-3xl font-black text-purple-400">
                  {assignments.filter((a) => a.status === 'pending').length} Due
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Next: CNNs in PyTorch (Due Tomorrow)
                </div>
              </div>
              <button
                onClick={() => setStudentTab('assignments')}
                className="text-[11px] text-purple-400 hover:underline flex items-center gap-1 font-medium"
              >
                Open Submissions Desk <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Quick AI Assistants Access */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                AI Campus Copilot Shortcuts
              </span>
              <span className="text-[11px] text-slate-400">Powered by Gemini 3.8 & Python ML</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => setStudentTab('ai')}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-blue-950/40 border border-slate-700/80 hover:border-blue-500/50 text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-200">Attendance Predictor</div>
                <div className="text-[11px] text-slate-400">Simulate missed classes</div>
              </button>

              <button
                onClick={() => setStudentTab('ai')}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-indigo-950/40 border border-slate-700/80 hover:border-indigo-500/50 text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-200">CGPA Projection</div>
                <div className="text-[11px] text-slate-400">Target grade analytics</div>
              </button>

              <button
                onClick={() => setStudentTab('ai')}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-purple-950/40 border border-slate-700/80 hover:border-purple-500/50 text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-200">Study Planner</div>
                <div className="text-[11px] text-slate-400">Hourly revision timetable</div>
              </button>

              <button
                onClick={() => setStudentTab('ai')}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-emerald-950/40 border border-slate-700/80 hover:border-emerald-500/50 text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-200">Academic Chatbot</div>
                <div className="text-[11px] text-slate-400">Ask campus & exam queries</div>
              </button>
            </div>
          </div>

          {/* Today's Schedule & Campus Noticeboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Today's Lectures */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  Today's Lectures & Labs
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                  Monday Schedule
                </span>
              </div>

              <div className="space-y-2">
                {timetableSlots.slice(0, 4).map((slot) => (
                  <div
                    key={slot.id}
                    className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-200 flex items-center gap-2">
                        <span>{slot.subject}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                          {slot.code}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {slot.faculty} • {slot.room}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-slate-300 font-semibold">{slot.startTime}</span>
                      <span className="block text-[10px] text-slate-500">{slot.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* University Notices */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  Official Campus Notices
                </span>
                <span className="text-[11px] text-slate-400">Controller of Exams</span>
              </div>

              <div className="space-y-2.5">
                {initialNotices.slice(0, 3).map((notice) => (
                  <div
                    key={notice.id}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/60 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-200">{notice.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                        {notice.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {notice.message}
                    </p>
                    <div className="mt-1 text-[10px] text-slate-500">{notice.author} • {notice.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. REAL-TIME ATTENDANCE VIEW */}
      {studentTab === 'attendance' && (
        <div className="space-y-4">
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-400" />
                  Real-Time Attendance Register & Percentage Visualization
                </h3>
                <p className="text-xs text-slate-400">
                  Track individual subject status, regulatory exam thresholds, and biometric/QR records.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQrModalOpen(true)}
                  className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  Scan Class Attendance
                </button>
              </div>
            </div>

            {/* Overall Status Banner */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/70 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs text-slate-400">University Aggregate Attendance Standing:</div>
                <div className="text-2xl font-black text-blue-400 mt-0.5">{overallPct}%</div>
                <div className="text-[11px] text-slate-300 mt-1">
                  Status: <span className="text-emerald-400 font-bold">Eligible for End-Semester Exams (&gt;75%)</span>
                </div>
              </div>

              <div className="w-full sm:w-64">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Mandatory Threshold (75%)</span>
                  <span>{overallPct}%</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden relative">
                  {/* 75% indicator line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10"
                    style={{ left: '75%' }}
                    title="75% Threshold"
                  ></div>
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, overallPct)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Subject Roster */}
            <div className="space-y-3">
              {attendanceList.map((subject) => {
                const pct = subject.total > 0 ? Number(((subject.attended / subject.total) * 100).toFixed(1)) : 100;
                const isSafe = pct >= 80;
                const isWarning = pct >= 75 && pct < 80;
                const isDebarred = pct < 75;

                return (
                  <div
                    key={subject.id}
                    className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-100 text-sm">{subject.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {subject.code}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                          {subject.credits} Credits
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Instructor: {subject.faculty} • Last class marked: {subject.lastUpdated}
                      </div>

                      {/* Recent attendance dots */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[10px] text-slate-500 mr-1">Recent:</span>
                        {subject.history.map((h, i) => (
                          <span
                            key={i}
                            title={`${h.date}: ${h.status}`}
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                              h.status === 'present'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : h.status === 'duty'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {h.status === 'present' ? 'P' : h.status === 'duty' ? 'D' : 'A'}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                      <div className="text-right">
                        <div
                          className={`text-xl font-black ${
                            isDebarred ? 'text-rose-400' : isWarning ? 'text-amber-300' : 'text-emerald-400'
                          }`}
                        >
                          {pct}%
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {subject.attended} / {subject.total} Held
                        </div>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          isDebarred
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : isWarning
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {isDebarred ? 'At Risk (<75%)' : isWarning ? 'Warning' : 'Safe'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. MARKS & SEMESTER RESULTS */}
      {studentTab === 'academics' && (
        <div className="space-y-4">
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-400" />
                  Internal Assessment Marks & University Grade Records
                </h3>
                <p className="text-xs text-slate-400">
                  Continuous Assessment Test (CAT-1, CAT-2), assignments, and official semester transcripts.
                </p>
              </div>

              <button
                onClick={() => alert('Official Grade Card PDF downloaded.')}
                className="py-1.5 px-3 bg-slate-900 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download Transcript
              </button>
            </div>

            {/* Internal Marks Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-700/80 mb-4">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3 text-center">T1 (30)</th>
                    <th className="py-2.5 px-3 text-center">T2 (30)</th>
                    <th className="py-2.5 px-3 text-center">Assignment (20)</th>
                    <th className="py-2.5 px-3 text-center">Quiz (20)</th>
                    <th className="py-2.5 px-3 text-right">Aggregate (100)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                  {initialMarks.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-200">{m.subjectName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{m.subjectCode}</div>
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-300 font-mono">{m.t1}</td>
                      <td className="py-2.5 px-3 text-center text-slate-300 font-mono">{m.t2}</td>
                      <td className="py-2.5 px-3 text-center text-slate-300 font-mono">{m.assignment}</td>
                      <td className="py-2.5 px-3 text-center text-slate-300 font-mono">{m.quiz}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`font-black text-xs ${
                            m.totalPercentage >= 90
                              ? 'text-emerald-400'
                              : m.totalPercentage >= 80
                              ? 'text-blue-400'
                              : 'text-amber-300'
                          }`}
                        >
                          {m.totalPercentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Semester History Breakdown */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Semester-by-Semester University Transcripts
              </span>
              {semesterResults.map((sem) => (
                <div
                  key={sem.semester}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/70 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-200 text-sm">
                      Semester {sem.semester} Grade Card
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-blue-400 font-mono font-bold">
                        SGPA: {sem.sgpa}
                      </span>
                      <span className="text-emerald-400 font-mono font-bold">
                        CGPA: {sem.cgpa}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                        Passed
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                    {sem.courses.map((c) => (
                      <div
                        key={c.code}
                        className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="truncate mr-2">
                          <span className="font-semibold text-slate-300 block truncate">{c.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{c.code} ({c.credits} Cr)</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold font-mono">
                          {c.grade}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. AI SUITE TAB */}
      {studentTab === 'ai' && <AIAcademicSuite />}

      {/* 5. ASSIGNMENTS TRACKER */}
      {studentTab === 'assignments' && (
        <div className="space-y-4">
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Assignment Upload & Submission Tracker
                </h3>
                <p className="text-xs text-slate-400">
                  Upload reports, track evaluations, and view faculty feedback.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {assignments.map((asg) => (
                <div
                  key={asg.id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-100 text-sm">{asg.title}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          asg.status === 'graded'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : asg.status === 'submitted'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {asg.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                      {asg.instructions}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span>Course: {asg.subject}</span>
                      <span>Faculty: {asg.facultyName}</span>
                      <span className="text-amber-300 font-medium">Due: {asg.dueDate}</span>
                    </div>

                    {asg.feedback && (
                      <div className="mt-2 p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-[11px]">
                        <span className="font-bold">Faculty Feedback: </span>
                        {asg.feedback} (Score: {asg.score} / {asg.maxMarks})
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {asg.status === 'pending' ? (
                      <button
                        onClick={() => handleUploadAssignment(asg.id)}
                        className="py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload & Submit
                      </button>
                    ) : (
                      <div className="text-right">
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Submitted
                        </span>
                        <span className="text-[10px] text-slate-500 block font-mono">
                          {asg.submittedFile}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. TIMETABLE & EXAM SCHEDULE */}
      {studentTab === 'schedule' && (
        <div className="space-y-4">
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-blue-400" />
              Weekly Timetable & Mid-Term Exam Dates
            </h3>

            {/* Day Selector */}
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700/80 mb-3 text-xs">
              {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const).map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                    selectedDay === day
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Day Slots */}
            <div className="space-y-2 mb-6">
              {timetableSlots
                .filter((s) => s.day === selectedDay)
                .map((slot) => (
                  <div
                    key={slot.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/70 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-200 flex items-center gap-2">
                        <span>{slot.subject}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                          {slot.code}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        {slot.faculty} • Room: <span className="text-slate-200 font-semibold">{slot.room}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-slate-200 font-bold">{slot.startTime} - {slot.endTime}</div>
                      <span className="text-[10px] text-blue-400 font-semibold">{slot.type}</span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Exam Date Sheet */}
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Upcoming Mid-Semester Examination Schedule
            </span>
            <div className="space-y-2.5">
              {examSchedule.map((ex) => (
                <div
                  key={ex.id}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-200">{ex.subject}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Hall: <span className="text-slate-200 font-medium">{ex.hall}</span> • Seat: <span className="font-mono text-blue-400 font-bold">{ex.seatRange}</span>
                    </div>
                    <div className="text-slate-500 text-[10px] mt-1">Syllabus: {ex.syllabus}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold font-mono block">
                      {ex.date}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block">{ex.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. LEAVE APPLICATION SYSTEM */}
      {studentTab === 'leave' && (
        <div className="space-y-4">
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-3">
              <Send className="w-5 h-5 text-indigo-400" />
              Digital Leave Application & Duty Sanction
            </h3>

            {leaveSuccessMsg && (
              <div className="p-3 bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Leave request submitted successfully. Notified Advisor Dr. Rajesh Menon.
              </div>
            )}

            {/* Leave Submission Form */}
            <form onSubmit={handleCreateLeave} className="p-4 bg-slate-900/90 border border-slate-700/80 rounded-xl space-y-3 mb-5 text-xs">
              <span className="font-bold text-slate-200 uppercase tracking-wider block text-[11px]">
                File New Leave Request
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Leave Category</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as any)}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Medical">Medical Leave (Doctor Certificate)</option>
                    <option value="On-Duty">On-Duty (Hackathon / Conference)</option>
                    <option value="Casual">Casual / Family Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">From Date</label>
                  <input
                    type="date"
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">To Date</label>
                  <input
                    type="date"
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Reason & Description</label>
                <textarea
                  rows={2}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="State academic reason or medical condition..."
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <input
                  type="text"
                  placeholder="Attach Document filename (e.g. Medical_Certificate.pdf)"
                  value={leaveDocName}
                  onChange={(e) => setLeaveDocName(e.target.value)}
                  className="py-1.5 px-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs w-64 focus:outline-none"
                />

                <button
                  type="submit"
                  className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow"
                >
                  Submit for Advisor Approval
                </button>
              </div>
            </form>

            {/* Leave History */}
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Previous Leave Requests & Current Sanction Status
            </span>
            <div className="space-y-2.5">
              {leaves.map((l) => (
                <div
                  key={l.id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-200">{l.type} Leave</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          l.status === 'Approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : l.status === 'Rejected'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {l.status}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] mb-1">{l.reason}</p>
                    <div className="text-slate-500 text-[10px]">
                      Dates: {l.startDate} to {l.endDate} • Filed: {l.submittedAt}
                    </div>
                    {l.reviewRemarks && (
                      <div className="mt-1 text-emerald-400 text-[11px]">
                        Remark by {l.reviewedBy}: "{l.reviewRemarks}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. CAMPUS MAP */}
      {studentTab === 'campus' && <CampusMapView />}

      {/* 9. PROFILE VIEW */}
      {studentTab === 'profile' && (
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-700">
            <img
              src={student.avatarUrl}
              alt={student.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500"
            />
            <div>
              <h3 className="text-lg font-bold text-slate-100">{student.name}</h3>
              <p className="text-slate-400">{student.department}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                  {student.rollNumber}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                  Batch: {student.batch}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-700/80">
              <span className="text-slate-400 text-[11px] block">Email Address</span>
              <span className="font-semibold text-slate-200">{student.email}</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-700/80">
              <span className="text-slate-400 text-[11px] block">Contact Phone</span>
              <span className="font-semibold text-slate-200">{student.phone}</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-700/80">
              <span className="text-slate-400 text-[11px] block">Class Advisor</span>
              <span className="font-semibold text-slate-200">Dr. Rajesh Menon (HOD-CSE)</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-700/80">
              <span className="text-slate-400 text-[11px] block">Offline Data Caching</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Synced to Local Storage (Ready Offline)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Scanner Simulation Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <QrCode className="w-4 h-4 text-blue-400" />
                Scan Dynamic Lecture Attendance QR
              </h3>
              <button
                onClick={() => setQrModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="relative w-48 h-48 mx-auto bg-slate-950 rounded-2xl border-2 border-dashed border-blue-500/60 p-4 flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-blue-400 animate-pulse"></div>
              <QrCode className="w-32 h-32 text-slate-300" />
              <div className="text-[10px] text-blue-400 mt-2 font-mono">
                CS301 - Machine Learning (Token #9284)
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Position your phone camera toward the classroom projector. Timestamp and geo-fence are verified automatically.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setQrModalOpen(false)}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-700 text-xs text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleQrScanSuccess}
                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs shadow"
              >
                Simulate Successful Scan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
