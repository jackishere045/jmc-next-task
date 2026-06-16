'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  IconArrowLeft, IconCheck, IconRefresh, IconEye, IconEyeOff,
  IconLock
} from '@tabler/icons-react';
import api from '../../../lib/axios';
import { theme } from '../../../lib/theme';
import toast, { Toaster } from 'react-hot-toast';
import useAuth from '../../../hooks/useAuth';

// Hanya Superadmin yang bisa mengakses
const ROLES_WITH_ACCESS = [1];

export default function TambahUserPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [pegawaiList, setPegawaiList] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    id_pegawai: '',
    username: '',
    id_role: '',
    password: '',
    disabled: 0,
  });

  const hasAccess = user && ROLES_WITH_ACCESS.includes(user.id_role);

  useEffect(() => {
    if (hasAccess) {
      fetchRoles();
      fetchPegawai();
    }
  }, [hasAccess]);

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles');
      setRoles(res.data.data || []);
    } catch (err) {
      toast.error('Gagal memuat data role');
    }
  };

  const fetchPegawai = async () => {
    try {
      const res = await api.get('/pegawai?limit=1000');
      setPegawaiList(res.data.data || []);
    } catch (err) {
      console.error('Error fetching pegawai:', err);
      setPegawaiList([]);
    }
  };

  const generatePassword = async () => {
    try {
      const res = await api.get('/users/generate-password');
      setFormData(prev => ({ ...prev, password: res.data.password }));
      setGeneratedPassword(res.data.password);
      setShowPassword(true);
      toast.success('Password berhasil digenerate');
    } catch (err) {
      toast.error('Gagal generate password');
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.id_pegawai) errors.id_pegawai = 'Pilih pegawai';
    if (!formData.username) errors.username = 'Username wajib diisi';
    if (formData.username.length < 6) errors.username = 'Username minimal 6 karakter';
    if (!/^[a-z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username hanya huruf kecil, angka, dan underscore';
    }
    if (!formData.id_role) errors.id_role = 'Pilih role';
    if (!formData.password) errors.password = 'Password wajib diisi, gunakan Generate Password';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await api.post('/users', {
        id_pegawai: formData.id_pegawai,
        username: formData.username,
        id_role: formData.id_role,
        password: formData.password,
        disabled: formData.disabled,
      });
      toast.success('User berhasil ditambahkan');
      if (generatedPassword) {
        toast.success(`Password: ${generatedPassword}`, { duration: 10000 });
      }
      router.push('/users');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  // Jika tidak punya akses
  if (!hasAccess) {
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
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 1rem', maxWidth: '600px', margin: '0 auto' }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/users" style={{ color: 'var(--text-muted)' }}>
          <IconArrowLeft size={24} />
        </Link>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Tambah User
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Buat user baru dengan akses ke sistem
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="card" style={{
        backgroundColor: 'var(--card-bg)',
        border: `1px solid var(--border-color)`,
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <div className="card-body" style={{ padding: '1.5rem' }}>
          <form onSubmit={handleSubmit}>
            {/* Nama Lengkap */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.id_pegawai}
                onChange={e => setFormData({ ...formData, id_pegawai: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-primary)',
                  borderColor: formErrors.id_pegawai ? '#dc2626' : 'var(--border-color)',
                }}
                required
              >
                <option value="">Pilih Pegawai</option>
                {pegawaiList.map(p => (
                  <option key={p.id} value={p.id}>{p.nama_pegawai} - {p.nip}</option>
                ))}
              </select>
              {formErrors.id_pegawai && (
                <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{formErrors.id_pegawai}</p>
              )}
            </div>

            {/* Username */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-primary)',
                  borderColor: formErrors.username ? '#dc2626' : 'var(--border-color)',
                }}
                placeholder="Minimal 6 karakter, huruf kecil & angka"
                required
              />
              {formErrors.username && (
                <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{formErrors.username}</p>
              )}
            </div>

            {/* Role */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.id_role}
                onChange={e => setFormData({ ...formData, id_role: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-primary)',
                  borderColor: formErrors.id_role ? '#dc2626' : 'var(--border-color)',
                }}
                required
              >
                <option value="">Pilih Role</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.nama_role}</option>
                ))}
              </select>
              {formErrors.id_role && (
                <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{formErrors.id_role}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                Password <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      borderColor: formErrors.password ? '#dc2626' : 'var(--border-color)',
                    }}
                    placeholder="Generate atau isi manual"
                    readOnly={!!generatedPassword}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-white whitespace-nowrap"
                  style={{ backgroundColor: '#6b7280', border: 'none', cursor: 'pointer' }}
                >
                  <IconRefresh size={16} className="me-1" /> Generate
                </button>
              </div>
              {generatedPassword && (
                <div className="mt-1 text-xs" style={{ color: '#16a34a' }}>
                  ✓ Password telah digenerate
                </div>
              )}
              {formErrors.password && (
                <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{formErrors.password}</p>
              )}
            </div>

            {/* Status Aktif */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                <input
                  type="checkbox"
                  checked={formData.disabled === 0}
                  onChange={e => setFormData({ ...formData, disabled: e.target.checked ? 0 : 1 })}
                  className="rounded"
                  style={{ accentColor: theme.page.primary }}
                />
                Status Aktif
              </label>
            </div>

            {/* Tombol */}
            <div className="flex gap-3">
              <Link
                href="/users"
                className="flex-1 py-2.5 rounded-lg text-sm font-medium border text-center"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  backgroundColor: 'transparent',
                  textDecoration: 'none',
                }}
              >
                Kembali
              </Link>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2"
                style={{
                  backgroundColor: theme.page.primary,
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <IconCheck size={18} />
                    Simpan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}