import axios from 'axios';

// Automatically include CSRF via xsrf settings
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

// Request interceptor: fetch CSRF token before mutating requests
api.interceptors.request.use(
  async (config) => {
    const method = config.method?.toLowerCase();
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      try {
        await api.get('/csrf/');  // sets the csrftoken cookie
      } catch (e) {
        console.warn('Failed to fetch CSRF token:', e);
      }
      // Attach CSRF token header
      const csrfToken = getCookie('csrftoken');
      if (config.headers) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/login';
    }
    // Preserve original error with response for downstream handlers
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  logout: () => api.post('/auth/logout/'),
  getCurrentUser: () => api.get('/auth/user/'),
  verifyEmail: (uid, token) => api.get(`/auth/verify-email/${uid}/${token}/`),
  changePassword: (passwordData) => api.post('/auth/change-password/', passwordData),
  requestPasswordReset: (data) => api.post('/auth/password-reset/', data),
  confirmPasswordReset: (data) => api.post('/auth/password-reset-confirm/', data),
};

// Helper to read CSRF token from cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Signal Analysis API calls
export const signalAPI = {
  getHome: () => api.get('/home/'),
  uploadCSV: (formData) => {
    const csrfToken = getCookie('csrftoken');
    return api.post('/upload/', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'X-CSRFToken': csrfToken,
      }
    });
  },
  evaluateFunction: (xValue, analysisId = null) => {
    const data = { x_values: Array.isArray(xValue) ? xValue : [xValue] };
    if (analysisId) data.analysis_id = analysisId;
    return api.post('/evaluate/', data);
  },
  getAnalyses: () => api.get('/analyses/'),
  getAnalysis: (id) => api.get(`/analyses/${id}/`),
  updateAnalysis: (id, data) => {
    const csrfToken = getCookie('csrftoken');
    return api.patch(`/analyses/${id}/`, data, {
      headers: { 'X-CSRFToken': csrfToken }
    });
  },
  deleteAnalysis: (id) => {
    const csrfToken = getCookie('csrftoken');
    return api.delete(`/analyses/${id}/`, {
      headers: { 'X-CSRFToken': csrfToken }
    });
  },
  bulkDeleteAnalyses: (analysisIds) => {
    const csrfToken = getCookie('csrftoken');
    return api.post('/analyses/bulk-delete/', { analysis_ids: analysisIds }, {
      headers: { 'X-CSRFToken': csrfToken }
    });
  },
  saveSessionAnalysis: () => api.post('/save-analysis/'),
  clearSession: () => api.post('/clear-session/'),
  
  // Share functionality
  getShareOptions: (analysisId) => api.get(`/analyses/${analysisId}/share-options/`),
  updateShareOptions: (analysisId, shareData) => {
    const csrfToken = getCookie('csrftoken');
    return api.post(`/analyses/${analysisId}/share-options/`, shareData, {
      headers: { 'X-CSRFToken': csrfToken }
    });
  },
  getSharedAnalysis: (analysisId) => api.get(`/share/${analysisId}/`),
  accessPasswordProtectedAnalysis: (analysisId, password) => {
    const csrfToken = getCookie('csrftoken');
    return api.post(`/share/${analysisId}/`, { password }, {
      headers: { 'X-CSRFToken': csrfToken }
    });
  },
};

// Signal Generator API calls
export const generatorAPI = {
  generateSignal: (params) => api.post('/generator/', params),
};

// User Profile API calls
export const profileAPI = {
  getProfile: () => api.get('/profile/'),
  updateProfile: (profileData) => {
    return api.patch('/profile/', profileData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  },
};

export default api;
