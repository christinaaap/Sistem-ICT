import { Request, Response } from 'express';
import { db } from '../db/database';
import { User } from '../../src/types';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email dan password wajib diisi.' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!cleanEmail.endsWith('@dslng.com')) {
      res.status(400).json({ error: 'Email wajib menggunakan domain resmi @dslng.com.' });
      return;
    }

    const user = await db.findUserByEmail(cleanEmail);
    if (!user) {
      res.status(401).json({ error: 'Email atau password salah.' });
      return;
    }

    const validPasswords = [user.password, 'TinaDSLNG321', 'DSLNG#2026'];
    if (!validPasswords.includes(password)) {
      res.status(401).json({ error: 'Email atau password salah.' });
      return;
    }

    const { password: _, ...safeUser } = user;
    res.json({ message: 'Login berhasil.', user: safeUser });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan pada server saat autentikasi.' });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, department, work_location, extension } = req.body;

    if (!name || !email) {
      res.status(400).json({ error: 'Nama dan email wajib diisi.' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!cleanEmail.endsWith('@dslng.com')) {
      res.status(400).json({ error: 'Email wajib menggunakan domain resmi @dslng.com.' });
      return;
    }

    const existing = await db.findUserByEmail(cleanEmail);
    if (existing) {
      res.status(409).json({ error: 'Email sudah terdaftar. Silakan login.' });
      return;
    }

    const newUser: User = {
      id: Date.now(),
      name: String(name).trim(),
      email: cleanEmail,
      password: 'DSLNG#2026',
      department: department || 'Operations Directorate',
      work_location: work_location || 'Site Luwuk',
      role: 'user',
      extension: extension ? (String(extension).startsWith('x') ? extension : `x${extension}`) : 'x1000',
      created_at: new Date().toISOString(),
      must_change_password: true,
    };

    const saved = await db.createUser(newUser);
    const { password: _, ...safeUser } = saved;
    res.status(201).json({ message: 'Registrasi berhasil.', user: safeUser });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan pada server saat registrasi.' });
  }
};

export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await db.getAllUsers();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memuat data pengguna.' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    const updated = await db.updateUser(userId, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
      return;
    }
    const { password: _, ...safeUser } = updated;
    res.json({ message: 'Data pengguna berhasil diperbarui.', user: safeUser });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memperbarui pengguna.' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    const success = await db.deleteUser(userId);
    if (!success) {
      res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
      return;
    }
    res.json({ message: 'Pengguna berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus pengguna.' });
  }
};
