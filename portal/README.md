# BETA Social — Agency Dashboard

A full-stack agency content management dashboard built with Next.js + Supabase.

## Quick Start with Claude Code

### 1. Install Claude Code (one time)
```bash
npm install -g @anthropic-ai/claude-code
```

### 2. Open this folder in your terminal
```bash
cd beta-social
claude
```

### 3. Log in when prompted
Use your Claude.ai Pro/Max account or Anthropic Console account.

### 4. Follow the build steps
Once Claude Code starts, paste the prompts from **PROMPTS.md** one step at a time.

Start with Step 1:
> "I have a working agency dashboard prototype in agency-dashboard.html. I want to convert it into a production Next.js 14 app with Supabase. Please run npx create-next-app..."

---

## What's in this folder

| File | Purpose |
|------|---------|
| `agency-dashboard.html` | Complete working prototype — Claude Code's reference |
| `BETA_Social_Logo.png` | Brand logo |
| `CLAUDE.md` | Project memory — Claude Code reads this every session |
| `PROMPTS.md` | Step-by-step build prompts to paste into Claude Code |
| `README.md` | This file |

## Tech Stack
- **Next.js 14** (App Router)
- **Supabase** (database + auth)
- **Tailwind CSS**
- **TypeScript**
- **Vercel** (deployment)

## Roles
- `master_admin` — full access
- `account_manager` — manages assigned clients
- `client` — view & approve own content only

## Support
If Claude Code gets stuck on a step, just type:
> "Something went wrong. Review what we've built so far and continue from where we left off."
