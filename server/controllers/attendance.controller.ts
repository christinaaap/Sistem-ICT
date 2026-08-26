import { Request, Response } from 'express';
import { db } from '../db/database';
import { Attendance } from '../../src/types';

export const getAttendances = async (_req: Request, res: Response): Promise<void> => {
  try {
    const attendances = await db.getAllAttendances();
    res.json({ attendances });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memuat rekap absensi.' });
  }
};

export const createAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, user_name, user_email, user_role, photo_path, latitude, longitude, work_location, status, notes } = req.body;

    if (!user_id || !photo_path || !latitude || !longitude) {
      res.status(400).json({ error: 'Foto selfie dan koordinat GPS wajib disertakan.' });
      return;
    }

    const newAttendance: Attendance = {
      id: Date.now(),
      user_id: Number(user_id),
      user_name: user_name || 'Karyawan DSLNG',
      user_email: user_email || '',
      user_role: user_role || 'user',
      clock_in: new Date().toISOString(),
      photo_path: photo_path,
      latitude: String(latitude),
      longitude: String(longitude),
      work_location: work_location || 'Site Luwuk',
      status: status || 'Hadir Tepat Waktu',
      notes: notes || '',
      created_at: new Date().toISOString(),
    };

    const saved = await db.createAttendance(newAttendance);
    res.status(201).json({ message: 'Presensi berhasil dicatat.', attendance: saved });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mencatat presensi.' });
  }
};

export const clearAttendances = async (_req: Request, res: Response): Promise<void> => {
  try {
    await db.clearAttendances();
    res.json({ message: 'Seluruh data absensi berhasil dibersihkan.' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mereset data absensi.' });
  }
};
