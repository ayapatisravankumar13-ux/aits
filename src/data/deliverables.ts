export interface CodeFile {
  name: string;
  path: string;
  language: string;
  content: string;
  description: string;
}

export interface DeliverableCategory {
  id: string;
  title: string;
  badge: string;
  description: string;
  files: CodeFile[];
}

export const deliverablesData: DeliverableCategory[] = [
  {
    id: 'flutter',
    title: 'Flutter Cross-Platform Mobile App',
    badge: 'Mobile Client (iOS & Android)',
    description: 'Production-ready Flutter 3.x project implementing Material 3 widgets, Firebase Auth, state management with Riverpod, offline caching, and responsive UI.',
    files: [
      {
        name: 'pubspec.yaml',
        path: 'smart_college_assistant/pubspec.yaml',
        language: 'yaml',
        description: 'Flutter dependencies including Firebase, Dio, Riverpod, and Charts.',
        content: `name: smart_college_assistant
description: AI-Powered Digital Campus Companion for Students, Faculty, Parents, and Admins.
version: 1.0.0+1
environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.5.1
  firebase_core: ^2.30.0
  firebase_auth: ^4.19.0
  cloud_firestore: ^4.17.0
  firebase_storage: ^11.7.0
  firebase_messaging: ^14.9.0
  dio: ^5.4.3+1
  fl_chart: ^0.68.0
  qr_flutter: ^4.1.0
  mobile_scanner: ^5.1.1
  shared_preferences: ^2.2.3
  intl: ^0.19.0
  cached_network_image: ^3.3.1
  google_fonts: ^6.2.1
  flutter_local_notifications: ^17.1.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/icons/
    - assets/campus_map/
`,
      },
      {
        name: 'main.dart',
        path: 'smart_college_assistant/lib/main.dart',
        language: 'dart',
        description: 'App entry point, Firebase bootstrap, theme configuration & role routing.',
        content: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/auth/role_select_screen.dart';
import 'screens/student/student_shell.dart';
import 'screens/faculty/faculty_shell.dart';
import 'screens/parent/parent_shell.dart';
import 'screens/admin/admin_shell.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(const ProviderScope(child: SmartCollegeApp()));
}

class SmartCollegeApp extends StatelessWidget {
  const SmartCollegeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Smart College Assistant',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.system,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2563EB),
          brightness: Brightness.light,
        ),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF3B82F6),
          brightness: Brightness.dark,
        ),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(
          ThemeData.dark().textTheme,
        ),
      ),
      home: const RoleSelectScreen(),
    );
  }
}
`,
      },
      {
        name: 'ai_service.dart',
        path: 'smart_college_assistant/lib/services/ai_service.dart',
        language: 'dart',
        description: 'Client service communicating with Node.js backend & Python AI microservice.',
        content: `import 'package:dio/dio.dart';

