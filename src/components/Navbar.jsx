import React from 'react';

export default function Navbar({ activeTab, setActiveTab, isBackendConnected }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'patients', label: 'Patients', icon: '🧑‍🤝‍🧑' },
    { id: 'doctors', label: 'Doctors', icon: '🩺' },
    { id: 'appointments', label: 'Appointments', icon: '📅' },
    { id: 'billing', label: 'Billing & Invoices', icon: '💳' },
  ];

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand" onClick={() => setActiveTab('dashboard')}>
          <div className="brand-icon">✚</div>
          <div>
            <span className="brand-title">CarePulse HMS</span>
            <span className="brand-badge">v1.0</span>
          </div>
        </div>

        <nav>
          <ul className="nav-links">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <div className={`server-pill ${isBackendConnected ? 'online' : 'offline'}`}>
            <span className={`dot ${isBackendConnected ? 'online' : 'offline'}`}></span>
            <span>{isBackendConnected ? 'Backend Connected' : 'Server Offline'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
