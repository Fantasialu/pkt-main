import { pgTable, text, integer, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';
import { z } from 'zod';

// Activities table
export const activities = pgTable('Activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: text('type').notNull(), // lecture | competition | volunteer | art | sports
  location: text('location').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  registrationDeadline: timestamp('registration_deadline'),
  maxParticipants: integer('max_participants').notNull().default(100),
  currentParticipants: integer('current_participants').notNull().default(0),
  organizer: text('organizer').notNull(),
  organizerContact: text('organizer_contact'),
  imageUrl: text('image_url'),
  status: text('status').notNull().default('pending'), // pending | approved | rejected | cancelled
  isFeatured: boolean('is_featured').notNull().default(false),
  allowedColleges: text('allowed_colleges'), // JSON array of allowed colleges
  allowedMajors: text('allowed_majors'), // JSON array of allowed majors
  allowedGrades: text('allowed_grades'), // JSON array of allowed grades
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Registrations table
export const registrations = pgTable('Registrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  activityId: uuid('activity_id').notNull().references(() => activities.id),
  studentName: text('student_name').notNull(),
  studentId: text('student_id').notNull(),
  studentEmail: text('student_email').notNull(),
  studentPhone: text('student_phone'),
  major: text('major'),
  grade: text('grade'),
  status: text('status').notNull().default('registered'), // registered | cancelled
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable('Notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  activityId: uuid('activity_id').references(() => activities.id),
  studentEmail: text('student_email').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull().default('reminder'), // reminder | update | cancellation
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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
  activityId: z.string().uuid('请提供有效的活动ID'),
  studentName: z.string().min(2, '请填写真实姓名'),
  studentId: z.string().min(4, '请填写学号'),
  studentEmail: z.string().email('请填写有效邮箱'),
  studentPhone: z.string().optional(),
  grade: z.string().optional(),
  major: z.string().optional(),
});

export const insertNotificationSchema = z.object({
  activityId: z.string().uuid().optional(),
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
