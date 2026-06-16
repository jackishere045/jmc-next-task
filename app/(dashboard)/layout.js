'use client';
import { useState } from 'react';
import AuthGuard from '../components/AuthGuard';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { theme } from '../lib/theme';

const SIDEBAR_WIDTH = theme.sidebar.width;

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AuthGuard>
      <div style={{ 
        display: 'flex', 
        minHeight: '100vh', 
        backgroundColor: theme.page.bg,
        margin: 0,
        padding: 0,
      }}>

        {/* Sidebar */}
        <div style={{
          position: 'fixed', 
          top: 0, 
          left: 0,
          width: SIDEBAR_WIDTH, 
          height: '100vh',
          transform: collapsed ? `translateX(-${SIDEBAR_WIDTH})` : 'translateX(0)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1060,
          overflow: 'hidden',
        }}>
          <Sidebar />
        </div>

        {/* Main content */}
        <div style={{
          marginLeft: collapsed ? 0 : SIDEBAR_WIDTH,
          transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          width: '100%',
        }}>
          <Topbar onToggleSidebar={() => setCollapsed(c => !c)} />

          <main style={{
            flex: 1,
            color: theme.page.text,
            width: '100%',
            maxWidth: '100%',
            overflowX: 'hidden',
          }}>
            {children}
          </main>
        </div>

      </div>
    </AuthGuard>
  );
}