import React, { useState } from 'react';
import {
  Ticket,
  TicketCategory,
  TicketStatus,
  Department,
  WorkLocation,
  User,
  CreatedByRole,
} from '../../types';
import { notifySuccess, notifyError, notifyConfirm } from '../../utils/notifications';
import { exportTicketsToExcel } from '../../utils/excel';
import {
  Headphones,
  Plus,
  Filter,
  Search,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Clock3,
  FileText,
  UserCheck,
  ChevronRight,
  TrendingUp,
  DownloadCloud,
  X,
  PhoneCall,
  Calendar,
  Trash2,
} from 'lucide-react';

interface HelpdeskProps {
  tickets: Ticket[];
  users: User[];
  currentUser: User;
  onAddTicket: (ticket: Ticket) => void;
  onUpdateTicketStatus: (ticketId: number, status: TicketStatus, notes?: string) => void;
  onDeleteTicket?: (ticketId: number) => void;
  onClearAllTickets?: () => void;
}

export const HelpdeskTicketing: React.FC<HelpdeskProps> = ({
  tickets,
  users,
  currentUser,
  onAddTicket,
  onUpdateTicketStatus,
  onDeleteTicket,
  onClearAllTickets,
}) => {
  // Directorate Performance Dashboard Filter State
  const [directorateTimeRange, setDirectorateTimeRange] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [selectedDirectorateFilter, setSelectedDirectorateFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [resolutionInput, setResolutionInput] = useState('');

  // Create Ticket Form State
  // IT Helpdesk can choose on behalf of user
  const isHelpdeskOrAdmin = currentUser.role === 'it_helpdesk' || currentUser.role === 'admin';
  const [selectedRequesterId, setSelectedRequesterId] = useState<number>(currentUser.id);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<TicketCategory>('Software');

  // When IT helpdesk changes selected requester, auto-sync department and work location
  const activeRequester = users.find((u) => u.id === selectedRequesterId) || currentUser;

  const handleOpenCreateModal = () => {
    setSelectedRequesterId(currentUser.id);
    setSubject('');
    setBody('');
    setCategory('Software');
    setShowCreateModal(true);
  };

  const handleRequesterChange = (userId: number) => {
    setSelectedRequesterId(userId);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !body.trim()) {
      notifyError('Gagal membuat tiket: Mohon lengkapi Subject dan Body permasalahan.');
      return;
    }

    const nextCodeNumber = String(tickets.length + 1).padStart(4, '0');
    const ticketCode = `#TICK-2026-${nextCodeNumber}`;

    const newTicket: Ticket = {
      id: Date.now(),
      ticket_code: ticketCode,
      requester_id: activeRequester.id,
      requester_name: activeRequester.name,
      requester_email: activeRequester.email,
      requester_extension: activeRequester.extension,
      created_by_role: isHelpdeskOrAdmin && activeRequester.id !== currentUser.id ? 'it_helpdesk' : 'user',
      subject: subject.trim(),
      body: body.trim(),
      category: category,
      department: activeRequester.department,
      work_location: activeRequester.work_location,
      status: 'Open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assigned_to: 'Tim ICT Helpdesk',
    };

    onAddTicket(newTicket);
    notifySuccess(`Tiket berhasil dibuat dengan nomor referensi ${ticketCode}. Tim ICT akan segera memproses.`);
    setShowCreateModal(false);
  };

  const handleStatusChange = (ticket: Ticket, newStatus: TicketStatus) => {
    onUpdateTicketStatus(ticket.id, newStatus, resolutionInput);
    notifySuccess(`Status tiket berhasil diperbarui menjadi ${newStatus}.`);
    if (selectedTicket && selectedTicket.id === ticket.id) {
      setSelectedTicket({ ...selectedTicket, status: newStatus, resolution_notes: resolutionInput });
    }
  };

  const handleDeleteCurrentTicket = (ticket: Ticket) => {
    if (onDeleteTicket) {
      onDeleteTicket(ticket.id);
      notifySuccess(`Tiket ${ticket.ticket_code} berhasil dihapus.`);
      setSelectedTicket(null);
    }
  };

  const handleClearAll = () => {
    if (onClearAllTickets) {
      onClearAllTickets();
      notifySuccess('Seluruh data tiket berhasil dibersihkan.');
    }
  };

  // 4 Directorates Breakdown Calculations
  const directoratesList: Department[] = [
    'President Directorate',
    'Operations Directorate',
    'Finance Directorate',
    'Corporate Affairs Director',
  ];

  const directorateStats = directoratesList.map((dir) => {
    const dirTickets = tickets.filter((t) => t.department === dir);
    const openCount = dirTickets.filter((t) => t.status === 'Open').length;
    const inProgressCount = dirTickets.filter((t) => t.status === 'In Progress').length;
    const resolvedCount = dirTickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;
    return {
      department: dir,
      total: dirTickets.length,
      open: openCount,
      inProgress: inProgressCount,
      resolved: resolvedCount,
      resolutionRate: dirTickets.length > 0 ? Math.round((resolvedCount / dirTickets.length) * 100) : 100,
    };
  });

  // Filtered tickets list according to user permissions:
  // User (Karyawan) can only see their own tickets unless they are Helpdesk/Admin
  const visibleTickets = tickets.filter((ticket) => {
    // If standard user, only view own tickets
    if (currentUser.role === 'user' && ticket.requester_id !== currentUser.id) {
      return false;
    }

    const matchesSearch =
      ticket.ticket_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.requester_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.body.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDir =
      selectedDirectorateFilter === 'all' || ticket.department === selectedDirectorateFilter;

    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesCat = categoryFilter === 'all' || ticket.category === categoryFilter;

    return matchesSearch && matchesDir && matchesStatus && matchesCat;
  });

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'Open':
        return 'bg-amber-50 text-amber-800 border-amber-300 font-semibold';
      case 'In Progress':
        return 'bg-sky-50 text-[#004380] border-sky-300 font-semibold';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold';
      case 'Closed':
        return 'bg-slate-100 text-slate-700 border-slate-300 font-semibold';
    }
  };

  const getCategoryBadge = (cat: TicketCategory) => {
    switch (cat) {
      case 'Software':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Hardware':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Service Lainnya':
        return 'bg-teal-50 text-teal-700 border-teal-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Module Title Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#004380] uppercase tracking-wider">
            <Headphones className="w-4 h-4 text-[#00A3E0]" />
            <span>Layanan Pengaduan ICT Helpdesk</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">
            System Ticketing
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen tiket gangguan sistem, pelaporan insiden, dan monitoring SLA berdasarkan 4 direktorat PT DSLNG.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isHelpdeskOrAdmin && tickets.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition border border-red-200"
              title="Hapus / Reset semua tiket data lama"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Bersihkan Tiket</span>
            </button>
          )}

          {isHelpdeskOrAdmin && (
            <button
              type="button"
              onClick={() => exportTicketsToExcel(visibleTickets)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition"
            >
              <DownloadCloud className="w-4 h-4 text-emerald-600" />
              <span>Export XLS</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-[#004380] hover:bg-[#003366] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>
              {isHelpdeskOrAdmin ? 'Buat Tiket Baru (User / via Ext)' : 'Ajukan Permohonan / Tiket Baru'}
            </span>
          </button>
        </div>
      </div>

      {/* DASHBOARD 4 DIREKTORAT FILTER STRIP (For Helpdesk & Admin) */}
      {isHelpdeskOrAdmin && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00A3E0]" />
              <h2 className="text-sm font-bold text-slate-800">
                Dashboard Performa Tiket 4 Direktorat PT DSLNG
              </h2>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <span className="text-[11px] text-slate-400 px-2 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Rentang:
              </span>
              <button
                type="button"
                onClick={() => setDirectorateTimeRange('weekly')}
                className={`px-3 py-1 rounded-md transition ${
                  directorateTimeRange === 'weekly' ? 'bg-white text-[#004380] shadow-xs' : 'text-slate-600'
                }`}
              >
                Mingguan
              </button>
              <button
                type="button"
                onClick={() => setDirectorateTimeRange('monthly')}
                className={`px-3 py-1 rounded-md transition ${
                  directorateTimeRange === 'monthly' ? 'bg-white text-[#004380] shadow-xs' : 'text-slate-600'
                }`}
              >
                Bulanan
              </button>
              <button
                type="button"
                onClick={() => setDirectorateTimeRange('yearly')}
                className={`px-3 py-1 rounded-md transition ${
                  directorateTimeRange === 'yearly' ? 'bg-white text-[#004380] shadow-xs' : 'text-slate-600'
                }`}
              >
                Tahunan
              </button>
            </div>
          </div>

          {/* 4 Directorates Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {directorateStats.map((d) => (
              <div
                key={d.department}
                onClick={() =>
                  setSelectedDirectorateFilter(
                    selectedDirectorateFilter === d.department ? 'all' : d.department
                  )
                }
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  selectedDirectorateFilter === d.department
                    ? 'border-[#004380] bg-sky-50/50 ring-2 ring-[#004380]'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-slate-900 truncate pr-2">
                    {d.department}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    {d.resolutionRate}% SLA
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-extrabold text-[#004380]">{d.total}</span>
                  <span className="text-[10px] text-slate-500 font-medium">Tiket Tercatat</span>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 text-[10px]">
                  <div className="bg-amber-50 p-1.5 rounded text-center text-amber-800 font-semibold">
                    <div>{d.open}</div>
                    <div className="text-[9px] text-amber-600">Open</div>
                  </div>
                  <div className="bg-sky-50 p-1.5 rounded text-center text-sky-800 font-semibold">
                    <div>{d.inProgress}</div>
                    <div className="text-[9px] text-sky-600">Process</div>
                  </div>
                  <div className="bg-emerald-50 p-1.5 rounded text-center text-emerald-800 font-semibold">
                    <div>{d.resolved}</div>
                    <div className="text-[9px] text-emerald-600">Done</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col lg:flex-row gap-3 items-center justify-between">
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode tiket (#TICK-..), subjek, nama user..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-[#004380] outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Directorate Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Building2 className="w-3.5 h-3.5" />
            <select
              value={selectedDirectorateFilter}
              onChange={(e) => setSelectedDirectorateFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#004380] outline-none"
            >
              <option value="all">Semua 4 Direktorat</option>
              <option value="President Directorate">President Directorate</option>
              <option value="Operations Directorate">Operations Directorate</option>
              <option value="Finance Directorate">Finance Directorate</option>
              <option value="Corporate Affairs Director">Corporate Affairs Director</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#004380] outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#004380] outline-none"
          >
            <option value="all">Semua Kategori</option>
            <option value="Software">Software</option>
            <option value="Hardware">Hardware</option>
            <option value="Service Lainnya">Service Lainnya</option>
          </select>
        </div>
      </div>

      {/* Ticket List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Nomor Tiket</th>
                <th className="py-3 px-4">Pelapor (Requester)</th>
                <th className="py-3 px-4">Direktorat & Lokasi</th>
                <th className="py-3 px-4">Kategori & Permasalahan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Tanggal Masuk</th>
                <th className="py-3 px-4 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {visibleTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                        <Headphones className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-bold text-slate-800">
                        Belum ada tiket pengaduan ICT
                      </div>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Halaman System Ticketing dalam keadaan bersih dan siap untuk penginputan permohonan atau laporan gangguan baru.
                      </p>
                      <button
                        type="button"
                        onClick={handleOpenCreateModal}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#004380] hover:bg-[#003366] text-white text-xs font-bold rounded-xl shadow-xs transition"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Buat Tiket Baru Sekarang</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-sky-50/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-[#004380] text-xs">
                        {ticket.ticket_code}
                      </div>
                      {ticket.created_by_role === 'it_helpdesk' && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-1">
                          <PhoneCall className="w-2.5 h-2.5" /> Via Ext Helpdesk
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{ticket.requester_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {ticket.requester_extension} &bull; {ticket.requester_email}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{ticket.department}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#00A3E0]" />
                        <span>{ticket.work_location}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-sm">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getCategoryBadge(ticket.category)}`}>
                          {ticket.category}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-800 line-clamp-1">{ticket.subject}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{ticket.body}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`text-[10px] uppercase px-2.5 py-1 rounded-full border ${getStatusBadge(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(ticket.created_at).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 pl-4">
                        {new Date(ticket.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setResolutionInput(ticket.resolution_notes || '');
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-[#004380] hover:text-white text-slate-700 text-xs font-semibold rounded-lg transition"
                      >
                        Buka Tiket
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE TICKET MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-sky-50/50">
              <div className="flex items-center gap-2">
                <Headphones className="w-5 h-5 text-[#00A3E0]" />
                <h3 className="text-base font-bold text-slate-900">
                  {isHelpdeskOrAdmin ? 'Buat Tiket Baru (IT Helpdesk / User)' : 'Buat Tiket Pengaduan Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              {/* If IT Helpdesk, allow selecting any user. If user, show auto-synced info */}
              {isHelpdeskOrAdmin ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Karyawan Pemohon (Auto-Sync Department & Lokasi)
                  </label>
                  <select
                    value={selectedRequesterId}
                    onChange={(e) => handleRequesterChange(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#004380] outline-none"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} &bull; Ext: {u.extension} ({u.department} - {u.work_location})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Pelapor</span>
                    <span className="font-bold text-slate-800">{currentUser.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Direktorat</span>
                    <span className="font-bold text-[#004380]">{currentUser.department}</span>
                  </div>
                </div>
              )}

              {/* Synchronized Department & Location Preview */}
              <div className="grid grid-cols-2 gap-3 bg-sky-50/50 p-3 rounded-xl border border-sky-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Direktorat Terpilih:</span>
                  <span className="font-bold text-slate-900">{activeRequester.department}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Lokasi Kerja:</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#00A3E0]" />
                    {activeRequester.work_location} ({activeRequester.extension})
                  </span>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kategori Permasalahan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Software', 'Hardware', 'Service Lainnya'] as TicketCategory[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`py-2 px-3 text-xs font-bold rounded-lg border transition ${
                        category === cat
                          ? 'bg-[#004380] text-white border-[#004380] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Subject / Judul Gangguan
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Contoh: Gangguan Akses Jaringan DCS Kilang / Cisco VPN Token Expired"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#004380] outline-none"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Body / Rincian Masalah
                </label>
                <textarea
                  rows={4}
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Jelaskan kendala secara spesifik, waktu kejadian, dan nomor error jika ada..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#004380] outline-none leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#004380] hover:bg-[#003366] rounded-lg shadow-sm transition"
                >
                  Kirim Tiket ke ICT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TICKET DETAIL & STATUS MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-sky-50">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-[#004380] text-sm bg-white px-2.5 py-1 rounded-lg border border-sky-200 shadow-2xs">
                  {selectedTicket.ticket_code}
                </span>
                <span className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(selectedTicket.status)}`}>
                  {selectedTicket.status}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              {/* Requester & Department Information */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Pelapor</span>
                  <span className="font-bold text-slate-900">{selectedTicket.requester_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Direktorat</span>
                  <span className="font-semibold text-slate-800">{selectedTicket.department}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Lokasi & Ext</span>
                  <span className="font-semibold text-slate-800">
                    {selectedTicket.work_location} ({selectedTicket.requester_extension || 'N/A'})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Kategori</span>
                  <span className="font-semibold text-indigo-700">{selectedTicket.category}</span>
                </div>
              </div>

              {/* Subject & Body */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Subject Permasalahan
                </h4>
                <div className="text-base font-bold text-slate-900">{selectedTicket.subject}</div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Deskripsi Lengkap
                </h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.body}
                </div>
              </div>

              {/* Resolution Notes */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Catatan Penanganan & Tindakan ICT
                </h4>
                {isHelpdeskOrAdmin ? (
                  <textarea
                    rows={3}
                    value={resolutionInput}
                    onChange={(e) => setResolutionInput(e.target.value)}
                    placeholder="Tuliskan catatan perbaikan teknis, penggantian sparepart, atau konfigurasi ulang..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#004380] outline-none"
                  />
                ) : (
                  <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                    {selectedTicket.resolution_notes || 'Belum ada catatan teknis penanganan dari IT Helpdesk.'}
                  </div>
                )}
              </div>

              {/* IT Helpdesk Action Controls (Status Updates) */}
              {isHelpdeskOrAdmin && (
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Ubah Status Tiket
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedTicket, 'Open')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                        selectedTicket.status === 'Open'
                          ? 'bg-amber-500 text-white border-amber-600'
                          : 'bg-slate-100 text-slate-700 hover:bg-amber-100'
                      }`}
                    >
                      Set: Open
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedTicket, 'In Progress')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                        selectedTicket.status === 'In Progress'
                          ? 'bg-[#004380] text-white border-[#003366]'
                          : 'bg-slate-100 text-slate-700 hover:bg-sky-100'
                      }`}
                    >
                      Set: In Progress
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedTicket, 'Resolved')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                        selectedTicket.status === 'Resolved'
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-emerald-100'
                      }`}
                    >
                      Set: Resolved
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedTicket, 'Closed')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                        selectedTicket.status === 'Closed'
                          ? 'bg-slate-800 text-white border-slate-900'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Set: Closed
                    </button>
                  </div>
                </div>
              )}

            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div>
                {(isHelpdeskOrAdmin || selectedTicket.requester_id === currentUser.id) && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCurrentTicket(selectedTicket)}
                    className="px-3.5 py-2 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Tiket Ini</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
