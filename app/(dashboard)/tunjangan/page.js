'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  IconSearch, IconChevronLeft, IconChevronRight,
  IconArrowRight, IconCalculator, IconLock, IconAlertCircle
} from '@tabler/icons-react';
import api from '../../lib/axios';
import { theme } from '../../lib/theme';
import toast, { Toaster } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

const LIMIT = 10;

// Role yang bisa akses tunjangan transport: Manager HRD (2) & Admin HRD (3)
const ROLES_WITH_ACCESS = [2, 3];

export default function TunjanganPage() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [tahun, setTahun] = useState(new Date().getFullYear());

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
      const res = await api.get(`/tunjangan/bulan?tahun=${tahun}`);
      let filtered = res.data.data || [];
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(item =>
          item.bulan?.toString().includes(searchLower) ||
          item.total_penerima?.toString().includes(search) ||
          item.total_nominal?.toString().includes(search)
        );
      }
      setData(filtered);
    } catch (err) {
      console.error('Error fetching tunjangan:', err);
      if (err.response?.status === 403) {
        setError('Anda tidak memiliki akses untuk melihat data tunjangan');
      } else {
        setError(err.response?.data?.message || 'Gagal memuat data tunjangan');
      }
      toast.error('Gagal memuat data tunjangan');
    } finally {
      setLoading(false);
    }
  }, [tahun, search, hasAccess]);

  useEffect(() => { 
    if (hasAccess) {
      fetchData(); 
    } else {
      setLoading(false);
    }
  }, [fetchData, hasAccess]);

  const handleHitung = async () => {
    const now = new Date();
    const bulan = now.getMonth() + 1;
    const tahun = now.getFullYear();
    toast.info(`Menghitung tunjangan ${getNamaBulan(bulan)} ${tahun}...`);
    // TODO: Implement hitung tunjangan
  };

  const formatRupiah = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const getNamaBulan = (bulan) => {
    const nama = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return nama[bulan - 1] || bulan;
  };

  const totalPages = Math.ceil(data.length / LIMIT);
  const paginatedData = data.slice((page - 1) * LIMIT, page * LIMIT);

  // Generate tahun untuk filter (5 tahun terakhir)
  const tahunList = [];
  for (let i = 0; i < 5; i++) {
    tahunList.push(tahun - i);
  }

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
            Anda tidak memiliki akses untuk melihat data tunjangan transport
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Anda login sebagai: <strong>{user?.nama_role || 'User'}</strong>
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
            Tunjangan Transport
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Rekapitulasi tunjangan transport per bulan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={tahun}
            onChange={e => setTahun(parseInt(e.target.value))}
            className="px-3 py-2 rounded-lg border text-sm"
            style={{
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color)',
            }}
          >
            {tahunList.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button
            onClick={handleHitung}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: theme.page.primary, border: 'none', cursor: 'pointer' }}
          >
            <IconCalculator size={16} /> Hitung Bulan Ini
          </button>
        </div>
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
            Total: {data.length} bulan
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
                <th style={{
                  padding: '10px 14px', textAlign: 'left',
                  fontSize: '0.75rem', fontWeight: 600,
                  color: 'var(--text-muted)',
                  borderBottom: `1px solid var(--border-color)`,
                  width: '50px',
                }}>No</th>
                <th style={{
                  padding: '10px 14px', textAlign: 'left',
                  fontSize: '0.75rem', fontWeight: 600,
                  color: 'var(--text-muted)',
                  borderBottom: `1px solid var(--border-color)`,
                }}>Bulan</th>
                <th style={{
                  padding: '10px 14px', textAlign: 'right',
                  fontSize: '0.75rem', fontWeight: 600,
                  color: 'var(--text-muted)',
                  borderBottom: `1px solid var(--border-color)`,
                }}>Total Pegawai</th>
                <th style={{
                  padding: '10px 14px', textAlign: 'right',
                  fontSize: '0.75rem', fontWeight: 600,
                  color: 'var(--text-muted)',
                  borderBottom: `1px solid var(--border-color)`,
                }}>Total Nominal</th>
                <th style={{
                  padding: '10px 14px', textAlign: 'center',
                  fontSize: '0.75rem', fontWeight: 600,
                  color: 'var(--text-muted)',
                  borderBottom: `1px solid var(--border-color)`,
                  width: '120px',
                }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2"
                        style={{ borderColor: theme.page.primary }} />
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10"
                    style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Tidak ada data tunjangan
                  </td>
                </tr>
              ) : paginatedData.map((item, i) => (
                <tr key={`${item.bulan}-${item.tahun}`}
                  style={{ borderBottom: `1px solid var(--border-color)` }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--page-bg)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '11px 14px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    {(page - 1) * LIMIT + i + 1}
                  </td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {getNamaBulan(item.bulan)} {item.tahun}
                  </td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-primary)', textAlign: 'right' }}>
                    {item.total_penerima || 0}
                  </td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-primary)', textAlign: 'right', fontWeight: 600 }}>
                    {formatRupiah(item.total_nominal)}
                  </td>
                  <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                    <Link
                      href={`/tunjangan/${item.bulan}/${item.tahun}`}
                      className="flex items-center gap-1 text-sm font-medium"
                      style={{ color: theme.page.primary, textDecoration: 'none' }}
                    >
                      Lihat detail <IconArrowRight size={14} />
                    </Link>
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
    </div>
  );
}