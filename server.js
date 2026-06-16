const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  })
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes - Hanya satu kali registrasi
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/pegawai', require('./src/routes/pegawai'));
app.use('/api/tunjangan', require('./src/routes/tunjangan'));
app.use('/api/roles', require('./src/routes/roles'));  // Hanya sekali
app.use('/api/log', require('./src/routes/log'));

// HAPUS duplikasi ini:
// app.use('/api/roles', roleRoutes);
// app.use('/api/users', userRoutes);

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Master data endpoint
app.get('/api/master-data', async (req, res) => {
  const pool = require('./src/config/db');
  const { tipe } = req.query;
  try {
    const [rows] = await pool.query('SELECT * FROM master_data WHERE tipe = ?', [tipe]);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Root endpoint untuk cek server
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'HRD API Server is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      pegawai: '/api/pegawai',
      tunjangan: '/api/tunjangan',
      roles: '/api/roles',
      logs: '/api/log',
      docs: '/api/docs'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
  console.log(`API Docs: http://localhost:${PORT}/api/docs`);
  console.log(`Auth: http://localhost:${PORT}/api/auth`);
  console.log(`Users: http://localhost:${PORT}/api/users`);
  console.log(`Pegawai: http://localhost:${PORT}/api/pegawai`);
  console.log(`Roles: http://localhost:${PORT}/api/roles`);
});