// ===================================================================
// API Service for Hospital Management System
// Base URL: Spring Boot Server (http://localhost:8080/api)
// ===================================================================

const BASE_URL = 'http://localhost:8080/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.message) errorMessage = errorData.message;
        else if (errorData.fieldErrors) {
          errorMessage = Object.values(errorData.fieldErrors).join(', ');
        }
      } catch (e) {
        // use default error message
      }
      throw new Error(errorMessage);
    }

    // Check if response has body (e.g., 204 No Content vs 200 OK)
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (err) {
    console.error(`API Call Failed: [${options.method || 'GET'}] ${endpoint}`, err);
    throw err;
  }
}

export const api = {
  // --- Health / Status ---
  checkHealth: async () => {
    try {
      const res = await fetch(`${BASE_URL}/dashboard/stats`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // --- Dashboard ---
  getDashboardStats: () => request('/dashboard/stats'),

  // --- Patients ---
  getPatients: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    const queryString = query.toString();
    return request(`/patients${queryString ? `?${queryString}` : ''}`);
  },
  getPatientById: (id) => request(`/patients/${id}`),
  createPatient: (patient) => request('/patients', { method: 'POST', body: JSON.stringify(patient) }),
  updatePatient: (id, patient) => request(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(patient) }),
  updatePatientStatus: (id, status) => request(`/patients/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deletePatient: (id) => request(`/patients/${id}`, { method: 'DELETE' }),

  // --- Doctors ---
  getDoctors: (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return request(`/doctors${query}`);
  },
  getDoctorById: (id) => request(`/doctors/${id}`),
  createDoctor: (doctor) => request('/doctors', { method: 'POST', body: JSON.stringify(doctor) }),
  updateDoctor: (id, doctor) => request(`/doctors/${id}`, { method: 'PUT', body: JSON.stringify(doctor) }),
  deleteDoctor: (id) => request(`/doctors/${id}`, { method: 'DELETE' }),

  // --- Appointments ---
  getAppointments: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.date) query.append('date', params.date);
    if (params.patientId) query.append('patientId', params.patientId);
    if (params.doctorId) query.append('doctorId', params.doctorId);
    const queryString = query.toString();
    return request(`/appointments${queryString ? `?${queryString}` : ''}`);
  },
  bookAppointment: (data) => request('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  updateAppointmentStatus: (id, status) => request(`/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteAppointment: (id) => request(`/appointments/${id}`, { method: 'DELETE' }),

  // --- Billing ---
  getBills: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.patientId) query.append('patientId', params.patientId);
    const queryString = query.toString();
    return request(`/bills${queryString ? `?${queryString}` : ''}`);
  },
  generateBill: (data) => request('/bills', { method: 'POST', body: JSON.stringify(data) }),
  updatePaymentStatus: (id, paymentStatus, paymentMode) =>
    request(`/bills/${id}/payment`, { method: 'PATCH', body: JSON.stringify({ paymentStatus, paymentMode }) }),
  deleteBill: (id) => request(`/bills/${id}`, { method: 'DELETE' }),
};
