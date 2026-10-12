import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Dashboard({ setActiveTab, showToast }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Hospital Overview & Analytics</h1>
          <p className="page-subtitle">Real-time statistics for patients, medical staff, appointments, and billing.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={fetchStats}>
            🔄 Refresh Data
          </button>
          <button className="btn btn-primary" onClick={() => setActiveTab('patients')}>
            ➕ Admit Patient
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Patients</h3>
            <div className="stat-value">{loading ? '...' : (stats?.totalPatients ?? 0)}</div>
          </div>
          <div className="stat-icon stat-blue">🧑‍🤝‍🧑</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Admitted Patients</h3>
            <div className="stat-value">{loading ? '...' : (stats?.admittedPatients ?? 0)}</div>
          </div>
          <div className="stat-icon stat-amber">🏥</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Registered Doctors</h3>
            <div className="stat-value">{loading ? '...' : (stats?.totalDoctors ?? 0)}</div>
          </div>
          <div className="stat-icon stat-purple">🩺</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Scheduled Visits</h3>
            <div className="stat-value">{loading ? '...' : (stats?.scheduledAppointments ?? 0)}</div>
          </div>
          <div className="stat-icon stat-emerald">📅</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <div className="stat-value">
              {loading ? '...' : `₹${Number(stats?.totalRevenue ?? 0).toLocaleString()}`}
            </div>
          </div>
          <div className="stat-icon stat-green">💰</div>
        </div>
      </div>

      {/* Quick Launchpad */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>QUICK ACTIONS</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('patients')}>
            ➕ Admit New Patient
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('appointments')}>
            📅 Book Appointment
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('doctors')}>
            🩺 Add Doctor Profile
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('billing')}>
            💳 Create Patient Bill
          </button>
        </div>
      </div>

      {/* Two-column preview widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '20px' }}>
        {/* Recent Patients Table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Patients</span>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('patients')}>
              View All
            </button>
          </div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Age / Gender</th>
                  <th>Blood Group</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentPatients && stats.recentPatients.length > 0 ? (
                  stats.recentPatients.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.name}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.contact}</div>
                      </td>
                      <td>{p.age} yrs / {p.gender}</td>
                      <td><span className="badge badge-blue">{p.bloodGroup}</span></td>
                      <td>
                        <span className={`badge badge-${p.status?.toLowerCase() || 'admitted'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      {loading ? 'Loading...' : 'No recent patients found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Appointments Table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Upcoming Appointments</span>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('appointments')}>
              View All
            </button>
          </div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.upcomingAppointments && stats.upcomingAppointments.length > 0 ? (
                  stats.upcomingAppointments.map((a) => (
                    <tr key={a.id}>
                      <td><strong>{a.patient?.name}</strong></td>
                      <td>
                        <div>{a.doctor?.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{a.doctor?.specialization}</div>
                      </td>
                      <td>
                        <div>{a.appointmentDate}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{a.appointmentTime}</div>
                      </td>
                      <td>
                        <span className={`badge badge-${a.status?.toLowerCase() || 'scheduled'}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      {loading ? 'Loading...' : 'No upcoming appointments.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
