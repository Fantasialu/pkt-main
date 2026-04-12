import { db } from '../db';
import { notifications, Notification, InsertNotification } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import { insertNotificationSchema } from '../db/schema';

export class NotificationsRepository {
  async findByEmail(studentEmail: string): Promise<Notification[]> {
    return db.select().from(notifications)
      .where(eq(notifications.studentEmail, studentEmail))
      .orderBy(desc(notifications.createdAt));
  }

  async create(data: z.infer<typeof insertNotificationSchema>): Promise<Notification> {
    const result = await db.insert(notifications).values(data as InsertNotification).returning();
    return result[0];
  }

  async markAsRead(id: string): Promise<Notification | undefined> {
    const result = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return result[0];
  }

  async markAllAsRead(studentEmail: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.studentEmail, studentEmail));
  }

  async getUnreadCount(studentEmail: string): Promise<number> {
    const result = await db.select().from(notifications)
      .where(and(eq(notifications.studentEmail, studentEmail), eq(notifications.isRead, false)));
    return result.length;
  }
}

export const notificationsRepository = new NotificationsRepository();
