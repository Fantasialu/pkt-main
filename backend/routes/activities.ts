import { Router, Request, Response } from 'express';
import { activitiesRepository } from '../repositories/activities';
import { insertActivitySchema, updateActivitySchema } from '../db/schema';
import { z } from 'zod';

const router = Router();

// GET /api/activities - list all activities with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, status, search, sort } = req.query;
    const activities = await activitiesRepository.findAll({
      type: type as string,
      status: (status as string) || 'approved',
      search: search as string,
      sort: sort as string,
    });
    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取活动列表失败' });
  }
});

// GET /api/activities/stats - get platform stats
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await activitiesRepository.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取统计数据失败' });
  }
});

// GET /api/activities/featured - get featured activities
router.get('/featured', async (_req: Request, res: Response) => {
  try {
    const featured = await activitiesRepository.findFeatured();
    res.json({ success: true, data: featured });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取精选活动失败' });
  }
});

// GET /api/activities/:id - get single activity
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const activity = await activitiesRepository.findById(id);
    if (!activity) {
      return res.status(404).json({ success: false, message: '活动不存在' });
    }
    res.json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取活动详情失败' });
  }
});

// POST /api/activities - create new activity
router.post('/', async (req: Request, res: Response) => {
  try {
    const validated = insertActivitySchema.parse(req.body);
    const activity = await activitiesRepository.create(validated);
    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: '数据验证失败', errors: error.errors });
    }
    res.status(500).json({ success: false, message: '创建活动失败' });
  }
});

// PUT /api/activities/:id - update activity
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const validated = updateActivitySchema.parse(req.body);
    const activity = await activitiesRepository.update(id, validated);
    if (!activity) {
      return res.status(404).json({ success: false, message: '活动不存在' });
    }
    res.json({ success: true, data: activity });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: '数据验证失败', errors: error.errors });
    }
    res.status(500).json({ success: false, message: '更新活动失败' });
  }
});

// PATCH /api/activities/:id/status - update activity status (admin)
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: '无效的状态值' });
    }
    const activity = await activitiesRepository.updateStatus(id, status);
    if (!activity) {
      return res.status(404).json({ success: false, message: '活动不存在' });
    }
    res.json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, message: '更新状态失败' });
  }
});

export default router;
