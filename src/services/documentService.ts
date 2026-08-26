import { apiFetch } from './apiClient';
import { IctDocument } from '../types';

export const documentService = {
  getDocuments: async () => {
    return apiFetch<{ documents: IctDocument[] }>('/documents');
  },

  uploadDocument: async (doc: Partial<IctDocument>) => {
    return apiFetch<{ message: string; document: IctDocument }>('/documents', {
      method: 'POST',
      data: doc,
    });
  },

  deleteDocument: async (id: number) => {
    return apiFetch<{ message: string }>(`/documents/${id}`, {
      method: 'DELETE',
    });
  },

  clearAllDocuments: async () => {
    return apiFetch<{ message: string }>('/documents/reset/all', {
      method: 'DELETE',
    });
  },
};
