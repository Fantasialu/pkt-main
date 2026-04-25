import { API_BASE_URL } from '../config/constants';
import type { Activity, Registration, Notification, PlatformStats, ApiResponse, User, LoginResponse, ActivityReview } from '../types';

const BASE = API_BASE_URL;

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${url}`, {
    headers: { ...headers, ...options?.headers },
    ...options,
  });
  return res.json() as Promise<ApiResponse<T>>;
}

export const apiService = {
  // Auth
  register: (data: {
    email: string;
    password: string;
    name: string;
    studentId?: string;
    phone?: string;
    major?: string;
    grade?: string;
    college?: string;
  }) => request<LoginResponse>('/api/users/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<LoginResponse>('/api/users/login', { method: 'POST', body: JSON.stringify(data) }),

  getCurrentUser: () => request<User>('/api/users/me'),

  updateUser: (data: Partial<User>) =>
    request<User>('/api/users/me', { method: 'PUT', body: JSON.stringify(data) }),

  deleteUser: () => request<null>('/api/users/me', { method: 'DELETE' }),

  getAllUsers: () => request<User[]>('/api/users/all'),

  updateUserRole: (id: string, data: { role: string; isActive: boolean }) =>
    request<User>(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteUserById: (id: string) => request<null>(`/api/users/${id}`, { method: 'DELETE' }),

  resetUserPassword: (id: string, newPassword: string) =>
    request<User>(`/api/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ newPassword }) }),

  // Activities
  getActivities: (params?: { type?: string; search?: string; sort?: string }) => {
    const query = new URLSearchParams();
    if (params?.type && params.type !== 'all') query.set('type', params.type);
    if (params?.search) query.set('search', params.search);
    if (params?.sort) query.set('sort', params.sort);
    const qs = query.toString();
    return request<Activity[]>(`/api/activities${qs ? '?' + qs : ''}`);
  },

  getActivity: (id: string) => request<Activity>(`/api/activities/${id}`),

  getFeaturedActivities: () => request<Activity[]>('/api/activities/featured'),

  getStats: () => request<PlatformStats>('/api/activities/stats'),

  createActivity: (data: Partial<Activity>) =>
    request<Activity>('/api/activities', { method: 'POST', body: JSON.stringify(data) }),

  updateActivity: (id: string, data: Partial<Activity>) =>
    request<Activity>(`/api/activities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteActivity: (id: string) => request<Activity>(`/api/activities/${id}`, { method: 'DELETE' }),

  updateActivityStatus: (id: string, status: string) =>
    request<Activity>(`/api/activities/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Registrations
  getRegistrationsByActivity: (activityId: string) =>
    request<Registration[]>(`/api/registrations/activity/${activityId}`),

  getRegistrationsByStudent: (email: string) =>
    request<Registration[]>(`/api/registrations/student/${encodeURIComponent(email)}`),

  getRegistrationsByUser: () => request<Registration[]>('/api/registrations/me'),

  createRegistration: (data: {
    activityId: string;
    studentName: string;
    studentId: string;
    studentEmail: string;
    studentPhone?: string;
    major?: string;
    grade?: string;
  }) => request<Registration>('/api/registrations', { method: 'POST', body: JSON.stringify(data) }),

  cancelRegistration: (id: string) =>
    request<Registration>(`/api/registrations/${id}`, { method: 'DELETE' }),

  approveRegistration: (id: string) =>
    request<Registration>(`/api/registrations/${id}/approve`, { method: 'PATCH' }),

  checkIn: (activityId: string) =>
    request<Registration>(`/api/registrations/checkin/${activityId}`, { method: 'POST' }),

  // Notifications
  getNotifications: (email: string) =>
    request<Notification[]>(`/api/notifications/${encodeURIComponent(email)}`),

  getUserNotifications: () => request<Notification[]>('/api/notifications/me'),

  markNotificationRead: (id: string) =>
    request<Notification>(`/api/notifications/${id}/read`, { method: 'PATCH' }),

  markAllNotificationsRead: (email: string) =>
    request<null>(`/api/notifications/read-all/${encodeURIComponent(email)}`, { method: 'PATCH' }),

  // Reviews
  getReviews: (activityId: string) =>
    request<ActivityReview[]>(`/api/reviews/activity/${activityId}`),

  createReview: (data: { activityId: string; rating: number; comment?: string }) =>
    request<ActivityReview>('/api/reviews', { method: 'POST', body: JSON.stringify(data) }),

  // Admin
  getAdminStats: () => request<PlatformStats>('/api/admin/stats'),

  getAdminActivities: (status?: string) => {
    const qs = status ? `?status=${status}` : '';
    return request<Activity[]>(`/api/admin/activities${qs}`);
  },

  approveActivity: (id: string) =>
    request<Activity>(`/api/admin/activities/${id}/approve`, { method: 'PATCH' }),

  rejectActivity: (id: string) =>
    request<Activity>(`/api/admin/activities/${id}/reject`, { method: 'PATCH' }),
};
