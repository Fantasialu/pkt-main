import { Router, Request, Response } from 'express';
import { db, eq } from '../db';
import { z } from 'zod';

const router = Router();

const insertActivitySchema = z.object({
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

router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, status, search, sort } = req.query;
    let activities = await db.select().from('Activities').execute();
    
    // Filter by status
    const filterStatus = (status as string) || 'approved';
    activities = activities.filter(a => a.status === filterStatus);
    
    // Filter by type
    if (type && type !== 'all') {
      activities = activities.filter(a => a.type === type);
    }
    
    // Search
    if (search) {
      const searchLower = (search as string).toLowerCase();
      activities = activities.filter(a => 
        a.title.toLowerCase().includes(searchLower) ||
        a.description.toLowerCase().includes(searchLower) ||
        a.organizer.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort
    if (sort === 'popular') {
      activities.sort((a, b) => b.currentParticipants - a.currentParticipants);
    } else if (sort === 'upcoming') {
      activities.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    } else {
      activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取活动列表失败' });
  }
});

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const activities = await db.select().from('Activities');
    const approvedActivities = activities.filter(a => a.status === 'approved');
    const totalRegistrations = approvedActivities.reduce((sum, a) => sum + a.currentParticipants, 0);
    const organizers = new Set(approvedActivities.map(a => a.organizer)).size;
    
    res.json({ 
      success: true, 
      data: {
        totalActivities: approvedActivities.length,
        totalRegistrations,
        activeOrganizers: organizers,
        coverageRate: 94,
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取统计数据失败' });
  }
});

router.get('/featured', async (_req: Request, res: Response) => {
  try {
    const activities = await db.select().from('Activities');
    const featured = activities
      .filter(a => a.isFeatured && a.status === 'approved')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
    
    res.json({ success: true, data: featured });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取精选活动失败' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const activities = await db.select().from('Activities').execute();
    const activity = activities.find(a => a.id === id);
    
    if (!activity) {
      return res.status(404).json({ success: false, message: '活动不存在' });
    }
    res.json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取活动详情失败' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const validated = insertActivitySchema.parse(req.body);
    
    const newActivity = await db.insert('Activities').values({
      ...validated,
      currentParticipants: 0,
      allowedColleges: validated.allowedColleges ? JSON.stringify(validated.allowedColleges) : undefined,
      allowedMajors: validated.allowedMajors ? JSON.stringify(validated.allowedMajors) : undefined,
      allowedGrades: validated.allowedGrades ? JSON.stringify(validated.allowedGrades) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).returning();
    
    res.status(201).json({ success: true, data: newActivity[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: '数据验证失败', errors: error.errors });
    }
    res.status(500).json({ success: false, message: '创建活动失败' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const data = req.body;
    
    const updated = await db.update('Activities')
      .set({ 
        ...data, 
        updatedAt: new Date().toISOString(),
        allowedColleges: data.allowedColleges ? JSON.stringify(data.allowedColleges) : undefined,
        allowedMajors: data.allowedMajors ? JSON.stringify(data.allowedMajors) : undefined,
        allowedGrades: data.allowedGrades ? JSON.stringify(data.allowedGrades) : undefined,
      })
      .where(eq({ id: '' }, id))
      .returning();
    
    if (updated.length === 0) {
      return res.status(404).json({ success: false, message: '活动不存在' });
    }
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: '数据验证失败', errors: error.errors });
    }
    res.status(500).json({ success: false, message: '更新活动失败' });
  }
});

router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: '无效的状态值' });
    }
    
    const updated = await db.update('Activities')
      .set({ status, updatedAt: new Date().toISOString() })
      .where(eq({ id: '' }, id))
      .returning();
    
    if (updated.length === 0) {
      return res.status(404).json({ success: false, message: '活动不存在' });
    }
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: '更新状态失败' });
  }
});

export default router;
