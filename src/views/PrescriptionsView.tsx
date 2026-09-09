import React, { useState } from 'react';
import {
  Pill,
  Plus,
  Printer,
  Trash2,
  FileText,
  HeartPulse,
  Calendar,
  User,
  Stethoscope,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { Prescription, PrescriptionItem } from '../types';
import { DataTable, Column } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';

export const PrescriptionsView: React.FC = () => {
  const {
    prescriptions,
    addPrescription,
    patients,
    doctors,
    medicines,
    currentUser,
  } = useHospital();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);

  // Form states
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
  const [diagnosis, setDiagnosis] = useState('');
  const [items, setItems] = useState<PrescriptionItem[]>([
    {
      medicineId: medicines[0]?.id || 'MED-001',
      medicineName: medicines[0]?.name || 'Amoxicillin 500mg',
      dosage: '500mg',
      frequency: 'TDS (1-1-1)',
      durationDays: 5,
      timing: 'After Food',
      instructions: 'Complete full course even if feeling better',
    },
  ]);

  const handleAddItemRow = () => {
    const med = medicines[0];
    setItems([
      ...items,
      {
        medicineId: med?.id || 'MED-001',
        medicineName: med?.name || 'Paracetamol 650mg',
        dosage: '1 Tab',
        frequency: 'BD (1-0-1)',
        durationDays: 5,
        timing: 'After Food',
        instructions: 'Take with plenty of water',
      },
    ]);
  };

  const handleRemoveItemRow = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: keyof PrescriptionItem, val: any) => {
    const updated = [...items];
    if (field === 'medicineName') {
      const foundMed = medicines.find((m) => m.name === val);
      if (foundMed) {
        updated[idx].medicineId = foundMed.id;
        updated[idx].medicineName = foundMed.name;
      } else {
        updated[idx].medicineName = val;
      }
    } else {
      (updated[idx] as any)[field] = val;
    }
    setItems(updated);
  };

  const handleSaveRx = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === patientId);
    const doctor = doctors.find((d) => d.id === doctorId);
    if (!patient || !doctor || items.length === 0) return;

    addPrescription({
      patientId: patient.id,
      patientName: patient.fullName,
      doctorId: doctor.id,
      doctorName: doctor.fullName,
      date: new Date().toISOString().split('T')[0],
      diagnosis,
      items,
    });

    setIsAddOpen(false);
  };

  const openPrint = (rx: Prescription) => {
    setSelectedRx(rx);
    setIsPrintOpen(true);
  };

  const columns: Column<Prescription>[] = [
    {
      key: 'id',
      header: 'Rx Number',
      sortable: true,
      render: (rx) => <span className="font-bold text-blue-600 dark:text-blue-400">{rx.id}</span>,
    },
    {
      key: 'patientName',
      header: 'Patient Details',
      sortable: true,
      render: (rx) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-white">{rx.patientName}</span>
          <div className="text-[10px] text-slate-400">ID: {rx.patientId}</div>
        </div>
      ),
    },
    {
      key: 'doctorName',
      header: 'Prescribing Physician',
      sortable: true,
      render: (rx) => (
        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
          {rx.doctorName}
        </span>
      ),
    },
    {
      key: 'diagnosis',
      header: 'Clinical Diagnosis',
      render: (rx) => (
        <span className="font-medium text-xs text-slate-900 dark:text-white">{rx.diagnosis}</span>
      ),
    },
    {
      key: 'items',
      header: 'Medications Prescribed',
      render: (rx) => (
        <div className="text-xs text-teal-700 dark:text-teal-400 max-w-xs truncate font-medium">
          {rx.items.map((i) => i.medicineName).join(', ')} ({rx.items.length} items)
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (rx) => <span className="text-xs text-slate-500">{rx.date}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (rx) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => openPrint(rx)}
            title="Print Official Rx Document"
            className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg dark:bg-blue-950/60 dark:text-blue-300 flex items-center gap-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Rx</span>
          </button>
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
            Prescription Management & Digital Rx
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Electronic physician prescription orders, multi-drug dosage regimens, timing, and printable medical slips
          </p>
        </div>

        {currentUser.role !== 'Patient' && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Prescription</span>
          </button>
        )}
      </div>

      {/* DataTable */}
      <DataTable
        data={prescriptions}
        columns={columns}
        searchPlaceholder="Search prescriptions by patient, doctor, or diagnosis..."
        searchFields={['patientName', 'doctorName', 'diagnosis', 'id']}
        onRowClick={(rx) => openPrint(rx)}
      />

      {/* Create Prescription Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Write Electronic Prescription"
        subtitle="Specify patient diagnosis and multi-item therapeutic medication schedule"
        maxWidth="3xl"
      >
        <form onSubmit={handleSaveRx} className="space-y-4 text-xs">
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
                    {p.fullName} ({p.id}) - Blood: {p.bloodGroup}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Prescribing Doctor *
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
              Diagnosis / Clinical Indication *
            </label>
            <input
              type="text"
              required
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Acute Bacterial Sinusitis / Post-operative pain management"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          {/* Medicines Multi-Item Table */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-3 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-blue-600" />
                Medication Regimen ({items.length} drugs)
              </h5>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-semibold flex items-center gap-1 hover:bg-blue-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Drug</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Medicine</label>
                      <select
                        value={item.medicineName}
                        onChange={(e) => handleItemChange(idx, 'medicineName', e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      >
                        {medicines.map((m) => (
                          <option key={m.id} value={m.name}>
                            {m.name} (Stock: {m.stockQuantity})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Dosage</label>
                      <input
                        type="text"
                        value={item.dosage}
                        onChange={(e) => handleItemChange(idx, 'dosage', e.target.value)}
                        placeholder="e.g. 500mg / 1 Tablet"
                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Frequency</label>
                      <select
                        value={item.frequency}
                        onChange={(e) => handleItemChange(idx, 'frequency', e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      >
                        <option value="OD (1-0-0)">Once daily (1-0-0)</option>
                        <option value="BD (1-0-1)">Twice daily (1-0-1)</option>
                        <option value="TDS (1-1-1)">Thrice daily (1-1-1)</option>
                        <option value="QID (1-1-1-1)">Four times (1-1-1-1)</option>
                        <option value="SOS (As needed)">SOS (When required)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Duration (Days)</label>
                      <input
                        type="number"
                        value={item.durationDays}
                        onChange={(e) => handleItemChange(idx, 'durationDays', Number(e.target.value))}
                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Timing</label>
                      <select
                        value={item.timing}
                        onChange={(e) => handleItemChange(idx, 'timing', e.target.value as any)}
                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      >
                        <option value="After Food">After Food</option>
                        <option value="Before Food">Before Food</option>
                        <option value="With Food">With Food</option>
                        <option value="Empty Stomach">Empty Stomach</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Instructions</label>
                      <input
                        type="text"
                        value={item.instructions || ''}
                        onChange={(e) => handleItemChange(idx, 'instructions', e.target.value)}
                        placeholder="Special notes"
                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                    <div className="flex justify-end">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm"
            >
              Generate Prescription
            </button>
          </div>
        </form>
      </Modal>

      {/* Official Printable Prescription Slip Modal */}
      <Modal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        title="Official Medical Prescription (Rx)"
        subtitle="Standard clinical document layout for pharmacy fulfillment and patient records"
        maxWidth="2xl"
      >
        {selectedRx && (
          <div className="space-y-6 text-slate-900 dark:text-slate-100">
            {/* Printable Paper Canvas */}
            <div className="bg-white text-slate-900 p-6 rounded-2xl border-2 border-slate-200 shadow-inner">
              {/* Rx Header */}
              <div className="flex justify-between items-start border-b-2 border-blue-600 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                    <HeartPulse className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-blue-900">
                      MEDIPULSE CLINICAL HOSPITAL
                    </h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                      Department of Clinical Consultation & Therapeutics
                    </p>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-600">
                  <div className="font-bold text-blue-700">Rx Ref: {selectedRx.id}</div>
                  <div>Date: {selectedRx.date}</div>
                </div>
              </div>

              {/* Doctor & Patient Info Bar */}
              <div className="grid grid-cols-2 gap-4 text-xs pb-4 border-b border-slate-200 mb-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Prescribing Doctor
                  </span>
                  <div className="font-extrabold text-sm text-slate-900">{selectedRx.doctorName}</div>
                  <div className="text-slate-500 text-[11px]">Senior Consultant Physician</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Patient Details
                  </span>
                  <div className="font-extrabold text-sm text-slate-900">
                    {selectedRx.patientName}
                  </div>
                  <div className="text-slate-500 text-[11px]">Patient ID: {selectedRx.patientId}</div>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="mb-4 text-xs">
                <span className="font-bold text-slate-600">Clinical Diagnosis: </span>
                <span className="font-extrabold text-blue-900 text-sm">{selectedRx.diagnosis}</span>
              </div>

              {/* Rx Symbol & Medication Table */}
              <div className="mb-6">
                <div className="text-2xl font-black text-blue-600 font-serif mb-2">℞</div>
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase text-[10px] font-bold">
                      <th className="p-2">#</th>
                      <th className="p-2">Medication</th>
                      <th className="p-2">Dosage</th>
                      <th className="p-2">Frequency</th>
                      <th className="p-2">Duration</th>
                      <th className="p-2">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedRx.items.map((item, i) => (
                      <tr key={i}>
                        <td className="p-2 font-bold text-slate-400">{i + 1}</td>
                        <td className="p-2 font-bold text-slate-900">{item.medicineName}</td>
                        <td className="p-2">{item.dosage}</td>
                        <td className="p-2 font-semibold text-blue-700">{item.frequency}</td>
                        <td className="p-2">{item.durationDays} days</td>
                        <td className="p-2 text-slate-500 italic">
                          {item.timing} {item.instructions ? `• ${item.instructions}` : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Doctor Signature Block */}
              <div className="flex justify-between items-end pt-6 border-t border-slate-200">
                <div className="text-[10px] text-slate-400">
                  Valid for 30 days from date of issuance. Keep medicines away from direct sunlight.
                </div>
                <div className="text-center">
                  <div className="w-40 border-b border-slate-400 mb-1" />
                  <div className="text-xs font-bold text-slate-800">{selectedRx.doctorName}</div>
                  <div className="text-[10px] text-slate-500">Authorized Medical Practitioner</div>
                </div>
              </div>
            </div>

            {/* Print Action Buttons */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPrintOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Send to Printer / PDF</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
