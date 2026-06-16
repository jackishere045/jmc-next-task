'use client';
import { useEffect, useState } from 'react';
import { IconUsers, IconUserCheck, IconUserX, IconSchool } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import api from '../../lib/axios';
import useAuth from '../../hooks/useAuth';
import Link from 'next/link';
import { theme } from '../../lib/theme';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id_role === 2) {
      api.get('/pegawai/dashboard-stats')
        .then(r => {
          setStats(r.data.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  // Data untuk chart (sementara)
  const statusPegawaiSeries = [75, 30, 19];
  const genderPegawaiSeries = [100, 24];

  const statusPegawaiOptions = {
    chart: { 
      type: 'donut', 
      height: 200,
      foreColor: theme.page.text,
    },
    labels: ['PKWT', 'PKWTT', 'Magang'],
    colors: ['rgba(84, 128, 199, 1)', 'rgba(43, 80, 142, 1)', 'rgba(254, 126, 0, 1)'],
    legend: { 
      position: 'bottom',
      labels: { colors: theme.page.text },
    },
    dataLabels: { 
      enabled: true,
      style: { colors: ['#fff'] },
    },
    tooltip: {
      theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light',
    },
  };

  const genderPegawaiOptions = {
    chart: { 
      type: 'donut', 
      height: 200,
      foreColor: theme.page.text,
    },
    labels: ['Laki-laki', 'Perempuan'],
    colors: ['rgba(43, 80, 142, 1)', 'rgba(254, 126, 0, 1)'],
    legend: { 
      position: 'bottom',
      labels: { colors: theme.page.text },
    },
    dataLabels: { 
      enabled: true,
      style: { colors: ['#fff'] },
    },
    tooltip: {
      theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light',
    },
  };

  const dataPegawaiTerbaru = [
    { nipp: '12345', nama: 'Budi Purwanto', tanggalMasuk: '2024-01-15', status: 'PKWT' },
    { nipp: '12346', nama: 'Siti Rahayu', tanggalMasuk: '2024-02-01', status: 'PKWTT' },
    { nipp: '12347', nama: 'Ahmad Fauzi', tanggalMasuk: '2024-03-10', status: 'Magang' },
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user || user.id_role !== 2) {
    return (
      <div className="page-header mb-4">
        <div className="page-title">
          <h2 className="mb-0" style={{ color: theme.page.heading }}>
            Selamat Datang, {user?.nama} ({user?.nama_role})
          </h2>
        </div>
      </div>
    );
  }

  const totalStatistik = [
    { title: 'Total Pegawai', value: stats?.total || 0, icon: IconUsers, backgroundColor: '#5480c7' },
    { title: 'PKWT', value: stats?.kontrak || 0, icon: IconUserX, backgroundColor: '#fe7e00' },
    { title: 'PKWTT', value: stats?.tetap || 0, icon: IconUserCheck, backgroundColor: '#2b508e' },
    { title: 'Magang', value: stats?.magang || 0, icon: IconSchool, backgroundColor: '#10b981' },
  ];

  return (
    <div style={{ padding: '0', width: '100%' }}>
      <div className="row g-3">
        {/* Card Greeting */}
        <div className="col-md-3">
          <div className="card h-100 position-relative" style={{
            backgroundColor: '#1e293b',
            borderColor: theme.page.border,
          }}>
            <div className="card-body">
              <div className="text-center">
                <div className="mb-4">
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h3 className="card-title text-white" style={{ fontSize: '1rem' }}>
                  Halo, selamat datang {user?.nama}
                </h3>
                <p className="text-white-50 fw-lighter fst-italic" style={{ fontSize: '0.875rem' }}>
                  "Fokuskan tujuan yang ingin didapat, jangan biarkan faktor lain menghalangi tujuan Anda"
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-9">
          <div className="row g-3">
            {/* Card Total */}
            <div className="col-12">
              <div className="card" style={{
                backgroundColor: theme.page.cardBg,
                borderColor: theme.page.border,
              }}>
                <div className="card-body">
                  <div className="row g-3">
                    {totalStatistik.map((item, index) => (
                      <div key={index} className="col-md-6 col-lg-3">
                        <div className="row align-items-center">
                          <div className="col-auto">
                            <div
                              className="d-flex rounded-circle"
                              style={{
                                width: '56px',
                                height: '56px',
                                background: item.backgroundColor,
                              }}
                            >
                              <item.icon size={28} className="m-auto text-white" />
                            </div>
                          </div>
                          <div className="col">
                            <h3 className="fs-2 mb-1" style={{ color: theme.page.heading }}>
                              {item.value}
                            </h3>
                            <p className="fw-light mb-0" style={{ color: theme.page.textMuted }}>
                              {item.title}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Status Kontrak */}
            <div className="col-md-6">
              <div className="card" style={{
                backgroundColor: theme.page.cardBg,
                borderColor: theme.page.border,
              }}>
                <div className="card-body">
                  <h3 className="card-title" style={{ color: theme.page.heading }}>
                    Total Pegawai Berdasarkan Status Kontrak
                  </h3>
                  <Chart
                    type="donut"
                    height={200}
                    options={statusPegawaiOptions}
                    series={statusPegawaiSeries}
                  />
                </div>
              </div>
            </div>

            {/* Chart Gender */}
            <div className="col-md-6">
              <div className="card" style={{
                backgroundColor: theme.page.cardBg,
                borderColor: theme.page.border,
              }}>
                <div className="card-body">
                  <h3 className="card-title" style={{ color: theme.page.heading }}>
                    Total Pegawai Berdasarkan Gender
                  </h3>
                  <Chart
                    type="donut"
                    height={200}
                    options={genderPegawaiOptions}
                    series={genderPegawaiSeries}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pegawai Terbaru */}
        <div className="col-12">
          <div className="card" style={{
            backgroundColor: theme.page.cardBg,
            borderColor: theme.page.border,
          }}>
            <div className="card-header" style={{
              borderBottomColor: theme.page.border,
              backgroundColor: 'transparent',
            }}>
              <h3 className="card-title" style={{ color: theme.page.heading }}>
                Data Pegawai Terbaru
              </h3>
            </div>
            <div className="table-responsive card-body p-0">
              <table className="table table-vcenter card-table" style={{
                color: theme.page.text,
              }}>
                <thead style={{backgroundColor: theme.page.tableHeaderBg,
                }}>
                 <tr className={document.documentElement.getAttribute('data-theme') === 'dark' ? 'text-light' : 'text-dark'}>
                    <th className="w-1" style={{ color: theme.page.textMuted }}>No</th>
                    <th style={{ color: theme.page.textMuted }}>NIPP</th>
                    <th style={{ color: theme.page.textMuted }}>Nama Lengkap</th>
                    <th style={{ color: theme.page.textMuted }}>Tanggal Masuk</th>
                    <th style={{ color: theme.page.textMuted }}>Status Kepegawaian</th>
                    <th style={{ color: theme.page.textMuted }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {dataPegawaiTerbaru.map((item, index) => (
                    <tr key={item.nipp} style={{
                      borderBottomColor: theme.page.border,
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.page.tableHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}>
                      <td className="text-center" style={{ color: theme.page.text }}>
                        {index + 1}
                      </td>
                      <td style={{ color: theme.page.text }}>{item.nipp}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: theme.page.tableHeaderBg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              color: theme.page.textMuted,
                            }}
                          >
                            {item.nama.charAt(0)}
                          </div>
                          <p className="mb-0" style={{ color: theme.page.text }}>
                            {item.nama}
                          </p>
                        </div>
                      </td>
                      <td style={{ color: theme.page.text }}>
                        {new Date(item.tanggalMasuk).toLocaleDateString('id-ID')}
                      </td>
                      <td>
                        <span className={`badge ${item.status === 'PKWTT' ? 'bg-success' : item.status === 'PKWT' ? 'bg-warning' : 'bg-info'}`}
                          style={{
                            backgroundColor: item.status === 'PKWTT' ? '#16a34a' : 
                                           item.status === 'PKWT' ? '#f8a400' : '#0ea5e9',
                            color: item.status === 'PKWT' ? '#000' : '#fff',
                          }}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <Link 
                          href={`/pegawai/${item.nipp}`} 
                          className="btn btn-primary btn-sm"
                          style={{
                            backgroundColor: theme.page.primary,
                            borderColor: theme.page.primary,
                          }}
                        >
                          Detail Pegawai
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}