import React, { useState } from 'react';
import { DslngLogo } from '../common/DslngLogo';
import { User, Department, WorkLocation, Role } from '../../types';
import { notifySuccess, notifyError } from '../../utils/notifications';
import { Lock, Mail, User as UserIcon, Phone, Building2, MapPin, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthProps {
  users: User[];
  onLoginSuccess?: (user: User) => void;
  onRegisterUser?: (newUser: User) => void;
  onUpdatePassword?: (userId: number, newPass: string) => void;
  onLogin?: (user: User) => void;
  onRegister?: (newUser: User) => void;
  onChangePassword?: (userId: number, newPass: string) => void;
  onSwitchPersona?: (role: Role) => void;
}

export const AuthScreens: React.FC<AuthProps> = ({
  users,
  onLoginSuccess,
  onRegisterUser,
  onLogin,
  onRegister,
}) => {
  const triggerLogin = onLoginSuccess || onLogin || (() => {});
  const triggerRegister = onRegisterUser || onRegister || (() => {});

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState<Department>('Operations Directorate');
  const [regWorkLocation, setRegWorkLocation] = useState<WorkLocation>('Site Luwuk');
  const [regExtension, setRegExtension] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const email = loginEmail.trim().toLowerCase();

    // Check @dslng.com domain
    if (!email.endsWith('@dslng.com')) {
      notifyError('Email wajib menggunakan domain resmi @dslng.com.');
      return;
    }

    const foundUser = users.find(u => u.email.toLowerCase() === email);

    if (!foundUser) {
      notifyError('Email atau password salah, atau akun belum terdaftar.');
      return;
    }

    // Check password (accepts their stored password, admin password TinaDSLNG321, or default DSLNG#2026)
    const validPasswords = [foundUser.password, 'TinaDSLNG321', 'DSLNG#2026'];
    if (!loginPassword || !validPasswords.includes(loginPassword)) {
      notifyError('Email atau password salah, atau akun belum terdaftar.');
      return;
    }

    triggerLogin(foundUser);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const email = regEmail.trim().toLowerCase();

    // STRICT CHECK: Wajib domain @dslng.com
    if (!email.endsWith('@dslng.com')) {
      notifyError('Registrasi gagal! Email wajib menggunakan domain resmi @dslng.com.');
      return;
    }

    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === email)) {
      notifyError('Email ini sudah terdaftar. Silakan Login atau hubungi Administrator ICT.');
      return;
    }

    if (!regName.trim()) {
      notifyError('Mohon isi nama lengkap Anda.');
      return;
    }

    const newUser: User = {
      id: Date.now(),
      name: regName.trim(),
      email: email,
      password: 'DSLNG#2026', // Automatically assigned default password
      department: regDepartment,
      work_location: regWorkLocation,
      role: 'user', // Automatically defaults to standard staff/user
      extension: regExtension.trim() ? (regExtension.startsWith('x') ? regExtension : `x${regExtension}`) : 'x1000',
      created_at: new Date().toISOString(),
      must_change_password: true,
    };

    triggerRegister(newUser);
    notifySuccess('Pendaftaran berhasil! Silakan login dengan akun Anda.');
    setLoginEmail(email);
    setLoginPassword('');
    setAuthMode('login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#002B54] to-slate-900 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 relative overflow-hidden">
      {/* Subtle Background Architectural Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#00A3E0_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none"></div>
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#00A3E0]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 -left-20 w-96 h-96 bg-[#003B71]/30 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Authentication Container - Optimized for Desktop & Mobile */}
      <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl z-10 mx-auto">
        
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-10 backdrop-blur-sm transition-all duration-300">
          
          {/* DSLNG Branding Header */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="py-1">
              <DslngLogo variant="horizontal" size="lg" />
            </div>
            <div className="h-1 w-20 bg-gradient-to-r from-[#004380] via-[#00A3E0] to-emerald-400 mt-4 mb-3 rounded-full"></div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-sans">
              SISTEM INFORMASI ICT
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 max-w-sm">
              Portal Layanan Teknologi Informasi & Operasional Kilang PT DSLNG
            </p>
          </div>

          {/* Form Tabs: Login & Register */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-7 text-xs sm:text-sm font-bold border border-slate-200/70">
            <button
              type="button"
              id="auth-tab-login"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                authMode === 'login'
                  ? 'bg-[#004380] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>Login</span>
            </button>
            <button
              type="button"
              id="auth-tab-register"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                authMode === 'register'
                  ? 'bg-[#004380] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>Register</span>
            </button>
          </div>

          {/* LOGIN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Email Korporat DSLNG
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nama.lengkap@dslng.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#004380] focus:border-transparent outline-none transition font-medium"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1.5 block">
                  *Gunakan alamat email resmi dengan domain <span className="font-semibold text-slate-600">@dslng.com</span>
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#004380] focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="btn-submit-login"
                className="w-full py-3.5 bg-[#004380] hover:bg-[#003366] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base mt-2"
              >
                <span>Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Belum memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className="font-bold text-[#00A3E0] hover:text-[#004380] transition underline"
                  >
                    Register sekarang
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Lengkap Sesuai ID Badge
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Contoh: Ahmad Faisal"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#004380] outline-none transition font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Perusahaan (@dslng.com)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="ahmad.faisal@dslng.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#004380] outline-none transition font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Direktorat
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value as Department)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#004380] outline-none transition"
                    >
                      <option value="President Directorate">President Directorate</option>
                      <option value="Operations Directorate">Operations Directorate</option>
                      <option value="Finance Directorate">Finance Directorate</option>
                      <option value="Corporate Affairs Director">Corporate Affairs Director</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Lokasi Kerja
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={regWorkLocation}
                      onChange={(e) => setRegWorkLocation(e.target.value as WorkLocation)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#004380] outline-none transition"
                    >
                      <option value="Site Luwuk">Site Luwuk (Plant)</option>
                      <option value="HO Jakarta">HO Jakarta (Office)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Extension Telepon (Opsional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regExtension}
                    onChange={(e) => setRegExtension(e.target.value)}
                    placeholder="Contoh: x4412"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#004380] outline-none transition"
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  Akun baru akan dibuat sebagai <span className="font-bold text-slate-900">Karyawan/Staff</span> dan dapat disesuaikan wewenangnya oleh Administrator.
                </span>
              </div>

              <button
                type="submit"
                id="btn-submit-register"
                className="w-full py-3.5 bg-[#00A3E0] hover:bg-[#0284C7] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base mt-2"
              >
                <span>Register</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Sudah memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="font-bold text-[#004380] hover:text-[#00A3E0] transition underline"
                  >
                    Login sekarang
                  </button>
                </p>
              </div>
            </form>
          )}

        </div>

        {/* Corporate Footer */}
        <div className="text-center text-xs text-slate-400 mt-6 flex items-center justify-center gap-2">
          <span>PT Donggi-Senoro LNG &copy; 2026</span>
          <span>&bull;</span>
          <span>ICT Department Portal</span>
        </div>
      </div>
    </div>
  );
};
