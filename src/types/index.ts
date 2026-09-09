export type UserRole =
  | 'Super Admin'
  | 'Hospital Admin'
  | 'Doctor'
  | 'Nurse'
  | 'Receptionist'
  | 'Pharmacist'
  | 'Lab Technician'
  | 'Accountant'
  | 'Patient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  phone?: string;
  patientId?: string; // If role is Patient
  doctorId?: string;  // If role is Doctor
}

export interface Patient {
  id: string; // e.g., PAT-1001
  fullName: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string; // YYYY-MM-DD
  age: number;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  allergies: string[];
  medicalHistory: string[];
  insuranceProvider?: string;
  insuranceNumber?: string;
  registeredDate: string;
  status: 'Active' | 'Discharged' | 'Inpatient' | 'Outpatient';
}

export interface Doctor {
  id: string; // e.g., DOC-201
  fullName: string;
  gender: 'Male' | 'Female';
  specialization: string;
  department: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  phone: string;
  email: string;
  roomNumber: string;
  availabilitySchedule: {
    days: string[]; // e.g., ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    startTime: string; // '09:00'
    endTime: string;   // '17:00'
  };
  status: 'Available' | 'In Consultation' | 'On Leave' | 'Emergency';
}

export type AppointmentStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show';

export interface Appointment {
  id: string; // e.g., APT-3001
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // e.g., '10:30 AM'
  tokenNumber: number;
  type: 'General Checkup' | 'Follow-up' | 'Specialist Consultation' | 'Emergency';
  status: AppointmentStatus;
  symptoms: string;
  notes?: string;
  consultationFee: number;
}

export interface VitalSigns {
  bpSystolic: number;
  bpDiastolic: number;
  pulse: number; // bpm
  temperature: number; // Fahrenheit
  spO2: number; // %
  respiratoryRate: number; // breaths/min
  weight: number; // kg
  height: number; // cm
  bloodPressure?: string;
  heartRate?: number;
}

export interface OPDRow {
  id: string; // e.g., OPD-4001
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  visitDate: string;
  consultationDate?: string;
  tokenNumber: number;
  symptoms: string[];
  diagnosis: string;
  vitals: VitalSigns;
  treatmentNotes: string;
  prescriptionId?: string;
  followUpDate?: string;
  status: 'Waiting' | 'Consulting' | 'Completed';
}

export type OPDConsultation = OPDRow;

export type WardType = 'General' | 'ICU' | 'Emergency' | 'Maternity' | 'Pediatric' | 'Deluxe' | 'General Ward' | 'Deluxe Suite';
export type BedCategory = WardType;
export type BedStatus = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';

export interface Bed {
  id: string; // e.g., BED-101
  bedNumber: string;
  ward: WardType;
  roomNumber: string;
  floor: string;
  status: BedStatus;
  dailyRate: number;
  dailyCharge?: number;
  currentPatientId?: string;
  currentPatientName?: string;
  occupiedByPatientId?: string;
  occupiedByPatientName?: string;
  admissionId?: string;
  lastCleaned?: string;
}

export interface IPDAdmission {
  id: string; // e.g., IPD-5001
  patientId: string;
  patientName: string;
  bedId: string;
  bedNumber: string;
  ward: WardType;
  roomNumber: string;
  admittedDate: string;
  admissionDate?: string;
  admittedTime: string;
  attendingDoctorId: string;
  attendingDoctorName: string;
  doctorName?: string;
  admissionReason: string;
  diagnosisAtAdmission: string;
  provisionalDiagnosis?: string;
  conditionAtDischarge?: string;
  status: 'Admitted' | 'Discharged' | 'Transferred';
  dischargeDate?: string;
  dischargeTime?: string;
  dischargeSummary?: {
    finalDiagnosis: string;
    treatmentGiven: string;
    conditionAtDischarge: 'Cured' | 'Improved' | 'Stable' | 'Referred';
    adviceOnDischarge: string;
    followUpDate?: string;
  };
}

