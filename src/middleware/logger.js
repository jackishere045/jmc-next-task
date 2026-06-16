const pool = require('../config/db');
const { parseUA } = require('../utils/helpers');

const logActivity = async ({ userId, title, content, req }) => {
  try {
    const ua = req.headers['user-agent'] || '';
    const { browser, platform } = parseUA(ua);
    const ip = req.ip || req.connection?.remoteAddress || '';
    const url = req.originalUrl || '';
    const now = new Date();

    await pool.query(
      `INSERT INTO activities (title, content, ua, ip, url, browser, platform, created_at, updated_at, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, JSON.stringify(content), ua, ip, url, browser, platform, now, now, userId, userId]
    );
  } catch (err) {
    console.error('Log error:', err.message);
  }
};

module.exports = { logActivity };