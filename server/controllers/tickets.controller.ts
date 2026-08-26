import { Request, Response } from 'express';
import { db } from '../db/database';
import { Ticket } from '../../src/types';

export const getTickets = async (_req: Request, res: Response): Promise<void> => {
  try {
    const tickets = await db.getAllTickets();
    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memuat tiket.' });
  }
};

export const createTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requester_id, requester_name, requester_email, requester_extension, created_by_role, subject, body, category, department, work_location } = req.body;

    if (!subject || !body) {
      res.status(400).json({ error: 'Subjek dan deskripsi tiket wajib diisi.' });
      return;
    }

    const newTicket: Ticket = {
      id: Date.now(),
      ticket_code: `TIC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      requester_id: requester_id || 1,
      requester_name: requester_name || 'Karyawan DSLNG',
      requester_email: requester_email || 'user@dslng.com',
      requester_extension: requester_extension || 'x1000',
      created_by_role: created_by_role || 'user',
      subject: String(subject).trim(),
      body: String(body).trim(),
      category: category || 'Software',
      department: department || 'Operations Directorate',
      work_location: work_location || 'Site Luwuk',
      status: 'Open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const saved = await db.createTicket(newTicket);
    res.status(201).json({ message: 'Tiket berhasil dibuat.', ticket: saved });
  } catch (error) {
    res.status(500).json({ error: 'Gagal membuat tiket.' });
  }
};

export const updateTicketStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticketId = Number(req.params.id);
    const { status, notes } = req.body;

    const updated = await db.updateTicketStatus(ticketId, status, notes);
    if (!updated) {
      res.status(404).json({ error: 'Tiket tidak ditemukan.' });
      return;
    }

    res.json({ message: `Status tiket diperbarui menjadi ${status}.`, ticket: updated });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memperbarui status tiket.' });
  }
};

export const deleteTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticketId = Number(req.params.id);
    const success = await db.deleteTicket(ticketId);
    if (!success) {
      res.status(404).json({ error: 'Tiket tidak ditemukan.' });
      return;
    }
    res.json({ message: 'Tiket berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus tiket.' });
  }
};

export const clearTickets = async (_req: Request, res: Response): Promise<void> => {
  try {
    await db.clearTickets();
    res.json({ message: 'Seluruh tiket berhasil dibersihkan.' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mereset data tiket.' });
  }
};
