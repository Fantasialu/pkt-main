import { Router, Request, Response } from 'express';
import { notificationsRepository } from '../repositories/notifications';

const router = Router();

// GET /api/notifications/:email - get notifications for a student
router.get('/:email', async (req: Request, res: Response) => {
  try {
    const email = req.params.email as string;
    const notifications = await notificationsRepository.findByEmail(email);
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取通知失败' });
  }
});

// PATCH /api/notifications/:id/read - mark notification as read
router.patch('/:id/read', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const notification = await notificationsRepository.markAsRead(id);
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: '标记已读失败' });
  }
});

// PATCH /api/notifications/read-all/:email - mark all as read
router.patch('/read-all/:email', async (req: Request, res: Response) => {
  try {
    const email = req.params.email as string;
    await notificationsRepository.markAllAsRead(email);
    res.json({ success: true, data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: '标记全部已读失败' });
  }
});

export default router;
