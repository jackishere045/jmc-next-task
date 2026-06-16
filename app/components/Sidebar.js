'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import {
  IconLayoutDashboard, IconShieldLock, IconUsers,
  IconUserCircle, IconId, IconBus, IconSettings,
  IconFileText, IconLogout, IconChevronDown, IconChevronRight
} from '@tabler/icons-react';
import useAuth from '../hooks/useAuth';
import { theme } from '../lib/theme';

// Definisikan menu dengan role access
// Role: 1=Superadmin, 2=Manager HRD, 3=Admin HRD
const menuItems = [
  { 
    label: 'Dashboard', 
    href: '/dashboard', 
    icon: IconLayoutDashboard, 
    kode: 'dashboard',
    roles: [1, 2, 3] // Semua role bisa akses dashboard
  },
  { 
    label: 'Data Pegawai', 
    href: '/pegawai', 
    icon: IconId, 
    kode: 'pegawai',
    roles: [2, 3] // Manager HRD & Admin HRD bisa akses (Superadmin tidak)
  },
  { 
    label: 'Tunjangan', 
    icon: IconBus, 
    kode: 'tunjangan',
    roles: [2, 3], // Manager HRD & Admin HRD bisa akses
    children: [
      { 
        label: 'Setting Transport', 
        href: '/setting-tunjangan', 
        kode: 'setting_tunjangan',
        roles: [3] // HANYA Admin HRD (role 3) yang bisa akses setting
      },
      { 
        label: 'Tunjangan Transport', 
        href: '/tunjangan', 
        kode: 'tunjangan_transport',
        roles: [2, 3] // Manager HRD & Admin HRD bisa akses
      },
    ]
  },
  { 
    label: 'Manajemen User', 
    icon: IconUsers, 
    kode: 'manajemen_user',
    roles: [1], // HANYA Superadmin yang bisa akses
    children: [
      { 
        label: 'Kelola Role', 
        href: '/roles', 
        kode: 'roles',
        roles: [1] // HANYA Superadmin
      },
      { 
        label: 'Kelola User', 
        href: '/users', 
        kode: 'users',
        roles: [1] // HANYA Superadmin
      },
    ]
  },
  { 
    label: 'Log Aktivitas', 
    href: '/log', 
    icon: IconFileText, 
    kode: 'log',
    roles: [1] // HANYA Superadmin yang bisa akses log
  },
];

