import { db, eq } from '../db';

interface Notification {
  id: string;
  activityId?: string;
  userId?: string;
  studentEmail: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export class NotificationsRepository {
  async findByEmail(studentEmail: string): Promise<Notification[]> {
    const notifications = await db.select().from('Notifications').execute();
    return notifications
      .filter(n => n.studentEmail === studentEmail)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async create(data: {
    activityId?: string;
    studentEmail: string;
    title: string;
    message: string;
    type?: string;
  }): Promise<Notification> {
    const result = await db.insert('Notifications').values({
      ...data,
      type: data.type || 'reminder',
      isRead: false,
      createdAt: new Date().toISOString(),
    }).returning();
    return result[0];
  }

  async markAsRead(id: string): Promise<Notification | undefined> {
    const result = await db.update('Notifications')
      .set({ isRead: true })
      .where(eq({ id: '' }, id))
      .returning();
    return result[0];
  }

  async markAllAsRead(studentEmail: string): Promise<void> {
    const notifications = await db.select().from('Notifications').execute();
    notifications.forEach(n => {
      if (n.studentEmail === studentEmail) {
        n.isRead = true;
      }
    });
  }

  async getUnreadCount(studentEmail: string): Promise<number> {
    const notifications = await db.select().from('Notifications').execute();
    return notifications.filter(n => n.studentEmail === studentEmail && !n.isRead).length;
  }
}

export const notificationsRepository = new NotificationsRepository();
