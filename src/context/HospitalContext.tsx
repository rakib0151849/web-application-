import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Patient,
  Doctor,
  Appointment,
  OPDRow,
  Bed,
  IPDAdmission,
  Medicine,
  LabTest,
  LabOrder,
  Invoice,
  Prescription,
  HospitalNotification,
  PharmacySale,
  ActiveModule,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PATIENTS,
  INITIAL_DOCTORS,
  INITIAL_APPOINTMENTS,
  INITIAL_OPD,
  INITIAL_BEDS,
  INITIAL_IPD,
  INITIAL_MEDICINES,
  INITIAL_PHARMACY_SALES,
  INITIAL_LAB_TESTS,
  INITIAL_LAB_ORDERS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_INVOICES,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';
import { isModuleAllowed } from '../utils/permissions';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface HospitalContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  allUsers: User[];
  isAuthenticated: boolean;
  login: (user?: User) => void;
  logout: () => void;
  resetToDemoData: () => void;
  activeModule: ActiveModule;
  setActiveModule: (mod: ActiveModule) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;

  // Data Collections
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  opdRecords: OPDRow[];
  beds: Bed[];
  ipdAdmissions: IPDAdmission[];
  prescriptions: Prescription[];
  medicines: Medicine[];
  pharmacySales: PharmacySale[];
  labTests: LabTest[];
  labOrders: LabOrder[];
  invoices: Invoice[];
  notifications: HospitalNotification[];
  toasts: ToastMessage[];

  // Toasts
  showToast: (title: string, message?: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  // Actions
  addPatient: (patient: Omit<Patient, 'id' | 'registeredDate'>) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  deletePatient: (id: string) => void;

  addDoctor: (doctor: Omit<Doctor, 'id'>) => Doctor;
  updateDoctor: (id: string, updates: Partial<Doctor>) => void;

  bookAppointment: (appt: Omit<Appointment, 'id' | 'tokenNumber'>) => Appointment;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  cancelAppointment: (id: string) => void;

  addOPDConsultation: (opd: Omit<OPDRow, 'id'>) => OPDRow;

  admitPatientIPD: (admission: Omit<IPDAdmission, 'id' | 'admittedTime'>) => IPDAdmission;
  dischargePatientIPD: (admissionId: string, summary: IPDAdmission['dischargeSummary']) => void;

  updateBedStatus: (bedId: string, status: Bed['status'], patientId?: string, patientName?: string, admissionId?: string) => void;

  addPrescription: (rx: Omit<Prescription, 'id'>) => Prescription;

  addMedicine: (med: Omit<Medicine, 'id'>) => Medicine;
  updateMedicine: (id: string, updates: Partial<Medicine>) => void;
  dispenseMedicineSale: (sale: Omit<PharmacySale, 'id' | 'invoiceNumber'>) => PharmacySale;

  createLabOrder: (order: Omit<LabOrder, 'id'>) => LabOrder;
  updateLabOrder: (id: string, updates: Partial<LabOrder>) => void;

  createInvoice: (inv: Omit<Invoice, 'id' | 'dueAmount'>) => Invoice;
  recordInvoicePayment: (invoiceId: string, payment: { amount: number; method: Invoice['paymentHistory'][0]['method']; transactionId?: string }) => void;

  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(`medipulse_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(`medipulse_${key}`, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save ${key} to storage`, err);
  }
}

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(() =>
    loadFromStorage('current_user', INITIAL_USERS[0])
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    loadFromStorage('is_authenticated', true)
  );
  const [activeModule, setActiveModuleState] = useState<ActiveModule>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() =>
    loadFromStorage('dark_mode', false)
  );
  const [globalSearch, setGlobalSearch] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const login = (user?: User) => {
    if (user) {
      setCurrentUser(user);
      saveToStorage('current_user', user);
    }
    setIsAuthenticated(true);
    saveToStorage('is_authenticated', true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    saveToStorage('is_authenticated', false);
    showToast('Signed Out', 'You have been safely signed out.', 'info');
  };

  const resetToDemoData = () => {
    try {
      const keys = [
        'current_user', 'patients', 'doctors', 'appointments', 'opd',
        'beds', 'ipd', 'prescriptions', 'medicines', 'pharmacy_sales',
        'lab_orders', 'invoices', 'notifications'
      ];
      keys.forEach((k) => localStorage.removeItem(`medipulse_${k}`));
    } catch {
      // ignore
    }
    setCurrentUser(INITIAL_USERS[0]);
    setPatients(INITIAL_PATIENTS);
    setDoctors(INITIAL_DOCTORS);
    setAppointments(INITIAL_APPOINTMENTS);
    setOpdRecords(INITIAL_OPD);
    setBeds(INITIAL_BEDS);
    setIpdAdmissions(INITIAL_IPD);
    setPrescriptions(INITIAL_PRESCRIPTIONS);
    setMedicines(INITIAL_MEDICINES);
    setPharmacySales(INITIAL_PHARMACY_SALES);
    setLabOrders(INITIAL_LAB_ORDERS);
    setInvoices(INITIAL_INVOICES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setIsAuthenticated(true);
    setActiveModuleState('dashboard');
    showToast('Demo Data Loaded', 'Hospital system restored to pristine university demo seed state.', 'success');
  };

  // Collections
  const [patients, setPatients] = useState<Patient[]>(() =>
    loadFromStorage('patients', INITIAL_PATIENTS)
  );
  const [doctors, setDoctors] = useState<Doctor[]>(() =>
    loadFromStorage('doctors', INITIAL_DOCTORS)
  );
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    loadFromStorage('appointments', INITIAL_APPOINTMENTS)
  );
  const [opdRecords, setOpdRecords] = useState<OPDRow[]>(() =>
    loadFromStorage('opd', INITIAL_OPD)
  );
  const [beds, setBeds] = useState<Bed[]>(() =>
    loadFromStorage('beds', INITIAL_BEDS)
  );
  const [ipdAdmissions, setIpdAdmissions] = useState<IPDAdmission[]>(() =>
    loadFromStorage('ipd', INITIAL_IPD)
  );
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() =>
    loadFromStorage('prescriptions', INITIAL_PRESCRIPTIONS)
  );
  const [medicines, setMedicines] = useState<Medicine[]>(() =>
    loadFromStorage('medicines', INITIAL_MEDICINES)
  );
  const [pharmacySales, setPharmacySales] = useState<PharmacySale[]>(() =>
    loadFromStorage('pharmacy_sales', INITIAL_PHARMACY_SALES)
  );
  const [labTests] = useState<LabTest[]>(INITIAL_LAB_TESTS);
  const [labOrders, setLabOrders] = useState<LabOrder[]>(() =>
    loadFromStorage('lab_orders', INITIAL_LAB_ORDERS)
  );
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    loadFromStorage('invoices', INITIAL_INVOICES)
  );
  const [notifications, setNotifications] = useState<HospitalNotification[]>(() =>
    loadFromStorage('notifications', INITIAL_NOTIFICATIONS)
  );

  // Sync to localStorage
  useEffect(() => saveToStorage('current_user', currentUser), [currentUser]);
  useEffect(() => saveToStorage('patients', patients), [patients]);
  useEffect(() => saveToStorage('doctors', doctors), [doctors]);
  useEffect(() => saveToStorage('appointments', appointments), [appointments]);
  useEffect(() => saveToStorage('opd', opdRecords), [opdRecords]);
  useEffect(() => saveToStorage('beds', beds), [beds]);
  useEffect(() => saveToStorage('ipd', ipdAdmissions), [ipdAdmissions]);
  useEffect(() => saveToStorage('prescriptions', prescriptions), [prescriptions]);
  useEffect(() => saveToStorage('medicines', medicines), [medicines]);
  useEffect(() => saveToStorage('pharmacy_sales', pharmacySales), [pharmacySales]);
  useEffect(() => saveToStorage('lab_orders', labOrders), [labOrders]);
  useEffect(() => saveToStorage('invoices', invoices), [invoices]);
  useEffect(() => saveToStorage('notifications', notifications), [notifications]);
  useEffect(() => {
    saveToStorage('dark_mode', isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const showToast = (title: string, message?: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const switchRole = (role: UserRole) => {
    const foundUser = allUsers.find((u) => u.role === role);
    if (foundUser) {
      setCurrentUser(foundUser);
      showToast(`Switched Role`, `Now operating as ${role} (${foundUser.name})`, 'info');
      // If current active module is forbidden for new role, reset to dashboard
      if (!isModuleAllowed(activeModule, role)) {
        setActiveModuleState('dashboard');
      }
    }
  };

  const setActiveModule = (mod: ActiveModule) => {
    if (isModuleAllowed(mod, currentUser.role)) {
      setActiveModuleState(mod);
    } else {
      showToast('Access Denied', `Your role (${currentUser.role}) does not have permission to view ${mod}`, 'error');
    }
  };

  // CRUD Implementations
  const addPatient = (patientData: Omit<Patient, 'id' | 'registeredDate'>): Patient => {
    const newId = `PAT-${1000 + patients.length + 1}`;
    const newPatient: Patient = {
      ...patientData,
      id: newId,
      registeredDate: new Date().toISOString().split('T')[0],
    };
    setPatients((prev) => [newPatient, ...prev]);
    showToast('Patient Registered', `${newPatient.fullName} successfully registered as ${newId}.`);
    return newPatient;
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    showToast('Patient Updated', `Record for ${id} has been saved.`);
  };

  const deletePatient = (id: string) => {
    const target = patients.find((p) => p.id === id);
    setPatients((prev) => prev.filter((p) => p.id !== id));
    showToast('Patient Removed', `Patient record ${target?.fullName || id} has been deleted.`, 'info');
  };

  const addDoctor = (docData: Omit<Doctor, 'id'>): Doctor => {
    const newId = `DOC-${200 + doctors.length + 1}`;
    const newDoc: Doctor = {
      ...docData,
      id: newId,
    };
    setDoctors((prev) => [...prev, newDoc]);
    showToast('Doctor Added', `${newDoc.fullName} (${newDoc.specialization}) added to directory.`);
    return newDoc;
  };

  const updateDoctor = (id: string, updates: Partial<Doctor>) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
    showToast('Doctor Updated', `Profile updated successfully.`);
  };

  const bookAppointment = (apptData: Omit<Appointment, 'id' | 'tokenNumber'>): Appointment => {
    const nextNum = appointments.length + 1;
    const newId = `APT-${3000 + nextNum}`;
    const dayAppointments = appointments.filter(
      (a) => a.appointmentDate === apptData.appointmentDate && a.doctorId === apptData.doctorId
    );
    const tokenNumber = dayAppointments.length + 1;

    const newAppt: Appointment = {
      ...apptData,
      id: newId,
      tokenNumber,
    };
    setAppointments((prev) => [newAppt, ...prev]);
    showToast('Appointment Booked', `Token #${tokenNumber} assigned for ${newAppt.patientName} with ${newAppt.doctorName}.`);
    return newAppt;
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
    showToast('Appointment Updated', `Status updated.`);
  };

  const cancelAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Cancelled' } : a))
    );
    showToast('Appointment Cancelled', `Appointment ${id} has been cancelled.`, 'warning');
  };

  const addOPDConsultation = (opdData: Omit<OPDRow, 'id'>): OPDRow => {
    const newId = `OPD-${4000 + opdRecords.length + 1}`;
    const newOpd: OPDRow = {
      ...opdData,
      id: newId,
    };
    setOpdRecords((prev) => [newOpd, ...prev]);
    showToast('Consultation Recorded', `OPD entry ${newId} recorded for ${newOpd.patientName}.`);
    return newOpd;
  };

  const admitPatientIPD = (admissionData: Omit<IPDAdmission, 'id' | 'admittedTime'>): IPDAdmission => {
    const newId = `IPD-${5000 + ipdAdmissions.length + 1}`;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newAdmission: IPDAdmission = {
      ...admissionData,
      id: newId,
      admittedTime: timeStr,
    };

    setIpdAdmissions((prev) => [newAdmission, ...prev]);
    // Mark bed as occupied
    setBeds((prev) =>
      prev.map((b) =>
        b.id === admissionData.bedId
          ? {
              ...b,
              status: 'Occupied',
              currentPatientId: admissionData.patientId,
              currentPatientName: admissionData.patientName,
              admissionId: newId,
            }
          : b
      )
    );
    // Mark patient status as Inpatient
    setPatients((prev) =>
      prev.map((p) => (p.id === admissionData.patientId ? { ...p, status: 'Inpatient' } : p))
    );

    showToast('Patient Admitted', `${admissionData.patientName} admitted to bed ${admissionData.bedNumber}.`);
    return newAdmission;
  };

  const dischargePatientIPD = (admissionId: string, summary: IPDAdmission['dischargeSummary']) => {
    const admission = ipdAdmissions.find((a) => a.id === admissionId);
    if (!admission) return;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setIpdAdmissions((prev) =>
      prev.map((a) =>
        a.id === admissionId
          ? {
              ...a,
              status: 'Discharged',
              dischargeDate: dateStr,
              dischargeTime: timeStr,
              dischargeSummary: summary,
            }
          : a
      )
    );

    // Free the bed
    setBeds((prev) =>
      prev.map((b) =>
        b.id === admission.bedId
          ? {
              ...b,
              status: 'Available',
              currentPatientId: undefined,
              currentPatientName: undefined,
              admissionId: undefined,
              lastCleaned: `${dateStr} ${timeStr}`,
            }
          : b
      )
    );

    // Update patient status
    setPatients((prev) =>
      prev.map((p) => (p.id === admission.patientId ? { ...p, status: 'Discharged' } : p))
    );

    showToast('Patient Discharged', `${admission.patientName} discharged. Bed ${admission.bedNumber} is now available.`);
  };

  const updateBedStatus = (
    bedId: string,
    status: Bed['status'],
    patientId?: string,
    patientName?: string,
    admissionId?: string
  ) => {
    setBeds((prev) =>
      prev.map((b) =>
        b.id === bedId
          ? {
              ...b,
              status,
              currentPatientId: patientId,
              currentPatientName: patientName,
              admissionId: admissionId,
            }
          : b
      )
    );
    showToast('Bed Status Updated', `Bed status updated to ${status}.`);
  };

  const addPrescription = (rxData: Omit<Prescription, 'id'>): Prescription => {
    const newId = `RX-${6000 + prescriptions.length + 1}`;
    const newRx: Prescription = {
      ...rxData,
      id: newId,
    };
    setPrescriptions((prev) => [newRx, ...prev]);
    showToast('Prescription Created', `Prescription ${newId} issued for ${newRx.patientName}.`);
    return newRx;
  };

  const addMedicine = (medData: Omit<Medicine, 'id'>): Medicine => {
    const newId = `MED-${7000 + medicines.length + 1}`;
    const newMed: Medicine = {
      ...medData,
      id: newId,
    };
    setMedicines((prev) => [newMed, ...prev]);
    showToast('Medicine Added', `${newMed.name} added to pharmacy inventory.`);
    return newMed;
  };

  const updateMedicine = (id: string, updates: Partial<Medicine>) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
    showToast('Medicine Updated', `Stock/Details updated.`);
  };

  const dispenseMedicineSale = (saleData: Omit<PharmacySale, 'id' | 'invoiceNumber'>): PharmacySale => {
    const newId = `PHARM-${8000 + pharmacySales.length + 1}`;
    const invoiceNumber = `PH-INV-${9000 + pharmacySales.length + 1}`;
    const newSale: PharmacySale = {
      ...saleData,
      id: newId,
      invoiceNumber,
    };

    // Deduct stock for each item sold
    setMedicines((prev) =>
      prev.map((med) => {
        const soldItem = saleData.items.find((i) => i.medicineId === med.id);
        if (soldItem) {
          const newQty = Math.max(0, med.stockQuantity - soldItem.quantity);
          return { ...med, stockQuantity: newQty };
        }
        return med;
      })
    );

    setPharmacySales((prev) => [newSale, ...prev]);
    showToast('Sale Completed', `Pharmacy Invoice ${invoiceNumber} issued for $${newSale.totalAmount.toFixed(2)}.`);
    return newSale;
  };

  const createLabOrder = (orderData: Omit<LabOrder, 'id'>): LabOrder => {
    const newId = `LOR-${1000 + labOrders.length + 1}`;
    const newOrder: LabOrder = {
      ...orderData,
      id: newId,
    };
    setLabOrders((prev) => [newOrder, ...prev]);
    showToast('Lab Order Placed', `${newOrder.testName} ordered for ${newOrder.patientName}.`);
    return newOrder;
  };

  const updateLabOrder = (id: string, updates: Partial<LabOrder>) => {
    setLabOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
    );
    showToast('Lab Order Updated', `Lab record updated.`);
  };

  const createInvoice = (invData: Omit<Invoice, 'id' | 'dueAmount'>): Invoice => {
    const newId = `INV-${1200 + invoices.length + 1}`;
    const dueAmount = Math.max(0, invData.totalAmount - invData.paidAmount);
    const newInvoice: Invoice = {
      ...invData,
      id: newId,
      dueAmount,
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    showToast('Invoice Generated', `Invoice ${newId} created for ${newInvoice.patientName} ($${newInvoice.totalAmount.toFixed(2)}).`);
    return newInvoice;
  };

  const recordInvoicePayment = (
    invoiceId: string,
    payment: { amount: number; method: Invoice['paymentHistory'][0]['method']; transactionId?: string }
  ) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invoiceId) return inv;
        const newPaid = inv.paidAmount + payment.amount;
        const newDue = Math.max(0, inv.totalAmount - newPaid);
        const status = newDue === 0 ? 'Paid' : 'Partially Paid';
        const newHistory = [
          ...inv.paymentHistory,
          {
            id: `PAY-${Date.now().toString().slice(-4)}`,
            date: new Date().toISOString().split('T')[0],
            amount: payment.amount,
            method: payment.method,
            transactionId: payment.transactionId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
          },
        ];
        return {
          ...inv,
          paidAmount: newPaid,
          dueAmount: newDue,
          paymentStatus: status,
          paymentHistory: newHistory,
        };
      })
    );
    showToast('Payment Recorded', `Payment of $${payment.amount} recorded for ${invoiceId}.`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Notifications Cleared', 'All notifications marked as read.', 'info');
  };

  return (
    <HospitalContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        allUsers,
        isAuthenticated,
        login,
        logout,
        resetToDemoData,
        activeModule,
        setActiveModule,
        isDarkMode,
        toggleDarkMode,
        globalSearch,
        setGlobalSearch,
        patients,
        doctors,
        appointments,
        opdRecords,
        beds,
        ipdAdmissions,
        prescriptions,
        medicines,
        pharmacySales,
        labTests,
        labOrders,
        invoices,
        notifications,
        toasts,
        showToast,
        removeToast,
        addPatient,
        updatePatient,
        deletePatient,
        addDoctor,
        updateDoctor,
        bookAppointment,
        updateAppointment,
        cancelAppointment,
        addOPDConsultation,
        admitPatientIPD,
        dischargePatientIPD,
        updateBedStatus,
        addPrescription,
        addMedicine,
        updateMedicine,
        dispenseMedicineSale,
        createLabOrder,
        updateLabOrder,
        createInvoice,
        recordInvoicePayment,
        markNotificationRead,
        clearAllNotifications,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
