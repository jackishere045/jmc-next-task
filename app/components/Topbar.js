'use client';
import { useState } from 'react';
import Link from 'next/link';
import { IconMenu2, IconBell, IconMoon, IconSun, IconUser, IconLogout } from '@tabler/icons-react';
import useAuth from '../hooks/useAuth';
import { theme } from '../lib/theme';

export default function Topbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    // Pakai data-theme di <html> — dibaca globals.css
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
  };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 1050,
      backgroundColor: theme.topbar.bg,
      borderBottom: `1px solid ${theme.topbar.border}`,
      boxShadow: theme.topbar.shadow,
      height: theme.topbar.height,
      display: 'flex', alignItems: 'center',
      padding: '0 1.25rem', gap: '8px',
    }}>
      {/* Hamburger */}
      <button
        onClick={onToggleSidebar}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: theme.topbar.textMuted, padding: '6px', borderRadius: '6px',
          display: 'flex', alignItems: 'center',
        }}
      >
      </button>

      <div style={{ flex: 1 }} />

      {/* Dark mode toggle */}
      
        <IconMenu2 size={20} />
      <button
        onClick={toggleTheme}
        title={dark ? 'Light Mode' : 'Dark Mode'}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: theme.topbar.textMuted, padding: '6px', borderRadius: '6px',
          display: 'flex', alignItems: 'center',
        }}
      >
        {dark ? <IconSun size={19} /> : <IconMoon size={19} />}
      </button>

      {/* Notifikasi */}
      <button style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: theme.topbar.textMuted, padding: '6px', borderRadius: '6px',
        display: 'flex', alignItems: 'center', position: 'relative',
      }}>
        <IconBell size={19} />
        <span style={{
          position: 'absolute', top: '5px', right: '5px',
          width: '6px', height: '6px', borderRadius: '50%',
          backgroundColor: '#ef4444',
        }} />
      </button>

      {/* User dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setDropdownOpen(d => !d)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px 6px', borderRadius: '8px',
          }}
        >
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            backgroundColor: '#dbeafe',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, color: '#216ac4', fontSize: '13px', flexShrink: 0,
          }}>
            {user?.nama?.[0]?.toUpperCase() || 'U'}
          </div>
          
        </button>

        {dropdownOpen && (
          <>
            <div onClick={() => setDropdownOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 9998 }} />
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 6px)',
              backgroundColor: theme.page.cardBg,
              border: `1px solid ${theme.page.border}`,
              borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              minWidth: '180px', zIndex: 9999, overflow: 'hidden',
            }}>
              <Link href="/profile" onClick={() => setDropdownOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '11px 14px', color: theme.page.text,
                textDecoration: 'none', fontSize: '13.5px',
              }}>
                <IconUser size={15} style={{ color: theme.topbar.textMuted }} />
                Profil Saya
              </Link>
              <div style={{ height: '1px', backgroundColor: theme.page.border }} />
              <button onClick={() => { setDropdownOpen(false); logout(); }} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '11px 14px', color: theme.page.danger,
                background: 'none', border: 'none', cursor: 'pointer',
                width: '100%', fontSize: '13.5px',
              }}>
                <IconLogout size={15} />
                Keluar
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}