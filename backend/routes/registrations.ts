import { Router, Request, Response } from 'express';
import { registrationsRepository } from '../repositories/registrations';
import { activitiesRepository } from '../repositories/activities';
import { notificationsRepository } from '../repositories/notifications';
import { insertRegistrationSchema } from '../db/schema';
import { z } from 'zod';

const router = Router();

// GET /api/registrations/activity/:activityId - get registrations for an activity
router.get('/activity/:activityId', async (req: Request, res: Response) => {
  try {
    const activityId = req.params.activityId as string;
    const registrations = await registrationsRepository.findByActivity(activityId);
    res.json({ success: true, data: registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取报名名单失败' });
  }
});

// GET /api/registrations/student/:email - get registrations for a student
router.get('/student/:email', async (req: Request, res: Response) => {
  try {
    const email = req.params.email as string;
    const registrations = await registrationsRepository.findByEmail(email);
    res.json({ success: true, data: registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取报名记录失败' });
  }
});

// POST /api/registrations - register for an activity
router.post('/', async (req: Request, res: Response) => {
  try {
    const validated = insertRegistrationSchema.parse(req.body);

    // Check if activity exists and has capacity
    const activity = await activitiesRepository.findById(validated.activityId);
    if (!activity) {
      return res.status(404).json({ success: false, message: '活动不存在' });
    }
    if (activity.status !== 'approved') {
      return res.status(400).json({ success: false, message: '该活动暂不接受报名' });
    }
    if (activity.currentParticipants >= activity.maxParticipants) {
      return res.status(400).json({ success: false, message: '活动名额已满' });
    }

    // Check if already registered
    const existing = await registrationsRepository.findByActivityAndEmail(
      validated.activityId,
      validated.studentEmail
    );
    if (existing) {
      return res.status(400).json({ success: false, message: '您已报名该活动' });
    }

    // Check registration eligibility criteria
    const checkEligibility = (): string | null => {
      // Parse allowed colleges
      if (activity.allowedColleges) {
        try {
          const allowedColleges = JSON.parse(activity.allowedColleges) as string[];
          if (allowedColleges.length > 0 && !allowedColleges.includes(validated.major?.split('-')[0] || '')) {
            return `该活动仅限以下学院学生报名：${allowedColleges.join('、')}`;
          }
        } catch {
          // ignore parse error
        }
      }

      // Parse allowed majors
      if (activity.allowedMajors) {
        try {
          const allowedMajors = JSON.parse(activity.allowedMajors) as string[];
          if (allowedMajors.length > 0 && !allowedMajors.includes(validated.major || '')) {
            return `该活动仅限以下专业学生报名：${allowedMajors.join('、')}`;
          }
        } catch {
          // ignore parse error
        }
      }

      // Parse allowed grades
      if (activity.allowedGrades) {
        try {
          const allowedGrades = JSON.parse(activity.allowedGrades) as string[];
          if (allowedGrades.length > 0 && !allowedGrades.includes(validated.grade || '')) {
            return `该活动仅限以下年级学生报名：${allowedGrades.join('、')}`;
          }
        } catch {
          // ignore parse error
        }
      }

      return null;
    };

    const eligibilityError = checkEligibility();
    if (eligibilityError) {
      return res.status(400).json({ success: false, message: eligibilityError });
    }

    const registration = await registrationsRepository.create(validated);
    await activitiesRepository.incrementParticipants(validated.activityId);

    // Create notification
    await notificationsRepository.create({
      activityId: validated.activityId,
      studentEmail: validated.studentEmail,
      title: '报名成功',
      message: `您已成功报名「${activity.title}」，活动时间：${new Date(activity.startTime).toLocaleString('zh-CN')}，地点：${activity.location}`,
      type: 'reminder',
    });

    res.status(201).json({ success: true, data: registration });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: '数据验证失败', errors: error.errors });
    }
    res.status(500).json({ success: false, message: '报名失败' });
  }
});

// DELETE /api/registrations/:id - cancel registration
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const registration = await registrationsRepository.cancel(id);
    if (!registration) {
      return res.status(404).json({ success: false, message: '报名记录不存在' });
    }
    await activitiesRepository.decrementParticipants(registration.activityId);
    res.json({ success: true, data: registration });
  } catch (error) {
    res.status(500).json({ success: false, message: '取消报名失败' });
  }
});

export default router;
