import { apiFetch } from './apiClient';
import { Attendance } from '../types';

export const attendanceService = {
  getAttendances: async () => {
    return apiFetch<{ attendances: Attendance[] }>('/attendance');
  },

  recordAttendance: async (attendance: Partial<Attendance>) => {
    return apiFetch<{ message: string; attendance: Attendance }>('/attendance', {
      method: 'POST',
      data: attendance,
    });
  },

  clearAllAttendances: async () => {
    return apiFetch<{ message: string }>('/attendance/reset/all', {
      method: 'DELETE',
    });
  },
};
