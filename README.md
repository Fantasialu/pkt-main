# Campus Pulse - 校园活动发布与报名系统

## Project Overview
A full-stack campus activity platform built with React + Express + PostgreSQL. Students can browse, search, and register for campus activities. Organizers can publish and manage events. Admins can review content and monitor platform stats.

## Project Structure

```
.
├── backend/
│   ├── config/
│   │   └── constants.ts          # Server config
│   ├── db/
│   │   ├── index.ts              # Drizzle DB connection (postgres.js)
│   │   ├── schema.ts             # Activities, Registrations, Notifications tables
│   │   └── migrations/
│   │       └── 1773471767609_init_campus_activities.sql
│   ├── middleware/
│   │   └── errorHandler.ts
│   ├── repositories/
│   │   ├── activities.ts         # Activity CRUD + stats
│   │   ├── registrations.ts      # Registration management
│   │   └── notifications.ts      # Notification management
│   ├── routes/
│   │   ├── activities.ts         # GET/POST/PUT/PATCH /api/activities
│   │   ├── registrations.ts      # GET/POST/DELETE /api/registrations
│   │   ├── notifications.ts      # GET/PATCH /api/notifications
│   │   └── admin.ts              # GET/PATCH /api/admin
│   └── server.ts                 # Express entry point
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ui/               # shadcn/ui components
│       │   └── custom/
│       │       ├── ActivitiesView.tsx      # Browse + filter activities
│       │       ├── ActivityDetailView.tsx  # Detail + registration list + CSV export
│       │       ├── MyRegistrationsView.tsx # Student's registrations
│       │       ├── PublishActivityView.tsx # Organizer publish form
│       │       ├── NotificationsView.tsx   # Notification center
│       │       └── AdminView.tsx           # Admin review + stats dashboard
│       ├── config/
│       │   └── constants.ts      # API_BASE_URL
│       ├── lib/
│       │   └── api.ts            # apiService - all API calls
│       ├── pages/
│       │   └── Index.tsx         # Main app shell: Navbar, HomePage, routing, modals
│       ├── types/
│       │   └── index.ts          # Activity, Registration, Notification, etc.
│       ├── App.tsx               # HashRouter + Toaster
│       └── index.css             # Tailwind v4 + Campus Pulse theme tokens
```

## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS v4, shadcn/ui, Vite
- **Backend**: Express.js, TypeScript, Drizzle ORM
- **Database**: PostgreSQL (postgres.js driver)
- **Routing**: React Router DOM (HashRouter)

## Key Features
1. **Activity Browse** - Filter by type (lecture/competition/volunteer/art/sports), search, sort
2. **Activity Detail** - Full info, registration list view, CSV export for organizers
3. **Online Registration** - Form with student info, capacity check, duplicate prevention
4. **My Registrations** - Student's registration history with cancel option
5. **Publish Activity** - Organizer form with pending review workflow
6. **Notification Center** - Auto-reminders on registration, mark read/unread
7. **Admin Dashboard** - Content review (approve/reject), platform stats

## API Routes
- `GET /api/activities` - List activities (filter: type, status, search, sort)
- `GET /api/activities/stats` - Platform statistics
- `GET /api/activities/:id` - Single activity
- `POST /api/activities` - Create activity (status: pending)
- `PUT /api/activities/:id` - Update activity
- `PATCH /api/activities/:id/status` - Update status
- `GET /api/registrations/activity/:id` - Registrations for activity
- `GET /api/registrations/student/:email` - Student's registrations
- `POST /api/registrations` - Register for activity
- `DELETE /api/registrations/:id` - Cancel registration
- `GET /api/notifications/:email` - Get notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all/:email` - Mark all as read
- `GET /api/admin/stats` - Admin stats
- `GET /api/admin/activities` - All activities (admin)
- `PATCH /api/admin/activities/:id/approve` - Approve
- `PATCH /api/admin/activities/:id/reject` - Reject

## Design System (Campus Pulse)
- **Primary**: Deep indigo `#3730a3` (oklch 0.38 0.18 270)
- **Secondary**: Indigo `#6366f1`
- **Accent**: Amber `#f59e0b`
- **Background**: Soft lavender `#f8f7ff`
- **Typography**: system-ui / Segoe UI

## Current User (Demo)
The app uses a demo user `zhangsan@campus.edu.cn` (张三, 2023001234) without authentication.
All API routes are publicly accessible.

## Code Generation Guidelines
- Navigation state managed in `Index.tsx` via `currentView: ViewType`
- All view components receive `onNavigate`, `onViewActivity`, `onRegister` callbacks
- Registration modal is inline in `Index.tsx`
- API calls use `apiService` from `frontend/src/lib/api.ts`
- Types defined in `frontend/src/types/index.ts`
- No authentication - all routes public
