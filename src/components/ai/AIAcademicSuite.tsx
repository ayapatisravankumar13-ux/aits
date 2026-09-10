import { useState } from 'react';
import { initialAttendance, initialMarks } from '../../data/mockData.ts';
import { Bot, Sparkles, TrendingDown, TrendingUp, Calendar, BookOpen, Send, RefreshCw, AlertTriangle, CheckCircle2, ArrowRight, Brain, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

export function AIAcademicSuite({ defaultTab = 'attendance' }: { defaultTab?: 'attendance' | 'cgpa' | 'planner' | 'chatbot' }) {
  const [activeTab, setActiveTab] = useState<'attendance' | 'cgpa' | 'planner' | 'chatbot'>(defaultTab);

  // 1. Attendance Predictor State
  const [selectedCourseIndex, setSelectedCourseIndex] = useState(0);
  const selectedCourse = initialAttendance[selectedCourseIndex];
  const [attendedInput, setAttendedInput] = useState(selectedCourse.attended);
  const [totalInput, setTotalInput] = useState(selectedCourse.total);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceResult, setAttendanceResult] = useState<any>(null);

  // 2. CGPA Predictor State
  const [currentCgpaInput, setCurrentCgpaInput] = useState(8.92);
  const [completedCreditsInput, setCompletedCreditsInput] = useState(103);
  const [courseTargets, setCourseTargets] = useState(
    initialMarks.map((m) => ({
      code: m.subjectCode,
      name: m.subjectName,
      credits: m.subjectCode === 'CS301' || m.subjectCode === 'CS302' ? 4 : 3,
      internalScore: m.totalPercentage,
      targetGrade: m.totalPercentage >= 90 ? 'O (10)' : m.totalPercentage >= 80 ? 'A+ (9)' : 'A (8)',
    }))
  );
  const [cgpaLoading, setCgpaLoading] = useState(false);
  const [cgpaResult, setCgpaResult] = useState<any>(null);

  // 3. Smart Study Planner State
  const [availableHours, setAvailableHours] = useState(4.5);
  const [weakTopics, setWeakTopics] = useState<string[]>([
    'B+ Tree Indexing in DBMS',
    'Backpropagation Vector Calculus',
    'LR(1) Parsing Table Conflicts',
  ]);
  const [newWeakTopic, setNewWeakTopic] = useState('');
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState<any>(null);

  // 4. Academic Chatbot State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; time: string }>>([
    {
      sender: 'assistant',
      text: "Hello! I'm your Smart College Assistant AI. Ask me about attendance rules, exam dates, subject concepts, leave applications, or campus navigation directions!",
      time: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Trigger attendance prediction
  async function runAttendancePredictor() {
    setAttendanceLoading(true);
    try {
      const res = await fetch('/api/ai/attendance-predictor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attended: attendedInput,
          total: totalInput,
          courseName: selectedCourse.name,
        }),
      });
      const data = await res.json();
      setAttendanceResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAttendanceLoading(false);
    }
  }

  // Trigger CGPA prediction
  async function runCgpaPredictor() {
    setCgpaLoading(true);
    try {
      const res = await fetch('/api/ai/cgpa-predictor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentCgpa: currentCgpaInput,
          completedCredits: completedCreditsInput,
          courses: courseTargets,
        }),
      });
      const data = await res.json();
      setCgpaResult(data);
      if (data.projectedCumulativeCgpa >= 8.9) {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCgpaLoading(false);
    }
  }

  // Trigger Study Planner
  async function runStudyPlanner() {
    setPlannerLoading(true);
    try {
      const res = await fetch('/api/ai/study-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: courseTargets.map((c) => c.name),
          weakTopics,
          availableHours,
        }),
      });
      const data = await res.json();
      setStudyPlan(data);
    } catch (e) {
      console.error(e);
    } finally {
      setPlannerLoading(false);
    }
  }

  // Send message in Chatbot
  async function sendChatMessage(overrideText?: string) {
    const text = overrideText || chatInput;
    if (!text.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    if (!overrideText) setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/academic-chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          userRole: 'student',
          history: chatMessages.slice(-4),
        }),
      });
      const data = await res.json();
      const botMsg = {
        sender: 'assistant' as const,
        text: data.reply || 'I am processing your query...',
        time: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Unable to reach the campus AI core. Please check your network connection.',
          time: 'Just now',
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Sub-Navigation Tabs */}
      <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700/80 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all font-semibold ${
            activeTab === 'attendance'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          Attendance Predictor
        </button>
        <button
          onClick={() => setActiveTab('cgpa')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all font-semibold ${
            activeTab === 'cgpa'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          CGPA Predictor
        </button>
        <button
          onClick={() => setActiveTab('planner')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all font-semibold ${
            activeTab === 'planner'
              ? 'bg-purple-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Smart Study Planner
        </button>
        <button
          onClick={() => setActiveTab('chatbot')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all font-semibold ${
            activeTab === 'chatbot'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot className="w-4 h-4" />
          AI Academic Chatbot
        </button>
      </div>

      {/* 1. ATTENDANCE PREDICTOR */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  AI Attendance Forecasting Engine
                </h3>
                <p className="text-xs text-slate-400">
                  Simulate future attendance trajectory if you miss 1, 2, 5, or 10 lectures.
                </p>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
                Rule: ≥ 75% Mandatory
              </span>
            </div>

            {/* Course Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Select Registered Course</label>
                <select
                  value={selectedCourseIndex}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setSelectedCourseIndex(idx);
                    setAttendedInput(initialAttendance[idx].attended);
                    setTotalInput(initialAttendance[idx].total);
                  }}
                  className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {initialAttendance.map((c, i) => (
                    <option key={c.id} value={i}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Attended Lectures</label>
                <input
                  type="number"
                  min="0"
                  max={totalInput}
                  value={attendedInput}
                  onChange={(e) => setAttendedInput(Number(e.target.value))}
                  className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Total Held Lectures</label>
                <input
                  type="number"
                  min="1"
                  value={totalInput}
                  onChange={(e) => setTotalInput(Number(e.target.value))}
                  className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Current Standing Quick Bar */}
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/70 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="text-xl font-bold text-slate-100">
                  {totalInput > 0 ? ((attendedInput / totalInput) * 100).toFixed(1) : 100}%
                </div>
                <div className="text-xs text-slate-400">
                  Current Standing: <span className="text-slate-200 font-semibold">{attendedInput} / {totalInput}</span> classes attended
                </div>
              </div>

              <button
                onClick={runAttendancePredictor}
                disabled={attendanceLoading}
                className="py-2 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow"
              >
                {attendanceLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Run AI Prediction Simulation
              </button>
            </div>

            {/* Projections Display */}
            {attendanceResult && (
              <div className="space-y-4 pt-2 border-t border-slate-700/60">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {attendanceResult.projections?.map((proj: any) => {
                    const isDanger = proj.projectedPercentage < 75;
                    const isWarning = proj.projectedPercentage >= 75 && proj.projectedPercentage < 80;
                    return (
                      <div
                        key={proj.missedClasses}
                        className={`p-3 rounded-xl border transition-all ${
                          isDanger
                            ? 'bg-rose-950/40 border-rose-500/60'
                            : isWarning
                            ? 'bg-amber-950/40 border-amber-500/60'
                            : 'bg-emerald-950/30 border-emerald-500/40'
                        }`}
                      >
                        <div className="text-[11px] font-medium text-slate-400 mb-1">
                          If you miss <span className="font-bold text-slate-200">{proj.missedClasses}</span> {proj.missedClasses === 1 ? 'class' : 'classes'}:
                        </div>
                        <div
                          className={`text-xl font-extrabold ${
                            isDanger ? 'text-rose-400' : isWarning ? 'text-amber-300' : 'text-emerald-400'
                          }`}
                        >
                          {proj.projectedPercentage}%
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold">
                          {isDanger ? (
                            <span className="text-rose-400 flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3" /> Debarred (&lt;75%)
                            </span>
                          ) : isWarning ? (
                            <span className="text-amber-300 flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3" /> Low Buffer
                            </span>
                          ) : (
                            <span className="text-emerald-400 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Safe Zone
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Consecutive classes needed */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Consecutive Classes for 75% Safety</div>
                      <div className="text-lg font-bold text-slate-200 mt-0.5">
                        {attendanceResult.neededFor75 === 0 ? 'Already Secured' : `${attendanceResult.neededFor75} Classes`}
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>

                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Consecutive Classes for 85% Distinction</div>
                      <div className="text-lg font-bold text-blue-400 mt-0.5">
                        {attendanceResult.neededFor85 === 0 ? 'Achieved!' : `${attendanceResult.neededFor85} Classes`}
                      </div>
                    </div>
                    <Sparkles className="w-5 h-5 text-blue-400" />
                  </div>
                </div>

                {/* Gemini AI Personalized Action Plan */}
                {attendanceResult.aiAdvice && (
                  <div className="p-4 bg-gradient-to-br from-blue-950/40 to-slate-900/90 border border-blue-500/30 rounded-xl">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                      <Brain className="w-4 h-4" />
                      AI Advisor Recommendations & Recovery Blueprint
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                      {attendanceResult.aiAdvice}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. CGPA PREDICTOR */}
      {activeTab === 'cgpa' && (
        <div className="space-y-4">
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  AI CGPA & SGPA Trajectory Predictor
                </h3>
                <p className="text-xs text-slate-400">
                  Model expected semester grade points, overall graduation CGPA, and course weights.
                </p>
              </div>
              <button
                onClick={runCgpaPredictor}
                disabled={cgpaLoading}
                className="py-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow"
              >
                {cgpaLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Calculate Projection
              </button>
            </div>

            {/* Baseline credentials */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 p-3 bg-slate-900/80 rounded-xl border border-slate-700/60 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Prior CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentCgpaInput}
                  onChange={(e) => setCurrentCgpaInput(Number(e.target.value))}
                  className="w-full py-1.5 px-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-bold"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Completed Credits</label>
                <input
                  type="number"
                  value={completedCreditsInput}
                  onChange={(e) => setCompletedCreditsInput(Number(e.target.value))}
                  className="w-full py-1.5 px-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-bold"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Current Sem Credits</label>
                <div className="py-1.5 px-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 font-bold">
                  {courseTargets.reduce((acc, c) => acc + c.credits, 0)} Credits
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Total Graduation Pool</label>
                <div className="py-1.5 px-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 font-bold">
                  {completedCreditsInput + courseTargets.reduce((acc, c) => acc + c.credits, 0)} Credits
                </div>
              </div>
            </div>

            {/* Course targets list */}
            <div className="space-y-2 mb-4">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Semester 6 Registered Courses & Target Grades
              </span>
              <div className="divide-y divide-slate-700/50 rounded-xl border border-slate-700 overflow-hidden bg-slate-900/60">
                {courseTargets.map((c, i) => (
                  <div key={c.code} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex-1">
                      <div className="font-semibold text-slate-200 flex items-center gap-2">
                        <span>{c.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {c.code}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                          {c.credits} Credits
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Internal Test Score: <span className="text-slate-200 font-semibold">{c.internalScore}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">Expected Grade:</span>
                      <select
                        value={c.targetGrade}
                        onChange={(e) => {
                          const updated = [...courseTargets];
                          updated[i].targetGrade = e.target.value;
                          setCourseTargets(updated);
                        }}
                        className="py-1 px-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-semibold focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="O (10)">O (10.0)</option>
                        <option value="A+ (9)">A+ (9.0)</option>
                        <option value="A (8)">A (8.0)</option>
                        <option value="B+ (7)">B+ (7.0)</option>
                        <option value="B (6)">B (6.0)</option>
                        <option value="C (5)">C (5.0)</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Results card */}
            {cgpaResult && (
              <div className="p-4 bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-xl space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/80">
                    <span className="text-slate-400 text-[11px] block">Projected Semester SGPA</span>
                    <span className="text-2xl font-black text-indigo-400 mt-1 block">
                      {cgpaResult.projectedSgpa} / 10.0
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/80">
                    <span className="text-slate-400 text-[11px] block">New Cumulative CGPA</span>
                    <span className="text-2xl font-black text-emerald-400 mt-1 block">
                      {cgpaResult.projectedCumulativeCgpa} / 10.0
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/80 col-span-2 sm:col-span-1">
                    <span className="text-slate-400 text-[11px] block">Graduation Distinction</span>
                    <span className="text-xs font-bold text-amber-300 mt-1.5 block">
                      First Class with Distinction (Top 5%)
                    </span>
                  </div>
                </div>

                {cgpaResult.aiInsights && (
                  <div className="text-xs text-slate-200 leading-relaxed pt-2 border-t border-indigo-500/20 whitespace-pre-line">
                    {cgpaResult.aiInsights}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SMART STUDY PLANNER */}
      {activeTab === 'planner' && (
        <div className="space-y-4">
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  AI Smart Study Timetable Generator
                </h3>
                <p className="text-xs text-slate-400">
                  Generates daily study slots tailored to weak topics, available hours, and upcoming exams.
                </p>
              </div>
              <button
                onClick={runStudyPlanner}
                disabled={plannerLoading}
                className="py-1.5 px-3.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow"
              >
                {plannerLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Generate Smart Timetable
              </button>
            </div>

            {/* Hours Slider */}
            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-700/70 mb-3">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-400" />
                  Available Study Hours Today:
                </span>
                <span className="text-sm font-bold text-purple-400">{availableHours} Hours</span>
              </div>
              <input
                type="range"
                min="2"
                max="8"
                step="0.5"
                value={availableHours}
                onChange={(e) => setAvailableHours(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>2 hrs (Light Review)</span>
                <span>4.5 hrs (Standard Active Recall)</span>
                <span>8 hrs (Intensive Exam Prep)</span>
              </div>
            </div>

            {/* Weak Topics Manager */}
            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-700/70 mb-4">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Weak Topics Needing Immediate Reinforcement:
              </span>
              <div className="flex flex-wrap gap-2 mb-2.5">
                {weakTopics.map((topic, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs rounded-lg flex items-center gap-1.5"
                  >
                    <span>{topic}</span>
                    <button
                      onClick={() => setWeakTopics(weakTopics.filter((_, idx) => idx !== i))}
                      className="text-purple-400 hover:text-rose-400 ml-1 text-xs"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add another challenging topic..."
                  value={newWeakTopic}
                  onChange={(e) => setNewWeakTopic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newWeakTopic.trim()) {
                      setWeakTopics([...weakTopics, newWeakTopic.trim()]);
                      setNewWeakTopic('');
                    }
                  }}
                  className="flex-1 py-1.5 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={() => {
                    if (newWeakTopic.trim()) {
                      setWeakTopics([...weakTopics, newWeakTopic.trim()]);
                      setNewWeakTopic('');
                    }
                  }}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl"
                >
                  Add Topic
                </button>
              </div>
            </div>

            {/* Study Plan Output */}
            {studyPlan && (
              <div className="space-y-3 pt-2 border-t border-slate-700/60">
                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200">
                  <span className="font-bold">Core Study Philosophy: </span>
                  {studyPlan.focusPhilosophy}
                </div>

                <div className="space-y-2">
                  {studyPlan.sessions?.map((sess: any, i: number) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-200">{sess.subject}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                              {sess.time}
                            </span>
                            {sess.highPriority && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold uppercase">
                                High Priority
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5">{sess.topic}</p>
                          <span className="text-[10px] text-purple-400 font-medium">
                            Technique: {sess.technique}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-semibold text-slate-400 shrink-0">
                        {sess.duration}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Retention Strategies */}
                {studyPlan.retentionStrategy && (
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                      Retention & Memory Reinforcement Tips:
                    </span>
                    <ul className="space-y-1 text-slate-300 list-disc list-inside">
                      {studyPlan.retentionStrategy.map((tip: string, idx: number) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. ACADEMIC CHATBOT */}
      {activeTab === 'chatbot' && (
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/80 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  Campus AI Companion
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Ready to answer campus rules, subjects, exam schedules & room locations
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                setChatMessages([
                  {
                    sender: 'assistant',
                    text: 'Session reset. What can I assist you with today?',
                    time: 'Just now',
                  },
                ])
              }
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-900 border border-slate-700"
            >
              Clear
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-900 text-slate-200 border border-slate-700/80 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-blue-200' : 'text-slate-500'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex gap-2 items-center text-slate-400 text-xs py-1">
                <Bot className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>AI Companion is thinking...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="py-2 flex items-center gap-1.5 overflow-x-auto text-[11px] border-t border-slate-700/60 mt-2">
            {[
              'What is the 75% attendance rule?',
              'When do Mid-Term II exams start?',
              'How to apply for Hackathon duty leave?',
              'Where is the AI & ML Innovation Lab?',
            ].map((q, i) => (
              <button
                key={i}
                onClick={() => sendChatMessage(q)}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-700/70 border border-slate-700 rounded-full text-slate-300 whitespace-nowrap transition-all"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="pt-2 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask anything about academics, schedule, or campus..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
              className="flex-1 py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => sendChatMessage()}
              disabled={chatLoading || !chatInput.trim()}
              className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
