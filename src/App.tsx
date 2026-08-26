import React, { useState, useEffect } from 'react';
import {
  User,
  Asset,
  Ticket,
  Attendance,
  LeaveRequest,
  IctDocument,
  UserPreferences,
  Role,
  TicketStatus,
} from './types';
import {
  INITIAL_USERS,
  INITIAL_ASSETS,
  INITIAL_TICKETS,
  INITIAL_ATTENDANCES,
  INITIAL_LEAVES,
  INITIAL_DOCUMENTS,
} from './data/initialData';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { AuthScreens } from './components/auth/AuthScreens';
import { PersonalizeModal } from './components/personalize/PersonalizeModal';
import { DashboardModule } from './components/dashboard/DashboardModule';
import { AssetManagement } from './components/assets/AssetManagement';
import { HelpdeskTicketing } from './components/helpdesk/HelpdeskTicketing';
import { AttendanceModule } from './components/attendance/AttendanceModule';
import { LeaveModule } from './components/leave/LeaveModule';
import { IctProfileModule } from './components/profile/IctProfileModule';
import { UserManagementModule } from './components/admin/UserManagementModule';
import { notifySuccess, notifyError } from './utils/notifications';
import { ShieldAlert, Building2 } from 'lucide-react';

// Helper to ensure every user has all required fields populated
const sanitizeUser = (u: any, fallbackId = 1): User => {
  const defaultRef = INITIAL_USERS.find((x) => x.id === u?.id) || INITIAL_USERS[0];
  return {
    id: typeof u?.id === 'number' ? u.id : fallbackId,
    name: u?.name || defaultRef.name,
    email: u?.email || defaultRef.email,
    password: u?.password || defaultRef.password,
    role: u?.role || defaultRef.role,
    department: u?.department || defaultRef.department,
    work_location: u?.work_location || defaultRef.work_location || 'Site Luwuk',
    extension: u?.extension || defaultRef.extension || 'x1000',
    created_at: u?.created_at || new Date().toISOString(),
    must_change_password: !!u?.must_change_password,
  };
};

