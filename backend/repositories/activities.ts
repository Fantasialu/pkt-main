import { db } from '../db';
import { activities, Activity, InsertActivity } from '../db/schema';
import { eq, ilike, or, and, desc, asc, sql } from 'drizzle-orm';
import { z } from 'zod';
import { insertActivitySchema, updateActivitySchema } from '../db/schema';

export class ActivitiesRepository {
  async findAll(filters?: {
    type?: string;
    status?: string;
    search?: string;
    sort?: string;
  }): Promise<Activity[]> {
    const conditions = [];

    if (filters?.type && filters.type !== 'all') {
      conditions.push(eq(activities.type, filters.type));
    }
    if (filters?.status) {
      conditions.push(eq(activities.status, filters.status));
    }
    if (filters?.search) {
      conditions.push(
        or(
          ilike(activities.title, `%${filters.search}%`),
          ilike(activities.description, `%${filters.search}%`),
          ilike(activities.organizer, `%${filters.search}%`)
        )
      );
    }

    if (filters?.sort === 'popular') {
      return conditions.length > 0
        ? db.select().from(activities).where(and(...conditions)).orderBy(desc(activities.currentParticipants))
        : db.select().from(activities).orderBy(desc(activities.currentParticipants));
    } else if (filters?.sort === 'upcoming') {
      return conditions.length > 0
        ? db.select().from(activities).where(and(...conditions)).orderBy(asc(activities.startTime))
        : db.select().from(activities).orderBy(asc(activities.startTime));
    } else {
      return conditions.length > 0
        ? db.select().from(activities).where(and(...conditions)).orderBy(desc(activities.createdAt))
        : db.select().from(activities).orderBy(desc(activities.createdAt));
    }
  }

  async findById(id: string): Promise<Activity | undefined> {
    const result = await db.select().from(activities).where(eq(activities.id, id)).limit(1);
    return result[0];
  }

  async findFeatured(): Promise<Activity[]> {
    return db.select().from(activities)
      .where(and(eq(activities.isFeatured, true), eq(activities.status, 'approved')))
      .orderBy(desc(activities.createdAt))
      .limit(3);
  }

  async create(data: z.infer<typeof insertActivitySchema>): Promise<Activity> {
    const result = await db.insert(activities).values(data as InsertActivity).returning();
    return result[0];
  }

  async update(id: string, data: z.infer<typeof updateActivitySchema>): Promise<Activity | undefined> {
    const result = await db.update(activities)
      .set({ ...data as Partial<InsertActivity>, updatedAt: new Date() })
      .where(eq(activities.id, id))
      .returning();
    return result[0];
  }

  async updateStatus(id: string, status: string): Promise<Activity | undefined> {
    const result = await db.update(activities)
      .set({ status, updatedAt: new Date() })
      .where(eq(activities.id, id))
      .returning();
    return result[0];
  }

  async incrementParticipants(id: string): Promise<void> {
    await db.update(activities)
      .set({ currentParticipants: sql`${activities.currentParticipants} + 1`, updatedAt: new Date() })
      .where(eq(activities.id, id));
  }

  async decrementParticipants(id: string): Promise<void> {
    await db.update(activities)
      .set({ currentParticipants: sql`GREATEST(${activities.currentParticipants} - 1, 0)`, updatedAt: new Date() })
      .where(eq(activities.id, id));
  }

  async getStats(): Promise<{ totalActivities: number; totalRegistrations: number; activeOrganizers: number; coverageRate: number }> {
    const totalResult = await db.select({ count: sql<number>`count(*)` }).from(activities);
    const approvedResult = await db.select({ count: sql<number>`count(*)` }).from(activities).where(eq(activities.status, 'approved'));
    const participantsResult = await db.select({ total: sql<number>`sum(current_participants)` }).from(activities);
    const organizersResult = await db.select({ count: sql<number>`count(distinct organizer)` }).from(activities);

    return {
      totalActivities: Number(approvedResult[0]?.count ?? 0),
      totalRegistrations: Number(participantsResult[0]?.total ?? 0),
      activeOrganizers: Number(organizersResult[0]?.count ?? 0),
      coverageRate: 94,
    };
  }
}

export const activitiesRepository = new ActivitiesRepository();
