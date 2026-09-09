import React, { useState } from 'react';
import {
  CalendarPlus,
  Clock,
  User,
  Stethoscope,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { Appointment, AppointmentStatus } from '../types';
import { DataTable, Column } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const AppointmentsView: React.FC = () => {
  const {
    appointments,
    bookAppointment,
    updateAppointment,
    cancelAppointment,
    doctors,
    patients,
    currentUser,
  } = useHospital();

  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Booking Form State
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
  const [appointmentDate, setAppointmentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [appointmentTime, setAppointmentTime] = useState('10:00 AM');
  const [appointmentType, setAppointmentType] = useState<Appointment['type']>('General Checkup');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');

  // Reschedule state
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('10:00 AM');

  const selectedDoctor = doctors.find((d) => d.id === doctorId) || doctors[0];

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === patientId);
    const doctor = doctors.find((d) => d.id === doctorId);
    if (!patient || !doctor) return;

    bookAppointment({
      patientId: patient.id,
      patientName: patient.fullName,
      doctorId: doctor.id,
      doctorName: doctor.fullName,
      department: doctor.department,
      appointmentDate,
      appointmentTime,
      type: appointmentType,
      status: 'Scheduled',
      symptoms,
      notes,
      consultationFee: doctor.consultationFee,
    });
    setIsBookOpen(false);
  };

  const handleReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment || !newDate) return;
    updateAppointment(selectedAppointment.id, {
      appointmentDate: newDate,
      appointmentTime: newTime,
      status: 'Scheduled',
    });
    setIsRescheduleOpen(false);
  };

  const openReschedule = (appt: Appointment) => {
    setSelectedAppointment(appt);
    setNewDate(appt.appointmentDate);
    setNewTime(appt.appointmentTime);
    setIsRescheduleOpen(true);
  };

  const columns: Column<Appointment>[] = [
    {
      key: 'tokenNumber',
      header: 'Token #',
      sortable: true,
      render: (a) => (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-extrabold text-xs">
          #{a.tokenNumber}
        </span>
      ),
    },
    {
      key: 'patientName',
      header: 'Patient Details',
      sortable: true,
      render: (a) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-white">{a.patientName}</span>
          <div className="text-[11px] text-slate-400">ID: {a.patientId}</div>
        </div>
      ),
    },
    {
      key: 'doctorName',
      header: 'Assigned Physician',
      sortable: true,
      render: (a) => (
        <div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{a.doctorName}</span>
          <div className="text-[10px] text-teal-600 dark:text-teal-400">{a.department}</div>
        </div>
      ),
    },
    {
      key: 'appointmentDate',
      header: 'Date & Time',
      sortable: true,
      render: (a) => (
        <div className="text-xs">
          <div className="font-medium text-slate-900 dark:text-white">{a.appointmentDate}</div>
          <div className="text-[11px] text-slate-400">{a.appointmentTime}</div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Consultation Type',
      render: (a) => (
        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
          {a.type}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (a) => (
        <Badge
          variant={
            a.status === 'Completed'
              ? 'success'
              : a.status === 'In Progress'
              ? 'warning'
              : a.status === 'Cancelled'
              ? 'danger'
              : 'primary'
          }
          dot
        >
          {a.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (a) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {a.status === 'Scheduled' && (
            <>
              <button
                onClick={() => updateAppointment(a.id, { status: 'In Progress' })}
                title="Mark In-Progress"
                className="px-2 py-1 text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg dark:bg-blue-950/60 dark:text-blue-300"
              >
                In-Progress
              </button>
              <button
                onClick={() => openReschedule(a)}
                title="Reschedule"
                className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setSelectedAppointment(a);
                  setIsCancelOpen(true);
                }}
                title="Cancel"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {a.status === 'In Progress' && (
            <button
              onClick={() => updateAppointment(a.id, { status: 'Completed' })}
              className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 text-white rounded-lg shadow-xs hover:bg-emerald-700"
            >
              Complete
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Appointment Scheduling & Tokens
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time outpatient consultation booking, daily token sequence, doctor availability, and status tracking
          </p>
        </div>

        <button
          onClick={() => setIsBookOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* DataTable */}
      <DataTable
        data={appointments}
        columns={columns}
        searchPlaceholder="Search by patient name, doctor, or token..."
        searchFields={['patientName', 'doctorName', 'department', 'type']}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Scheduled', value: 'Scheduled' },
              { label: 'In Progress', value: 'In Progress' },
              { label: 'Completed', value: 'Completed' },
              { label: 'Cancelled', value: 'Cancelled' },
            ],
          },
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
        ]}
      />

      {/* Book Appointment Modal */}
      <Modal
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
        title="Schedule Patient Appointment"
        subtitle="Generates token number and reserves physician consultation slot"
        maxWidth="xl"
      >
        <form onSubmit={handleBook} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Select Patient *
            </label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.id}) - {p.phone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Select Physician / Specialist *
            </label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fullName} ({d.department} • Fee: ${d.consultationFee})
                </option>
              ))}
            </select>
            {selectedDoctor && (
              <p className="text-[11px] text-teal-600 mt-1">
                Available: {selectedDoctor.availabilitySchedule.days.join(', ')} (
                {selectedDoctor.availabilitySchedule.startTime} - {selectedDoctor.availabilitySchedule.endTime})
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Appointment Date *
              </label>
              <input
                type="date"
                required
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Time Slot *
              </label>
              <select
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="09:00 AM">09:00 AM</option>
                <option value="09:30 AM">09:30 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="10:30 AM">10:30 AM</option>
                <option value="11:15 AM">11:15 AM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:00 PM">03:00 PM</option>
                <option value="04:30 PM">04:30 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Visit Type
            </label>
            <select
              value={appointmentType}
              onChange={(e) => setAppointmentType(e.target.value as Appointment['type'])}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              <option value="General Checkup">General Checkup</option>
              <option value="Specialist Consultation">Specialist Consultation</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Primary Symptoms & Concerns
            </label>
            <textarea
              rows={2}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Recurrent headaches, chest discomfort, fever for 3 days..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsBookOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm"
            >
              Confirm & Assign Token
            </button>
          </div>
        </form>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        title="Reschedule Appointment"
        subtitle={selectedAppointment ? `Token #${selectedAppointment.tokenNumber} for ${selectedAppointment.patientName}` : ''}
        maxWidth="md"
      >
        <form onSubmit={handleReschedule} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              New Date *
            </label>
            <input
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              New Time Slot *
            </label>
            <select
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              <option value="09:00 AM">09:00 AM</option>
              <option value="09:30 AM">09:30 AM</option>
              <option value="10:00 AM">10:00 AM</option>
              <option value="11:00 AM">11:00 AM</option>
              <option value="02:00 PM">02:00 PM</option>
              <option value="03:30 PM">03:30 PM</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsRescheduleOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
            >
              Save New Schedule
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Confirmation */}
      <ConfirmDialog
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onConfirm={() => {
          if (selectedAppointment) {
            cancelAppointment(selectedAppointment.id);
          }
        }}
        title="Cancel Appointment"
        message={`Are you sure you want to cancel the appointment for ${selectedAppointment?.patientName} with ${selectedAppointment?.doctorName}?`}
        confirmLabel="Yes, Cancel Appointment"
      />
    </div>
  );
};
