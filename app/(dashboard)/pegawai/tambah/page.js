'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  IconArrowLeft, IconPlus, IconTrash, IconUpload,
  IconCheck, IconX
} from '@tabler/icons-react';
import api from '../../../lib/axios';
import { theme } from '../../../lib/theme';
import toast, { Toaster } from 'react-hot-toast';

export default function TambahPegawai() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [jabatanList, setJabatanList] = useState([]);
  const [departemenList, setDepartemenList] = useState([]);
  const [wilayahList, setWilayahList] = useState([]);
  const [searchWilayah, setSearchWilayah] = useState('');
  const [showWilayahDropdown, setShowWilayahDropdown] = useState(false);

  const [form, setForm] = useState({
    nip: '',
    nama_pegawai: '',
    email: '',
    nomor_hp: '',
    tempat_lahir: '',
    id_kecamatan: '',
    alamat_lengkap: '',
    jarak_rumah_kantor: '',
    tanggal_lahir: '',
    status_kawin: 'Belum Menikah',
    jumlah_anak: 0,
    tanggal_masuk: '',
    id_jabatan: '',
    id_departemen: '',
    status_kontrak: 'kontrak',
    status: 'Aktif',
  });

  const [pendidikan, setPendidikan] = useState([
    { tingkat_pendidikan: '', nama_sekolah: '', tahun_lulus: '' }
  ]);
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      const [jabatan, departemen] = await Promise.all([
        api.get('/master-data?tipe=jabatan'),
        api.get('/master-data?tipe=departemen'),
      ]);
      setJabatanList(jabatan.data.data);
      setDepartemenList(departemen.data.data);
    } catch (error) {
      toast.error('Gagal memuat data master');
    }
  };

  const searchWilayahHandler = async (q) => {
    setSearchWilayah(q);
    if (q.length < 3) {
      setWilayahList([]);
      return;
    }
    try {
      const res = await api.get(`/pegawai/wilayah?q=${q}`);
      setWilayahList(res.data.data);
      setShowWilayahDropdown(true);
    } catch {
      setWilayahList([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePendidikanChange = (index, field, value) => {
    const newPendidikan = [...pendidikan];
    newPendidikan[index][field] = value;
    setPendidikan(newPendidikan);
  };

  const tambahPendidikan = () => {
    setPendidikan([...pendidikan, { tingkat_pendidikan: '', nama_sekolah: '', tahun_lulus: '' }]);
  };

  const hapusPendidikan = (index) => {
    if (pendidikan.length > 1) {
      setPendidikan(pendidikan.filter((_, i) => i !== index));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran foto maksimal 2MB');
        return;
      }
      setFoto(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        const formData = new FormData();
        Object.keys(form).forEach(key => {
        // 🔥 PERBAIKI: Jika value kosong, jangan kirim atau kirim NULL
        const value = form[key];
        if (value !== undefined && value !== null && value !== '') {
            formData.append(key, value);
        } else {
            // Untuk id_kecamatan, id_jabatan, id_departemen, kirim empty string agar di-backend diubah jadi NULL
            formData.append(key, '');
        }
        });
        formData.append('pendidikan', JSON.stringify(pendidikan.filter(p => p.tingkat_pendidikan)));
        if (foto) formData.append('foto', foto);

        await api.post('/pegawai', formData);
        toast.success('Data pegawai berhasil ditambahkan');
        router.push('/pegawai');
    } catch (error) {
        toast.error(error.response?.data?.message || 'Gagal menambahkan data');
    } finally {
        setLoading(false);
    }
    };

  return (
    <div style={{ padding: '0 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/pegawai" style={{ color: 'var(--text-muted)' }}>
          <IconArrowLeft size={24} />
        </Link>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Tambah Pegawai
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Isi data pegawai baru
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Data Diri */}
        <div className="card" style={{
          backgroundColor: 'var(--card-bg)',
          border: `1px solid var(--border-color)`,
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          <div className="card-header" style={{
            padding: '1rem 1.25rem',
            borderBottom: `1px solid var(--border-color)`,
            backgroundColor: 'transparent',
          }}>
            <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Data Diri</h4>
          </div>
          <div className="card-body" style={{ padding: '1.25rem' }}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  NIP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nip"
                  value={form.nip}
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
            </div>

            {/* Pendidikan */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                Pendidikan
              </label>
              {pendidikan.map((p, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <select
                    value={p.tingkat_pendidikan}
                    onChange={(e) => handlePendidikanChange(index, 'tingkat_pendidikan', e.target.value)}
                    className="px-3 py-2 rounded-lg border text-sm flex-1"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)',
                    }}
                  >
                    <option value="">Tingkat</option>
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                    <option value="D3">D3</option>
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                    <option value="S3">S3</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Nama Sekolah"
                    value={p.nama_sekolah}
                    onChange={(e) => handlePendidikanChange(index, 'nama_sekolah', e.target.value)}
                    className="px-3 py-2 rounded-lg border text-sm flex-1"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)',
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Tahun Lulus"
                    value={p.tahun_lulus}
                    onChange={(e) => handlePendidikanChange(index, 'tahun_lulus', e.target.value)}
                    className="px-3 py-2 rounded-lg border text-sm w-28"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)',
                    }}
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => hapusPendidikan(index)}
                      style={{ color: '#dc2626' }}
                    >
                      <IconTrash size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={tambahPendidikan}
                className="flex items-center gap-1 text-sm mt-1"
                style={{ color: theme.page.primary }}
              >
                <IconPlus size={16} /> Tambah data
              </button>
            </div>

            {/* Alamat */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                Alamat Lengkap
              </label>
              <textarea
                name="alamat_lengkap"
                value={form.alamat_lengkap}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-color)',
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  Kecamatan / Kelurahan
                </label>
                <input
                  type="text"
                  placeholder="Cari kecamatan..."
                  value={searchWilayah}
                  onChange={(e) => searchWilayahHandler(e.target.value)}
                  onFocus={() => setShowWilayahDropdown(true)}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)',
                  }}
                />
                {showWilayahDropdown && wilayahList.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto rounded-lg border"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--border-color)',
                    }}
                  >
                    {wilayahList.map(w => (
                      <div
                        key={w.id}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                        style={{ color: 'var(--text-primary)' }}
                        onClick={() => {
                          setForm(prev => ({ ...prev, id_kecamatan: w.id }));
                          setSearchWilayah(w.kecamatan);
                          setShowWilayahDropdown(false);
                        }}
                      >
                        {w.kecamatan}, {w.kabupaten}, {w.provinsi}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  Jarak Rumah ke Kantor (km)
                </label>
                <input
                  type="number"
                  name="jarak_rumah_kantor"
                  value={form.jarak_rumah_kantor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)',
                  }}
                />
              </div>
            </div>

            {/* Status Pernikahan */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                Status Pernikahan
              </label>
              <div className="flex gap-4">
                {['Belum Menikah', 'Menikah'].map(status => (
                  <label key={status} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                    <input
                      type="radio"
                      name="status_kawin"
                      value={status}
                      checked={form.status_kawin === status}
                      onChange={handleChange}
                    />
                    {status}
                  </label>
                ))}
              </div>
            </div>

            {form.status_kawin === 'Menikah' && (
              <div className="mt-3">
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  Jumlah Anak
                </label>
                <input
                  type="number"
                  name="jumlah_anak"
                  value={form.jumlah_anak}
                  onChange={handleChange}
                  className="w-24 px-3 py-2 rounded-lg border text-sm"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Data Kepegawaian */}
        <div className="card" style={{
          backgroundColor: 'var(--card-bg)',
          border: `1px solid var(--border-color)`,
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          <div className="card-header" style={{
            padding: '1rem 1.25rem',
            borderBottom: `1px solid var(--border-color)`,
            backgroundColor: 'transparent',
          }}>
            <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Data Kepegawaian</h4>
          </div>
          <div className="card-body" style={{ padding: '1.25rem' }}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  Tanggal Masuk <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="tanggal_masuk"
                  value={form.tanggal_masuk}
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
                  Jabatan <span className="text-red-500">*</span>
                </label>
                <select
                  name="id_jabatan"
                  value={form.id_jabatan}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)',
                  }}
                  required
                >
                  <option value="">Pilih Jabatan</option>
                  {jabatanList.map(j => (
                    <option key={j.id} value={j.id}>{j.nama}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  Departemen <span className="text-red-500">*</span>
                </label>
                <select
                  name="id_departemen"
                  value={form.id_departemen}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)',
                  }}
                  required
                >
                  <option value="">Pilih Departemen</option>
                  {departemenList.map(d => (
                    <option key={d.id} value={d.id}>{d.nama}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  Status Kontrak <span className="text-red-500">*</span>
                </label>
                <select
                  name="status_kontrak"
                  value={form.status_kontrak}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)',
                  }}
                  required
                >
                  <option value="kontrak">PKWT</option>
                  <option value="tetap">PKWTT</option>
                  <option value="magang">Magang</option>
                </select>
              </div>
            </div>

            {/* Status Aktif - Toggle Switch */}
            <div className="mt-4 flex items-center gap-3">
              <label className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                Status
              </label>
              <div
                className="relative w-12 h-6 rounded-full cursor-pointer transition-colors"
                style={{
                  backgroundColor: form.status === 'Aktif' ? '#16a34a' : '#64748b',
                }}
                onClick={() => setForm(prev => ({
                  ...prev,
                  status: prev.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif'
                }))}
              >
                <div
                  className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                  style={{
                    transform: form.status === 'Aktif' ? 'translateX(24px)' : 'translateX(0)',
                  }}
                />
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {form.status}
              </span>
            </div>

            {/* Foto */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                Foto
              </label>
              <div className="flex items-center gap-4">
                {fotoPreview ? (
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2" style={{ borderColor: 'var(--border-color)' }}>
                    <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full border-2 flex items-center justify-center" style={{ borderColor: 'var(--border-color)' }}>
                    <IconUpload size={24} style={{ color: 'var(--text-muted)' }} />
                  </div>
                )}
                <label className="px-4 py-2 rounded-lg text-sm cursor-pointer" style={{
                  backgroundColor: 'var(--page-bg)',
                  color: 'var(--text-primary)',
                  border: `1px solid var(--border-color)`,
                }}>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  Pilih Foto
                </label>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Format: JPG, PNG, Maks: 2MB
              </p>
            </div>
          </div>
        </div>

        {/* Tombol */}
        <div className="flex gap-3 pb-6">
          <Link
            href="/pegawai"
            className="px-6 py-2.5 rounded-lg text-sm font-medium border"
            style={{
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
              backgroundColor: 'transparent',
            }}
          >
            Kembali
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white flex items-center gap-2"
            style={{
              backgroundColor: theme.page.primary,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
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
  );
}