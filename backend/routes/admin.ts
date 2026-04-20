import { Router, Request, Response } from 'express';
import { activitiesRepository } from '../repositories/activities';
import { registrationsRepository } from '../repositories/registrations';
import { notificationsRepository } from '../repositories/notifications';
import { db } from '../db';

const router = Router();

// GET /api/admin/stats - get admin dashboard stats
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await activitiesRepository.getStats();

    // Get pending activities count
    const activities = await db.select().from('Activities').execute();
    const pendingCount = activities.filter(a => a.status === 'pending').length;

    // Get activities by type
    const approvedActivities = activities.filter(a => a.status === 'approved');
    const byType: { type: string; count: number }[] = [];
    const typeCounts: Record<string, number> = {};
    approvedActivities.forEach(a => {
      typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
    });
    Object.entries(typeCounts).forEach(([type, count]) => {
      byType.push({ type, count });
    });

    res.json({
      success: true,
      data: {
        ...stats,
        pendingCount,
        byType,
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
    
    // Send notification to organizer
    if (activity.organizerContact) {
      await notificationsRepository.create({
        activityId: activity.id,
        studentEmail: activity.organizerContact,
        title: '活动审核通过',
        message: `您发布的活动「${activity.title}」举办成功！活动现已开放报名，欢迎同学们参与。`,
        type: 'update',
      });
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
    
    // Send notification to organizer
    if (activity.organizerContact) {
      await notificationsRepository.create({
        activityId: activity.id,
        studentEmail: activity.organizerContact,
        title: '活动审核未通过',
        message: `您提交的活动「${activity.title}」未通过审核。请检查活动信息后重新提交申请。`,
        type: 'update',
      });
    }
    
    res.json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, message: '拒绝失败' });
  }
});

export default router;
