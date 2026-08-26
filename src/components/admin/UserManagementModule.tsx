import React, { useState } from 'react';
import { User, Role, Department, WorkLocation } from '../../types';
import { EditPersonaModal } from './EditPersonaModal';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  Filter,
  UserCheck,
  Building2,
  MapPin,
  Phone,
  Mail,
  ArrowRightLeft,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { notifySuccess, notifyError } from '../../utils/notifications';

interface UserManagementModuleProps {
  users: User[];
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  onAddUser: (newUser: User) => void;
  onDeleteUser: (userId: number) => void;
  onSwitchUser: (user: User) => void;
}

export const UserManagementModule: React.FC<UserManagementModuleProps> = ({
  users,
  currentUser,
  onUpdateUser,
  onAddUser,
  onDeleteUser,
  onSwitchUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [selectedLocFilter, setSelectedLocFilter] = useState<string>('all');

  // Modal states
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('DSLNG#2026');
  const [newRole, setNewRole] = useState<Role>('user');
  const [newDepartment, setNewDepartment] = useState<Department>('Operations Directorate');
  const [newLocation, setNewLocation] = useState<WorkLocation>('Site Luwuk');
  const [newExtension, setNewExtension] = useState('');

  // Delete confirmation
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Security Check: Only Admin can access
  if (currentUser.role !== 'admin') {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-12 text-center max-w-lg mx-auto shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Hak Akses Dibatasi</h2>
        <p className="text-xs text-slate-600">
          Halaman Manajemen Pengguna & Persona Role hanya dapat diakses dan dikelola oleh akun dengan role <strong>Administrator</strong>.
        </p>
      </div>
    );
  }

  // Filter logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.extension && u.extension.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
    const matchesDept = selectedDeptFilter === 'all' || u.department === selectedDeptFilter;
    const matchesLoc = selectedLocFilter === 'all' || u.work_location === selectedLocFilter;

    return matchesSearch && matchesRole && matchesDept && matchesLoc;
  });

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Administrator ICT',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          dot: 'bg-purple-600',
        };
      case 'it_helpdesk':
        return {
          label: 'IT Helpdesk Officer',
          color: 'bg-sky-100 text-sky-800 border-sky-200',
          dot: 'bg-sky-600',
        };
      case 'leader':
        return {
          label: 'Team Leader',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-600',
        };
      case 'csbo':
        return {
          label: 'CSBO Approver',
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          dot: 'bg-amber-600',
        };
      case 'spmo':
        return {
          label: 'SPMO Executive',
          color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          dot: 'bg-indigo-600',
        };
      default:
        return {
          label: 'Staff / Karyawan',
          color: 'bg-slate-100 text-slate-800 border-slate-200',
          dot: 'bg-slate-500',
        };
    }
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      notifyError('Nama pengguna wajib diisi.');
      return;
    }

    const email = newEmail.trim().toLowerCase();
    if (!email.endsWith('@dslng.com')) {
      notifyError('Email wajib berakhiran domain resmi @dslng.com.');
      return;
    }

    if (users.some((u) => u.email.toLowerCase() === email)) {
      notifyError('Email ini sudah digunakan oleh akun lain.');
      return;
    }

    const newUser: User = {
      id: Date.now(),
      name: newName.trim(),
      email,
      password: newPassword.trim() || 'password123',
      role: newRole,
      department: newDepartment,
      work_location: newLocation,
      extension: newExtension.trim() || 'x1000',
      created_at: new Date().toISOString(),
    };

    onAddUser(newUser);
    notifySuccess(`Pengguna baru "${newUser.name}" dengan role ${newUser.role.toUpperCase()} berhasil ditambahkan!`);
    
    // Reset and close
    setNewName('');
    setNewEmail('');
    setNewExtension('');
    setShowCreateModal(false);
  };

  const confirmDelete = () => {
    if (!userToDelete) return;
    if (userToDelete.id === currentUser.id) {
      notifyError('Anda tidak dapat menghapus akun Administrator yang sedang aktif digunakan.');
      setUserToDelete(null);
      return;
    }

    onDeleteUser(userToDelete.id);
    notifySuccess(`Akun pengguna ${userToDelete.name} berhasil dihapus dari sistem.`);
    setUserToDelete(null);
  };

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const helpdeskCount = users.filter((u) => u.role === 'it_helpdesk').length;
  const approverCount = users.filter((u) => ['leader', 'csbo', 'spmo'].includes(u.role)).length;
  const userCount = users.filter((u) => u.role === 'user').length;

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner with Action */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-700 text-white rounded-2xl shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Manajemen User & Persona Role
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold border border-purple-200">
                Administrator Panel
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Kelola data persona setiap pengguna terdaftar, perbarui level otorisasi RBAC (Admin, Helpdesk, Approver, Karyawan), dan lokasi kerja.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-[#004380] hover:bg-[#003366] text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah User Baru</span>
        </button>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Akun Terdaftar</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{users.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Database aktif portal DSLNG</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Administrator ICT</div>
          <div className="text-2xl font-extrabold text-purple-900 mt-1">{adminCount}</div>
          <div className="text-[10px] text-purple-600 mt-0.5">Akses penuh sistem & security</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">IT Helpdesk & Ops</div>
          <div className="text-2xl font-extrabold text-sky-900 mt-1">{helpdeskCount}</div>
          <div className="text-[10px] text-sky-600 mt-0.5">Site Luwuk & HO Jakarta</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Approver & Staff</div>
          <div className="text-2xl font-extrabold text-emerald-900 mt-1">{approverCount + userCount}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">{approverCount} E-Sign Approver &bull; {userCount} Staff</div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, email, atau extension..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#004380] focus:border-transparent font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Filter Role */}
          <div>
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-[#004380]"
            >
              <option value="all">Semua Role RBAC</option>
              <option value="admin">Administrator ICT</option>
              <option value="it_helpdesk">IT Helpdesk Officer</option>
              <option value="leader">Team Leader</option>
              <option value="csbo">CSBO Approver</option>
              <option value="spmo">SPMO Executive</option>
              <option value="user">Staff / Karyawan</option>
            </select>
          </div>

          {/* Filter Department */}
          <div>
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-[#004380]"
            >
              <option value="all">Semua Direktorat</option>
              <option value="President Directorate">President Directorate</option>
              <option value="Operations Directorate">Operations Directorate</option>
              <option value="Finance Directorate">Finance Directorate</option>
              <option value="Corporate Affairs Director">Corporate Affairs Director</option>
            </select>
          </div>

          {/* Filter Location */}
          <div>
            <select
              value={selectedLocFilter}
              onChange={(e) => setSelectedLocFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-[#004380]"
            >
              <option value="all">Semua Lokasi Kerja</option>
              <option value="Site Luwuk">Site Luwuk (Kilang Batui)</option>
              <option value="HO Jakarta">HO Jakarta (Sentral Senayan II)</option>
            </select>
          </div>

        </div>
      </div>

      {/* 4. Users Table / Persona Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">Daftar Pengguna & Persona Terdaftar</h2>
            <span className="text-xs text-slate-500 font-medium">({filteredUsers.length} pengguna)</span>
          </div>
          <div className="text-[11px] text-purple-700 font-semibold bg-purple-50 px-3 py-1 rounded-lg border border-purple-200">
            Hanya Administrator yang dapat mengedit role pengguna
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-5 font-bold">Karyawan & Persona</th>
                <th className="py-3 px-4 font-bold">Hak Akses Role (RBAC)</th>
                <th className="py-3 px-4 font-bold">Direktorat / Dept</th>
                <th className="py-3 px-4 font-bold">Lokasi Kerja</th>
                <th className="py-3 px-4 font-bold">Extension</th>
                <th className="py-3 px-5 font-bold text-right">Aksi Administrator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ditemukan data pengguna yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleBadge = getRoleBadge(u.role);
                  const isCurrentActive = u.id === currentUser.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 text-xs">{u.name}</span>
                              {isCurrentActive && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  Akun Anda
                                </span>
                              )}
                            </div>
                            <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleBadge.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${roleBadge.dot}`}></span>
                            <span>{roleBadge.label}</span>
                          </span>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{u.department}</span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-[#00A3E0] flex-shrink-0" />
                          <span>{u.work_location}</span>
                        </div>
                      </td>

                      {/* Extension */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md w-fit">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{u.extension || 'x1000'}</span>
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Edit Persona & Role Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg font-bold text-[11px] transition flex items-center gap-1 shadow-2xs"
                            title="Ubah Persona, Role & Hak Akses"
                          >
                            <Shield className="w-3.5 h-3.5 text-purple-600" />
                            <span>Edit Role & Persona</span>
                          </button>

                          {/* Switch Persona Button */}
                          <button
                            type="button"
                            onClick={() => onSwitchUser(u)}
                            className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#004380] border border-sky-200 rounded-lg font-bold text-[11px] transition flex items-center gap-1"
                            title="Beralih ke persona akun ini"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5 text-[#00A3E0]" />
                            <span>Switch</span>
                          </button>

                          {/* Delete Account (protected for primary admin) */}
                          {!isCurrentActive && (
                            <button
                              type="button"
                              onClick={() => setUserToDelete(u)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Hapus akun"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Edit Persona Modal Component */}
      <EditPersonaModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSaveUser={onUpdateUser}
        currentAdmin={currentUser}
      />

      {/* 6. Create New User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50 to-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#004380] text-white rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Tambah Akun Karyawan Baru</h2>
                  <p className="text-xs text-slate-500">Registrasi akun resmi PT Donggi-Senoro LNG</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Andi Pratama"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#004380]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email DSLNG <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="nama@dslng.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#004380] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password Awal</label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#004380] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role RBAC</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as Role)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#004380] font-medium"
                  >
                    <option value="user">Staff / Karyawan</option>
                    <option value="it_helpdesk">IT Helpdesk Officer</option>
                    <option value="leader">Team Leader</option>
                    <option value="csbo">CSBO Approver</option>
                    <option value="spmo">SPMO Executive</option>
                    <option value="admin">Administrator ICT</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lokasi Kerja</label>
                  <select
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value as WorkLocation)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#004380] font-medium"
                  >
                    <option value="Site Luwuk">Site Luwuk</option>
                    <option value="HO Jakarta">HO Jakarta</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Direktorat</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value as Department)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#004380] font-medium"
                  >
                    <option value="President Directorate">President Directorate</option>
                    <option value="Operations Directorate">Operations Directorate</option>
                    <option value="Finance Directorate">Finance Directorate</option>
                    <option value="Corporate Affairs Director">Corporate Affairs Director</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Extension</label>
                  <input
                    type="text"
                    value={newExtension}
                    onChange={(e) => setNewExtension(e.target.value)}
                    placeholder="x1055"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#004380] font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#004380] hover:bg-[#003366] rounded-xl shadow-xs transition"
                >
                  Simpan & Daftarkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Delete Confirmation Dialog */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-red-200 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Akun</h3>
            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus akun pengguna <strong>{userToDelete.name}</strong> ({userToDelete.email})? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl"
              >
                Ya, Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
