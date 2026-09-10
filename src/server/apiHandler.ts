import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export interface ApiRequest {
  url?: string;
  method?: string;
  body?: any;
}

export interface ApiResponse {
  statusCode?: number;
  setHeader: (key: string, value: string) => void;
  end: (chunk?: string | Buffer) => void;
  writeHead?: (status: number, headers?: Record<string, string>) => void;
  status?: (code: number) => ApiResponse;
  json?: (data: any) => void;
}

export async function handleApiRoute(req: any, res: any): Promise<boolean> {
  const parsedUrl = new URL(req.url || '/', 'http://localhost:3000');
  const pathname = parsedUrl.pathname;

  if (!pathname.startsWith('/api/')) {
    return false;
  }

  // Set CORS and JSON headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return true;
  }

  // Parse body if present and not yet parsed
  let body: any = req.body;
  if (!body && req.method === 'POST') {
    body = await new Promise((resolve) => {
      let data = '';
      req.on('data', (chunk: any) => {
        data += chunk;
      });
      req.on('end', () => {
        try {
          resolve(data ? JSON.parse(data) : {});
        } catch {
          resolve({});
        }
      });
    });
  }

  try {
    if (pathname === '/api/health') {
      res.statusCode = 200;
      res.end(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
        service: 'Smart College Assistant Core Engine',
        version: '2.4.0'
      }));
      return true;
    }

    // AI Attendance Predictor
    if (pathname === '/api/ai/attendance-predictor' && req.method === 'POST') {
      const attended = Number(body?.attended ?? 42);
      const total = Number(body?.total ?? 48);
      const missedOptions = [1, 2, 5, 10];
      const courseName = body?.courseName || 'Selected Course';

      const currentPct = total > 0 ? Number(((attended / total) * 100).toFixed(1)) : 100;

      // Mathematical simulation: if student misses X classes, total increases by X, attended stays same
      const projections = missedOptions.map((missed) => {
        const newTotal = total + missed;
        const newPct = Number(((attended / newTotal) * 100).toFixed(1));
        let status: 'safe' | 'warning' | 'critical' = 'safe';
        if (newPct < 75) status = 'critical';
        else if (newPct < 80) status = 'warning';

        return {
          missedClasses: missed,
          newAttended: attended,
          newTotal,
          projectedPercentage: newPct,
          status,
          belowThreshold: newPct < 75,
        };
      });

      // Classes needed consecutively to reach 75% or 85%
      // (attended + k) / (total + k) >= target => k >= (target*total - attended) / (1 - target)
      function classesToReach(targetPct: number): number {
        const target = targetPct / 100;
        if (currentPct >= targetPct) return 0;
        const required = Math.ceil((target * total - attended) / (1 - target));
        return Math.max(0, required);
      }

      const neededFor75 = classesToReach(75);
      const neededFor85 = classesToReach(85);

      // AI Contextual Advice
      let aiAdvice = '';
      const client = getGeminiClient();
      if (client) {
        try {
          const prompt = `You are the AI Academic Advisor for a student in the Smart College Assistant app.
Course: ${courseName}
Current Attendance: ${attended}/${total} (${currentPct}%)
College Minimum Mandatory Attendance: 75%
Projections if missing classes:
- Miss 1 class: ${projections[0].projectedPercentage}%
- Miss 2 classes: ${projections[1].projectedPercentage}%
- Miss 5 classes: ${projections[2].projectedPercentage}%
- Miss 10 classes: ${projections[3].projectedPercentage}%
Consecutive classes needed for 75%: ${neededFor75}
Consecutive classes needed for 85%: ${neededFor85}

Provide a concise, motivating, highly actionable 2-3 paragraph guidance for the student explaining the exact risk, exam eligibility rules, and a specific strategy to maintain safe standing. Keep it encouraging and direct without markdown jargon.`;

          const response = await client.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
          });
          aiAdvice = response.text || '';
        } catch (err: any) {
          console.warn('Gemini API call skipped/fallback:', err?.message);
        }
      }

      if (!aiAdvice) {
        aiAdvice = currentPct >= 85
          ? `Your attendance in ${courseName} is currently in the high-distinction band (${currentPct}%). Missing up to 2 classes will keep you safely above 80%, but missing 5 or more will severely degrade your standing toward the 75% threshold. Maintain your consistency to preserve buffer for unforeseen emergencies.`
          : currentPct >= 75
          ? `You are currently above the mandatory 75% university eligibility line (${currentPct}%), but your buffer is fragile. Missing even 2 classes will pull you into warning territory. You must attend the next ${neededFor85 || 4} consecutive lectures to rebuild an 85% safe safety margin before mid-terms.`
          : `URGENT: Your attendance in ${courseName} (${currentPct}%) is below the required 75% university threshold. You must attend at least ${neededFor75} consecutive classes without absence to regain eligibility for the final examination. Immediately contact your course faculty and file formal duty/medical slips for past absences.`;
      }

      res.statusCode = 200;
      res.end(JSON.stringify({
        courseName,
        currentPct,
        attended,
        total,
        projections,
        neededFor75,
        neededFor85,
        aiAdvice,
        calculatedAt: new Date().toISOString()
      }));
      return true;
    }

    // AI CGPA Predictor
    if (pathname === '/api/ai/cgpa-predictor' && req.method === 'POST') {
      const currentCgpa = Number(body?.currentCgpa ?? 8.92);
      const completedCredits = Number(body?.completedCredits ?? 103);
      const currentSemesterCredits = Number(body?.currentSemesterCredits ?? 20);
      const courses = body?.courses || [
        { code: 'CS301', name: 'Machine Learning', credits: 4, internalScore: 93, targetGrade: 'O (10)' },
        { code: 'CS302', name: 'Database Management', credits: 4, internalScore: 88.5, targetGrade: 'A+ (9)' },
        { code: 'CS303', name: 'Computer Networks', credits: 3, internalScore: 77.5, targetGrade: 'A (8)' },
        { code: 'CS304', name: 'Cloud & DevOps', credits: 3, internalScore: 95.5, targetGrade: 'O (10)' },
        { code: 'CS305', name: 'Compiler Design', credits: 3, internalScore: 73.0, targetGrade: 'B+ (7)' },
        { code: 'CS306', name: 'Cybersecurity', credits: 3, internalScore: 86.0, targetGrade: 'A+ (9)' },
      ];

      // Calculate projected SGPA based on target grades
      const gradeMap: Record<string, number> = {
        'O (10)': 10, 'A+ (9)': 9, 'A (8)': 8, 'B+ (7)': 7, 'B (6)': 6, 'C (5)': 5, 'P (4)': 4, 'F (0)': 0
      };

      let totalPoints = 0;
      let totalSemCredits = 0;
      courses.forEach((c: any) => {
        const cred = Number(c.credits || 3);
        const pts = gradeMap[c.targetGrade] ?? (c.internalScore >= 90 ? 10 : c.internalScore >= 80 ? 9 : c.internalScore >= 70 ? 8 : 7);
        totalPoints += cred * pts;
        totalSemCredits += cred;
      });

      const projectedSgpa = Number((totalPoints / (totalSemCredits || 1)).toFixed(2));
      const previousTotalPoints = currentCgpa * completedCredits;
      const newTotalCredits = completedCredits + totalSemCredits;
      const projectedCumulativeCgpa = Number(((previousTotalPoints + totalPoints) / newTotalCredits).toFixed(2));

      let aiInsights = '';
      const client = getGeminiClient();
      if (client) {
        try {
          const prompt = `You are the AI Academic Performance Analyst for Smart College Assistant.
Student Current CGPA: ${currentCgpa} (across ${completedCredits} completed credits)
Current Semester Courses & Internal Marks:
${courses.map((c: any) => `- ${c.name} (${c.code}): Credits: ${c.credits}, Internals: ${c.internalScore}%, Target Grade: ${c.targetGrade}`).join('\n')}

Projected Current SGPA: ${projectedSgpa}
Projected Overall Cumulative CGPA: ${projectedCumulativeCgpa}

Provide an insightful, 3-point strategy breakdown:
1. High-Leverage Course: Which 4-credit course yields the greatest mathematical boost if improved by 1 grade level.
2. At-Risk Course: Focus required on the lowest internal score course.
3. Exam preparation blueprint: Specific actionable advice to guarantee the projected ${projectedCumulativeCgpa} CGPA or reach the next milestone. Keep it crisp, sharp and encouraging.`;

          const response = await client.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
          });
          aiInsights = response.text || '';
        } catch (err: any) {
          console.warn('Gemini CGPA prediction fallback:', err?.message);
        }
      }

      if (!aiInsights) {
        aiInsights = `### Academic Projection Summary
- **High-Impact Target**: CS301 (Machine Learning - 4 credits) has your highest current score (93%). Securing an 'O' (10.0) grade here provides the anchor weight to sustain an SGPA above 9.0.
- **Critical Focus Area**: CS305 (Compiler Design - 73%) is your most vulnerable subject. Shoring up Parsing & Syntax-Directed Translation before end-terms can bump your grade from B+ to A, adding +0.15 to your cumulative CGPA.
- **Target Goal**: Maintaining your projected SGPA of ${projectedSgpa} will lift your cumulative university CGPA from ${currentCgpa} to **${projectedCumulativeCgpa}**, firmly placing you in the top 5% University Honor Roll for campus placements.`;
      }

      res.statusCode = 200;
      res.end(JSON.stringify({
        currentCgpa,
        projectedSgpa,
        projectedCumulativeCgpa,
        completedCredits,
        totalSemCredits,
        newTotalCredits,
        courses,
        aiInsights,
        calculatedAt: new Date().toISOString()
      }));
      return true;
    }

    // AI Smart Study Planner
    if (pathname === '/api/ai/study-planner' && req.method === 'POST') {
      const subjects = body?.subjects || ['Machine Learning', 'Database Systems', 'Computer Networks', 'Compiler Design'];
      const weakTopics = body?.weakTopics || ['B+ Tree Indexing in DBMS', 'Backpropagation & Gradient Descent', 'TCP Congestion Control', 'LR(1) Parsing in Compilers'];
      const availableHours = Number(body?.availableHours ?? 4.5);
      const upcomingExams = body?.upcomingExams || [
        { subject: 'Machine Learning', date: 'Sep 22, 2026', daysRemaining: 12 },
        { subject: 'Database Management', date: 'Sep 24, 2026', daysRemaining: 14 },
      ];

      let generatedPlan = null;
      const client = getGeminiClient();
      if (client) {
        try {
          const prompt = `You are the AI Smart Study Planner for Smart College Assistant.
Inputs:
- Subjects: ${subjects.join(', ')}
- Weak Topics needing immediate reinforcement: ${weakTopics.join(', ')}
- Daily Available Study Hours: ${availableHours} hours
- Upcoming Exams: ${upcomingExams.map((e: any) => `${e.subject} (${e.daysRemaining} days left)`).join(', ')}

Create a personalized, scientifically backed daily study timetable (using Pomodoro technique and active recall). Return valid JSON with this structure:
{
  "totalHours": ${availableHours},
  "focusPhilosophy": "A short 1-sentence methodology statement",
  "sessions": [
    {
      "time": "06:30 PM - 07:45 PM",
      "subject": "string",
      "topic": "string",
      "technique": "Active Recall / Flashcards / Problem Solving / Feynman Method",
      "duration": "75 mins",
      "highPriority": true
    }
  ],
  "retentionStrategy": ["tip 1", "tip 2", "tip 3"]
}
Return ONLY valid raw JSON with no backticks.`;

          const response = await client.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
          });

          const rawText = (response.text || '').trim();
          const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          generatedPlan = JSON.parse(cleanJson);
        } catch (err: any) {
          console.warn('Gemini study planner fallback:', err?.message);
        }
      }

      if (!generatedPlan) {
        generatedPlan = {
          totalHours: availableHours,
          focusPhilosophy: "Interleaved spaced repetition prioritizing high-weightage weak topics before mid-semester exams.",
          sessions: [
            {
              time: '05:30 PM - 06:45 PM',
              subject: 'Compiler Design',
              topic: 'LR(1) Parsing Tables & Conflict Resolution',
              technique: 'Feynman Technique & Manual Grammatical Trace',
              duration: '75 mins',
              highPriority: true,
            },
            {
              time: '07:00 PM - 08:00 PM',
              subject: 'Database Systems',
              topic: 'B+ Tree Splitting & Transaction Isolation Levels',
              technique: 'Active Problem Solving & SQL Query Execution',
              duration: '60 mins',
              highPriority: true,
            },
            {
              time: '08:30 PM - 09:30 PM',
              subject: 'Machine Learning',
              topic: 'Backpropagation Vector Calculus & Cross-Entropy Math',
              technique: 'Mathematical Derivation from Scratch',
              duration: '60 mins',
              highPriority: false,
            },
            {
              time: '09:45 PM - 10:30 PM',
              subject: 'Computer Networks',
              topic: 'TCP Slow-Start & Fast Retransmit Simulation',
              technique: 'Wireshark Packet Analysis Review',
              duration: '45 mins',
              highPriority: false,
            },
          ],
          retentionStrategy: [
            'Test yourself with closed-book recall before checking standard textbook answers.',
            'Take a mandatory 15-minute screen-free rest between session blocks.',
            'Review flashcards for Compiler Design grammar rules for 10 minutes right before sleep.'
          ],
        };
      }

      res.statusCode = 200;
      res.end(JSON.stringify(generatedPlan));
      return true;
    }

    // AI Academic Chatbot
    if (pathname === '/api/ai/academic-chatbot' && req.method === 'POST') {
      const userMessage = body?.message || '';
      const userRole = body?.userRole || 'student';
      const history = body?.history || [];

      let botReply = '';
      const client = getGeminiClient();

      if (client) {
        try {
          const systemContext = `You are the official Smart College Assistant AI Campus Companion for university students, faculty, parents, and administrators.
You have access to real campus policies:
- Attendance Policy: Mandatory 75% aggregate in every registered course. 65%-74% allowed only on medical or institutional duty grounds with pre-approved dean sanction. Below 65% is automatic repeat course (NE category).
- Grading Scale: O (10 pts, 90-100), A+ (9 pts, 80-89), A (8 pts, 70-79), B+ (7 pts, 60-69), B (6 pts, 50-59), P (4 pts, 40-49), F (<40).
- Examination: Mid-Terms weight 30%, Continuous Internal Assessment (quizzes/assignments) 20%, End-Terms 50%.
- Campus Locations: LH-302 and CS Faculty in Academic Block A (3rd Floor), AI & Machine Learning Lab in Tech Tower (4th Floor), Central Digital Library in Knowledge Center (1st Floor, 24/7 during exams).
- Current user role: ${userRole}.
Provide clear, authoritative, polite, and warmly helpful answers. You can explain computer science concepts, exam regulations, syllabus questions, attendance queries, or give campus directions. Keep formatting clean with bullet points.`;

          const conversationContents: any[] = [
            { text: systemContext },
          ];

          if (Array.isArray(history)) {
            history.slice(-6).forEach((h: any) => {
              if (h.sender === 'user') {
                conversationContents.push({ text: `User: ${h.text}` });
              } else if (h.sender === 'assistant') {
                conversationContents.push({ text: `Assistant: ${h.text}` });
              }
            });
          }

          conversationContents.push({ text: `User (${userRole}): ${userMessage}` });

          const response = await client.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: conversationContents,
          });

          botReply = response.text || '';
        } catch (err: any) {
          console.warn('Gemini Chatbot API fallback:', err?.message);
        }
      }

      if (!botReply) {
        // High quality intelligent response
        const msg = userMessage.toLowerCase();
        if (msg.includes('attendance') || msg.includes('75%') || msg.includes('miss')) {
          botReply = `**University Attendance Policy (Regulation 2024)**
- **Mandatory Threshold**: All undergraduate candidates must maintain a minimum of **75% aggregate attendance** in each registered course to be eligible for End-Semester Examinations.
- **Condonation Range (65% – 74%)**: Medical condonation is permitted only upon submission of an authenticated medical certificate within 5 working days, subject to Dean of Academic Affairs approval and a prescribed condonation fee.
- **Below 65%**: Students falling below 65% are assigned the 'NE' (Not Eligible) status and are required to re-register for the course in a subsequent semester.
*Tip: Use the AI Attendance Predictor tab to simulate missed classes and calculate exact recovery counts!*`;
        } else if (msg.includes('exam') || msg.includes('mid-term') || msg.includes('schedule') || msg.includes('hall ticket')) {
          botReply = `**Upcoming Examination Information**
- **Mid-Term II Exams**: Begin on **September 22, 2026** and conclude on October 02, 2026.
- **Hall Tickets**: Digital QR-verified hall tickets are available under your **Results & Schedule** tab. Download before September 18.
- **Reporting Time**: Students must report to Exam Halls (e.g., LH-302, Exam Hall A/B) at least 20 minutes prior to the commencement bell. Electronic wearables and unapproved calculators are strictly prohibited.`;
        } else if (msg.includes('cgpa') || msg.includes('grade') || msg.includes('sgpa') || msg.includes('marks')) {
          botReply = `**University 10-Point Grading System**
- **O (Outstanding)**: 90% – 100% | Grade Points: 10.0
- **A+ (Excellent)**: 80% – 89% | Grade Points: 9.0
- **A (Very Good)**: 70% – 79% | Grade Points: 8.0
- **B+ (Good)**: 60% – 69% | Grade Points: 7.0
- **B (Above Average)**: 50% – 59% | Grade Points: 6.0
- **P (Pass)**: 40% – 49% | Grade Points: 4.0
- **F (Fail)**: Below 40% | Grade Points: 0.0

*Cumulative CGPA = Σ(Credits × Grade Points) / Σ(Total Registered Credits)*.
Check out the **AI CGPA Predictor** to model your projected graduation distinction!`;
        } else if (msg.includes('leave') || msg.includes('apply') || msg.includes('medical')) {
          botReply = `**Leave Application & Duty Sanction Guide**
1. Navigate to the **Leave Application** tab in your Student dashboard.
2. Choose from **Medical**, **On-Duty (Hackathon/Conference)**, or **Casual**.
3. Attach relevant doctor's prescription or official acceptance letters.
4. Your Class Advisor (Dr. Rajesh Menon) and HOD receive real-time notifications to review and approve.
*Once approved, your attendance registers are automatically updated with duty credits!*`;
        } else if (msg.includes('library') || msg.includes('lab') || msg.includes('room') || msg.includes('map')) {
          botReply = `**Campus Facility Directory**
- **AI & ML Innovation Lab**: Tech Tower, 4th Floor (Room 401). Features 40x RTX 4090 stations. Currently in-session until 01:00 PM.
- **Central Digital Library**: Knowledge Center, 1st Floor. Open 24/7 during mid-term and finals.
- **Database & Cloud Systems Lab**: Academic Block A, 2nd Floor. Open for practice today.
- **Computer Science Department Office**: Academic Block A, 3rd Floor (Room CSE-W1).
*Visit the interactive **Campus Map** tab to inspect live classroom & lab vacancies in real time!*`;
        } else {
          botReply = `Hello! I'm your Smart College Assistant AI companion. I'm here to support you with:
- **Academic Inquiries**: Syllabi, exam schedules, grading criteria, and timetable queries.
- **Subject Doubts**: Quick explanations of computer science algorithms, database queries, and system architectures.
- **Rules & Regulations**: Attendance thresholds, duty leaves, fee payment installments, and campus protocols.
- **Campus Navigation**: Room locations, lab vacancies, and faculty office hours.

Feel free to ask a specific question, or select one of the quick suggestions below!`;
        }
      }

      res.statusCode = 200;
      res.end(JSON.stringify({
        reply: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedNext: [
          'What happens if my attendance drops below 75%?',
          'How is CGPA calculated from internal marks?',
          'When are the Mid-Term II exams starting?',
          'Where is the AI & ML Innovation Lab located?'
        ]
      }));
      return true;
    }

    // Default 404 for unknown api routes
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'API route not found', path: pathname }));
    return true;
  } catch (error: any) {
    console.error('API Handler Error:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error.message || 'Internal Server Error' }));
    return true;
  }
}
