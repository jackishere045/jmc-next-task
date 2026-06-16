'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/axios';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ 
    identifier: '', 
    password: '',
    captcha: '', 
    rememberMe: false 
  });
  const [captchaData, setCaptchaData] = useState({ sessionId: '', captcha: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    // Redirect kalau sudah login
    const token = localStorage.getItem('token');
    if (token) router.replace('/dashboard');
    
    // Load captcha
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    try {
      const { data } = await api.get('/auth/captcha');
      setCaptchaData({ sessionId: data.sessionId, captcha: data.captcha });
    } catch {
      toast.error('Gagal memuat captcha');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.captcha) {
      toast.error('Captcha wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', {
        identifier: form.identifier,
        password: form.password,
        captcha: form.captcha,
        captchaSessionId: captchaData.sessionId,
        rememberMe: form.rememberMe,
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('lastActivity', Date.now().toString());
      if (form.rememberMe) localStorage.setItem('rememberMe', 'true');

      // Ambil permissions
      const me = await api.get('/auth/me');
      localStorage.setItem('permissions', JSON.stringify(me.data.data.permissions));

      toast.success('Login berhasil!');
      router.replace('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login gagal');
      fetchCaptcha(); // Refresh captcha
      setForm(f => ({ ...f, captcha: '' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Toaster position="top-right" />
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary mb-0">JMC</h2>
                  <p className="text-muted small">Sistem Informasi Kepegawaian</p>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Username */}
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control py-3 border-0 bg-light text-dark"
                      placeholder="Username / Email / No. HP"
                      value={form.identifier}
                      onChange={e => setForm(f => ({ ...f, identifier: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <div className="input-group">
                      <input
                        type={showPass ? 'text' : 'password'}
                        className="form-control py-3 border-0 bg-light text-dark"
                        placeholder="Password"
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-light border-0"
                        onClick={() => setShowPass(!showPass)}
                      >
                        {showPass ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  {/* Captcha */}
                  <div className="mb-3">
                    <div className="d-flex align-items-center gap-3 mb-2">
                      <div 
                        className="bg-dark text-white px-4 py-2 rounded fw-bold fs-4"
                        style={{ 
                          letterSpacing: '0.3em', 
                          fontFamily: 'monospace',
                          userSelect: 'none',
                          minWidth: '120px',
                          textAlign: 'center'
                        }}
                      >
                        {captchaData.captcha}
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-secondary"
                        onClick={fetchCaptcha}
                      >
                        🔄 Refresh
                      </button>
                    </div>
                    <input
                      type="text"
                      className="form-control py-3 border-0 bg-light text-dark"
                      placeholder="Ketik kode captcha di atas"
                      value={form.captcha}
                      onChange={e => setForm(f => ({ ...f, captcha: e.target.value.toUpperCase() }))}
                      maxLength={5}
                      required
                    />
                  </div>

                  {/* Remember Me */}
                  <div className="mb-3">
                    <label className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={form.rememberMe}
                        onChange={e => setForm(f => ({ ...f, rememberMe: e.target.checked }))}
                      />
                      <span className="form-check-label">Remember Me</span>
                    </label>
                  </div>

                  {/* Submit */}
                  <div className="d-grid mt-4">
                    <button 
                      className="btn btn-primary text-uppercase shadow py-3" 
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Memproses...
                        </>
                      ) : (
                        'Masuk'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}