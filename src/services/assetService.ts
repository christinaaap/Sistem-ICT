import { apiFetch } from './apiClient';
import { Asset } from '../types';

export const assetService = {
  getAssets: async () => {
    return apiFetch<{ assets: Asset[] }>('/assets');
  },

  createAsset: async (asset: Partial<Asset>) => {
    return apiFetch<{ message: string; asset: Asset }>('/assets', {
      method: 'POST',
      data: asset,
    });
  },

  updateAsset: async (id: number, updates: Partial<Asset>) => {
    return apiFetch<{ message: string; asset: Asset }>(`/assets/${id}`, {
      method: 'PUT',
      data: updates,
    });
  },

  deleteAsset: async (id: number) => {
    return apiFetch<{ message: string }>(`/assets/${id}`, {
      method: 'DELETE',
    });
  },

  bulkImport: async (assets: Partial<Asset>[]) => {
    return apiFetch<{ message: string; assets: Asset[] }>('/assets/bulk', {
      method: 'POST',
      data: { assets },
    });
  },

  clearAllAssets: async () => {
    return apiFetch<{ message: string }>('/assets/reset/all', {
      method: 'DELETE',
    });
  },
};
