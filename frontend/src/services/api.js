/**
 * INVESTMATE Frontend Centralized API Service
 * Connects original React frontend with the Express/MongoDB backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'investmate_token';
const USER_KEY = 'investmate_user';

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredAuth = (user, token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Universal Request Wrapper
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // Handle expired or invalid token
      if (res.status === 401 && token) {
        clearStoredAuth();
      }
      const error = new Error(data.message || `Request failed with status ${res.status}`);
      error.status = res.status;
      error.errors = data.errors;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`[API Error] ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Authentication
  auth: {
    login: (email, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),
    register: (payload) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    getProfile: () => request('/auth/profile'),
    updateProfile: (payload) =>
      request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(payload)
      }),
    logout: () => {
      clearStoredAuth();
      return request('/auth/logout', { method: 'POST' }).catch(() => {});
    }
  },

  // Schemes
  schemes: {
    getAll: (params = {}) => {
      const sp = new URLSearchParams();
      if (params.category && params.category !== 'All') sp.set('category', params.category);
      if (params.search) sp.set('search', params.search);
      if (params.page) sp.set('page', params.page);
      if (params.limit) sp.set('limit', params.limit);
      if (params.lite) sp.set('lite', 'true');
      const q = sp.toString();
      return request(`/schemes${q ? `?${q}` : ''}`);
    },
    getById: (id) => request(`/schemes/${id}`),
    search: (params = {}) => {
      const sp = new URLSearchParams();
      Object.keys(params).forEach((k) => {
        if (params[k]) sp.set(k, params[k]);
      });
      return request(`/schemes/search?${sp.toString()}`);
    },
    create: (payload) =>
      request('/schemes', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    update: (id, payload) =>
      request(`/schemes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      }),
    delete: (id) =>
      request(`/schemes/${id}`, {
        method: 'DELETE'
      }),
    updateFinePrint: (id, payload) =>
      request(`/schemes/${id}/fine-print`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
  },

  // Document Checklist
  documents: {
    getChecklist: (schemeId) => request(`/documents/${schemeId}`),
    updateChecklist: (schemeId, payload) =>
      request(`/documents/${schemeId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
  },

  // Categories
  categories: {
    getAll: () => request('/categories')
  },

  // Admin
  admin: {
    getStats: () => request('/admin/stats')
  }
};

export default api;
