import { useState, useEffect } from 'react';
import {
  studentRosterForFaculty,
  mockUsers,
  initialLeaveRequests,
} from '../../data/mockData.ts';
import { LeaveRequest } from '../../types/index.ts';
import {
  CheckCircle2,
  XCircle,
  QrCode,
  FileText,
  Upload,
  Bell,
  AlertTriangle,
  Award,
  Users,
  Send,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function FacultyView() {
  const faculty = mockUsers.faculty;
  const [activeTab, setActiveTab] = useState<'attendance' | 'marks' | 'assignments' | 'leaves' | 'notifications' | 'analytics'>('attendance');

  // Attendance marking state
  const [roster, setRoster] = useState(studentRosterForFaculty);
  const [selectedCourse, setSelectedCourse] = useState('CS301 - Machine Learning');
  const [showDynamicQr, setShowDynamicQr] = useState(false);
  const [qrTimer, setQrTimer] = useState(30);

  // Dynamic QR refresh timer
  useEffect(() => {
    let interval: any;
    if (showDynamicQr) {
      interval = setInterval(() => {
        setQrTimer((prev) => (prev > 1 ? prev - 1 : 30));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showDynamicQr]);

  // Leave Requests state
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>(initialLeaveRequests);

  // Upload Marks state
  const [marksRoster, setMarksRoster] = useState(
    studentRosterForFaculty.map((s) => ({
      id: s.id,
      name: s.name,
      roll: s.roll,
      t1: 27.5,
      t2: 28.0,
      assignment: 19.0,
      quiz: 18.0,
    }))
  );

  // Assignment upload form
  const [asgTitle, setAsgTitle] = useState('');
  const [asgDueDate, setAsgDueDate] = useState('2026-09-25');
  const [asgMaxMarks, setAsgMaxMarks] = useState(20);
  const [asgDesc, setAsgDesc] = useState('');
  const [asgSuccess, setAsgSuccess] = useState(false);

  // Notification Broadcast state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [notifTarget, setNotifTarget] = useState('All CS 6th Sem Students');
  const [notifSuccess, setNotifSuccess] = useState(false);

  function toggleAttendance(studentId: string) {
    setRoster((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, present: !s.present } : s))
    );
  }

  function markAllPresent() {
    setRoster((prev) => prev.map((s) => ({ ...s, present: true })));
  }

  function handleReviewLeave(leaveId: string, status: 'Approved' | 'Rejected') {
    setPendingLeaves((prev) =>
      prev.map((l) =>
        l.id === leaveId
          ? {
              ...l,
              status,
              reviewedBy: faculty.name,
              reviewedAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              reviewRemarks: status === 'Approved' ? 'Duty/Medical Sanction Granted.' : 'Insufficient documentation provided.',
            }
          : l
      )
    );
    confetti({ particleCount: 35, spread: 50 });
  }

  const presentCount = roster.filter((s) => s.present).length;
  const attendanceRate = Number(((presentCount / roster.length) * 100).toFixed(1));

  return (
    <div className="space-y-4">
      {/* Faculty Profile Bar */}
      <div className="bg-gradient-to-r from-blue-900/40 via-slate-800 to-indigo-900/40 border border-blue-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src={faculty.avatarUrl}
            alt={faculty.name}
            className="w-13 h-13 rounded-2xl object-cover ring-2 ring-indigo-500/40"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">{faculty.name}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
                Faculty Portal
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {faculty.designation} • ID: <span className="font-mono text-slate-300">{faculty.employeeId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowDynamicQr(!showDynamicQr)}
            className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-all shadow"
          >
            <QrCode className="w-4 h-4" />
            {showDynamicQr ? 'Close Dynamic QR' : 'Generate Lecture QR'}
          </button>
        </div>
      </div>

      {/* Faculty Subtabs */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-1.5 flex items-center gap-1.5 overflow-x-auto text-xs shadow-sm">
        {[
          { id: 'attendance', label: 'Mark Attendance', icon: CheckCircle2 },
          { id: 'marks', label: 'Upload Marks', icon: Award },
          { id: 'assignments', label: 'Create Assignment', icon: FileText },
          { id: 'leaves', label: `Approve Leaves (${pendingLeaves.filter(l => l.status === 'Pending').length})`, icon: Send },
          { id: 'notifications', label: 'Send Notice', icon: Bell },
          { id: 'analytics', label: 'Student Analytics', icon: AlertTriangle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-3 rounded-xl flex items-center gap-1.5 whitespace-nowrap font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic QR Generator Modal/Panel */}
      {showDynamicQr && (
        <div className="p-4 bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-fadeIn">
          <div className="text-center sm:text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
              Live Classroom Broadcast
            </span>
            <h3 className="text-base font-bold text-slate-100 mt-1">
              Dynamic QR Code Attendance Token
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Project this QR onto the lecture screen. Code rotates every 30 seconds to prevent remote spoofing.
            </p>
            <div className="mt-2 text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Next Rotation in {qrTimer}s • Token #CS301-9284
            </div>
          </div>

          <div className="w-36 h-36 bg-white rounded-2xl p-2.5 shadow-xl flex items-center justify-center shrink-0">
            <QrCode className="w-full h-full text-slate-900" />
          </div>
        </div>
      )}

      {/* 1. MARK ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                Classroom Attendance Register
              </h3>
              <p className="text-xs text-slate-400">
                Course: <span className="text-slate-200 font-semibold">{selectedCourse}</span> • Today's Session
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-semibold mr-2">
                Present: {presentCount} / {roster.length} ({attendanceRate}%)
              </span>
              <button
                onClick={markAllPresent}
                className="py-1.5 px-3 bg-slate-900 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold"
              >
                Mark All Present
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-800 rounded-xl border border-slate-700/80 overflow-hidden bg-slate-900/60">
            {roster.map((stu) => (
              <div
                key={stu.id}
                className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-xs">
                    {stu.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">{stu.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {stu.roll} • Term Attendance: {stu.attendancePct}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      stu.attendancePct < 75
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {stu.status}
                  </span>

                  <button
                    onClick={() => toggleAttendance(stu.id)}
                    className={`py-1.5 px-3 rounded-xl font-bold flex items-center gap-1 transition-all ${
                      stu.present
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-rose-600/30 text-rose-300 border border-rose-500/50'
                    }`}
                  >
                    {stu.present ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Present
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" /> Absent
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. UPLOAD MARKS */}
      {activeTab === 'marks' && (
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" />
                Upload & Modify Continuous Assessment Scores
              </h3>
              <p className="text-xs text-slate-400">
                Enter internal marks for Test 1, Test 2, and Quizzes.
              </p>
            </div>
            <button
              onClick={() => alert('Batch scores saved and published to Student & Parent portals.')}
              className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow"
            >
              Save & Publish Scores
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-700/80">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3 text-center">T1 (Max 30)</th>
                  <th className="py-2.5 px-3 text-center">T2 (Max 30)</th>
                  <th className="py-2.5 px-3 text-center">Assignment (20)</th>
                  <th className="py-2.5 px-3 text-center">Quiz (20)</th>
                  <th className="py-2.5 px-3 text-right">Computed Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                {marksRoster.map((stu, i) => {
                  const total = stu.t1 + stu.t2 + stu.assignment + stu.quiz;
                  return (
                    <tr key={stu.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-200">{stu.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{stu.roll}</div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          value={stu.t1}
                          onChange={(e) => {
                            const updated = [...marksRoster];
                            updated[i].t1 = Number(e.target.value);
                            setMarksRoster(updated);
                          }}
                          className="w-14 py-1 px-1.5 bg-slate-950 border border-slate-700 rounded text-center text-slate-200"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          value={stu.t2}
                          onChange={(e) => {
                            const updated = [...marksRoster];
                            updated[i].t2 = Number(e.target.value);
                            setMarksRoster(updated);
                          }}
                          className="w-14 py-1 px-1.5 bg-slate-950 border border-slate-700 rounded text-center text-slate-200"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          value={stu.assignment}
                          onChange={(e) => {
                            const updated = [...marksRoster];
                            updated[i].assignment = Number(e.target.value);
                            setMarksRoster(updated);
                          }}
                          className="w-14 py-1 px-1.5 bg-slate-950 border border-slate-700 rounded text-center text-slate-200"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          value={stu.quiz}
                          onChange={(e) => {
                            const updated = [...marksRoster];
                            updated[i].quiz = Number(e.target.value);
                            setMarksRoster(updated);
                          }}
                          className="w-14 py-1 px-1.5 bg-slate-950 border border-slate-700 rounded text-center text-slate-200"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-indigo-400">
                        {total.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. UPLOAD ASSIGNMENT */}
      {activeTab === 'assignments' && (
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            Upload New Course Assignment & Submission Criteria
          </h3>

          {asgSuccess && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Assignment published to registered course students.
            </div>
          )}

          <div className="p-4 bg-slate-900/90 border border-slate-700/80 rounded-xl space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Assignment Title</label>
                <input
                  type="text"
                  placeholder="e.g. ResNet Deep Residual Learning on PyTorch"
                  value={asgTitle}
                  onChange={(e) => setAsgTitle(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={asgDueDate}
                    onChange={(e) => setAsgDueDate(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={asgMaxMarks}
                    onChange={(e) => setAsgMaxMarks(Number(e.target.value))}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Detailed Instructions & Dataset URL</label>
              <textarea
                rows={3}
                placeholder="Specify submission formats (.pdf, .ipynb), test split rules, and evaluation rubrics..."
                value={asgDesc}
                onChange={(e) => setAsgDesc(e.target.value)}
                className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              onClick={() => {
                if (asgTitle) {
                  setAsgSuccess(true);
                  setTimeout(() => setAsgSuccess(false), 4000);
                  setAsgTitle('');
                  setAsgDesc('');
                }
              }}
              className="py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl flex items-center gap-2 shadow"
            >
              <Upload className="w-3.5 h-3.5" />
              Publish Assignment
            </button>
          </div>
        </div>
      )}

      {/* 4. APPROVE LEAVES */}
      {activeTab === 'leaves' && (
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm space-y-3 text-xs">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-400" />
            Pending Student Leave Requests & Sanctions
          </h3>

          <div className="space-y-3">
            {pendingLeaves.map((leave) => (
              <div
                key={leave.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-200 text-sm">{leave.studentName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {leave.rollNumber}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                      {leave.type}
                    </span>
                  </div>
                  <p className="text-slate-300 mb-1">{leave.reason}</p>
                  <div className="text-[11px] text-slate-500">
                    Period: {leave.startDate} to {leave.endDate} • Attached: {leave.documentName}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {leave.status === 'Pending' ? (
                    <>
                      <button
                        onClick={() => handleReviewLeave(leave.id, 'Approved')}
                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold flex items-center gap-1 shadow"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleReviewLeave(leave.id, 'Rejected')}
                        className="py-1.5 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold flex items-center gap-1 shadow"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </>
                  ) : (
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        leave.status === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {leave.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            Broadcast Notification to Students & Parents
          </h3>

          {notifSuccess && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Notification dispatched via Firebase Cloud Messaging.
            </div>
          )}

          <div className="p-4 bg-slate-900/90 border border-slate-700/80 rounded-xl space-y-3">
            <div>
              <label className="block text-slate-400 mb-1">Target Audience</label>
              <select
                value={notifTarget}
                onChange={(e) => setNotifTarget(e.target.value)}
                className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
              >
                <option>All CS 6th Sem Students</option>
                <option>Students with Attendance &lt; 75%</option>
                <option>Parents of CSE Students</option>
                <option>Machine Learning Course Roster</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Notice Headline</label>
              <input
                type="text"
                placeholder="e.g. Makeup Lab Class for Machine Learning Scheduled on Saturday"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Notification Body</label>
              <textarea
                rows={3}
                placeholder="Provide details, venue, instructions..."
                value={notifMsg}
                onChange={(e) => setNotifMsg(e.target.value)}
                className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none"
              />
            </div>

            <button
              onClick={() => {
                if (notifTitle) {
                  setNotifSuccess(true);
                  setTimeout(() => setNotifSuccess(false), 4000);
                  setNotifTitle('');
                  setNotifMsg('');
                }
              }}
              className="py-2 px-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl flex items-center gap-2 shadow"
            >
              <Send className="w-3.5 h-3.5" />
              Dispatch Notification
            </button>
          </div>
        </div>
      )}

      {/* 6. ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Student Academic Risk & Attendance Analytics
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
              2 Students at Risk (&lt; 75%)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-700/80">
              <span className="text-slate-400 text-[11px] block">Average Class Attendance</span>
              <span className="text-2xl font-black text-blue-400 block mt-1">84.8%</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-700/80">
              <span className="text-slate-400 text-[11px] block">Average Internal Test Score</span>
              <span className="text-2xl font-black text-emerald-400 block mt-1">83.9%</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-700/80">
              <span className="text-slate-400 text-[11px] block">Assignments Submission Rate</span>
              <span className="text-2xl font-black text-purple-400 block mt-1">96.2%</span>
            </div>
          </div>

          <span className="font-bold text-slate-200 uppercase tracking-wider block text-[11px]">
            Action List: Students Debarred or Requiring Counseling
          </span>
          <div className="space-y-2">
            {studentRosterForFaculty
              .filter((s) => s.attendancePct < 75)
              .map((stu) => (
                <div
                  key={stu.id}
                  className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-200 block">{stu.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Roll: {stu.roll} • Current Attendance: {stu.attendancePct}% (Debarred)
                    </span>
                  </div>
                  <button
                    onClick={() => alert(`Parent of ${stu.name} notified via SMS and Automated College Call.`)}
                    className="py-1 px-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold"
                  >
                    Notify Parent
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
