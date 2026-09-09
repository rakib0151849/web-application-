import React, { useState } from 'react';
import {
  Stethoscope,
  Plus,
  Edit2,
  Eye,
  Phone,
  Mail,
  Award,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { Doctor } from '../types';
import { DataTable, Column } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const DoctorsView: React.FC = () => {
  const { doctors, addDoctor, updateDoctor, appointments, currentUser } = useHospital();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<Doctor['gender']>('Male');
  const [specialization, setSpecialization] = useState('');
  const [department, setDepartment] = useState('Cardiology');
  const [qualification, setQualification] = useState('');
  const [experienceYears, setExperienceYears] = useState(10);
  const [consultationFee, setConsultationFee] = useState(120);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [roomNumber, setRoomNumber] = useState('Suite 101');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [status, setStatus] = useState<Doctor['status']>('Available');

  const openAdd = () => {
    setFullName('');
    setGender('Male');
    setSpecialization('');
    setDepartment('Cardiology');
    setQualification('');
    setExperienceYears(8);
    setConsultationFee(120);
    setPhone('');
    setEmail('');
    setRoomNumber('Suite 101');
    setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    setStartTime('09:00');
    setEndTime('17:00');
    setStatus('Available');
    setIsAddOpen(true);
  };

  const openEdit = (d: Doctor) => {
    setSelectedDoctor(d);
    setFullName(d.fullName);
    setGender(d.gender);
    setSpecialization(d.specialization);
    setDepartment(d.department);
    setQualification(d.qualification);
    setExperienceYears(d.experienceYears);
    setConsultationFee(d.consultationFee);
    setPhone(d.phone);
    setEmail(d.email);
    setRoomNumber(d.roomNumber);
    setSelectedDays(d.availabilitySchedule.days);
    setStartTime(d.availabilitySchedule.startTime);
    setEndTime(d.availabilitySchedule.endTime);
    setStatus(d.status);
    setIsEditOpen(true);
  };

  const openProfile = (d: Doctor) => {
    setSelectedDoctor(d);
    setIsProfileOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addDoctor({
      fullName,
      gender,
      specialization,
      department,
      qualification,
      experienceYears: Number(experienceYears),
      consultationFee: Number(consultationFee),
      phone,
      email,
      roomNumber,
      availabilitySchedule: {
        days: selectedDays,
        startTime,
        endTime,
      },
      status,
    });
    setIsAddOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    updateDoctor(selectedDoctor.id, {
      fullName,
      gender,
      specialization,
      department,
      qualification,
      experienceYears: Number(experienceYears),
      consultationFee: Number(consultationFee),
      phone,
      email,
      roomNumber,
      availabilitySchedule: {
        days: selectedDays,
        startTime,
        endTime,
      },
      status,
    });
    setIsEditOpen(false);
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const columns: Column<Doctor>[] = [
    {
      key: 'fullName',
      header: 'Doctor Name',
      sortable: true,
      render: (d) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>{d.fullName}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold">
              {d.id}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">{d.qualification}</div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      render: (d) => (
        <div>
          <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
            {d.department}
          </span>
          <p className="text-[10px] text-teal-600 dark:text-teal-400">{d.specialization}</p>
        </div>
      ),
    },
    {
      key: 'consultationFee',
      header: 'Fee',
      sortable: true,
      render: (d) => (
        <span className="font-bold text-slate-900 dark:text-white">${d.consultationFee}</span>
      ),
    },
    {
      key: 'availabilitySchedule',
      header: 'Availability',
      render: (d) => (
        <div className="text-xs">
          <div className="font-medium text-slate-700 dark:text-slate-300">
            {d.availabilitySchedule.days.join(', ')}
          </div>
          <div className="text-[10px] text-slate-400">
            {d.availabilitySchedule.startTime} - {d.availabilitySchedule.endTime} ({d.roomNumber})
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Duty Status',
      sortable: true,
      render: (d) => (
        <Badge
          variant={
            d.status === 'Available'
              ? 'success'
              : d.status === 'In Consultation'
              ? 'warning'
              : 'neutral'
          }
          dot
        >
          {d.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (d) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => openProfile(d)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
            title="View Profile & Schedule"
          >
            <Eye className="w-4 h-4" />
          </button>
          {currentUser.role !== 'Patient' && (
            <button
              onClick={() => openEdit(d)}
              className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-lg transition-colors"
              title="Edit Doctor Details"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const doctorAppointments = selectedDoctor
    ? appointments.filter((a) => a.doctorId === selectedDoctor.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Doctor & Specialist Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Physician profiles, qualifications, clinical consultation hours, fees, and appointment schedules
          </p>
        </div>

        {currentUser.role !== 'Patient' && (
          <button
            onClick={openAdd}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/20 transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Doctor</span>
          </button>
        )}
      </div>

      {/* DataTable */}
      <DataTable
        data={doctors}
        columns={columns}
        searchPlaceholder="Search by doctor name, specialization, or department..."
        searchFields={['fullName', 'specialization', 'department', 'qualification']}
        filters={[
          {
            key: 'department',
            label: 'Department',
            options: [
              { label: 'Cardiology', value: 'Cardiology' },
              { label: 'Pediatrics', value: 'Pediatrics' },
              { label: 'General Medicine', value: 'General Medicine' },
              { label: 'Orthopedics', value: 'Orthopedics' },
              { label: 'Neurology', value: 'Neurology' },
            ],
          },
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Available', value: 'Available' },
              { label: 'In Consultation', value: 'In Consultation' },
              { label: 'On Leave', value: 'On Leave' },
            ],
          },
        ]}
        onRowClick={(d) => openProfile(d)}
      />

      {/* Add Doctor Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Hospital Physician / Specialist"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Full Name (with Dr. Title) *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. Gregory House"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Department *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="Cardiology">Cardiology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Neurology">Neurology</option>
                <option value="Gastroenterology">Gastroenterology</option>
                <option value="Emergency Care">Emergency Care</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Clinical Specialization *
              </label>
              <input
                type="text"
                required
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Interventional Cardiology"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Qualification Degrees *
              </label>
              <input
                type="text"
                required
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="MD, FACC (Harvard)"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Experience (Years)
              </label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Consultation Fee ($) *
              </label>
              <input
                type="number"
                required
                value={consultationFee}
                onChange={(e) => setConsultationFee(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Clinic Room #
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="Suite 302"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
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
                placeholder="doctor@hospital.org"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          {/* Availability schedule */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
            <label className="font-bold text-slate-800 dark:text-slate-200 block mb-2">
              Weekly Consultation Days
            </label>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <button
                  type="button"
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors ${
                    selectedDays.includes(day)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 dark:text-slate-400 block mb-0.5">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-slate-500 dark:text-slate-400 block mb-0.5">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
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
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm"
            >
              Add Doctor
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Doctor Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Doctor Profile: ${selectedDoctor?.fullName}`}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Full Name
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
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Doctor['status'])}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="Available">Available</option>
                <option value="In Consultation">In Consultation</option>
                <option value="On Leave">On Leave</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Consultation Fee ($)
              </label>
              <input
                type="number"
                value={consultationFee}
                onChange={(e) => setConsultationFee(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Clinic Room
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
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
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Doctor Profile & Assigned Appointments Modal */}
      <Modal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        title={selectedDoctor ? selectedDoctor.fullName : 'Doctor Details'}
        subtitle={selectedDoctor ? `${selectedDoctor.department} • ${selectedDoctor.specialization}` : ''}
        maxWidth="2xl"
      >
        {selectedDoctor && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <div className="text-base font-extrabold text-slate-900 dark:text-white">
                  {selectedDoctor.fullName}
                </div>
                <div className="text-slate-500 mt-0.5">{selectedDoctor.qualification}</div>
                <div className="flex items-center gap-4 mt-2 text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-teal-600">
                    Fee: ${selectedDoctor.consultationFee}
                  </span>
                  <span>Room: {selectedDoctor.roomNumber}</span>
                  <span>Exp: {selectedDoctor.experienceYears} yrs</span>
                </div>
              </div>
              <Badge
                variant={
                  selectedDoctor.status === 'Available'
                    ? 'success'
                    : selectedDoctor.status === 'In Consultation'
                    ? 'warning'
                    : 'neutral'
                }
                size="lg"
              >
                {selectedDoctor.status}
              </Badge>
            </div>

            {/* Schedule Info */}
            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900">
              <h5 className="font-bold text-blue-900 dark:text-blue-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                Working Schedule & Hours
              </h5>
              <p className="text-slate-700 dark:text-slate-300">
                Days: <strong>{selectedDoctor.availabilitySchedule.days.join(', ')}</strong> • Hours:{' '}
                <strong>
                  {selectedDoctor.availabilitySchedule.startTime} -{' '}
                  {selectedDoctor.availabilitySchedule.endTime}
                </strong>
              </p>
            </div>

            {/* Assigned Appointments list */}
            <div>
              <h5 className="font-bold text-slate-900 dark:text-white mb-2">
                Upcoming Assigned Appointments ({doctorAppointments.length})
              </h5>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {doctorAppointments.length > 0 ? (
                  doctorAppointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          Token #{appt.tokenNumber} • {appt.patientName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {appt.appointmentDate} at {appt.appointmentTime} ({appt.type})
                        </div>
                      </div>
                      <Badge variant={appt.status === 'Completed' ? 'success' : 'primary'}>
                        {appt.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-4">No appointments scheduled</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
