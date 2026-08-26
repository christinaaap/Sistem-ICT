import 'dotenv/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Asset, Ticket, Attendance, LeaveRequest, IctDocument } from '../../src/types';

/**
 * DATABASE ABSTRACTION LAYER (SERVER-SIDE)
 * 
 * Server-side persistence through Supabase. The service-role key must only be
 * used here, never exposed through Vite/client environment variables.
 */

class Database {
  private readonly client: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib dikonfigurasi.');
    }
    this.client = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  }

  private async query<T>(operation: PromiseLike<{ data: T | null; error: { message: string } | null }>): Promise<T> {
    const { data, error } = await operation;
    if (error) throw new Error(error.message);
    if (data === null) throw new Error('Supabase mengembalikan data kosong.');
    return data;
  }

  // ==========================
  // USERS REPOSITORY
  // ==========================
  public async getAllUsers(): Promise<User[]> {
    const users = await this.query(this.client.from('users').select('*').order('id', { ascending: true }));
    return (users as User[]).map(({ password: _, ...user }) => user as User);
  }

  public async findUserById(id: number): Promise<User | undefined> {
    const { data, error } = await this.client.from('users').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    return data as User | undefined;
  }

  public async findUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await this.client.from('users').select('*').ilike('email', email.trim()).maybeSingle();
    if (error) throw new Error(error.message);
    return data as User | undefined;
  }

  public async createUser(user: User): Promise<User> {
    return this.query(this.client.from('users').insert(user).select().single()) as Promise<User>;
  }

  public async updateUser(id: number, updates: Partial<User>): Promise<User | null> {
    const { data, error } = await this.client.from('users').update(updates).eq('id', id).select().maybeSingle();
    if (error) throw new Error(error.message);
    return data as User | null;
  }

  public async deleteUser(id: number): Promise<boolean> {
    const { data, error } = await this.client.from('users').delete().eq('id', id).select('id');
    if (error) throw new Error(error.message);
    return Boolean(data?.length);
  }

  // ==========================
  // ASSETS REPOSITORY
  // ==========================
  public async getAllAssets(): Promise<Asset[]> {
    return this.query(this.client.from('assets').select('*').order('id', { ascending: false })) as Promise<Asset[]>;
  }

  public async createAsset(asset: Asset): Promise<Asset> {
    return this.query(this.client.from('assets').insert(asset).select().single()) as Promise<Asset>;
  }

  public async updateAsset(id: number, updates: Partial<Asset>): Promise<Asset | null> {
    const { data, error } = await this.client.from('assets').update(updates).eq('id', id).select().maybeSingle();
    if (error) throw new Error(error.message);
    return data as Asset | null;
  }

  public async deleteAsset(id: number): Promise<boolean> {
    const { data, error } = await this.client.from('assets').delete().eq('id', id).select('id');
    if (error) throw new Error(error.message);
    return Boolean(data?.length);
  }

  public async bulkInsertAssets(newAssets: Asset[]): Promise<Asset[]> {
    return this.query(this.client.from('assets').insert(newAssets).select()) as Promise<Asset[]>;
  }

  public async clearAssets(): Promise<void> {
    await this.query(this.client.from('assets').delete().neq('id', 0).select('id'));
  }

  // ==========================
  // TICKETS REPOSITORY
  // ==========================
  public async getAllTickets(): Promise<Ticket[]> {
    return this.query(this.client.from('tickets').select('*').order('id', { ascending: false })) as Promise<Ticket[]>;
  }

  public async createTicket(ticket: Ticket): Promise<Ticket> {
    return this.query(this.client.from('tickets').insert(ticket).select().single()) as Promise<Ticket>;
  }

  public async updateTicketStatus(id: number, status: Ticket['status'], notes?: string): Promise<Ticket | null> {
    const { data, error } = await this.client.from('tickets').update({ status, resolution_notes: notes, updated_at: new Date().toISOString() }).eq('id', id).select().maybeSingle();
    if (error) throw new Error(error.message);
    return data as Ticket | null;
  }

  public async deleteTicket(id: number): Promise<boolean> {
    const { data, error } = await this.client.from('tickets').delete().eq('id', id).select('id');
    if (error) throw new Error(error.message);
    return Boolean(data?.length);
  }

  public async clearTickets(): Promise<void> {
    await this.query(this.client.from('tickets').delete().neq('id', 0).select('id'));
  }

  // ==========================
  // ATTENDANCES REPOSITORY
  // ==========================
  public async getAllAttendances(): Promise<Attendance[]> {
    return this.query(this.client.from('attendances').select('*').order('id', { ascending: false })) as Promise<Attendance[]>;
  }

  public async createAttendance(att: Attendance): Promise<Attendance> {
    return this.query(this.client.from('attendances').insert(att).select().single()) as Promise<Attendance>;
  }

  public async clearAttendances(): Promise<void> {
    await this.query(this.client.from('attendances').delete().neq('id', 0).select('id'));
  }

  // ==========================
  // LEAVE REPOSITORY
  // ==========================
  public async getAllLeaves(): Promise<LeaveRequest[]> {
    const leaves = await this.query(this.client.from('leave_requests').select('*, approvals:leave_approvals(*)').order('id', { ascending: false }));
    return leaves as LeaveRequest[];
  }

  public async createLeave(leave: LeaveRequest): Promise<LeaveRequest> {
    const { approvals, ...leaveData } = leave;
    const saved = await this.query(this.client.from('leave_requests').insert(leaveData).select().single()) as LeaveRequest;
    const { error } = await this.client.from('leave_approvals').insert(approvals);
    if (error) throw new Error(error.message);
    return { ...saved, approvals };
  }

  public async updateLeaveApproval(
    leaveId: number,
    stepOrder: number,
    approverId: number,
    approverName: string,
    status: 'Approved' | 'Rejected',
    signatureData: string,
    notes?: string
  ): Promise<LeaveRequest | null> {
    const leave = await this.findLeaveById(leaveId);
    if (!leave) return null;
    const nextStatus = status === 'Rejected' ? 'Rejected' : stepOrder === 3 ? 'Approved' : leave.status;
    const currentStep = status === 'Approved' && stepOrder < 3 ? stepOrder + 1 : leave.current_step;
    await this.query(this.client.from('leave_approvals').update({ approver_id: approverId, approver_name: approverName, status, signature_data: signatureData, approved_at: new Date().toISOString(), notes }).eq('leave_id', leaveId).eq('step_order', stepOrder).select());
    await this.query(this.client.from('leave_requests').update({ status: nextStatus, current_step: currentStep }).eq('id', leaveId).select());
    return this.findLeaveById(leaveId);
  }

  private async findLeaveById(id: number): Promise<LeaveRequest | null> {
    const { data, error } = await this.client.from('leave_requests').select('*, approvals:leave_approvals(*)').eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    return data as LeaveRequest | null;
  }

  public async clearLeaves(): Promise<void> {
    await this.query(this.client.from('leave_requests').delete().neq('id', 0).select('id'));
  }

  // ==========================
  // DOCUMENTS REPOSITORY
  // ==========================
  public async getAllDocuments(): Promise<IctDocument[]> {
    return this.query(this.client.from('ict_documents').select('*').order('id', { ascending: false })) as Promise<IctDocument[]>;
  }

  public async createDocument(doc: IctDocument): Promise<IctDocument> {
    return this.query(this.client.from('ict_documents').insert(doc).select().single()) as Promise<IctDocument>;
  }

  public async deleteDocument(id: number): Promise<boolean> {
    const { data, error } = await this.client.from('ict_documents').delete().eq('id', id).select('id');
    if (error) throw new Error(error.message);
    return Boolean(data?.length);
  }

  public async clearDocuments(): Promise<void> {
    await this.query(this.client.from('ict_documents').delete().neq('id', 0).select('id'));
  }
}

export const db = new Database();
