import React, { useState, useEffect } from 'react';
import { User, UserPreferences } from '../../types';
import { DslngLogo } from './DslngLogo';
import {
  LogOut,
  Sliders,
  Building,
  MapPin,
  Users,
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  allUsers?: User[];
  onSwitchUser?: (user: User) => void;
  onLogout: () => void;
  onOpenPersonalize: () => void;
  preferences: UserPreferences;
  activeModule: string;
  onNavigate?: (module: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  onLogout,
  onOpenPersonalize,
  preferences,
  activeModule,
  onNavigate,
}) => {
  const [timeWIB, setTimeWIB] = useState('');
  const [timeWITA, setTimeWITA] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      // WIB = UTC+7 (Jakarta)
      const wibStr = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);

      // WITA = UTC+8 (Luwuk, Banggai)
      const witaStr = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Makassar',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);

      setTimeWIB(wibStr);
      setTimeWITA(witaStr);
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'it_helpdesk':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'leader':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'csbo':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'spmo':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator ICT';
      case 'it_helpdesk':
        return 'IT Helpdesk Officer';
      case 'leader':
        return 'Team Leader';
      case 'csbo':
        return 'CSBO Approver';
      case 'spmo':
        return 'SPMO Executive';
      default:
        return 'Staff / Karyawan';
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Current Module Title */}
          <div className="flex items-center gap-6">
            <DslngLogo variant="white" size="md" />
            <div className="hidden lg:block h-6 w-px bg-slate-700"></div>
            <div className="hidden md:flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                DSLNG ICT PORTAL
              </span>
              <span className="text-xs font-bold text-sky-400">
                {(currentUser?.work_location || 'Site Luwuk') === 'Site Luwuk' ? 'Kilang LNG Batui, Site Luwuk' : 'Head Office Jakarta'}
              </span>
            </div>
          </div>

          {/* Center: Live Plant Clocks (WITA vs WIB) */}
          <div className="hidden xl:flex items-center gap-4 bg-slate-800/80 border border-slate-700/80 px-3.5 py-1.5 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-slate-300">Site Luwuk (WITA):</span>
              <span className="font-mono font-bold text-sky-400">{timeWITA || '00:00:00'}</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">HO Jakarta (WIB):</span>
              <span className="font-mono font-bold text-slate-200">{timeWIB || '00:00:00'}</span>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5">
            
            {/* Personalize Button */}
            <button
              type="button"
              onClick={onOpenPersonalize}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Personalisasi Tampilan & Font"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Current User Badge & Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-slate-700 hover:border-[#00A3E0] hover:bg-slate-800 transition"
              >
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-100 leading-tight max-w-[130px] truncate">
                    {currentUser?.name || 'User'}
                  </span>
                  <span className="text-[10px] text-sky-400 font-semibold flex items-center justify-end gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                    {currentUser?.extension || 'x1000'} &bull; {currentUser?.work_location || 'Site Luwuk'}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#004380] to-[#00A3E0] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {(currentUser?.name || 'U').charAt(0)}
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 rounded-t-xl">
                    <div className="text-xs font-bold text-slate-900">{currentUser?.name || 'User'}</div>
                    <div className="text-[11px] text-slate-500">{currentUser?.email || ''}</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getRoleBadgeColor(currentUser?.role || 'user')}`}>
                        {getRoleLabel(currentUser?.role || 'user')}
                      </span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 font-medium px-2 py-0.5 rounded">
                        Ext: {currentUser?.extension || 'x1000'}
                      </span>
                    </div>
                  </div>

                  <div className="px-4 py-2 text-xs text-slate-600 space-y-1.5 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-[11px]">
                      <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{currentUser?.department || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{currentUser?.work_location || 'Site Luwuk'}</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    {currentUser?.role === 'admin' && onNavigate && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate('admin_users');
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-purple-700 hover:bg-purple-50 flex items-center gap-2 font-semibold"
                      >
                        <Users className="w-3.5 h-3.5 text-purple-600" />
                        <span>Kelola Persona & User</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenPersonalize();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                    >
                      <Sliders className="w-3.5 h-3.5 text-slate-500" />
                      <span>Preferensi Tampilan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
