export type ActivityType = 'lecture' | 'competition' | 'volunteer' | 'art' | 'sports';
export type ActivityStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type RegistrationStatus = 'registered' | 'cancelled';
export type NotificationType = 'reminder' | 'update' | 'cancellation';

export interface Activity {
  id: string;
  title: string;
  description: string;
  type: ActivityType;
  location: string;
  startTime: string;
  endTime?: string | null;
  registrationDeadline?: string | null;
  maxParticipants: number;
  currentParticipants: number;
  organizer: string;
  organizerContact?: string | null;
  imageUrl?: string | null;
  status: ActivityStatus;
  isFeatured: boolean;
  allowedColleges?: string | null;
  allowedMajors?: string | null;
  allowedGrades?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  id: string;
  activityId: string;
  studentName: string;
  studentId: string;
  studentEmail: string;
  studentPhone?: string | null;
  major?: string | null;
  grade?: string | null;
  status: RegistrationStatus;
  createdAt: string;
  activity?: Activity;
}

export interface Notification {
  id: string;
  activityId?: string | null;
  studentEmail: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface PlatformStats {
  totalActivities: number;
  totalRegistrations: number;
  activeOrganizers: number;
  coverageRate: number;
  pendingCount?: number;
  byType?: { type: string; count: number }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: unknown[];
}

export type ViewType = 'home' | 'activities' | 'my-registrations' | 'publish' | 'notifications' | 'admin' | 'activity-detail';
