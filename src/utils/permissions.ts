import { UserRole, ActiveModule } from '../types';

export interface ModulePermission {
  module: ActiveModule;
  label: string;
  iconName: string;
  allowedRoles: UserRole[];
  group: 'Overview' | 'Clinical Care' | 'Diagnostics & Pharmacy' | 'Finance & Admin';
  badgeKey?: 'appointments' | 'beds' | 'pharmacyAlerts' | 'labPending';
}

export const MODULE_DEFINITIONS: ModulePermission[] = [
  {
    module: 'dashboard',
    label: 'Dashboard',
    iconName: 'LayoutDashboard',
    allowedRoles: [
      'Super Admin',
      'Hospital Admin',
      'Doctor',
      'Nurse',
      'Receptionist',
      'Pharmacist',
      'Lab Technician',
      'Accountant',
      'Patient',
    ],
    group: 'Overview',
  },
  {
    module: 'patients',
    label: 'Patient Management',
    iconName: 'Users',
    allowedRoles: ['Super Admin', 'Hospital Admin', 'Doctor', 'Nurse', 'Receptionist'],
    group: 'Clinical Care',
  },
  {
    module: 'doctors',
    label: 'Doctor Management',
    iconName: 'Stethoscope',
    allowedRoles: ['Super Admin', 'Hospital Admin', 'Doctor', 'Receptionist', 'Patient'],
    group: 'Clinical Care',
  },
  {
    module: 'appointments',
    label: 'Appointments',
    iconName: 'CalendarCheck',
    allowedRoles: ['Super Admin', 'Hospital Admin', 'Doctor', 'Nurse', 'Receptionist', 'Patient'],
    group: 'Clinical Care',
    badgeKey: 'appointments',
  },
  {
    module: 'opd',
    label: 'OPD (Outpatient)',
    iconName: 'FileHeart',
    allowedRoles: ['Super Admin', 'Hospital Admin', 'Doctor', 'Nurse'],
    group: 'Clinical Care',
  },
  {
    module: 'ipd',
    label: 'IPD (Inpatient)',
    iconName: 'BedSingle',
    allowedRoles: ['Super Admin', 'Hospital Admin', 'Doctor', 'Nurse'],
    group: 'Clinical Care',
  },
  {
    module: 'beds',
    label: 'Bed Management',
    iconName: 'Hotel',
    allowedRoles: ['Super Admin', 'Hospital Admin', 'Nurse', 'Receptionist'],
    group: 'Clinical Care',
    badgeKey: 'beds',
  },
  {
    module: 'prescriptions',
    label: 'Prescriptions',
    iconName: 'FileText',
    allowedRoles: ['Super Admin', 'Hospital Admin', 'Doctor', 'Pharmacist', 'Patient'],
    group: 'Diagnostics & Pharmacy',
  },
  {
    module: 'pharmacy',
    label: 'Pharmacy',
    iconName: 'Pill',
    allowedRoles: ['Super Admin', 'Hospital Admin', 'Pharmacist'],
    group: 'Diagnostics & Pharmacy',
    badgeKey: 'pharmacyAlerts',
  },
  {
    module: 'laboratory',
    label: 'Laboratory',
    iconName: 'FlaskConical',
    allowedRoles: ['Super Admin', 'Hospital Admin', 'Doctor', 'Lab Technician', 'Patient'],
    group: 'Diagnostics & Pharmacy',
    badgeKey: 'labPending',
  },
  {
    module: 'billing',
    label: 'Billing & Invoices',
    iconName: 'Receipt',
    allowedRoles: ['Super Admin', 'Hospital Admin', 'Accountant', 'Receptionist', 'Patient'],
    group: 'Finance & Admin',
  },
  {
    module: 'reports',
    label: 'Reports & Analytics',
    iconName: 'BarChart3',
    allowedRoles: ['Super Admin', 'Hospital Admin', 'Accountant', 'Pharmacist', 'Lab Technician'],
    group: 'Finance & Admin',
  },
  {
    module: 'settings',
    label: 'Hospital Settings',
    iconName: 'Settings',
    allowedRoles: ['Super Admin', 'Hospital Admin'],
    group: 'Finance & Admin',
  },
];

export function isModuleAllowed(module: ActiveModule, role: UserRole): boolean {
  const def = MODULE_DEFINITIONS.find((m) => m.module === module);
  if (!def) return false;
  return def.allowedRoles.includes(role);
}

export function getAllowedModules(role: UserRole): ModulePermission[] {
  return MODULE_DEFINITIONS.filter((m) => m.allowedRoles.includes(role));
}
