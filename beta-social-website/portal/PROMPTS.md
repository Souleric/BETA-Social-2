# BETA Social — Claude Code Kick-off Prompts

Use these prompts in order when starting Claude Code in this project folder.

---

## STEP 1 — Scaffold the Next.js app

```
I have a working agency dashboard prototype in agency-dashboard.html.
I want to convert it into a production Next.js 14 app with Supabase.

Please:
1. Run: npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
2. Install dependencies: npm install @supabase/supabase-js @supabase/ssr lucide-react
3. Create the full folder structure defined in CLAUDE.md
4. Create lib/types.ts with all TypeScript types for the database tables in CLAUDE.md
5. Create lib/supabase.ts with browser and server Supabase client setup

Don't touch the HTML prototype file — keep it as reference.
```

---

## STEP 2 — Set up Supabase database

```
Create the Supabase database schema.

Please create a file called supabase/schema.sql with:
- All tables from CLAUDE.md (profiles, clients, client_users, content_items, notifications)
- Row Level Security (RLS) policies:
  - master_admin can see everything
  - account_manager can only see their assigned clients
  - client role can only see their own client's content
- Seed data matching the sample clients and content from agency-dashboard.html (Luxe Skincare, Nova Tech, Brew & Co, Zenith Fitness, Urban Roots)

Also create supabase/seed.sql with realistic sample data.
```

---

## STEP 3 — Build auth (login page)

```
Create the login page at app/(auth)/login/page.tsx.

Requirements:
- Match the dark theme from agency-dashboard.html (bg: #0d0f14, surface: #13161e)
- Show the BETA Social logo (public/logo.png) centered at top
- Email + password form
- Use Supabase Auth
- On success, redirect to /dashboard
- Show role indicator after login based on user's profile.role
- No registration — admin creates users manually
```

---

## STEP 4 — Build the app shell (sidebar + topbar)

```
Create the main app layout at app/(app)/layout.tsx with:
- Sidebar (240px fixed) matching agency-dashboard.html exactly:
  - BETA Social logo at top
  - Navigation: Overview, Clients, Content Calendar, Reporting, Notifications (with badge), Admin/Team (master_admin only)
  - User card at bottom showing name and role
- Topbar (60px sticky) with page title and "+ New Content" button
- Role-based nav hiding (clients can't see admin section)
- Active nav highlighting

Create components/Sidebar.tsx and components/Topbar.tsx as separate components.
```

---

## STEP 5 — Dashboard overview page

```
Build app/(app)/dashboard/page.tsx:
- 4 stat cards: Active Clients, Contents This Month, Awaiting Approval, Scheduled Posts
- Data fetched from Supabase
- Monthly reminder banner (appears on 5th, 20th, 25th of month)
- Client cards grid showing top clients with progress bars
- Match the design from agency-dashboard.html exactly
```

---

## STEP 6 — Clients list + client detail

```
Build:
1. app/(app)/clients/page.tsx — grid of all clients (filtered by role)
2. app/(app)/clients/[id]/page.tsx — client detail with:
   - Client info header with proposal Google Drive link
   - Approval workflow progress indicator (Proposal → Direction → Artwork → Schedule)
   - Content calendar (month view)
   - Content list below calendar, both synced (clicking calendar event highlights list row)
   - Each content row expands to show: caption, post date, type, artwork Google Drive link
   - Approval buttons based on role (client sees approve/reject, AM sees edit/schedule)

Reference agency-dashboard.html for the exact layout.
```

---

## STEP 7 — Notifications

```
Build app/(app)/notifications/page.tsx:
- List of notifications from Supabase
- Auto-generate monthly reminders based on current date:
  - Day 5: "Plan next month's content"
  - Day 20: "Schedule next month's posts"
  - Day 25: "Prepare reporting"
- Unread badge count in sidebar
- Mark as read functionality
- Urgency levels (info, warning, urgent)
```

---

## STEP 8 — Reporting

```
Build app/(app)/reporting/page.tsx:
- Month selector dropdown
- Summary stat cards (total posts, approval rates, avg approval time)
- Per-client breakdown table
- "Download Report" button that generates a PDF using jsPDF or react-pdf
- Data fetched from Supabase
```

---

## STEP 9 — Admin: Team & Roles

```
Build app/(app)/admin/team/page.tsx (master_admin only):
- List all users with name, email, role, assigned clients
- "Add Member" modal — create user with role and client assignments
- Edit role / remove user
- Protected route — redirect non-admins to /dashboard
```

---

## STEP 10 — Deploy to Vercel

```
Prepare for deployment:
1. Create .env.local.example with all required env vars
2. Create vercel.json if needed
3. Check all environment variables are properly configured
4. Run: npm run build and fix any errors
5. Give me the exact steps to deploy to Vercel and connect Supabase
```
