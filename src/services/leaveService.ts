import { apiFetch } from './apiClient';
import { LeaveRequest } from '../types';

export const leaveService = {
  getLeaves: async () => {
    return apiFetch<{ leaves: LeaveRequest[] }>('/leave');
  },

  createLeave: async (leave: Partial<LeaveRequest>) => {
    return apiFetch<{ message: string; leave: LeaveRequest }>('/leave', {
      method: 'POST',
      data: leave,
    });
  },

  signApproval: async (
    leaveId: number,
    approvalData: {
      step_order: number;
      approver_id: number;
      approver_name: string;
      status: 'Approved' | 'Rejected';
      signature_data: string;
      notes?: string;
    }
  ) => {
    return apiFetch<{ message: string; leave: LeaveRequest }>(`/leave/${leaveId}/sign`, {
      method: 'POST',
      data: approvalData,
    });
  },

  clearAllLeaves: async () => {
    return apiFetch<{ message: string }>('/leave/reset/all', {
      method: 'DELETE',
    });
  },
};
