import { db, eq } from '../db';

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

export class ActivitiesRepository {
  async findAll(filters?: {
    type?: string;
    status?: string;
    search?: string;
    sort?: string;
  }): Promise<Activity[]> {
    let activities = await db.select().from('Activities').execute();

    if (filters?.type && filters.type !== 'all') {
      activities = activities.filter(a => a.type === filters.type);
    }
    if (filters?.status) {
      activities = activities.filter(a => a.status === filters.status);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      activities = activities.filter(a =>
        a.title.toLowerCase().includes(searchLower) ||
        a.description.toLowerCase().includes(searchLower) ||
        a.organizer.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.sort === 'popular') {
      activities.sort((a, b) => b.currentParticipants - a.currentParticipants);
    } else if (filters?.sort === 'upcoming') {
      activities.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    } else {
      activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return activities;
  }

  async findById(id: string): Promise<Activity | undefined> {
    const activities = await db.select().from('Activities').execute();
    return activities.find(a => a.id === id);
  }

  async findFeatured(): Promise<Activity[]> {
    const activities = await db.select().from('Activities').execute();
    return activities
      .filter(a => a.isFeatured && a.status === 'approved')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }

  async create(data: {
    title: string;
    description: string;
    type: string;
    location: string;
    startTime: Date;
    endTime?: Date;
    registrationDeadline?: Date;
    maxParticipants?: number;
    organizer: string;
    organizerContact?: string;
    imageUrl?: string;
    status?: string;
    isFeatured?: boolean;
    allowedColleges?: string[];
    allowedMajors?: string[];
    allowedGrades?: string[];
  }): Promise<Activity> {
    const result = await db.insert('Activities').values({
      ...data,
      maxParticipants: data.maxParticipants || 100,
      currentParticipants: 0,
      status: data.status || 'pending',
      isFeatured: data.isFeatured || false,
      allowedColleges: data.allowedColleges && data.allowedColleges.length > 0 ? JSON.stringify(data.allowedColleges) : undefined,
      allowedMajors: data.allowedMajors && data.allowedMajors.length > 0 ? JSON.stringify(data.allowedMajors) : undefined,
      allowedGrades: data.allowedGrades && data.allowedGrades.length > 0 ? JSON.stringify(data.allowedGrades) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).returning();
    return result[0];
  }

  async update(id: string, data: Partial<Activity>): Promise<Activity | undefined> {
    const result = await db.update('Activities')
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq({ id: '' }, id))
      .returning();
    return result[0];
  }

  async updateStatus(id: string, status: string): Promise<Activity | undefined> {
    const result = await db.update('Activities')
      .set({ status, updatedAt: new Date().toISOString() })
      .where(eq({ id: '' }, id))
      .returning();
    return result[0];
  }

  async incrementParticipants(id: string): Promise<void> {
    const activities = await db.select().from('Activities').execute();
    const activity = activities.find(a => a.id === id);
    if (activity) {
      activity.currentParticipants++;
      activity.updatedAt = new Date().toISOString();
    }
  }

  async decrementParticipants(id: string): Promise<void> {
    const activities = await db.select().from('Activities').execute();
    const activity = activities.find(a => a.id === id);
    if (activity) {
      activity.currentParticipants = Math.max(0, activity.currentParticipants - 1);
      activity.updatedAt = new Date().toISOString();
    }
  }

  async getStats(): Promise<{ totalActivities: number; totalRegistrations: number; activeOrganizers: number; coverageRate: number }> {
    const activities = await db.select().from('Activities').execute();
    const approvedActivities = activities.filter(a => a.status === 'approved');
    const totalRegistrations = approvedActivities.reduce((sum, a) => sum + a.currentParticipants, 0);
    const organizers = new Set(approvedActivities.map(a => a.organizer)).size;

    return {
      totalActivities: approvedActivities.length,
      totalRegistrations,
      activeOrganizers: organizers,
      coverageRate: 94,
    };
  }
}

export const activitiesRepository = new ActivitiesRepository();