// Fungsi untuk filter menu berdasarkan role user
const filterMenuByRole = (items, userRole) => {
  return items
    .map(item => {
      // Cek apakah user punya akses ke menu ini
      const hasAccess = item.roles ? item.roles.includes(userRole) : true;
      
      // Jika ada children, filter children juga
      let filteredChildren = [];
      if (item.children) {
        filteredChildren = item.children.filter(child => {
          return child.roles ? child.roles.includes(userRole) : true;
        });
      }

      // Jika menu tidak punya akses dan tidak ada children yang bisa diakses, skip
      if (!hasAccess && filteredChildren.length === 0) {
        return null;
      }

      // Jika menu tidak punya akses tapi ada children yang bisa diakses, tampilkan menu dengan children terfilter
      if (!hasAccess && filteredChildren.length > 0) {
        return {
          ...item,
          children: filteredChildren
        };
      }

      // Jika menu punya akses, tampilkan dengan children terfilter
      return {
        ...item,
        children: filteredChildren.length > 0 ? filteredChildren : undefined
      };
    })
    .filter(item => item !== null);
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  // Filter menu berdasarkan role user
  const userRole = user?.id_role || 0;
  const filteredMenu = filterMenuByRole(menuItems, userRole);

  // State untuk toggle menu - hanya untuk menu yang muncul
  const [openMenus, setOpenMenus] = useState(() => {
    const initial = {};
    filteredMenu.forEach(item => {
      if (item.children) {
        initial[item.kode] = true;
      }
    });
    return initial;
  });

  const toggleMenu = (kode) => {
    setOpenMenus(prev => ({
      ...prev,
      [kode]: !prev[kode]
    }));
  };

  // Cek apakah menu kosong
  if (filteredMenu.length === 0) {
    return (
      <aside style={{
        backgroundColor: theme.sidebar.bg,
        borderRight: `1px solid ${theme.sidebar.border}`,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem 0',
        width: '100%',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '1rem', textAlign: 'center', color: theme.sidebar.textMuted }}>
          <p style={{ fontSize: '0.875rem' }}>Tidak ada menu yang tersedia</p>
        </div>
      </aside>
    );
  }

  return (
    <aside style={{
      backgroundColor: theme.sidebar.bg,
      borderRight: `1px solid ${theme.sidebar.border}`,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '1rem 0',
      width: '100%',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ 
        padding: '0 1rem',
        marginBottom: '1.5rem',
        marginLeft: '2rem',
      }}>
        <Link href="/dashboard" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          textDecoration: 'none',
        }}>
          <div style={{
            position: 'relative',
            width: '50px',
            height: '50px',
            flexShrink: 0,
          }}>
            <Image
              src="/logo-jmc.png"
              alt="JMC Logo"
              width={70}
              height={70}
              priority
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
          <span style={{
            color: theme.sidebar.brandText,
            fontWeight: 600,
            fontSize: '0.9rem',
            letterSpacing: '0.3px',
          }}>
            Kepegawaian
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '0 0.75rem',
        overflowX: 'hidden',
      }}>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}>
          {filteredMenu.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openMenus[item.kode] || false;
            const isParentActive = hasChildren && item.children.some(child => 
              pathname === child.href || pathname.startsWith(child.href + '/')
            );
            const isActive = !hasChildren && (pathname === item.href || pathname.startsWith(item.href + '/'));

            if (hasChildren) {
              return (
                <li key={item.kode} style={{ listStyle: 'none' }}>
                  <div 
                    onClick={() => toggleMenu(item.kode)}
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.625rem 0.875rem',
                      borderRadius: '8px',
                      color: isParentActive ? theme.sidebar.activeColor : theme.sidebar.textNormal,
                      backgroundColor: isParentActive ? theme.sidebar.activeBg : 'transparent',
                      fontWeight: isParentActive ? 600 : 400,
                      transition: 'all 0.15s ease',
                      fontSize: '0.875rem',
                    }}
                    onMouseEnter={(e) => {
                      if (!isParentActive) {
                        e.currentTarget.style.backgroundColor = theme.sidebar.hoverBg;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isParentActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <item.icon size={20} style={{ flexShrink: 0 }} />
                      <span>{item.label}</span>
                    </div>
                    {isOpen ? (
                      <IconChevronDown size={16} style={{ color: theme.sidebar.textMuted, flexShrink: 0 }} />
                    ) : (
                      <IconChevronRight size={16} style={{ color: theme.sidebar.textMuted, flexShrink: 0 }} />
                    )}
                  </div>
                  
                  {isOpen && item.children && (
                    <ul style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: '2px 0 0 0',
                      paddingLeft: '1.5rem',
                    }}>
                      {item.children.map((child) => {
                        const active = pathname === child.href || pathname.startsWith(child.href + '/');
                        return (
                          <li key={child.kode} style={{ listStyle: 'none' }}>
                            <Link href={child.href} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              padding: '0.5rem 0.875rem',
                              borderRadius: '8px',
                              color: active ? theme.sidebar.activeColor : theme.sidebar.textNormal,
                              backgroundColor: active ? theme.sidebar.activeBg : 'transparent',
                              textDecoration: 'none',
                              fontSize: '0.875rem',
                              fontWeight: active ? 600 : 400,
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (!active) {
                                e.currentTarget.style.backgroundColor = theme.sidebar.hoverBg;
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!active) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}>
                              <span style={{
                                display: 'inline-block',
                                width: '4px',
                                height: '4px',
                                borderRadius: '50%',
                                backgroundColor: active ? theme.sidebar.activeColor : theme.sidebar.textMuted,
                                flexShrink: 0,
                              }} />
                              <span>{child.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={item.href} style={{ listStyle: 'none' }}>
                <Link href={item.href} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '8px',
                  color: isActive ? theme.sidebar.activeColor : theme.sidebar.textNormal,
                  backgroundColor: isActive ? theme.sidebar.activeBg : 'transparent',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = theme.sidebar.hoverBg;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}>
                  <item.icon size={20} style={{ flexShrink: 0 }} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}