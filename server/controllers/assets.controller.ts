import { Request, Response } from 'express';
import { db } from '../db/database';
import { Asset } from '../../src/types';

export const getAssets = async (_req: Request, res: Response): Promise<void> => {
  try {
    const assets = await db.getAllAssets();
    res.json({ assets });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memuat data aset.' });
  }
};

export const createAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { product_name, type_name, serial_number, hostname, user_id, user_name, work_location, location, asset_state, installed_apps } = req.body;

    if (!product_name || !serial_number || !hostname) {
      res.status(400).json({ error: 'Nama produk, nomor seri, dan hostname wajib diisi.' });
      return;
    }

    const newAsset: Asset = {
      id: Date.now(),
      product_name,
      type_name: type_name || 'Laptop',
      serial_number: String(serial_number).trim(),
      hostname: String(hostname).trim(),
      user_id: user_id || null,
      user_name: user_name || 'Belum Ditugaskan',
      work_location: work_location || 'Site Luwuk',
      location: location || 'Warehouse ICT',
      asset_state: asset_state || 'store',
      installed_apps: Array.isArray(installed_apps) ? installed_apps : [],
      created_at: new Date().toISOString(),
    };

    const saved = await db.createAsset(newAsset);
    res.status(201).json({ message: 'Aset berhasil didaftarkan.', asset: saved });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menyimpan aset baru.' });
  }
};

export const updateAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const assetId = Number(req.params.id);
    const updated = await db.updateAsset(assetId, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Aset tidak ditemukan.' });
      return;
    }
    res.json({ message: 'Data aset berhasil diperbarui.', asset: updated });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memperbarui aset.' });
  }
};

export const deleteAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const assetId = Number(req.params.id);
    const success = await db.deleteAsset(assetId);
    if (!success) {
      res.status(404).json({ error: 'Aset tidak ditemukan.' });
      return;
    }
    res.json({ message: 'Aset berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus aset.' });
  }
};

export const bulkImportAssets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assets } = req.body;
    if (!Array.isArray(assets) || assets.length === 0) {
      res.status(400).json({ error: 'Data aset massal tidak valid.' });
      return;
    }

    const formattedAssets: Asset[] = assets.map((a: Partial<Asset>, idx: number) => ({
      id: Date.now() + idx,
      product_name: a.product_name || 'Generic Device',
      type_name: a.type_name || 'Laptop',
      serial_number: a.serial_number || `SN-IMP-${Date.now()}-${idx}`,
      hostname: a.hostname || `HOST-IMP-${idx}`,
      user_id: a.user_id || null,
      user_name: a.user_name || 'Belum Ditugaskan',
      work_location: a.work_location || 'Site Luwuk',
      location: a.location || 'Warehouse ICT',
      asset_state: a.asset_state || 'store',
      installed_apps: Array.isArray(a.installed_apps) ? a.installed_apps : [],
      created_at: new Date().toISOString(),
    }));

    const result = await db.bulkInsertAssets(formattedAssets);
    res.status(201).json({ message: `${formattedAssets.length} aset berhasil diimpor.`, assets: result });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengimpor aset.' });
  }
};

export const clearAssets = async (_req: Request, res: Response): Promise<void> => {
  try {
    await db.clearAssets();
    res.json({ message: 'Seluruh data aset berhasil dibersihkan.' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mereset data aset.' });
  }
};
