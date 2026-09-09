import React from 'react';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarCheck,
  FileHeart,
  BedSingle,
  Hotel,
  FileText,
  Pill,
  FlaskConical,
  Receipt,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  HeartPulse,
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { getAllowedModules } from '../../utils/permissions';
import { ActiveModule } from '../../types';

interface SidebarProps {
  isOpen?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
}

const ICON_COMPONENTS: Record<string, React.FC<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarCheck,
  FileHeart,
  BedSingle,
  Hotel,
  FileText,
  Pill,
  FlaskConical,
  Receipt,
  BarChart3,
  Settings,
};

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  isCollapsed = false,
  onToggleCollapse = () => {},
  onCloseMobile = () => {},
}) => {
  const {
    currentUser,
    activeModule,
    setActiveModule,
    appointments,
    beds,
    medicines,
    labOrders,
  } = useHospital();

  const allowedModules = getAllowedModules(currentUser.role);

  // Dynamic badges
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingAppointments = appointments.filter(
    (a) => a.appointmentDate === todayStr && a.status === 'Scheduled'
  ).length;
  const availableBeds = beds.filter((b) => b.status === 'Available').length;
  const lowStockCount = medicines.filter((m) => m.stockQuantity <= m.minThreshold).length;
  const pendingLabOrders = labOrders.filter(
    (o) => o.sampleStatus === 'Pending Collection' || o.sampleStatus === 'Processing'
  ).length;

  const getBadgeValue = (key?: string) => {
    switch (key) {
      case 'appointments':
        return pendingAppointments > 0 ? pendingAppointments : null;
      case 'beds':
        return availableBeds > 0 ? `${availableBeds} free` : null;
      case 'pharmacyAlerts':
        return lowStockCount > 0 ? `${lowStockCount} alert` : null;
      case 'labPending':
        return pendingLabOrders > 0 ? pendingLabOrders : null;
      default:
        return null;
    }
  };

  // Group modules
  const groups = ['Overview', 'Clinical Care', 'Diagnostics & Pharmacy', 'Finance & Admin'] as const;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-72`}
      >
        {/* Top Header in Sidebar */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-600/20">
              <HeartPulse className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="leading-tight">
                <div className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                  MediPulse Clinical
                </div>
                <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold uppercase tracking-wider">
                  Health System
                </div>
              </div>
            )}
          </div>

          {/* Close for mobile, collapse toggle for desktop */}
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close mobile sidebar"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar navigation' : 'Collapse sidebar navigation'}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Role Card inside Sidebar */}
        {!isCollapsed ? (
          <div className="mx-3 my-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.role.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-800 dark:text-white truncate">
                {currentUser.role}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {allowedModules.length} Modules Authorized
              </div>
            </div>
          </div>
        ) : (
          <div className="my-3 flex justify-center">
            <span className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
              {currentUser.role.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {groups.map((group) => {
            const groupModules = allowedModules.filter((m) => m.group === group);
            if (groupModules.length === 0) return null;

            return (
              <div key={group}>
                {!isCollapsed && (
                  <h5 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    {group}
                  </h5>
                )}
                <div className="space-y-0.5">
                  {groupModules.map((item) => {
                    const Icon = ICON_COMPONENTS[item.iconName] || LayoutDashboard;
                    const isActive = activeModule === item.module;
                    const badge = getBadgeValue(item.badgeKey);

                    return (
                      <button
                        key={item.module}
                        type="button"
                        onClick={() => {
                          setActiveModule(item.module as ActiveModule);
                          onCloseMobile();
                        }}
                        title={item.label}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        {!isCollapsed && (
                          <span className="flex-1 text-left truncate">{item.label}</span>
                        )}
                        {!isCollapsed && badge && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : item.badgeKey === 'pharmacyAlerts'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            }`}
                          >
                            {badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info in Sidebar */}
        {!isCollapsed && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
            MediPulse HMS • v3.4 Enterprise
          </div>
        )}
      </aside>
    </>
  );
};
