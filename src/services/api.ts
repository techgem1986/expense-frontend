import axios from 'axios';

// API base URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// Authentication endpoints
export const authAPI = {
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
};

// User endpoints
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  getById: (userId: string) => api.get(`/users/${userId}`),
};

// Category endpoints
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getByType: (type: 'INCOME' | 'EXPENSE') => api.get(`/categories/type/${type}`),
  getById: (categoryId: string) => api.get(`/categories/${categoryId}`),
  create: (data: { name: string; description?: string; type: 'INCOME' | 'EXPENSE' }) =>
    api.post('/categories', data),
  update: (
    categoryId: string,
    data: { name: string; description?: string; type: 'INCOME' | 'EXPENSE' },
  ) => api.put(`/categories/${categoryId}`, data),
  delete: (categoryId: string) => api.delete(`/categories/${categoryId}`),
};

// Transaction endpoints
export const transactionAPI = {
  create: (data: any) => api.post('/transactions', data),
  getAll: (page = 0, size = 20, sort = 'createdAt,desc', startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('size', String(size));
    params.append('sort', sort);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/transactions?${params.toString()}`);
  },
  getById: (transactionId: number) => api.get(`/transactions/${transactionId}`),
  update: (transactionId: number, data: any) => api.put(`/transactions/${transactionId}`, data),
  delete: (transactionId: number) => api.delete(`/transactions/${transactionId}`),
};

// Recurring Transaction endpoints
export const recurringTransactionAPI = {
  create: (data: any) => api.post('/recurring-transactions', data),
  getAll: () => api.get('/recurring-transactions'),
  getById: (recurringId: number) => api.get(`/recurring-transactions/${recurringId}`),
  update: (recurringId: number, data: any) => api.put(`/recurring-transactions/${recurringId}`, data),
  delete: (recurringId: number) => api.delete(`/recurring-transactions/${recurringId}`),
};

// Budget endpoints
export const budgetAPI = {
  create: (data: any) => api.post('/budgets', data),
  getAll: (page = 0, size = 20, sort = 'createdAt,desc') =>
    api.get(`/budgets?page=${page}&size=${size}&sort=${sort}`),
  getById: (budgetId: number) => api.get(`/budgets/${budgetId}`),
  update: (budgetId: number, data: any) => api.put(`/budgets/${budgetId}`, data),
  delete: (budgetId: number) => api.delete(`/budgets/${budgetId}`),
  checkThreshold: (categoryId: number) => api.get(`/budgets/check-threshold/${categoryId}`),
};

// Alert endpoints
export const alertAPI = {
  getAll: (page = 0, size = 20, sort = 'createdAt,desc') =>
    api.get(`/alerts?page=${page}&size=${size}&sort=${sort}`),
  getById: (alertId: number) => api.get(`/alerts/${alertId}`),
  getUnread: () => api.get('/alerts/unread'),
  getUnreadCount: () => api.get('/alerts/unread/count'),
  markAsRead: (alertId: number) => api.put(`/alerts/${alertId}/read`),
  markAllAsRead: () => api.put('/alerts/read-all'),
  delete: (alertId: number) => api.delete(`/alerts/${alertId}`),
};

// Analytics endpoints
export const analyticsAPI = {
  getAnalytics: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/analytics?${params.toString()}`);
  },
  getSpendingByCategory: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/analytics/spending-by-category?${params.toString()}`);
  },
  getCurrentMonth: () => api.get('/analytics/current-month'),
  getYearToDate: () => api.get('/analytics/year-to-date'),
};

// Export endpoints
export const exportAPI = {
  exportMonthlyReport: (yearMonth: string) => 
    api.get(`/export/report/excel?yearMonth=${yearMonth}`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    }),
  exportComprehensiveReport: (yearMonth: string) => 
    api.get(`/export/comprehensive/report/excel?yearMonth=${yearMonth}`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    }),
  exportDashboardPDF: (yearMonth: string) => 
    api.get(`/export/comprehensive/report/pdf?yearMonth=${yearMonth}`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    }),
};

// Account endpoints
export const accountAPI = {
  getAll: (page = 0, size = 20, sort = 'createdAt,desc') =>
    api.get(`/accounts?page=${page}&size=${size}&sort=${sort}`),
  getById: (accountId: number) => api.get(`/accounts/${accountId}`),
  getActive: () => api.get('/accounts/active'),
  create: (data: {
    name: string;
    accountType: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    openingBalance: number;
    description?: string;
  }) => api.post('/accounts', data),
  update: (accountId: number, data: {
    name: string;
    accountType: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    openingBalance: number;
    description?: string;
  }) => api.put(`/accounts/${accountId}`, data),
  delete: (accountId: number) => api.delete(`/accounts/${accountId}`),
  getTotalBalance: () => api.get('/accounts/total-balance'),
};

export default api;
