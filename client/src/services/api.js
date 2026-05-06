import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('laf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('laf_token');
      localStorage.removeItem('laf_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  signup:         (data) => api.post('/auth/signup', data),
  login:          (data) => api.post('/auth/login', data),
  getMe:          ()     => api.get('/auth/me'),
  getPendingUsers:()     => api.get('/auth/pending-users'),
  approveUser:    (id, action) => api.patch(`/auth/approve-user/${id}`, { action }),
  getAllUsers:     ()     => api.get('/auth/all-users'),
  getUserById:    (id)   => api.get(`/auth/user/${id}`),
};

export const itemsAPI = {
  create:      (formData) => api.post('/items', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll:      (params)   => api.get('/items', { params }),
  getOne:      (id)       => api.get(`/items/${id}`),
  update:      (id, formData) => api.patch(`/items/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateStatus:(id, status)   => api.patch(`/items/${id}/status`, { status }),
  getStats:    ()             => api.get('/items/stats'),
  aiSuggest:   (imageBase64)  => api.post('/items/ai-suggest', { imageBase64 }),
};

export default api;
