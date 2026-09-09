import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Menu,
  Shield,
  LogOut,
  UserCheck,
  ChevronDown,
  Activity,
  PlusCircle,
  Stethoscope,
  CalendarPlus,
  Receipt,
  Search,
  GraduationCap,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { UserRole } from '../../types';
import { UniversityProjectModal } from '../common/UniversityProjectModal';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenQuickAction?: (action: string) => void;
  onLogout?: () => void;
}

const ALL_ROLES: { role: UserRole; label: string; desc: string }[] = [
  { role: 'Super Admin', label: 'Super Admin', desc: 'Full System Access & Configuration' },
  { role: 'Hospital Admin', label: 'Hospital Admin', desc: 'Hospital Operations & Staff Oversight' },
  { role: 'Doctor', label: 'Doctor', desc: 'Clinical Care, Consultations & Rx' },
  { role: 'Nurse', label: 'Nurse', desc: 'Inpatient Care, Vitals & Bed Tracking' },
  { role: 'Receptionist', label: 'Receptionist', desc: 'Front Desk, Admissions & Booking' },
  { role: 'Pharmacist', label: 'Pharmacist', desc: 'Medicine Stock & Dispensary' },
  { role: 'Lab Technician', label: 'Lab Technician', desc: 'Diagnostics, Tests & Lab Reports' },
  { role: 'Accountant', label: 'Accountant', desc: 'Billing, Invoices & Collections' },
  { role: 'Patient', label: 'Patient', desc: 'Personal Health Portal & History' },
];

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenQuickAction,
  onLogout,
}) => {
  const {
    currentUser,
    switchRole,
    isDarkMode,
    toggleDarkMode,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    setActiveModule,
    globalSearch,
    setGlobalSearch,
  } = useHospital();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const roleRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) {
        setIsQuickActionOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Left Side: Mobile Menu Button & Brand */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation sidebar"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setActiveModule('dashboard')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  MediPulse
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.2 bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 rounded-md border border-teal-200 dark:border-teal-800">
                  HMS
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5 hidden sm:block">
                Hospital Management System
              </p>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden md:flex items-center max-w-md w-full mx-6">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search patients, doctors, appointments, drugs..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200 placeholder-slate-400 transition-all"
            />
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* University Project / Viva Presentation Button */}
          <button
            type="button"
            onClick={() => setIsProjectModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-300 dark:bg-blue-950/70 dark:hover:bg-blue-900/60 rounded-xl border border-blue-200 dark:border-blue-800 shadow-xs transition-all"
            title="University Project Details, Viva Questions & Demo Script"
          >
            <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="hidden sm:inline">Project Info & Viva</span>
            <span className="sm:hidden">Project</span>
          </button>

          {/* Quick Action Button (for staff) */}
          {currentUser.role !== 'Patient' && (
            <div className="relative" ref={quickRef}>
              <button
                type="button"
                onClick={() => setIsQuickActionOpen((prev) => !prev)}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs shadow-teal-600/20 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Quick Action</span>
                <ChevronDown className="w-3 h-3 opacity-75" />
              </button>

              {isQuickActionOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-40 animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => {
                      setIsQuickActionOpen(false);
                      if (onOpenQuickAction) onOpenQuickAction('new-patient');
                      else setActiveModule('patients');
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                  >
                    <UserCheck className="w-4 h-4 text-blue-500" />
                    <span>Register New Patient</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsQuickActionOpen(false);
                      if (onOpenQuickAction) onOpenQuickAction('book-appointment');
                      else setActiveModule('appointments');
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                  >
                    <CalendarPlus className="w-4 h-4 text-teal-500" />
                    <span>Book Appointment</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsQuickActionOpen(false);
                      if (onOpenQuickAction) onOpenQuickAction('new-consultation');
                      else setActiveModule('opd');
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                  >
                    <Stethoscope className="w-4 h-4 text-indigo-500" />
                    <span>Record OPD Consultation</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsQuickActionOpen(false);
                      if (onOpenQuickAction) onOpenQuickAction('create-bill');
                      else setActiveModule('billing');
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                  >
                    <Receipt className="w-4 h-4 text-emerald-500" />
                    <span>Generate Bill / Invoice</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Interactive Role Switcher Pill */}
          <div className="relative" ref={roleRef}>
            <button
              type="button"
              onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
              title="Click to test different Role permissions"
            >
              <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden lg:inline text-slate-500 dark:text-slate-400">Role:</span>
              <span>{currentUser.role}</span>
              <ChevronDown className="w-3 h-3 text-blue-600" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-40 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-white">
                    Role-Based Access Tester
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Switch to test view and feature permissions
                  </p>
                </div>
                <div className="max-h-72 overflow-y-auto space-y-1">
                  {ALL_ROLES.map((item) => (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => {
                        switchRole(item.role);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                        currentUser.role === item.role
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 mt-1 rounded-full shrink-0 ${
                          currentUser.role === item.role ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      />
                      <div>
                        <div className="font-semibold">{item.label}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {item.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label="Toggle color scheme"
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotifOpen((prev) => !prev)}
              aria-label="View system notifications"
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-40 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Hospital Alerts
                    </h4>
                    {unreadCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-semibold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={clearAllNotifications}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.linkModule) {
                            setActiveModule(n.linkModule as Parameters<typeof setActiveModule>[0]);
                            setIsNotifOpen(false);
                          }
                        }}
                        className={`p-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                          !n.read
                            ? 'bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                          <span>{n.title}</span>
                          <span className="text-[10px] font-normal text-slate-400">
                            {n.timestamp}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-1 line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-center py-6 text-slate-400">
                      No notifications to display
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Menu */}
          <div className="relative" ref={userRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                alt={currentUser.name}
                className="w-8 h-8 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
              />
              <div className="hidden xl:block text-left">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {currentUser.department || currentUser.role}
                </div>
              </div>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-40 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-3 pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      {currentUser.name}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{currentUser.email}</p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-full">
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setActiveModule('settings');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-left"
                  >
                    <span>Hospital Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout?.();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* University Project Presentation & Viva Guide Modal */}
      <UniversityProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
    </header>
  );
};
