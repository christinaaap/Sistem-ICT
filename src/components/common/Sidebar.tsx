import React from 'react';
import { Role } from '../../types';
import {
  LayoutDashboard,
  Server,
  Headphones,
  Camera,
  FileCheck2,
  BookOpen,
  Users,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentRole: Role;
  activeModule: string;
  onSelectModule: (module: string) => void;
  badgeCounts?: {
    ticketsOpen?: number;
    leavesPending?: number;
  };
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeModule,
  onSelectModule,
  badgeCounts = { ticketsOpen: 0, leavesPending: 0 },
  collapsed = false,
  onToggleCollapse,
}) => {
  // Determine accessible navigation items based on RBAC matrix
  const canAccessAdmin = currentRole === 'admin';
  const canAccessAssets = currentRole === 'admin' || currentRole === 'it_helpdesk';
  const canAccessHelpdesk = currentRole === 'admin' || currentRole === 'it_helpdesk' || currentRole === 'user';
  const canAccessAttendance = currentRole === 'admin' || currentRole === 'it_helpdesk';
  const canAccessLeave = currentRole === 'admin' || currentRole === 'it_helpdesk' || ['leader', 'csbo', 'spmo'].includes(currentRole);
  const canAccessProfile = true; // All roles

  const ticketsOpen = badgeCounts?.ticketsOpen ?? 0;
  const leavesPending = badgeCounts?.leavesPending ?? 0;

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      show: true,
      description: 'Overview sistem & metrik',
    },
    {
      id: 'profile',
      label: 'ICT Profile',
      icon: BookOpen,
      show: canAccessProfile,
      description: 'Policy & Work Instruction PDF',
    },
    {
      id: 'helpdesk',
      label: 'System Ticketing',
      icon: Headphones,
      show: canAccessHelpdesk,
      badge: ticketsOpen > 0 ? `${ticketsOpen} Open` : undefined,
      badgeColor: 'bg-amber-500',
      description: 'Tiket & filter direktorat',
    },
    {
      id: 'assets',
      label: 'Data Asset',
      icon: Server,
      show: canAccessAssets,
      badge: 'Bulk Import',
      description: 'Inventaris Laptop, PC, Monitor',
    },
    {
      id: 'attendance',
      label: 'Attandance Helpdesk',
      icon: Camera,
      show: canAccessAttendance,
      description: currentRole === 'admin' ? 'Log koordinat & foto' : 'Clock-in dengan kamera & lokasi',
    },
    {
      id: 'leave',
      label: 'Leave Request & E-Sign',
      icon: FileCheck2,
      show: canAccessLeave,
      badge: leavesPending > 0 ? `${leavesPending} Pending` : undefined,
      badgeColor: 'bg-sky-500',
      description: 'Persetujuan berjenjang digital',
    },
    {
      id: 'admin_users',
      label: 'Manajemen User & Role',
      icon: Users,
      show: canAccessAdmin,
      badge: 'Admin Only',
      badgeColor: 'bg-purple-600',
      description: 'Role RBAC & lokasi kerja',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800 select-none">
      
      {/* Navigation section */}
      <div className="p-4 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3 px-3">
          MODUL UTAMA SISTEM
        </div>

        <nav className="space-y-1">
          {menuItems
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectModule(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-[#004380] to-[#00A3E0] text-white shadow-md'
                      : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#00A3E0]'
                      }`}
                    />
                    <span className="text-left font-medium">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full text-white ${
                        item.badgeColor || 'bg-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </nav>

        {/* Role Access Guide box */}
        <div className="mt-8 p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs">
          <div className="flex items-center gap-2 text-slate-200 font-semibold mb-1">
            <Shield className="w-3.5 h-3.5 text-[#00A3E0]" />
            <span>Hak Akses Aktif</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Anda login sebagai{' '}
            <span className="font-bold text-[#00A3E0] uppercase">{currentRole.replace('_', ' ')}</span>. Menu yang tampil disesuaikan otomatis dengan Matriks RBAC DSLNG.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/40">
        <div className="font-semibold text-slate-300">PT Donggi-Senoro LNG</div>
        <div className="text-[10px] text-slate-400">ICT Operations & Infrastructure</div>
        <div className="text-[9px] text-slate-400 font-mono mt-1">Build v2.6.4 &bull; 2026</div>
      </div>
    </aside>
  );
};
