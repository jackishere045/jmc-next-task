'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children, kodeModul }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const perms = JSON.parse(localStorage.getItem('permissions') || '[]');

    if (!token) { router.replace('/login'); return; }

    if (kodeModul) {
      const allowed = perms.some(p => p.kode_modul === kodeModul && p.akses === 1);
      if (!allowed) { router.replace('/dashboard'); return; }
    }

    // Session timeout check (3 menit) — skip kalau rememberMe
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    if (!rememberMe) {
      const lastActivity = parseInt(localStorage.getItem('lastActivity') || '0');
      if (Date.now() - lastActivity > 3 * 60 * 1000) {
        localStorage.clear();
        router.replace('/login');
        return;
      }
    }

    setOk(true);

    // Update last activity on user interaction
    const updateActivity = () => localStorage.setItem('lastActivity', Date.now().toString());
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);

    // Cek session expired tiap 30 detik
    const interval = !rememberMe ? setInterval(() => {
      const last = parseInt(localStorage.getItem('lastActivity') || '0');
      if (Date.now() - last > 3 * 60 * 1000) {
        localStorage.clear();
        router.replace('/login');
      }
    }, 30000) : null;

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      if (interval) clearInterval(interval);
    };
  }, []);

  if (!ok) return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <div className="spinner-border text-primary" />
    </div>
  );

  return children;
}