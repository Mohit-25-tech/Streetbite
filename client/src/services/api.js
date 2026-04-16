import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('accessToken');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401 refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = sessionStorage.getItem('refreshToken');
                if (refreshToken) {
                    const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
                    sessionStorage.setItem('accessToken', data.accessToken);
                    sessionStorage.setItem('refreshToken', data.refreshToken);
                    originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                    return api(originalRequest);
                }
            } catch {
                sessionStorage.removeItem('accessToken');
                sessionStorage.removeItem('refreshToken');
                sessionStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// ─── Auth ────────────────────────────────────────────
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    requestPasswordReset: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    logout: () => api.post('/auth/logout'),
};

// ─── Vendors ─────────────────────────────────────────
export const vendorAPI = {
    getAll: (params) => api.get('/vendors', { params }),
    getFeatured: () => api.get('/vendors/featured'),
    getNearby: (params) => api.get('/vendors/nearby', { params }),
    getById: (id, params) => api.get(`/vendors/${id}`, { params }),
    getMyVendor: () => api.get('/vendors/my'),
    create: (data) => api.post('/vendors', data),
    update: (id, data) => api.put(`/vendors/${id}`, data),
    delete: (id) => api.delete(`/vendors/${id}`),
    getAnalytics: (id) => api.get(`/vendors/${id}/analytics`),
};

// ─── Menu ─────────────────────────────────────────────
export const menuAPI = {
    getByVendor: (vendorId) => api.get(`/menu/${vendorId}`),
    create: (data) => api.post('/menu', data),
    update: (id, data) => api.put(`/menu/${id}`, data),
    delete: (id) => api.delete(`/menu/${id}`),
};

// ─── Reviews ──────────────────────────────────────────
export const reviewAPI = {
    getByVendor: (vendorId, params) => api.get(`/reviews/${vendorId}`, { params }),
    create: (data) => api.post('/reviews', data),
    delete: (id) => api.delete(`/reviews/${id}`),
    markHelpful: (id) => api.put(`/reviews/${id}/helpful`),
    getUserReviews: () => api.get('/reviews/user/my'),
};

// ─── Favorites ────────────────────────────────────────
export const favoritesAPI = {
    getAll: () => api.get('/favorites'),
    check: (vendorId) => api.get(`/favorites/check/${vendorId}`),
    add: (vendorId) => api.post(`/favorites/${vendorId}`),
    remove: (vendorId) => api.delete(`/favorites/${vendorId}`),
};

// ─── Admin ────────────────────────────────────────────
export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
    getAllVendors: (params) => api.get('/admin/vendors', { params }),
    verifyVendor: (id, data) => api.put(`/admin/vendors/${id}/verify`, data),
    getAllUsers: () => api.get('/admin/users'),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    getCategories: () => api.get('/admin/categories'),
    createCategory: (data) => api.post('/admin/categories', data),
};

// ─── Orders ───────────────────────────────────────────
export const orderAPI = {
    createOrder: (data) => api.post('/orders', data),
    getMyOrders: () => api.get('/orders/my'),
};

export default api;
