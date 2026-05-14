# Personal Task Management App - Setup & Run Instructions

## Prerequisites

Ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**/***pnpm**
- **Git** (optional, for cloning)

## Project Setup

### 1. Clone or Navigate to the Project

```bash
cd c:\Projects\tasktracker-app
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages including:
- Next.js 14 (React framework)
- Prisma (ORM for database)
- Tailwind CSS (styling)
- NextAuth (authentication)
- Zod (validation)
- bcryptjs (password hashing)

### 3. Set Up Database

The project uses SQLite for development. The database file is automatically created on first run.

If you need to reset the database:

```bash
# Delete the existing database
rm prisma/dev.db

# Run migrations to create fresh database
npx prisma migrate dev
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start on: **http://localhost:3000**

### Build for Production

```bash
npm run build
npm start
```

## Accessing the Application

1. Open your browser and navigate to: **http://localhost:3000**
2. You'll be redirected to the login page
3. Create a new account or log in with existing credentials

### Test Credentials

You can create a test account with any email and password (minimum 8 characters).

## Project Structure

```
tasktracker-app/
├── app/
│   ├── api/                    # Backend API routes
│   │   ├── auth/              # Authentication endpoints
│   │   │   ├── signup/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── session/route.ts
│   │   ├── tasks/             # Task CRUD endpoints
│   │   │   ├── route.ts       # GET all, POST create
│   │   │   └── [id]/route.ts  # GET, PATCH, DELETE, PATCH toggle
│   │   └── calendar/          # Calendar events
│   │       └── events/route.ts
│   ├── auth/                  # Auth pages
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/             # Main dashboard
│   │   └── page.tsx
│   ├── calendar/              # Calendar view
│   │   └── page.tsx
│   ├── components/            # Reusable React components
│   │   ├── Navbar.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskList.tsx
│   │   └── CalendarView.tsx
│   ├── context/              # React Context for state
│   │   ├── AuthContext.tsx
│   │   └── TaskContext.tsx
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home (redirects to /dashboard or /login)
│   └── globals.css           # Tailwind CSS
├── lib/                      # Utility functions
│   ├── prisma.ts            # Prisma client
│   ├── validation.ts        # Zod validation schemas
│   ├── auth-utils.ts        # Auth helper functions
│   └── utils.ts
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Database migrations
│   └── dev.db              # SQLite database (created on first run)
├── public/                  # Static assets
├── .env.local              # Environment variables
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## Environment Variables

The `.env.local` file contains:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_SECRET="dev-secret-change-in-production-to-random-string"
NEXTAUTH_URL="http://localhost:3000"

# App Configuration
NODE_ENV="development"
```

**For production**, generate a secure secret:
```bash
openssl rand -base64 32
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - Destroy session
- `GET /api/auth/session` - Get current session

### Tasks
- `GET /api/tasks` - List all user tasks (with pagination & filters)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/[id]` - Get specific task
- `PATCH /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task
- `PATCH /api/tasks/[id]/toggle` - Toggle completion status

### Calendar
- `GET /api/calendar/events?start=&end=` - Get tasks for date range

## Features

✅ **User Authentication**
- Email-based signup and login
- Secure password hashing (bcrypt)
- Session-based authentication with httpOnly cookies

✅ **Task Management**
- Create, read, update, delete tasks
- Task attributes: title, description, due date, priority, completion status
- Pagination for task lists
- Filter by completion status and priority
- Toggle task completion with checkbox

✅ **Calendar View**
- Monthly calendar display
- Tasks color-coded by priority
- Click dates to see detailed tasks
- Navigate between months
- "Today" button for quick navigation

✅ **UI/UX**
- Clean, modern interface with Tailwind CSS
- Responsive design (mobile, tablet, desktop)
- Clear visual hierarchy with priority colors
- Real-time task updates
- Minimal friction, few clicks to complete tasks

## Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Open Prisma Studio (database GUI)
npx prisma studio

# Create new database migration
npx prisma migrate dev --name migration_name
```

## Troubleshooting

### Port Already in Use
If port 3000 is in use, you can specify a different port:
```bash
npm run dev -- -p 3001
```

### Database Issues
Clear database and migrations:
```bash
rm -rf prisma/migrations
rm prisma/dev.db
npx prisma migrate dev --name init
```

### Session/Cookie Issues
Make sure `NEXTAUTH_SECRET` is set in `.env.local`

### Missing Dependencies
Reinstall all dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Notes

- Tasks are paginated (20 items per page)
- Database indexes on `userId`, `dueDate`, `completed` for fast queries
- Lazy-loaded components for optimal performance
- httpOnly cookies for secure session handling

## Security Considerations

1. **Passwords**: Hashed with bcryptjs (12 salt rounds)
2. **Sessions**: Secure httpOnly cookies with SameSite protection
3. **Database**: Prepared statements via Prisma (prevents SQL injection)
4. **CSRF**: NextAuth provides CSRF protection
5. **Input Validation**: All API inputs validated with Zod

## Next Steps & Future Enhancements

1. **Task Recurrence** - Support repeating daily/weekly/monthly tasks
2. **Task Sharing** - Share tasks with other users
3. **Notifications** - Email alerts for upcoming due dates
4. **Advanced Filtering** - Save custom views and filters
5. **Dark Mode** - Theme toggle
6. **Mobile App** - React Native version
7. **OAuth Integration** - Google, GitHub login
8. **Rich Text** - Markdown support in descriptions

## Support & Issues

For issues or questions:
1. Check the [Architecture Documentation](./ARCHITECTURE.md)
2. Review the [Next.js Documentation](https://nextjs.org/docs)
3. Check [Prisma Documentation](https://www.prisma.io/docs/)

## License

This project is open source and available under the MIT License.
