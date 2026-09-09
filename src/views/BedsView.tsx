import React, { useState } from 'react';
import {
  Hotel,
  BedDouble,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wrench,
  User,
  ArrowRightLeft,
  Plus,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { Bed, BedCategory, BedStatus } from '../types';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const BedsView: React.FC = () => {
  const { beds, updateBedStatus, patients, currentUser } = useHospital();

  const [selectedWard, setSelectedWard] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [activeBed, setActiveBed] = useState<Bed | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  // Assignment states
  const [assignPatientId, setAssignPatientId] = useState(patients[0]?.id || '');
  const [transferTargetBedId, setTransferTargetBedId] = useState('');

  // Metrics
  const totalBeds = beds.length;
  const availableBeds = beds.filter((b) => b.status === 'Available').length;
  const occupiedBeds = beds.filter((b) => b.status === 'Occupied').length;
  const maintenanceBeds = beds.filter((b) => b.status === 'Maintenance').length;
  const reservedBeds = beds.filter((b) => b.status === 'Reserved').length;

  const wards: (BedCategory | 'All')[] = [
    'All',
    'ICU',
    'General Ward',
    'Emergency',
    'Maternity',
    'Pediatric',
    'Deluxe Suite',
  ];

  const filteredBeds = beds.filter((b) => {
    const wardMatch = selectedWard === 'All' || b.ward === selectedWard;
    const statusMatch = selectedStatus === 'All' || b.status === selectedStatus;
    return wardMatch && statusMatch;
  });

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBed) return;
    const patient = patients.find((p) => p.id === assignPatientId);
    if (!patient) return;

    updateBedStatus(activeBed.id, 'Occupied', patient.id, patient.fullName);
    setIsAssignOpen(false);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBed || !transferTargetBedId) return;
    const targetBed = beds.find((b) => b.id === transferTargetBedId);
    if (!targetBed) return;

    // Move patient to target bed
    updateBedStatus(targetBed.id, 'Occupied', activeBed.occupiedByPatientId, activeBed.occupiedByPatientName);
    // Free source bed
    updateBedStatus(activeBed.id, 'Available');
    setIsTransferOpen(false);
  };

  const getStatusColor = (st: BedStatus) => {
    switch (st) {
      case 'Available':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300';
      case 'Occupied':
        return 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300';
      case 'Maintenance':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300';
      case 'Reserved':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300';
      default:
        return 'bg-slate-500/10 border-slate-500/30 text-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Hospital Bed & Ward Operations
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Interactive floorplan matrix, real-time occupancy, patient transfers, and sanitization maintenance
          </p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Bed Capacity"
          value={totalBeds}
          subtitle="Hospital clinical bays"
          icon={BedDouble}
          color="blue"
        />
        <StatCard
          title="Available Now"
          value={availableBeds}
          subtitle="Sanitized & ready for admit"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Occupied"
          value={occupiedBeds}
          subtitle={`${Math.round((occupiedBeds / totalBeds) * 100)}% active occupancy`}
          icon={Hotel}
          color="rose"
        />
        <StatCard
          title="Maintenance / Clean"
          value={maintenanceBeds + reservedBeds}
          subtitle={`${maintenanceBeds} repairs • ${reservedBeds} reserved`}
          icon={Wrench}
          color="amber"
        />
      </div>

      {/* Ward Filters & Status Filter Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5">
          {wards.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setSelectedWard(w)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedWard === w
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {w}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Status Filter:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available Only</option>
            <option value="Occupied">Occupied Only</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Reserved">Reserved</option>
          </select>
        </div>
      </div>

      {/* Visual Bed Grid Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBeds.map((bed) => {
          const isOcc = bed.status === 'Occupied';
          const isAvail = bed.status === 'Available';

          return (
            <div
              key={bed.id}
              className={`rounded-2xl p-4 border transition-all relative ${
                isOcc
                  ? 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/60 shadow-xs'
                  : isAvail
                  ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900/60 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isOcc
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300'
                        : isAvail
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    #{bed.bedNumber}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {bed.roomNumber}
                    </h4>
                    <span className="text-[10px] text-slate-400">Floor {bed.floor}</span>
                  </div>
                </div>

                <Badge
                  variant={
                    bed.status === 'Available'
                      ? 'success'
                      : bed.status === 'Occupied'
                      ? 'danger'
                      : bed.status === 'Maintenance'
                      ? 'warning'
                      : 'primary'
                  }
                  size="sm"
                >
                  {bed.status}
                </Badge>
              </div>

              {/* Ward tag & rate */}
              <div className="flex justify-between items-center text-[11px] mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-teal-600 dark:text-teal-400">{bed.ward}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  ${bed.dailyCharge}/day
                </span>
              </div>

              {/* Patient assignment info */}
              <div className="min-h-[44px]">
                {isOcc ? (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Patient In Bed:
                    </span>
                    <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {bed.occupiedByPatientName}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      ID: {bed.occupiedByPatientId}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium py-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Vacant & Sanitized</span>
                  </div>
                )}
              </div>

              {/* Control Action Buttons */}
              {currentUser.role !== 'Patient' && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5 text-xs">
                  {isAvail && (
                    <>
                      <button
                        onClick={() => {
                          setActiveBed(bed);
                          setIsAssignOpen(true);
                        }}
                        className="flex-1 py-1.5 px-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 font-semibold rounded-lg text-center"
                      >
                        Assign Patient
                      </button>
                      <button
                        onClick={() => updateBedStatus(bed.id, 'Maintenance')}
                        title="Mark for Sanitization / Maintenance"
                        className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {isOcc && (
                    <>
                      <button
                        onClick={() => {
                          setActiveBed(bed);
                          const free = beds.filter(
                            (b) => b.status === 'Available' && b.id !== bed.id
                          );
                          if (free.length > 0) setTransferTargetBedId(free[0].id);
                          setIsTransferOpen(true);
                        }}
                        className="flex-1 py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg flex items-center justify-center gap-1"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>Transfer</span>
                      </button>
                      <button
                        onClick={() => updateBedStatus(bed.id, 'Available')}
                        className="py-1.5 px-2 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 font-semibold rounded-lg"
                      >
                        Free Bed
                      </button>
                    </>
                  )}

                  {bed.status === 'Maintenance' && (
                    <button
                      onClick={() => updateBedStatus(bed.id, 'Available')}
                      className="w-full py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold rounded-lg text-center"
                    >
                      Mark Clean & Ready
                    </button>
                  )}

                  {bed.status === 'Reserved' && (
                    <button
                      onClick={() => updateBedStatus(bed.id, 'Available')}
                      className="w-full py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-center font-semibold"
                    >
                      Release Reservation
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Assign Patient Modal */}
      <Modal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title={`Assign Patient to Bed #${activeBed?.bedNumber}`}
        subtitle={`Ward: ${activeBed?.ward} (${activeBed?.roomNumber})`}
        maxWidth="md"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Select Patient *
            </label>
            <select
              value={assignPatientId}
              onChange={(e) => setAssignPatientId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.id}) - {p.status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAssignOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
            >
              Confirm Assignment
            </button>
          </div>
        </form>
      </Modal>

      {/* Transfer Patient Modal */}
      <Modal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        title="Transfer Patient to Another Bed"
        subtitle={activeBed ? `Transferring ${activeBed.occupiedByPatientName} from Bed #${activeBed.bedNumber}` : ''}
        maxWidth="md"
      >
        <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Destination Bed *
            </label>
            <select
              value={transferTargetBedId}
              onChange={(e) => setTransferTargetBedId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              {beds
                .filter((b) => b.status === 'Available')
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    Bed #{b.bedNumber} - {b.ward} ({b.roomNumber}) - ${b.dailyCharge}/day
                  </option>
                ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsTransferOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
            >
              Execute Bed Transfer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
