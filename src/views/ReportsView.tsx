import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  Users,
  Hotel,
  Pill,
  FlaskConical,
  DollarSign,
  FileSpreadsheet,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { StatCard } from '../components/common/StatCard';

export const ReportsView: React.FC = () => {
  const {
    patients,
    doctors,
    appointments,
    beds,
    invoices,
    pharmacySales,
    labOrders,
    showToast,
  } = useHospital();

  const [reportType, setReportType] = useState<'financial' | 'clinical' | 'pharmacy' | 'laboratory'>('financial');
  const [dateRange, setDateRange] = useState('Last 30 Days');

  const totalRevenue = invoices.reduce((s, i) => s + i.paidAmount, 0);
  const totalBilled = invoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalDue = invoices.reduce((s, i) => s + i.dueAmount, 0);
  const totalPharmacy = pharmacySales.reduce((s, p) => s + p.totalAmount, 0);

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      `MediPulse Hospital Report - ${reportType.toUpperCase()}\n` +
      `Generated Date,${new Date().toLocaleDateString()}\n\n` +
      `Metric,Value\n` +
      `Total Registered Patients,${patients.length}\n` +
      `Total Consultations Scheduled,${appointments.length}\n` +
      `Total Revenue Collected,$${totalRevenue}\n` +
      `Total Pharmacy Dispensary Revenue,$${totalPharmacy}\n` +
      `Total Laboratory Investigations,${labOrders.length}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `medipulse_report_${reportType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export Success', `Exported ${reportType} report as CSV`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Hospital Analytics & Operational Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit-ready reporting, clinical throughput, department workload, and executive summaries
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="Today">Today's Data</option>
            <option value="This Week">This Week</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="This Quarter">This Quarter</option>
            <option value="Year to Date">Year to Date (YTD)</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Categories Tab */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 text-xs font-bold">
        {[
          { key: 'financial', label: 'Financial & Revenue Ledger' },
          { key: 'clinical', label: 'Clinical Triage & Patient Census' },
          { key: 'pharmacy', label: 'Pharmacy & Drug Sales' },
          { key: 'laboratory', label: 'Laboratory Diagnostics' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setReportType(tab.key as typeof reportType)}
            className={`pb-3 border-b-2 transition-colors ${
              reportType === tab.key
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Financial Report Tab */}
      {reportType === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Billed"
              value={`$${totalBilled.toFixed(2)}`}
              subtitle="Hospital invoiced value"
              icon={DollarSign}
              color="blue"
            />
            <StatCard
              title="Collections"
              value={`$${totalRevenue.toFixed(2)}`}
              subtitle="Reconciled receipts"
              icon={TrendingUp}
              color="emerald"
            />
            <StatCard
              title="Receivables (Due)"
              value={`$${totalDue.toFixed(2)}`}
              subtitle="Uncollected balances"
              icon={TrendingUp}
              color="rose"
            />
            <StatCard
              title="Dispensary Sales"
              value={`$${totalPharmacy.toFixed(2)}`}
              subtitle="Direct pharmacy receipts"
              icon={Pill}
              color="teal"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Revenue by Service Department
            </h3>
            <div className="space-y-3">
              {[
                { dept: 'Inpatient Ward & ICU Accommodations', amount: 18450, percent: 42 },
                { dept: 'Physician Consultations (OPD)', amount: 11200, percent: 26 },
                { dept: 'Pharmacy Dispensary Sales', amount: 8400, percent: 19 },
                { dept: 'Diagnostic Laboratories & Radiology', amount: 5600, percent: 13 },
              ].map((item) => (
                <div key={item.dept}>
                  <div className="flex justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    <span>{item.dept}</span>
                    <span>
                      ${item.amount.toLocaleString()} ({item.percent}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Clinical Report Tab */}
      {reportType === 'clinical' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Patients Registered"
              value={patients.length}
              subtitle="Active EHR records"
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Appointments Handled"
              value={appointments.length}
              subtitle="Completed outpatient visits"
              icon={Calendar}
              color="teal"
            />
            <StatCard
              title="Bed Occupancy"
              value={`${beds.filter((b) => b.status === 'Occupied').length} / ${beds.length}`}
              subtitle="Current active inpatients"
              icon={Hotel}
              color="indigo"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Patient Census by Blood Group
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center">
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => {
                const count = patients.filter((p) => p.bloodGroup === bg).length;
                return (
                  <div key={bg} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                    <span className="font-extrabold text-sm text-rose-600 block">{bg}</span>
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-bold mt-1 block">
                      {count}
                    </span>
                    <span className="text-[10px] text-slate-400">patients</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Pharmacy Report Tab */}
      {reportType === 'pharmacy' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Pharmaceutical Inventory Health
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              High turnaround medications, minimum threshold fulfillment, and retail margin analysis
            </p>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {pharmacySales.map((s) => (
                <div key={s.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Invoice #{s.id} • {s.patientName}
                    </span>
                    <div className="text-[11px] text-slate-400">
                      Items: {s.items.map((i) => i.medicineName).join(', ')}
                    </div>
                  </div>
                  <span className="font-bold text-emerald-600">${s.totalAmount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Laboratory Report Tab */}
      {reportType === 'laboratory' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Diagnostic Work Orders Summary
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {labOrders.map((l) => (
                <div key={l.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {l.testName} ({l.testCategory})
                    </span>
                    <div className="text-[11px] text-slate-400">
                      Patient: {l.patientName} • Doctor: {l.doctorName}
                    </div>
                  </div>
                  <span
                    className={`font-bold ${
                      l.isAbnormal ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {l.resultValue || l.sampleStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
