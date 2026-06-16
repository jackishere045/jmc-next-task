# Backend API - Sistem Manajemen Kepegawaian

Backend REST API untuk sistem manajemen kepegawaian menggunakan **Express.js** + **MariaDB**.

---

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: MariaDB 10.x
- **Auth**: JWT + bcrypt
- **File Upload**: Multer
- **CORS**: Enabled

---

## 📁 Struktur Folder

```
backend/
├── uploads/                 # Tempat foto pegawai
├── src/
│   ├── config/
│   │   └── db.js           # Koneksi database
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── pegawaiController.js
│   │   └── masterDataController.js
│   ├── middleware/
│   │   ├── auth.js         # Verify JWT
│   │   ├── rbac.js         # Role-based access
│   │   └── logger.js       # Activity log
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── pegawaiRoutes.js
│   │   └── masterDataRoutes.js
│   ├── utils/
│   │   └── helpers.js      # Helper functions
│   └── app.js              # Main app
├── .env
├── package.json
└── server.js
```

---

## 🚀 Instalasi & Running

```bash
# Clone & masuk folder
git clone <repo-url>
cd backend

# Install dependencies
npm install

# Copy environment
cp .env.example .env

# Edit .env (isi konfigurasi database)
nano .env

# Jalankan
npm run dev
# Server running di http://localhost:5000
```


---

**Backend running at**: `http://localhost:5000`
