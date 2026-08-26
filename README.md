# ICT Operations & Information System - PT Donggi-Senoro LNG (DSLNG)

![PT Donggi-Senoro LNG ICT Portal](https://img.shields.io/badge/PT%20Donggi--Senoro%20LNG-ICT%20Department-004380?style=for-the-badge)
![React 19](https://img.shields.io/badge/React-19.0.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.1.14-38B2AC?style=for-the-badge&logo=tailwind-css)
![Express](https://img.shields.io/badge/Express-4.21.2-000000?style=for-the-badge&logo=express)
![Vite](https://img.shields.io/badge/Vite-6.2.3-646CFF?style=for-the-badge&logo=vite)

---

## 📌 Ringkasan Sistem (Executive Overview)

**ICT Operations & Information System** adalah portal terintegrasi satu pintu (*One-Stop Enterprise Portal*) yang dikembangkan khusus untuk mengelola operasional teknologi informasi dan komunikasi (**ICT**) di lingkungan **PT Donggi-Senoro LNG (DSLNG)**. 

Sistem ini menghubungkan seluruh alur operasional antara dua lokasi utama:
1. **Site Batui Luwuk** (Kilang LNG, Kabupaten Banggai, Sulawesi Tengah)
2. **Head Office Jakarta** (Sentral Senayan II Lt. 17, Jl. Asia Afrika No. 8, Gelora Bung Karno, Jakarta Pusat)

---

## 🚀 Fitur Utama & Modul Terintegrasi

### 1. 📊 Dashboard Terpadu & Live Operational Feed
- **Live Ticket SLA Feed**: Memantau tiket penanganan kendala yang dibuat oleh Staff & IT Helpdesk secara real-time (*Open*, *In Progress*, *Resolved/Closed*).
- **Distribusi Beban 4 Direktorat**: Analisis sebaran tiket pada *Operations Directorate*, *Finance Directorate*, *Commercial & HR Directorate*, dan *Technical/President Directorate*.
- **Asset Status Live Summary**: Ringkasan jumlah dan kondisi fisik perangkat kilang & HO.

### 2. 🎫 Helpdesk Ticketing System (ITIL Compliant)
- **Registrasi & Penanganan Tiket**: Form pengajuan kendala perangkat (*Hardware*, *Software*, *Network / VPN*, *Email & Account*, *SAP / ERP*, *Printer / Scanner*).
- **Prioritas & SLA**: Klasifikasi tingkat urgensi (*Critical*, *High*, *Medium*, *Low*) dengan indikator waktu respon.
- **Riwayat Penanganan & Status Update**: IT Helpdesk Officer dapat mengubah status dan mencatat log tindak lanjut solusi teknis.

### 3. 💻 Manajemen Data Aset ICT (IT Asset Management)
- **5 Standar Kondisi Aset (*Asset State*)**:
  - `In Use (Aktif)`: Perangkat sedang digunakan oleh karyawan aktif.
  - `In Store (Gudang)`: Perangkat tersimpan di rak inventaris ICT dan siap dialokasikan.
  - `In Lend (Dipinjam)`: Peminjaman sementara untuk kebutuhan meeting, audit, atau dinas luar.
  - `In Services (Servis)`: Perangkat sedang dalam proses perbaikan hardware/vendor.
  - `Broken (Afkir)`: Perangkat rusak permanen / siap proses penghapusan (*disposal*).
- **Standar Naming Hostname**: Mendukung format resmi (contoh: `JKT-LTP-001`, `LWK-DSK-002`, `LWK-SRV-001`).
- **Bulk Import & Export Excel**: Impor data massal ratusan aset dari file spreadsheet Excel `.xlsx` / `.csv` secara instan.

### 4. 📍 Presensi Geolocation & Kamera Selfie (Helpdesk Attendance)
- **Radius Validasi GPS Akurat**:
  - *Site Luwuk*: Area Kilang Batui (`-1.2721, 122.5851` radius 1000m).
  - *HO Jakarta*: Gedung Sentral Senayan II (`-6.2255, 106.7997` radius 200m).
- **Verifikasi Wajah / Selfie**: Foto absensi langsung via webcam/kamera laptop dengan *watermark* koordinat dan stempel waktu.
- **Log Clock-in & Clock-out**: Catatan kehadiran harian tersimpan rapi untuk kebutuhan monitoring shift.

### 5. ✍️ Manajemen Cuti & Multi-Level E-Signature (Leave Management)
- **Pengajuan Cuti Karyawan / Roster**: Cuti tahunan, cuti sakit, dan cuti roster lapangan Site Luwuk.
- **Persetujuan Berjenjang (*Multi-Tier Approval*)**:
  - *Team Leader Approval*
  - *CSBO Approver* (Corporate Services & Business Operations)
  - *SPMO Executive Approval* (Strategic Project Management Office)
- **Tanda Tangan Digital (*Digital Canvas E-Signature*)**: Setiap *approver* dapat membubuhkan tanda tangan langsung di layar secara tersumpah dan terverifikasi.

### 6. 🏢 Profil ICT, Peta Satelit & Kebijakan Resmi (*Work Instructions*)
- **Peta Lokasi Interaktif**: Koordinat satelit resolusi tinggi Site Batui Luwuk dan HO Senayan Jakarta.
- **Dokumen Tata Kelola & Cybersecurity**: Akses langsung pedoman resmi keamanan data (*Acceptable Use Policy*, *Information Security Standard*, SOP Penanganan Insiden Siber).

### 7. 🛡️ Role-Based Access Control (RBAC) & Manajemen Persona
Sistem menerapkan pembatasan hak akses berjenjang:
- `admin` (*Administrator ICT*): Hak akses tak terbatas ke seluruh modul, konfigurasi user, dan master aset.
- `it_helpdesk` (*IT Helpdesk Officer*): Penanganan tiket layanan, kelola inventaris aset, dan input presensi.
- `leader` (*Team Leader*): Manajemen tiket divisi dan persetujuan cuti tahap 1.
- `csbo` (*CSBO Approver*): Verifikasi alur administrasi dan persetujuan cuti tahap 2.
- `spmo` (*SPMO Executive*): Persetujuan akhir manajerial dan tinjauan laporan eksekutif.
- `user` (*Karyawan / Staff*): Akses tiket helpdesk pribadi, status permohonan cuti, dan profil ICT.

---

## 🔑 Akun & Kredensial Default

| Peran (Role) | Email Login | Password Default | Keterangan |
| :--- | :--- | :--- | :--- |
| **Administrator ICT** | `admin.ict@dslng.com` | `TinaDSLNG321` | Akun utama administrator sistem |
| **Registrasi Karyawan Baru** | *email@dslng.com* | `DSLNG#2026` | Otomatis dibuat dengan role Staff/User, role dapat disesuaikan oleh Admin |

---

## 🛠️ Arsitektur & Teknologi (Tech Stack)

### Frontend
- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Iconography**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion (Framer Motion)](https://motion.dev/)
- **Alerts & Modals**: [SweetAlert2](https://sweetalert2.github.io/)
- **Excel Processor**: [SheetJS (xlsx)](https://docs.sheetjs.com/)

### Backend
- **Server**: [Express.js](https://expressjs.com/)
- **Runtime**: Node.js dengan modul [TSX](https://github.com/privatenumber/tsx)
- **Bundler Production**: [esbuild](https://esbuild.github.io/)
- **Keamanan**: Proxy API Server-side untuk proteksi kredensial.
- **Database**: Supabase PostgreSQL melalui `@supabase/supabase-js`.

---

## 📦 Struktur Direktori Proyek

```text
├── .env.example                 # Template variabel lingkungan
├── index.html                   # HTML Entry point
├── metadata.json                # Pengaturan kapabilitas & izin aplikasi
├── package.json                 # Daftar dependensi & npm scripts
├── tsconfig.json                # Konfigurasi TypeScript
├── vite.config.ts               # Konfigurasi bundler Vite & Tailwind v4
│
├── server.ts                    # Backend Express API & Vite Middleware Server
├── server/                      # Modul backend server
│   ├── controllers/             # Controller REST API (Auth, Ticket, Asset, Attendance, Leave)
│   └── db/                      # Database in-memory & persistent seed engine
│
└── src/                         # Frontend Application Source Code
    ├── main.tsx                 # Entry point React
    ├── App.tsx                  # Root state controller & modular view switcher
    ├── index.css                # Global style & Tailwind CSS v4 directives
    ├── types.ts                 # Definisi tipe global TypeScript (User, Asset, Ticket, dll.)
    ├── data/
    │   └── initialData.ts       # Master data inisialisasi awal (Single Admin TinaDSLNG321)
    └── components/
        ├── admin/               # Modul Manajemen User & Switcher Role
        ├── assets/              # Modul Manajemen Data Aset Perangkat ICT
        ├── attendance/          # Modul Absensi Geolocation & Kamera Wajah
        ├── auth/                # Halaman Login & Registrasi Karyawan
        ├── common/              # Komponen navigasi Navbar & Sidebar
        ├── dashboard/           # Modul Dashboard terpadu & Live Feed
        ├── helpdesk/            # Modul IT Helpdesk Ticketing System
        ├── leave/               # Modul Pengajuan Cuti & E-Sign Signature
        └── profile/             # Modul Profil ICT, Satelit Map & Policy Docs
```

---

## 💻 Panduan Instalasi & Menjalankan Aplikasi

### 1. Prasyarat Sistem
- Node.js versi 18.x atau lebih baru
- npm, pnpm, atau bun package manager

### 2. Kloning Repositori
```bash
git clone https://github.com/username/dslng-ict-system.git
cd dslng-ict-system
```

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Menjalankan di Mode Development
Salin `.env.example` menjadi `.env`, kemudian isi `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` dari Supabase Dashboard > Project Settings > API. Jalankan seluruh isi [server/db/schema.sql](server/db/schema.sql) sekali melalui Supabase SQL Editor untuk membuat tabel dan akun admin default. `SUPABASE_SERVICE_ROLE_KEY` hanya boleh berada di server dan jangan pernah dikomit ke repositori.

```bash
copy .env.example .env
```

### 5. Menjalankan di Mode Development
```bash
npm run dev
```
Aplikasi akan aktif dan dapat diakses di browser pada: `http://localhost:3000`

### 6. Kompilasi & Build Production
```bash
# Melakukan build frontend dan server bundle CJS
npm run build

# Menjalankan server production
npm run start
```

### 7. Pengecekan Kualitas Kode & Tipe (Linting)
```bash
npm run lint
```

---

## 🔒 Izin Browser yang Diperlukan

Untuk fungsionalitas optimal pada modul presensi:
- **Kamera (Webcam)**: Diperlukan untuk modul foto *selfie attendance*.
- **Geolocation (GPS)**: Diperlukan untuk memvalidasi koordinat radius Site Luwuk & HO Jakarta.

---

## 🏢 Kepemilikan & Hak Cipta

Aplikasi ini dikembangkan untuk operasional internal **Departemen ICT - PT Donggi-Senoro LNG**.  
Seluruh hak cipta, merek dagang, dan data operasional dilindungi oleh kebijakan keamanan informasi perusahaan.

*PT Donggi-Senoro LNG &bull; Energing the Future with Integrity & Excellence.*
