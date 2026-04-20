export type ActivityType = 'lecture' | 'competition' | 'volunteer' | 'art' | 'sports';
export type ActivityStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
export type RegistrationStatus = 'registered' | 'cancelled' | 'approved' | 'checked-in';
export type NotificationType = 'reminder' | 'update' | 'cancellation' | 'approval' | 'registration';
export type UserRole = 'student' | 'organizer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  studentId?: string | null;
  phone?: string | null;
  major?: string | null;
  grade?: string | null;
  college?: string | null;
  avatar?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

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
  organizerId?: string;
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
  userId?: string;
  studentName: string;
  studentId: string;
  studentEmail: string;
  studentPhone?: string | null;
  major?: string | null;
  grade?: string | null;
  status: RegistrationStatus;
  createdAt: string;
  checkedInAt?: string | null;
  activity?: Activity;
}

export interface Notification {
  id: string;
  activityId?: string | null;
  userId?: string;
  studentEmail: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface ActivityReview {
  id: string;
  activityId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: User;
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

export type ViewType = 'home' | 'activities' | 'my-registrations' | 'publish' | 'notifications' | 'admin' | 'activity-detail' | 'profile' | 'login' | 'register';

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}
