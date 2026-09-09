import React, { useState } from 'react';
import {
  Building2,
  Shield,
  Sliders,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Percent,
  Users,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { UserRole } from '../types';

export const SettingsView: React.FC = () => {
  const { showToast, currentUser } = useHospital();

  const [hospitalName, setHospitalName] = useState('MediPulse Multi-Specialty Hospital & Research Center');
  const [tagline, setTagline] = useState('Excellence in Healthcare & Clinical Precision');
  const [email, setEmail] = useState('administration@medipulse.org');
  const [phone, setPhone] = useState('+1 (800) 555-0199');
  const [emergencyPhone, setEmergencyPhone] = useState('911 / +1 (800) 555-0911');
  const [address, setAddress] = useState('742 Healthcare Boulevard, Metro Medical Center, NY 10001');
  const [registrationNo, setRegistrationNo] = useState('HOSP-REG-NY-88942');
  const [currency, setCurrency] = useState('USD ($)');
  const [taxRate, setTaxRate] = useState(5.0);
  const [enableAuditLogs, setEnableAuditLogs] = useState(true);
  const [enableSmsNotifications, setEnableSmsNotifications] = useState(true);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Settings Saved', 'Hospital operational profile updated successfully.', 'success');
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Security Updated', 'Access security policies updated.', 'success');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Hospital System Settings & Configuration
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Organization identity, billing parameters, compliance registries, and access policies
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Organization Profile */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Hospital Identity & Contact Details
            </h3>

            <form onSubmit={handleSaveGeneral} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Hospital Entity Name *
                </label>
                <input
                  type="text"
                  required
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Hospital Motto / Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Administrative Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Helpdesk Telephone *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Emergency Triage Hotline
                  </label>
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-rose-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Licensing & Clinical Accreditation #
                  </label>
                  <input
                    type="text"
                    value={registrationNo}
                    onChange={(e) => setRegistrationNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Physical Hospital Address
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Accounting Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                    <option value="CAD ($)">CAD ($)</option>
                    <option value="AUD ($)">AUD ($)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Standard Healthcare GST / Tax (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Role & System Policies */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-600" />
              Role Access & Security Policy
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Audit Logging</div>
                  <div className="text-[10px] text-slate-400">Track all record modifications</div>
                </div>
                <input
                  type="checkbox"
                  checked={enableAuditLogs}
                  onChange={(e) => setEnableAuditLogs(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">SMS / Email Alerts</div>
                  <div className="text-[10px] text-slate-400">Automated token & lab notifications</div>
                </div>
                <input
                  type="checkbox"
                  checked={enableSmsNotifications}
                  onChange={(e) => setEnableSmsNotifications(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-900 dark:text-blue-200">
                <span className="font-bold block mb-1">Current Active Session:</span>
                <p className="text-[11px]">
                  Logged in as <strong className="font-black">{currentUser.name}</strong> ({currentUser.role}).
                  Access permissions dynamically enforced by RBAC engine.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Hospital Clinical Departments
            </h3>
            <div className="space-y-1.5 text-xs">
              {[
                { name: 'Cardiology', doctors: 3, floor: 'Floor 3' },
                { name: 'Neurology', doctors: 2, floor: 'Floor 4' },
                { name: 'Orthopedics', doctors: 3, floor: 'Floor 2' },
                { name: 'Pediatrics', doctors: 2, floor: 'Floor 1' },
                { name: 'Gynecology & Obstetrics', doctors: 2, floor: 'Floor 2' },
                { name: 'General Medicine', doctors: 4, floor: 'Ground Floor' },
                { name: 'Emergency & Trauma', doctors: 5, floor: 'Ground Floor' },
              ].map((d) => (
                <div
                  key={d.name}
                  className="flex justify-between items-center py-1.5 px-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-slate-700 dark:text-slate-300"
                >
                  <span className="font-semibold">{d.name}</span>
                  <span className="text-[10px] text-slate-400">{d.floor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
