// File-based database for development/testing
// This provides a simple interface that mimics the drizzle-orm API with file persistence

import fs from 'fs';
import path from 'path';

interface UserRecord {
  id: string;
  email: string;
  password: string;
  name: string;
  studentId?: string;
  phone?: string;
  major?: string;
  grade?: string;
  college?: string;
  role: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ActivityRecord {
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

interface RegistrationRecord {
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

interface NotificationRecord {
  id: string;
  activityId?: string;
  userId?: string;
  studentEmail: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface DatabaseData {
  users: UserRecord[];
  activities: ActivityRecord[];
  registrations: RegistrationRecord[];
  notifications: NotificationRecord[];
}

// File path for persistence
const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Load data from file
function loadData(): DatabaseData {
  ensureDataDir();
  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    } catch {
      return { users: [], activities: [], registrations: [], notifications: [] };
    }
  }
  return { users: [], activities: [], registrations: [], notifications: [] };
}

// Save data to file
function saveData(data: DatabaseData) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// In-memory storage with persistence
const loadedData = loadData();
let usersData: UserRecord[] = [...loadedData.users];
let activitiesData: ActivityRecord[] = [...loadedData.activities];
let registrationsData: RegistrationRecord[] = [...loadedData.registrations];
let notificationsData: NotificationRecord[] = [...loadedData.notifications];

// Auto-save data when changes occur
function autoSave() {
  saveData({
    users: usersData,
    activities: activitiesData,
    registrations: registrationsData,
    notifications: notificationsData,
  });
}

// Initialize with default admin user
async function init() {
  const bcrypt = await import('bcryptjs');
  const existingAdmin = usersData.find(u => u.email === 'admin@example.com');
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    usersData.push({
      id: crypto.randomUUID(),
      email: 'admin@example.com',
      password: hashedPassword,
      name: '管理员',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  
  // Add some sample activities
  if (activitiesData.length === 0) {
    activitiesData.push({
      id: crypto.randomUUID(),
      title: '校园技术分享会',
      description: '邀请业界专家分享最新技术趋势，包括人工智能、云计算、大数据等热门话题。欢迎所有对技术感兴趣的同学参加！',
      type: 'lecture',
      location: '图书馆报告厅B201',
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      registrationDeadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 200,
      currentParticipants: 45,
      organizer: '计算机学院',
      status: 'approved',
      isFeatured: true,
      allowedColleges: JSON.stringify(['计算机学院', '数学学院']),
      allowedGrades: JSON.stringify(['24级', '23级', '22级']),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    activitiesData.push({
      id: crypto.randomUUID(),
      title: '校园运动会',
      description: '一年一度的校园运动会即将开始！设有田径、篮球、足球、羽毛球等多个项目，欢迎各学院同学积极参与！',
      type: 'sports',
      location: '学校体育场',
      startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      registrationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 500,
      currentParticipants: 120,
      organizer: '体育学院',
      status: 'approved',
      isFeatured: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    activitiesData.push({
      id: crypto.randomUUID(),
      title: '志愿者招募大会',
      description: '校志愿者协会举办的年度志愿者招募大会，为同学们提供丰富的志愿服务机会，包括社区服务、环保活动等。',
      type: 'volunteer',
      location: '学生活动中心',
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 150,
      currentParticipants: 67,
      organizer: '校志愿者协会',
      status: 'approved',
      isFeatured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    activitiesData.push({
      id: crypto.randomUUID(),
      title: '创新创业大赛',
      description: '面向全校学生的创新创业大赛，鼓励同学们展示自己的创业项目和创新想法。',
      type: 'competition',
      location: '大学生创业孵化基地',
      startTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      registrationDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 100,
      currentParticipants: 30,
      organizer: '创新创业学院',
      status: 'pending',
      isFeatured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  
  console.log('Database initialized with sample data');
}

init();

// Query builder simulation
function eq<T>(obj: T, value: T[keyof T]) {
  return { field: obj, value };
}

// Database API
export const db = {
  select: () => ({
    from: (table: string) => ({
      where: (condition: { field: any; value: any }) => ({
        execute: () => {
          let data: any[] = [];
          switch (table) {
            case 'Users':
              data = usersData;
              break;
            case 'Activities':
              data = activitiesData;
              break;
            case 'Registrations':
              data = registrationsData;
              break;
            case 'Notifications':
              data = notificationsData;
              break;
          }
          if (condition) {
            const fieldName = Object.keys(condition.field)[0];
            return data.filter(item => item[fieldName] === condition.value);
          }
          return data;
        },
      }),
      execute: () => {
        switch (table) {
          case 'Users':
            return usersData;
          case 'Activities':
            return activitiesData;
          case 'Registrations':
            return registrationsData;
          case 'Notifications':
            return notificationsData;
        }
        return [];
      },
    }),
  }),
  
  insert: (table: string) => ({
    values: (data: any) => ({
      returning: () => {
        const item = { ...data, id: data.id || crypto.randomUUID() };
        switch (table) {
          case 'Users':
            usersData.push(item);
            autoSave();
            return [item];
          case 'Activities':
            activitiesData.push(item);
            autoSave();
            return [item];
          case 'Registrations':
            registrationsData.push(item);
            // Update activity participant count
            const activity = activitiesData.find(a => a.id === item.activityId);
            if (activity) {
              activity.currentParticipants++;
            }
            autoSave();
            return [item];
          case 'Notifications':
            notificationsData.push(item);
            autoSave();
            return [item];
        }
        return [];
      },
    }),
  }),
  
  update: (table: string) => ({
    set: (data: any) => ({
      where: (condition: { field: any; value: any }) => ({
        returning: () => {
          let dataArray: any[] = [];
          switch (table) {
            case 'Users':
              dataArray = usersData;
              break;
            case 'Activities':
              dataArray = activitiesData;
              break;
            case 'Registrations':
              dataArray = registrationsData;
              break;
            case 'Notifications':
              dataArray = notificationsData;
              break;
          }
          const fieldName = Object.keys(condition.field)[0];
          const index = dataArray.findIndex(item => item[fieldName] === condition.value);
          if (index !== -1) {
            dataArray[index] = { ...dataArray[index], ...data };
            autoSave();
            return [dataArray[index]];
          }
          return [];
        },
      }),
    }),
  }),
  
  delete: (table: string) => ({
    where: (condition: { field: any; value: any }) => {
      const fieldName = Object.keys(condition.field)[0];
      switch (table) {
        case 'Users':
          usersData = usersData.filter(item => item[fieldName] !== condition.value);
          autoSave();
          break;
        case 'Activities':
          activitiesData = activitiesData.filter(item => item[fieldName] !== condition.value);
          autoSave();
          break;
        case 'Registrations':
          const regIndex = registrationsData.findIndex(item => item[fieldName] === condition.value);
          if (regIndex !== -1) {
            const deleted = registrationsData[regIndex];
            registrationsData = registrationsData.filter(item => item[fieldName] !== condition.value);
            // Update activity participant count
            const activity = activitiesData.find(a => a.id === deleted.activityId);
            if (activity) {
              activity.currentParticipants--;
            }
          }
          autoSave();
          break;
        case 'Notifications':
          notificationsData = notificationsData.filter(item => item[fieldName] !== condition.value);
          autoSave();
          break;
      }
      return { execute: () => {} };
    },
  }),
  
  // Count function
  count: () => ({
    from: (table: string) => ({
      where: (condition: { field: any; value: any }) => ({
        execute: () => {
          let data: any[] = [];
          switch (table) {
            case 'Registrations':
              data = registrationsData;
              break;
          }
          if (condition) {
            const fieldName = Object.keys(condition.field)[0];
            return data.filter(item => item[fieldName] === condition.value).length;
          }
          return data.length;
        },
      }),
    }),
  }),
};

export { eq };
