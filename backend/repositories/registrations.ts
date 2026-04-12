import { db } from '../db';
import { registrations, activities, Registration, InsertRegistration } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import { insertRegistrationSchema } from '../db/schema';

export class RegistrationsRepository {
  async findByActivity(activityId: string): Promise<Registration[]> {
    return db.select().from(registrations)
      .where(and(eq(registrations.activityId, activityId), eq(registrations.status, 'registered')))
      .orderBy(desc(registrations.createdAt));
  }

  async findByEmail(studentEmail: string): Promise<(Registration & { activity?: typeof activities.$inferSelect })[]> {
    const result = await db
      .select()
      .from(registrations)
      .leftJoin(activities, eq(registrations.activityId, activities.id))
      .where(eq(registrations.studentEmail, studentEmail))
      .orderBy(desc(registrations.createdAt));

    return result.map(r => ({ ...r.Registrations, activity: r.Activities ?? undefined }));
  }

  async findByActivityAndEmail(activityId: string, studentEmail: string): Promise<Registration | undefined> {
    const result = await db.select().from(registrations)
      .where(and(
        eq(registrations.activityId, activityId),
        eq(registrations.studentEmail, studentEmail),
        eq(registrations.status, 'registered')
      ))
      .limit(1);
    return result[0];
  }

  async create(data: z.infer<typeof insertRegistrationSchema>): Promise<Registration> {
    const result = await db.insert(registrations).values(data as InsertRegistration).returning();
    return result[0];
  }

  async cancel(id: string): Promise<Registration | undefined> {
    const result = await db.update(registrations)
      .set({ status: 'cancelled' })
      .where(eq(registrations.id, id))
      .returning();
    return result[0];
  }

  async cancelByActivityAndEmail(activityId: string, studentEmail: string): Promise<Registration | undefined> {
    const result = await db.update(registrations)
      .set({ status: 'cancelled' })
      .where(and(
        eq(registrations.activityId, activityId),
        eq(registrations.studentEmail, studentEmail)
      ))
      .returning();
    return result[0];
  }
}

export const registrationsRepository = new RegistrationsRepository();
