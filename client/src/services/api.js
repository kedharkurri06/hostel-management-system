// Resolves API Base URL from Vercel / Cloud environment variables or defaults to local proxy '/api'
const rawBase = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api').trim();
const cleanedBase = rawBase.replace(/\/+$/, '');
const API_BASE_URL = cleanedBase.startsWith('http')
  ? (cleanedBase.endsWith('/api') ? cleanedBase : `${cleanedBase}/api`)
  : (cleanedBase || '/api');

/**
 * Helper to execute fetch requests with JSON parsing and Authorization header
 */
async function request(endpoint, options = {}) {
  // Ensure endpoint starts with a slash
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;
  const token = localStorage.getItem('hostel_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Authentication
  auth: {
    login: (identifier, password) => request('/auth/login', { method: 'POST', body: { identifier, password } }),
    register: (name, email, password, studentId) => request('/auth/register', { method: 'POST', body: { name, email, password, studentId } }),
    getMe: () => request('/auth/me')
  },

  // Complaints
  complaints: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      if (params.status && params.status !== 'All') query.append('status', params.status);
      if (params.priority && params.priority !== 'All') query.append('priority', params.priority);
      if (params.category && params.category !== 'All') query.append('category', params.category);
      if (params.search) query.append('search', params.search);
      if (params.page) query.append('page', params.page);
      if (params.limit) query.append('limit', params.limit);

      const qs = query.toString();
      return request(`/complaints${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => request(`/complaints/${id}`),
    create: (complaintData) => request('/complaints', { method: 'POST', body: complaintData }),
    update: (id, updates) => request(`/complaints/${id}`, { method: 'PATCH', body: updates }),
    delete: (id) => request(`/complaints/${id}`, { method: 'DELETE' })
  },

  // Food Menu
  menu: {
    get: () => request('/menu'),
    update: (id, mealData) => request(`/menu/${id}`, { method: 'PATCH', body: mealData })
  },

  // Wardens Directory & Staff
  wardens: {
    get: () => request('/wardens'),
    create: (data) => request('/wardens', { method: 'POST', body: data }),
    update: (id, updates) => request(`/wardens/${id}`, { method: 'PATCH', body: updates }),
    delete: (id) => request(`/wardens/${id}`, { method: 'DELETE' }),
    createStaff: (data) => request('/wardens/staff', { method: 'POST', body: data }),
    updateStaff: (id, updates) => request(`/wardens/staff/${id}`, { method: 'PATCH', body: updates }),
    deleteStaff: (id) => request(`/wardens/staff/${id}`, { method: 'DELETE' })
  },

  // Notice Board
  notices: {
    getAll: () => request('/notices'),
    create: (noticeData) => request('/notices', { method: 'POST', body: noticeData }),
    update: (id, updates) => request(`/notices/${id}`, { method: 'PATCH', body: updates }),
    delete: (id) => request(`/notices/${id}`, { method: 'DELETE' })
  },

  // Gate Passes
  gatePasses: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      if (params.status && params.status !== 'All') query.append('status', params.status);
      if (params.type && params.type !== 'All') query.append('type', params.type);
      if (params.search) query.append('search', params.search);
      if (params.page) query.append('page', params.page);
      if (params.limit) query.append('limit', params.limit);
      const qs = query.toString();
      return request(`/gatepasses${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => request(`/gatepasses/${id}`),
    create: (data) => request('/gatepasses', { method: 'POST', body: data }),
    review: (id, updates) => request(`/gatepasses/${id}`, { method: 'PATCH', body: updates }),
    delete: (id) => request(`/gatepasses/${id}`, { method: 'DELETE' })
  },

  // Dashboard Stats
  dashboard: {
    getStats: () => request('/dashboard/stats')
  },

  // Health Check
  health: {
    check: () => request('/health')
  }
};

export default api;
