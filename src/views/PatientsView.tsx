import React, { useState } from 'react';
import {
  UserPlus,
  Edit2,
  Trash2,
  Eye,
  FileText,
  Calendar,
  Pill,
  FlaskConical,
  Receipt,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Clock,
  Shield,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { Patient } from '../types';
import { DataTable, Column } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const PatientsView: React.FC = () => {
  const {
    patients,
    addPatient,
    updatePatient,
    deletePatient,
    appointments,
    prescriptions,
    labOrders,
    invoices,
    currentUser,
  } = useHospital();

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [profileTab, setProfileTab] = useState<'overview' | 'appointments' | 'prescriptions' | 'lab' | 'billing'>('overview');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<Patient['gender']>('Male');
  const [dob, setDob] = useState('1990-01-01');
  const [age, setAge] = useState<number>(35);
  const [bloodGroup, setBloodGroup] = useState<Patient['bloodGroup']>('O+');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [allergiesText, setAllergiesText] = useState('');
  const [medicalHistoryText, setMedicalHistoryText] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insuranceNumber, setInsuranceNumber] = useState('');
  const [status, setStatus] = useState<Patient['status']>('Outpatient');

  const openAddModal = () => {
    setFullName('');
    setGender('Male');
    setDob('1990-01-01');
    setAge(35);
    setBloodGroup('O+');
    setPhone('');
    setEmail('');
    setAddress('');
    setEmergencyName('');
    setEmergencyRel('');
    setEmergencyPhone('');
    setAllergiesText('');
    setMedicalHistoryText('');
    setInsuranceProvider('');
    setInsuranceNumber('');
    setStatus('Outpatient');
    setIsAddOpen(true);
  };

  const openEditModal = (p: Patient) => {
    setSelectedPatient(p);
    setFullName(p.fullName);
    setGender(p.gender);
    setDob(p.dob);
    setAge(p.age);
    setBloodGroup(p.bloodGroup);
    setPhone(p.phone);
    setEmail(p.email);
    setAddress(p.address);
    setEmergencyName(p.emergencyContact.name);
    setEmergencyRel(p.emergencyContact.relationship);
    setEmergencyPhone(p.emergencyContact.phone);
    setAllergiesText(p.allergies.join(', '));
    setMedicalHistoryText(p.medicalHistory.join(', '));
    setInsuranceProvider(p.insuranceProvider || '');
    setInsuranceNumber(p.insuranceNumber || '');
    setStatus(p.status);
    setIsEditOpen(true);
  };

  const openProfile = (p: Patient) => {
    setSelectedPatient(p);
    setProfileTab('overview');
    setIsProfileOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addPatient({
      fullName,
      gender,
      dob,
      age: Number(age),
      bloodGroup,
      phone,
      email,
      address,
      emergencyContact: {
        name: emergencyName || 'None listed',
        relationship: emergencyRel || 'N/A',
        phone: emergencyPhone || phone,
      },
      allergies: allergiesText ? allergiesText.split(',').map((s) => s.trim()) : [],
      medicalHistory: medicalHistoryText ? medicalHistoryText.split(',').map((s) => s.trim()) : [],
      insuranceProvider,
      insuranceNumber,
      status,
    });
    setIsAddOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    updatePatient(selectedPatient.id, {
      fullName,
      gender,
      dob,
      age: Number(age),
      bloodGroup,
      phone,
      email,
      address,
      emergencyContact: {
        name: emergencyName,
        relationship: emergencyRel,
        phone: emergencyPhone,
      },
      allergies: allergiesText ? allergiesText.split(',').map((s) => s.trim()) : [],
      medicalHistory: medicalHistoryText ? medicalHistoryText.split(',').map((s) => s.trim()) : [],
      insuranceProvider,
      insuranceNumber,
      status,
    });
    setIsEditOpen(false);
  };

  // Columns definition
  const columns: Column<Patient>[] = [
    {
      key: 'id',
      header: 'Patient ID',
      sortable: true,
      render: (p) => (
        <span className="font-bold text-blue-600 dark:text-blue-400">{p.id}</span>
      ),
    },
    {
      key: 'fullName',
      header: 'Patient Name',
      sortable: true,
      render: (p) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>{p.fullName}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
              {p.age}y / {p.gender[0]}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">{p.phone}</div>
        </div>
      ),
    },
    {
      key: 'bloodGroup',
      header: 'Blood Group',
      render: (p) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
          {p.bloodGroup}
        </span>
      ),
    },
    {
      key: 'allergies',
      header: 'Allergies',
      render: (p) => (
        <div className="max-w-[150px] truncate text-xs">
          {p.allergies.length > 0 ? (
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {p.allergies.join(', ')}
            </span>
          ) : (
            <span className="text-slate-400">None known</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (p) => (
        <Badge
          variant={
            p.status === 'Inpatient'
              ? 'danger'
              : p.status === 'Outpatient'
              ? 'primary'
              : 'neutral'
          }
          dot
        >
          {p.status}
        </Badge>
      ),
    },
    {
      key: 'registeredDate',
      header: 'Registered',
      sortable: true,
      render: (p) => <span className="text-xs text-slate-500">{p.registeredDate}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => openProfile(p)}
            title="View Full Profile"
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          {currentUser.role !== 'Patient' && (
            <>
              <button
                onClick={() => openEditModal(p)}
                title="Edit Patient"
                className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              {(currentUser.role === 'Super Admin' || currentUser.role === 'Hospital Admin') && (
                <button
                  onClick={() => {
                    setSelectedPatient(p);
                    setIsDeleteOpen(true);
                  }}
                  title="Delete Record"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  // Profile data filtering
  const patientAppointments = selectedPatient
    ? appointments.filter((a) => a.patientId === selectedPatient.id)
    : [];
  const patientPrescriptions = selectedPatient
    ? prescriptions.filter((p) => p.patientId === selectedPatient.id)
    : [];
  const patientLabOrders = selectedPatient
    ? labOrders.filter((l) => l.patientId === selectedPatient.id)
    : [];
  const patientInvoices = selectedPatient
    ? invoices.filter((i) => i.patientId === selectedPatient.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Patient Management & EMR
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Centralized Electronic Medical Records, demographic profiles, clinical history, and encounters
          </p>
        </div>

        {currentUser.role !== 'Patient' && (
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Patient</span>
          </button>
        )}
      </div>

      {/* Main Data Table */}
      <DataTable
        data={patients}
        columns={columns}
        searchPlaceholder="Search by patient name, ID, phone, or condition..."
        searchFields={['fullName', 'id', 'phone', 'email']}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Outpatient', value: 'Outpatient' },
              { label: 'Inpatient', value: 'Inpatient' },
              { label: 'Discharged', value: 'Discharged' },
            ],
          },
          {
            key: 'bloodGroup',
            label: 'Blood Group',
            options: [
              { label: 'A+', value: 'A+' },
              { label: 'A-', value: 'A-' },
              { label: 'B+', value: 'B+' },
              { label: 'B-', value: 'B-' },
              { label: 'AB+', value: 'AB+' },
              { label: 'O+', value: 'O+' },
              { label: 'O-', value: 'O-' },
            ],
          },
        ]}
        onRowClick={(p) => openProfile(p)}
      />

      {/* Add Patient Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register New Patient"
        subtitle="Create an official Electronic Health Record (EHR) profile"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Michael Thorne"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => {
                  setDob(e.target.value);
                  const yr = new Date(e.target.value).getFullYear();
                  setAge(new Date().getFullYear() - yr);
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Gender *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Patient['gender'])}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Blood Group *
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as Patient['bloodGroup'])}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Contact Phone *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@example.com"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Residential Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, City, State"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          {/* Emergency Contact */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
            <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-2">
              Emergency Contact Information
            </h5>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <input
                  type="text"
                  placeholder="Contact Name"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Relationship (e.g. Spouse)"
                  value={emergencyRel}
                  onChange={(e) => setEmergencyRel(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Emergency Phone"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Known Allergies (Comma separated)
              </label>
              <input
                type="text"
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                placeholder="Penicillin, Peanuts, Sulfa..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Past Medical History (Comma separated)
              </label>
              <input
                type="text"
                value={medicalHistoryText}
                onChange={(e) => setMedicalHistoryText(e.target.value)}
                placeholder="Hypertension, Asthma, Diabetes..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm"
            >
              Save Patient Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Patient Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Patient: ${selectedPatient?.id}`}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Admission Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Patient['status'])}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="Outpatient">Outpatient</option>
                <option value="Inpatient">Inpatient</option>
                <option value="Discharged">Discharged</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Patient['gender'])}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as Patient['bloodGroup'])}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Known Allergies
            </label>
            <input
              type="text"
              value={allergiesText}
              onChange={(e) => setAllergiesText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Medical History
            </label>
            <input
              type="text"
              value={medicalHistoryText}
              onChange={(e) => setMedicalHistoryText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Patient Detailed Profile Modal (with tabs for Appointments, Prescriptions, Lab Reports, Billing) */}
      <Modal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        title={selectedPatient ? `Patient Profile: ${selectedPatient.fullName}` : 'Patient Profile'}
        subtitle={selectedPatient ? `Record ID: ${selectedPatient.id} • Registered ${selectedPatient.registeredDate}` : ''}
        maxWidth="3xl"
      >
        {selectedPatient && (
          <div className="space-y-5">
            {/* Top Patient Summary Strip */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/60 rounded-2xl border border-blue-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center">
                  {selectedPatient.fullName[0]}
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {selectedPatient.fullName}
                  </h4>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{selectedPatient.age} years</span>
                    <span>•</span>
                    <span>{selectedPatient.gender}</span>
                    <span>•</span>
                    <span className="font-bold text-rose-600">Blood: {selectedPatient.bloodGroup}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    selectedPatient.status === 'Inpatient'
                      ? 'danger'
                      : selectedPatient.status === 'Outpatient'
                      ? 'primary'
                      : 'neutral'
                  }
                  size="lg"
                >
                  {selectedPatient.status}
                </Badge>
              </div>
            </div>

            {/* Profile Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 text-xs font-bold">
              {[
                { key: 'overview', label: 'Overview & History' },
                { key: 'appointments', label: `Appointments (${patientAppointments.length})` },
                { key: 'prescriptions', label: `Prescriptions (${patientPrescriptions.length})` },
                { key: 'lab', label: `Lab Reports (${patientLabOrders.length})` },
                { key: 'billing', label: `Billing & Invoices (${patientInvoices.length})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setProfileTab(tab.key as typeof profileTab)}
                  className={`pb-2.5 px-3 border-b-2 transition-colors ${
                    profileTab === tab.key
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Overview */}
            {profileTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    Contact & Demographics
                  </h5>
                  <div className="space-y-2 text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedPatient.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedPatient.email || 'No email provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedPatient.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-teal-500" />
                      <span>
                        Insurance: {selectedPatient.insuranceProvider || 'Self-pay'} (
                        {selectedPatient.insuranceNumber || 'N/A'})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    Emergency Contact
                  </h5>
                  <div className="text-slate-600 dark:text-slate-300">
                    <div className="font-bold text-slate-800 dark:text-white">
                      {selectedPatient.emergencyContact.name} ({selectedPatient.emergencyContact.relationship})
                    </div>
                    <div className="mt-1 text-slate-500">
                      Phone: {selectedPatient.emergencyContact.phone}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <h6 className="font-bold text-rose-600 mb-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Known Allergies
                    </h6>
                    <div className="flex flex-wrap gap-1">
                      {selectedPatient.allergies.length > 0 ? (
                        selectedPatient.allergies.map((a, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-semibold text-[10px]"
                          >
                            {a}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400">No known allergies</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <h6 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Past Medical History
                    </h6>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-600 dark:text-slate-300">
                      {selectedPatient.medicalHistory.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Appointments */}
            {profileTab === 'appointments' && (
              <div className="space-y-2">
                {patientAppointments.length > 0 ? (
                  patientAppointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {appt.doctorName} • {appt.department}
                        </span>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          {appt.appointmentDate} at {appt.appointmentTime} (Token #{appt.tokenNumber})
                        </p>
                        {appt.symptoms && (
                          <p className="text-slate-400 text-[10px] italic">Symptoms: {appt.symptoms}</p>
                        )}
                      </div>
                      <Badge variant={appt.status === 'Completed' ? 'success' : 'primary'}>
                        {appt.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-center py-6 text-slate-400">No appointment records found</p>
                )}
              </div>
            )}

            {/* Tab 3: Prescriptions */}
            {profileTab === 'prescriptions' && (
              <div className="space-y-3">
                {patientPrescriptions.length > 0 ? (
                  patientPrescriptions.map((rx) => (
                    <div
                      key={rx.id}
                      className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-blue-600">{rx.id}</span>
                        <span className="text-slate-400 text-[10px]">{rx.date}</span>
                      </div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        Doctor: {rx.doctorName}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 mt-0.5">
                        Diagnosis: {rx.diagnosis}
                      </div>
                      <div className="mt-2 space-y-1">
                        {rx.items.map((it, idx) => (
                          <div
                            key={idx}
                            className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center"
                          >
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {it.medicineName} ({it.dosage})
                            </span>
                            <span className="text-teal-600 font-medium">
                              {it.frequency} • {it.durationDays} days
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-center py-6 text-slate-400">No prescription records found</p>
                )}
              </div>
            )}

            {/* Tab 4: Lab Reports */}
            {profileTab === 'lab' && (
              <div className="space-y-2">
                {patientLabOrders.length > 0 ? (
                  patientLabOrders.map((lab) => (
                    <div
                      key={lab.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {lab.testName} ({lab.testCategory})
                        </span>
                        <Badge variant={lab.sampleStatus === 'Report Ready' ? 'success' : 'warning'}>
                          {lab.sampleStatus}
                        </Badge>
                      </div>
                      {lab.resultValue && (
                        <div className="mt-2 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Result: {lab.resultValue}
                          </span>
                          {lab.findings && (
                            <p className="text-slate-500 text-[11px] mt-0.5">{lab.findings}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-center py-6 text-slate-400">No laboratory test orders found</p>
                )}
              </div>
            )}

            {/* Tab 5: Billing */}
            {profileTab === 'billing' && (
              <div className="space-y-2">
                {patientInvoices.length > 0 ? (
                  patientInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          Invoice {inv.id} • {inv.invoiceDate}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Total: ${inv.totalAmount.toFixed(2)} • Paid: ${inv.paidAmount.toFixed(2)} • Due: ${inv.dueAmount.toFixed(2)}
                        </div>
                      </div>
                      <Badge
                        variant={
                          inv.paymentStatus === 'Paid'
                            ? 'success'
                            : inv.paymentStatus === 'Partially Paid'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {inv.paymentStatus}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-center py-6 text-slate-400">No billing history found</p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          if (selectedPatient) {
            deletePatient(selectedPatient.id);
          }
        }}
        title="Delete Patient Record"
        message={`Are you certain you want to remove ${selectedPatient?.fullName} (${selectedPatient?.id})? This action will permanently remove their clinical history from the system.`}
        confirmLabel="Delete Patient"
      />
    </div>
  );
};
