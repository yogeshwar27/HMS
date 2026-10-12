import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from './Modal';

export default function Doctors({ showToast }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  const initialForm = {
    name: '',
    specialization: '',
    department: '',
    contact: '',
    email: '',
    experienceYears: '',
    consultationFee: '',
    availableDays: 'Mon,Tue,Wed,Thu,Fri',
  };
  const [formData, setFormData] = useState(initialForm);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const data = await api.getDoctors(searchTerm);
      setDoctors(data || []);
    } catch (err) {
      showToast(err.message || 'Failed to fetch doctors', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, [searchTerm]);

  const handleOpenAdd = () => {
    setEditingDoctor(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name || '',
      specialization: doctor.specialization || '',
      department: doctor.department || '',
      contact: doctor.contact || '',
      email: doctor.email || '',
      experienceYears: doctor.experienceYears || '',
      consultationFee: doctor.consultationFee || '',
      availableDays: doctor.availableDays || 'Mon,Tue,Wed,Thu,Fri',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        experienceYears: parseInt(formData.experienceYears, 10),
        consultationFee: parseFloat(formData.consultationFee),
      };

      if (editingDoctor) {
        await api.updateDoctor(editingDoctor.id, payload);
        showToast('Doctor profile updated successfully!', 'success');
      } else {
        await api.createDoctor(payload);
        showToast('Doctor registered successfully!', 'success');
      }

      setIsModalOpen(false);
      loadDoctors();
    } catch (err) {
      showToast(err.message || 'Failed to save doctor', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this doctor from the roster?')) return;
    try {
      await api.deleteDoctor(id);
      showToast('Doctor profile deleted', 'info');
      loadDoctors();
    } catch (err) {
      showToast(err.message || 'Failed to delete doctor', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Medical Staff & Specialists</h1>
          <p className="page-subtitle">View and manage hospital physicians, surgeons, consulting fees, and availability schedules.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          ➕ Add New Doctor
        </button>
      </div>

      <div className="controls-bar">
        <div className="search-input-group">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by doctor name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>Loading doctors...</div>
      ) : doctors.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">🩺</div>
          <h3>No doctors found</h3>
          <p>Click "Add New Doctor" to register specialists in the hospital.</p>
        </div>
      ) : (
        <div className="doctor-grid">
          {doctors.map((doc) => (
            <div className="doctor-card" key={doc.id}>
              <div className="doctor-header">
                <div className="doctor-avatar">
                  {doc.name.replace('Dr. ', '').charAt(0)}
                </div>
                <div>
                  <div className="doctor-name">{doc.name}</div>
                  <div className="doctor-spec">{doc.specialization}</div>
                </div>
              </div>

              <div className="doctor-body">
                <div className="doctor-detail-row">
                  <span>Department:</span>
                  <strong>{doc.department}</strong>
                </div>
                <div className="doctor-detail-row">
                  <span>Experience:</span>
                  <strong>{doc.experienceYears} Years</strong>
                </div>
                <div className="doctor-detail-row">
                  <span>Consultation Fee:</span>
                  <strong style={{ color: 'var(--primary)' }}>₹{doc.consultationFee}</strong>
                </div>
                <div className="doctor-detail-row">
                  <span>Available:</span>
                  <span>{doc.availableDays}</span>
                </div>
                <div className="doctor-detail-row">
                  <span>Phone:</span>
                  <span>{doc.contact}</span>
                </div>
                <div className="doctor-detail-row">
                  <span>Email:</span>
                  <span style={{ fontSize: '12px' }}>{doc.email}</span>
                </div>
              </div>

              <div className="doctor-footer">
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => handleOpenEdit(doc)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(doc.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Doctor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDoctor ? `Edit Profile: ${editingDoctor.name}` : 'Register New Doctor'}
        maxWidth="560px"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group col-span-2">
              <label className="form-label">Doctor Name (with prefix) *</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="e.g. Dr. Ramesh Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Specialization *</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="e.g. Cardiologist"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department *</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="e.g. Cardiology"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Contact *</label>
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
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-control"
                required
                placeholder="e.g. doctor@hospital.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Experience (Years) *</label>
              <input
                type="number"
                min="0"
                className="form-control"
                required
                placeholder="e.g. 10"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Consultation Fee (₹) *</label>
              <input
                type="number"
                min="0"
                step="50"
                className="form-control"
                required
                placeholder="e.g. 800"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Available Days</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Mon,Tue,Wed,Thu,Fri"
                value={formData.availableDays}
                onChange={(e) => setFormData({ ...formData, availableDays: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '0 -24px -24px -24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingDoctor ? 'Update Doctor' : 'Save Doctor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
