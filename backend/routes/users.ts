import { Router } from 'express';
import { db, eq } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

const registerSchema = z.object({
  email: z.string().email('无效的邮箱格式'),
  password: z.string().min(6, '密码至少6个字符'),
  name: z.string().min(2, '姓名至少2个字符'),
  studentId: z.string().optional(),
  phone: z.string().optional(),
  major: z.string().optional(),
  grade: z.string().optional(),
  college: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('无效的邮箱格式'),
  password: z.string().min(6, '密码至少6个字符'),
});

const updateUserSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符').optional(),
  phone: z.string().optional(),
  major: z.string().optional(),
  grade: z.string().optional(),
  college: z.string().optional(),
  avatar: z.string().optional(),
});

router.post('/register', async (req, res) => {
  try {
    const validated = registerSchema.parse(req.body);
    
    const existingUser = await db.select().from('Users').where(eq({ email: '' }, validated.email)).execute();
    if (existingUser.length > 0) {
      return res.status(400).json({ success: false, message: '该邮箱已被注册' });
    }

    if (validated.studentId) {
      const existingStudent = await db.select().from('Users').where(eq({ studentId: '' }, validated.studentId)).execute();
      if (existingStudent.length > 0) {
        return res.status(400).json({ success: false, message: '该学号已被注册' });
      }
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);
    
    const newUser = await db.insert('Users').values({
      ...validated,
      password: hashedPassword,
      role: 'student',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).returning();

    const token = jwt.sign({ id: newUser[0].id, role: newUser[0].role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: {
          id: newUser[0].id,
          email: newUser[0].email,
          name: newUser[0].name,
          role: newUser[0].role,
        },
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const validated = loginSchema.parse(req.body);
    
    const user = await db.select().from('Users').where(eq({ email: '' }, validated.email)).execute();
    
    if (user.length === 0) {
      return res.status(401).json({ success: false, message: '邮箱或密码错误' });
    }

    const isPasswordValid = await bcrypt.compare(validated.password, user[0].password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: '邮箱或密码错误' });
    }

    if (!user[0].isActive) {
      return res.status(401).json({ success: false, message: '账户已被禁用' });
    }

    const token = jwt.sign({ id: user[0].id, role: user[0].role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user[0].id,
          email: user[0].email,
          name: user[0].name,
          role: user[0].role,
          studentId: user[0].studentId,
          phone: user[0].phone,
          major: user[0].major,
          grade: user[0].grade,
          college: user[0].college,
          avatar: user[0].avatar,
        },
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    
    const user = await db.select().from('Users').where(eq({ id: '' }, decoded.id)).execute();
    
    if (user.length === 0) {
      return res.status(401).json({ success: false, message: '用户不存在' });
    }

    res.json({
      success: true,
      data: {
        id: user[0].id,
        email: user[0].email,
        name: user[0].name,
        role: user[0].role,
        studentId: user[0].studentId,
        phone: user[0].phone,
        major: user[0].major,
        grade: user[0].grade,
        college: user[0].college,
        avatar: user[0].avatar,
      },
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'token无效或已过期' });
  }
});

router.put('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    
    const validated = updateUserSchema.parse(req.body);
    
    const updatedUser = await db.update('Users')
      .set({ ...validated, updatedAt: new Date().toISOString() })
      .where(eq({ id: '' }, decoded.id))
      .returning();

    if (updatedUser.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    res.json({
      success: true,
      message: '更新成功',
      data: {
        id: updatedUser[0].id,
        email: updatedUser[0].email,
        name: updatedUser[0].name,
        role: updatedUser[0].role,
        studentId: updatedUser[0].studentId,
        phone: updatedUser[0].phone,
        major: updatedUser[0].major,
        grade: updatedUser[0].grade,
        college: updatedUser[0].college,
        avatar: updatedUser[0].avatar,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    return res.status(401).json({ success: false, message: 'token无效或已过期' });
  }
});

router.delete('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    
    await db.update('Users').set({ isActive: false, updatedAt: new Date().toISOString() }).where(eq({ id: '' }, decoded.id));

    res.json({ success: true, message: '账户已注销' });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'token无效或已过期' });
  }
});

router.get('/all', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: '权限不足' });
    }

    const allUsers = await db.select().from('Users');

    res.json({ success: true, data: allUsers });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'token无效或已过期' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: '权限不足' });
    }

    const { id } = req.params;
    const { role, isActive } = req.body;
    
    const updatedUser = await db.update('Users')
      .set({ role, isActive, updatedAt: new Date().toISOString() })
      .where(eq({ id: '' }, id))
      .returning();

    if (updatedUser.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    res.json({
      success: true,
      message: '更新成功',
      data: updatedUser[0],
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'token无效或已过期' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: '权限不足' });
    }

    const { id } = req.params;
    await db.delete('Users').where(eq({ id: '' }, id));

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'token无效或已过期' });
  }
});

export default router;
