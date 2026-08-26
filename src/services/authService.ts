import { apiFetch } from './apiClient';
import { User } from '../types';

export const authService = {
  login: async (credentials: { email: string; password?: string }) => {
    return apiFetch<{ message: string; user: User }>('/auth/login', {
      method: 'POST',
      data: credentials,
    });
  },

  register: async (payload: {
    name: string;
    email: string;
    department: string;
    work_location: string;
    extension?: string;
  }) => {
    return apiFetch<{ message: string; user: User }>('/auth/register', {
      method: 'POST',
      data: payload,
    });
  },

  createUser: async (payload: Partial<User>) => {
    return apiFetch<{ message: string; user: User }>('/auth/users', {
      method: 'POST',
      data: payload,
    });
  },

  getUsers: async () => {
    return apiFetch<{ users: User[] }>('/auth/users');
  },

  updateUser: async (id: number, updates: Partial<User>) => {
    return apiFetch<{ message: string; user: User }>(`/auth/users/${id}`, {
      method: 'PUT',
      data: updates,
    });
  },

  deleteUser: async (id: number) => {
    return apiFetch<{ message: string }>(`/auth/users/${id}`, {
      method: 'DELETE',
    });
  },
};
