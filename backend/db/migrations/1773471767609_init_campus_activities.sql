-- Campus Activity Platform - Initial Migration

CREATE TABLE IF NOT EXISTS "Activities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "description" text NOT NULL,
  "type" text NOT NULL,
  "location" text NOT NULL,
  "start_time" timestamp NOT NULL,
  "end_time" timestamp,
  "registration_deadline" timestamp,
  "max_participants" integer NOT NULL DEFAULT 100,
  "current_participants" integer NOT NULL DEFAULT 0,
  "organizer" text NOT NULL,
  "organizer_contact" text,
  "image_url" text,
  "status" text NOT NULL DEFAULT 'pending',
  "is_featured" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Registrations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "activity_id" uuid NOT NULL REFERENCES "Activities"("id") ON DELETE CASCADE,
  "student_name" text NOT NULL,
  "student_id" text NOT NULL,
  "student_email" text NOT NULL,
  "student_phone" text,
  "major" text,
  "grade" text,
  "status" text NOT NULL DEFAULT 'registered',
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "activity_id" uuid REFERENCES "Activities"("id") ON DELETE SET NULL,
  "student_email" text NOT NULL,
  "title" text NOT NULL,
  "message" text NOT NULL,
  "type" text NOT NULL DEFAULT 'reminder',
  "is_read" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "activities_type_idx" ON "Activities"("type");
CREATE INDEX IF NOT EXISTS "activities_status_idx" ON "Activities"("status");
CREATE INDEX IF NOT EXISTS "registrations_activity_idx" ON "Registrations"("activity_id");
CREATE INDEX IF NOT EXISTS "registrations_email_idx" ON "Registrations"("student_email");
CREATE INDEX IF NOT EXISTS "notifications_email_idx" ON "Notifications"("student_email");

-- Seed some sample activities
INSERT INTO "Activities" ("id", "title", "description", "type", "location", "start_time", "end_time", "registration_deadline", "max_participants", "current_participants", "organizer", "image_url", "status", "is_featured") VALUES
  (gen_random_uuid(), '2026年度校园创新创业大赛', '本次大赛面向全校学生，鼓励创新思维与创业实践。参赛团队需提交商业计划书，经过初赛、复赛、决赛三个阶段，最终评选出优秀创业项目并给予资金支持。', 'competition', '综合楼报告厅 A101', '2026-03-25 09:00:00', '2026-03-25 18:00:00', '2026-03-20 23:59:59', 200, 128, '创新创业学院', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=420&fit=crop', 'approved', true),
  (gen_random_uuid(), '人工智能前沿技术讲座', '邀请业界知名AI专家分享最新研究成果，涵盖大语言模型、计算机视觉、强化学习等前沿方向，适合对AI感兴趣的同学参加。', 'lecture', '图书馆报告厅', '2026-03-15 10:00:00', '2026-03-15 12:00:00', '2026-03-14 23:59:59', 100, 72, '计算机学院', 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=400&h=200&fit=crop', 'approved', false),
  (gen_random_uuid(), '社区环保志愿服务活动', '组织同学前往周边社区开展环保宣传与垃圾分类指导活动，为建设绿色校园贡献力量，参与者可获得志愿服务时长证明。', 'volunteer', '校门口集合', '2026-03-22 08:30:00', '2026-03-22 12:00:00', '2026-03-21 23:59:59', 60, 27, '环保协会', 'https://images.unsplash.com/photo-1560220604-1985ebfe28b1?w=400&h=200&fit=crop', 'approved', false),
  (gen_random_uuid(), '第十届校园英语辩论锦标赛', '一年一度的英语辩论赛，欢迎各院系学生组队参赛，展示英语口语与逻辑思维能力，优胜队伍将代表学校参加省级比赛。', 'competition', '外语学院 302', '2026-03-28 14:00:00', '2026-03-28 18:00:00', '2026-03-25 23:59:59', 80, 45, '外语学院学生会', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=200&fit=crop', 'approved', false),
  (gen_random_uuid(), '春季校园5公里健康跑', '迎接春天，一起跑步！本次健康跑路线经过校园主要景点，完赛选手可获得纪念奖牌，名额有限，先报先得。', 'sports', '操场主跑道', '2026-04-05 07:00:00', '2026-04-05 10:00:00', '2026-04-03 23:59:59', 200, 192, '体育部', 'https://images.unsplash.com/photo-1639968117735-e596e81453f8?w=400&h=200&fit=crop', 'approved', false),
  (gen_random_uuid(), '敬老院探访志愿服务', '前往附近敬老院开展慰问活动，为老人们表演节目、陪伴聊天，传递温暖与关爱，参与者可获得志愿服务时长。', 'volunteer', '校门口统一出发', '2026-04-12 09:00:00', '2026-04-12 15:00:00', '2026-04-10 23:59:59', 30, 18, '青年志愿者协会', 'https://images.unsplash.com/photo-1764072970350-2ce4f354a483?w=400&h=200&fit=crop', 'approved', false),
  (gen_random_uuid(), '《人类简史》读书分享会', '围绕《人类简史》展开深度讨论，探讨人类文明的演进与未来走向，欢迎读过此书的同学踊跃参与，共享思想碰撞的乐趣。', 'lecture', '图书馆 3F 阅览室', '2026-03-30 19:00:00', '2026-03-30 21:00:00', '2026-03-29 23:59:59', 40, 22, '读书协会', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=200&fit=crop', 'approved', false),
  (gen_random_uuid(), '校园文艺晚会', '一年一度的校园文艺晚会，汇聚全校最优秀的文艺表演，包括歌唱、舞蹈、话剧等多种形式，欢迎全体同学观看。', 'art', '大礼堂', '2026-04-20 19:00:00', '2026-04-20 22:00:00', '2026-04-18 23:59:59', 500, 320, '校学生会文艺部', 'https://images.unsplash.com/photo-1764885518782-5d301f23f7a5?w=400&h=200&fit=crop', 'approved', false),
  (gen_random_uuid(), '机器人设计大赛', '面向工科学生的机器人设计与竞技比赛，参赛队伍需自主设计并制作机器人完成指定任务，考验团队协作与工程实践能力。', 'competition', '工学院实验楼', '2026-04-15 09:00:00', '2026-04-15 17:00:00', '2026-04-10 23:59:59', 60, 35, '机器人协会', 'https://images.unsplash.com/photo-1660795468951-0b37051eb1b2?w=400&h=200&fit=crop', 'pending', false)
ON CONFLICT DO NOTHING;
