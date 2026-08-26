-- ====================================================================
-- DATABASE SCHEMA DEFINITION FOR DSLNG ICT INFORMATION SYSTEM
-- Compatible with PostgreSQL / Cloud SQL / MySQL / SQLite
-- ====================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL, -- 'President Directorate', 'Operations Directorate', 'Finance Directorate', 'Corporate Affairs Director'
    work_location VARCHAR(50) NOT NULL, -- 'Site Luwuk', 'HO Jakarta'
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'admin', 'it_helpdesk', 'leader', 'csbo', 'spmo', 'user'
    extension VARCHAR(50) DEFAULT 'x1000',
    must_change_password BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ASSETS TABLE (IT INVENTORY)
CREATE TABLE IF NOT EXISTS assets (
    id BIGSERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    type_name VARCHAR(50) NOT NULL, -- 'Laptop', 'Desktop', 'Monitor'
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    hostname VARCHAR(100) NOT NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    work_location VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    asset_state VARCHAR(50) DEFAULT 'store', -- 'store', 'use', 'lend', 'broken', 'services'
    installed_apps TEXT[], -- Array of strings in PostgreSQL, or JSON in MySQL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TICKETS TABLE (IT HELPDESK)
CREATE TABLE IF NOT EXISTS tickets (
    id BIGSERIAL PRIMARY KEY,
    ticket_code VARCHAR(50) UNIQUE NOT NULL,
    requester_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    requester_name VARCHAR(255) NOT NULL,
    requester_email VARCHAR(255) NOT NULL,
    requester_extension VARCHAR(50),
    created_by_role VARCHAR(50) NOT NULL DEFAULT 'user',
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Software', 'Hardware', 'Service Lainnya'
    department VARCHAR(100) NOT NULL,
    work_location VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Open', -- 'Open', 'In Progress', 'Resolved', 'Closed'
    resolution_notes TEXT,
    assigned_to VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. ATTENDANCES TABLE (GPS & PHOTO LOG)
CREATE TABLE IF NOT EXISTS attendances (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
    photo_path TEXT, -- Base64 data URL or Cloud Storage URL
    latitude VARCHAR(50) NOT NULL,
    longitude VARCHAR(50) NOT NULL,
    work_location VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Hadir Tepat Waktu',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. LEAVE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS leave_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_department VARCHAR(100) NOT NULL,
    user_work_location VARCHAR(50) NOT NULL,
    user_extension VARCHAR(50),
    reason TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
    current_step INT NOT NULL DEFAULT 1, -- 1: Leader, 2: CSBO, 3: SPMO
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. LEAVE APPROVALS TABLE (3-STEP E-SIGN)
CREATE TABLE IF NOT EXISTS leave_approvals (
    id BIGSERIAL PRIMARY KEY,
    leave_id BIGINT REFERENCES leave_requests(id) ON DELETE CASCADE,
    approver_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    approver_name VARCHAR(255) NOT NULL,
    approver_role VARCHAR(50) NOT NULL, -- 'leader', 'csbo', 'spmo'
    step_order INT NOT NULL, -- 1, 2, or 3
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
    signature_data TEXT, -- Base64 Canvas Drawing
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- 7. ICT DOCUMENTS TABLE (POLICY & WORK INSTRUCTIONS)
CREATE TABLE IF NOT EXISTS ict_documents (
    id BIGSERIAL PRIMARY KEY,
    doc_code VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Policy', 'Work Instruction'
    file_path TEXT NOT NULL,
    uploaded_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    uploaded_by_name VARCHAR(255) NOT NULL,
    size_kb INT NOT NULL DEFAULT 0,
    version VARCHAR(50) DEFAULT 'Rev. 1.0',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR QUERY OPTIMIZATION
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_assets_serial ON assets(serial_number);
CREATE INDEX IF NOT EXISTS idx_tickets_code ON tickets(ticket_code);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_attendances_user ON attendances(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_user ON leave_requests(user_id);

-- DEFAULT ADMIN ACCOUNT
-- Change this password after the first login in a production environment.
INSERT INTO users (name, email, password, department, work_location, role, extension, must_change_password)
VALUES ('Administrator', 'admin.ict@dslng.com', 'TinaDSLNG321', 'Corporate Affairs Director', 'Site Luwuk', 'admin', 'x4401', FALSE)
ON CONFLICT (email) DO NOTHING;
