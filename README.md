# TaskTracker - Personal Task Management App

A modern, intuitive task management application designed for personal productivity. Create, organize, and track your daily tasks with ease using a clean, aesthetic interface.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-Active-brightgreen)

## 🎯 Features

### Core Task Management
- ✅ **Create Tasks** - Add tasks with title, description, due date, and priority
- ✅ **Complete & Track** - Mark tasks as complete with visual feedback
- ✅ **Edit & Delete** - Modify or remove tasks easily
- ✅ **Priority Levels** - Organize by Low, Medium, High priority
- ✅ **Recurring Tasks** - Set tasks to repeat daily, weekly, or monthly (ready for implementation)

### User Authentication
- ✅ **Email Signup** - Create account with email and password
- ✅ **Secure Login** - Password hashing with bcryptjs
- ✅ **Session Management** - Secure httpOnly cookies
- ✅ **Auto-logout** - Sessions expire after 30 days

### Calendar Integration
- ✅ **Monthly View** - See all tasks on a calendar
- ✅ **Date Selection** - Click dates to view tasks
- ✅ **Color Coding** - Tasks highlighted by priority
- ✅ **Navigation** - Switch between months easily

### User Experience
- ✅ **Responsive Design** - Works on desktop, tablet, mobile
- ✅ **Clean Interface** - Modern Tailwind CSS styling
- ✅ **Real-time Updates** - Instant task changes
- ✅ **Minimal Friction** - Few clicks to complete tasks
- ✅ **Visual Feedback** - Clear status indicators for completed tasks

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes |
| **Database** | SQLite (development), PostgreSQL (production-ready) |
| **ORM** | Prisma |
| **Authentication** | Custom + NextAuth-ready architecture |
| **Validation** | Zod |
| **State Management** | React Context |
| **Password Hashing** | bcryptjs |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd tasktracker-app

# Install dependencies
npm install

# Set up database
npx prisma migrate dev

# Start development server
npm run dev
```

Visit **http://localhost:3000** in your browser.

## 📖 Documentation

- **[Architecture Guide](./ARCHITECTURE.md)** - System design, database schema, API design
- **[Setup Instructions](./LOCAL_SETUP.md)** - Detailed setup and troubleshooting
- **[API Reference](./ARCHITECTURE.md#api-design)** - Endpoint documentation

## 📁 Project Structure

```
tasktracker-app/
├── app/
│   ├── api/                    # Backend API routes
│   ├── auth/                  # Login/Signup pages
│   ├── dashboard/             # Main task dashboard
│   ├── calendar/              # Calendar view
│   ├── components/            # Reusable components
│   ├── context/              # React Context (Auth, Tasks)
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Tailwind CSS
├── lib/                      # Utilities & helpers
│   ├── prisma.ts            # Database client
│   ├── validation.ts        # Zod schemas
│   ├── auth-utils.ts        # Auth helpers
│   └── utils.ts
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # DB migrations
├── public/                  # Static assets
├── ARCHITECTURE.md          # System architecture
├── LOCAL_SETUP.md          # Setup guide
└── package.json
```

## 🔑 Key Pages & Routes

### Public Routes
- `/login` - User login
- `/signup` - Create new account

### Protected Routes (require authentication)
- `/dashboard` - Main task management dashboard
- `/calendar` - Calendar view with tasks

### API Routes
- `/api/auth/*` - Authentication endpoints
- `/api/tasks/*` - Task CRUD operations
- `/api/calendar/*` - Calendar events

## 💾 Database Schema

### Users Table
- **id**: Unique identifier
- **email**: User email (unique)
- **name**: User full name
- **password**: Hashed password
- **createdAt/updatedAt**: Timestamps

### Tasks Table
- **id**: Unique identifier
- **userId**: Reference to user
- **title**: Task title
- **description**: Task details
- **dueDate**: When task is due
- **priority**: LOW | MEDIUM | HIGH
- **completed**: Completion status
- **recurring**: NONE | DAILY | WEEKLY | MONTHLY
- **recurrenceEndDate**: When recurrence stops

### Sessions Table
- **id**: Session identifier
- **sessionToken**: Secure token
- **userId**: Reference to user
- **expires**: Session expiration time

## 🔐 Security Features

✅ **Password Security**
- bcryptjs hashing with 12 salt rounds
- No plaintext passwords stored

✅ **Session Management**
- httpOnly cookies (cannot be accessed via JavaScript)
- SameSite protection against CSRF
- 30-day session expiration

✅ **API Protection**
- Route-level authentication checks
- 401 Unauthorized for invalid sessions
- Input validation with Zod schemas

✅ **Database**
- Prepared statements via Prisma (SQL injection prevention)
- Database indexes for performance
- Cascading deletes for data integrity

## 📊 Performance Optimizations

- ⚡ Task list pagination (20 items per page)
- ⚡ Database indexes on frequently queried columns
- ⚡ Lazy-loaded React components
- ⚡ Server-side rendering with Next.js
- ⚡ Optimized images and assets

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start dev server on :3000
npm run build           # Create production build
npm start              # Start production server

# Database
npx prisma studio     # Open database GUI
npx prisma migrate dev --name <name>  # Create migration
npx prisma generate   # Generate Prisma client

# Quality
npm run lint           # Run ESLint
npm run type-check    # Check TypeScript
```

## 🔄 State Management

### Authentication (AuthContext)
- Current user
- Login/signup/logout functions
- Session refresh

### Tasks (TaskContext)
- List of user tasks
- CRUD operations
- Real-time updates

## 🌐 API Examples

### Create Task
```bash
POST /api/tasks
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "dueDate": "2026-01-20T10:00:00Z",
  "priority": "MEDIUM"
}
```

### Get Tasks
```bash
GET /api/tasks?completed=false&priority=HIGH
```

### Toggle Task
```bash
PATCH /api/tasks/[taskId]/toggle
```

## 📱 Responsive Design

- **Desktop** (1024px+): Full layout with sidebar
- **Tablet** (768px-1023px): Optimized grid layout
- **Mobile** (< 768px): Single column, touch-friendly buttons

## 🚦 Development Workflow

1. Create feature branch
2. Make changes
3. Test locally with `npm run dev`
4. Lint code with `npm run lint`
5. Build with `npm run build` to check for errors
6. Commit and push

## 📝 Environment Configuration

Create `.env.local`:
```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

## 🔮 Future Enhancements

- **Recurring Tasks** - Implement task recurrence logic
- **Subtasks** - Break down tasks into subtasks
- **Task Sharing** - Share tasks with other users
- **Notifications** - Email/push reminders for due dates
- **Advanced Search** - Search and filter tasks
- **Dark Mode** - Theme switcher
- **Mobile App** - React Native version
- **Export** - Download tasks as PDF/CSV
- **Integrations** - Google Calendar, Slack, etc.

## 🐛 Known Limitations

- SQLite is suitable for development only; use PostgreSQL for production
- No task sharing/collaboration in v1.0
- Email notifications not implemented yet
- Recurring task execution not automated

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👤 Author

Built as a personal productivity tool with modern web technologies.

## 🙋 Support

- Check [LOCAL_SETUP.md](./LOCAL_SETUP.md) for setup issues
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for design details
- Open an issue for bug reports

---

**Made with ❤️ for personal productivity**
