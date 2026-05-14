# Task Tracker App - Test Checklist

## Application Status
✅ **Development Server**: Running on `http://localhost:3001`
✅ **Database**: SQLite initialized with schema migrations applied
✅ **Error Handling**: All fetch calls now have robust error handling for malformed responses

## Testing Instructions

### 1. Authentication Flow

#### Sign Up
- [ ] Navigate to http://localhost:3001
- [ ] Click "Sign Up" or go to `/auth/signup`
- [ ] Fill in: Email, Password, Name
- [ ] Click "Sign Up"
- [ ] Expected: Auto-redirect to `/dashboard`, user logged in
- [ ] Verify: User info displays in navbar

#### Login
- [ ] Navigate to `/auth/login`
- [ ] Enter invalid credentials
- [ ] Expected: Error message displays
- [ ] Enter valid credentials from signup
- [ ] Expected: Auto-redirect to `/dashboard`
- [ ] Verify: Navbar shows logged-in user

#### Session Persistence
- [ ] Refresh the page while logged in
- [ ] Expected: Session maintained, user still logged in
- [ ] Close browser tab, reopen http://localhost:3001
- [ ] Expected: Session should be maintained (30-day session)

### 2. Task Management

#### Create Task
- [ ] Click "Add Task" or open TaskForm
- [ ] Fill in: Title, Description (optional), Due Date, Priority
- [ ] Click "Create"
- [ ] Expected: Task appears in task list immediately
- [ ] Expected: Task appears on calendar if date is set

#### View Tasks
- [ ] Dashboard shows all user tasks
- [ ] Click "Active" tab: shows only incomplete tasks
- [ ] Click "Completed" tab: shows only completed tasks
- [ ] Click "All" tab: shows all tasks
- [ ] Verify: Task sort by due date (earliest first)

#### Complete Task
- [ ] Click checkbox on a task
- [ ] Expected: Task moves to "Completed" tab
- [ ] Click checkbox again
- [ ] Expected: Task returns to "Active" tab

#### Edit Task
- [ ] Click "Edit" on a task
- [ ] Change title, description, date, or priority
- [ ] Click "Save"
- [ ] Expected: Changes appear immediately
- [ ] Expected: Calendar updates if date changed

#### Delete Task
- [ ] Click "Delete" on a task
- [ ] Expected: Task removes from all views
- [ ] Expected: Removed from calendar if applicable

### 3. Calendar Integration

#### View Calendar
- [ ] Navigate to `/calendar`
- [ ] Calendar displays current month
- [ ] Tasks appear on their due dates with color coding:
  - Red: HIGH priority
  - Yellow: MEDIUM priority
  - Blue: LOW priority

#### Navigate Calendar
- [ ] Click previous/next month buttons
- [ ] Expected: Calendar updates and shows tasks for new month

#### Filter by Date
- [ ] Click on a date with tasks
- [ ] Expected: Tasks for that date display below calendar
- [ ] Click on a date without tasks
- [ ] Expected: No tasks display

### 4. Error Handling

#### Network Errors
- [ ] Open DevTools Network tab
- [ ] Try to create a task while offline
- [ ] Expected: Graceful error message, app doesn't crash

#### Invalid Input
- [ ] Try to create task with empty title
- [ ] Expected: Validation error message displays

#### Server Errors
- [ ] All API endpoints return JSON error responses
- [ ] No HTML error pages parsed as JSON
- [ ] App remains functional despite API errors

### 5. UI/UX

#### Responsive Design
- [ ] Test on desktop (full width)
- [ ] Test on tablet (resize browser)
- [ ] Test on mobile (use DevTools device emulation)
- [ ] Verify: Layout adjusts appropriately

#### Navigation
- [ ] Navbar accessible on all pages
- [ ] Logout button works
- [ ] Links navigate correctly
- [ ] Active page highlighted in navbar

#### Visual Design
- [ ] Color scheme consistent (Tailwind CSS)
- [ ] Text readable and properly sized
- [ ] Form inputs clearly labeled
- [ ] Buttons have clear visual feedback (hover state)

## Quick Start Testing

```bash
# If server is not running:
cd c:\Projects\tasktracker-app
npm run dev

# Open browser to http://localhost:3001
# Follow test checklist above
```

## Debugging

If you encounter any issues:

1. **Check browser console** (F12) for client-side errors
2. **Check terminal output** for server-side errors
3. **Check network tab** for failed API requests
4. **Check database** with Prisma Studio:
   ```bash
   npx prisma studio
   ```

## Known Limitations (Not Yet Implemented)

- ❌ Email notifications
- ❌ Recurring task automation
- ❌ Task sharing/collaboration
- ❌ Dark mode
- ❌ OAuth sign-in
- ❌ Task categories/tags
- ❌ Task search

These features can be added in future iterations.
