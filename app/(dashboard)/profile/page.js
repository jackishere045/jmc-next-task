'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconUser, IconMail, IconPhone, IconId, IconCalendar,
  IconMapPin, IconBriefcase, IconBuilding, IconEdit,
  IconLock, IconCheck, IconX, IconCamera,
  IconArrowLeft, IconEye, IconEyeOff, IconAlertCircle
} from '@tabler/icons-react';
import api from '../../lib/axios';
import { theme } from '../../lib/theme';
import toast, { Toaster } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [pegawai, setPegawai] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState(null);
  const [isUserOnly, setIsUserOnly] = useState(false);

  // Form state
  const [form, setForm] = useState({
    nama_pegawai: '',
    email: '',
    nomor_hp: '',
    tempat_lahir: '',
    alamat_lengkap: '',
    tanggal_lahir: '',
    foto_pegawai: '',
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
      setError('Session tidak ditemukan');
    }
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[Profile] Fetching my profile...');
      const response = await api.get('/pegawai/profile/me');
      console.log('[Profile] Response:', response.data);
      
      if (response.data?.success) {
        const data = response.data.data;
        setPegawai(data);
        setIsUserOnly(data.is_user_only || false);
        
        setForm({
          nama_pegawai: data.nama_pegawai || '',
          email: data.email || '',
          nomor_hp: data.nomor_hp || '',
          tempat_lahir: data.tempat_lahir || '',
          alamat_lengkap: data.alamat_lengkap || '',
          tanggal_lahir: data.tanggal_lahir || '',
          foto_pegawai: data.foto_pegawai || '',
        });

        if (data.foto_pegawai) {
          if (data.foto_pegawai.startsWith('http')) {
            setPhotoPreview(data.foto_pegawai);
          } else {
            const uploadUrl = process.env.NEXT_PUBLIC_UPLOAD_URL;
            setPhotoPreview(`${uploadUrl}/${data.foto_pegawai}`);
          }
        }
        
        if (data.is_user_only) {
          toast((t) => (
            <div>
              <p style={{ fontWeight: 'bold', marginBottom: 4 }}>⚠️ Data Tidak Lengkap</p>
              <p style={{ fontSize: 14, color: '#666' }}>{data.message || 'Silakan hubungi administrator untuk melengkapi data'}</p>
            </div>
          ), { duration: 5000 });
        }
      } else {
        throw new Error(response.data?.message || 'Gagal mengambil data');
      }
      
    } catch (err) {
      console.error('[Profile] Error:', err);
      
      if (err.response?.status === 404) {
        setError('Data pegawai tidak ditemukan. Silakan hubungi administrator.');
      } else if (err.response?.status === 401) {
        setError('Session expired, silakan login kembali.');
        setTimeout(() => logout(), 2000);
      } else {
        setError(err.response?.data?.message || 'Gagal memuat data profil');
      }
      toast.error('Gagal memuat data profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      
      const allowedFields = ['nama_pegawai', 'email', 'nomor_hp', 'tempat_lahir', 'alamat_lengkap', 'tanggal_lahir'];
      Object.keys(form).forEach(key => {
        if (allowedFields.includes(key) && form[key] !== undefined && form[key] !== null) {
          formData.append(key, form[key]);
        }
      });
      
      if (photoFile) {
        formData.append('foto', photoFile);
      }

      await api.put('/pegawai/profile/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Profil berhasil diperbarui');
      setEditMode(false);
      fetchProfile();
      
    } catch (err) {
      console.error('[Profile] Update error:', err);
      toast.error(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    
    if (!passwordForm.current_password) {
      errors.current_password = 'Password saat ini wajib diisi';
    }
    if (!passwordForm.new_password) {
      errors.new_password = 'Password baru wajib diisi';
    }
    if (passwordForm.new_password.length < 6) {
      errors.new_password = 'Password minimal 6 karakter';
    }
    if (!passwordForm.confirm_password) {
      errors.confirm_password = 'Konfirmasi password wajib diisi';
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      errors.confirm_password = 'Password tidak cocok';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setChangingPassword(true);
    try {
      await api.put('/auth/change-password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      toast.success('Password berhasil diubah');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setPasswordErrors({});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran foto maksimal 2MB');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return date;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: theme.page.primary }} />
          <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center" style={{ maxWidth: '500px' }}>
          <div 
            className="mx-auto mb-4 rounded-full d-flex align-items-center justify-content-center"
            style={{ 
              width: '72px', 
              height: '72px',
              backgroundColor: '#fef2f2',
            }}
          >
            <IconAlertCircle size={36} color="#dc2626" />
          </div>
          <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Gagal Memuat Profil
          </h4>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {error}
          </p>
          <button
            onClick={fetchProfile}
            className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: theme.page.primary, border: 'none', cursor: 'pointer' }}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // ============ RENDER PROFIL ============
  return (
    <div style={{ padding: '0 1rem', maxWidth: '900px', margin: '0 auto' }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Profil Saya
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Kelola informasi profil Anda
          </p>
        </div>
        {!editMode && pegawai && (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: theme.page.primary,
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <IconEdit size={16} /> Edit Profil
          </button>
        )}
      </div>

      {/* Card Profil */}
      <div className="card" style={{
        backgroundColor: 'var(--card-bg)',
        border: `1px solid var(--border-color)`,
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {/* Foto Profil & Info Ringkas */}
        <div className="p-6" style={{
          borderBottom: `1px solid var(--border-color)`,
          backgroundColor: 'var(--page-bg)',
        }}>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div
                className="rounded-full overflow-hidden border-4"
                style={{
                  width: '100px',
                  height: '100px',
                  borderColor: theme.page.primary,
                  backgroundColor: 'var(--card-bg)',
                }}
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                    <IconUser size={40} />
                  </div>
                )}
              </div>
              {editMode && (
                <label
                  className="absolute bottom-0 right-0 p-1.5 rounded-full cursor-pointer"
                  style={{
                    backgroundColor: theme.page.primary,
                    color: '#fff',
                  }}
                >
                  <IconCamera size={16} />
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {form.nama_pegawai || pegawai?.nama_pegawai || user?.username || 'User'}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="px-2 py-0.5 rounded text-xs font-medium" style={{
                  backgroundColor: theme.page.primary + '20',
                  color: theme.page.primary,
                }}>
                  {pegawai?.role || user?.nama_role || 'User'}
                </span>
                {pegawai?.nip && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium" style={{
                    backgroundColor: '#fef9c3',
                    color: '#ca8a04',
                  }}>
                    NIP: {pegawai.nip}
                  </span>
                )}
              </div>
              {isUserOnly && (
                <p className="text-xs mt-1" style={{ color: '#dc2626' }}>
                  ⚠️ Data pegawai belum lengkap
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form/View Profil */}
        <div className="p-6">
          {editMode ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama_pegawai"
                    value={form.nama_pegawai}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)',
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                    Nomor HP
                  </label>
                  <input
                    type="text"
                    name="nomor_hp"
                    value={form.nomor_hp}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    name="tempat_lahir"
                    value={form.tempat_lahir}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    name="tanggal_lahir"
                    value={form.tanggal_lahir}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)',
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                    Alamat Lengkap
                  </label>
                  <textarea
                    name="alamat_lengkap"
                    value={form.alamat_lengkap}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)',
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    fetchProfile();
                  }}
                  className="px-6 py-2.5 rounded-lg text-sm font-medium border"
                  style={{
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                  }}
                  disabled={saving}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg text-sm font-medium text-white flex items-center gap-2"
                  style={{
                    backgroundColor: theme.page.primary,
                    border: 'none',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                  }}
                  disabled={saving}
                >
                  {saving ? (
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
          ) : (
            // ============ VIEW MODE - MENURUN & RAPI ============
            <div className="row g-0" style={{ 
              backgroundColor: 'var(--page-bg)', 
              borderRadius: '8px',
              border: `1px solid var(--border-color)`,
              overflow: 'hidden',
            }}>
              {/* Kiri - Informasi Pribadi */}
              <div className="col-md-6" style={{ 
                borderRight: `1px solid var(--border-color)`,
              }}>
                <div className="p-4">
                  <h5 className="text-sm font-semibold mb-3" style={{ 
                    color: 'var(--text-primary)',
                    borderBottom: `2px solid ${theme.page.primary}`,
                    paddingBottom: '8px',
                    display: 'inline-block',
                  }}>
                    <IconUser size={18} style={{ marginRight: '8px', color: theme.page.primary }} />
                    Informasi Pribadi
                  </h5>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Nama Lengkap
                      </p>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {pegawai?.nama_pegawai || '-'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Email
                      </p>
                      <p style={{ color: 'var(--text-primary)' }}>
                        {pegawai?.email || '-'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Nomor HP
                      </p>
                      <p style={{ color: 'var(--text-primary)' }}>
                        {pegawai?.nomor_hp || '-'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Tempat Lahir
                      </p>
                      <p style={{ color: 'var(--text-primary)' }}>
                        {pegawai?.tempat_lahir || '-'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Tanggal Lahir
                      </p>
                      <p style={{ color: 'var(--text-primary)' }}>
                        {formatDate(pegawai?.tanggal_lahir)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kanan - Informasi Profesional */}
              <div className="col-md-6">
                <div className="p-4">
                  <h5 className="text-sm font-semibold mb-3" style={{ 
                    color: 'var(--text-primary)',
                    borderBottom: `2px solid ${theme.page.primary}`,
                    paddingBottom: '8px',
                    display: 'inline-block',
                  }}>
                    <IconBriefcase size={18} style={{ marginRight: '8px', color: theme.page.primary }} />
                    Informasi Profesional
                  </h5>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Alamat
                      </p>
                      <p style={{ color: 'var(--text-primary)' }}>
                        {pegawai?.alamat_lengkap || '-'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Jabatan
                      </p>
                      <p style={{ color: 'var(--text-primary)' }}>
                        {pegawai?.jabatan || '-'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Departemen
                      </p>
                      <p style={{ color: 'var(--text-primary)' }}>
                        {pegawai?.departemen || '-'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        NIP
                      </p>
                      <p style={{ color: 'var(--text-primary)' }}>
                        {pegawai?.nip || '-'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Masa Kerja
                      </p>
                      <p style={{ color: 'var(--text-primary)' }}>
                        {pegawai?.masa_kerja !== undefined ? `${pegawai.masa_kerja} tahun` : '-'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Status
                      </p>
                      <p style={{ color: 'var(--text-primary)' }}>
                        {pegawai?.status || '-'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Status Kontrak
                      </p>
                      <p style={{ color: 'var(--text-primary)' }}>
                        {pegawai?.status_kontrak || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Ganti Password */}
      <div className="card mt-6" style={{
        backgroundColor: 'var(--card-bg)',
        border: `1px solid var(--border-color)`,
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <IconLock size={20} style={{ color: theme.page.primary }} />
            <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Ganti Password
            </h4>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  Password Saat Ini
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.current_password}
                    onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm pr-10"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      borderColor: passwordErrors.current_password ? '#dc2626' : 'var(--border-color)',
                    }}
                    placeholder="••••••••"
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
                {passwordErrors.current_password && (
                  <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{passwordErrors.current_password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.new_password}
                    onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm pr-10"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      borderColor: passwordErrors.new_password ? '#dc2626' : 'var(--border-color)',
                    }}
                    placeholder="Minimal 6 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showNewPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                  </button>
                </div>
                {passwordErrors.new_password && (
                  <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{passwordErrors.new_password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirm_password}
                    onChange={e => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm pr-10"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      borderColor: passwordErrors.confirm_password ? '#dc2626' : 'var(--border-color)',
                    }}
                    placeholder="Ulangi password baru"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showConfirmPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                  </button>
                </div>
                {passwordErrors.confirm_password && (
                  <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{passwordErrors.confirm_password}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg text-sm font-medium text-white flex items-center gap-2"
                style={{
                  backgroundColor: theme.page.primary,
                  border: 'none',
                  cursor: changingPassword ? 'not-allowed' : 'pointer',
                  opacity: changingPassword ? 0.7 : 1,
                }}
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Mengubah...
                  </>
                ) : (
                  <>
                    <IconLock size={16} />
                    Ganti Password
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