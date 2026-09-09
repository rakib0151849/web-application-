import React, { useState } from 'react';
import {
  Hotel,
  BedDouble,
  UserPlus,
  LogOut,
  Calendar,
  FileCheck,
  Stethoscope,
  HeartPulse,
  Eye,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { IPDAdmission } from '../types';
import { DataTable, Column } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const IPDView: React.FC = () => {
  const {
    ipdAdmissions,
    admitPatientIPD,
    dischargePatientIPD,
    patients,
    doctors,
    beds,
    currentUser,
  } = useHospital();

  const [isAdmitOpen, setIsAdmitOpen] = useState(false);
  const [isDischargeOpen, setIsDischargeOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<IPDAdmission | null>(null);

  // Admit Form States
  const availableBeds = beds.filter((b) => b.status === 'Available');
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
  const [bedId, setBedId] = useState(availableBeds[0]?.id || '');
  const [admissionReason, setAdmissionReason] = useState('');
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState('');

  // Discharge Form States
  const [dischargeSummary, setDischargeSummary] = useState('');
  const [dischargeAdvice, setDischargeAdvice] = useState('');
  const [conditionAtDischarge, setConditionAtDischarge] = useState<IPDAdmission['conditionAtDischarge']>('Cured');

  const handleAdmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === patientId);
    const doctor = doctors.find((d) => d.id === doctorId);
    const bed = beds.find((b) => b.id === bedId);

    if (!patient || !doctor || !bed) return;

    admitPatientIPD({
      patientId: patient.id,
      patientName: patient.fullName,
      doctorId: doctor.id,
      doctorName: doctor.fullName,
      bedId: bed.id,
      bedNumber: bed.bedNumber,
      ward: bed.ward,
      admissionDate: new Date().toISOString().split('T')[0],
      admissionReason,
      provisionalDiagnosis,
      status: 'Admitted',
    });

    setIsAdmitOpen(false);
  };

  const handleDischarge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmission) return;

    dischargePatientIPD(selectedAdmission.id, {
      dischargeDate: new Date().toISOString().split('T')[0],
      dischargeSummary,
      dischargeAdvice,
      conditionAtDischarge,
    });

    setIsDischargeOpen(false);
  };

  const openDischargeModal = (adm: IPDAdmission) => {
    setSelectedAdmission(adm);
    setDischargeSummary('');
    setDischargeAdvice('Take prescribed medicines, avoid heavy exertion, return if fever persists.');
    setConditionAtDischarge('Improved');
    setIsDischargeOpen(true);
  };

  const openDetail = (adm: IPDAdmission) => {
    setSelectedAdmission(adm);
    setIsDetailOpen(true);
  };

  const columns: Column<IPDAdmission>[] = [
    {
      key: 'id',
      header: 'Admission ID',
      sortable: true,
      render: (adm) => <span className="font-bold text-blue-600 dark:text-blue-400">{adm.id}</span>,
    },
    {
      key: 'patientName',
      header: 'Patient Details',
      sortable: true,
      render: (adm) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-white">{adm.patientName}</span>
          <div className="text-[10px] text-slate-400">ID: {adm.patientId}</div>
        </div>
      ),
    },
    {
      key: 'ward',
      header: 'Ward & Bed',
      render: (adm) => (
        <div>
          <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
            Bed #{adm.bedNumber}
          </span>
          <div className="text-[10px] text-teal-600 dark:text-teal-400">{adm.ward}</div>
        </div>
      ),
    },
    {
      key: 'doctorName',
      header: 'Attending Physician',
      sortable: true,
      render: (adm) => (
        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
          {adm.doctorName}
        </span>
      ),
    },
    {
      key: 'admissionDate',
      header: 'Admission Date',
      sortable: true,
      render: (adm) => <span className="text-xs text-slate-500">{adm.admissionDate}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (adm) => (
        <Badge variant={adm.status === 'Admitted' ? 'danger' : 'success'} dot>
          {adm.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (adm) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => openDetail(adm)}
            title="View Chart"
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg"
          >
            <Eye className="w-4 h-4" />
          </button>
          {adm.status === 'Admitted' && currentUser.role !== 'Patient' && (
            <button
              onClick={() => openDischargeModal(adm)}
              title="Discharge Patient"
              className="px-2.5 py-1 text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg dark:bg-rose-950/60 dark:text-rose-300 flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Discharge</span>
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
            Inpatient Department (IPD) Admissions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Hospital admissions, ward occupancy, round-the-clock attending physician assignments, and clinical discharge summaries
          </p>
        </div>

        {currentUser.role !== 'Patient' && (
          <button
            onClick={() => {
              if (availableBeds.length === 0) {
                alert('No vacant beds available at the moment. Please free a bed first.');
                return;
              }
              setBedId(availableBeds[0].id);
              setIsAdmitOpen(true);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Admit Patient to Ward</span>
          </button>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        data={ipdAdmissions}
        columns={columns}
        searchPlaceholder="Search IPD admissions by patient, ward, or doctor..."
        searchFields={['patientName', 'doctorName', 'ward', 'bedNumber', 'provisionalDiagnosis']}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Admitted', value: 'Admitted' },
              { label: 'Discharged', value: 'Discharged' },
            ],
          },
          {
            key: 'ward',
            label: 'Ward',
            options: [
              { label: 'ICU', value: 'ICU' },
              { label: 'General Ward', value: 'General Ward' },
              { label: 'Emergency', value: 'Emergency' },
              { label: 'Maternity', value: 'Maternity' },
              { label: 'Pediatric', value: 'Pediatric' },
              { label: 'Deluxe Suite', value: 'Deluxe Suite' },
            ],
          },
        ]}
        onRowClick={(adm) => openDetail(adm)}
      />

      {/* Admit Patient Modal */}
      <Modal
        isOpen={isAdmitOpen}
        onClose={() => setIsAdmitOpen(false)}
        title="Admit Patient to Inpatient Care"
        subtitle="Assigns available bed and changes patient status to Inpatient"
        maxWidth="xl"
      >
        <form onSubmit={handleAdmit} className="space-y-4 text-xs">
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
                  {p.fullName} ({p.id}) - Current: {p.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Select Available Bed *
            </label>
            <select
              value={bedId}
              onChange={(e) => setBedId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              {availableBeds.map((b) => (
                <option key={b.id} value={b.id}>
                  Bed #{b.bedNumber} - {b.ward} ({b.roomNumber}) - ${b.dailyCharge}/day
                </option>
              ))}
            </select>
            <p className="text-[11px] text-teal-600 mt-1">
              {availableBeds.length} vacant beds currently ready for occupancy
            </p>
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

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Reason for Admission *
            </label>
            <input
              type="text"
              required
              value={admissionReason}
              onChange={(e) => setAdmissionReason(e.target.value)}
              placeholder="e.g. Acute chest pain, Severe dehydration, Post-op recovery..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Provisional Clinical Diagnosis *
            </label>
            <input
              type="text"
              required
              value={provisionalDiagnosis}
              onChange={(e) => setProvisionalDiagnosis(e.target.value)}
              placeholder="e.g. Unstable Angina / Acute Appendicitis"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAdmitOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm"
            >
              Confirm Admission
            </button>
          </div>
        </form>
      </Modal>

      {/* Discharge Patient Modal */}
      <Modal
        isOpen={isDischargeOpen}
        onClose={() => setIsDischargeOpen(false)}
        title="Discharge Inpatient"
        subtitle={selectedAdmission ? `Discharging ${selectedAdmission.patientName} from Bed #${selectedAdmission.bedNumber} (${selectedAdmission.ward})` : ''}
        maxWidth="lg"
      >
        <form onSubmit={handleDischarge} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Clinical Condition at Discharge *
            </label>
            <select
              value={conditionAtDischarge}
              onChange={(e) => setConditionAtDischarge(e.target.value as IPDAdmission['conditionAtDischarge'])}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              <option value="Cured">Cured / Resolved</option>
              <option value="Improved">Clinically Improved & Stable</option>
              <option value="Stable">Stable</option>
              <option value="Referred">Referred to Higher Specialty Center</option>
              <option value="Against Medical Advice">Against Medical Advice (DAMA)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Discharge Summary & Treatment Given *
            </label>
            <textarea
              rows={3}
              required
              value={dischargeSummary}
              onChange={(e) => setDischargeSummary(e.target.value)}
              placeholder="Summary of inpatient stay, procedures conducted, investigations reviewed, and final clinical outcome..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Discharge Advice & Home Care Instructions
            </label>
            <textarea
              rows={2}
              value={dischargeAdvice}
              onChange={(e) => setDischargeAdvice(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl text-teal-800 dark:text-teal-300 text-[11px]">
            ✓ Discharging will automatically mark Bed #{selectedAdmission?.bedNumber} as Available for
            new admissions.
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsDischargeOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm"
            >
              Authorize Discharge
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Inpatient Chart Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedAdmission ? `IPD Case File: ${selectedAdmission.id}` : 'Inpatient Record'}
        maxWidth="lg"
      >
        {selectedAdmission && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedAdmission.patientName}
                </h4>
                <div className="text-slate-500 mt-0.5">
                  Ward: <strong>{selectedAdmission.ward}</strong> (Bed #{selectedAdmission.bedNumber})
                </div>
                <div className="text-teal-600 font-semibold mt-1">
                  Attending Doctor: {selectedAdmission.doctorName}
                </div>
              </div>
              <Badge variant={selectedAdmission.status === 'Admitted' ? 'danger' : 'success'} size="lg">
                {selectedAdmission.status}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  Admission Reason & Diagnosis
                </span>
                <p className="text-slate-600 dark:text-slate-300">
                  {selectedAdmission.admissionReason} — <em>{selectedAdmission.provisionalDiagnosis}</em>
                </p>
                <div className="text-[11px] text-slate-400 mt-1">
                  Admitted On: {selectedAdmission.admissionDate}
                </div>
              </div>

              {selectedAdmission.dischargeDate && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-0.5">
                    Discharge Details ({selectedAdmission.dischargeDate})
                  </span>
                  <p className="text-emerald-800 dark:text-emerald-200">
                    Condition: <strong>{selectedAdmission.conditionAtDischarge}</strong>
                  </p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Summary: {selectedAdmission.dischargeSummary}
                  </p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Advice: {selectedAdmission.dischargeAdvice}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
