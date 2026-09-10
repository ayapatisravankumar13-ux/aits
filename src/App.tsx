/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { UserRole } from './types/index.ts';
import { mockUsers } from './data/mockData.ts';
import { StudentView } from './components/student/StudentView.tsx';
import { FacultyView } from './components/faculty/FacultyView.tsx';
import { ParentView } from './components/parent/ParentView.tsx';
import { AdminView } from './components/admin/AdminView.tsx';
import { ArchitectureDeliverablesModal } from './components/deliverables/ArchitectureDeliverablesModal.tsx';
import {
  GraduationCap,
  Users,
  UserCheck,
  ShieldAlert,
  Code2,
  Smartphone,
  Monitor,
  Wifi,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [deviceMode, setDeviceMode] = useState<'responsive' | 'mobile'>('responsive');
  const [showDeliverablesModal, setShowDeliverablesModal] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const currentUser = mockUsers[currentRole];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white">
                  Smart College Assistant
                </h1>
                <span className="hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
                  v2.4 Production
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden xs:block">
                AI-Powered Digital Campus Companion
              </p>
            </div>
          </div>

          {/* Center / Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Toggle: Responsive vs Mobile Frame */}
            <div className="hidden md:flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setDeviceMode('responsive')}
                title="Full Screen Responsive View"
                className={`p-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  deviceMode === 'responsive'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Desktop</span>
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                title="Mobile Flutter Simulation View"
                className={`p-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  deviceMode === 'mobile'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Mobile (390px)</span>
              </button>
            </div>

            {/* Flutter Code & Architecture Deliverables Button */}
            <button
              onClick={() => setShowDeliverablesModal(true)}
              className="py-1.5 px-2.5 sm:px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Flutter & Backend Code</span>
              <span className="sm:hidden">Code</span>
            </button>

            {/* Role Switcher Selector */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-xs transition-all"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-lg object-cover ring-1 ring-blue-500"
                />
                <div className="text-left hidden sm:block">
                  <span className="text-[11px] font-bold text-slate-200 block leading-tight capitalize">
                    {currentRole}
                  </span>
                  <span className="text-[9px] text-slate-400 block truncate max-w-[90px]">
                    {currentUser.name}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Role Dropdown Menu */}
              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-fadeIn">
                  <div className="px-2 py-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Switch Active User Role
                  </div>

                  {[
                    { role: 'student', label: 'Student', desc: 'Aarav Sharma (B.Tech CSE)', icon: GraduationCap },
                    { role: 'faculty', label: 'Faculty', desc: 'Dr. Rajesh Menon (HOD)', icon: UserCheck },
                    { role: 'parent', label: 'Parent', desc: 'Sanjay Sharma (Parent of Aarav)', icon: Users },
                    { role: 'admin', label: 'Administrator', desc: 'Dr. Meenakshi Sundaram (Dean)', icon: ShieldAlert },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = currentRole === item.role;
                    return (
                      <button
                        key={item.role}
                        onClick={() => {
                          setCurrentRole(item.role as UserRole);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full p-2 rounded-xl flex items-center gap-2.5 text-left transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-white/20' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <span className="block font-semibold">{item.label}</span>
                          <span className={`text-[10px] block truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                            {item.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-4 sm:py-6 px-3 sm:px-6 max-w-7xl w-full mx-auto flex flex-col items-center">
        {deviceMode === 'mobile' ? (
          /* Mobile Frame Simulation */
          <div className="w-full max-w-[420px] bg-slate-900 border-4 border-slate-700 rounded-[40px] shadow-2xl p-4 overflow-hidden flex flex-col min-h-[780px] relative ring-8 ring-slate-900/50">
            {/* Mobile Top Notch & Speaker */}
            <div className="w-36 h-4 bg-slate-950 rounded-full mx-auto mb-3 flex items-center justify-center gap-2">
              <div className="w-10 h-1 bg-slate-800 rounded-full"></div>
              <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
            </div>

            {/* Active view inside mobile phone */}
            <div className="flex-1 overflow-y-auto pr-0.5">
              {currentRole === 'student' && <StudentView />}
              {currentRole === 'faculty' && <FacultyView />}
              {currentRole === 'parent' && <ParentView />}
              {currentRole === 'admin' && <AdminView />}
            </div>
          </div>
        ) : (
          /* Full Screen Responsive Layout */
          <div className="w-full">
            {currentRole === 'student' && <StudentView />}
            {currentRole === 'faculty' && <FacultyView />}
            {currentRole === 'parent' && <ParentView />}
            {currentRole === 'admin' && <AdminView />}
          </div>
        )}
      </main>

      {/* Footer info bar */}
      <footer className="border-t border-slate-800 bg-slate-950/80 py-3 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Cloud Sync Active • Firebase Firestore & Cloud Messaging</span>
          </div>
          <div className="text-slate-400">
            Smart College Assistant • Powered by Flutter, Node.js, Python FastAPI & Gemini AI
          </div>
        </div>
      </footer>

      {/* Project Deliverables Code Modal */}
      <ArchitectureDeliverablesModal
        isOpen={showDeliverablesModal}
        onClose={() => setShowDeliverablesModal(false)}
      />
    </div>
  );
}
