import axios from 'axios';
import { UserRole } from '../types';

export const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if present in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('regulaflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses to handle 401s
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('regulaflow_token');
        localStorage.removeItem('regulaflow_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  demoLogin: async (role: UserRole) => {
    const res = await api.post('/auth/demo-login', { role });
    return res.data;
  },
  me: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
};

export const applicationService = {
  list: async (params?: any) => {
    const res = await api.get('/applications', { params });
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/applications/${id}`);
    return res.data.data;
  },
  create: async (data: any) => {
    const res = await api.post('/applications', data);
    return res.data.data;
  },
  updateDraft: async (id: string, data: any) => {
    const res = await api.put(`/applications/${id}`, data);
    return res.data.data;
  },
  submit: async (id: string) => {
    const res = await api.post(`/applications/${id}/submit`);
    return res.data.data;
  },
  transition: async (id: string, targetStage: string, reason?: string, comments?: string) => {
    const res = await api.post(`/applications/${id}/transition`, { targetStage, reason, comments });
    return res.data.data;
  },
  assignOfficer: async (id: string, officerId: string) => {
    const res = await api.post(`/applications/${id}/assign`, { officerId });
    return res.data.data;
  },
};

export const documentService = {
  upload: async (formData: FormData) => {
    const res = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },
  downloadUrl: (id: string) => `/api/v1/documents/${id}/download`,
  deleteDocument: async (id: string) => {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  },
  triggerOcr: async (documentId: string) => {
    const res = await api.post('/ocr/process', { documentId });
    return res.data.data;
  },
  updateFields: async (documentId: string, fields: any, reason?: string) => {
    const res = await api.put(`/ocr/${documentId}/fields`, { fields, reason });
    return res.data.data;
  },
};

export const validationService = {
  runValidation: async (applicationId: string) => {
    const res = await api.post('/validation/run', { applicationId });
    return res.data;
  },
  listFindings: async (params?: any) => {
    const res = await api.get('/validation/findings', { params });
    return res.data.data;
  },
  resolveFinding: async (id: string, status: string, resolutionNotes?: string) => {
    const res = await api.put(`/validation/findings/${id}/resolve`, { status, resolutionNotes });
    return res.data.data;
  },
};

export const complianceService = {
  list: async (params?: any) => {
    const res = await api.get('/compliance', { params });
    return res.data.data;
  },
  create: async (data: any) => {
    const res = await api.post('/compliance', data);
    return res.data.data;
  },
  resolve: async (id: string, data: any) => {
    const res = await api.put(`/compliance/${id}/resolve`, data);
    return res.data.data;
  },
  triggerCheck: async () => {
    const res = await api.post('/compliance/check');
    return res.data;
  },
};

export const evcService = {
  list: async (params?: any) => {
    const res = await api.get('/evc', { params });
    return res.data.data;
  },
  schedule: async (data: any) => {
    const res = await api.post('/evc', data);
    return res.data.data;
  },
  submitReport: async (id: string, data: any) => {
    const res = await api.post(`/evc/${id}/submit-report`, data);
    return res.data.data;
  },
};

export const notificationService = {
  list: async (params?: any) => {
    const res = await api.get('/notifications', { params });
    return res.data.data;
  },
  markAsRead: async (id: string) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data.data;
  },
  markAllAsRead: async () => {
    const res = await api.put('/notifications/mark-all-read');
    return res.data;
  },
  listEscalations: async () => {
    const res = await api.get('/notifications/escalations');
    return res.data.data;
  },
};

export const reportService = {
  getMetrics: async () => {
    const res = await api.get('/reports/metrics');
    return res.data.data;
  },
  getStageDistribution: async () => {
    const res = await api.get('/reports/stage-distribution');
    return res.data.data;
  },
  getRegionalPendency: async () => {
    const res = await api.get('/reports/regional-pendency');
    return res.data.data;
  },
  exportCsvUrl: () => '/api/v1/reports/export-csv',
};

export const auditService = {
  list: async (params?: any) => {
    const res = await api.get('/audit', { params });
    return res.data.data;
  },
};

export const assistantService = {
  query: async (question: string) => {
    const res = await api.post('/assistant/query', { question });
    return res.data.data;
  },
  getCorpus: async () => {
    const res = await api.get('/assistant/corpus');
    return res.data.data;
  },
  globalSearch: async (q: string) => {
    const res = await api.get('/assistant/global-search', { params: { q } });
    return res.data.data;
  },
};

export const adminService = {
  listUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data.data;
  },
  listInstitutions: async () => {
    const res = await api.get('/admin/institutions');
    return res.data.data;
  },
  getSystemHealth: async () => {
    const res = await api.get('/admin/system-health');
    return res.data.data;
  },
};

