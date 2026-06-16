const pool = require('../config/db');

const getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      user = '',
      module = '',
      start_date = '',
      end_date = ''
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT a.*, u.username
      FROM activities a
      LEFT JOIN \`user\` u ON a.created_by = u.id
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      query += ` AND (a.title LIKE ? OR a.content LIKE ? OR u.username LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    if (user) {
      query += ` AND a.created_by = ?`;
      params.push(user);
    }

    if (module) {
      query += ` AND a.title LIKE ?`;
      params.push(`%${module}%`);
    }

    if (start_date) {
      query += ` AND DATE(a.created_at) >= ?`;
      params.push(start_date);
    }

    if (end_date) {
      query += ` AND DATE(a.created_at) <= ?`;
      params.push(end_date);
    }

    // Count total
    const countQuery = query.replace(
      /SELECT a\.\*, u\.username/,
      'SELECT COUNT(*) as total'
    );
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0]?.total || 0;

    // Add order and limit
    query += ` ORDER BY a.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);

    res.json({
      success: true,
      data: rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll };