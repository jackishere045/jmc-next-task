'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  IconArrowLeft, IconCheck
} from '@tabler/icons-react';
import api from '../../../lib/axios';
import { theme } from '../../../lib/theme';
import toast, { Toaster } from 'react-hot-toast';
import useAuth from '../../../hooks/useAuth';

// Hanya Admin HRD (role id = 3) yang bisa akses
const ROLES_WITH_ACCESS = [3];

export default function EditSettingTunjangan() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [form, setForm] = useState({
    base_fare: '',
    min_km: '',
    max_km: '',
    berlaku_mulai: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // Cek akses
  const hasAccess = user && ROLES_WITH_ACCESS.includes(user.id_role);

  useEffect(() => {
    if (hasAccess) {
      fetchData();
    } else {
      setFetchLoading(false);
    }
  }, [hasAccess]);

  const fetchData = async () => {
    try {
      const res = await api.get('/tunjangan/setting');
      const item = res.data.data.find(d => d.id === parseInt(id));
      if (item) {
        setForm({
          base_fare: item.base_fare || '',
          min_km: item.min_km || '',
          max_km: item.max_km || '',
          berlaku_mulai: item.berlaku_mulai ? item.berlaku_mulai.split('T')[0] : '',
        });
      } else {
        toast.error('Data tidak ditemukan');
        router.push('/setting-tunjangan');
      }
    } catch (error) {
      toast.error('Gagal memuat data');
      router.push('/setting-tunjangan');
    } finally {
      setFetchLoading(false);
    }
  };

  // Jika tidak punya akses
  if (!hasAccess && !fetchLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '500px' }}>
        <div className="text-center">
          <div className="mb-3" style={{ fontSize: '48px' }}>🔒</div>
          <h4 style={{ color: 'var(--text-primary)' }}>Akses Ditolak</h4>
          <p style={{ color: 'var(--text-muted)' }}>Anda tidak memiliki akses ke halaman ini</p>
        </div>
      </div>
    );
  }

  if (fetchLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.page.primary }} />
      </div>
    );
  }

  const validateForm = () => {
    const errors = {};
    if (!form.base_fare) errors.base_fare = 'Tarif wajib diisi';
    if (parseInt(form.base_fare) <= 0) errors.base_fare = 'Tarif harus lebih dari 0';
    if (!form.berlaku_mulai) errors.berlaku_mulai = 'Tanggal berlaku wajib diisi';
    if (form.min_km && parseInt(form.min_km) < 0) errors.min_km = 'Min KM tidak boleh negatif';
    if (form.max_km && parseInt(form.max_km) < 0) errors.max_km = 'Max KM tidak boleh negatif';
    if (form.min_km && form.max_km && parseInt(form.min_km) >= parseInt(form.max_km)) {
      errors.max_km = 'Max KM harus lebih besar dari Min KM';
    }
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
      const payload = {
        base_fare: parseInt(form.base_fare),
        min_km: parseInt(form.min_km) || 0,
        max_km: parseInt(form.max_km) || 25,
        berlaku_mulai: form.berlaku_mulai,
      };

      await api.put(`/tunjangan/setting/${id}`, payload);
      toast.success('Setting tunjangan berhasil diperbarui');
      router.push('/setting-tunjangan');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div style={{ padding: '0 1rem', maxWidth: '600px', margin: '0 auto' }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/setting-tunjangan" style={{ color: 'var(--text-muted)' }}>
          <IconArrowLeft size={24} />
        </Link>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Edit Setting Tunjangan
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Perbarui aturan tunjangan transport
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
            {/* Tarif */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                Tarif (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="base_fare"
                value={form.base_fare}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-primary)',
                  borderColor: formErrors.base_fare ? '#dc2626' : 'var(--border-color)',
                }}
                placeholder="Contoh: 5000"
                min="0"
                required
              />
              {formErrors.base_fare && (
                <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{formErrors.base_fare}</p>
              )}
            </div>

            {/* Min KM & Max KM */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  Min KM
                </label>
                <input
                  type="number"
                  name="min_km"
                  value={form.min_km}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    borderColor: formErrors.min_km ? '#dc2626' : 'var(--border-color)',
                  }}
                  placeholder="0"
                  min="0"
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Pegawai dengan jarak kurang dari ini tidak mendapat tunjangan
                </p>
                {formErrors.min_km && (
                  <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{formErrors.min_km}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  Max KM
                </label>
                <input
                  type="number"
                  name="max_km"
                  value={form.max_km}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    borderColor: formErrors.max_km ? '#dc2626' : 'var(--border-color)',
                  }}
                  placeholder="25"
                  min="0"
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Jarak lebih dari ini akan dikap di nilai maksimum
                </p>
                {formErrors.max_km && (
                  <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{formErrors.max_km}</p>
                )}
              </div>
            </div>

            {/* Berlaku Mulai */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                Berlaku Mulai <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="berlaku_mulai"
                value={form.berlaku_mulai}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-primary)',
                  borderColor: formErrors.berlaku_mulai ? '#dc2626' : 'var(--border-color)',
                }}
                required
              />
              {formErrors.berlaku_mulai && (
                <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{formErrors.berlaku_mulai}</p>
              )}
            </div>

            {/* Tombol */}
            <div className="flex gap-3">
              <Link
                href="/setting-tunjangan"
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
                    Perbarui
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