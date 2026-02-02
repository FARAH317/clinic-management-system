// src/config/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const API_ENDPOINTS = {
  auth: `${API_BASE_URL}`,
  patients: `${API_BASE_URL}`,
  doctors: `${API_BASE_URL}`,
  appointments: `${API_BASE_URL}`,
  medicines: `${API_BASE_URL}`,
  prescriptions: `${API_BASE_URL}`,
  billing: `${API_BASE_URL}`
};

export default API_BASE_URL;