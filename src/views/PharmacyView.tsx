import React, { useState } from 'react';
import {
  Pill,
  Plus,
  AlertTriangle,
  ShoppingCart,
  Receipt,
  Search,
  CheckCircle2,
  Trash2,
  DollarSign,
  Package,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { Medicine, PharmacySale, PharmacySaleItem } from '../types';
import { DataTable, Column } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { StatCard } from '../components/common/StatCard';

export const PharmacyView: React.FC = () => {
  const {
    medicines,
    addMedicine,
    updateMedicine,
    pharmacySales,
    dispenseMedicineSale,
    patients,
    currentUser,
    showToast,
  } = useHospital();

  const [activeTab, setActiveTab] = useState<'inventory' | 'sales'>('inventory');

  // Modals
  const [isAddMedOpen, setIsAddMedOpen] = useState(false);
  const [isDispenseOpen, setIsDispenseOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<PharmacySale | null>(null);

  // Medicine Form States
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [category, setCategory] = useState('Antibiotic');
  const [manufacturer, setManufacturer] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('2026-12-31');
  const [stockQuantity, setStockQuantity] = useState(100);
  const [minThreshold, setMinThreshold] = useState(25);
  const [unitPrice, setUnitPrice] = useState(12.5);
  const [costPrice, setCostPrice] = useState(8.0);
  const [rackLocation, setRackLocation] = useState('Rack A-1');

  // Dispense POS Form States
  const [posPatientId, setPosPatientId] = useState(patients[0]?.id || '');
  const [posItems, setPosItems] = useState<{ medicineId: string; quantity: number }[]>([
    { medicineId: medicines[0]?.id || '', quantity: 1 },
  ]);
  const [posDiscount, setPosDiscount] = useState(0);

  // Analytics
  const lowStockItems = medicines.filter((m) => m.stockQuantity <= m.minThreshold);
  const totalStockValuation = medicines.reduce((sum, m) => sum + m.stockQuantity * m.unitPrice, 0);
  const totalSalesRevenue = pharmacySales.reduce((sum, s) => sum + s.totalAmount, 0);

  const openAddMed = () => {
    setName('');
    setGenericName('');
    setCategory('Antibiotic');
    setManufacturer('Pfizer / GlaxoSmithKline');
    setBatchNumber(`BTH-${Date.now().toString().slice(-4)}`);
    setExpiryDate('2026-12-31');
    setStockQuantity(100);
    setMinThreshold(25);
    setUnitPrice(12.5);
    setCostPrice(8.0);
    setRackLocation('Rack A-1');
    setIsAddMedOpen(true);
  };

  const handleSaveMed = (e: React.FormEvent) => {
    e.preventDefault();
    addMedicine({
      name,
      genericName,
      category,
      manufacturer,
      batchNumber,
      expiryDate,
      stockQuantity: Number(stockQuantity),
      minThreshold: Number(minThreshold),
      unitPrice: Number(unitPrice),
      costPrice: Number(costPrice),
      rackLocation,
    });
    setIsAddMedOpen(false);
  };

  const handleAddPosItem = () => {
    const available = medicines.find(
      (m) => !posItems.some((pi) => pi.medicineId === m.id) && m.stockQuantity > 0
    );
    if (available) {
      setPosItems([...posItems, { medicineId: available.id, quantity: 1 }]);
    } else {
      setPosItems([...posItems, { medicineId: medicines[0]?.id || '', quantity: 1 }]);
    }
  };

  const handleRemovePosItem = (idx: number) => {
    setPosItems(posItems.filter((_, i) => i !== idx));
  };

  const handlePosChange = (idx: number, field: 'medicineId' | 'quantity', val: any) => {
    const updated = [...posItems];
    (updated[idx] as any)[field] = val;
    setPosItems(updated);
  };

  const calculatePosTotals = () => {
    let subtotal = 0;
    for (const item of posItems) {
      const med = medicines.find((m) => m.id === item.medicineId);
      if (med) {
        subtotal += med.unitPrice * (item.quantity || 1);
      }
    }
    const discount = Number(posDiscount) || 0;
    const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST/Tax
    const total = Math.max(0, subtotal - discount + tax);
    return { subtotal, discount, tax, total };
  };

  const handleExecuteSale = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === posPatientId);
    if (!patient) return;

    // Validate stock
    for (const item of posItems) {
      const med = medicines.find((m) => m.id === item.medicineId);
      if (!med) continue;
      if (med.stockQuantity < item.quantity) {
        showToast('Insufficient Stock', `Only ${med.stockQuantity} units of ${med.name} available.`, 'error');
        return;
      }
    }

    const { subtotal, discount, tax, total } = calculatePosTotals();

    const saleItems: PharmacySaleItem[] = posItems.map((item) => {
      const med = medicines.find((m) => m.id === item.medicineId)!;
      return {
        medicineId: med.id,
        medicineName: med.name,
        quantity: Number(item.quantity),
        unitPrice: med.unitPrice,
        totalPrice: med.unitPrice * Number(item.quantity),
      };
    });

    const newSale = dispenseMedicineSale({
      patientId: patient.id,
      patientName: patient.fullName,
      pharmacistName: currentUser.name,
      saleDate: new Date().toISOString().split('T')[0],
      items: saleItems,
      subtotal,
      discount,
      tax,
      totalAmount: total,
      paymentMethod: 'Cash',
    });

    setIsDispenseOpen(false);
    setSelectedSale(newSale);
    setIsInvoiceModalOpen(true);
  };

  const medColumns: Column<Medicine>[] = [
    {
      key: 'name',
      header: 'Medicine & Generic',
      sortable: true,
      render: (m) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-white">{m.name}</span>
          <div className="text-[10px] text-slate-400 italic">{m.genericName}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (m) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {m.category}
        </span>
      ),
    },
    {
      key: 'stockQuantity',
      header: 'Stock / Min',
      sortable: true,
      render: (m) => {
        const isLow = m.stockQuantity <= m.minThreshold;
        return (
          <div>
            <span
              className={`font-bold text-xs ${
                isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
              }`}
            >
              {m.stockQuantity} units
            </span>
            <div className="text-[10px] text-slate-400">Min: {m.minThreshold}</div>
          </div>
        );
      },
    },
    {
      key: 'unitPrice',
      header: 'Retail Price',
      sortable: true,
      render: (m) => (
        <div>
          <span className="font-bold text-xs text-slate-900 dark:text-white">${m.unitPrice.toFixed(2)}</span>
          <div className="text-[10px] text-slate-400">Cost: ${m.costPrice.toFixed(2)}</div>
        </div>
      ),
    },
    {
      key: 'rackLocation',
      header: 'Rack & Batch',
      render: (m) => (
        <div className="text-xs">
          <span className="font-medium text-teal-600 dark:text-teal-400">{m.rackLocation}</span>
          <div className="text-[10px] text-slate-400">{m.batchNumber}</div>
        </div>
      ),
    },
    {
      key: 'expiryDate',
      header: 'Expiry Date',
      sortable: true,
      render: (m) => <span className="text-xs text-slate-500">{m.expiryDate}</span>,
    },
  ];

  const salesColumns: Column<PharmacySale>[] = [
    {
      key: 'id',
      header: 'Invoice #',
      sortable: true,
      render: (s) => <span className="font-bold text-blue-600 dark:text-blue-400">{s.id}</span>,
    },
    {
      key: 'patientName',
      header: 'Patient Details',
      sortable: true,
      render: (s) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-white">{s.patientName}</span>
          <div className="text-[10px] text-slate-400">ID: {s.patientId}</div>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Drugs Dispensed',
      render: (s) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {s.items.map((i) => `${i.medicineName} (x${i.quantity})`).join(', ')}
        </span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Total Paid',
      sortable: true,
      render: (s) => (
        <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
          ${s.totalAmount.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'saleDate',
      header: 'Date',
      sortable: true,
      render: (s) => <span className="text-xs text-slate-500">{s.saleDate}</span>,
    },
    {
      key: 'actions',
      header: 'Receipt',
      className: 'text-right',
      render: (s) => (
        <button
          onClick={() => {
            setSelectedSale(s);
            setIsInvoiceModalOpen(true);
          }}
          className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg dark:bg-blue-950/60 dark:text-blue-300"
        >
          View Receipt
        </button>
      ),
    },
  ];

  const posTotals = calculatePosTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Pharmacy & Dispensary Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Drug inventory catalog, real-time batch & expiry tracking, POS billing, and automated stock replenishment alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser.role !== 'Patient' && (
            <>
              <button
                onClick={openAddMed}
                className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Medicine</span>
              </button>
              <button
                onClick={() => setIsDispenseOpen(true)}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/20 transition-colors flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Dispense / POS Billing</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Formulations"
          value={medicines.length}
          subtitle="Pharmaceutical inventory"
          icon={Pill}
          color="blue"
        />
        <StatCard
          title="Low Stock Alerts"
          value={lowStockItems.length}
          subtitle="At or below minimum threshold"
          icon={AlertTriangle}
          color={lowStockItems.length > 0 ? 'rose' : 'emerald'}
        />
        <StatCard
          title="Dispensary Sales"
          value={`$${totalSalesRevenue.toFixed(2)}`}
          subtitle={`${pharmacySales.length} retail invoices`}
          icon={Receipt}
          color="teal"
        />
        <StatCard
          title="Stock Valuation"
          value={`$${totalStockValuation.toFixed(2)}`}
          subtitle="Total inventory retail value"
          icon={DollarSign}
          color="indigo"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'inventory'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Medicine Inventory Catalog ({medicines.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'sales'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Dispensary Sales History ({pharmacySales.length})</span>
        </button>
      </div>

      {/* Main Content by Tab */}
      {activeTab === 'inventory' ? (
        <DataTable
          data={medicines}
          columns={medColumns}
          searchPlaceholder="Search medicines by name, generic, or rack..."
          searchFields={['name', 'genericName', 'category', 'batchNumber', 'rackLocation']}
          filters={[
            {
              key: 'category',
              label: 'Category',
              options: [
                { label: 'Antibiotic', value: 'Antibiotic' },
                { label: 'Analgesic', value: 'Analgesic' },
                { label: 'Antihypertensive', value: 'Antihypertensive' },
                { label: 'Antidiabetic', value: 'Antidiabetic' },
                { label: 'Gastrointestinal', value: 'Gastrointestinal' },
                { label: 'Respiratory', value: 'Respiratory' },
              ],
            },
          ]}
        />
      ) : (
        <DataTable
          data={pharmacySales}
          columns={salesColumns}
          searchPlaceholder="Search sales by invoice # or patient name..."
          searchFields={['id', 'patientName', 'pharmacistName']}
        />
      )}

      {/* Add Medicine Modal */}
      <Modal
        isOpen={isAddMedOpen}
        onClose={() => setIsAddMedOpen(false)}
        title="Add Medicine to Inventory"
        subtitle="Specify drug details, manufacturer, stock thresholds, and rack placement"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveMed} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Brand / Trade Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Augmentin 625mg"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Generic Composition *
              </label>
              <input
                type="text"
                required
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
                placeholder="e.g. Amoxicillin + Clavulanic Acid"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Therapeutic Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="Antibiotic">Antibiotic</option>
                <option value="Analgesic">Analgesic / Antipyretic</option>
                <option value="Antihypertensive">Antihypertensive</option>
                <option value="Antidiabetic">Antidiabetic</option>
                <option value="Gastrointestinal">Gastrointestinal</option>
                <option value="Respiratory">Respiratory</option>
                <option value="Cardiovascular">Cardiovascular</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Manufacturer / Supplier
              </label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g. GSK / Pfizer"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Batch Number *
              </label>
              <input
                type="text"
                required
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Expiry Date *
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Rack Location
              </label>
              <input
                type="text"
                value={rackLocation}
                onChange={(e) => setRackLocation(e.target.value)}
                placeholder="Rack B-3"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Min Threshold *
              </label>
              <input
                type="number"
                required
                value={minThreshold}
                onChange={(e) => setMinThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Cost Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Retail Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddMedOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm"
            >
              Add to Pharmacy Stock
            </button>
          </div>
        </form>
      </Modal>

      {/* POS Dispense Medicine Modal */}
      <Modal
        isOpen={isDispenseOpen}
        onClose={() => setIsDispenseOpen(false)}
        title="Point of Sale (POS) Dispensary Counter"
        subtitle="Dispense medications, validate stock, and generate itemized billing receipt"
        maxWidth="2xl"
      >
        <form onSubmit={handleExecuteSale} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Select Patient *
            </label>
            <select
              value={posPatientId}
              onChange={(e) => setPosPatientId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.id}) - {p.phone}
                </option>
              ))}
            </select>
          </div>

          {/* POS Items Table */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-bold text-slate-900 dark:text-white">Dispensing Line Items</h5>
              <button
                type="button"
                onClick={handleAddPosItem}
                className="px-2.5 py-1 bg-teal-600 text-white rounded-lg font-semibold flex items-center gap-1 hover:bg-teal-700"
              >
                <Plus className="w-3 h-3" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {posItems.map((item, idx) => {
                const med = medicines.find((m) => m.id === item.medicineId);
                const lineTotal = med ? med.unitPrice * item.quantity : 0;

                return (
                  <div
                    key={idx}
                    className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2"
                  >
                    <div className="flex-1">
                      <select
                        value={item.medicineId}
                        onChange={(e) => handlePosChange(idx, 'medicineId', e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      >
                        {medicines.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} (${m.unitPrice.toFixed(2)}) — In Stock: {m.stockQuantity}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-20">
                      <input
                        type="number"
                        min="1"
                        max={med?.stockQuantity || 999}
                        value={item.quantity}
                        onChange={(e) =>
                          handlePosChange(idx, 'quantity', Math.max(1, Number(e.target.value)))
                        }
                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-center"
                      />
                    </div>

                    <div className="w-20 text-right font-bold text-slate-900 dark:text-white">
                      ${lineTotal.toFixed(2)}
                    </div>

                    {posItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePosItem(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Calculations Summary */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1.5 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">${posTotals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Concession / Discount ($):</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={posDiscount}
                  onChange={(e) => setPosDiscount(Number(e.target.value))}
                  className="w-20 px-2 py-0.5 text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
                />
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (5%):</span>
                <span className="font-semibold">${posTotals.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Net Total Payable:</span>
                <span className="text-teal-600">${posTotals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsDispenseOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Dispense & Print Bill</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* View Pharmacy Sale Invoice Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Pharmacy Dispensary Receipt"
        subtitle={selectedSale ? `Invoice #${selectedSale.id} • ${selectedSale.saleDate}` : ''}
        maxWidth="md"
      >
        {selectedSale && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                <span>Patient: {selectedSale.patientName}</span>
                <span className="text-teal-600 font-extrabold">PAID</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Pharmacist: {selectedSale.pharmacistName}
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                  <tr>
                    <th className="p-2.5">Item</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Price</th>
                    <th className="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {selectedSale.items.map((it, i) => (
                    <tr key={i}>
                      <td className="p-2.5 font-medium">{it.medicineName}</td>
                      <td className="p-2.5 text-center">{it.quantity}</td>
                      <td className="p-2.5 text-right">${it.unitPrice.toFixed(2)}</td>
                      <td className="p-2.5 text-right font-bold">${it.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${selectedSale.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Discount:</span>
                <span>-${selectedSale.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${selectedSale.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 dark:text-white text-sm pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>Total Amount:</span>
                <span className="text-emerald-600">${selectedSale.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
