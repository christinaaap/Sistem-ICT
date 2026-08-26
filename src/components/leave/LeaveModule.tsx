import React, { useState, useRef, useEffect } from 'react';
import { LeaveRequest, LeaveApproval, User } from '../../types';
import { notifySuccess, notifyError, notifyConfirm } from '../../utils/notifications';
import { DslngLogo } from '../common/DslngLogo';
import confetti from 'canvas-confetti';
import {
  FileCheck2,
  Plus,
  PenTool,
  CheckCircle2,
  Clock3,
  XCircle,
  Calendar,
  UserCheck,
  Printer,
  ChevronRight,
  Shield,
  RotateCcw,
  Building,
  MapPin,
  X,
  FileSignature,
} from 'lucide-react';

interface LeaveModuleProps {
  leaves: LeaveRequest[];
  currentUser: User;
  onAddLeave: (leave: LeaveRequest) => void;
  onApproveStep: (
    leaveId: number,
    stepOrder: 1 | 2 | 3,
    approverUser: User,
    signatureData: string,
    notes?: string
  ) => void;
}

export const LeaveModule: React.FC<LeaveModuleProps> = ({
  leaves,
  currentUser,
  onAddLeave,
  onApproveStep,
}) => {
  // Form states
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState<{
    leave: LeaveRequest;
    stepOrder: 1 | 2 | 3;
    roleName: string;
  } | null>(null);

  const [showPrintSlip, setShowPrintSlip] = useState<LeaveRequest | null>(null);

  // Apply leave form fields
  const [leaveReason, setLeaveReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Signature Pad State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');

  // Calculate day difference
  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 1;
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!leaveReason.trim() || !startDate || !endDate) {
      notifyError('Mohon lengkapi alasan cuti dan rentang tanggal pelaksanaan.');
      return;
    }

    const totalDays = calculateDays(startDate, endDate);

    const initialApprovals: LeaveApproval[] = [
      {
        id: Date.now() + 1,
        leave_id: Date.now(),
        approver_id: null,
        approver_name: 'Team Leader ICT',
        approver_role: 'leader',
        step_order: 1,
        status: 'Pending',
        signature_data: null,
        approved_at: null,
      },
      {
        id: Date.now() + 2,
        leave_id: Date.now(),
        approver_id: null,
        approver_name: 'CSBO Approver',
        approver_role: 'csbo',
        step_order: 2,
        status: 'Pending',
        signature_data: null,
        approved_at: null,
      },
      {
        id: Date.now() + 3,
        leave_id: Date.now(),
        approver_id: null,
        approver_name: 'SPMO Executive',
        approver_role: 'spmo',
        step_order: 3,
        status: 'Pending',
        signature_data: null,
        approved_at: null,
      },
    ];

    const newLeave: LeaveRequest = {
      id: Date.now(),
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_email: currentUser.email,
      user_department: currentUser.department,
      user_work_location: currentUser.work_location,
      user_extension: currentUser.extension,
      reason: leaveReason.trim(),
      start_date: startDate,
      end_date: endDate,
      total_days: totalDays,
      status: 'Pending',
      current_step: 1,
      created_at: new Date().toISOString(),
      approvals: initialApprovals,
    };

    onAddLeave(newLeave);
    notifySuccess('Pengajuan cuti berhasil dikirim dan diteruskan ke Leader Tim untuk approval.');
    setShowApplyModal(false);
    setLeaveReason('');
    setStartDate('');
    setEndDate('');
  };

  // Canvas Signature Helpers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#004380'; // DSLNG Corporate Navy Signature Ink
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleOpenSignModal = (leave: LeaveRequest, stepOrder: 1 | 2 | 3, roleName: string) => {
    setShowSignModal({ leave, stepOrder, roleName });
    setHasSignature(false);
    setApprovalNotes('');
    setTimeout(() => {
      clearCanvas();
    }, 100);
  };

  const handleProcessSignature = () => {
    if (!showSignModal) return;

    // Check E-Sign
    if (!hasSignature || !canvasRef.current) {
      notifyError('Gagal menyetujui: Anda harus membubuhkan tanda tangan digital (E-Sign) terlebih dahulu.');
      return;
    }

    const signatureData = canvasRef.current.toDataURL('image/png');

    onApproveStep(
      showSignModal.leave.id,
      showSignModal.stepOrder,
      currentUser,
      signatureData,
      approvalNotes
    );

    // Confetti effect on final SPMO approval
    if (showSignModal.stepOrder === 3) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    }

    notifySuccess('Persetujuan cuti berhasil disimpan beserta E-Sign digital Anda.');
    setShowSignModal(null);
  };

  // Role Checker for approving
  const canApproveStep1 = currentUser.role === 'leader' || currentUser.role === 'admin';
  const canApproveStep2 = currentUser.role === 'csbo' || currentUser.role === 'admin';
  const canApproveStep3 = currentUser.role === 'spmo' || currentUser.role === 'admin';

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#004380] uppercase tracking-wider">
            <FileCheck2 className="w-4 h-4 text-[#00A3E0]" />
            <span>Modul 4 &bull; Manajemen Cuti & Approval E-Sign Berjenjang</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">
            Leave Request & E-Sign Digital Approval
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Alur persetujuan terstruktur: <span className="font-semibold text-slate-700">Requester</span> &rarr;{' '}
            <span className="font-semibold text-slate-700">Step 1: Leader Tim</span> &rarr;{' '}
            <span className="font-semibold text-slate-700">Step 2: CSBO</span> &rarr;{' '}
            <span className="font-semibold text-slate-700">Step 3: SPMO</span> dengan verifikasi tanda tangan digital resmi.
          </p>
        </div>

        {/* Action Button: Apply Leave for IT Helpdesk or Admin */}
        {(currentUser.role === 'it_helpdesk' || currentUser.role === 'admin') && (
          <button
            type="button"
            onClick={() => setShowApplyModal(true)}
            className="px-4 py-2 bg-[#004380] hover:bg-[#003366] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Ajukan Cuti Baru</span>
          </button>
        )}
      </div>

      {/* Leave Requests Cards & Progress Sequence */}
      <div className="space-y-4">
        {leaves.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
            Belum ada pengajuan cuti yang tercatat.
          </div>
        ) : (
          leaves.map((leave) => {
            const step1 = leave.approvals.find((a) => a.step_order === 1);
            const step2 = leave.approvals.find((a) => a.step_order === 2);
            const step3 = leave.approvals.find((a) => a.step_order === 3);

            const isFullyApproved = leave.status === 'Approved';

            return (
              <div
                key={leave.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5"
              >
                {/* Header Information */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#004380] flex items-center justify-center font-bold text-sm border border-sky-200">
                      {leave.user_name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{leave.user_name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>{leave.user_department}</span> &bull;{' '}
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#00A3E0]" />
                          {leave.user_work_location} ({leave.user_extension})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        leave.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : leave.status === 'Rejected'
                          ? 'bg-red-50 text-red-800 border-red-300'
                          : 'bg-sky-50 text-[#004380] border-sky-300'
                      }`}
                    >
                      {leave.status === 'Approved'
                        ? 'Disetujui Penuh (Fully Approved)'
                        : `Proses Verifikasi (Menunggu Step ${leave.current_step})`}
                    </span>

                    <button
                      type="button"
                      onClick={() => setShowPrintSlip(leave)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs flex items-center gap-1.5 transition"
                      title="Cetak Berkas Cuti E-Sign Resmi"
                    >
                      <Printer className="w-4 h-4 text-slate-600" />
                      <span className="hidden sm:inline">Cetak Surat Cuti</span>
                    </button>
                  </div>
                </div>

                {/* Reason & Date duration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div className="md:col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Alasan & Rincian Pengajuan Cuti
                    </span>
                    <p className="text-slate-800 font-medium leading-relaxed">{leave.reason}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Periode & Durasi
                    </span>
                    <div className="text-xs font-bold text-[#004380] mt-0.5">
                      {new Date(leave.start_date).toLocaleDateString('id-ID')} -{' '}
                      {new Date(leave.end_date).toLocaleDateString('id-ID')}
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                      Total: {leave.total_days} Hari Kerja
                    </div>
                  </div>
                </div>

                {/* 3-STEP APPROVAL WORKFLOW PROGRESS */}
                <div>
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                    Alur Persetujuan Bertahap (3-Tier Approval Workflow)
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* STEP 1: LEADER */}
                    <div
                      className={`p-4 rounded-xl border transition ${
                        step1?.status === 'Approved'
                          ? 'border-emerald-300 bg-emerald-50/40'
                          : leave.current_step === 1
                          ? 'border-[#004380] bg-sky-50/50 ring-2 ring-[#004380]'
                          : 'border-slate-200 bg-slate-50/60 opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase text-[#004380] flex items-center gap-1">
                          <span>Step 1: Leader Tim</span>
                        </span>
                        {step1?.status === 'Approved' ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Disetujui
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <Clock3 className="w-3 h-3" /> Menunggu
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-bold text-slate-800">
                        {step1?.approver_name || 'Hendra Gunawan'}
                      </div>
                      <div className="text-[10px] text-slate-500 mb-2">
                        {step1?.approved_at
                          ? `Disetujui pada ${new Date(step1.approved_at).toLocaleDateString('id-ID')}`
                          : 'Pemeriksaan operasional & shift backup'}
                      </div>

                      {/* E-Sign Preview Box */}
                      {step1?.signature_data ? (
                        <div className="bg-white p-2 rounded-lg border border-emerald-200 flex flex-col items-center">
                          <img
                            src={step1.signature_data}
                            alt="E-Sign Leader"
                            className="h-12 object-contain"
                          />
                          <span className="text-[9px] text-emerald-700 font-mono mt-1 font-semibold">
                            E-Sign Terverifikasi
                          </span>
                        </div>
                      ) : (
                        canApproveStep1 &&
                        leave.current_step === 1 && (
                          <button
                            type="button"
                            onClick={() => handleOpenSignModal(leave, 1, 'Leader Tim')}
                            className="w-full py-2 bg-[#004380] hover:bg-[#003366] text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition"
                          >
                            <PenTool className="w-3.5 h-3.5" />
                            <span>Bubuhi E-Sign (Approve)</span>
                          </button>
                        )
                      )}
                    </div>

                    {/* STEP 2: CSBO */}
                    <div
                      className={`p-4 rounded-xl border transition ${
                        step2?.status === 'Approved'
                          ? 'border-emerald-300 bg-emerald-50/40'
                          : leave.current_step === 2
                          ? 'border-[#004380] bg-sky-50/50 ring-2 ring-[#004380]'
                          : 'border-slate-200 bg-slate-50/60 opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase text-[#004380] flex items-center gap-1">
                          <span>Step 2: CSBO</span>
                        </span>
                        {step2?.status === 'Approved' ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Disetujui
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                            {leave.current_step < 2 ? 'Antrian' : 'Menunggu'}
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-bold text-slate-800">
                        {step2?.approver_name || 'Siti Rahmawati'}
                      </div>
                      <div className="text-[10px] text-slate-500 mb-2">
                        {step2?.approved_at
                          ? `Disetujui pada ${new Date(step2.approved_at).toLocaleDateString('id-ID')}`
                          : 'Verifikasi Corporate Services & Business Ops'}
                      </div>

                      {/* E-Sign Preview Box */}
                      {step2?.signature_data ? (
                        <div className="bg-white p-2 rounded-lg border border-emerald-200 flex flex-col items-center">
                          <img
                            src={step2.signature_data}
                            alt="E-Sign CSBO"
                            className="h-12 object-contain"
                          />
                          <span className="text-[9px] text-emerald-700 font-mono mt-1 font-semibold">
                            E-Sign Terverifikasi
                          </span>
                        </div>
                      ) : (
                        canApproveStep2 &&
                        leave.current_step === 2 && (
                          <button
                            type="button"
                            onClick={() => handleOpenSignModal(leave, 2, 'CSBO')}
                            className="w-full py-2 bg-[#004380] hover:bg-[#003366] text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition"
                          >
                            <PenTool className="w-3.5 h-3.5" />
                            <span>Bubuhi E-Sign (Approve)</span>
                          </button>
                        )
                      )}
                    </div>

                    {/* STEP 3: SPMO */}
                    <div
                      className={`p-4 rounded-xl border transition ${
                        step3?.status === 'Approved'
                          ? 'border-emerald-300 bg-emerald-50/40'
                          : leave.current_step === 3
                          ? 'border-[#004380] bg-sky-50/50 ring-2 ring-[#004380]'
                          : 'border-slate-200 bg-slate-50/60 opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase text-[#004380] flex items-center gap-1">
                          <span>Step 3: SPMO</span>
                        </span>
                        {step3?.status === 'Approved' ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Final Approved
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                            {leave.current_step < 3 ? 'Antrian' : 'Menunggu Final'}
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-bold text-slate-800">
                        {step3?.approver_name || 'Ir. Agus Wijaya, MM'}
                      </div>
                      <div className="text-[10px] text-slate-500 mb-2">
                        {step3?.approved_at
                          ? `Disetujui pada ${new Date(step3.approved_at).toLocaleDateString('id-ID')}`
                          : 'Otorisasi Eksekutif Senior Project Management'}
                      </div>

                      {/* E-Sign Preview Box */}
                      {step3?.signature_data ? (
                        <div className="bg-white p-2 rounded-lg border border-emerald-200 flex flex-col items-center">
                          <img
                            src={step3.signature_data}
                            alt="E-Sign SPMO"
                            className="h-12 object-contain"
                          />
                          <span className="text-[9px] text-emerald-700 font-mono mt-1 font-semibold">
                            E-Sign Terverifikasi
                          </span>
                        </div>
                      ) : (
                        canApproveStep3 &&
                        leave.current_step === 3 && (
                          <button
                            type="button"
                            onClick={() => handleOpenSignModal(leave, 3, 'SPMO Executive')}
                            className="w-full py-2 bg-[#004380] hover:bg-[#003366] text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition"
                          >
                            <PenTool className="w-3.5 h-3.5" />
                            <span>Bubuhi E-Sign (Final)</span>
                          </button>
                        )
                      )}
                    </div>

                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* APPLY LEAVE MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-sky-50/50">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#00A3E0]" />
                <h3 className="text-base font-bold text-slate-900">Form Pengajuan Cuti / Roster Break</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div className="font-bold text-slate-900">{currentUser.name}</div>
                <div className="text-[11px] text-slate-500">
                  {currentUser.department} &bull; {currentUser.work_location} ({currentUser.extension})
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Alasan Permohonan Cuti
                </label>
                <textarea
                  rows={3}
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Contoh: Roster Break Periodik Site Luwuk ke Jakarta / Keperluan Keluarga Penting"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#004380] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#004380] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#004380] outline-none"
                  />
                </div>
              </div>

              {startDate && endDate && (
                <div className="bg-sky-50 p-2.5 rounded-lg border border-sky-200 text-xs text-sky-900 font-semibold text-center">
                  Total Hari Pengajuan Cuti: {calculateDays(startDate, endDate)} Hari Kalender
                </div>
              )}

              <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                Pengajuan akan diproses secara berjenjang:{' '}
                <span className="font-semibold text-slate-700">Leader Tim &rarr; CSBO &rarr; SPMO</span>.
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#004380] hover:bg-[#003366] rounded-lg shadow-sm transition"
                >
                  Kirim Pengajuan Cuti
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIGITAL SIGNATURE PAD (E-SIGN) MODAL */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50 to-slate-50">
              <div className="flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-[#004380]" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Bubuhi E-Sign Digital ({showSignModal.roleName})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Otorisasi Pengajuan Cuti Pemohon: {showSignModal.leave.user_name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSignModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Area Tanda Tangan Digital (E-Sign Pad):</span>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-[#00A3E0] hover:underline flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Hapus (Clear)</span>
                </button>
              </div>

              {/* Interactive Canvas Signature Pad */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50 relative group cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  width={440}
                  height={180}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-44 touch-none"
                />

                {!hasSignature && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400">
                    <PenTool className="w-6 h-6 mb-1 opacity-50" />
                    <span className="text-xs font-medium">Tanda tangani menggunakan mouse atau layar sentuh</span>
                  </div>
                )}
              </div>

              {/* Approver Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Catatan Otorisasi / Instruksi Khusus (Opsional)
                </label>
                <input
                  type="text"
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Contoh: Disetujui. Serah terima tugas piket telah terverifikasi."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#004380] outline-none"
                />
              </div>

              <div className="bg-sky-50 border border-sky-200 rounded-lg p-2.5 text-[11px] text-sky-900">
                <span className="font-semibold">Ketentuan Hukum DSLNG:</span> E-Sign digital yang dibubuhkan mengikat secara sah dan tersimpan permanen dalam riwayat audit kepegawaian PT Donggi-Senoro LNG.
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowSignModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleProcessSignature}
                className="px-5 py-2 text-xs font-bold text-white bg-[#004380] hover:bg-[#003366] rounded-lg shadow-sm transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Simpan Persetujuan & E-Sign</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL PRINTABLE LEAVE SLIP MODAL */}
      {showPrintSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 no-print">
              <span className="text-xs font-bold text-slate-700">Surat Pengajuan & Otorisasi Cuti Resmi</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#004380] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Dokumen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintSlip(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Letterhead Slip */}
            <div className="p-8 space-y-6 text-slate-900 font-sans">
              
              {/* Header Letterhead */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                <DslngLogo variant="horizontal" size="lg" />
                <div className="text-right text-xs">
                  <div className="font-extrabold text-slate-900 uppercase">PT DONGGI-SENORO LNG</div>
                  <div className="text-slate-500 text-[10px]">ICT & Telecommunication Department</div>
                  <div className="text-slate-400 font-mono text-[9px]">DOC ID: DSLNG-HR-ICT-2026-LV{showPrintSlip.id.toString().slice(-4)}</div>
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-base font-extrabold tracking-tight uppercase underline">
                  FORMULIR PERMOHONAN DAN OTORISASI CUTI / ROSTER BREAK
                </h2>
              </div>

              {/* Employee Details Grid */}
              <div className="grid grid-cols-2 gap-y-2 text-xs border border-slate-200 p-4 rounded-lg bg-slate-50/50">
                <div><span className="font-bold text-slate-600">Nama Karyawan:</span> {showPrintSlip.user_name}</div>
                <div><span className="font-bold text-slate-600">Email:</span> {showPrintSlip.user_email}</div>
                <div><span className="font-bold text-slate-600">Direktorat:</span> {showPrintSlip.user_department}</div>
                <div><span className="font-bold text-slate-600">Lokasi Kerja:</span> {showPrintSlip.user_work_location} ({showPrintSlip.user_extension})</div>
                <div><span className="font-bold text-slate-600">Tanggal Mulai:</span> {new Date(showPrintSlip.start_date).toLocaleDateString('id-ID')}</div>
                <div><span className="font-bold text-slate-600">Tanggal Selesai:</span> {new Date(showPrintSlip.end_date).toLocaleDateString('id-ID')} ({showPrintSlip.total_days} Hari)</div>
                <div className="col-span-2 pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-600">Alasan:</span> {showPrintSlip.reason}
                </div>
              </div>

              {/* 3 Digital Signatures Box */}
              <div>
                <div className="text-xs font-bold uppercase text-slate-700 mb-2">Tanda Tangan Elektronik (E-Sign Verification)</div>
                <div className="grid grid-cols-3 gap-3">
                  {showPrintSlip.approvals.map((app) => (
                    <div key={app.id} className="border border-slate-300 rounded-lg p-3 text-center flex flex-col justify-between h-36">
                      <div className="text-[10px] font-bold uppercase text-slate-600">
                        {app.step_order === 1 ? 'Leader Tim' : app.step_order === 2 ? 'CSBO' : 'SPMO Executive'}
                      </div>
                      <div className="my-auto flex items-center justify-center">
                        {app.signature_data ? (
                          <img src={app.signature_data} alt="E-Sign" className="max-h-14 object-contain" />
                        ) : (
                          <span className="text-[10px] text-slate-300 italic">[Belum Ditandatangani]</span>
                        )}
                      </div>
                      <div className="text-[10px] font-bold text-slate-800 border-t border-slate-200 pt-1">
                        {app.approver_name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[10px] text-slate-400 text-center pt-4 border-t border-slate-200">
                Dokumen ini digenerate secara otomatis oleh Sistem Informasi Departemen ICT PT Donggi-Senoro LNG pada {new Date().toLocaleString('id-ID')}.
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
