import React, { useState } from 'react';
import {
  FileHeart,
  Activity,
  Plus,
  Heart,
  Thermometer,
  Weight,
  Wind,
  Calendar,
  Pill,
  User,
  Stethoscope,
  CheckCircle2,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { OPDConsultation } from '../types';
import { DataTable, Column } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const OPDView: React.FC = () => {
  const {
    opdConsultations,
    addOPDConsultation,
    patients,
    doctors,
    appointments,
    currentUser,
  } = useHospital();

  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<OPDConsultation | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Form states
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // Vitals
  const [bp, setBp] = useState('120/80 mmHg');
  const [pulse, setPulse] = useState(72);
  const [temp, setTemp] = useState('98.6 °F');
  const [spo2, setSpo2] = useState(98);
  const [respRate, setRespRate] = useState(16);
  const [weight, setWeight] = useState(70);

  const handleRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === patientId);
    const doctor = doctors.find((d) => d.id === doctorId);
    if (!patient || !doctor) return;

    addOPDConsultation({
      patientId: patient.id,
      patientName: patient.fullName,
      doctorId: doctor.id,
      doctorName: doctor.fullName,
      consultationDate: new Date().toISOString().split('T')[0],
      symptoms: symptoms.split(',').map((s) => s.trim()),
      diagnosis,
      vitals: {
        bloodPressure: bp,
        heartRate: Number(pulse),
        temperature: temp,
        spO2: Number(spo2),
        respiratoryRate: Number(respRate),
        weightKg: Number(weight),
      },
      treatmentNotes,
      followUpDate: followUpDate || undefined,
    });
    setIsRecordOpen(false);
  };

  const openDetail = (c: OPDConsultation) => {
    setSelectedConsultation(c);
    setIsDetailOpen(true);
  };

  const columns: Column<OPDConsultation>[] = [
    {
      key: 'id',
      header: 'OPD Record #',
      sortable: true,
      render: (c) => <span className="font-bold text-blue-600 dark:text-blue-400">{c.id}</span>,
    },
    {
      key: 'patientName',
      header: 'Patient Details',
      sortable: true,
      render: (c) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-white">{c.patientName}</span>
          <div className="text-[10px] text-slate-400">ID: {c.patientId}</div>
        </div>
      ),
    },
    {
      key: 'doctorName',
      header: 'Consulting Doctor',
      sortable: true,
      render: (c) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200">{c.doctorName}</span>
      ),
    },
    {
      key: 'diagnosis',
      header: 'Primary Clinical Diagnosis',
      render: (c) => (
        <div>
          <span className="font-medium text-slate-900 dark:text-white">{c.diagnosis}</span>
          <div className="text-[10px] text-slate-400 max-w-xs truncate">
            {c.symptoms.join(', ')}
          </div>
        </div>
      ),
    },
    {
      key: 'vitals',
      header: 'Recorded Vitals',
      render: (c) => (
        <div className="text-[11px] text-slate-600 dark:text-slate-300">
          <span>BP: {c.vitals.bloodPressure || `${c.vitals.bpSystolic}/${c.vitals.bpDiastolic}`}</span> •{' '}
          <span>HR: {c.vitals.heartRate || c.vitals.pulse} bpm</span> •{' '}
          <span>SpO2: {c.vitals.spO2}%</span>
        </div>
      ),
    },
    {
      key: 'visitDate',
      header: 'Date',
      sortable: true,
      render: (c) => <span className="text-xs text-slate-500">{c.consultationDate || c.visitDate}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (c) => (
        <button
          onClick={() => openDetail(c)}
          className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg dark:bg-blue-950/60 dark:text-blue-300"
        >
          View Chart
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Outpatient Department (OPD)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ambulatory care triage, physician clinical encounter notes, digital vitals logging, and follow-ups
          </p>
        </div>

        {currentUser.role !== 'Patient' && (
          <button
            onClick={() => setIsRecordOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Record Consultation Encounter</span>
          </button>
        )}
      </div>

      {/* OPD Table */}
      <DataTable
        data={opdConsultations}
        columns={columns}
        searchPlaceholder="Search OPD records by patient, doctor, or diagnosis..."
        searchFields={['patientName', 'doctorName', 'diagnosis', 'id']}
        onRowClick={(c) => openDetail(c)}
      />

      {/* Record OPD Consultation Modal */}
      <Modal
        isOpen={isRecordOpen}
        onClose={() => setIsRecordOpen(false)}
        title="Record OPD Clinical Encounter"
        subtitle="Comprehensive medical consultation, symptoms, and physiological vital signs"
        maxWidth="2xl"
      >
        <form onSubmit={handleRecord} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Patient *
              </label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Attending Physician *
              </label>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} ({d.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Presented Symptoms (Comma separated) *
            </label>
            <input
              type="text"
              required
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Fever, Sore throat, Mild shortness of breath..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          {/* Vitals Recording Grid */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <h5 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-rose-500" />
              Patient Vital Signs
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[11px] text-slate-500 block mb-0.5">Blood Pressure</label>
                <input
                  type="text"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  placeholder="120/80 mmHg"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-0.5">Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={pulse}
                  onChange={(e) => setPulse(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-0.5">Body Temp</label>
                <input
                  type="text"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-0.5">Oxygen SpO2 (%)</label>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-0.5">Respiratory Rate</label>
                <input
                  type="number"
                  value={respRate}
                  onChange={(e) => setRespRate(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-0.5">Weight (Kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Clinical Diagnosis *
            </label>
            <input
              type="text"
              required
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Acute Pharyngitis / Hypertension Stage 1"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Treatment Plan & Clinical Notes
            </label>
            <textarea
              rows={2}
              value={treatmentNotes}
              onChange={(e) => setTreatmentNotes(e.target.value)}
              placeholder="Recommended medication regimen, dietary restrictions, lifestyle adjustments..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Follow-up Review Date (Optional)
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsRecordOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm"
            >
              Save OPD Consultation
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Chart Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedConsultation ? `OPD Encounter: ${selectedConsultation.id}` : 'OPD Record'}
        subtitle={selectedConsultation ? `Patient: ${selectedConsultation.patientName} (${selectedConsultation.consultationDate})` : ''}
        maxWidth="lg"
      >
        {selectedConsultation && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <div className="font-bold text-slate-900 dark:text-white">
                Doctor: {selectedConsultation.doctorName}
              </div>
              <div className="text-slate-500 mt-1">
                Diagnosis: <strong className="text-blue-600">{selectedConsultation.diagnosis}</strong>
              </div>
              <div className="text-slate-500 mt-0.5">
                Symptoms: {selectedConsultation.symptoms.join(', ')}
              </div>
            </div>

            {/* Vitals breakdown */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-center">
                <span className="text-[10px] text-blue-600 uppercase font-bold">Blood Pressure</span>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedConsultation.vitals.bloodPressure}
                </div>
              </div>
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-lg text-center">
                <span className="text-[10px] text-rose-600 uppercase font-bold">Heart Rate</span>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedConsultation.vitals.heartRate} bpm
                </div>
              </div>
              <div className="p-2.5 bg-teal-50 dark:bg-teal-950/40 rounded-lg text-center">
                <span className="text-[10px] text-teal-600 uppercase font-bold">SpO2 Oxygen</span>
                <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedConsultation.vitals.spO2}%
                </div>
              </div>
            </div>

            <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-xl">
              <h5 className="font-bold text-slate-900 dark:text-white mb-1">Treatment Notes</h5>
              <p className="text-slate-600 dark:text-slate-300">
                {selectedConsultation.treatmentNotes}
              </p>
            </div>

            {selectedConsultation.followUpDate && (
              <div className="text-xs text-amber-600 font-medium">
                Scheduled Follow-up Review: {selectedConsultation.followUpDate}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
