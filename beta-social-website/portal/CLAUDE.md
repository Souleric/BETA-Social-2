# BETA Social — Agency Dashboard

## Project Overview
This is a social media agency management dashboard for **BETA Social**.
The starting point is `agency-dashboard.html` — a complete, working single-file prototype.
The goal is to convert it into a full-stack production web application.

## Tech Stack (Target)
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (role-based: master_admin, account_manager, client)
- **Deployment**: Vercel

## Roles
- **master_admin** — full access, team management, all clients
- **account_manager** — manages assigned clients, creates/edits content
- **client** — view own content, approve direction & artwork only

## Core Features
1. **Client Management** — agreed post count per client, Google Drive proposal link
2. **Content Calendar** — calendar view + list view, synced; per-client and global
3. **Content Items** — caption, post date, type, Google Drive artwork link, status
4. **Approval Workflow** — Direction Approval → Artwork Approval → Schedule
5. **Notifications** — 5th (plan), 20th (schedule), 25th (reporting) monthly reminders
6. **Reporting** — per-client stats, downloadable PDF reports

## Content Status Flow
draft → pending-direction → pending-artwork → approved → scheduled → published

## Database Tables Needed
- profiles (id, name, email, role, avatar_url)
- clients (id, name, initials, color, account_manager_id, agreed_posts, proposal_url, status)
- client_users (client_id, user_id) — which clients a user can access
- content_items (id, client_id, title, date, type, caption, artwork_url, status, direction_approved, artwork_approved)
- notifications (id, user_id, type, message, read, created_at)

## Design
- Dark theme: background #0d0f14, surface #13161e
- Fonts: Playfair Display (headings) + DM Sans (body) + DM Mono (labels)
- Accent: #6c8fff (blue), #34d399 (green), #f59e0b (amber), #f87171 (red)
- Reference the existing HTML file for all component styles

## File Structure (Target)
```
beta-social/
├── CLAUDE.md                   ← this file
├── agency-dashboard.html       ← original prototype (reference only)
├── BETA_Social_Logo.png        ← brand logo
├── app/
│   ├── layout.tsx
│   ├── page.tsx                ← redirect to /dashboard
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx          ← sidebar + topbar shell
│   │   ├── dashboard/page.tsx
│   │   ├── clients/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── calendar/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── reporting/page.tsx
│   │   └── admin/
│   │       └── team/page.tsx
│   └── api/
│       ├── clients/route.ts
│       ├── content/route.ts
│       └── notifications/route.ts
├── components/
│   ├── Sidebar.tsx
│   ├── Topbar.tsx
│   ├── Calendar.tsx
│   ├── ContentList.tsx
│   ├── ContentRow.tsx
│   └── modals/
├── lib/
│   ├── supabase.ts
│   └── types.ts
└── public/
    └── logo.png
```

## Key Instructions for Claude Code
- Always maintain the dark theme and existing design from the HTML prototype
- Use the existing color variables and font choices
- Keep the approval workflow logic intact
- Role-based access must be enforced both on frontend and API routes
- Google Drive links should open in a new tab
- Monthly notifications should be triggered based on current date (5th, 20th, 25th)
- When in doubt, reference agency-dashboard.html for UI patterns
