import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Patients from './components/Patients';
import Doctors from './components/Doctors';
import Appointments from './components/Appointments';
import Billing from './components/Billing';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast notification helper
  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Periodically check backend health
  const checkStatus = async () => {
    const connected = await api.checkHealth();
    setIsBackendConnected(connected);
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendConnected={isBackendConnected}
      />

      <main className="main-content">
        {!isBackendConnected && (
          <div style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fef3c7',
            padding: '12px 18px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            color: '#b45309'
          }}>
            <span>⚠️</span>
            <span>
              <strong>Backend connection offline:</strong> Make sure your Spring Boot backend is running on <code>http://localhost:8080</code> and MySQL server is started.
            </span>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <Dashboard setActiveTab={setActiveTab} showToast={showToast} />
        )}
        {activeTab === 'patients' && (
          <Patients showToast={showToast} />
        )}
        {activeTab === 'doctors' && (
          <Doctors showToast={showToast} />
        )}
        {activeTab === 'appointments' && (
          <Appointments showToast={showToast} />
        )}
        {activeTab === 'billing' && (
          <Billing showToast={showToast} />
        )}
      </main>

      {/* Floating Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span>
              {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
