import {
  User,
  Asset,
  Ticket,
  Attendance,
  LeaveRequest,
  IctDocument,
} from '../../src/types';
import { INITIAL_USERS } from '../../src/data/initialData';

/**
 * DATABASE ABSTRACTION LAYER (SERVER-SIDE)
 * 
 * This module manages server-side data persistence.
 * When integrating with PostgreSQL / Cloud SQL / MySQL / SQLite / Firestore:
 * Simply replace the internal CRUD operations below with your DB driver queries (e.g. pg, prisma, drizzle, knex).
 */

class Database {
  private users: User[] = [...INITIAL_USERS];
  private assets: Asset[] = [];
  private tickets: Ticket[] = [];
  private attendances: Attendance[] = [];
  private leaves: LeaveRequest[] = [];
  private documents: IctDocument[] = [];

  // ==========================
  // USERS REPOSITORY
  // ==========================
  public getAllUsers(): User[] {
    return this.users.map(({ password: _, ...u }) => u as User);
  }

  public findUserById(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }

  public findUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  public createUser(user: User): User {
    this.users.push(user);
    return user;
  }

  public updateUser(id: number, updates: Partial<User>): User | null {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.users[idx] = { ...this.users[idx], ...updates };
    return this.users[idx];
  }

  public deleteUser(id: number): boolean {
    const initialLen = this.users.length;
    this.users = this.users.filter(u => u.id !== id);
    return this.users.length < initialLen;
  }

  // ==========================
  // ASSETS REPOSITORY
  // ==========================
  public getAllAssets(): Asset[] {
    return this.assets;
  }

  public createAsset(asset: Asset): Asset {
    this.assets.unshift(asset);
    return asset;
  }

  public updateAsset(id: number, updates: Partial<Asset>): Asset | null {
    const idx = this.assets.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.assets[idx] = { ...this.assets[idx], ...updates };
    return this.assets[idx];
  }

  public deleteAsset(id: number): boolean {
    const initialLen = this.assets.length;
    this.assets = this.assets.filter(a => a.id !== id);
    return this.assets.length < initialLen;
  }

  public bulkInsertAssets(newAssets: Asset[]): Asset[] {
    this.assets = [...newAssets, ...this.assets];
    return this.assets;
  }

  public clearAssets(): void {
    this.assets = [];
  }

  // ==========================
  // TICKETS REPOSITORY
  // ==========================
  public getAllTickets(): Ticket[] {
    return this.tickets;
  }

  public createTicket(ticket: Ticket): Ticket {
    this.tickets.unshift(ticket);
    return ticket;
  }

  public updateTicketStatus(id: number, status: Ticket['status'], notes?: string): Ticket | null {
    const idx = this.tickets.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.tickets[idx] = {
      ...this.tickets[idx],
      status,
      resolution_notes: notes || this.tickets[idx].resolution_notes,
      updated_at: new Date().toISOString(),
    };
    return this.tickets[idx];
  }

  public deleteTicket(id: number): boolean {
    const initialLen = this.tickets.length;
    this.tickets = this.tickets.filter(t => t.id !== id);
    return this.tickets.length < initialLen;
  }

  public clearTickets(): void {
    this.tickets = [];
  }

  // ==========================
  // ATTENDANCES REPOSITORY
  // ==========================
  public getAllAttendances(): Attendance[] {
    return this.attendances;
  }

  public createAttendance(att: Attendance): Attendance {
    this.attendances.unshift(att);
    return att;
  }

  public clearAttendances(): void {
    this.attendances = [];
  }

  // ==========================
  // LEAVE REPOSITORY
  // ==========================
  public getAllLeaves(): LeaveRequest[] {
    return this.leaves;
  }

  public createLeave(leave: LeaveRequest): LeaveRequest {
    this.leaves.unshift(leave);
    return leave;
  }

  public updateLeaveApproval(
    leaveId: number,
    stepOrder: number,
    approverId: number,
    approverName: string,
    status: 'Approved' | 'Rejected',
    signatureData: string,
    notes?: string
  ): LeaveRequest | null {
    const leaveIdx = this.leaves.findIndex(l => l.id === leaveId);
    if (leaveIdx === -1) return null;

    const leave = this.leaves[leaveIdx];
    const approvalIdx = leave.approvals.findIndex(a => a.step_order === stepOrder);

    if (approvalIdx !== -1) {
      leave.approvals[approvalIdx] = {
        ...leave.approvals[approvalIdx],
        approver_id: approverId,
        approver_name: approverName,
        status,
        signature_data: signatureData,
        approved_at: new Date().toISOString(),
        notes: notes || leave.approvals[approvalIdx].notes,
      };
    }

    if (status === 'Rejected') {
      leave.status = 'Rejected';
    } else if (stepOrder === 3 && status === 'Approved') {
      leave.status = 'Approved';
    } else if (status === 'Approved') {
      leave.current_step = stepOrder + 1;
    }

    this.leaves[leaveIdx] = { ...leave };
    return this.leaves[leaveIdx];
  }

  public clearLeaves(): void {
    this.leaves = [];
  }

  // ==========================
  // DOCUMENTS REPOSITORY
  // ==========================
  public getAllDocuments(): IctDocument[] {
    return this.documents;
  }

  public createDocument(doc: IctDocument): IctDocument {
    this.documents.unshift(doc);
    return doc;
  }

  public deleteDocument(id: number): boolean {
    const initialLen = this.documents.length;
    this.documents = this.documents.filter(d => d.id !== id);
    return this.documents.length < initialLen;
  }

  public clearDocuments(): void {
    this.documents = [];
  }
}

export const db = new Database();
