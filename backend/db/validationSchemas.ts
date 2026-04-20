import { z } from 'zod';

// Activity schemas
export const insertActivitySchema = z.object({
  title: z.string().min(2, '活动名称至少2个字符'),
  description: z.string().min(10, '活动简介至少10个字符'),
  type: z.enum(['lecture', 'competition', 'volunteer', 'art', 'sports']),
  location: z.string().min(2, '请填写活动地点'),
  startTime: z.coerce.date(),
  endTime: z.coerce.date().optional(),
  registrationDeadline: z.coerce.date().optional(),
  maxParticipants: z.coerce.number().int().positive().default(100),
  organizer: z.string().min(2, '请填写组织者名称'),
  organizerContact: z.string().optional(),
  imageUrl: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).default('pending'),
  isFeatured: z.boolean().optional().default(false),
  allowedColleges: z.array(z.string()).optional().default([]),
  allowedMajors: z.array(z.string()).optional().default([]),
  allowedGrades: z.array(z.string()).optional().default([]),
});

export const updateActivitySchema = insertActivitySchema.partial();

// Registration schemas
export const insertRegistrationSchema = z.object({
  activityId: z.string(),
  studentName: z.string().min(2, '请填写真实姓名'),
  studentId: z.string().min(4, '请填写学号'),
  studentEmail: z.string().email('请填写有效邮箱'),
  studentPhone: z.string().optional(),
  grade: z.string().optional(),
  major: z.string().optional(),
});

// Notification schemas
export const insertNotificationSchema = z.object({
  activityId: z.string().optional(),
  studentEmail: z.string().email(),
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(['reminder', 'update', 'cancellation']).default('reminder'),
});

// User schemas
export const registerSchema = z.object({
  email: z.string().email('无效的邮箱格式'),
  password: z.string().min(6, '密码至少6个字符'),
  name: z.string().min(2, '姓名至少2个字符'),
  studentId: z.string().optional(),
  phone: z.string().optional(),
  major: z.string().optional(),
  grade: z.string().optional(),
  college: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('无效的邮箱格式'),
  password: z.string().min(6, '密码至少6个字符'),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符').optional(),
  phone: z.string().optional(),
  major: z.string().optional(),
  grade: z.string().optional(),
  college: z.string().optional(),
  avatar: z.string().optional(),
});
