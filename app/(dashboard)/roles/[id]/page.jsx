'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  IconArrowLeft, IconCheck, IconX, IconLock,
  IconShield, IconAlertCircle
} from '@tabler/icons-react';
import api from '../../../lib/axios';
import { theme } from '../../../lib/theme';
import toast, { Toaster } from 'react-hot-toast';
import useAuth from '../../../hooks/useAuth';

// Hanya Superadmin yang bisa mengakses
const ROLES_WITH_ACCESS = [1];

export default function DetailRolePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);

  const hasAccess = user && ROLES_WITH_ACCESS.includes(user.id_role);

  useEffect(() => {
    if (!hasAccess) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/roles/${id}`);
        setRole(res.data.data);
        setPermissions(res.data.data.permissions || []);
      } catch (err) {
        console.error('Error fetching role detail:', err);
        if (err.response?.status === 403) {
          setError('Anda tidak memiliki akses untuk melihat detail role');
        } else if (err.response?.status === 404) {
          setError('Role tidak ditemukan');
        } else {
          setError(err.response?.data?.message || 'Gagal memuat detail role');
        }
        toast.error('Gagal memuat detail role');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, hasAccess]);

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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.page.primary }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '0 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/roles" style={{ color: 'var(--text-muted)' }}>
          <IconArrowLeft size={24} />
        </Link>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Hak Akses Role
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Detail hak akses untuk setiap modul
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
        {/* Info Role */}
        <div className="flex items-center justify-between p-4"
          style={{ borderBottom: `1px solid var(--border-color)` }}>
          <div className="flex items-center gap-4">
            <div 
              className="rounded-full p-3"
              style={{ backgroundColor: theme.page.primary + '20' }}
            >
              <IconShield size={24} style={{ color: theme.page.primary }} />
            </div>
            <div>
              <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                {role?.nama_role}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {role?.deskripsi || 'Tidak ada deskripsi'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
            style={{ backgroundColor: 'var(--page-bg)', color: 'var(--text-muted)' }}>
            {permissions.length} modul
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

        {/* Table Permission */}
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
                }}>Modul / Fitur</th>
                <th style={{
                  padding: '10px 14px', textAlign: 'center',
                  fontSize: '0.75rem', fontWeight: 600,
                  color: 'var(--text-muted)',
                  borderBottom: `1px solid var(--border-color)`,
                  width: '70px',
                }}>Akses</th>
                <th style={{
                  padding: '10px 14px', textAlign: 'center',
                  fontSize: '0.75rem', fontWeight: 600,
                  color: 'var(--text-muted)',
                  borderBottom: `1px solid var(--border-color)`,
                  width: '70px',
                }}>Create</th>
                <th style={{
                  padding: '10px 14px', textAlign: 'center',
                  fontSize: '0.75rem', fontWeight: 600,
                  color: 'var(--text-muted)',
                  borderBottom: `1px solid var(--border-color)`,
                  width: '70px',
                }}>Read</th>
                <th style={{
                  padding: '10px 14px', textAlign: 'center',
                  fontSize: '0.75rem', fontWeight: 600,
                  color: 'var(--text-muted)',
                  borderBottom: `1px solid var(--border-color)`,
                  width: '70px',
                }}>Update</th>
                <th style={{
                  padding: '10px 14px', textAlign: 'center',
                  fontSize: '0.75rem', fontWeight: 600,
                  color: 'var(--text-muted)',
                  borderBottom: `1px solid var(--border-color)`,
                  width: '70px',
                }}>Delete</th>
              </tr>
            </thead>
            <tbody>
              {permissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10"
                    style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                    <p>Belum ada konfigurasi hak akses untuk role ini</p>
                  </td>
                </tr>
              ) : (
                permissions.map((item, i) => (
                  <tr
                    key={item.id || i}
                    style={{ borderBottom: '1px solid var(--border-color)' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--page-bg)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '11px 14px', color: 'var(--text-muted)', textAlign: 'center' }}>
                      {i + 1}
                    </td>
                    <td style={{ padding: '11px 14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {item.modul_fitur}
                    </td>
                    <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                      {item.akses === 1 ? (
                        <span className="px-2 py-1 rounded text-xs font-medium"
                          style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                          <IconCheck size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-medium"
                          style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                          <IconX size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                      {item.create === 1 ? (
                        <span className="px-2 py-1 rounded text-xs font-medium"
                          style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                          <IconCheck size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-medium"
                          style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                          <IconX size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                      <span className="px-2 py-1 rounded text-xs font-medium" style={{
                        backgroundColor: item.read === 'All' ? '#dcfce7' : 
                                       item.read === 'Own' ? '#fef9c3' : '#fee2e2',
                        color: item.read === 'All' ? '#16a34a' : 
                               item.read === 'Own' ? '#ca8a04' : '#dc2626',
                      }}>
                        {item.read}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                      <span className="px-2 py-1 rounded text-xs font-medium" style={{
                        backgroundColor: item.update === 'All' ? '#dcfce7' : 
                                       item.update === 'Own' ? '#fef9c3' : '#fee2e2',
                        color: item.update === 'All' ? '#16a34a' : 
                               item.update === 'Own' ? '#ca8a04' : '#dc2626',
                      }}>
                        {item.update}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                      <span className="px-2 py-1 rounded text-xs font-medium" style={{
                        backgroundColor: item.delete === 'All' ? '#dcfce7' : 
                                       item.delete === 'Own' ? '#fef9c3' : '#fee2e2',
                        color: item.delete === 'All' ? '#16a34a' : 
                               item.delete === 'Own' ? '#ca8a04' : '#dc2626',
                      }}>
                        {item.delete}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Tombol Kembali */}
        <div className="p-4" style={{ borderTop: `1px solid var(--border-color)` }}>
          <Link
            href="/roles"
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
            Kembali ke Daftar Role
          </Link>
        </div>
      </div>
    </div>
  );
}