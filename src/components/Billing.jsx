import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from './Modal';

export default function Billing({ showToast }) {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Generate Bill Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    consultationFee: 0,
    roomCharges: 0,
    medicineCharges: 0,
    nursingCharges: 0,
    totalAmount: 0,
    paymentStatus: 'PENDING',
    paymentMode: 'CASH',
  });

  // Invoice Print View Modal State
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [billsData, patData, docData] = await Promise.all([
        api.getBills({ status: statusFilter }),
        api.getPatients(),
        api.getDoctors(),
      ]);
      setBills(billsData || []);
      setPatients(patData || []);
      setDoctors(docData || []);
    } catch (err) {
      showToast(err.message || 'Failed to fetch billing data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleOpenGenerate = () => {
    const defaultDoc = doctors[0];
    const initialFee = defaultDoc ? defaultDoc.consultationFee : 500;
    setFormData({
      patientId: patients.length > 0 ? patients[0].id : '',
      doctorId: defaultDoc ? defaultDoc.id : '',
      consultationFee: initialFee,
      roomCharges: 0,
      medicineCharges: 0,
      nursingCharges: 0,
      totalAmount: initialFee,
      paymentStatus: 'PENDING',
      paymentMode: 'CASH',
    });
    setIsModalOpen(true);
  };

  const handleDoctorChange = (doctorId) => {
    const doc = doctors.find((d) => d.id === Number(doctorId));
    const fee = doc ? doc.consultationFee : 0;
    const total = fee + Number(formData.roomCharges) + Number(formData.medicineCharges) + Number(formData.nursingCharges);
    setFormData({
      ...formData,
      doctorId,
      consultationFee: fee,
      totalAmount: total,
    });
  };

  const handleFeeChange = (field, value) => {
    const numVal = parseFloat(value) || 0;
    const updated = { ...formData, [field]: numVal };
    const total =
      Number(updated.consultationFee || 0) +
      Number(updated.roomCharges || 0) +
      Number(updated.medicineCharges || 0) +
      Number(updated.nursingCharges || 0);

    setFormData({ ...updated, totalAmount: total });
  };

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientId || !formData.doctorId) {
      showToast('Please select a valid patient and doctor', 'error');
      return;
    }

    try {
      await api.generateBill({
        patientId: Number(formData.patientId),
        doctorId: Number(formData.doctorId),
        consultationFee: Number(formData.consultationFee),
        roomCharges: Number(formData.roomCharges),
        medicineCharges: Number(formData.medicineCharges),
        nursingCharges: Number(formData.nursingCharges),
        totalAmount: Number(formData.totalAmount),
        paymentStatus: formData.paymentStatus,
        paymentMode: formData.paymentMode,
      });

      showToast('Invoice generated successfully!', 'success');
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to generate invoice', 'error');
    }
  };

  const handleMarkAsPaid = async (bill) => {
    try {
      await api.updatePaymentStatus(bill.id, 'PAID', bill.paymentMode || 'CASH');
      showToast(`Bill #${bill.id} marked as PAID!`, 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Payment update failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invoice record?')) return;
    try {
      await api.deleteBill(id);
      showToast('Invoice record deleted', 'info');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to delete bill', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Hospital Billing & Invoices</h1>
          <p className="page-subtitle">Track consultation fees, room rent, medicine costs, and payment receipts.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenGenerate}>
          💳 Generate New Invoice
        </button>
      </div>

      <div className="controls-bar">
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Invoices</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Patient</th>
                <th>Consulting Doctor</th>
                <th>Date</th>
                <th>Breakdown (Fee + Room + Med)</th>
                <th>Total Amount</th>
                <th>Payment Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>Loading invoices...</td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No invoices recorded yet. Click "Generate New Invoice" to create one.
                  </td>
                </tr>
              ) : (
                bills.map((b) => (
                  <tr key={b.id}>
                    <td><strong>INV-{b.id}</strong></td>
                    <td>
                      <strong>{b.patient?.name}</strong>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.patient?.contact}</div>
                    </td>
                    <td>
                      <div>{b.doctor?.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.doctor?.department}</div>
                    </td>
                    <td>{b.billDate}</td>
                    <td style={{ fontSize: '13px' }}>
                      ₹{b.consultationFee} + ₹{b.roomCharges} + ₹{b.medicineCharges}
                    </td>
                    <td>
                      <strong style={{ fontSize: '15px', color: 'var(--primary-dark)' }}>
                        ₹{Number(b.totalAmount).toLocaleString()}
                      </strong>
                    </td>
                    <td>
                      <span className={`badge badge-${b.paymentStatus?.toLowerCase() || 'pending'}`}>
                        {b.paymentStatus}
                      </span>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        via {b.paymentMode}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {b.paymentStatus !== 'PAID' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleMarkAsPaid(b)}
                            title="Mark as Paid"
                          >
                            ✓ Mark Paid
                          </button>
                        )}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedInvoice(b)}
                          title="View & Print Invoice"
                        >
                          🖨️ Receipt
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(b.id)}
                          title="Delete Invoice"
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

      {/* Generate Invoice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate Patient Invoice"
        maxWidth="600px"
      >
        <form onSubmit={handleGenerateSubmit}>
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
                    #{p.id} - {p.name} ({p.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Consulting Doctor *</label>
              <select
                className="form-control"
                required
                value={formData.doctorId}
                onChange={(e) => handleDoctorChange(e.target.value)}
              >
                <option value="">-- Choose Doctor --</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — Fee: ₹{d.consultationFee} ({d.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Doctor Consultation Fee (₹)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={formData.consultationFee}
                onChange={(e) => handleFeeChange('consultationFee', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Room / Bed Charges (₹)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={formData.roomCharges}
                onChange={(e) => handleFeeChange('roomCharges', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pharmacy / Medicine (₹)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={formData.medicineCharges}
                onChange={(e) => handleFeeChange('medicineCharges', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nursing & Misc Care (₹)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={formData.nursingCharges}
                onChange={(e) => handleFeeChange('nursingCharges', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Mode</label>
              <select
                className="form-control"
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI / QR Code</option>
                <option value="CREDIT_CARD">Credit / Debit Card</option>
                <option value="INSURANCE">Health Insurance</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <select
                className="form-control"
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
              >
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
              </select>
            </div>

            <div className="form-group col-span-2" style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '15px' }}>Calculated Total Invoice Amount:</span>
                <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>
                  ₹{Number(formData.totalAmount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '0 -24px -24px -24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Generate Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Receipt Modal */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title="Official Hospital Payment Receipt"
        maxWidth="600px"
      >
        {selectedInvoice && (
          <div>
            <div className="invoice-box" id="printable-receipt">
              <div className="invoice-header">
                <div>
                  <h3 style={{ color: 'var(--primary)', fontSize: '20px', fontWeight: 800 }}>CarePulse Hospital</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Accredited Multi-Speciality Medical Center<br />
                    Phone: +91 1800-CARE-999 | carepulse@hospital.com
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>INVOICE #{selectedInvoice.id}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Date: {selectedInvoice.billDate}</div>
                  <div style={{ marginTop: '6px' }}>
                    <span className={`badge badge-${selectedInvoice.paymentStatus?.toLowerCase()}`}>
                      {selectedInvoice.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', fontSize: '13px' }}>
                <div>
                  <strong style={{ color: 'var(--text-secondary)' }}>PATIENT DETAILS:</strong>
                  <div><strong>{selectedInvoice.patient?.name}</strong></div>
                  <div>Age: {selectedInvoice.patient?.age} | Blood: {selectedInvoice.patient?.bloodGroup}</div>
                  <div>Contact: {selectedInvoice.patient?.contact}</div>
                </div>
                <div>
                  <strong style={{ color: 'var(--text-secondary)' }}>ATTENDING DOCTOR:</strong>
                  <div><strong>{selectedInvoice.doctor?.name}</strong></div>
                  <div>Dept: {selectedInvoice.doctor?.department}</div>
                  <div>Specialization: {selectedInvoice.doctor?.specialization}</div>
                </div>
              </div>

              <table className="table" style={{ marginTop: '10px' }}>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Doctor Consultation Fee</td>
                    <td style={{ textAlign: 'right' }}>₹{selectedInvoice.consultationFee}</td>
                  </tr>
                  <tr>
                    <td>Room / Bed Charges</td>
                    <td style={{ textAlign: 'right' }}>₹{selectedInvoice.roomCharges}</td>
                  </tr>
                  <tr>
                    <td>Medicines & Consumables</td>
                    <td style={{ textAlign: 'right' }}>₹{selectedInvoice.medicineCharges}</td>
                  </tr>
                  <tr>
                    <td>Nursing & Patient Care</td>
                    <td style={{ textAlign: 'right' }}>₹{selectedInvoice.nursingCharges}</td>
                  </tr>
                </tbody>
              </table>

              <div className="invoice-summary">
                <div>Payment Mode: <strong>{selectedInvoice.paymentMode}</strong></div>
                <div className="invoice-total-row">
                  Total Paid: ₹{Number(selectedInvoice.totalAmount).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ margin: '20px -24px -24px -24px' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedInvoice(null)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                🖨️ Print Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
