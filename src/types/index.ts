export type Department = 
  | 'President Directorate'
  | 'Operations Directorate'
  | 'Finance Directorate'
  | 'Corporate Affairs Director';

export type WorkLocation = 'Site Luwuk' | 'HO Jakarta';

export type Role = 'admin' | 'it_helpdesk' | 'leader' | 'csbo' | 'spmo' | 'user';

export type AssetType = 'Laptop' | 'Desktop' | 'Monitor';

export type AssetState = 'store' | 'use' | 'lend' | 'broken' | 'services';

export type TicketCategory = 'Software' | 'Hardware' | 'Service Lainnya';

export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export type CreatedByRole = 'user' | 'it_helpdesk';

export type DocumentCategory = 'Policy' | 'Work Instruction';

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  department: Department;
  work_location: WorkLocation;
  role: Role;
  extension: string;
  created_at: string;
  must_change_password?: boolean;
}

export interface Asset {
  id: number;
  product_name: string;
  type_name: AssetType;
  serial_number: string;
  hostname: string;
  user_id: number | null;
  user_name?: string;
  work_location: WorkLocation;
  location: string; // Detail ruangan
  asset_state?: AssetState; // store | use | lend | broken | services
  installed_apps: string[];
  created_at: string;
}

export interface Ticket {
  id: number;
  ticket_code: string;
  requester_id: number;
  requester_name: string;
  requester_email: string;
  requester_extension?: string;
  created_by_role: CreatedByRole;
  subject: string;
  body: string;
  category: TicketCategory;
  department: Department;
  work_location: WorkLocation;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  resolution_notes?: string;
  assigned_to?: string;
}

export interface Attendance {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  user_role: Role;
  clock_in: string;
  photo_path: string; // Base64 data URL
  latitude: string;
  longitude: string;
  work_location: WorkLocation;
  status: string;
  notes?: string;
  created_at: string;
}

export interface LeaveApproval {
  id: number;
  leave_id: number;
  approver_id: number | null;
  approver_name: string;
  approver_role: 'leader' | 'csbo' | 'spmo';
  step_order: 1 | 2 | 3; // 1: Leader, 2: CSBO, 3: SPMO
  status: 'Pending' | 'Approved' | 'Rejected';
  signature_data: string | null; // Base64 canvas data
  approved_at: string | null;
  notes?: string;
}

export interface LeaveRequest {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  user_department: Department;
  user_work_location: WorkLocation;
  user_extension: string;
  reason: string;
  start_date: string;
  end_date: string;
  total_days: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  current_step: number; // 1, 2, or 3
  created_at: string;
  approvals: LeaveApproval[];
}

export interface IctDocument {
  id: number;
  doc_code: string;
  title: string;
  category: DocumentCategory;
  file_path: string;
  uploaded_by: number;
  uploaded_by_name: string;
  size_kb: number;
  version: string;
  description: string;
  created_at: string;
}

export interface UserPreferences {
  themeDensity: 'comfortable' | 'compact';
  accentTheme: 'dslng_blue' | 'energy_cyan' | 'slate_corporate';
  clockFormat: 'both' | 'local';
  highContrast: boolean;
}
