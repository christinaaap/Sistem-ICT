import { apiFetch } from './apiClient';

export const aiService = {
  diagnoseTicket: async (ticketData: {
    subject: string;
    description: string;
    category: string;
    workLocation: string;
  }) => {
    return apiFetch<{ diagnosis: string; isAiPowered: boolean; error?: string }>('/ai/diagnose', {
      method: 'POST',
      data: ticketData,
    });
  },
};
