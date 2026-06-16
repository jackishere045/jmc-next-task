'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  IconPlus, IconPencil, IconFileDescription,
  IconDownload, IconTrash, IconSearch,
  IconChevronLeft, IconChevronRight, IconSelector,
  IconAlertCircle, IconLock
} from '@tabler/icons-react';
import api from '../../lib/axios';
import { theme } from '../../lib/theme';
import toast, { Toaster } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

const LIMIT = 10;

// Role yang memiliki akses penuh (create, update, delete)
const ROLES_WITH_FULL_ACCESS = [3]; // Superadmin, Manager HRD, HRD Manager
// Role yang hanya bisa baca (read only)
const ROLES_WITH_READ_ONLY = [2]; // HRD Admin

export default function PegawaiPage() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jabatanList, setJabatanList] = useState([]);

  // Filter state
  const [search, setSearch] = useState('');
  const [filterJabatan, setFilterJabatan] = useState('');
  const [filterKontrak, setFilterKontrak] = useState('');
  const [masaKerjaMin, setMasaKerjaMin] = useState('');
  const [masaKerjaMax, setMasaKerjaMax] = useState('');
  const [sort, setSort] = useState('id');
  const [order, setOrder] = useState('ASC');

  // Modal hapus
  const [hapusId, setHapusId] = useState(null);
  const [hapusNama, setHapusNama] = useState('');
  const [modalHapus, setModalHapus] = useState(false);

  // Cek akses user
  const hasFullAccess = user && ROLES_WITH_FULL_ACCESS.includes(user.id_role);
  const isReadOnly = user && ROLES_WITH_READ_ONLY.includes(user.id_role);
  const canAccess = user && (hasFullAccess || isReadOnly);

  const fetchData = useCallback(async () => {
    if (!canAccess) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: LIMIT, sort, order };
      if (search) params.search = search;
      if (filterJabatan) params.jabatan = filterJabatan;
      if (filterKontrak) params.status_kontrak = filterKontrak;
      if (masaKerjaMin !== '') params.masa_kerja_min = masaKerjaMin;
      if (masaKerjaMax !== '') params.masa_kerja_max = masaKerjaMax;

      const res = await api.get('/pegawai', { params });
      setData(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Error fetching pegawai:', err);
      setError(err.response?.data?.message || 'Gagal memuat data pegawai');
      toast.error('Gagal memuat data pegawai');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterJabatan, filterKontrak, masaKerjaMin, masaKerjaMax, sort, order, canAccess]);

  useEffect(() => { 
    if (canAccess) {
      fetchData();
    }
  }, [fetchData, canAccess]);

  useEffect(() => {
    if (canAccess) {
      api.get('/master-data?tipe=jabatan').then(r => setJabatanList(r.data.data)).catch(() => {});
    }
  }, [canAccess]);

  const handleSort = (col) => {
    if (sort === col) setOrder(o => o === 'ASC' ? 'DESC' : 'ASC');
    else { setSort(col); setOrder('ASC'); }
    setPage(1);
  };

  const handleHapus = async () => {
    try {
      await api.delete(`/pegawai/${hapusId}`);
      toast.success('Pegawai berhasil dihapus');
      setModalHapus(false);
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal menghapus');
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  const SortIcon = ({ col }) => (
    <IconSelector size={14} style={{
      marginLeft: 4, opacity: sort === col ? 1 : 0.35,
      color: sort === col ? theme.page.primary : 'inherit',
    }} />
  );

  const statusBadge = (status) => {
    const map = {
      tetap:   { label: 'PKWTT', bg: '#dcfce7', color: '#16a34a' },
      kontrak: { label: 'PKWT',  bg: '#fef9c3', color: '#ca8a04' },
      magang:  { label: 'Magang', bg: '#dbeafe', color: '#2563eb' },
    };
    const s = map[status] || { label: status, bg: '#f3f4f6', color: '#6b7280' };
    return (
      <span style={{
        padding: '3px 10px', borderRadius: 99, fontSize: '0.75rem',
        fontWeight: 600, backgroundColor: s.bg, color: s.color,
      }}>
        {s.label}
      </span>
    );
  };

  // Jika user tidak punya akses sama sekali
  if (!canAccess && !loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div 
            className="mx-auto mb-3 rounded-full d-flex align-items-center justify-content-center"
            style={{ 
              width: '72px', 
              height: '72px',
              backgroundColor: 'var(--page-bg)',
              color: 'var(--text-muted)',
            }}
          >
            <IconLock size={36} />
          </div>
          <h4 style={{ color: 'var(--text-primary)' }}>Akses Ditolak</h4>
          <p style={{ color: 'var(--text-muted)' }} className="mb-2">
            Anda tidak memiliki akses untuk melihat data pegawai
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
            Data Pegawai
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Kelola seluruh data pegawai
          </p>
        </div>
        {hasFullAccess && (
          <Link href="/pegawai/tambah" className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: theme.page.primary, textDecoration: 'none' }}>
            <IconPlus size={16} /> Tambah Pegawai
          </Link>
        )}
      </div>

      {/* Card tabel */}
      <div className="jmc-card">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 p-4"
          style={{ borderBottom: '1px solid var(--border-color)' }}>

          {/* Masa Kerja */}
          <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            <span className="whitespace-nowrap">Masa Kerja</span>
            <input type="number" placeholder="Min" min={0}
              value={masaKerjaMin}
              onChange={e => { setMasaKerjaMin(e.target.value); setPage(1); }}
              className="border rounded px-2 py-1.5 text-sm w-16"
              style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            />
            <span>-</span>
            <input type="number" placeholder="Max" min={0}
              value={masaKerjaMax}
              onChange={e => { setMasaKerjaMax(e.target.value); setPage(1); }}
              className="border rounded px-2 py-1.5 text-sm w-16"
              style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
            />
          </div>

          {/* Filter Jabatan */}
          <select value={filterJabatan}
            onChange={e => { setFilterJabatan(e.target.value); setPage(1); }}
            className="border rounded px-3 py-1.5 text-sm"
            style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
            <option value="">Semua Jabatan</option>
            {jabatanList.map(j => <option key={j.id} value={j.id}>{j.nama}</option>)}
          </select>

          {/* Filter Kontrak */}
          <select value={filterKontrak}
            onChange={e => { setFilterKontrak(e.target.value); setPage(1); }}
            className="border rounded px-3 py-1.5 text-sm"
            style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
            <option value="">Status Kontrak</option>
            <option value="tetap">PKWTT</option>
            <option value="kontrak">PKWT</option>
            <option value="magang">Magang</option>
          </select>

          {/* Search */}
          <div className="flex items-center border rounded overflow-hidden ml-auto"
            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--card-bg)', borderWidth: '1px !important'}}>
            <input type="text" placeholder="Cari data..."
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
                {[
                  { label: 'No', col: null, w: '50px' },
                  ...(hasFullAccess ? [{ label: 'Aksi', col: null, w: '120px' }] : []),
                  { label: 'NIP', col: 'nip' },
                  { label: 'Nama', col: 'nama_pegawai' },
                  { label: 'Jabatan', col: null },
                  { label: 'Tgl Masuk', col: 'tanggal_masuk' },
                  { label: 'Masa Kerja', col: null },
                ].map(({ label, col, w }) => (
                  <th key={label}
                    onClick={col ? () => handleSort(col) : undefined}
                    style={{
                      padding: '10px 14px', textAlign: 'left',
                      fontSize: '0.75rem', fontWeight: 600,
                      color: 'var(--text-muted)',
                      borderBottom: '1px solid var(--border-color)',
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
                  <td colSpan={hasFullAccess ? 7 : 6} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2"
                        style={{ borderColor: theme.page.primary }} />
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={hasFullAccess ? 7 : 6} className="text-center py-10"
                    style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Tidak ada data pegawai
                  </td>
                </tr>
              ) : data.map((item, i) => (
                <tr key={item.id}
                  style={{ borderBottom: '1px solid var(--border-color)' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--page-bg)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>

                  <td style={{ padding: '11px 14px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    {(page - 1) * LIMIT + i + 1}
                  </td>

                  {/* Aksi - hanya untuk yang punya akses full */}
                  {hasFullAccess && (
                    <td style={{ padding: '11px 14px' }}>
                      <div className="flex items-center gap-2">
                        <Link href={`/pegawai/${item.id}/edit`} title="Edit"
                          style={{ color: '#2563eb' }}>
                          <IconPencil size={18} />
                        </Link>
                        <Link href={`/pegawai/${item.id}`} title="Detail"
                          style={{ color: '#6b7280' }}>
                          <IconFileDescription size={18} />
                        </Link>
                        <button title="Download PDF"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', padding: 0 }}>
                          <IconDownload size={18} />
                        </button>
                        <button title="Hapus"
                          onClick={() => { setHapusId(item.id); setHapusNama(item.nama_pegawai); setModalHapus(true); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 0 }}>
                          <IconTrash size={18} />
                        </button>
                      </div>
                    </td>
                  )}

                  <td style={{ padding: '11px 14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {item.nip}
                  </td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-primary)' }}>
                    {item.nama_pegawai}
                  </td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-muted)' }}>
                    {item.jabatan || '-'}
                  </td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-muted)' }}>
                    {item.tanggal_masuk
                      ? new Date(item.tanggal_masuk).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
                      : '-'}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {item.masa_kerja !== undefined
                        ? `${item.masa_kerja} thn`
                        : '-'}
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
              }}>
              <IconChevronLeft size={15} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) => p === '...' ? (
                <span key={`dots-${i}`} className="px-2 text-sm" style={{ color: 'var(--text-muted)' }}>...</span>
              ) : (
                <button key={p} onClick={() => setPage(p)}
                  className="w-8 h-8 rounded text-sm font-medium"
                  style={{
                    border: '1px solid var(--border-color)',
                    backgroundColor: page === p ? theme.page.primary : 'var(--card-bg)',
                    color: page === p ? '#fff' : 'var(--text-primary)',
                    cursor: 'pointer',
                  }}>
                  {p}
                </button>
              ))}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="p-1.5 rounded"
              style={{
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--card-bg)',
                color: page === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
              }}>
              <IconChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Hapus */}
      {hasFullAccess && modalHapus && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setModalHapus(false)}>
          <div className="rounded-xl shadow-xl p-6 w-80"
            style={{ backgroundColor: 'var(--card-bg)' }}
            onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="mx-auto mb-3 w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#fee2e2' }}>
                <IconTrash size={22} style={{ color: '#dc2626' }} />
              </div>
              <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
                Hapus Data Pegawai
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                Yakin ingin menghapus <strong>{hapusNama}</strong>? Tindakan ini tidak bisa dibatalkan.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setModalHapus(false)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium border"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--card-bg)', cursor: 'pointer' }}>
                  Batal
                </button>
                <button onClick={handleHapus}
                  className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
                  style={{ backgroundColor: '#dc2626', border: 'none', cursor: 'pointer' }}>
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}