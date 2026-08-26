import React, { useState, useEffect } from 'react';
import { User, Role, Department, WorkLocation } from '../../types';
import {
  X,
  Shield,
  User as UserIcon,
  Mail,
  Building2,
  MapPin,
  Phone,
  KeyRound,
  Check,
  AlertCircle,
  Sparkles,
  Lock,
} from 'lucide-react';
import { notifySuccess, notifyError } from '../../utils/notifications';

interface EditPersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSaveUser: (updatedUser: User) => void;
  currentAdmin: User;
}

export const EditPersonaModal: React.FC<EditPersonaModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveUser,
  currentAdmin,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('user');
  const [department, setDepartment] = useState<Department>('Operations Directorate');
  const [workLocation, setWorkLocation] = useState<WorkLocation>('Site Luwuk');
  const [extension, setExtension] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setDepartment(user.department);
      setWorkLocation(user.work_location);
      setExtension(user.extension || '');
      setNewPassword('');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  // Strict check: Only Admin can perform this action
  if (currentAdmin.role !== 'admin') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-red-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Akses Ditolak</h3>
          <p className="text-xs text-slate-600">
            Hanya akun dengan hak akses <strong>Administrator</strong> yang berwenang mengubah persona dan role pengguna.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  const roleOptions: {
    value: Role;
    label: string;
    description: string;
    badgeColor: string;
    icon: string;
  }[] = [
    {
      value: 'admin',
      label: 'Administrator ICT',
      description: 'Akses penuh seluruh modul, kelola aset, tiket, user, dan policy sistem.',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: '👑',
    },
    {
      value: 'it_helpdesk',
      label: 'IT Helpdesk Officer',
      description: 'Penyelesaian tiket IT, master aset hardware/software, dan presensi selfie GPS.',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
      icon: '🛠️',
    },
    {
      value: 'leader',
      label: 'Team Leader',
      description: 'Permohonan tiket layanan dan otorisasi persetujuan cuti tingkat 1 (Leader).',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: '👔',
    },
    {
      value: 'csbo',
      label: 'CSBO Approver',
      description: 'Corporate Support & Business Operations: Otorisasi persetujuan cuti tingkat 2.',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: '📋',
    },
    {
      value: 'spmo',
      label: 'SPMO Executive',
      description: 'Strategic Project Management Office: Otorisasi persetujuan cuti tingkat 3 final.',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      icon: '⭐',
    },
    {
      value: 'user',
      label: 'Staff / Karyawan',
      description: 'Akses layanan tiket pengaduan mandiri, unduh berkas kebijakan, dan peta kantor.',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      icon: '👤',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      notifyError('Nama lengkap pengguna tidak boleh kosong.');
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail.endsWith('@dslng.com')) {
      notifyError('Email wajib menggunakan domain resmi @dslng.com.');
      return;
    }

    const updatedUser: User = {
      ...user,
      name: name.trim(),
      email: trimmedEmail,
      role,
      department,
      work_location: workLocation,
      extension: extension.trim() || 'x1000',
      password: newPassword.trim() ? newPassword.trim() : user.password,
    };

    onSaveUser(updatedUser);
    notifySuccess(`Persona dan hak akses role untuk "${updatedUser.name}" berhasil diperbarui!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 via-sky-50/40 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-700 text-white rounded-xl shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Edit Persona & Hak Akses Role
                </h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 uppercase tracking-wider">
                  Admin Authorized
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Ubah identitas, penugasan direktorat, serta level otoritas RBAC akun terdaftar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Modal with Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Section 1: Basic Profile & Identity */}
          <div className="space-y-3.5">
            <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <UserIcon className="w-4 h-4 text-[#00A3E0]" />
              <span>Identitas & Informasi Karyawan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap / Display Persona <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Budi Kurniawan, S.Kom"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#004380] focus:border-transparent font-medium text-slate-900"
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Korporat (@dslng.com) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="username@dslng.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#004380] focus:border-transparent font-mono text-slate-800"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Direktorat / Departemen
                </label>
                <div className="relative">
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as Department)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#004380] font-medium text-slate-900"
                  >
                    <option value="President Directorate">President Directorate</option>
                    <option value="Operations Directorate">Operations Directorate</option>
                    <option value="Finance Directorate">Finance Directorate</option>
                    <option value="Corporate Affairs Director">Corporate Affairs Director</option>
                  </select>
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lokasi Penugasan
                </label>
                <div className="relative">
                  <select
                    value={workLocation}
                    onChange={(e) => setWorkLocation(e.target.value as WorkLocation)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#004380] font-medium text-slate-900"
                  >
                    <option value="Site Luwuk">Site Luwuk (Kilang Batui)</option>
                    <option value="HO Jakarta">HO Jakarta (Sentral Senayan II)</option>
                  </select>
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor Extension Telepon
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={extension}
                    onChange={(e) => setExtension(e.target.value)}
                    placeholder="x1024"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#004380] font-mono text-slate-900"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Role & Matriks Hak Akses (RBAC) */}
          <div className="space-y-3">
            <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Pilih Level Hak Akses (Role Persona)</span>
              </div>
              <span className="text-[10px] text-slate-500 font-normal">
                Pilih salah satu role di bawah ini
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roleOptions.map((opt) => {
                const isSelected = role === opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => setRole(opt.value)}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/60 shadow-xs ring-1 ring-purple-600'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{opt.icon}</span>
                          <span className="font-bold text-slate-900 text-xs">{opt.label}</span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${opt.badgeColor}`}>
                        ROLE: {opt.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Reset / Update Password (Optional) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <KeyRound className="w-4 h-4 text-slate-600" />
              <span>Reset Password Akun (Opsional)</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Kosongkan bagian ini jika tidak ingin mengubah password akun saat ini.
            </p>
            <div className="pt-1 max-w-sm">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru jika ingin mereset"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#004380] text-xs font-mono"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Perubahan tersimpan otomatis di sistem.</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Perubahan Persona</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