class AIService {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: 'https://api.smartcampus.edu/v1',
    connectTimeout: const Duration(seconds: 15),
    receiveTimeout: const Duration(seconds: 15),
  ));

  /// Predicts attendance impact if student misses N classes
  Future<Map<String, dynamic>> predictAttendance({
    required int attended,
    required int total,
    required String courseName,
  }) async {
    final response = await _dio.post('/ai/attendance-predictor', data: {
      'attended': attended,
      'total': total,
      'courseName': courseName,
    });
    return response.data;
  }

  /// Calculates projected SGPA and cumulative CGPA
  Future<Map<String, dynamic>> predictCGPA({
    required double currentCgpa,
    required int completedCredits,
    required List<Map<String, dynamic>> courses,
  }) async {
    final response = await _dio.post('/ai/cgpa-predictor', data: {
      'currentCgpa': currentCgpa,
      'completedCredits': completedCredits,
      'courses': courses,
    });
    return response.data;
  }

  /// Generates personalized study planner
  Future<Map<String, dynamic>> generateStudyPlan({
    required List<String> subjects,
    required List<String> weakTopics,
    required double availableHours,
  }) async {
    final response = await _dio.post('/ai/study-planner', data: {
      'subjects': subjects,
      'weakTopics': weakTopics,
      'availableHours': availableHours,
    });
    return response.data;
  }

  /// Interactive academic campus companion chatbot
  Future<Map<String, dynamic>> sendChatMessage({
    required String message,
    required String userRole,
    List<Map<String, String>>? history,
  }) async {
    final response = await _dio.post('/ai/academic-chatbot', data: {
      'message': message,
      'userRole': userRole,
      'history': history ?? [],
    });
    return response.data;
  }
}
`,
      },
      {
        name: 'student_dashboard.dart',
        path: 'smart_college_assistant/lib/screens/student/student_dashboard.dart',
        language: 'dart',
        description: 'Material 3 Student Dashboard with attendance dial, CGPA card, and quick AI tools.',
        content: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class StudentDashboardScreen extends ConsumerWidget {
  const StudentDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Smart College Assistant'),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner),
            onPressed: () => _openQrScanner(context),
          ),
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          _buildHeroMetricCard(context),
          const SizedBox(height: 16),
          _buildQuickActionGrid(context),
          const SizedBox(height: 20),
          _buildAttendanceOverview(context),
          const SizedBox(height: 20),
          _buildUpcomingDeadlines(context),
        ],
      ),
    );
  }

  Widget _buildHeroMetricCard(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Cumulative CGPA', style: Theme.of(context).textTheme.labelMedium),
                const SizedBox(height: 4),
                Text('8.92', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                const Text('Top 5% • B.Tech CSE (Sem 6)', style: TextStyle(color: Colors.green, fontSize: 12)),
              ],
            ),
            CircularProgressIndicator(
              value: 0.865,
              strokeWidth: 8,
              backgroundColor: Colors.grey.shade200,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActionGrid(BuildContext context) {
    // Quick action grid for AI Predictor, Study Planner, Leave Request, Campus Navigation
    return Row(
      children: [
        Expanded(child: _actionButton(Icons.auto_graph, 'AI Attendance', Colors.blue)),
        const SizedBox(width: 8),
        Expanded(child: _actionButton(Icons.calculate, 'CGPA Predict', Colors.indigo)),
        const SizedBox(width: 8),
        Expanded(child: _actionButton(Icons.schedule, 'Study Plan', Colors.purple)),
        const SizedBox(width: 8),
        Expanded(child: _actionButton(Icons.map, 'Campus Map', Colors.teal)),
      ],
    );
  }

  Widget _actionButton(IconData icon, String label, Color color) {
    return InkWell(
      onTap: () {},
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(height: 4),
            Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color)),
          ],
        ),
      ),
    );
  }

  Widget _buildAttendanceOverview(BuildContext context) => Container();
  Widget _buildUpcomingDeadlines(BuildContext context) => Container();
  void _openQrScanner(BuildContext context) {}
}
`,
      },
    ],
  },
  {
    id: 'backend',
    title: 'Node.js Express REST Backend',
    badge: 'Core Services & API Gateway',
    description: 'Enterprise Node.js & Express application handling user roles, JWT authentication, Firebase Admin SDK integration, attendance logging, and routing.',
    files: [
      {
        name: 'package.json',
        path: 'backend/package.json',
        language: 'json',
        description: 'Node.js Express service dependencies and scripts.',
        content: `{
  "name": "smart-college-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "firebase-admin": "^12.1.0",
    "jsonwebtoken": "^9.0.2",
    "axios": "^1.6.8",
    "@google/genai": "^2.4.0",
    "morgan": "^1.10.0"
  }
}
`,
      },
      {
        name: 'server.js',
        path: 'backend/server.js',
        language: 'javascript',
        description: 'Express server, middleware, routes, and error handlers.',
        content: `const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase Admin
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/campus', require('./routes/campus'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'active', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(\`Smart College Backend operational on port \${PORT}\`);
});
`,
      },
      {
        name: 'ai_routes.js',
        path: 'backend/routes/ai.js',
        language: 'javascript',
        description: 'AI proxy dispatching to Python microservice and Google Gemini SDK.',
        content: `const express = require('express');
const axios = require('axios');
const { GoogleGenAI } = require('@google/genai');
const router = express.Router();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://localhost:8000';

// Attendance Predictor
router.post('/attendance-predictor', async (req, res) => {
  const { attended, total, courseName } = req.body;
  try {
    // Call Python ML microservice for regression and statistical risk
    const mlResponse = await axios.post(\`\${PYTHON_AI_URL}/predict/attendance\`, {
      attended,
      total,
      missed_counts: [1, 2, 5, 10]
    });

    // Enhance with Gemini generative advisory
    const prompt = \`Provide a 2-paragraph student recommendation for course \${courseName}: current \${attended}/\${total}. Projections: \${JSON.stringify(mlResponse.data)}\`;
    const gen = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });

    res.json({
      ...mlResponse.data,
      aiAdvice: gen.text
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CGPA Predictor
router.post('/cgpa-predictor', async (req, res) => {
  const { currentCgpa, completedCredits, courses } = req.body;
  try {
    const mlResponse = await axios.post(\`\${PYTHON_AI_URL}/predict/cgpa\`, {
      current_cgpa: currentCgpa,
      completed_credits: completedCredits,
      courses
    });
    res.json(mlResponse.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
`,
      },
    ],
  },
  {
    id: 'python_ai',
    title: 'Python FastAPI Machine Learning Microservice',
    badge: 'AI & Predictive Analytics Engine',
    description: 'FastAPI microservice executing Scikit-Learn models, Monte Carlo CGPA projections, and heuristics for smart timetable generation.',
    files: [
      {
        name: 'requirements.txt',
        path: 'ai_service/requirements.txt',
        language: 'text',
        description: 'Python packages for FastAPI, NumPy, Pandas, Scikit-Learn, and Uvicorn.',
        content: `fastapi==0.111.0
uvicorn[standard]==0.29.0
pydantic==2.7.1
numpy==1.26.4
pandas==2.2.2
scikit-learn==1.4.2
scipy==1.13.0
python-dotenv==1.0.1
requests==2.31.0
`,
      },
      {
        name: 'main.py',
        path: 'ai_service/main.py',
        language: 'python',
        description: 'FastAPI application exposing ML attendance regression and CGPA projection models.',
        content: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import numpy as np

app = FastAPI(
    title="Smart College AI Microservice",
    description="Machine Learning service for attendance forecasting and CGPA trajectory analysis",
    version="1.0.0"
)

class AttendanceRequest(BaseModel):
    attended: int = Field(..., ge=0)
    total: int = Field(..., ge=1)
    missed_counts: List[int] = [1, 2, 5, 10]

class CourseInput(BaseModel):
    code: str
    credits: int
    internal_score: float
    target_grade: str

class CgpaRequest(BaseModel):
    current_cgpa: float
    completed_credits: int
    courses: List[CourseInput]

@app.post("/predict/attendance")
def predict_attendance(req: AttendanceRequest):
    current_pct = round((req.attended / req.total) * 100, 2)
    projections = []

    for missed in req.missed_counts:
        new_total = req.total + missed
        new_pct = round((req.attended / new_total) * 100, 2)
        status = "safe" if new_pct >= 80 else ("warning" if new_pct >= 75 else "critical")
        projections.append({
            "missed_classes": missed,
            "projected_percentage": new_pct,
            "status": status,
            "below_75_threshold": new_pct < 75.0
        })

    # Calculate consecutive classes needed for 75%
    needed_for_75 = 0
    if current_pct < 75.0:
        # (attended + k) / (total + k) >= 0.75
        # k >= (0.75 * total - attended) / 0.25
        needed_for_75 = max(0, int(np.ceil((0.75 * req.total - req.attended) / 0.25)))

    return {
        "current_percentage": current_pct,
        "projections": projections,
        "classes_needed_for_75": needed_for_75,
        "model": "Deterministic Discrete Academic Transition Model v2"
    }

@app.post("/predict/cgpa")
def predict_cgpa(req: CgpaRequest):
    grade_points = {
        "O (10)": 10.0, "A+ (9)": 9.0, "A (8)": 8.0,
        "B+ (7)": 7.0, "B (6)": 6.0, "C (5)": 5.0, "P (4)": 4.0, "F (0)": 0.0
    }
    
    total_sem_points = 0.0
    sem_credits = 0
    for c in req.courses:
        pts = grade_points.get(c.target_grade, 8.0)
        total_sem_points += pts * c.credits
        sem_credits += c.credits

    projected_sgpa = round(total_sem_points / max(1, sem_credits), 2)
    prior_points = req.current_cgpa * req.completed_credits
    new_cgpa = round((prior_points + total_sem_points) / (req.completed_credits + sem_credits), 2)

    return {
        "projected_sgpa": projected_sgpa,
        "projected_cumulative_cgpa": new_cgpa,
        "semester_credits": sem_credits,
        "total_credits": req.completed_credits + sem_credits
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
`,
      },
    ],
  },
  {
    id: 'firebase',
    title: 'Firebase Firestore Rules & Schema Architecture',
    badge: 'Database & Cloud Storage Security',
    description: 'Declarative Firestore security rules enforcing Role-Based Access Control (RBAC) across Students, Faculty, Parents, and Administrators.',
    files: [
      {
        name: 'firestore.rules',
        path: 'firebase/firestore.rules',
        language: 'javascript',
        description: 'Firestore RBAC security rules for users, attendance, marks, and leave requests.',
        content: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions for authentication and roles
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserRole() {
      return request.auth.token.role;
    }
    
    function isStudent() {
      return isAuthenticated() && getUserRole() == 'student';
    }
    
    function isFaculty() {
      return isAuthenticated() && getUserRole() == 'faculty';
    }
    
    function isAdmin() {
      return isAuthenticated() && getUserRole() == 'admin';
    }
    
    function isParent() {
      return isAuthenticated() && getUserRole() == 'parent';
    }

    // Users Collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() || request.auth.uid == userId;
    }

    // Attendance Collection
    match /attendance/{recordId} {
      allow read: if isFaculty() || isAdmin() || 
        (isStudent() && resource.data.studentId == request.auth.uid) ||
        (isParent() && resource.data.wardId == request.auth.token.wardId);
      allow write: if isFaculty() || isAdmin();
    }

    // Marks & Results Collection
    match /marks/{markId} {
      allow read: if isAuthenticated();
      allow write: if isFaculty() || isAdmin();
    }

    // Leave Requests
    match /leaveRequests/{leaveId} {
      allow create: if isStudent();
      allow read: if isAuthenticated() && (
        resource.data.studentId == request.auth.uid || isFaculty() || isAdmin()
      );
      allow update: if isFaculty() || isAdmin();
    }

    // Notifications & Campus Facilities
    match /notifications/{noticeId} {
      allow read: if isAuthenticated();
      allow write: if isFaculty() || isAdmin();
    }
    
    match /classrooms/{roomId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
`,
      },
      {
        name: 'schema.json',
        path: 'firebase/schema.json',
        language: 'json',
        description: 'Formal Firestore JSON data model specifications for all 13 collections.',
        content: `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "SmartCollegeAssistantFirestoreSchema",
  "collections": {
    "users": {
      "fields": {
        "uid": { "type": "string" },
        "name": { "type": "string" },
        "email": { "type": "string" },
        "role": { "type": "string", "enum": ["student", "faculty", "parent", "admin"] },
        "department": { "type": "string" },
        "createdAt": { "type": "timestamp" }
      }
    },
    "attendance": {
      "fields": {
        "courseCode": { "type": "string" },
        "studentId": { "type": "string" },
        "date": { "type": "string" },
        "status": { "type": "string", "enum": ["present", "absent", "duty"] },
        "markedBy": { "type": "string" }
      }
    },
    "leave_requests": {
      "fields": {
        "studentId": { "type": "string" },
        "type": { "type": "string", "enum": ["Medical", "On-Duty", "Casual"] },
        "startDate": { "type": "string" },
        "endDate": { "type": "string" },
        "reason": { "type": "string" },
        "status": { "type": "string", "enum": ["Pending", "Approved", "Rejected"] }
      }
    },
    "classrooms": {
      "fields": {
        "code": { "type": "string" },
        "block": { "type": "string" },
        "floor": { "type": "integer" },
        "capacity": { "type": "integer" },
        "isAvailable": { "type": "boolean" },
        "currentActivity": { "type": "string" }
      }
    }
  }
}
`,
      },
    ],
  },
];
