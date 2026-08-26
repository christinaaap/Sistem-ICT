import { Request, Response } from 'express';
import { db } from '../db/database';
import { LeaveRequest, LeaveApproval } from '../../src/types';

export const getLeaves = async (_req: Request, res: Response): Promise<void> => {
  try {
    const leaves = db.getAllLeaves();
    res.json({ leaves });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memuat data cuti.' });
  }
};

export const createLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, user_name, user_email, user_department, user_work_location, user_extension, reason, start_date, end_date, total_days } = req.body;

    if (!reason || !start_date || !end_date) {
      res.status(400).json({ error: 'Alasan cuti dan rentang tanggal wajib diisi.' });
      return;
    }

    const leaveId = Date.now();
    const defaultApprovals: LeaveApproval[] = [
      {
        id: leaveId + 1,
        leave_id: leaveId,
        approver_id: null,
        approver_name: 'Direct Leader / SPV',
        approver_role: 'leader',
        step_order: 1,
        status: 'Pending',
        signature_data: null,
        approved_at: null,
      },
      {
        id: leaveId + 2,
        leave_id: leaveId,
        approver_id: null,
        approver_name: 'CSBO Section Head',
        approver_role: 'csbo',
        step_order: 2,
        status: 'Pending',
        signature_data: null,
        approved_at: null,
      },
      {
        id: leaveId + 3,
        leave_id: leaveId,
        approver_id: null,
        approver_name: 'SPMO Department Manager',
        approver_role: 'spmo',
        step_order: 3,
        status: 'Pending',
        signature_data: null,
        approved_at: null,
      },
    ];

    const newLeave: LeaveRequest = {
      id: leaveId,
      user_id: Number(user_id) || 1,
      user_name: user_name || 'Karyawan DSLNG',
      user_email: user_email || '',
      user_department: user_department || 'Operations Directorate',
      user_work_location: user_work_location || 'Site Luwuk',
      user_extension: user_extension || 'x1000',
      reason: String(reason).trim(),
      start_date,
      end_date,
      total_days: Number(total_days) || 1,
      status: 'Pending',
      current_step: 1,
      created_at: new Date().toISOString(),
      approvals: defaultApprovals,
    };

    const saved = db.createLeave(newLeave);
    res.status(201).json({ message: 'Pengajuan cuti berhasil dibuat.', leave: saved });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memproses pengajuan cuti.' });
  }
};

export const signApproval = async (req: Request, res: Response): Promise<void> => {
  try {
    const leaveId = Number(req.params.id);
    const { step_order, approver_id, approver_name, status, signature_data, notes } = req.body;

    if (!signature_data && status === 'Approved') {
      res.status(400).json({ error: 'Tanda tangan digital wajib disertakan.' });
      return;
    }

    const updated = db.updateLeaveApproval(
      leaveId,
      Number(step_order),
      Number(approver_id),
      approver_name,
      status,
      signature_data,
      notes
    );

    if (!updated) {
      res.status(404).json({ error: 'Pengajuan cuti tidak ditemukan.' });
      return;
    }

    res.json({ message: `Persetujuan tahap ${step_order} berhasil diproses (${status}).`, leave: updated });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memproses persetujuan e-sign.' });
  }
};

export const clearLeaves = async (_req: Request, res: Response): Promise<void> => {
  try {
    db.clearLeaves();
    res.json({ message: 'Seluruh data cuti berhasil dibersihkan.' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mereset data cuti.' });
  }
};
