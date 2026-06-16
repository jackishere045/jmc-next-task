'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!stored || !token) {
      router.replace('/login');
      return;
    }
    const parsed = JSON.parse(stored);
    setUser(parsed);

    const perms = JSON.parse(localStorage.getItem('permissions') || '[]');
    setPermissions(perms);
    setLoading(false);
  }, []);

  const hasAccess = (kodeModul) => {
    return permissions.some(p => p.kode_modul === kodeModul && p.akses === 1);
  };

  const logout = () => {
    localStorage.clear();
    router.replace('/login');
  };

  return { user, permissions, loading, hasAccess, logout };
}