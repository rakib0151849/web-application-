import React from 'react';
import {
  Users,
  Stethoscope,
  CalendarCheck,
  Hotel,
  DollarSign,
  Clock,
  Pill,
  FlaskConical,
  TrendingUp,
  Activity,
  UserPlus,
  CalendarPlus,
  BedDouble,
  FileCheck,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';

interface DashboardViewProps {
  onNavigate?: (module: string) => void;
  onOpenQuickAction?: (action: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenQuickAction,
}) => {
  const {
    currentUser,
    patients,
    doctors,
    appointments,
    beds,
    invoices,
    pharmacySales,
    labOrders,
    prescriptions,
    updateAppointment,
    setActiveModule,
  } = useHospital();

  const handleNavigate = (module: string) => {
    if (typeof onNavigate === 'function') {
      onNavigate(module);
    } else {
      setActiveModule(module as any);
    }
  };

  const handleQuickAction = (action: string) => {
    if (typeof onOpenQuickAction === 'function') {
      onOpenQuickAction(action);
    } else {
      if (action === 'new-patient') setActiveModule('patients');
      else if (action === 'book-appointment') setActiveModule('appointments');
      else if (action === 'new-consultation') setActiveModule('opd');
      else if (action === 'create-bill') setActiveModule('billing');
      else setActiveModule('dashboard');
    }
  };

  // Metrics calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.appointmentDate === todayStr);
  const availableBeds = beds.filter((b) => b.status === 'Available').length;
  const totalBeds = beds.length;

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const pendingPayments = invoices.reduce((sum, inv) => sum + inv.dueAmount, 0);
  const totalPharmacySales = pharmacySales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalLabTests = labOrders.length;

  // Bed Ward distribution
  const occupiedBeds = beds.filter((b) => b.status === 'Occupied').length;
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

  // If patient role, render patient-centric dashboard
  if (currentUser.role === 'Patient') {
    const myPatient = patients.find((p) => p.id === currentUser.patientId) || patients[0];
    const myAppointments = appointments.filter((a) => a.patientId === myPatient.id);
    const myPrescriptions = prescriptions.filter((p) => p.patientId === myPatient.id);
    const myLabOrders = labOrders.filter((l) => l.patientId === myPatient.id);
    const myInvoices = invoices.filter((i) => i.patientId === myPatient.id);

    return (
      <div className="space-y-6">
        {/* Patient Welcome Hero */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-600/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold">
                Patient Medical Portal
              </span>
              <span className="text-white/80 text-xs">ID: {myPatient.id}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {myPatient.fullName}
            </h2>
            <p className="text-white/90 text-sm mt-1 max-w-xl">
              Access your electronic medical records, upcoming consultations, lab results, and prescriptions directly.
            </p>
          </div>
          <button
            onClick={() => handleQuickAction('book-appointment')}
            className="px-5 py-2.5 bg-white text-blue-700 font-bold text-sm rounded-xl shadow-lg hover:bg-blue-50 transition-colors shrink-0 flex items-center gap-2"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>

        {/* Patient Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Blood Group"
            value={myPatient.bloodGroup}
            subtitle={`Age: ${myPatient.age} yrs • ${myPatient.gender}`}
            icon={Activity}
            color="rose"
          />
          <StatCard
            title="Appointments"
            value={myAppointments.length}
            subtitle={`${myAppointments.filter((a) => a.status === 'Scheduled').length} upcoming`}
            icon={CalendarCheck}
            color="teal"
          />
          <StatCard
            title="Active Prescriptions"
            value={myPrescriptions.length}
            subtitle="Verified by Physician"
            icon={Pill}
            color="blue"
          />
          <StatCard
            title="Pending Due"
            value={`$${myInvoices.reduce((acc, i) => acc + i.dueAmount, 0).toFixed(2)}`}
            subtitle="Hospital billing balance"
            icon={DollarSign}
            color="amber"
          />
        </div>

        {/* Patient Activity Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Consultations */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-blue-600" />
                My Consultations
              </h3>
              <button
                onClick={() => handleNavigate('appointments')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                View all
              </button>
            </div>
            <div className="space-y-3">
              {myAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-white">
                      {appt.doctorName} • {appt.department}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {appt.appointmentDate} at {appt.appointmentTime} (Token #{appt.tokenNumber})
                    </div>
                  </div>
                  <Badge
                    variant={
                      appt.status === 'Scheduled'
                        ? 'primary'
                        : appt.status === 'Completed'
                        ? 'success'
                        : 'neutral'
                    }
                  >
                    {appt.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Prescriptions & Diagnostics */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-600" />
                Prescribed Medications
              </h3>
              <button
                onClick={() => handleNavigate('prescriptions')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                Full Rx
              </button>
            </div>
            <div className="space-y-3">
              {myPrescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {rx.doctorName}
                    </span>
                    <span className="text-[10px] text-slate-400">{rx.date}</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Diagnosis: {rx.diagnosis}
                  </div>
                  <div className="mt-2 text-[11px] text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-1 rounded-md">
                    {rx.items.map((it) => `${it.medicineName} (${it.dosage} - ${it.frequency})`).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard Admin & Staff Dashboard
  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome with Quick Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
              {currentUser.role} Control Panel
            </span>
            <span className="text-slate-400 text-xs">• Live System Status</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            MediPulse Operations Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time analytics, inpatient bed status, appointment triage, pharmacy, and financial collections.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleQuickAction('new-patient')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Patient</span>
          </button>
          <button
            onClick={() => handleQuickAction('book-appointment')}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>Book Appointment</span>
          </button>
          <button
            onClick={() => handleNavigate('beds')}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <BedDouble className="w-3.5 h-3.5" />
            <span>Bed Ward Matrix</span>
          </button>
        </div>
      </div>

      {/* 8 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients"
          value={patients.length}
          subtitle="Registered electronic profiles"
          icon={Users}
          color="blue"
          trend={{ value: '+14%', isPositive: true, label: 'this month' }}
          onClick={() => handleNavigate('patients')}
        />
        <StatCard
          title="Active Doctors"
          value={doctors.length}
          subtitle="Consulting across 5 depts"
          icon={Stethoscope}
          color="teal"
          onClick={() => handleNavigate('doctors')}
        />
        <StatCard
          title="Today's Appointments"
          value={todayAppointments.length}
          subtitle={`${todayAppointments.filter((a) => a.status === 'Completed').length} completed`}
          icon={CalendarCheck}
          color="indigo"
          trend={{ value: '+8%', isPositive: true, label: 'vs yesterday' }}
          onClick={() => handleNavigate('appointments')}
        />
        <StatCard
          title="Available Beds"
          value={`${availableBeds} / ${totalBeds}`}
          subtitle={`${occupancyRate}% occupancy rate`}
          icon={Hotel}
          color={availableBeds < 3 ? 'rose' : 'emerald'}
          onClick={() => handleNavigate('beds')}
        />

        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle="Collected payments"
          icon={DollarSign}
          color="emerald"
          trend={{ value: '+18.4%', isPositive: true, label: 'vs last month' }}
          onClick={() => handleNavigate('billing')}
        />
        <StatCard
          title="Pending Payments"
          value={`$${pendingPayments.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle="Outstanding patient balances"
          icon={Clock}
          color="amber"
          onClick={() => handleNavigate('billing')}
        />
        <StatCard
          title="Pharmacy Sales"
          value={`$${totalPharmacySales.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle={`${pharmacySales.length} dispensary invoices`}
          icon={Pill}
          color="teal"
          onClick={() => handleNavigate('pharmacy')}
        />
        <StatCard
          title="Laboratory Tests"
          value={totalLabTests}
          subtitle="Diagnostic work orders"
          icon={FlaskConical}
          color="blue"
          onClick={() => handleNavigate('laboratory')}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart (2 Columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Hospital Revenue Analytics (2025)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monthly breakdown of Consultation, Inpatient, Laboratory, and Pharmacy collections
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> Revenue
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" /> Target
              </span>
            </div>
          </div>

          {/* SVG Revenue Graph */}
          <div className="mt-6">
            <svg viewBox="0 0 600 200" className="w-full h-52 overflow-visible">
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[40, 80, 120, 160].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="600"
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  className="dark:stroke-slate-800"
                />
              ))}

              {/* Shaded Area */}
              <polygon
                points="0,170 50,150 100,135 150,140 200,110 250,95 300,105 350,80 400,65 450,55 500,45 550,30 600,20 600,180 0,180"
                fill="url(#revenueGradient)"
              />

              {/* Target Line (Dashed) */}
              <path
                d="M 0,160 Q 300,90 600,35"
                fill="none"
                stroke="#14b8a6"
                strokeWidth="2"
                strokeDasharray="5 5"
              />

              {/* Revenue Line */}
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,170 50,150 100,135 150,140 200,110 250,95 300,105 350,80 400,65 450,55 500,45 550,30 600,20"
              />

              {/* Data points */}
              {[
                { x: 0, y: 170, val: '$18k' },
                { x: 100, y: 135, val: '$24k' },
                { x: 200, y: 110, val: '$32k' },
                { x: 300, y: 105, val: '$36k' },
                { x: 400, y: 65, val: '$48k' },
                { x: 500, y: 45, val: '$56k' },
                { x: 600, y: 20, val: '$68k' },
              ].map((pt, idx) => (
                <g key={idx} className="group cursor-pointer">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill="#ffffff"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 10}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-slate-700 dark:fill-slate-200"
                  >
                    {pt.val}
                  </text>
                </g>
              ))}
            </svg>

            {/* X-axis months */}
            <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-2 px-1">
              <span>Nov</span>
              <span>Dec</span>
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr (Curr)</span>
            </div>
          </div>
        </div>

        {/* Patient Statistics & Ward Occupancy (1 Column) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Hotel className="w-4 h-4 text-teal-600" />
              Ward Occupancy Status
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Real-time bed utilization across specialized hospital units
            </p>

            <div className="space-y-3.5">
              {[
                { ward: 'ICU / Critical Care', total: 4, occupied: 3, color: 'bg-rose-500' },
                { ward: 'Emergency Care Bay', total: 4, occupied: 1, color: 'bg-amber-500' },
                { ward: 'General Medical Ward', total: 5, occupied: 2, color: 'bg-blue-600' },
                { ward: 'Maternity Unit', total: 2, occupied: 1, color: 'bg-teal-500' },
                { ward: 'Pediatric Care', total: 2, occupied: 0, color: 'bg-indigo-500' },
                { ward: 'Deluxe Private Suites', total: 2, occupied: 1, color: 'bg-purple-500' },
              ].map((w) => {
                const percent = Math.round((w.occupied / w.total) * 100);
                return (
                  <div key={w.ward}>
                    <div className="flex justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      <span>{w.ward}</span>
                      <span className="text-slate-500">
                        {w.occupied}/{w.total} beds ({percent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${w.color}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400">Total Bed Capacity</span>
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                {totalBeds} Beds ({availableBeds} Vacant)
              </div>
            </div>
            <button
              onClick={() => handleNavigate('beds')}
              className="p-2 bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 rounded-xl hover:bg-teal-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Appointments & Doctor Availability Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Appointments (2 Columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-blue-600" />
                Today's Patient Consultations & Tokens
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scheduled doctor visits and current consultation status
              </p>
            </div>
            <button
              onClick={() => handleNavigate('appointments')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              All Appointments →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="py-2.5 px-3">Token</th>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Doctor & Dept</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {appointments.slice(0, 5).map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-blue-600 dark:text-blue-400">
                      #{appt.tokenNumber}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {appt.patientName}
                      </div>
                      <div className="text-[10px] text-slate-400">{appt.type}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {appt.doctorName}
                      </div>
                      <div className="text-[10px] text-teal-600 dark:text-teal-400">
                        {appt.department}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {appt.appointmentTime}
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          appt.status === 'In Progress'
                            ? 'warning'
                            : appt.status === 'Completed'
                            ? 'success'
                            : appt.status === 'Cancelled'
                            ? 'danger'
                            : 'primary'
                        }
                      >
                        {appt.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {appt.status === 'Scheduled' && (
                        <button
                          onClick={() => updateAppointment(appt.id, { status: 'In Progress' })}
                          className="px-2 py-1 text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg dark:bg-blue-950/60 dark:text-blue-300"
                        >
                          Start Call
                        </button>
                      )}
                      {appt.status === 'In Progress' && (
                        <button
                          onClick={() => updateAppointment(appt.id, { status: 'Completed' })}
                          className="px-2 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg dark:bg-emerald-950/60 dark:text-emerald-300"
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Doctor On-Duty Roster (1 Column) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              On-Duty Specialists
            </h3>
            <button
              onClick={() => handleNavigate('doctors')}
              className="text-xs font-bold text-teal-600 hover:underline"
            >
              All →
            </button>
          </div>

          <div className="space-y-3.5">
            {doctors.slice(0, 4).map((doc) => (
              <div
                key={doc.id}
                className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {doc.fullName}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {doc.department} • {doc.roomNumber}
                  </p>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                    Fee: ${doc.consultationFee} • {doc.availabilitySchedule.startTime} - {doc.availabilitySchedule.endTime}
                  </span>
                </div>
                <Badge
                  variant={
                    doc.status === 'Available'
                      ? 'success'
                      : doc.status === 'In Consultation'
                      ? 'warning'
                      : 'neutral'
                  }
                  size="sm"
                >
                  {doc.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
