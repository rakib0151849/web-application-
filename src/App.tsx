import React, { useState } from 'react';
import { HospitalProvider, useHospital } from './context/HospitalContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { ToastContainer } from './components/common/ToastContainer';

// All Hospital Views
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { PatientsView } from './views/PatientsView';
import { DoctorsView } from './views/DoctorsView';
import { AppointmentsView } from './views/AppointmentsView';
import { OPDView } from './views/OPDView';
import { IPDView } from './views/IPDView';
import { BedsView } from './views/BedsView';
import { PrescriptionsView } from './views/PrescriptionsView';
import { PharmacyView } from './views/PharmacyView';
import { LaboratoryView } from './views/LaboratoryView';
import { BillingView } from './views/BillingView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

const HospitalAppContent: React.FC = () => {
  const { isAuthenticated, activeModule, setActiveModule, login, logout } = useHospital();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleQuickAction = (action: string) => {
    if (action === 'new-patient') setActiveModule('patients');
    else if (action === 'book-appointment') setActiveModule('appointments');
    else if (action === 'new-consultation') setActiveModule('opd');
    else if (action === 'create-bill') setActiveModule('billing');
  };

  if (!isAuthenticated) {
    return (
      <>
        <AuthView onLoginSuccess={() => login()} />
        <ToastContainer />
      </>
    );
  }

  const renderActiveView = () => {
    switch (activeModule) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={(mod) => setActiveModule(mod as any)}
            onOpenQuickAction={handleQuickAction}
          />
        );
      case 'patients':
        return <PatientsView />;
      case 'doctors':
        return <DoctorsView />;
      case 'appointments':
        return <AppointmentsView />;
      case 'opd':
        return <OPDView />;
      case 'ipd':
        return <IPDView />;
      case 'beds':
        return <BedsView />;
      case 'prescriptions':
        return <PrescriptionsView />;
      case 'pharmacy':
        return <PharmacyView />;
      case 'laboratory':
        return <LaboratoryView />;
      case 'billing':
        return <BillingView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Role-filtered responsive Navigation Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sticky Top Header with Global Search, Notifications, Role Indicator */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenQuickAction={handleQuickAction}
          onLogout={logout}
        />

        {/* Scrollable Clinical View Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pb-12">{renderActiveView()}</div>
        </main>
      </div>

      {/* Real-time notification toast system */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <HospitalProvider>
      <HospitalAppContent />
    </HospitalProvider>
  );
}
