# BETA Social — Agency Dashboard

## Project Overview
Single-file HTML/CSS/JS agency management dashboard for **BETA Social** (social media agency).
Working prototype at `portal/agency-dashboard.html`. Live at `https://souleric.github.io/BETA-Social-2/portal/agency-dashboard.html`.

**GitHub repo:** `git@github.com:Souleric/BETA-Social-2.git` (branch: `main`, GitHub Pages enabled)

---

## Design System
- **Background:** `#0d0f14` (page), `#13161e` (surface)
- **Fonts:** Playfair Display (headings) · DM Sans (body) · DM Mono (labels/badges)
- **Accents:** `#6c8fff` (blue) · `#34d399` (green) · `#f59e0b` (amber) · `#f87171` (red) · `#a78bfa` (purple)
- **CSS vars:** `--bg`, `--surface`, `--surface2`, `--surface3`, `--text`, `--text2`, `--text3`, `--border`, `--border2`, `--accent`, `--accent3` (green), `--accent4` (amber), `--accent5` (red)
- Reference existing HTML for all component styles — do not invent new patterns

---

## Architecture: Single-File HTML

All logic, styles, and markup live in one file. Key globals:

```js
let clients   = { key: { name, initials, am, posts, gradient, proposal, contractStart, contractEnd } }
let projects  = [ { id, clientId, name, type, startDate, endDate, status } ]
let contents  = [ { id, client, projectId, title, date, type, caption, artwork, status, ... } ]
let team      = [ { id, name, email, password, role, clients[] } ]
let currentMember = null   // set on login, cleared on logout
let currentRole   = 'admin'
let currentClient = null
let adText = '...'         // client portal ad banner text
```

### Persistence
```js
function saveData()  // saves contents, clients, projects, team, adText to localStorage
function loadData()  // loads all on page init
// Keys: betasocial_contents, betasocial_clients, betasocial_projects, betasocial_team, betasocial_adtext
```

---

## Roles & Access Control

| Role | switchRole() value | Access |
|------|--------------------|--------|
| `master_admin` | `'admin'` | Everything + Danger Zone + Edit Banner |
| `admin` | `'admin'` | Everything except Danger Zone and Edit Banner |
| `account_manager` | `'am'` | Assigned clients only |
| `designer` | `'designer'` | My Tasks view (pending-artwork items) |
| `client` | `'client'` | Assigned clients only, no calendar, auto-opens their client |

**Login:** matches `team` array by `email` or `name` + `password`. Uses `roleSwitchMap` to convert role → switchRole value.

**Client visibility:** `getVisibleClientKeys()` — returns all for admin/master_admin, filters by `member.clients[]` for others.

### Role-gated UI (set in switchRole):
- `#admin-only` nav — hidden unless admin
- `#designer-only` nav — hidden unless designer
- `#nav-calendar` — hidden for client
- `#danger-zone-section` — hidden unless master_admin
- `#edit-banner-btn` — hidden unless master_admin

---

## Content Status Flow
```
draft → pending-direction → pending-artwork → approved → scheduled → published
```

### Who does what:
| Step | Role | Action | Status change |
|------|------|--------|---------------|
| 1 | AM | Creates content | → `draft` |
| 2 | AM | Sends for review | `draft` → `pending-direction` |
| 3 | Client | Approves direction | → `pending-artwork` |
| 4 | Designer | Pastes Google Drive link | (status stays, artwork field set) |
| 5 | Client | Approves artwork | → `approved` |
| 6 | AM | Schedules | → `scheduled` |
| 7 | AM | Marks posted | → `published` |

### Action buttons per role (getApprovalBtns):
- **client:** direction approve/reject on `pending-direction`; artwork approve/reject on `pending-artwork` (with link)
- **designer:** Drive link input + Submit on `pending-artwork`
- **am/admin:** Send for Approval on `draft`; Schedule on `approved`; Mark as Posted on `scheduled`

---

## Project Types
```js
const projectTypes = {
  retainer:         { label:'Retainer',         icon:'📋', color:'#6c8fff', bg:'rgba(108,143,255,0.12)' },
  influencer:       { label:'Influencer',        icon:'⭐', color:'#a78bfa', bg:'...' },
  'offline-campaign':{ label:'Offline Campaign', icon:'📍', color:'#34d399', bg:'...' },
  'lead-ad':        { label:'Lead Ad',           icon:'🎯', color:'#f59e0b', bg:'...' },
  'link-ad':        { label:'Link Ad',           icon:'🔗', color:'#f87171', bg:'...' },
}
```

## Platform Types (content)
```js
const PLATFORM_COLORS = {
  'Instagram':            { bg, color:'#e1306c', border },
  'Facebook':             { bg, color:'#1877f2', border },
  'TikTok':               { bg, color:'#333',    border },
  'Instagram + Facebook': ...,
  'Instagram + TikTok':   ...,
  'Facebook + TikTok':    ...,
  'All Platforms':        { color:'#1a9e3f' },
}
```

---

## Key Render Functions

```js
renderDashboard()          // stats + client cards, scoped to getVisibleClientKeys()
renderClientsView()        // client grid, scoped to getVisibleClientKeys()
renderClientDetail()       // client header + projects + calendar
renderProjectsSection()    // project cards with embedded content lists + pipeline badges
renderProjectContent(id)   // content rows for a specific project
renderClientCalendar()     // project filter bar + calendar for current client
renderGlobalCalendar()     // client filter + project type legend + global calendar
renderTeamList()           // team table; shows/hides danger zone + edit banner per role
renderNotifications()      // dynamic, scoped to visible clients; replaces checkContractExpiry()
renderReportList()         // reporting stats + table, scoped to visible clients
renderDesignerTasks()      // pending-artwork items for designer role
```

### Calendar globals:
```js
let calendarDate = new Date(...)  // current month displayed
let visibleProjTypes = new Set()  // project type toggle state
let globalCalFilter = null        // array of client keys or null
```

---

## Client Ad Banner
- Thin sliding ticker (CSS marquee) shown **only to `client` role**, below topbar
- Text stored in `adText`, persisted to `betasocial_adtext`
- `updateAdTicker()` called in `switchRole()`
- Only `master_admin` can edit via Team & Roles → Edit Banner button

---

## Notifications (Dynamic)
`renderNotifications()` generates cards from live data:
1. Contract expiry warnings (visible clients only, within 30 days)
2. Pending direction/artwork alerts per visible client
3. Monthly reminders on 5th/20th/25th (admin/AM only)
Sidebar badge reflects urgent count.

---

## Key Instructions
- Always use `getVisibleClientKeys()` when filtering clients — never `Object.keys(clients)` directly in views
- `currentMember?.role === 'master_admin'` for master-admin-only features (not just `currentRole === 'admin'`)
- `saveData()` after every mutation; `renderDashboard() + renderClientsView()` after data changes
- Content "+ Add Content" lives inside project cards only (not in topbar or client header)
- Google Drive links open in new tab
- Commit and push after every meaningful change: `git add portal/agency-dashboard.html && git commit && git push origin main`
