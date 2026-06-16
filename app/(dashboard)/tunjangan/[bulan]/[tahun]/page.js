'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  IconArrowLeft, IconFileText, IconLock, IconAlertCircle
} from '@tabler/icons-react';
import api from '../../../../lib/axios';
import { theme } from '../../../../lib/theme';
import toast, { Toaster } from 'react-hot-toast';
import useAuth from '../../../../hooks/useAuth';

// Role yang bisa akses tunjangan transport: Manager HRD (2) & Admin HRD (3)
const ROLES_WITH_ACCESS = [2, 3];

export default function DetailTunjanganPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const bulan = parseInt(params.bulan);
  const tahun = parseInt(params.tahun);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cek akses user
  const hasAccess = user && ROLES_WITH_ACCESS.includes(user.id_role);

  const getNamaBulan = (bulan) => {
    const nama = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return nama[bulan - 1] || bulan;
  };

  const formatRupiah = (value) => {
    const num = parseFloat(value) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  useEffect(() => {
    if (!hasAccess) {
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/tunjangan/detail/${bulan}/${tahun}`);
        console.log('📊 Detail response:', res.data);
        
        const items = res.data.data || [];
        
        const mappedData = items.map(item => ({
          id: item.id,
          nama_pegawai: item.nama_pegawai || 'Tidak Diketahui',
          km: parseFloat(item.km) || 0,
          hari_masuk: parseInt(item.hari_masuk) || 0,
          // NOMINAL: bisa jadi sudah total per pegawai per bulan
          nominal: parseFloat(item.nominal) || 0,
        }));
        
        console.log('📊 Mapped data:', mappedData);
        setData(mappedData);
      } catch (err) {
        console.error('❌ Error fetching detail tunjangan:', err);
        if (err.response?.status === 403) {
          setError('Anda tidak memiliki akses untuk melihat detail tunjangan');
        } else if (err.response?.status === 404) {
          setError('Data tunjangan tidak ditemukan');
        } else {
          setError(err.response?.data?.message || 'Gagal memuat detail tunjangan');
        }
        toast.error('Gagal memuat detail tunjangan');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [bulan, tahun, hasAccess]);

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
            Anda tidak memiliki akses untuk melihat detail tunjangan
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Anda login sebagai: <strong>{user?.nama_role || 'User'}</strong>
          </p>
        </div>
      </div>
    );
  }

  // HITUNG TOTAL DENGAN BENAR
  // Total nominal = jumlah semua nominal per pegawai (sudah total per bulan)
  const totalNominal = data.reduce((sum, item) => sum + (item.nominal || 0), 0);
  const totalHariMasuk = data.reduce((sum, item) => sum + (item.hari_masuk || 0), 0);
  const totalPegawai = data.length;

  // Cek apakah nominal sudah total per pegawai atau masih per hari
  // Jika nominal per hari, maka total nominal = nominal * hari_masuk
  // Tapi dari data di atas, nominal = 5000 dengan hari_masuk = 22, berarti 5000 * 22 = 110.000
  // Tapi di tabel nominalnya 5.000, berarti nominal sudah total per bulan (bukan per hari)
  // Jadi kita gunakan nominal apa adanya

  return (
    <div style={{ padding: '0 1rem', maxWidth: '1000px', margin: '0 auto' }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/tunjangan" style={{ color: 'var(--text-muted)' }}>
          <IconArrowLeft size={24} />
        </Link>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Detail Tunjangan
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {getNamaBulan(bulan)} {tahun}
          </p>
        </div>
      </div>

      {/* Card Detail */}
      <div className="card" style={{
        backgroundColor: 'var(--card-bg)',
        border: `1px solid var(--border-color)`,
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {/* Info Ringkas */}
        <div className="flex items-center justify-between p-4"
          style={{ borderBottom: `1px solid var(--border-color)` }}>
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Pegawai</span>
              <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {totalPegawai} orang
              </p>
            </div>
            <div>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Hari Masuk</span>
              <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {totalHariMasuk} hari
              </p>
            </div>
            <div>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Nominal</span>
              <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {formatRupiah(totalNominal)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
            style={{ backgroundColor: 'var(--page-bg)', color: 'var(--text-muted)' }}>
            <IconFileText size={16} />
            {data.length} data
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4" style={{ backgroundColor: '#fef2f2', borderBottom: '1px solid #fecaca' }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#dc2626' }}>
              <IconAlertCircle size={18} />
              <span>{error}</span>
              <button 
                onClick={() => window.location.reload()}
                className="ml-auto px-3 py-1 rounded text-xs font-medium"
                style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                Coba Lagi
              </button>
            </div>
          </div>
        )}

        {/* Table Detail */}
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
                }}>Nama Pegawai</th>
                <th style={{
                  padding: '10px 14px', textAlign: 'right',
                  fontSize: '0.75rem', fontWeight: 600,
                  color: 'var(--text-muted)',
                  borderBottom: `1px solid var(--border-color)`,
                  width: '100px',
                }}>Jarak (KM)</th>
                <th style={{
                  padding: '10px 14px', textAlign: 'right',
                  fontSize: '0.75rem', fontWeight: 600,
                  color: 'var(--text-muted)',
                  borderBottom: `1px solid var(--border-color)`,
                  width: '120px',
                }}>Hari Masuk</th>
                <th style={{
                  padding: '10px 14px', textAlign: 'right',
                  fontSize: '0.75rem', fontWeight: 600,
                  color: 'var(--text-muted)',
                  borderBottom: `1px solid var(--border-color)`,
                  width: '180px',
                }}>Nominal</th>
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
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10"
                    style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                    <p>Belum ada data tunjangan untuk bulan ini</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Silakan hitung tunjangan terlebih dahulu
                    </p>
                  </td>
                </tr>
              ) : (
                <>
                  {data.map((item, i) => (
                    <tr key={item.id || i}
                      style={{ borderBottom: `1px solid var(--border-color)` }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--page-bg)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '11px 14px', color: 'var(--text-muted)', textAlign: 'center' }}>
                        {i + 1}
                      </td>
                      <td style={{ padding: '11px 14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                        {item.nama_pegawai || '-'}
                      </td>
                      <td style={{ padding: '11px 14px', color: 'var(--text-primary)', textAlign: 'right' }}>
                        {item.km || 0} km
                      </td>
                      <td style={{ padding: '11px 14px', color: 'var(--text-primary)', textAlign: 'right' }}>
                        {item.hari_masuk || 0} hari
                      </td>
                      <td style={{ padding: '11px 14px', color: 'var(--text-primary)', textAlign: 'right', fontWeight: 600 }}>
                        {formatRupiah(item.nominal || 0)}
                      </td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  {data.length > 0 && (
                    <tr style={{ 
                      borderTop: `2px solid var(--border-color)`,
                      backgroundColor: 'var(--page-bg)',
                    }}>
                      <td colSpan={3} style={{ 
                        padding: '11px 14px', 
                        textAlign: 'right', 
                        fontWeight: 700, 
                        color: 'var(--text-primary)',
                        fontSize: '0.875rem',
                      }}>
                        Total
                      </td>
                      <td style={{ 
                        padding: '11px 14px', 
                        textAlign: 'right', 
                        fontWeight: 700, 
                        color: 'var(--text-primary)',
                        fontSize: '0.875rem',
                      }}>
                        {totalHariMasuk} hari
                      </td>
                      <td style={{ 
                        padding: '11px 14px', 
                        textAlign: 'right', 
                        fontWeight: 700, 
                        color: 'var(--text-primary)',
                        fontSize: '0.875rem',
                      }}>
                        {formatRupiah(totalNominal)}
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Tombol Kembali */}
        <div className="p-4" style={{ borderTop: `1px solid var(--border-color)` }}>
          <Link
            href="/tunjangan"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              color: 'var(--text-primary)',
              backgroundColor: 'var(--page-bg)',
              border: `1px solid var(--border-color)`,
              textDecoration: 'none',
              display: 'inline-flex',
            }}
          >
            <IconArrowLeft size={16} />
            Kembali ke Daftar Tunjangan
          </Link>
        </div>
      </div>
    </div>
  );
}