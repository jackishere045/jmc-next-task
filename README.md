# Sistem Manajemen Kepegawaian

Sistem HRIS berbasis **Next.js (FE)** + **Express.js (BE)** + **MariaDB**.

---

## 🚀 Tech Stack

| Stack | Teknologi |
|-------|-----------|
| **Frontend** | Next.js 14, React, Tailwind, Bootstrap, ApexCharts |
| **Backend** | Node.js, Express.js, JWT, Multer |
| **Database** | MariaDB |
| **Auth** | JWT + bcrypt |

---

## 📁 Struktur Proyek

```
kepegawaian/
├── frontend/          # Next.js (Port 3000)
│   ├── app/          # Pages (dashboard, pegawai, profile, login)
│   ├── components/   # Sidebar, Navbar, etc
│   ├── hooks/        # useAuth
│   ├── lib/          # axios, theme
│   └── .env.local
│
├── backend/           # Express.js (Port 5000)
│   ├── uploads/      # Foto pegawai
│   ├── controllers/  # auth, pegawai, masterData
│   ├── middleware/   # auth, rbac, logger
│   ├── routes/       # API routes
│   └── .env
│
└── database/
    └── schema.sql    # Database schema
```

---

## 🔧 Instalasi

### 1. Database (MariaDB)

```sql
CREATE DATABASE kepegawaian;
USE kepegawaian;
SOURCE database/schema.sql;
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env (isi DB_PASSWORD)
npm run dev
# Running di http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local (isi NEXT_PUBLIC_API_URL)
npm run dev
# Running di http://localhost:3000
```

## ✨ Fitur

- ✅ Login JWT + RBAC (Superadmin/Admin/HRD/Pegawai)
- ✅ CRUD Pegawai + Upload Foto
- ✅ Dashboard dengan Chart
- ✅ Profile & Ganti Password
- ✅ Search, Filter, Pagination
- ✅ Dark/Light Mode

---

## 👤 Role & User untuk testing

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Superadmin |
| hrd.manager | manager123 | Manager HRD |
| hrd.admin | hrd123 | Admin HRD |
