import { User, Asset, Ticket, Attendance, LeaveRequest, IctDocument } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 1,
    name: 'Administrator',
    email: 'admin.ict@dslng.com',
    password: 'TinaDSLNG321',
    department: 'Corporate Affairs Director',
    work_location: 'Site Luwuk',
    role: 'admin',
    extension: 'x4401',
    created_at: '2025-01-10T08:00:00Z',
    must_change_password: false,
  },
];

export const INITIAL_ASSETS: Asset[] = [];

export const INITIAL_TICKETS: Ticket[] = [];

export const INITIAL_ATTENDANCES: Attendance[] = [];

export const INITIAL_LEAVES: LeaveRequest[] = [];

export const INITIAL_DOCUMENTS: IctDocument[] = [];

