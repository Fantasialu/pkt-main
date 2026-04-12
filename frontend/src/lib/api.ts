import { API_BASE_URL } from '../config/constants';
import type { Activity, Registration, Notification, PlatformStats, ApiResponse } from '../types';

const BASE = API_BASE_URL;

async function request<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  return res.json() as Promise<ApiResponse<T>>;
}

export const apiService = {
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

  updateActivityStatus: (id: string, status: string) =>
    request<Activity>(`/api/activities/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Registrations
  getRegistrationsByActivity: (activityId: string) =>
    request<Registration[]>(`/api/registrations/activity/${activityId}`),

  getRegistrationsByStudent: (email: string) =>
    request<Registration[]>(`/api/registrations/student/${encodeURIComponent(email)}`),

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

  // Notifications
  getNotifications: (email: string) =>
    request<Notification[]>(`/api/notifications/${encodeURIComponent(email)}`),

  markNotificationRead: (id: string) =>
    request<Notification>(`/api/notifications/${id}/read`, { method: 'PATCH' }),

  markAllNotificationsRead: (email: string) =>
    request<null>(`/api/notifications/read-all/${encodeURIComponent(email)}`, { method: 'PATCH' }),

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
