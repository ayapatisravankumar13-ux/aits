import { useState } from 'react';
import {
  mockUsers,
  initialAttendance,
  initialMarks,
  semesterResults,
  feeDetails,
  initialNotices,
} from '../../data/mockData.ts';
import {
  User,
  ShieldCheck,
  Award,
  CreditCard,
  Bell,
  TrendingUp,
  Download,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  Calendar,
  DollarSign,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function ParentView() {
  const parent = mockUsers.parent;
  const ward = mockUsers.student;
  const [fee, setFee] = useState(feeDetails);
  const [payingFee, setPayingFee] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  // Overall attendance calculation
  const totalHeld = initialAttendance.reduce((acc, c) => acc + c.total, 0);
  const totalAttended = initialAttendance.reduce((acc, c) => acc + c.attended, 0);
  const overallPct = totalHeld > 0 ? Number(((totalAttended / totalHeld) * 100).toFixed(1)) : 100;

  function handlePayRemainingFee() {
    setPayingFee(true);
    setTimeout(() => {
      setFee((prev) => ({
        ...prev,
        amountPaid: prev.totalFee,
        dueAmount: 0,
        status: 'Paid',
        lastPaymentDate: 'Today (Online NetBanking)',
        transactionId: 'TXN-CAMPUS-' + Math.floor(100000 + Math.random() * 900000),
      }));
      setPayingFee(false);
      setPaySuccess(true);
      confetti({ particleCount: 50, spread: 60 });
    }, 1200);
  }

  return (
    <div className="space-y-4">
      {/* Linked Ward Profile Banner */}
      <div className="bg-gradient-to-r from-emerald-950/50 via-slate-800 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src={ward.avatarUrl}
            alt={ward.name}
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/40"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">{ward.name}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                Ward Profile
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Roll No: <span className="font-mono text-slate-300 font-semibold">{ward.rollNumber}</span> • B.Tech CSE (Sem 6)
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Logged in as Parent: <span className="text-slate-300 font-medium">{parent.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <a
            href="tel:+919845011223"
            className="py-2 px-3 bg-slate-900 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-semibold flex items-center gap-1.5 transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            Call Faculty Advisor
          </a>
        </div>
      </div>

      {/* High-Level Standing Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Attendance */}
        <div className="p-4 bg-slate-800/90 border border-slate-700 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Ward's Attendance</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-black text-emerald-400">{overallPct}%</div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              {totalAttended} of {totalHeld} Sessions Attended
            </div>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Safe Standing (&gt;75% required)
          </span>
        </div>

        {/* CGPA */}
        <div className="p-4 bg-slate-800/90 border border-slate-700 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Cumulative CGPA</span>
            <Award className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-black text-indigo-400">{ward.cgpa}</div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              Consistent University Honors (Top 5%)
            </div>
          </div>
          <span className="text-[10px] text-indigo-400 font-bold uppercase">
            All 103 Credits Cleared with Zero Backlogs
          </span>
        </div>

        {/* Fee Standing */}
        <div className="p-4 bg-slate-800/90 border border-slate-700 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Semester 6 Dues</span>
            <CreditCard className="w-5 h-5 text-amber-400" />
          </div>
          <div className="my-2">
            <div className={`text-3xl font-black ${fee.dueAmount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              ₹{fee.dueAmount.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              Status: <span className="font-bold">{fee.status}</span> • Due by {fee.dueDate}
            </div>
          </div>
          <span className="text-[10px] text-slate-400">
            Total Semester Fee: ₹{fee.totalFee.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Fee Status & Online Payment Module */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              University Fee Statement & Online Clearing
            </h3>
            <p className="text-[11px] text-slate-400">Academic Year {fee.academicYear} • Semester {fee.semester}</p>
          </div>

          <button
            onClick={() => alert(`Official University Fee Receipt (${fee.transactionId || 'DRAFT'}) downloaded.`)}
            className="py-1 px-3 bg-slate-900 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Download Receipt
          </button>
        </div>

        {paySuccess && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Fee payment processed successfully! Transaction ID: {fee.transactionId}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-900/90 rounded-xl border border-slate-700/80">
          <div>
            <span className="text-slate-400 text-[11px] block">Tuition Fee</span>
            <span className="font-bold text-slate-200">₹{fee.tuitionFee.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Lab & Innovation Charges</span>
            <span className="font-bold text-slate-200">₹{fee.labFee.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Exam & University Fee</span>
            <span className="font-bold text-slate-200">₹{fee.examFee.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Cleared / Paid to Date</span>
            <span className="font-bold text-emerald-400">₹{fee.amountPaid.toLocaleString()}</span>
          </div>
        </div>

        {fee.dueAmount > 0 && (
          <div className="flex items-center justify-between p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span className="text-amber-200 font-medium">
                Outstanding balance of ₹{fee.dueAmount.toLocaleString()} due before {fee.dueDate} to prevent late surcharge.
              </span>
            </div>

            <button
              onClick={handlePayRemainingFee}
              disabled={payingFee}
              className="py-1.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow flex items-center gap-1.5"
            >
              {payingFee ? 'Clearing Payment...' : `Pay ₹${fee.dueAmount.toLocaleString()} Now`}
            </button>
          </div>
        )}
      </div>

      {/* Subject-Wise Attendance Breakdown for Parent */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm space-y-3 text-xs">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          Subject-Wise Attendance Monitoring
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {initialAttendance.map((item) => {
            const pct = item.total > 0 ? Number(((item.attended / item.total) * 100).toFixed(1)) : 100;
            return (
              <div
                key={item.id}
                className="p-3 bg-slate-900/80 border border-slate-700/80 rounded-xl flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-200 block">{item.name}</span>
                  <span className="text-[11px] text-slate-400">
                    Instructor: {item.faculty} • ({item.code})
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`font-black text-base ${
                      pct >= 85 ? 'text-emerald-400' : pct >= 75 ? 'text-blue-400' : 'text-rose-400'
                    }`}
                  >
                    {pct}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {item.attended}/{item.total} Classes
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Faculty Advisor Remarks */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm text-xs space-y-2">
        <div className="flex items-center gap-2 text-indigo-400 font-bold">
          <User className="w-4 h-4" />
          Official Academic Advisor Note (Dr. Rajesh Menon - Associate Professor)
        </div>
        <p className="text-slate-300 leading-relaxed bg-slate-900/90 p-3 rounded-xl border border-slate-700/80">
          "Aarav has been demonstrating commendable dedication in Machine Learning and Database Systems. His recent ResNet submission was ranked among the top 3 in class. He maintains a safe 86.4% aggregate attendance and is on track for First Class with Distinction. We encourage his continued preparation for the upcoming Mid-Term II exams on September 22."
        </p>
      </div>
    </div>
  );
}
