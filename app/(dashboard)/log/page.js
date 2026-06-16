'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  IconSearch, IconChevronLeft, IconChevronRight,
  IconRefresh, IconAlertCircle, IconFilter,
  IconCalendar, IconUser, IconClock
} from '@tabler/icons-react';
import api from '../../lib/axios';
import { theme } from '../../lib/theme';
import toast, { Toaster } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

const LIMIT = 10;

// Roles yang memiliki akses melihat log
const ROLES_WITH_LOG_ACCESS = [1, 2, 3]; // Superadmin, Manager HRD, HRD Manager

export default function LogAktivitasPage() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const hasAccess = user && ROLES_WITH_LOG_ACCESS.includes(user.id_role);

  const fetchData = useCallback(async () => {
    if (!hasAccess) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit: LIMIT,
        search: search || undefined,
        user: filterUser || undefined,
        module: filterModule || undefined,
        start_date: dateRange.start || undefined,
        end_date: dateRange.end || undefined,
      };

      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      const res = await api.get('/log', { params });
      setData(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(err.response?.data?.message || 'Gagal memuat data log');
      toast.error('Gagal memuat data log');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterUser, filterModule, dateRange, hasAccess]);

  // Fetch users untuk filter
  const fetchUsers = async () => {
    try {
      const res = await api.get('/users?limit=1000');
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Extract unique modules from data
  useEffect(() => {
    if (data.length > 0) {
      const uniqueModules = [...new Set(data.map(item => {
        // Extract module from title or content
        if (item.title) {
          const title = item.title.toLowerCase();
          if (title.includes('pegawai')) return 'Data Pegawai';
          if (title.includes('user') || title.includes('role')) return 'Manajemen User';
          if (title.includes('tunjangan')) return 'Tunjangan';
          if (title.includes('setting')) return 'Setting';
          if (title.includes('login')) return 'Login';
          if (title.includes('logout')) return 'Logout';
        }
        return 'Lainnya';
      }))];
      setModules(uniqueModules);
    }
  }, [data]);

  useEffect(() => {
    if (hasAccess) {
      fetchData();
      fetchUsers();
    }
  }, [hasAccess]);

  useEffect(() => {
    if (hasAccess) {
      fetchData();
    }
  }, [page, search, filterUser, filterModule, dateRange]);

  const handleRefresh = () => {
    fetchData();
    toast.success('Data berhasil diperbarui');
  };

  const handleResetFilter = () => {
    setSearch('');
    setFilterUser('');
    setFilterModule('');
    setDateRange({ start: '', end: '' });
    setPage(1);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getModuleIcon = (title) => {
    if (!title) return '📋';
    const t = title.toLowerCase();
    if (t.includes('pegawai')) return '';
    if (t.includes('user') || t.includes('role')) return '';
    if (t.includes('tunjangan')) return '';
    if (t.includes('setting')) return '';
    if (t.includes('login')) return '';
    if (t.includes('logout')) return '';
    return '📋';
  };

  const getModuleColor = (title) => {
    if (!title) return theme.page.primary;
    const t = title.toLowerCase();
    if (t.includes('pegawai')) return '#2563eb';
    if (t.includes('user') || t.includes('role')) return '#7c3aed';
    if (t.includes('tunjangan')) return '#16a34a';
    if (t.includes('setting')) return '#f59e0b';
    if (t.includes('login')) return '#0891b2';
    if (t.includes('logout')) return '#dc2626';
    return theme.page.textMuted;
  };

  // Jika tidak punya akses
  if (!hasAccess) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="mb-3" style={{ fontSize: '64px' }}>🔒</div>
          <h4 style={{ color: 'var(--text-primary)' }}>Akses Ditolak</h4>
          <p style={{ color: 'var(--text-muted)' }} className="mb-2">
            Anda tidak memiliki akses untuk melihat log aktivitas
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Anda login sebagai: <strong>{user?.nama_role || 'User'}</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Toaster position="top-right" />

      {/* Page header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3" style={{ padding: '0 1rem', margin: 0, width: '100%' }}>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Log Aktivitas
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Riwayat aktivitas semua user dalam sistem
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            <IconRefresh size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Card tabel */}
      <div className="jmc-card">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 p-4"
          style={{ borderBottom: '1px solid var(--border-color)' }}>

          {/* Search */}
          <div className="flex items-center border rounded overflow-hidden"
            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
            <input
              type="text"
              placeholder="Cari data..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="px-3 py-1.5 text-sm outline-none bg-transparent"
              style={{ color: 'var(--text-primary)', width: '180px' }}
            />
            <button className="px-2 py-1.5" style={{ color: 'var(--text-muted)' }}>
              <IconSearch size={16} />
            </button>
          </div>

          {/* Filter User */}
          <select
            value={filterUser}
            onChange={e => { setFilterUser(e.target.value); setPage(1); }}
            className="border rounded px-3 py-1.5 text-sm"
            style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
          >
            <option value="">Semua User</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.nama || u.username}</option>
            ))}
          </select>

          {/* Filter Module */}
          <select
            value={filterModule}
            onChange={e => { setFilterModule(e.target.value); setPage(1); }}
            className="border rounded px-3 py-1.5 text-sm"
            style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
          >
            <option value="">Semua Modul</option>
            {modules.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* Date Range */}
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={dateRange.start}
              onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
              className="border rounded px-2 py-1.5 text-sm"
              style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)', width: '130px' }}
            />
            <span style={{ color: 'var(--text-muted)' }}>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
              className="border rounded px-2 py-1.5 text-sm"
              style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)', width: '130px' }}
            />
          </div>

          {/* Reset Filter */}
          <button
            onClick={handleResetFilter}
            className="px-3 py-1.5 rounded text-sm font-medium"
            style={{
              backgroundColor: 'var(--page-bg)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            Reset Filter
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4" style={{ backgroundColor: '#fef2f2', borderBottom: '1px solid #fecaca' }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#dc2626' }}>
              <IconAlertCircle size={18} />
              <span>{error}</span>
              <button
                onClick={() => { setError(null); fetchData(); }}
                className="ml-auto px-3 py-1 rounded text-xs font-medium"
                style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                Coba Lagi
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--page-bg)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', width: '50px' }}>
                  No
                </th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', width: '150px' }}>
                  Nama User
                </th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', width: '120px' }}>
                  Modul
                </th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
                  Aksi
                </th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', width: '180px' }}>
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: theme.page.primary }} />
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <div className="flex flex-col items-center gap-2">
                      <IconSearch size={32} style={{ color: 'var(--text-muted)' }} />
                      <p>Tidak ada log aktivitas</p>
                    </div>
                  </td>
                </tr>
              ) : data.map((item, i) => (
                <tr
                  key={item.id}
                  style={{ borderBottom: '1px solid var(--border-color)' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--page-bg)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '11px 14px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    {(page - 1) * LIMIT + i + 1}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: theme.page.primary + '20',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: theme.page.primary,
                        }}
                      >
                        {(item.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {item.username || 'System'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: getModuleColor(item.title) + '20',
                        color: getModuleColor(item.title),
                      }}
                    >
                      <span style={{ marginRight: '4px' }}>{getModuleIcon(item.title)}</span>
                      {item.title ? item.title.split(' ')[0] : 'Lainnya'}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-primary)' }}>
                    <div className="flex items-center gap-2">
                      <span>{item.title || 'Aktivitas'}</span>
                      {item.content && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {(() => {
                            try {
                              const content = JSON.parse(item.content);
                              if (content) {
                                return `(${Object.keys(content).map(k => `${k}: ${content[k]}`).join(', ')})`;
                              }
                            } catch {
                              return '';
                            }
                            return '';
                          })()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <div className="flex items-center gap-1">
                      <IconClock size={14} />
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3"
          style={{ borderTop: '1px solid var(--border-color)' }}>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {total > 0 ? `${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, total)} dari ${total} log` : '0 log'}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded"
              style={{
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--card-bg)',
                color: page === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <IconChevronLeft size={15} />
            </button>

            {Array.from({ length: Math.ceil(total / LIMIT) }, (_, i) => i + 1)
              .filter(p => p === 1 || p === Math.ceil(total / LIMIT) || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) => p === '...' ? (
                <span key={`dots-${i}`} className="px-2 text-sm" style={{ color: 'var(--text-muted)' }}>...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-8 h-8 rounded text-sm font-medium"
                  style={{
                    border: '1px solid var(--border-color)',
                    backgroundColor: page === p ? theme.page.primary : 'var(--card-bg)',
                    color: page === p ? '#fff' : 'var(--text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              ))}

            <button
              onClick={() => setPage(p => Math.min(Math.ceil(total / LIMIT), p + 1))}
              disabled={page === Math.ceil(total / LIMIT) || total === 0}
              className="p-1.5 rounded"
              style={{
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--card-bg)',
                color: page === Math.ceil(total / LIMIT) ? 'var(--text-muted)' : 'var(--text-primary)',
                cursor: page === Math.ceil(total / LIMIT) ? 'not-allowed' : 'pointer',
              }}
            >
              <IconChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-4 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        <p>Menampilkan {data.length} dari {total} log aktivitas</p>
      </div>
    </div>
  );
}