export function App() {
  // Authentication & Users State (Single Administrator Default)
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const isUsersCleaned = localStorage.getItem('dslng_user_v9_admin_tina');
      if (!isUsersCleaned) {
        localStorage.setItem('dslng_users', JSON.stringify(INITIAL_USERS));
        localStorage.removeItem('dslng_current_user');
        localStorage.setItem('dslng_user_v9_admin_tina', 'true');
        return INITIAL_USERS;
      }
      const saved = localStorage.getItem('dslng_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((u, idx) => sanitizeUser(u, idx + 1));
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('dslng_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.id) {
          return sanitizeUser(parsed, 1);
        }
      }
    } catch (e) {
      console.error(e);
    }
    return null; // Always show Login page by default
  });

  // Navigation Module
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Modals
  const [showPersonalizeModal, setShowPersonalizeModal] = useState<boolean>(false);

  // Theme Settings & Preferences
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('dslng_preferences');
    return saved
      ? JSON.parse(saved)
      : {
          themeDensity: 'comfortable',
          accentTheme: 'dslng_blue',
          clockFormat: 'both',
          highContrast: false,
        };
  });

  // Core Data Modules State (Clean Initial State - Ready for New User Input)
  // Ensure legacy dummy data is completely cleared from storage
  const [assets, setAssets] = useState<Asset[]>(() => {
    try {
      const isCleared = localStorage.getItem('dslng_clean_v7_final');
      if (!isCleared) {
        localStorage.removeItem('dslng_assets');
        localStorage.removeItem('dslng_tickets');
        localStorage.removeItem('dslng_attendances');
        localStorage.removeItem('dslng_leaves');
        localStorage.removeItem('dslng_documents');
        localStorage.setItem('dslng_clean_v7_final', 'true');
        return [];
      }
      const saved = localStorage.getItem('dslng_assets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const isCleared = localStorage.getItem('dslng_clean_v7_final');
      if (!isCleared) {
        localStorage.removeItem('dslng_tickets');
        return [];
      }
      const saved = localStorage.getItem('dslng_tickets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [attendances, setAttendances] = useState<Attendance[]>(() => {
    try {
      const isCleared = localStorage.getItem('dslng_clean_v7_final');
      if (!isCleared) {
        localStorage.removeItem('dslng_attendances');
        return [];
      }
      const saved = localStorage.getItem('dslng_attendances');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => {
    try {
      const isCleared = localStorage.getItem('dslng_clean_v7_final');
      if (!isCleared) {
        localStorage.removeItem('dslng_leaves');
        return [];
      }
      const saved = localStorage.getItem('dslng_leaves');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [documents, setDocuments] = useState<IctDocument[]>(() => {
    try {
      const isCleared = localStorage.getItem('dslng_clean_v7_final');
      if (!isCleared) {
        localStorage.removeItem('dslng_documents');
        return [];
      }
      const saved = localStorage.getItem('dslng_documents');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('dslng_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('dslng_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('dslng_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('dslng_preferences', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem('dslng_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('dslng_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('dslng_attendances', JSON.stringify(attendances));
  }, [attendances]);

  useEffect(() => {
    localStorage.setItem('dslng_leaves', JSON.stringify(leaves));
  }, [leaves]);

  useEffect(() => {
    localStorage.setItem('dslng_documents', JSON.stringify(documents));
  }, [documents]);

  // Auth Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    notifySuccess(`Selamat datang di Portal ICT DSLNG, ${user.name}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    notifySuccess('Anda telah berhasil keluar dari sistem (Logged Out).');
  };

  const handleRegister = (newUser: User) => {
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
  };

  const handleChangePassword = (userId: number, newPass: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, password: newPass } : u))
    );
    if (currentUser && currentUser.id === userId) {
      setCurrentUser({ ...currentUser, password: newPass });
    }
  };

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    notifySuccess(`Beralih ke persona akun: ${user.name} (${user.role.toUpperCase()})`);
  };

  const handleSwitchPersona = (role: Role) => {
    const matchedUser = users.find((u) => u.role === role);
    if (matchedUser) {
      setCurrentUser(matchedUser);
      notifySuccess(`Beralih ke persona akun: ${matchedUser.name} (${role.toUpperCase()})`);
    }
  };

  // User Management Handlers (Admin Only)
  const handleUpdateUser = (updatedUser: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleAddUser = (newUser: User) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  const handleDeleteUser = (userId: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Asset Handlers
  const handleAddAsset = (asset: Asset) => {
    setAssets((prev) => [asset, ...prev]);
  };

  const handleUpdateAsset = (updated: Asset) => {
    setAssets((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handleDeleteAsset = (id: number) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const handleBulkAddAssets = (newAssets: Asset[]) => {
    setAssets((prev) => [...newAssets, ...prev]);
  };

  // Ticket Handlers
  const handleAddTicket = (ticket: Ticket) => {
    setTickets((prev) => [ticket, ...prev]);
  };

  const handleUpdateTicketStatus = (ticketId: number, status: TicketStatus, notes?: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status,
              resolution_notes: notes || t.resolution_notes,
              updated_at: new Date().toISOString(),
            }
          : t
      )
    );
  };

  const handleDeleteTicket = (ticketId: number) => {
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
  };

  const handleClearAllTickets = () => {
    setTickets([]);
    localStorage.removeItem('dslng_tickets');
  };

  // Attendance Handlers
  const handleAddAttendance = (att: Attendance) => {
    setAttendances((prev) => [att, ...prev]);
  };

  // Leave Handlers
  const handleAddLeave = (leave: LeaveRequest) => {
    setLeaves((prev) => [leave, ...prev]);
  };

  const handleApproveLeaveStep = (
    leaveId: number,
    stepOrder: 1 | 2 | 3,
    approverUser: User,
    signatureData: string,
    notes?: string
  ) => {
    setLeaves((prev) =>
      prev.map((leave) => {
        if (leave.id !== leaveId) return leave;

        const updatedApprovals = leave.approvals.map((app) => {
          if (app.step_order === stepOrder) {
            return {
              ...app,
              approver_id: approverUser.id,
              approver_name: approverUser.name,
              status: 'Approved' as const,
              signature_data: signatureData,
              notes: notes || undefined,
              approved_at: new Date().toISOString(),
            };
          }
          return app;
        });

        // Determine if all steps finished or advance next step
        const isFinalStep = stepOrder === 3;
        const nextStep = isFinalStep ? 3 : ((stepOrder + 1) as 1 | 2 | 3);
        const newOverallStatus = isFinalStep ? ('Approved' as const) : ('Pending' as const);

        return {
          ...leave,
          approvals: updatedApprovals,
          current_step: nextStep,
          status: newOverallStatus,
        };
      })
    );
  };

  // Document Handlers
  const handleAddDocument = (doc: IctDocument) => {
    setDocuments((prev) => [doc, ...prev]);
  };

  // If not logged in, show Auth Screens
  if (!currentUser) {
    return (
      <AuthScreens
        users={users}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  // RBAC Permission Check for Active Module
  const isModuleAllowed = () => {
    const role = currentUser?.role || 'user';
    if (activeModule === 'assets') {
      return role === 'admin' || role === 'it_helpdesk';
    }
    if (activeModule === 'attendance') {
      return role === 'admin' || role === 'it_helpdesk';
    }
    if (activeModule === 'admin_users') {
      return role === 'admin';
    }
    if (activeModule === 'leave') {
      return role === 'admin' || role === 'it_helpdesk' || ['leader', 'csbo', 'spmo'].includes(role);
    }
    return true; // dashboard, helpdesk, profile allowed for all
  };

  const openTicketsCount = tickets.filter((t) => t.status === 'Open').length;
  const inProgressTicketsCount = tickets.filter((t) => t.status === 'In Progress').length;
  const pendingLeavesCount = leaves.filter((l) => l.status === 'Pending').length;

  return (
    <div className={`min-h-screen bg-slate-100 flex flex-col font-sans`}>
      
      {/* Top Application Header */}
      <Header
        currentUser={currentUser}
        preferences={preferences}
        activeModule={activeModule}
        onNavigate={(mod) => setActiveModule(mod)}
        onOpenPersonalize={() => setShowPersonalizeModal(true)}
        onLogout={handleLogout}
      />

      {/* Main Body Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Navigation Sidebar */}
        <Sidebar
          currentRole={currentUser?.role || 'user'}
          activeModule={activeModule}
          onSelectModule={(mod) => setActiveModule(mod)}
          badgeCounts={{
            ticketsOpen: openTicketsCount,
            leavesPending: pendingLeavesCount,
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Content View Canvas */}
        <main className={`flex-1 overflow-y-auto ${preferences.themeDensity === 'compact' ? 'p-4' : 'p-6 sm:p-8'}`}>
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Quick Status Notice for Users with Restrictive Roles */}
            {currentUser?.role === 'user' && activeModule === 'helpdesk' && (
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 flex items-center gap-3 text-xs text-[#004380]">
                <Building2 className="w-5 h-5 text-[#00A3E0] flex-shrink-0" />
                <div>
                  <span className="font-bold">Mode Akun Karyawan ({currentUser?.department || '-'}):</span> Anda dapat membuat pengaduan ICT, melacak status perbaikan, dan mengunduh berkas kebijakan IT resmi.
                </div>
              </div>
            )}

            {/* Module Render Routing with Access Guard */}
            {!isModuleAllowed() ? (
              <div className="bg-white rounded-2xl p-12 border border-red-200 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Akses Terbatas (Restricted Area)</h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Modul ini memerlukan izin khusus sesuai Matriks RBAC DSLNG. Silakan beralih ke persona Administrator/Staff yang berwenang atau pilih modul lain.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModule('dashboard')}
                    className="px-4 py-2 bg-[#004380] text-white text-xs font-bold rounded-xl"
                  >
                    Kembali ke Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Module 0: Executive Dashboard */}
                {activeModule === 'dashboard' && (
                  <DashboardModule
                    currentUser={currentUser}
                    assets={assets}
                    tickets={tickets}
                    attendances={attendances}
                    leaves={leaves}
                    onNavigate={(mod) => setActiveModule(mod)}
                  />
                )}

                {/* Module 2: Asset Management */}
                {activeModule === 'assets' && (
                  <AssetManagement
                    assets={assets}
                    users={users}
                    currentUser={currentUser}
                    currentRole={currentUser.role}
                    onAddAsset={handleAddAsset}
                    onUpdateAsset={handleUpdateAsset}
                    onDeleteAsset={handleDeleteAsset}
                    onAddBatchAssets={handleBulkAddAssets}
                    onBulkAddAssets={handleBulkAddAssets}
                  />
                )}

                {/* Module 3: Helpdesk Ticketing */}
                {activeModule === 'helpdesk' && (
                  <HelpdeskTicketing
                    tickets={tickets}
                    users={users}
                    currentUser={currentUser}
                    onAddTicket={handleAddTicket}
                    onUpdateTicketStatus={handleUpdateTicketStatus}
                    onDeleteTicket={handleDeleteTicket}
                    onClearAllTickets={handleClearAllTickets}
                  />
                )}

                {/* Module 4: Attendance with Camera & GPS */}
                {activeModule === 'attendance' && (
                  <AttendanceModule
                    attendances={attendances}
                    currentUser={currentUser}
                    onAddAttendance={handleAddAttendance}
                  />
                )}

                {/* Module 4: Leave Request with 3-Step E-Sign */}
                {activeModule === 'leave' && (
                  <LeaveModule
                    leaves={leaves}
                    currentUser={currentUser}
                    onAddLeave={handleAddLeave}
                    onApproveStep={handleApproveLeaveStep}
                  />
                )}

                {/* Module 5: ICT Profile & Policies */}
                {activeModule === 'profile' && (
                  <IctProfileModule
                    documents={documents}
                    currentUser={currentUser}
                    onAddDocument={handleAddDocument}
                  />
                )}

                {/* Module: Admin User Management */}
                {activeModule === 'admin_users' && (
                  <UserManagementModule
                    users={users}
                    currentUser={currentUser}
                    onUpdateUser={handleUpdateUser}
                    onAddUser={handleAddUser}
                    onDeleteUser={handleDeleteUser}
                    onSwitchUser={handleSwitchUser}
                  />
                )}
              </>
            )}

          </div>
        </main>
      </div>

      {/* Personalize View & Theme Settings Modal */}
      <PersonalizeModal
        isOpen={showPersonalizeModal}
        onClose={() => setShowPersonalizeModal(false)}
        preferences={preferences}
        onUpdatePreferences={(newPrefs) => setPreferences(newPrefs)}
      />

    </div>
  );
}

export default App;
