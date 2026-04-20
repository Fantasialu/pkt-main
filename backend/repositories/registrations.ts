import { db, eq } from '../db';

interface Registration {
  id: string;
  activityId: string;
  userId?: string;
  studentName: string;
  studentId: string;
  studentEmail: string;
  studentPhone?: string;
  major?: string;
  grade?: string;
  status: string;
  createdAt: string;
  checkedInAt?: string;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  type: string;
  location: string;
  startTime: string;
  endTime?: string;
  registrationDeadline?: string;
  maxParticipants: number;
  currentParticipants: number;
  organizerId?: string;
  organizer: string;
  organizerContact?: string;
  imageUrl?: string;
  status: string;
  isFeatured: boolean;
  allowedColleges?: string;
  allowedMajors?: string;
  allowedGrades?: string;
  createdAt: string;
  updatedAt: string;
}

export class RegistrationsRepository {
  async findByActivity(activityId: string): Promise<Registration[]> {
    const registrations = await db.select().from('Registrations').execute();
    return registrations
      .filter(r => r.activityId === activityId && r.status === 'registered')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findByEmail(studentEmail: string): Promise<(Registration & { activity?: Activity })[]> {
    const registrations = await db.select().from('Registrations').execute();
    const activities = await db.select().from('Activities');
    
    return registrations
      .filter(r => r.studentEmail === studentEmail)
      .map(r => ({
        ...r,
        activity: activities.find(a => a.id === r.activityId),
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findByActivityAndEmail(activityId: string, studentEmail: string): Promise<Registration | undefined> {
    const registrations = await db.select().from('Registrations').execute();
    return registrations.find(
      r => r.activityId === activityId && r.studentEmail === studentEmail && r.status === 'registered'
    );
  }

  async create(data: {
    activityId: string;
    studentName: string;
    studentId: string;
    studentEmail: string;
    studentPhone?: string;
    major?: string;
    grade?: string;
  }): Promise<Registration> {
    const result = await db.insert('Registrations').values({
      ...data,
      status: 'registered',
      createdAt: new Date().toISOString(),
    }).returning();
    return result[0];
  }

  async cancel(id: string): Promise<Registration | undefined> {
    const registrations = await db.select().from('Registrations').execute();
    const registration = registrations.find(r => r.id === id);
    if (!registration) return undefined;
    
    const result = await db.update('Registrations')
      .set({ status: 'cancelled', updatedAt: new Date().toISOString() })
      .where(eq({ id: '' }, id))
      .returning();
    return result[0];
  }

  async cancelByActivityAndEmail(activityId: string, studentEmail: string): Promise<Registration | undefined> {
    const registrations = await db.select().from('Registrations').execute();
    const registration = registrations.find(
      r => r.activityId === activityId && r.studentEmail === studentEmail
    );
    if (!registration) return undefined;
    
    const result = await db.update('Registrations')
      .set({ status: 'cancelled', updatedAt: new Date().toISOString() })
      .where(eq({ id: '' }, registration.id))
      .returning();
    return result[0];
  }
}

export const registrationsRepository = new RegistrationsRepository();
