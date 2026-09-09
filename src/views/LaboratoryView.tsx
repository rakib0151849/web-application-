import React, { useState } from 'react';
import {
  FlaskConical,
  Plus,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  Activity,
  HeartPulse,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { LabOrder, LabTestType, LabTestCategory } from '../types';
import { DataTable, Column } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const LaboratoryView: React.FC = () => {
  const {
    labOrders,
    addLabOrder,
    updateLabOrder,
    labTestCatalog,
    patients,
    doctors,
    currentUser,
  } = useHospital();

  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);

  // New Order states
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
  const [selectedCatalogId, setSelectedCatalogId] = useState(labTestCatalog[0]?.id || '');

  // Result entry states
  const [resultValue, setResultValue] = useState('');
  const [findings, setFindings] = useState('');
  const [isAbnormal, setIsAbnormal] = useState(false);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === patientId);
    const doctor = doctors.find((d) => d.id === doctorId);
    const testItem = labTestCatalog.find((t) => t.id === selectedCatalogId);

    if (!patient || !doctor || !testItem) return;

    addLabOrder({
      patientId: patient.id,
      patientName: patient.fullName,
      doctorId: doctor.id,
      doctorName: doctor.fullName,
      testName: testItem.testName,
      testCategory: testItem.category,
      orderDate: new Date().toISOString().split('T')[0],
      sampleStatus: 'Pending Collection',
      price: testItem.price,
      referenceRange: testItem.referenceRange,
    });

    setIsOrderOpen(false);
  };

  const handleSaveResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    updateLabOrder(selectedOrder.id, {
      resultValue,
      findings,
      isAbnormal,
      sampleStatus: 'Report Ready',
      resultDate: new Date().toISOString().split('T')[0],
      technicianName: currentUser.name,
    });

    setIsResultOpen(false);
  };

  const openResultModal = (order: LabOrder) => {
    setSelectedOrder(order);
    setResultValue(order.resultValue || '');
    setFindings(order.findings || 'Parameters evaluated within standard physiological tolerance limits.');
    setIsAbnormal(order.isAbnormal || false);
    setIsResultOpen(true);
  };

  const openPrintModal = (order: LabOrder) => {
    setSelectedOrder(order);
    setIsPrintOpen(true);
  };

  const columns: Column<LabOrder>[] = [
    {
      key: 'id',
      header: 'Order #',
      sortable: true,
      render: (o) => <span className="font-bold text-blue-600 dark:text-blue-400">{o.id}</span>,
    },
    {
      key: 'patientName',
      header: 'Patient Details',
      sortable: true,
      render: (o) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-white">{o.patientName}</span>
          <div className="text-[10px] text-slate-400">ID: {o.patientId}</div>
        </div>
      ),
    },
    {
      key: 'testName',
      header: 'Diagnostic Investigation',
      sortable: true,
      render: (o) => (
        <div>
          <span className="font-bold text-xs text-slate-900 dark:text-white">{o.testName}</span>
          <div className="text-[10px] text-teal-600 dark:text-teal-400">{o.testCategory}</div>
        </div>
      ),
    },
    {
      key: 'doctorName',
      header: 'Referred By',
      render: (o) => (
        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
          {o.doctorName}
        </span>
      ),
    },
    {
      key: 'sampleStatus',
      header: 'Processing Status',
      sortable: true,
      render: (o) => (
        <Badge
          variant={
            o.sampleStatus === 'Report Ready'
              ? 'success'
              : o.sampleStatus === 'Processing'
              ? 'warning'
              : o.sampleStatus === 'Sample Collected'
              ? 'primary'
              : 'neutral'
          }
          dot
        >
          {o.sampleStatus}
        </Badge>
      ),
    },
    {
      key: 'resultValue',
      header: 'Report Result',
      render: (o) => {
        if (!o.resultValue) return <span className="text-slate-400 text-xs">Awaiting Analysis</span>;
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`font-bold text-xs ${
                o.isAbnormal ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
              }`}
            >
              {o.resultValue}
            </span>
            {o.isAbnormal && (
              <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">
                HIGH
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (o) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {o.sampleStatus === 'Pending Collection' && (
            <button
              onClick={() => updateLabOrder(o.id, { sampleStatus: 'Sample Collected' })}
              className="px-2 py-1 text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg dark:bg-blue-950/60 dark:text-blue-300"
            >
              Collect Sample
            </button>
          )}

          {o.sampleStatus === 'Sample Collected' && (
            <button
              onClick={() => updateLabOrder(o.id, { sampleStatus: 'Processing' })}
              className="px-2 py-1 text-[11px] font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg dark:bg-amber-950/60 dark:text-amber-300"
            >
              Analyze
            </button>
          )}

          {o.sampleStatus === 'Processing' && (
            <button
              onClick={() => openResultModal(o)}
              className="px-2.5 py-1 text-[11px] font-bold bg-teal-600 text-white rounded-lg shadow-xs hover:bg-teal-700"
            >
              Enter Findings
            </button>
          )}

          {o.sampleStatus === 'Report Ready' && (
            <button
              onClick={() => openPrintModal(o)}
              className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Lab Report</span>
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
            Diagnostic Laboratory Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pathology, Hematology, Biochemistry & Radiology work orders, specimen collection tracking, and certified reports
          </p>
        </div>

        {currentUser.role !== 'Patient' && (
          <button
            onClick={() => setIsOrderOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Order Lab Investigation</span>
          </button>
        )}
      </div>

      {/* Lab Orders Table */}
      <DataTable
        data={labOrders}
        columns={columns}
        searchPlaceholder="Search lab orders by patient, test name, or order #..."
        searchFields={['patientName', 'testName', 'testCategory', 'id', 'doctorName']}
        filters={[
          {
            key: 'testCategory',
            label: 'Department',
            options: [
              { label: 'Hematology', value: 'Hematology' },
              { label: 'Biochemistry', value: 'Biochemistry' },
              { label: 'Radiology', value: 'Radiology' },
              { label: 'Pathology', value: 'Pathology' },
              { label: 'Cardiology', value: 'Cardiology' },
            ],
          },
          {
            key: 'sampleStatus',
            label: 'Status',
            options: [
              { label: 'Pending Collection', value: 'Pending Collection' },
              { label: 'Sample Collected', value: 'Sample Collected' },
              { label: 'Processing', value: 'Processing' },
              { label: 'Report Ready', value: 'Report Ready' },
            ],
          },
        ]}
      />

      {/* Order Lab Test Modal */}
      <Modal
        isOpen={isOrderOpen}
        onClose={() => setIsOrderOpen(false)}
        title="Order Diagnostic Investigation"
        subtitle="Initiates sample collection and adds investigation to patient encounter"
        maxWidth="md"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
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
                  {p.fullName} ({p.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Referring Physician *
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
              Select Diagnostic Test *
            </label>
            <select
              value={selectedCatalogId}
              onChange={(e) => setSelectedCatalogId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              {labTestCatalog.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.testName} ({t.category}) — ${t.price}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsOrderOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm"
            >
              Place Diagnostic Order
            </button>
          </div>
        </form>
      </Modal>

      {/* Enter Test Findings Modal */}
      <Modal
        isOpen={isResultOpen}
        onClose={() => setIsResultOpen(false)}
        title="Enter Diagnostic Findings & Results"
        subtitle={selectedOrder ? `${selectedOrder.testName} for ${selectedOrder.patientName}` : ''}
        maxWidth="md"
      >
        <form onSubmit={handleSaveResult} className="space-y-4 text-xs">
          {selectedOrder?.referenceRange && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-900 dark:text-blue-200">
              <span className="font-bold">Standard Reference Range: </span>
              <span>{selectedOrder.referenceRange}</span>
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Measured Numerical / Clinical Value *
            </label>
            <input
              type="text"
              required
              value={resultValue}
              onChange={(e) => setResultValue(e.target.value)}
              placeholder="e.g. 14.2 g/dL or 135 mg/dL"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isAbnormal"
              checked={isAbnormal}
              onChange={(e) => setIsAbnormal(e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 border-slate-300"
            />
            <label htmlFor="isAbnormal" className="font-bold text-rose-600 cursor-pointer">
              Flag as Clinically Abnormal / Critical Alert
            </label>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Technician Interpretation & Findings
            </label>
            <textarea
              rows={3}
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              placeholder="Clinical impression and observations..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsResultOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm"
            >
              Authorize & Publish Report
            </button>
          </div>
        </form>
      </Modal>

      {/* Official Diagnostic Lab Report Modal */}
      <Modal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        title="Official Diagnostic Laboratory Report"
        subtitle="Certified pathology and laboratory analysis result"
        maxWidth="2xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="bg-white text-slate-900 p-6 rounded-2xl border-2 border-slate-200 shadow-inner text-xs">
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-teal-600 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black">
                    <FlaskConical className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-teal-950">
                      MEDIPULSE DIAGNOSTIC LABORATORIES
                    </h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                      Accredited Clinical Pathology & Imaging Center
                    </p>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-600">
                  <div className="font-bold text-teal-700">Lab Ref: {selectedOrder.id}</div>
                  <div>Date: {selectedOrder.resultDate || selectedOrder.orderDate}</div>
                </div>
              </div>

              {/* Patient & Doctor Specimen Bar */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200 mb-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Patient</span>
                  <div className="font-extrabold text-sm text-slate-900">
                    {selectedOrder.patientName}
                  </div>
                  <div className="text-slate-500">ID: {selectedOrder.patientId}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Referred By
                  </span>
                  <div className="font-bold text-sm text-slate-900">{selectedOrder.doctorName}</div>
                  <div className="text-slate-500">Dept: {selectedOrder.testCategory}</div>
                </div>
              </div>

              {/* Test Results Table */}
              <div className="mb-6">
                <table className="w-full text-left border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase text-[10px] font-bold">
                      <th className="p-2.5">Investigation</th>
                      <th className="p-2.5">Result</th>
                      <th className="p-2.5">Reference Range</th>
                      <th className="p-2.5">Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">{selectedOrder.testName}</td>
                      <td className="p-2.5 font-extrabold text-teal-700 text-sm">
                        {selectedOrder.resultValue}
                      </td>
                      <td className="p-2.5 text-slate-600">{selectedOrder.referenceRange || 'N/A'}</td>
                      <td className="p-2.5">
                        {selectedOrder.isAbnormal ? (
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                            CRITICAL HIGH
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            NORMAL
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Clinical Impression */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-6">
                <span className="font-bold text-slate-700 block mb-1">Pathologist Impression:</span>
                <p className="text-slate-600">{selectedOrder.findings}</p>
              </div>

              {/* Signatures */}
              <div className="flex justify-between items-end pt-6 border-t border-slate-200">
                <div className="text-[10px] text-slate-400">
                  Technician: {selectedOrder.technicianName || 'Certified Lab Specialist'}
                </div>
                <div className="text-center">
                  <div className="w-40 border-b border-slate-400 mb-1" />
                  <div className="font-bold text-xs text-slate-800">Dr. Claire Vance, MD</div>
                  <div className="text-[10px] text-slate-500">Chief Consultant Pathologist</div>
                </div>
              </div>
            </div>

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
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Diagnostic Report</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
