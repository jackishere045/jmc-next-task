'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  IconPlus, IconPencil, IconTrash, IconSearch,
  IconChevronLeft, IconChevronRight, IconSelector,
  IconLock, IconAlertCircle
} from '@tabler/icons-react';
import api from '../../lib/axios';
import { theme } from '../../lib/theme';
import toast, { Toaster } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

const LIMIT = 10;

// Hanya Superadmin yang bisa mengakses manajemen user
const ROLES_WITH_USER_MANAGEMENT = [1];

export default function ManajemenUserPage() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [roles, setRoles] = useState([]);
  const [sort, setSort] = useState('id');
  const [order, setOrder] = useState('ASC');

  // Modal hapus
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const hasAccess = user && ROLES_WITH_USER_MANAGEMENT.includes(user.id_role);

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
        sort, 
        order,
        search: search || undefined,
        role: filterRole || undefined,
        status: filterStatus || undefined,
      };
      
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      const res = await api.get('/users', { params });
      setData(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
      if (err.response?.status === 403) {
        setError('Anda tidak memiliki akses untuk melihat data user');
      } else {
        setError(err.response?.data?.message || 'Gagal memuat data user');
      }
      toast.error('Gagal memuat data user');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterRole, filterStatus, sort, order, hasAccess]);

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles');
      setRoles(res.data.data || []);
    } catch (err) {
      console.error('Error fetching roles:', err);
      toast.error('Gagal memuat data role');
    }
  };

  useEffect(() => {
    if (hasAccess) {
      fetchData();
      fetchRoles();
    }
  }, [hasAccess]);

  useEffect(() => {
    if (hasAccess) {
      fetchData();
    }
  }, [page, search, filterRole, filterStatus, sort, order]);

  const handleSort = (col) => {
    if (sort === col) setOrder(o => o === 'ASC' ? 'DESC' : 'ASC');
    else { setSort(col); setOrder('ASC'); }
    setPage(1);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/users/${deleteId}`);
      toast.success('User berhasil dihapus');
      setShowDeleteModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus user');
    } finally {
      setIsDeleting(false);
    }
  };

  const SortIcon = ({ col }) => (
    <IconSelector size={14} style={{
      marginLeft: 4, opacity: sort === col ? 1 : 0.35,
      color: sort === col ? theme.page.primary : 'inherit',
    }} />
  );

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
            Manajemen User
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Kelola seluruh user yang memiliki akses ke sistem
          </p>
        </div>
        <Link
          href="/users/tambah"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
          style={{ backgroundColor: theme.page.primary, textDecoration: 'none' }}
        >
          <IconPlus size={16} /> Tambah User
        </Link>
      </div>

      {/* Card tabel */}
      <div className="jmc-card">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 p-4"
          style={{ borderBottom: '1px solid var(--border-color)' }}>

          <select
            value={filterRole}
            onChange={e => { setFilterRole(e.target.value); setPage(1); }}
            className="border rounded px-3 py-1.5 text-sm"
            style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
          >
            <option value="">Semua Role</option>
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.nama_role}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            className="border rounded px-3 py-1.5 text-sm"
            style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
          >
            <option value="">Semua Status</option>
            <option value="1">Aktif</option>
            <option value="0">Nonaktif</option>
          </select>

          <div className="flex items-center border rounded overflow-hidden ml-auto"
            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
            <input
              type="text"
              placeholder="Cari user..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="px-3 py-1.5 text-sm outline-none bg-transparent"
              style={{ color: 'var(--text-primary)', width: '180px' }}
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
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', width: '120px' }}>
                  Aksi
                </th>
                <th onClick={() => handleSort('nama')} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}>
                  Nama <SortIcon col="nama" />
                </th>
                <th onClick={() => handleSort('username')} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}>
                  Username <SortIcon col="username" />
                </th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
                  Role
                </th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: theme.page.primary }} />
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Tidak ada data user
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
                      <Link
                        href={`/users/${item.id}`}
                        title="Edit"
                        style={{ color: '#2563eb' }}
                      >
                        <IconPencil size={18} />
                      </Link>
                      {item.id !== user?.id && (
                        <button
                          onClick={() => { setDeleteId(item.id); setDeleteName(item.nama); setShowDeleteModal(true); }}
                          title="Hapus"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 0 }}
                        >
                          <IconTrash size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-primary)' }}>
                    {item.nama}
                  </td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-primary)' }}>
                    {item.username}
                  </td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-muted)' }}>
                    <span className="px-2 py-1 rounded text-xs" style={{
                      backgroundColor: theme.page.primary + '20',
                      color: theme.page.primary
                    }}>
                      {item.nama_role || '-'}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span className="px-2 py-1 rounded text-xs" style={{
                      backgroundColor: item.disabled === 0 ? '#dcfce7' : '#fee2e2',
                      color: item.disabled === 0 ? '#16a34a' : '#dc2626',
                    }}>
                      {item.disabled === 0 ? 'Aktif' : 'Nonaktif'}
                    </span>
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

      {/* Modal Delete */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowDeleteModal(false)}>
          <div className="rounded-xl shadow-xl p-6 w-80"
            style={{ backgroundColor: 'var(--card-bg)' }}
            onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="mx-auto mb-3 w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#fee2e2' }}>
                <IconTrash size={22} style={{ color: '#dc2626' }} />
              </div>
              <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
                Hapus User
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                Yakin ingin menghapus user <strong>{deleteName}</strong>? Tindakan ini tidak bisa dibatalkan.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium border"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--card-bg)', cursor: 'pointer' }}
                  disabled={isDeleting}
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: '#dc2626',
                    border: 'none',
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    opacity: isDeleting ? 0.7 : 1,
                  }}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Menghapus...
                    </>
                  ) : (
                    'Hapus'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}