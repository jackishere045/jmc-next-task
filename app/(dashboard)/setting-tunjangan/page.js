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

// Hanya Admin HRD (role id = 3) yang bisa akses setting tunjangan
const ROLES_WITH_ACCESS = [3];

export default function SettingTunjanganPage() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('berlaku_mulai');
  const [order, setOrder] = useState('DESC');

  // Modal hapus
  const [deleteId, setDeleteId] = useState(null);
  const [modalHapus, setModalHapus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cek akses user
  const hasAccess = user && ROLES_WITH_ACCESS.includes(user.id_role);

  const fetchData = useCallback(async () => {
    if (!hasAccess) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/tunjangan/setting');
      let filtered = res.data.data || [];
      
      if (search) {
        filtered = filtered.filter(item => 
          item.base_fare?.toString().includes(search) ||
          item.min_km?.toString().includes(search) ||
          item.max_km?.toString().includes(search)
        );
      }

      filtered.sort((a, b) => {
        const valA = a[sort] || '';
        const valB = b[sort] || '';
        if (typeof valA === 'string') {
          return order === 'ASC' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return order === 'ASC' ? valA - valB : valB - valA;
      });

      setData(filtered);
    } catch (err) {
      console.error('Error fetching setting tunjangan:', err);
      if (err.response?.status === 403) {
        setError('Anda tidak memiliki akses untuk melihat setting tunjangan');
      } else {
        setError(err.response?.data?.message || 'Gagal memuat data setting');
      }
      toast.error('Gagal memuat data setting');
    } finally {
      setLoading(false);
    }
  }, [search, sort, order, hasAccess]);

  useEffect(() => { 
    if (hasAccess) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [fetchData, hasAccess]);

  const handleSort = (col) => {
    if (sort === col) setOrder(o => o === 'ASC' ? 'DESC' : 'ASC');
    else { setSort(col); setOrder('ASC'); }
  };

  const handleDelete = async () => {
    if (!hasAccess) return;
    setIsDeleting(true);
    try {
      await api.delete(`/tunjangan/setting/${deleteId}`);
      toast.success('Setting tunjangan berhasil dihapus');
      setModalHapus(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus data');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatRupiah = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const SortIcon = ({ col }) => (
    <IconSelector size={14} style={{
      marginLeft: 4, opacity: sort === col ? 1 : 0.35,
      color: sort === col ? theme.page.primary : 'inherit',
    }} />
  );

  const totalPages = Math.ceil(data.length / LIMIT);
  const paginatedData = data.slice((page - 1) * LIMIT, page * LIMIT);

  // Jika user tidak punya akses
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
            Anda tidak memiliki akses untuk mengelola setting tunjangan
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Anda login sebagai: <strong>{user?.nama_role || 'User'}</strong>
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' }}>
            Hanya Admin HRD yang dapat mengakses halaman ini
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 1rem' }}>
      <Toaster position="top-right" />

      {/* Page header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Setting Transport
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Kelola tarif dan aturan tunjangan transport
          </p>
        </div>
        <Link
          href="/setting-tunjangan/tambah"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
          style={{ backgroundColor: theme.page.primary, textDecoration: 'none' }}
        >
          <IconPlus size={16} /> Tambah Setting
        </Link>
      </div>

      {/* Card tabel */}
      <div className="card" style={{
        backgroundColor: 'var(--card-bg)',
        border: `1px solid var(--border-color)`,
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {/* Search */}
        <div className="flex items-center justify-between p-4"
          style={{ borderBottom: `1px solid var(--border-color)` }}>
          <div className="flex items-center border rounded overflow-hidden"
            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--card-bg)', borderWidth: '1px' }}>
            <input
              type="text"
              placeholder="Cari data..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-3 py-1.5 text-sm outline-none bg-transparent"
              style={{ color: 'var(--text-primary)', width: '200px' }}
            />
            <button className="px-2 py-1.5" style={{ color: 'var(--text-muted)' }}>
              <IconSearch size={16} />
            </button>
          </div>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Total: {data.length} data
          </span>
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
                {[
                  { label: 'No', col: null, w: '50px' },
                  { label: 'Tarif (Rp)', col: 'base_fare' },
                  { label: 'Min KM', col: 'min_km' },
                  { label: 'Max KM', col: 'max_km' },
                  { label: 'Berlaku Mulai', col: 'berlaku_mulai' },
                  { label: 'Aksi', col: null, w: '100px' },
                ].map(({ label, col, w }) => (
                  <th key={label}
                    onClick={col ? () => handleSort(col) : undefined}
                    style={{
                      padding: '10px 14px', textAlign: 'left',
                      fontSize: '0.75rem', fontWeight: 600,
                      color: 'var(--text-muted)',
                      borderBottom: `1px solid var(--border-color)`,
                      cursor: col ? 'pointer' : 'default',
                      userSelect: 'none', width: w,
                      whiteSpace: 'nowrap',
                    }}>
                    {label}{col && <SortIcon col={col} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2"
                        style={{ borderColor: theme.page.primary }} />
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10"
                    style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Tidak ada data setting
                  </td>
                </tr>
              ) : paginatedData.map((item, i) => (
                <tr key={item.id}
                  style={{ borderBottom: `1px solid var(--border-color)` }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--page-bg)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '11px 14px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    {(page - 1) * LIMIT + i + 1}
                  </td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {formatRupiah(item.base_fare)}
                  </td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-primary)' }}>
                    {item.min_km || 0} km
                  </td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-primary)' }}>
                    {item.max_km || 25} km
                  </td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-primary)' }}>
                    {item.berlaku_mulai
                      ? new Date(item.berlaku_mulai).toLocaleDateString('id-ID', {
                          day: '2-digit', month: '2-digit', year: 'numeric'
                        })
                      : '-'}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/setting-tunjangan/${item.id}`}
                        title="Edit"
                        style={{ color: '#2563eb' }}
                      >
                        <IconPencil size={18} />
                      </Link>
                      <button
                        onClick={() => { setDeleteId(item.id); setModalHapus(true); }}
                        title="Hapus"
                        style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <IconTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data.length > LIMIT && (
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: `1px solid var(--border-color)` }}>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, data.length)} dari {data.length} data
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded"
                style={{
                  border: `1px solid var(--border-color)`,
                  backgroundColor: 'var(--card-bg)',
                  color: page === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                }}>
                <IconChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) return <span key={`dots-${i}`} className="px-2 text-sm" style={{ color: 'var(--text-muted)' }}>...</span>;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className="w-8 h-8 rounded text-sm font-medium"
                      style={{
                        border: `1px solid var(--border-color)`,
                        backgroundColor: page === p ? theme.page.primary : 'var(--card-bg)',
                        color: page === p ? '#fff' : 'var(--text-primary)',
                        cursor: 'pointer',
                      }}>
                      {p}
                    </button>
                  );
                })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded"
                style={{
                  border: `1px solid var(--border-color)`,
                  backgroundColor: 'var(--card-bg)',
                  color: page === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                }}>
                <IconChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL HAPUS */}
      {modalHapus && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setModalHapus(false)}
        >
          <div 
            className="rounded-xl shadow-xl p-6 w-full max-w-sm"
            style={{ backgroundColor: 'var(--card-bg)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mx-auto mb-3 w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#fee2e2' }}>
                <IconTrash size={22} style={{ color: '#dc2626' }} />
              </div>
              <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
                Hapus Setting Tunjangan
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                Yakin ingin menghapus setting ini? Tindakan ini tidak bisa dibatalkan.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setModalHapus(false)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium border"
                  style={{
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--card-bg)',
                    cursor: 'pointer',
                  }}
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