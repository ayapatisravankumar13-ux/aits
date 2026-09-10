import { useState } from 'react';
import {
  mockUsers,
  campusFacilities,
  timetableSlots,
  studentRosterForFaculty,
} from '../../data/mockData.ts';
import {
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  Bell,
  Award,
  Plus,
  Search,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function AdminView() {
  const admin = mockUsers.admin;
  const [adminTab, setAdminTab] = useState<'analytics' | 'students' | 'faculty' | 'courses' | 'classrooms' | 'results' | 'notices'>('analytics');

  // Students list
  const [students, setStudents] = useState([
    { id: 'stu_1', name: 'Aarav Sharma', roll: '21BCE1042', dept: 'CSE', sem: 6, cgpa: 8.92, status: 'Active' },
    { id: 'stu_2', name: 'Bhavna Kulkarni', roll: '21BCE1043', dept: 'CSE', sem: 6, cgpa: 9.15, status: 'Active' },
    { id: 'stu_3', name: 'Chirag Nambiar', roll: '21BCE1044', dept: 'CSE', sem: 6, cgpa: 7.20, status: 'Probation' },
    { id: 'stu_4', name: 'Deepika Rao', roll: '21BCE1045', dept: 'ECE', sem: 6, cgpa: 8.45, status: 'Active' },
    { id: 'stu_5', name: 'Eashan Kapoor', roll: '21BCE1046', dept: 'IT', sem: 6, cgpa: 6.85, status: 'At Risk' },
    { id: 'stu_6', name: 'Farhan Zaidi', roll: '21BCE1047', dept: 'CSE', sem: 6, cgpa: 9.60, status: 'Active' },
  ]);

  // Add student form
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStuName, setNewStuName] = useState('');
  const [newStuRoll, setNewStuRoll] = useState('');
  const [newStuDept, setNewStuDept] = useState('CSE');

  // Faculty list
  const [facultyList] = useState([
    { id: 'fac_1', name: 'Dr. Rajesh Menon', dept: 'Computer Science', designation: 'HOD & Associate Professor', empId: 'FAC-CSE-048' },
    { id: 'fac_2', name: 'Prof. Ananya Iyer', dept: 'Computer Science', designation: 'Assistant Professor (DBMS)', empId: 'FAC-CSE-052' },
    { id: 'fac_3', name: 'Dr. Vikramaditya Sen', dept: 'Computer Science', designation: 'Professor (Networks)', empId: 'FAC-CSE-031' },
    { id: 'fac_4', name: 'Prof. Sarah Thomas', dept: 'Information Tech', designation: 'Assistant Professor (DevOps)', empId: 'FAC-IT-019' },
    { id: 'fac_5', name: 'Dr. Harish Rawat', dept: 'Computer Science', designation: 'Associate Professor (Compilers)', empId: 'FAC-CSE-040' },
  ]);

  // Classrooms
  const [rooms, setRooms] = useState(campusFacilities);

  // Notice form
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeBody, setNoticeBody] = useState('');
  const [noticeSuccess, setNoticeSuccess] = useState(false);

  function handleAddStudent() {
    if (!newStuName || !newStuRoll) return;
    setStudents([
      ...students,
      {
        id: 'stu_' + Date.now(),
        name: newStuName,
        roll: newStuRoll,
        dept: newStuDept,
        sem: 6,
        cgpa: 8.5,
        status: 'Active',
      },
    ]);
    setNewStuName('');
    setNewStuRoll('');
    setShowAddStudent(false);
    confetti({ particleCount: 35, spread: 50 });
  }

  function toggleRoomStatus(id: string) {
    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isAvailable: !r.isAvailable } : r))
    );
  }

  return (
    <div className="space-y-4">
      {/* Admin Profile Bar */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-800 to-slate-900 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src={admin.avatarUrl}
            alt={admin.name}
            className="w-13 h-13 rounded-2xl object-cover ring-2 ring-amber-500/40"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">{admin.name}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                Dean & Administrator
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {admin.department} • Privilege: <span className="text-amber-400 font-semibold">{admin.adminPrivilegeLevel}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => alert('Semester 6 Official University Results published successfully across student & parent apps.')}
            className="py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow"
          >
            <Award className="w-4 h-4" />
            Publish Semester Results
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-1.5 flex items-center gap-1.5 overflow-x-auto text-xs shadow-sm">
        {[
          { id: 'analytics', label: 'Campus Analytics', icon: BarChart3 },
          { id: 'students', label: `Students (${students.length})`, icon: Users },
          { id: 'faculty', label: `Faculty (${facultyList.length})`, icon: GraduationCap },
          { id: 'courses', label: 'Courses & Curriculum', icon: BookOpen },
          { id: 'classrooms', label: 'Classrooms & Labs', icon: Building2 },
          { id: 'notices', label: 'Broadcast Alerts', icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`py-2 px-3 rounded-xl flex items-center gap-1.5 whitespace-nowrap font-semibold transition-all ${
                isActive
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. CAMPUS ANALYTICS */}
      {adminTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-slate-800/90 border border-slate-700 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-400 block">Total Enrolled Students</span>
              <span className="text-2xl font-black text-blue-400 block mt-1">4,280</span>
              <span className="text-[10px] text-emerald-400 font-semibold">+12% vs last academic year</span>
            </div>
            <div className="p-4 bg-slate-800/90 border border-slate-700 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-400 block">Active Faculty Members</span>
              <span className="text-2xl font-black text-indigo-400 block mt-1">184</span>
              <span className="text-[10px] text-slate-400">1:23 Student-Teacher Ratio</span>
            </div>
            <div className="p-4 bg-slate-800/90 border border-slate-700 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-400 block">Average Attendance</span>
              <span className="text-2xl font-black text-emerald-400 block mt-1">84.2%</span>
              <span className="text-[10px] text-emerald-400 font-semibold">&gt;75% Standard met</span>
            </div>
            <div className="p-4 bg-slate-800/90 border border-slate-700 rounded-2xl shadow-sm">
              <span className="text-xs text-slate-400 block">Classroom Utilization</span>
              <span className="text-2xl font-black text-amber-400 block mt-1">78.5%</span>
              <span className="text-[10px] text-slate-400">Optimal lecture distribution</span>
            </div>
          </div>

          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm text-xs space-y-3">
            <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] block">
              University Academic Health & Placement Performance
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/70">
                <span className="text-slate-400 text-[11px] block">Semester Pass Rate</span>
                <span className="text-xl font-bold text-emerald-400 mt-0.5 block">94.7%</span>
                <p className="text-[10px] text-slate-500 mt-1">Top tier among state technical universities</p>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/70">
                <span className="text-slate-400 text-[11px] block">Placement Recruitment Drive</span>
                <span className="text-xl font-bold text-blue-400 mt-0.5 block">88.2% Placed</span>
                <p className="text-[10px] text-slate-500 mt-1">Average package: ₹12.4 LPA (Tier 1 tech)</p>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/70">
                <span className="text-slate-400 text-[11px] block">Tuition Fee Clearance</span>
                <span className="text-xl font-bold text-purple-400 mt-0.5 block">91.4% Cleared</span>
                <p className="text-[10px] text-slate-500 mt-1">Automated invoice reconciliations</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MANAGE STUDENTS */}
      {adminTab === 'students' && (
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              University Student Enrollment Directory
            </h3>
            <button
              onClick={() => setShowAddStudent(!showAddStudent)}
              className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              Enroll Student
            </button>
          </div>

          {/* Add Student Form */}
          {showAddStudent && (
            <div className="p-3.5 bg-slate-900/90 border border-blue-500/40 rounded-xl space-y-3">
              <span className="font-bold text-slate-200">Register New Student</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newStuName}
                  onChange={(e) => setNewStuName(e.target.value)}
                  className="py-1.5 px-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                />
                <input
                  type="text"
                  placeholder="Roll No (e.g. 21BCE1050)"
                  value={newStuRoll}
                  onChange={(e) => setNewStuRoll(e.target.value)}
                  className="py-1.5 px-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                />
                <select
                  value={newStuDept}
                  onChange={(e) => setNewStuDept(e.target.value)}
                  className="py-1.5 px-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
                >
                  <option value="CSE">Computer Science (CSE)</option>
                  <option value="ECE">Electronics (ECE)</option>
                  <option value="IT">Information Tech (IT)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddStudent(false)}
                  className="py-1 px-3 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStudent}
                  className="py-1 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold"
                >
                  Save Enrollment
                </button>
              </div>
            </div>
          )}

          <div className="divide-y divide-slate-800 rounded-xl border border-slate-700/80 overflow-hidden bg-slate-900/60">
            {students.map((stu) => (
              <div key={stu.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-800/40">
                <div>
                  <div className="font-bold text-slate-200">{stu.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {stu.roll} • {stu.dept} (Sem {stu.sem}) • CGPA: {stu.cgpa}
                  </div>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    stu.status === 'Active'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : stu.status === 'Probation'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {stu.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. MANAGE FACULTY */}
      {adminTab === 'faculty' && (
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm space-y-3 text-xs">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            University Faculty & Department Roster
          </h3>

          <div className="space-y-2">
            {facultyList.map((fac) => (
              <div
                key={fac.id}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-200 block">{fac.name}</span>
                  <span className="text-[11px] text-slate-400">
                    {fac.designation} • Dept: {fac.dept}
                  </span>
                </div>
                <span className="font-mono text-slate-400 text-[11px] px-2 py-1 bg-slate-950 rounded border border-slate-800">
                  {fac.empId}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. COURSES */}
      {adminTab === 'courses' && (
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm space-y-3 text-xs">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            B.Tech Computer Science Curriculum (Semester 6)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { code: 'CS301', name: 'Machine Learning', credits: 4, type: 'Program Core', faculty: 'Dr. Rajesh Menon' },
              { code: 'CS302', name: 'Database Management Systems', credits: 4, type: 'Program Core', faculty: 'Prof. Ananya Iyer' },
              { code: 'CS303', name: 'Computer Networks', credits: 3, type: 'Program Core', faculty: 'Dr. Vikramaditya Sen' },
              { code: 'CS304', name: 'Cloud Computing & DevOps', credits: 3, type: 'Professional Elective', faculty: 'Prof. Sarah Thomas' },
              { code: 'CS305', name: 'Compiler Design', credits: 3, type: 'Program Core', faculty: 'Dr. Harish Rawat' },
              { code: 'CS306', name: 'Cybersecurity & Cryptography', credits: 3, type: 'Professional Elective', faculty: 'Prof. Neha Gupta' },
            ].map((c) => (
              <div key={c.code} className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-200">{c.name}</span>
                  <span className="font-mono text-purple-400 font-bold">{c.code}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {c.credits} Credits • {c.type} • Instructor: {c.faculty}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. CLASSROOMS & LABS */}
      {adminTab === 'classrooms' && (
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              Campus Facilities & Real-time Room Allocation
            </h3>
            <span className="text-[11px] text-slate-400">Toggle availability status</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="p-3 bg-slate-900/80 border border-slate-700/80 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-200">{room.name}</div>
                  <div className="text-[11px] text-slate-400">
                    {room.block} (Floor {room.floor}) • Capacity: {room.capacity}
                  </div>
                </div>

                <button
                  onClick={() => toggleRoomStatus(room.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    room.isAvailable
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-rose-600/40 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {room.isAvailable ? 'Available' : 'In-Session'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. BROADCAST NOTICES */}
      {adminTab === 'notices' && (
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            University Dean's Emergency Broadcast Center
          </h3>

          {noticeSuccess && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Emergency notification broadcasted to all campus portals and push notification channels.
            </div>
          )}

          <div className="p-4 bg-slate-900/90 border border-slate-700/80 rounded-xl space-y-3">
            <div>
              <label className="block text-slate-400 mb-1">Headline</label>
              <input
                type="text"
                placeholder="e.g. Campus Holiday Declared for Cyclone Warning"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Official Directive</label>
              <textarea
                rows={3}
                placeholder="Provide official notification text..."
                value={noticeBody}
                onChange={(e) => setNoticeBody(e.target.value)}
                className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
              />
            </div>

            <button
              onClick={() => {
                if (noticeTitle) {
                  setNoticeSuccess(true);
                  setTimeout(() => setNoticeSuccess(false), 4000);
                  setNoticeTitle('');
                  setNoticeBody('');
                }
              }}
              className="py-2 px-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl shadow"
            >
              Broadcast Instantly to All Roles
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
