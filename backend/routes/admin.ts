import { Router, Request, Response } from 'express';
import { activitiesRepository } from '../repositories/activities';
import { registrationsRepository } from '../repositories/registrations';
import { notificationsRepository } from '../repositories/notifications';
import { db } from '../db';
import { activities, registrations } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

const router = Router();

// GET /api/admin/stats - get admin dashboard stats
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await activitiesRepository.getStats();

    // Get pending activities count
    const pendingResult = await db.select({ count: sql<number>`count(*)` })
      .from(activities)
      .where(eq(activities.status, 'pending'));

    // Get activities by type
    const byTypeResult = await db.select({
      type: activities.type,
      count: sql<number>`count(*)`
    }).from(activities).where(eq(activities.status, 'approved')).groupBy(activities.type);

    res.json({
      success: true,
      data: {
        ...stats,
        pendingCount: Number(pendingResult[0]?.count ?? 0),
        byType: byTypeResult,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取统计数据失败' });
  }
});

// GET /api/admin/activities - get all activities including pending
router.get('/activities', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const allActivities = await activitiesRepository.findAll({
      status: status as string | undefined,
    });
    res.json({ success: true, data: allActivities });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取活动列表失败' });
  }
});

// PATCH /api/admin/activities/:id/approve - approve activity
router.patch('/activities/:id/approve', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const activity = await activitiesRepository.updateStatus(id, 'approved');
    if (!activity) {
      return res.status(404).json({ success: false, message: '活动不存在' });
    }
    res.json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, message: '审核失败' });
  }
});

// PATCH /api/admin/activities/:id/reject - reject activity
router.patch('/activities/:id/reject', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const activity = await activitiesRepository.updateStatus(id, 'rejected');
    if (!activity) {
      return res.status(404).json({ success: false, message: '活动不存在' });
    }
    res.json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, message: '拒绝失败' });
  }
});

export default router;
