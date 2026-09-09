import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Layers,
  HelpCircle,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  X,
  Code2,
  UserCheck,
  Building,
  Calendar,
  FileSpreadsheet,
  Award,
  ExternalLink,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { UserRole } from '../../types';

interface UniversityProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UniversityProjectModal: React.FC<UniversityProjectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    resetToDemoData,
    switchRole,
    currentUser,
    setActiveModule,
    showToast,
  } = useHospital();

  const [activeTab, setActiveTab] = useState<'info' | 'architecture' | 'viva' | 'quickdemo'>('info');

  // University details (persisted in localStorage for easy presentation editing)
  const [studentName, setStudentName] = useState(() => {
    return localStorage.getItem('uni_student_name') || 'Md. Computer Science Student';
  });
  const [studentId, setStudentId] = useState(() => {
    return localStorage.getItem('uni_student_id') || 'CSE-2022-8841';
  });
  const [universityName, setUniversityName] = useState(() => {
    return localStorage.getItem('uni_institution') || 'Department of Computer Science & Engineering, University';
  });
  const [courseCode, setCourseCode] = useState(() => {
    return localStorage.getItem('uni_course') || 'CSE-4201: Web Systems & Software Development';
  });
  const [supervisorName, setSupervisorName] = useState(() => {
    return localStorage.getItem('uni_supervisor') || 'Prof. Dr. Senior Faculty Advisor';
  });
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveStudentInfo = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('uni_student_name', studentName);
    localStorage.setItem('uni_student_id', studentId);
    localStorage.setItem('uni_institution', universityName);
    localStorage.setItem('uni_course', courseCode);
    localStorage.setItem('uni_supervisor', supervisorName);
    setIsSaved(true);
    showToast('Project Info Updated', 'University submission details saved successfully.', 'success');
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                  University Project Presentation & Viva Guide
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white uppercase tracking-wider">
                  Academic Demo
                </span>
              </div>
              <p className="text-xs text-blue-100 opacity-90">
                Hospital Management System (HMS) • HTML, CSS, TypeScript & React
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs shrink-0">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap ${
              activeTab === 'info'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Student & Submission Info</span>
          </button>

          <button
            onClick={() => setActiveTab('quickdemo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap ${
              activeTab === 'quickdemo'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>1-Click Viva Demo Tour</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>System Architecture & ERD</span>
          </button>

          <button
            onClick={() => setActiveTab('viva')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap ${
              activeTab === 'viva'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Professor Viva Q&A Sheet</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Student & Submission Info */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3.5">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    Ready for University Coursework, Final Year Defense & Lab Presentation
                  </p>
                  <p className="mt-1">
                    You can edit the student name, ID, university, and course details below. They are saved in your browser and will appear throughout the presentation report cards.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveStudentInfo} className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-teal-600" />
                  Edit Project Submission Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Student / Presenter Name
                    </label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      placeholder="e.g., John Doe"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Student ID / Roll Number
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      placeholder="e.g., CSE-2022-014"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      University / Institution Name
                    </label>
                    <input
                      type="text"
                      value={universityName}
                      onChange={(e) => setUniversityName(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      placeholder="e.g., Dept of Computer Science & Engineering"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Course Title & Code
                    </label>
                    <input
                      type="text"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      placeholder="e.g., CSE 4101: Web Engineering"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Faculty Supervisor / Evaluator
                    </label>
                    <input
                      type="text"
                      value={supervisorName}
                      onChange={(e) => setSupervisorName(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      placeholder="e.g., Prof. Dr. Academic Supervisor"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500">
                    {isSaved ? '✓ Saved successfully!' : 'Changes will persist during your browser session.'}
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs shadow-blue-500/20 transition-colors"
                  >
                    Save Details
                  </button>
                </div>
              </form>

              {/* Printable Project Cover Card */}
              <div className="p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center space-y-3">
                <div className="inline-block px-3 py-1 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold text-xs rounded-full border border-teal-200 dark:border-teal-800">
                  Project Title
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  MediPulse — Modern Hospital Management & Clinical Information System
                </h2>
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 max-w-md mx-auto">
                  <p><strong>Submitted by:</strong> {studentName} ({studentId})</p>
                  <p><strong>Course:</strong> {courseCode}</p>
                  <p><strong>Institution:</strong> {universityName}</p>
                  <p><strong>Supervised by:</strong> {supervisorName}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Quick Demo Tour */}
          {activeTab === 'quickdemo' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                <div className="text-xs text-emerald-900 dark:text-emerald-200">
                  <strong className="block text-sm font-bold">Pristine University Demo Reset</strong>
                  <span>Reset all patient queues, bed assignments, and lab orders to clean seed data.</span>
                </div>
                <button
                  onClick={resetToDemoData}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Demo Data</span>
                </button>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                  Quick Role Switcher for Presentation
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Click any role to immediately test role-based access control (RBAC) live in front of the evaluator:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {(
                    [
                      { role: 'Super Admin' as UserRole, desc: 'Full hospital system control' },
                      { role: 'Doctor' as UserRole, desc: 'OPD, vitals, Rx prescription writer' },
                      { role: 'Nurse' as UserRole, desc: 'Bed assignments & IPD vitals' },
                      { role: 'Pharmacist' as UserRole, desc: 'Drug inventory & POS dispensary' },
                      { role: 'Lab Technician' as UserRole, desc: 'Sample collection & test results' },
                      { role: 'Accountant' as UserRole, desc: 'Invoicing, taxes & payments' },
                      { role: 'Receptionist' as UserRole, desc: 'Patient registration & bookings' },
                      { role: 'Patient' as UserRole, desc: 'Portal for history & appointments' },
                      { role: 'Hospital Admin' as UserRole, desc: 'Staff scheduling & analytics' },
                    ]
                  ).map((item) => {
                    const isCurrent = currentUser.role === item.role;
                    return (
                      <button
                        key={item.role}
                        onClick={() => {
                          switchRole(item.role);
                          showToast(`Role Switched`, `Now viewing as ${item.role}`, 'info');
                          onClose();
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isCurrent
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>{item.role}</span>
                          {isCurrent && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <div className={`text-[10px] mt-1 ${isCurrent ? 'text-blue-100' : 'text-slate-400'}`}>
                          {item.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                  3-Minute Viva Demonstration Script
                </h4>
                <div className="space-y-2 text-xs">
                  {[
                    {
                      step: '1',
                      title: 'Role-Based Access Control (RBAC)',
                      action: 'Show sidebar changing when switching between Super Admin, Doctor, and Patient.',
                      link: 'dashboard',
                    },
                    {
                      step: '2',
                      title: 'Outpatient (OPD) & Vital Signs',
                      action: 'Open OPD module to record BP, Pulse, Temperature, and SpO2 for a patient.',
                      link: 'opd',
                    },
                    {
                      step: '3',
                      title: 'Digital Prescription (Rx)',
                      action: 'Show drug scheduling with dosage, food timing, and open the official printable Rx.',
                      link: 'prescriptions',
                    },
                    {
                      step: '4',
                      title: 'Inpatient (IPD) & Bed Matrix',
                      action: 'Show interactive floorplan (ICU, Deluxe, General) and assign/transfer bed.',
                      link: 'beds',
                    },
                    {
                      step: '5',
                      title: 'Pharmacy POS & Stock Deductions',
                      action: 'Point of Sale dispensing reduces stock quantity and flags low-stock warnings.',
                      link: 'pharmacy',
                    },
                    {
                      step: '6',
                      title: 'Diagnostic Lab Test Reporting',
                      action: 'Show sample lifecycle: Pending Collection -> Processing -> Ready report.',
                      link: 'laboratory',
                    },
                    {
                      step: '7',
                      title: 'Consolidated Billing & Tax Invoicing',
                      action: 'Itemized hospital bills with tax, discount, partial payment and print layout.',
                      link: 'billing',
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="flex items-start justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-extrabold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          {item.step}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">{item.title}: </span>
                          <span className="text-slate-600 dark:text-slate-300">{item.action}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setActiveModule(item.link as Parameters<typeof setActiveModule>[0]);
                          onClose();
                        }}
                        className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0 ml-2"
                      >
                        Go to View →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Architecture & ERD */}
          {activeTab === 'architecture' && (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
                    <Code2 className="w-4 h-4 text-blue-600" />
                    Frontend & Styling Technologies
                  </h4>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                    <li>• <strong>HTML5:</strong> Semantic tags (`&lt;header&gt;`, `&lt;aside&gt;`, `&lt;main&gt;`, `&lt;table&gt;`)</li>
                    <li>• <strong>CSS3 & Tailwind CSS:</strong> Responsive utility architecture, flexbox & grid system, dark mode</li>
                    <li>• <strong>TypeScript & React 18:</strong> Strongly typed state engine, custom hooks, component modularity</li>
                    <li>• <strong>Lucide React:</strong> Standard clinical and operational iconography</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
                    <Layers className="w-4 h-4 text-teal-600" />
                    State & Storage Architecture
                  </h4>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                    <li>• <strong>HospitalContext:</strong> Centralized single-source-of-truth state container</li>
                    <li>• <strong>Client Persistence:</strong> Synchronized browser LocalStorage caching</li>
                    <li>• <strong>RBAC Middleware:</strong> Dynamic permission matrix gating accessible routes and mutations</li>
                    <li>• <strong>Data Relational Links:</strong> PatientID links Appointments, Prescriptions, Beds, Lab Orders & Bills</li>
                  </ul>
                </div>
              </div>

              {/* Database Schema / ERD Entities */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Database Relational Model (Entities & Foreign Keys)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-[11px]">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700">
                    <strong className="text-blue-600 dark:text-blue-400 block mb-1">Users & Patients</strong>
                    <p className="text-slate-500">PK: `id`, `name`, `email`, `role`, `bloodGroup`, `medicalHistory`, `allergies`, `emergencyContact`</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700">
                    <strong className="text-blue-600 dark:text-blue-400 block mb-1">Appointments & OPD</strong>
                    <p className="text-slate-500">PK: `id`, FK: `patientId`, FK: `doctorId`, `tokenNumber`, `vitalSigns (BP, HR, SpO2)`, `diagnosis`</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700">
                    <strong className="text-blue-600 dark:text-blue-400 block mb-1">IPD & Bed Allocation</strong>
                    <p className="text-slate-500">PK: `admissionId`, FK: `bedId`, FK: `patientId`, `wardType`, `admissionDate`, `dischargeSummary`</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700">
                    <strong className="text-blue-600 dark:text-blue-400 block mb-1">Prescription (Rx)</strong>
                    <p className="text-slate-500">PK: `id`, FK: `patientId`, FK: `doctorId`, `items[] (drug, dosage, frequency, timing)`</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700">
                    <strong className="text-blue-600 dark:text-blue-400 block mb-1">Pharmacy & Inventory</strong>
                    <p className="text-slate-500">PK: `medicineId`, `stockQuantity`, `minThreshold`, `batchNo`, `expiryDate`, `sellingPrice`</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700">
                    <strong className="text-blue-600 dark:text-blue-400 block mb-1">Billing & Invoices</strong>
                    <p className="text-slate-500">PK: `id`, FK: `patientId`, `items[]`, `subtotal`, `taxAmount`, `paidAmount`, `dueAmount`, `status`</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Professor Viva Q&A */}
          {activeTab === 'viva' && (
            <div className="space-y-3 text-xs">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Key questions professors commonly ask during software engineering and web development defenses:
              </p>

              {[
                {
                  q: '1. What is the core problem this system solves?',
                  a: 'Hospital operations face severe delays and data silos when managing patients, bed availability, pharmacy stock, and diagnostics manually. This HMS unifies outpatient (OPD), inpatient (IPD), pharmacy dispensary, diagnostics, and consolidated billing into a single real-time dashboard.',
                },
                {
                  q: '2. How is Role-Based Access Control (RBAC) enforced?',
                  a: 'Each user is assigned one of 9 distinct roles (Super Admin, Hospital Admin, Doctor, Nurse, Receptionist, Pharmacist, Lab Technician, Accountant, Patient). Access is checked at the UI routing level via permissions matrix (`getAllowedModules`) and write operations are guarded in the state layer.',
                },
                {
                  q: '3. How does the bed management and transfer system prevent double booking?',
                  a: 'Each bed entity maintains state (Available, Occupied, Reserved, Maintenance). When admitting or transferring an inpatient, the previous bed is updated to Maintenance/Available while the new bed is marked Occupied with atomic state updates.',
                },
                {
                  q: '4. How is pharmacy dispensing synchronized with medicine inventory?',
                  a: 'When an item is billed at the pharmacy point-of-sale, the system verifies available `stockQuantity >= requestedQuantity`. Upon sale confirmation, the inventory record is immediately decremented, and low-stock warnings trigger automatically if stock falls below `minThreshold`.',
                },
                {
                  q: '5. How does billing consolidate charges from multiple hospital departments?',
                  a: 'Invoices allow adding multi-category items (Consultation, Room Charges, Medicine, Laboratory, Nursing, Procedures). It computes subtotal, applies dynamic tax rate (default 5%), deducts discounts, and tracks payment history across Cash, Card, Insurance, and UPI.',
                },
                {
                  q: '6. What prevents unauthorized data loss?',
                  a: 'All transactions update an in-memory state engine and are mirrored to client-side structured storage with error boundaries, complete with a 1-click university demo data restorer.',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5"
                >
                  <h5 className="font-bold text-slate-900 dark:text-white">{item.q}</h5>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
            <span>University Project Mode</span> • <span>Version 1.0 (Academic Edition)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
