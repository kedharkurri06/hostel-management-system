const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Helper to execute fetch requests with JSON parsing and Authorization header
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
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
    login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
    register: (name, email, password) => request('/auth/register', { method: 'POST', body: { name, email, password } }),
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

  // Wardens Directory
  wardens: {
    get: () => request('/wardens'),
    create: (data) => request('/wardens', { method: 'POST', body: data }),
    update: (id, updates) => request(`/wardens/${id}`, { method: 'PATCH', body: updates }),
    delete: (id) => request(`/wardens/${id}`, { method: 'DELETE' })
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
