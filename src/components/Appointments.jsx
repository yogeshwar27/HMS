import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from './Modal';

export default function Appointments({ showToast }) {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '10:00 AM',
    reason: '',
    notes: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [appData, patData, docData] = await Promise.all([
        api.getAppointments({ status: statusFilter }),
        api.getPatients(),
        api.getDoctors(),
      ]);
      setAppointments(appData || []);
      setPatients(patData || []);
      setDoctors(docData || []);
    } catch (err) {
      showToast(err.message || 'Failed to load appointment data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleOpenBookModal = () => {
    setFormData({
      patientId: patients.length > 0 ? patients[0].id : '',
      doctorId: doctors.length > 0 ? doctors[0].id : '',
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '10:00 AM',
      reason: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientId || !formData.doctorId) {
      showToast('Please select a valid patient and doctor', 'error');
      return;
    }

    try {
      await api.bookAppointment({
        patientId: Number(formData.patientId),
        doctorId: Number(formData.doctorId),
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        status: 'SCHEDULED',
        reason: formData.reason,
        notes: formData.notes,
      });

      showToast('Appointment successfully scheduled!', 'success');
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to book appointment', 'error');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.updateAppointmentStatus(id, status);
      showToast(`Appointment marked as ${status}`, 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment entry?')) return;
    try {
      await api.deleteAppointment(id);
      showToast('Appointment deleted', 'info');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to delete appointment', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointment Scheduling</h1>
          <p className="page-subtitle">Schedule and track doctor-patient consultations, clinic slots, and status.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenBookModal}>
          📅 Book New Appointment
        </button>
      </div>

      <div className="controls-bar">
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Appointments</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Appt ID</th>
                <th>Patient Details</th>
                <th>Consulting Doctor</th>
                <th>Scheduled Date & Time</th>
                <th>Reason / Chief Complaint</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Loading appointments...</td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No appointments found. Click "Book New Appointment" to schedule one.
                  </td>
                </tr>
              ) : (
                appointments.map((a) => (
                  <tr key={a.id}>
                    <td>#{a.id}</td>
                    <td>
                      <strong>{a.patient?.name}</strong>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {a.patient?.contact} ({a.patient?.bloodGroup})
                      </div>
                    </td>
                    <td>
                      <strong>{a.doctor?.name}</strong>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {a.doctor?.specialization} ({a.doctor?.department})
                      </div>
                    </td>
                    <td>
                      <div><strong>{a.appointmentDate}</strong></div>
                      <div style={{ fontSize: '13px', color: 'var(--primary)' }}>{a.appointmentTime}</div>
                    </td>
                    <td>
                      <div>{a.reason || 'General Consultation'}</div>
                      {a.notes && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Notes: {a.notes}</div>}
                    </td>
                    <td>
                      <span className={`badge badge-${a.status?.toLowerCase() || 'scheduled'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {a.status === 'SCHEDULED' && (
                          <>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleStatusUpdate(a.id, 'COMPLETED')}
                              title="Mark as Completed"
                            >
                              ✓ Done
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleStatusUpdate(a.id, 'CANCELLED')}
                              title="Cancel Appointment"
                            >
                              ✕ Cancel
                            </button>
                          </>
                        )}
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(a.id)}
                          title="Delete Appointment"
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

      {/* Booking Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule New Appointment"
        maxWidth="560px"
      >
        <form onSubmit={handleBookSubmit}>
          <div className="form-grid">
            <div className="form-group col-span-2">
              <label className="form-label">Select Patient *</label>
              <select
                className="form-control"
                required
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.id} - {p.name} ({p.gender}, {p.age}y, {p.bloodGroup})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Select Consulting Doctor *</label>
              <select
                className="form-control"
                required
                value={formData.doctorId}
                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              >
                <option value="">-- Choose Doctor --</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.specialization} (Fee: ₹{d.consultationFee})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                className="form-control"
                required
                value={formData.appointmentDate}
                onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Time Slot *</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="e.g. 10:30 AM"
                value={formData.appointmentTime}
                onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Reason for Visit / Symptoms</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Chronic knee pain, follow-up, ECG review"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Special Notes / Preparation</label>
              <textarea
                className="form-control"
                placeholder="e.g. Fasting required for blood test, carry previous MRI scans"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '0 -24px -24px -24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Booking
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
