// scripts/update-password.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

async function updatePassword() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kepegawaian',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    const username = 'hrd.admin';
    const newPassword = 'hrd123';
    
    // Hash password
    const hash = await bcrypt.hash(newPassword, 12);
    console.log('📝 Password hash:', hash);
    
    // Update database
    const [result] = await pool.query(
      'UPDATE `user` SET password_hash = ? WHERE username = ?',
      [hash, username]
    );
    
    if (result.affectedRows > 0) {
      console.log(`✅ Password untuk '${username}' berhasil diupdate ke '${newPassword}'`);
    } else {
      console.log(`❌ User '${username}' tidak ditemukan`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

updatePassword();