export interface PrescriptionItem {
  medicineId?: string;
  medicineName: string;
  dosage: string; // e.g., '500mg'
  frequency: string;
  timing?: string;
  durationDays?: number;
  instructions?: string;
}

export interface Prescription {
  id: string; // e.g., RX-6001
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization?: string;
  date: string;
  diagnosis: string;
  vitalsSummary?: string;
  items: PrescriptionItem[];
  followUpDate?: string;
  notes?: string;
}

export interface Medicine {
  id: string; // e.g., MED-7001
  name: string;
  genericName: string;
  category: string;
  dosageForm?: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Ointment' | 'Drops' | string;
  batchNumber: string;
  expiryDate: string; // YYYY-MM-DD
  supplier?: string;
  manufacturer?: string;
  stockQuantity: number;
  minThreshold: number; // for low stock alert
  purchasePrice?: number;
  costPrice?: number;
  sellingPrice?: number;
  unitPrice?: number;
  locationRack?: string;
  rackLocation?: string;
}

export interface PharmacySaleItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PharmacySale {
  id: string; // e.g., PHARM-8001
  invoiceNumber?: string;
  patientId?: string;
  patientName: string;
  saleDate: string;
  items: PharmacySaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paymentMethod?: string;
  pharmacistName: string;
}

export interface LabTestCategory {
  id: string;
  name: string;
  description: string;
}

export interface LabTest {
  id: string; // e.g., LAB-9001
  testName?: string;
  name: string;
  categoryId?: string;
  category?: string;
  categoryName?: string;
  price: number;
  sampleRequired?: 'Blood' | 'Urine' | 'Serum' | 'Swab' | 'Stool' | 'Tissue' | 'Imaging' | string;
  turnaroundTimeHours?: number;
  normalRange?: string;
  referenceRange?: string;
  unit?: string;
}

export type LabTestType = LabTest;

export interface LabOrder {
  id: string; // e.g., LOR-1001
  patientId: string;
  patientName: string;
  doctorId?: string;
  doctorName: string;
  testId?: string;
  testName: string;
  testCategory: string;
  orderDate: string;
  sampleStatus: 'Pending Collection' | 'Sample Collected' | 'Processing' | 'Report Ready';
  sampleCollectedDate?: string;
  resultValue?: string;
  unit?: string;
  referenceRange?: string;
  findings?: string;
  isAbnormal?: boolean;
  technicianName?: string;
  completedDate?: string;
  price: number;
  resultDate?: string;
}

export interface BillItem {
  id?: string;
  description: string;
  category?: string;
  quantity?: number;
  unitPrice?: number;
  amount: number;
}

export type InvoiceItem = BillItem;

export interface Invoice {
  id: string; // e.g., INV-1201
  patientId: string;
  patientName: string;
  patientPhone?: string;
  invoiceDate: string;
  dueDate: string;
  items: BillItem[];
  subtotal: number;
  discount: number;
  taxRate?: number; // percentage, e.g. 5
  tax?: number;
  taxAmount?: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: 'Paid' | 'Partially Paid' | 'Unpaid';
  paymentMethod?: 'Cash' | 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'Insurance' | 'UPI' | string;
  paymentHistory?: {
    id: string;
    date: string;
    amount: number;
    method: 'Cash' | 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'Insurance' | 'UPI';
    transactionId?: string;
  }[];
}

export interface HospitalNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'warning' | 'info' | 'success' | 'danger';
  read: boolean;
  linkModule?: string;
}

export type ActiveModule =
  | 'dashboard'
  | 'patients'
  | 'doctors'
  | 'appointments'
  | 'opd'
  | 'ipd'
  | 'beds'
  | 'prescriptions'
  | 'pharmacy'
  | 'laboratory'
  | 'billing'
  | 'reports'
  | 'settings';
