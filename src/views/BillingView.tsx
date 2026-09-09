import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Printer,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Shield,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { Invoice, InvoiceItem } from '../types';
import { DataTable, Column } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { StatCard } from '../components/common/StatCard';

export const BillingView: React.FC = () => {
  const {
    invoices,
    createInvoice,
    recordPayment,
    patients,
    currentUser,
  } = useHospital();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Create Invoice States
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [consultationFee, setConsultationFee] = useState(120);
  const [roomCharges, setRoomCharges] = useState(0);
  const [medicineCharges, setMedicineCharges] = useState(0);
  const [labCharges, setLabCharges] = useState(0);
  const [procedureCharges, setProcedureCharges] = useState(0);
  const [discount, setDiscount] = useState(0);

  // Payment Recording States
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<Invoice['paymentMethod']>('Credit Card');

  // Stats
  const totalBilled = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalPending = invoices.reduce((sum, inv) => sum + inv.dueAmount, 0);

  const calculateNewInvoiceTotals = () => {
    const subtotal =
      Number(consultationFee) +
      Number(roomCharges) +
      Number(medicineCharges) +
      Number(labCharges) +
      Number(procedureCharges);
    const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% standard tax
    const total = Math.max(0, subtotal - Number(discount) + tax);
    return { subtotal, tax, total };
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return;

    const { subtotal, tax, total } = calculateNewInvoiceTotals();

    const items: InvoiceItem[] = [];
    if (consultationFee > 0) items.push({ description: 'Physician Consultation Fee', amount: Number(consultationFee) });
    if (roomCharges > 0) items.push({ description: 'Inpatient Bed & Nursing Care Charges', amount: Number(roomCharges) });
    if (medicineCharges > 0) items.push({ description: 'Pharmaceutical & Dispensary Supplies', amount: Number(medicineCharges) });
    if (labCharges > 0) items.push({ description: 'Laboratory & Diagnostic Investigations', amount: Number(labCharges) });
    if (procedureCharges > 0) items.push({ description: 'Minor Clinical Procedures / Nursing Service', amount: Number(procedureCharges) });

    createInvoice({
      patientId: patient.id,
      patientName: patient.fullName,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items,
      subtotal,
      discount: Number(discount),
      tax,
      totalAmount: total,
      paidAmount: 0,
      dueAmount: total,
      paymentStatus: 'Unpaid',
      paymentMethod: 'Cash',
    });

    setIsCreateOpen(false);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || paymentAmount <= 0) return;

    recordPayment(selectedInvoice.id, Number(paymentAmount), paymentMethod);
    setIsPaymentOpen(false);
  };

  const openPaymentModal = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPaymentAmount(inv.dueAmount);
    setPaymentMethod('Credit Card');
    setIsPaymentOpen(true);
  };

  const openPrintModal = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsPrintOpen(true);
  };

  const newTotals = calculateNewInvoiceTotals();

  const columns: Column<Invoice>[] = [
    {
      key: 'id',
      header: 'Invoice #',
      sortable: true,
      render: (inv) => <span className="font-bold text-blue-600 dark:text-blue-400">{inv.id}</span>,
    },
    {
      key: 'patientName',
      header: 'Patient Details',
      sortable: true,
      render: (inv) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-white">{inv.patientName}</span>
          <div className="text-[10px] text-slate-400">ID: {inv.patientId}</div>
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Total Bill',
      sortable: true,
      render: (inv) => (
        <span className="font-bold text-xs text-slate-900 dark:text-white">
          ${inv.totalAmount.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'paidAmount',
      header: 'Paid / Collected',
      sortable: true,
      render: (inv) => (
        <span className="font-semibold text-xs text-emerald-600 dark:text-emerald-400">
          ${inv.paidAmount.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'dueAmount',
      header: 'Balance Due',
      sortable: true,
      render: (inv) => (
        <span
          className={`font-bold text-xs ${
            inv.dueAmount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'
          }`}
        >
          ${inv.dueAmount.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Payment Status',
      sortable: true,
      render: (inv) => (
        <Badge
          variant={
            inv.paymentStatus === 'Paid'
              ? 'success'
              : inv.paymentStatus === 'Partially Paid'
              ? 'warning'
              : 'danger'
          }
          dot
        >
          {inv.paymentStatus}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (inv) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {inv.dueAmount > 0 && currentUser.role !== 'Patient' && (
            <button
              onClick={() => openPaymentModal(inv)}
              className="px-2.5 py-1 text-[11px] font-bold bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg dark:bg-teal-950/60 dark:text-teal-300"
            >
              Collect Pay
            </button>
          )}
          <button
            onClick={() => openPrintModal(inv)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
            title="Print Tax Invoice"
          >
            <Printer className="w-4 h-4" />
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
            Hospital Billing & Accounts Receivable
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Consolidated invoicing, patient payments, insurance claims settlement, and official receipts
          </p>
        </div>

        {currentUser.role !== 'Patient' && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Patient Invoice</span>
          </button>
        )}
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Billed Invoices"
          value={`$${totalBilled.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle="Hospital ledger gross billed"
          icon={Receipt}
          color="blue"
        />
        <StatCard
          title="Total Collections"
          value={`$${totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle="Reconciled cash & card receipts"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Outstanding Balance"
          value={`$${totalPending.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle="Pending patient copays & insurance"
          icon={Clock}
          color={totalPending > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* DataTable */}
      <DataTable
        data={invoices}
        columns={columns}
        searchPlaceholder="Search invoices by patient name or invoice #..."
        searchFields={['patientName', 'id', 'paymentMethod']}
        filters={[
          {
            key: 'paymentStatus',
            label: 'Status',
            options: [
              { label: 'Paid', value: 'Paid' },
              { label: 'Partially Paid', value: 'Partially Paid' },
              { label: 'Unpaid', value: 'Unpaid' },
            ],
          },
        ]}
        onRowClick={(inv) => openPrintModal(inv)}
      />

      {/* Generate Invoice Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Generate Consolidated Patient Bill"
        subtitle="Itemize consultation, ward accommodation, pharmacy, and diagnostic services"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
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
                  {p.fullName} ({p.id}) — Insurance: {p.insuranceProvider || 'None'}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h5 className="font-bold text-slate-900 dark:text-white">Fee Breakdown</h5>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">
                  Doctor Consultation Fee ($)
                </label>
                <input
                  type="number"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">
                  Bed & Room Charges ($)
                </label>
                <input
                  type="number"
                  value={roomCharges}
                  onChange={(e) => setRoomCharges(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">
                  Pharmacy / Medications ($)
                </label>
                <input
                  type="number"
                  value={medicineCharges}
                  onChange={(e) => setMedicineCharges(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">
                  Laboratory / Diagnostics ($)
                </label>
                <input
                  type="number"
                  value={labCharges}
                  onChange={(e) => setLabCharges(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">
                  Clinical Procedures ($)
                </label>
                <input
                  type="number"
                  value={procedureCharges}
                  onChange={(e) => setProcedureCharges(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Discount Concession ($):</span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-24 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-right"
                />
              </div>
              <div className="text-right">
                <div className="text-slate-500 text-[11px]">Tax (5%): ${newTotals.tax.toFixed(2)}</div>
                <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Total Payable: ${newTotals.total.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm"
            >
              Issue Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        title="Record Payment Collection"
        subtitle={selectedInvoice ? `Invoice #${selectedInvoice.id} for ${selectedInvoice.patientName}` : ''}
        maxWidth="md"
      >
        <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex justify-between items-center text-blue-900 dark:text-blue-200">
            <span>Outstanding Balance:</span>
            <span className="text-base font-extrabold">${selectedInvoice?.dueAmount.toFixed(2)}</span>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Payment Amount to Collect ($) *
            </label>
            <input
              type="number"
              step="0.01"
              max={selectedInvoice?.dueAmount}
              required
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as Invoice['paymentMethod'])}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card / POS Terminal</option>
              <option value="Insurance">Insurance TPA Settlement</option>
              <option value="UPI">UPI / Instant Transfer</option>
              <option value="Bank Transfer">Bank Wire</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsPaymentOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm"
            >
              Confirm Collection
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Tax Invoice Slip Modal */}
      <Modal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        title="Official Hospital Tax Invoice"
        subtitle="Itemized healthcare billing statement and payment receipt"
        maxWidth="2xl"
      >
        {selectedInvoice && (
          <div className="space-y-6">
            <div className="bg-white text-slate-900 p-6 rounded-2xl border-2 border-slate-200 shadow-inner text-xs">
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-blue-600 pb-4 mb-4">
                <div>
                  <h3 className="text-lg font-black tracking-tight text-blue-900">
                    MEDIPULSE CLINICAL HEALTHCARE
                  </h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                    Accounts & Billing Directorate
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Tax ID: US-EIN-99218274</p>
                </div>
                <div className="text-right text-[11px] text-slate-600">
                  <div className="font-extrabold text-blue-700 text-sm">
                    INVOICE #{selectedInvoice.id}
                  </div>
                  <div>Issued: {selectedInvoice.invoiceDate}</div>
                  <div>Due: {selectedInvoice.dueDate}</div>
                </div>
              </div>

              {/* Patient Bar */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200 mb-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Billed To
                  </span>
                  <div className="font-bold text-sm text-slate-900">
                    {selectedInvoice.patientName}
                  </div>
                  <div className="text-slate-500">Patient ID: {selectedInvoice.patientId}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Payment Status
                  </span>
                  <span
                    className={`font-black text-sm uppercase px-2 py-0.5 rounded ${
                      selectedInvoice.paymentStatus === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedInvoice.paymentStatus === 'Partially Paid'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {selectedInvoice.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="mb-6">
                <table className="w-full text-left border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase text-[10px] font-bold">
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Clinical Service / Charge Description</th>
                      <th className="p-2.5 text-right">Amount ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedInvoice.items.map((item, i) => (
                      <tr key={i}>
                        <td className="p-2.5 font-bold text-slate-400">{i + 1}</td>
                        <td className="p-2.5 font-semibold text-slate-900">{item.description}</td>
                        <td className="p-2.5 text-right font-medium">${item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation breakdown */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-slate-600 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Discount:</span>
                  <span>-${selectedInvoice.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (5%):</span>
                  <span>${selectedInvoice.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-200">
                  <span>Total Amount Billed:</span>
                  <span>${selectedInvoice.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>Amount Paid to Date:</span>
                  <span>${selectedInvoice.paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-rose-700 text-sm pt-1 border-t border-slate-200">
                  <span>Remaining Due:</span>
                  <span>${selectedInvoice.dueAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-end pt-4 border-t border-slate-200">
                <div className="text-[10px] text-slate-400">
                  All checks payable to MediPulse Clinical Inc. Thank you.
                </div>
                <div className="text-center">
                  <div className="w-36 border-b border-slate-400 mb-1" />
                  <div className="font-bold text-[11px] text-slate-800">Authorized Signatory</div>
                  <div className="text-[10px] text-slate-500">Hospital Finance Officer</div>
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
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Invoice</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
