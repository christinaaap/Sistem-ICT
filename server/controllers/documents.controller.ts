import { Request, Response } from 'express';
import { db } from '../db/database';
import { IctDocument } from '../../src/types';

export const getDocuments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const documents = await db.getAllDocuments();
    res.json({ documents });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memuat repositori dokumen.' });
  }
};

export const uploadDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doc_code, title, category, file_path, uploaded_by, uploaded_by_name, size_kb, version, description } = req.body;

    if (!doc_code || !title) {
      res.status(400).json({ error: 'Nomor kode dokumen dan judul wajib diisi.' });
      return;
    }

    const newDoc: IctDocument = {
      id: Date.now(),
      doc_code: String(doc_code).trim(),
      title: String(title).trim(),
      category: category || 'Policy',
      file_path: file_path || `/docs/${doc_code}.pdf`,
      uploaded_by: Number(uploaded_by) || 1,
      uploaded_by_name: uploaded_by_name || 'Administrator ICT',
      size_kb: Number(size_kb) || 1024,
      version: version || 'Rev. 1.0',
      description: description || '',
      created_at: new Date().toISOString(),
    };

    const saved = await db.createDocument(newDoc);
    res.status(201).json({ message: 'Dokumen berhasil diunggah.', document: saved });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengunggah dokumen.' });
  }
};

export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const docId = Number(req.params.id);
    const success = await db.deleteDocument(docId);
    if (!success) {
      res.status(404).json({ error: 'Dokumen tidak ditemukan.' });
      return;
    }
    res.json({ message: 'Dokumen berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus dokumen.' });
  }
};

export const clearDocuments = async (_req: Request, res: Response): Promise<void> => {
  try {
    await db.clearDocuments();
    res.json({ message: 'Seluruh repositori dokumen berhasil dibersihkan.' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mereset data dokumen.' });
  }
};
