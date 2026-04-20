import { sqliteTable, text, integer, timestamp, boolean, varchar } from 'drizzle-orm/sqlite-core';
import { z } from 'zod';

// Users table
export const users = sqliteTable('Users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  studentId: text('student_id').unique(),
  phone: text('phone'),
  major: text('major'),
  grade: text('grade'),
  college: text('college'),
  role: text('role').notNull().default('student'), // student | organizer | admin
  avatar: text('avatar'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Activities table
export const activities = sqliteTable('Activities', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: text('type').notNull(), // lecture | competition | volunteer | art | sports
  location: text('location').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  registrationDeadline: timestamp('registration_deadline'),
  maxParticipants: integer('max_participants').notNull().default(100),
  currentParticipants: integer('current_participants').notNull().default(0),
  organizerId: text('organizer_id').references(() => users.id),
  organizer: text('organizer').notNull(),
  organizerContact: text('organizer_contact'),
  imageUrl: text('image_url'),
  status: text('status').notNull().default('pending'), // pending | approved | rejected | cancelled | completed
  isFeatured: boolean('is_featured').notNull().default(false),
  allowedColleges: text('allowed_colleges'), // JSON array of allowed colleges
  allowedMajors: text('allowed_majors'), // JSON array of allowed majors
  allowedGrades: text('allowed_grades'), // JSON array of allowed grades
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Registrations table
export const registrations = sqliteTable('Registrations', {
  id: text('id').primaryKey(),
  activityId: text('activity_id').notNull().references(() => activities.id),
  userId: text('user_id').references(() => users.id),
  studentName: text('student_name').notNull(),
  studentId: text('student_id').notNull(),
  studentEmail: text('student_email').notNull(),
  studentPhone: text('student_phone'),
  major: text('major'),
  grade: text('grade'),
  status: text('status').notNull().default('registered'), // registered | cancelled | approved | checked-in
  createdAt: timestamp('created_at').defaultNow().notNull(),
  checkedInAt: timestamp('checked_in_at'),
});

// Notifications table
export const notifications = sqliteTable('Notifications', {
  id: text('id').primaryKey(),
  activityId: text('activity_id').references(() => activities.id),
  userId: text('user_id').references(() => users.id),
  studentEmail: text('student_email').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull().default('reminder'), // reminder | update | cancellation | approval | registration
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ActivityReviews table
export const activityReviews = sqliteTable('ActivityReviews', {
  id: text('id').primaryKey(),
  activityId: text('activity_id').notNull().references(() => activities.id),
  userId: text('user_id').notNull().references(() => users.id),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// CheckIns table
export const checkIns = sqliteTable('CheckIns', {
  id: text('id').primaryKey(),
  activityId: text('activity_id').notNull().references(() => activities.id),
  userId: text('user_id').notNull().references(() => users.id),
  registrationId: text('registration_id').references(() => registrations.id),
  checkInTime: timestamp('check_in_time').defaultNow().notNull(),
  method: text('method').notNull().default('qr'), // qr | manual | face
});

// Zod schemas
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

export const insertRegistrationSchema = z.object({
  activityId: z.string(),
  studentName: z.string().min(2, '请填写真实姓名'),
  studentId: z.string().min(4, '请填写学号'),
  studentEmail: z.string().email('请填写有效邮箱'),
  studentPhone: z.string().optional(),
  grade: z.string().optional(),
  major: z.string().optional(),
});

export const insertNotificationSchema = z.object({
  activityId: z.string().optional(),
  studentEmail: z.string().email(),
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(['reminder', 'update', 'cancellation']).default('reminder'),
});

// Types
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;
export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = typeof registrations.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
