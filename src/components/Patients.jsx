import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from './Modal';

export default function Patients({ showToast }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  // Form State
  const initialForm = {
    name: '',
    age: '',
    gender: 'Male',
    contact: '',
    email: '',
    address: '',
    bloodGroup: 'O+',
    medicalHistory: '',
    admissionDate: new Date().toISOString().split('T')[0],
    status: 'ADMITTED',
  };
  const [formData, setFormData] = useState(initialForm);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await api.getPatients({ search: searchTerm, status: statusFilter });
      setPatients(data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load patients', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [searchTerm, statusFilter]);

  const handleOpenAddModal = () => {
    setEditingPatient(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name || '',
      age: patient.age || '',
      gender: patient.gender || 'Male',
      contact: patient.contact || '',
      email: patient.email || '',
      address: patient.address || '',
      bloodGroup: patient.bloodGroup || 'O+',
      medicalHistory: patient.medicalHistory || '',
      admissionDate: patient.admissionDate || new Date().toISOString().split('T')[0],
      status: patient.status || 'ADMITTED',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age, 10),
      };

      if (editingPatient) {
        await api.updatePatient(editingPatient.id, payload);
        showToast('Patient record updated successfully!', 'success');
      } else {
        await api.createPatient(payload);
        showToast('New patient admitted successfully!', 'success');
      }

      setIsModalOpen(false);
      loadPatients();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updatePatientStatus(id, newStatus);
      showToast(`Patient status changed to ${newStatus}`, 'success');
      loadPatients();
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this patient record?')) return;
    try {
      await api.deletePatient(id);
      showToast('Patient record deleted', 'info');
      loadPatients();
    } catch (err) {
      showToast(err.message || 'Failed to delete patient', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Patient Directory & Admissions</h1>
          <p className="page-subtitle">Manage in-patient and out-patient records, admissions, and discharge status.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          ➕ Admit New Patient
        </button>
      </div>

      {/* Filter and search controls */}
      <div className="controls-bar">
        <div className="search-input-group">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search patient by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="ADMITTED">Admitted</option>
          <option value="DISCHARGED">Discharged</option>
          <option value="OUTPATIENT">Outpatient</option>
        </select>
      </div>

      {/* Patients Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient Name</th>
                <th>Age / Gender</th>
                <th>Contact</th>
                <th>Blood Group</th>
                <th>Admission Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>Loading patients...</td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No patients found. Click "Admit New Patient" to add one!
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td>
                      <strong>{p.name}</strong>
                      {p.medicalHistory && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Notes: {p.medicalHistory}
                        </div>
                      )}
                    </td>
                    <td>{p.age} yrs / {p.gender}</td>
                    <td>
                      <div>{p.contact}</div>
                      {p.email && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.email}</div>}
                    </td>
                    <td><span className="badge badge-blue">{p.bloodGroup}</span></td>
                    <td>{p.admissionDate}</td>
                    <td>
                      <span className={`badge badge-${p.status?.toLowerCase() || 'admitted'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {p.status === 'ADMITTED' ? (
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Discharge Patient"
                            onClick={() => handleStatusChange(p.id, 'DISCHARGED')}
                          >
                            🚪 Discharge
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Readmit Patient"
                            onClick={() => handleStatusChange(p.id, 'ADMITTED')}
                          >
                            🏥 Re-Admit
                          </button>
                        )}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEditModal(p)}
                          title="Edit Details"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(p.id)}
                          title="Delete Record"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPatient ? `Edit Patient: ${editingPatient.name}` : 'Admit New Patient'}
        maxWidth="600px"
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-grid">
            <div className="form-group col-span-2">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Age *</label>
              <input
                type="number"
                min="0"
                max="125"
                className="form-control"
                required
                placeholder="e.g. 35"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select
                className="form-control"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                className="form-control"
                required
                placeholder="e.g. +91 9876543210"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Blood Group *</label>
              <select
                className="form-control"
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="e.g. rahul@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Residential Address</label>
              <input
                type="text"
                className="form-control"
                placeholder="Full address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Admission Date *</label>
              <input
                type="date"
                className="form-control"
                required
                value={formData.admissionDate}
                onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status *</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ADMITTED">Admitted</option>
                <option value="OUTPATIENT">Outpatient</option>
                <option value="DISCHARGED">Discharged</option>
              </select>
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Medical History / Symptoms</label>
              <textarea
                className="form-control"
                placeholder="e.g. Hypertension, allergies, previous surgeries..."
                value={formData.medicalHistory}
                onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '0 -24px -24px -24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingPatient ? 'Save Changes' : 'Admit Patient'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
