# Task Management App - System Architecture

## Overview

A modern, personal task management application with authentication, task organization, and calendar integration. Built for usability and aesthetics.

## Tech Stack

**Frontend:** Next.js 14+ (React) with TypeScript and Tailwind CSS
- Chosen for: Server-side rendering, built-in API routes, excellent TypeScript support, and great ecosystem
- Components: React hooks for state management, client/server components for optimization

**Backend:** Next.js API Routes + Prisma ORM
- Chosen for: Unified full-stack framework, reduced DevOps complexity, built-in middleware
- Database layer: Prisma for type-safe database access

**Database:** PostgreSQL (local SQLite for development)
- Chosen for: Robust ACID compliance, excellent JSON support, scalability
- Can migrate to remote PostgreSQL easily

**Authentication:** NextAuth.js v5
- Chosen for: Enterprise-grade security, session management, OAuth-ready

## System Architecture (Text Diagram)

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Browser)                    │
├─────────────────────────────────────────────────────────────┤
│  Next.js Frontend (TypeScript + React + Tailwind)            │
│  ├─ Pages: /login, /register, /dashboard, /calendar          │
│  ├─ Components: TaskForm, TaskList, CalendarView, Navbar     │
│  └─ State: React Context + Local Storage                     │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  NEXT.JS API LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  Routes: /api/auth/, /api/tasks, /api/calendar              │
│  ├─ Authentication middleware (NextAuth)                    │
│  ├─ Request validation & error handling                     │
│  └─ Prisma ORM integration                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │ SQL Queries
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL / SQLite                                        │
│  Tables: users, tasks, sessions                             │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### Users Table
```
users
├── id (String, UUID primary key)
├── email (String, unique)
├── name (String)
├── password (String, hashed with bcrypt)
├── createdAt (DateTime)
├── updatedAt (DateTime)
└── tasks (One-to-many relation to tasks)
```

### Tasks Table
```
tasks
├── id (String, UUID primary key)
├── userId (String, foreign key → users.id)
├── title (String)
├── description (String, optional)
├── dueDate (DateTime, optional)
├── priority (Enum: LOW, MEDIUM, HIGH)
├── completed (Boolean, default: false)
├── recurring (Enum: NONE, DAILY, WEEKLY, MONTHLY, optional)
├── recurrenceEndDate (DateTime, optional)
├── createdAt (DateTime)
├── updatedAt (DateTime)
└── user (Many-to-one relation to users)
```

### Sessions Table (for NextAuth)
```
sessions
├── id (String, primary key)
├── sessionToken (String, unique)
├── userId (String, foreign key → users.id)
├── expires (DateTime)
└── user (Many-to-one relation to users)
```

## Authentication Flow

1. **Signup**
   - User submits email, password, name
   - Password hashed with bcrypt
   - User created in database
   - Auto-login via NextAuth session

2. **Login**
   - User submits email, password
   - Validated against hashed password
   - NextAuth creates secure session
   - Session cookie stored client-side (httpOnly)

3. **Password Reset** (Future enhancement)
   - Email validation link sent
   - Token expires in 1 hour
   - User sets new password

## API Design

### Authentication Routes
```
POST   /api/auth/signup       → Register new user
POST   /api/auth/login        → Authenticate user
POST   /api/auth/logout       → Destroy session
GET    /api/auth/session      → Get current session
```

### Task Routes
```
GET    /api/tasks             → List all user tasks (with filters)
POST   /api/tasks             → Create new task
GET    /api/tasks/[id]        → Get specific task
PATCH  /api/tasks/[id]        → Update task
DELETE /api/tasks/[id]        → Delete task
PATCH  /api/tasks/[id]/toggle → Toggle completion status
```

### Calendar Routes
```
GET    /api/calendar/events?start=&end= → Get tasks for date range
GET    /api/calendar/month?date=         → Get month view data
```

## State Management

- **Client State:** React Context + useReducer for global task state
- **Session State:** NextAuth sessions (secure, server-validated)
- **Persistent State:** Browser localStorage for UI preferences (theme, view mode)
- **Server State:** Prisma queries fetch fresh data when needed

## Security Considerations

1. **Password Security:** bcryptjs with salt rounds = 12
2. **Session Management:** httpOnly cookies, CSRF protection via NextAuth
3. **API Protection:** Route handlers check session; return 401 if unauthorized
4. **Input Validation:** Zod schemas for request data
5. **CORS:** Not needed (same-origin) but can add if building separate API
6. **Database:** Prepared statements via Prisma (prevents SQL injection)

## Performance Optimizations

1. **Database:** Indexes on userId, dueDate, completed status
2. **API:** Pagination for task lists (default 20 items)
3. **Frontend:** Image optimization, code splitting, lazy loading components
4. **Caching:** SWR or React Query for efficient data fetching (future)

## File Structure

```
tasktracker-app/
├── app/
│   ├── layout.tsx            # Root layout with providers
│   ├── page.tsx              # Home / redirect to dashboard
│   ├── (auth)/               # Auth pages layout group
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (dashboard)/          # Protected dashboard layout group
│   │   ├── layout.tsx        # Sidebar, navbar
│   │   ├── dashboard/page.tsx
│   │   ├── calendar/page.tsx
│   │   └── settings/page.tsx
│   └── api/
│       ├── auth/
│       │   ├── signup/route.ts
│       │   ├── login/route.ts
│       │   └── logout/route.ts
│       └── tasks/
│           ├── route.ts      # GET all, POST create
│           └── [id]/route.ts # GET, PATCH, DELETE
├── components/
│   ├── TaskForm.tsx
│   ├── TaskList.tsx
│   ├── TaskCard.tsx
│   ├── CalendarView.tsx
│   ├── Navbar.tsx
│   └── Sidebar.tsx
├── lib/
│   ├── prisma.ts            # Prisma client singleton
│   ├── auth.ts              # NextAuth configuration
│   ├── validation.ts        # Zod schemas
│   └── utils.ts             # Helper functions
├── prisma/
│   └── schema.prisma        # Database schema
├── public/                  # Static assets
└── .env.local              # Environment variables
```

## Running the Project

See [LOCAL_SETUP.md](./LOCAL_SETUP.md) for detailed setup instructions.

Quick start:
```bash
npm install
npx prisma migrate dev
npm run dev
```

Visit `http://localhost:3000`

## Future Enhancements

1. Task recurrence with proper date handling
2. Task sharing and collaboration
3. Email notifications for due dates
4. Advanced filters and saved views
5. Dark mode theme
6. Mobile app (React Native)
7. OAuth integration (Google, GitHub)
8. Task priorities and smart sorting
