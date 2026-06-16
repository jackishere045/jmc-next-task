'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  IconSearch, IconChevronLeft, IconChevronRight,
  IconShield, IconLock, IconEye, IconAlertCircle
} from '@tabler/icons-react';
import api from '../../lib/axios';
import { theme } from '../../lib/theme';
import toast, { Toaster } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

const LIMIT = 10;

// Hanya Superadmin yang bisa mengakses manage role
const ROLES_WITH_ROLE_MANAGEMENT = [1];

export default function ManajemenRolePage() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const hasAccess = user && ROLES_WITH_ROLE_MANAGEMENT.includes(user.id_role);

  const fetchData = useCallback(async () => {
    if (!hasAccess) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/roles');
      let filtered = res.data.data || [];
      if (search) {
        filtered = filtered.filter(r =>
          r.nama_role.toLowerCase().includes(search.toLowerCase())
        );
      }
      setTotal(filtered.length);
      const start = (page - 1) * LIMIT;
      setData(filtered.slice(start, start + LIMIT));
    } catch (err) {
      console.error('Error fetching roles:', err);
      if (err.response?.status === 403) {
        setError('Anda tidak memiliki akses untuk melihat data role');
      } else {
        setError(err.response?.data?.message || 'Gagal memuat data role');
      }
      toast.error('Gagal memuat data role');
    } finally {
      setLoading(false);
    }
  }, [page, search, hasAccess]);

  useEffect(() => {
    if (hasAccess) {
      fetchData();
    }
  }, [fetchData, hasAccess]);

  // Jika tidak punya akses
  if (!hasAccess && !loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '500px' }}>
        <div className="text-center" style={{ maxWidth: '400px' }}>
          <div 
            className="mx-auto mb-4 rounded-full d-flex align-items-center justify-content-center"
            style={{ 
              width: '80px', 
              height: '80px',
              backgroundColor: 'var(--page-bg)',
              border: '2px solid var(--border-color)',
            }}
          >
            <IconLock size={40} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Akses Ditolak</h4>
          <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>
            Hanya Superadmin yang dapat mengakses halaman ini
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
            Manajemen Role
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Kelola role dan hak akses pengguna
          </p>
        </div>
      </div>

      {/* Card tabel */}
      <div className="jmc-card">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 p-4"
          style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center border rounded overflow-hidden ml-auto"
            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
            <input
              type="text"
              placeholder="Cari role..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="px-3 py-1.5 text-sm outline-none bg-transparent"
              style={{ color: 'var(--text-primary)', width: '200px' }}
            />
            <button className="px-2 py-1.5" style={{ color: 'var(--text-muted)' }}>
              <IconSearch size={16} />
            </button>
          </div>
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
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
                  Role
                </th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
                  Deskripsi
                </th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', width: '120px' }}>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: theme.page.primary }} />
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Tidak ada data role
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
                  <td style={{ padding: '11px 14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                    <div className="flex items-center gap-2">
                      <IconShield size={16} style={{ color: theme.page.primary }} />
                      {item.nama_role}
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-muted)' }}>
                    {item.deskripsi || `Role untuk ${item.nama_role}`}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <Link
                      href={`/roles/${item.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: theme.page.primary + '15',
                        color: theme.page.primary,
                        textDecoration: 'none',
                      }}
                    >
                      <IconEye size={14} /> Hak Akses
                    </Link>
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
            {total > 0 ? `${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, total)} dari ${total} data` : '0 data'}
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
    </div>
  );
}