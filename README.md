# Careerora

> The AI-powered career operating system. Sign up, get a starter resume and
> portfolio auto-seeded for you, then build everything else with real AI
> streaming.

Premium, dark-mode Next.js 15 + TypeScript + Tailwind + Framer Motion +
NextAuth v5 + Prisma + SQLite + Groq. **End-to-end functional** — real
sign-up, real database, real CRUD, real AI streaming.

## Quick start

```bash
# 1 — install dependencies (also runs prisma generate)
npm install

# 2 — create the SQLite database
npm run db:push

# 3 — start the dev server
npm run dev

# open
# http://localhost:3000          → landing page
# http://localhost:3000/sign-up  → create an account
```

Sign up with any email — no verification, fully local. The account is
seeded with a sample resume, portfolio, and LinkedIn profile so you have
something to play with immediately.

## What actually works

| Feature | Real / Mock |
| - | - |
| Email + password sign-up & sign-in | Real (NextAuth v5 credentials, bcrypt) |
| Google OAuth sign-in | **Optional** — enabled automatically when `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` are set |
| Session & route protection | Real (JWT, middleware) |
| Database persistence (SQLite) | Real (Prisma) |
| Resume CRUD + autosave + ATS scoring | Real |
| Portfolio CRUD + autosave + theme picker | Real |
| Case-study CRUD + 6-block editor | Real |
| LinkedIn profile (single per user) | Real |
| Settings (profile fields) | Real |
| AI chat assistant streaming | **Real Groq** if `GROQ_API_KEY` set, else local mock stream |
| AI inline rewrite (resume / bio / linkedin / case-study) | **Real Groq** if `GROQ_API_KEY` set, else local mock stream |
| Mock interview launcher | Real (sends seed prompt to chat) |
| Sign out / clear chat history | Real |

## Enabling Google sign-in (optional)

The "Continue with Google" button appears on the sign-in / sign-up pages
**only when both env vars are set** — no code changes needed.

1. Create OAuth credentials at <https://console.cloud.google.com/apis/credentials>
   - **Authorized JavaScript origins:** `http://localhost:3000`
   - **Authorized redirect URIs:** `http://localhost:3000/api/auth/callback/google`
2. Add to `.env`:
   ```bash
   GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="..."
   ```
3. Restart `npm run dev`.

On first Google sign-in, the user is upserted into the DB (password is
nullable for OAuth-only accounts) and the same starter resume / portfolio
/ LinkedIn profile is seeded automatically. Credentials sign-in continues
to work for users who registered with email + password.

For production, add your production URL to both the Google console
**and** as additional redirect URIs (e.g. `https://your-domain.com/api/auth/callback/google`).

## Wiring real AI (Groq)

The app works out of the box with deterministic mock streaming. To swap
in real LLM responses:

```bash
# Get a free key at https://console.groq.com
echo 'GROQ_API_KEY=gsk_...' >> .env
```

Restart the dev server. The chat assistant and every "AI rewrite" button
will now stream from `llama-3.3-70b-versatile`.

## Architecture

```
careerora/
├─ auth.ts                         # NextAuth v5 config (credentials, JWT)
├─ middleware.ts                   # protects /dashboard, redirects authed users away from /sign-in
├─ prisma/
│  └─ schema.prisma                # User, Resume, Portfolio, CaseStudy, LinkedinProfile, ChatMessage
├─ lib/
│  ├─ prisma.ts                    # singleton client
│  ├─ groq.ts                      # streamChat with Groq + mock fallback
│  ├─ api-helpers.ts               # requireUser / unauthorized / notFound
│  └─ sample-data.ts               # seed sample content on signup
├─ app/
│  ├─ (auth)/
│  │  ├─ sign-in/page.tsx          # credentials sign-in
│  │  └─ sign-up/page.tsx          # creates user, signs in, seeds content
│  ├─ api/
│  │  ├─ auth/[...nextauth]/route.ts
│  │  ├─ auth/register/route.ts    # bcrypt + zod
│  │  ├─ resumes/route.ts          # GET list, POST create
│  │  ├─ resumes/[id]/route.ts     # GET / PUT / DELETE
│  │  ├─ portfolios/route.ts       # + subdomain uniqueness
│  │  ├─ portfolios/[id]/route.ts
│  │  ├─ case-studies/route.ts
│  │  ├─ case-studies/[id]/route.ts
│  │  ├─ linkedin/route.ts         # GET / PUT (upsert)
│  │  ├─ profile/route.ts          # GET / PUT
│  │  ├─ ai/chat/route.ts          # streaming Groq, persists ChatMessages
│  │  └─ ai/generate/route.ts      # one-shot streaming (resume/bio/case-study/cover)
│  ├─ dashboard/
│  │  ├─ layout.tsx                # auth gate, loads user + counts
│  │  ├─ page.tsx                  # real stats, recent projects, dynamic AI suggestions
│  │  ├─ resumes/page.tsx          # list with thumbnails + ATS badge
│  │  ├─ resumes/[id]/page.tsx     # editor with autosave + AI rewrite
│  │  ├─ portfolios/page.tsx
│  │  ├─ portfolios/[id]/page.tsx  # device preview + 6 themes
│  │  ├─ case-studies/page.tsx
│  │  ├─ case-studies/[id]/page.tsx
│  │  ├─ linkedin/page.tsx
│  │  ├─ assistant/page.tsx        # streaming chat with DB history
│  │  ├─ templates/page.tsx
│  │  └─ settings/page.tsx
│  └─ page.tsx                     # marketing landing (11 sections)
├─ components/
│  ├─ providers.tsx                # SessionProvider wrapper
│  ├─ brand/logo.tsx
│  ├─ ui/                          # button, card, badge, section
│  ├─ landing/                     # 11 marketing sections
│  └─ dashboard/                   # sidebar, topbar, editors, delete buttons
├─ public/
│  ├─ icon.webp                    # favicon
│  ├─ careerora-icon.png           # brand mark
│  └─ careerora-logo.png           # wordmark
├─ .env                            # local development secrets (gitignored)
├─ .env.example                    # copy to .env
└─ package.json
```

## Database schema (Prisma)

```prisma
User           id, email (unique), password (bcrypt, nullable for OAuth), name,
               headline, location, website, phone, bio, plan, avatar
Resume         userId, name, template, data (JSON), atsScore
Portfolio      userId, name, theme, subdomain (unique), bio, data (JSON), published, views
CaseStudy      userId, title, role, problem, solution, techStack, metrics, timeline, results, published, views
LinkedinProfile userId (unique), headline, about, postIdeas (JSON)
ChatMessage    userId, role, content
```

Switch to Postgres/Neon by editing `prisma/schema.prisma` provider and
`DATABASE_URL`.

## Available scripts

```bash
npm run dev          # next dev
npm run build        # next build (validates types, prerenders)
npm run start        # next start
npm run db:push      # prisma db push (apply schema, no migrations)
npm run db:studio    # open Prisma Studio at http://localhost:5555
```

## Tech stack

| Layer | Stack |
| - | - |
| Framework | Next.js 15 (App Router, Server Components) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v3 |
| Animation | Framer Motion |
| Icons | Lucide |
| Auth | NextAuth v5 (Auth.js), JWT sessions |
| DB | SQLite + Prisma 6 |
| AI | Groq SDK (llama-3.3-70b-versatile) with mock fallback |
| Validation | Zod |

## License

MIT — fork it, ship it.
