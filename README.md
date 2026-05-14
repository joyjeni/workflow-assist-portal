# Workflow Assist Portal

A full-stack reference implementation of a citizen-application workflow with operator review and an integrated **mock** AI assistant. Built to demonstrate application-layer engineering — not ML training.

> Citizens submit applications and documents, a deterministic mock AI service produces risk and recommendation signals, an operator reviews each application with approve / reject / request-correction / escalate actions (with mandatory override reasons), and every meaningful event is captured in an append-only audit trail.

---

## Why this demonstrates full-stack workflow engineering

Public-service and enterprise workflows share the same engineering shape:

- A structured application bound to a citizen identity
- Documents, validations, and eligibility signals
- Machine-generated recommendations integrated into a queue
- Human review with non-repudiable decisions
- Strict state transitions (`DRAFT → SUBMITTED → AI_REVIEW → UNDER_REVIEW → APPROVED/REJECTED/...`)
- Notifications and a full audit log

This project implements all of the above end-to-end: schema, API routes, role-based access, multi-step forms, accessible UI, and tests. The AI is intentionally a mock — the value here is the integration surface around it.

---

## Tech stack

- **Next.js 14 (App Router)** · TypeScript
- **Tailwind CSS** · custom design tokens (light + dark CSS variables)
- **Prisma ORM** with a **PostgreSQL**-ready schema
- **React Hook Form + Zod** for validated, accessible forms
- **jose** (signed JWT cookies) + **bcryptjs** for credentials auth
- **Jest + React Testing Library** for unit and component tests

---

## Features

### Public landing
- Hero, project explanation, why workflow engineering matters
- Feature overview, architecture diagram, demo credentials

### Citizen module
- Register, login, dashboard
- Multi-step new-application wizard (RHF + Zod, three steps)
- Save draft, edit draft, submit
- Document uploads (metadata persisted; binary stored as demo key)
- View AI assessment status, recommendation, and explanation signals
- Status tracking with full audit timeline

### Admin / operator module
- Admin login, overview dashboard, filterable queue (status / risk / date range)
- Application detail view with applicant context and documents
- AI recommendation panel
- Decision panel: approve, reject, request correction, escalate
- AI override: detected automatically when the admin's decision diverges from AI; requires a written reason (≥10 chars) before submit
- System-wide audit log view

### Mock AI service (`lib/mock-ai.ts`)
- Deterministic, rule-based stand-in
- Returns `riskLevel`, `riskScore`, `confidenceScore`, `recommendation` (`APPROVE | MANUAL_REVIEW | REQUEST_CORRECTION`), `explanationSummary[]`, `modelVersion`, `status`
- Persisted to the `AIAssessment` table

### Audit trail
Append-only `AuditLog` capturing: application created, draft updated, document uploaded, application submitted, AI check triggered/completed, admin reviewed, status changed, AI override used, notifications sent. Every entry stores actor, role, action, old/new status, metadata, timestamp.

---

## Architecture

```
Citizen UI ──┐
              ├─► Next.js Route Handlers ──► Prisma ──► PostgreSQL
 Admin UI ───┘                            │
                                          ├─► Mock AI service (lib/mock-ai.ts)
                                          └─► Audit log (append-only)
```

- Server-side route handlers do all data access. The browser never talks to Prisma directly.
- Auth: signed JWT cookie (HS256, `jose`). Sessions are role-aware; `requireUser("ADMIN")` / `requireUser("CITIZEN")` is enforced inside every protected route.
- AI integration is fully decoupled: replace `runAssessment` in `lib/mock-ai.ts` with a real model call and nothing else changes.

---

## Database schema summary

| Model              | Purpose                                                                                   |
| ------------------ | ----------------------------------------------------------------------------------------- |
| `User`             | Citizens and admins; bcrypt password hash, role enum                                       |
| `Application`      | Reference code, applicant, category, title, status enum, submission time                  |
| `ApplicationDetails` | Structured form data: identity, address, income, household, reason                       |
| `Document`         | Filename, mime, size, category, storage key (metadata only in the demo)                    |
| `AIAssessment`     | Model version, status, risk level/score, confidence, recommendation, explanation, raw signals |
| `AdminReview`      | Decision, notes, AI-override flag and reason                                              |
| `AuditLog`         | Append-only history of every meaningful action                                            |
| `Notification`     | Per-user, per-application messages                                                        |

Enums: `Role`, `ApplicationStatus`, `RiskLevel`, `AIRecommendation`, `AIStatus`, `DecisionType`, `AuditAction`.

See `prisma/schema.prisma` for the full source of truth.

---

## API routes

| Route                                       | Method | Auth      | Purpose                                |
| ------------------------------------------- | ------ | --------- | -------------------------------------- |
| `/api/auth/register`                        | POST   | public    | Create citizen account, sign in       |
| `/api/auth/login`                           | POST   | public    | Email + password login                |
| `/api/auth/logout`                          | POST   | any       | Clear session cookie                  |
| `/api/applications`                         | GET    | citizen   | List my applications                  |
| `/api/applications`                         | POST   | citizen   | Create application (draft or submit)  |
| `/api/applications/[id]`                    | GET    | owner/admin | Application detail                   |
| `/api/applications/[id]`                    | PATCH  | citizen   | Update draft                          |
| `/api/applications/[id]/submit`             | POST   | citizen   | Submit a draft                        |
| `/api/applications/[id]/documents`          | GET    | owner/admin | List documents                       |
| `/api/applications/[id]/documents`          | POST   | citizen   | Add document metadata                 |
| `/api/applications/[id]/ai-check`           | POST   | owner/admin | Run mock AI assessment               |
| `/api/applications/[id]/audit`              | GET    | owner/admin | Application audit log                |
| `/api/admin/applications`                   | GET    | admin     | Filtered application queue            |
| `/api/admin/applications/[id]/review`       | POST   | admin     | Record review decision                |
| `/api/admin/metrics`                        | GET    | admin     | Queue counts and risk distribution    |
| `/api/audit`                                | GET    | admin     | System-wide audit log                 |

---

## Local setup

1. **Prerequisites:** Node 18+ and a Postgres database (local Postgres, Docker, Neon, Supabase, or Vercel Postgres).
2. Clone and install:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env.local` and fill in `DATABASE_URL` and `AUTH_SECRET`:

   ```bash
   cp .env.example .env.local
   ```

4. Apply the Prisma schema and seed demo data:

   ```bash
   npm run prisma:migrate    # first time only — creates the schema
   npm run prisma:seed       # loads admin + 2 citizens + 4 applications
   ```

5. Run the dev server:

   ```bash
   npm run dev
   ```

   Open `http://localhost:3000`.

---

## Environment variables

| Var                 | Required | Description                                                          |
| ------------------- | -------- | -------------------------------------------------------------------- |
| `DATABASE_URL`      | yes      | PostgreSQL connection string                                          |
| `AUTH_SECRET`       | yes      | Long random string used to sign session JWTs (≥32 chars)              |
| `NEXT_PUBLIC_APP_URL` | no     | Base URL — used by the logout redirect. Defaults to `http://localhost:3000` |

---

## Demo credentials (after seeding)

| Role     | Email                      | Password    |
| -------- | -------------------------- | ----------- |
| Admin    | `admin@portal.local`       | `Demo@1234` |
| Citizen  | `citizen1@portal.local`    | `Demo@1234` |
| Citizen  | `citizen2@portal.local`    | `Demo@1234` |

---

## Testing

```bash
npm test
```

Includes:

- Form validation rules (login, register, full application, review decision)
- Mock AI service shape, determinism, and risk-with-vs-without-documents behaviour
- StatusBadge / RiskBadge rendering
- LoginForm — empty-state validation messages and submit path
- Auth — session token sign + verify round trip
- Authorization — admin review override-reason rule and decision enum

---

## Scripts

```bash
npm run dev               # next dev
npm run build             # next build
npm run start             # next start
npm run lint              # next lint
npm run typecheck         # tsc --noEmit
npm test                  # jest
npm run prisma:generate   # regenerate Prisma client
npm run prisma:migrate    # create/update database schema
npm run prisma:seed       # load demo data
```

---

## Deploying

### GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### Vercel

1. Import the repository into Vercel.
2. Add environment variables: `DATABASE_URL`, `AUTH_SECRET`.
3. Recommended: use **Vercel Postgres**, **Neon**, or **Supabase** for the database.
4. After the first deploy, run a one-off migration (locally pointing `DATABASE_URL` to the prod database):

   ```bash
   npx prisma migrate deploy
   npx prisma db seed   # optional, demo data
   ```

The build command is `npm run build` (default). No additional configuration is required.

---

## Accessibility notes

- Every input has an associated `<label>`. Helper text and error messages are linked via `aria-describedby`.
- Validation messages are surfaced with `role="alert"`.
- Status badges include accessible labels (`aria-label`) and pair color with icon and text.
- The application form is split into three short, keyboard-navigable steps with a visible stepper (`aria-current="step"`).
- The audit timeline is a semantic `<ol>` with each event date and actor read out by screen readers.
- Light theme by default, with dark CSS variables ready (`.dark` class toggle is a single-line addition where desired).

---

## A note on the AI

`lib/mock-ai.ts` is a **deterministic, rule-based stand-in**. It does not train, fine-tune, call, or proxy any ML model. The point is to demonstrate the application-layer integration: when to trigger an AI check, how to persist its result, how to surface it in the UI, and how to handle override workflows.

Swapping in a real model would mean changing `runAssessment(input): MockAIResult` — every other layer (schema, API, UI, audit) is already shaped to accept the same result envelope.

---

## Project structure

```
app/                  Next.js App Router pages and API routes
  (auth)/             Login, register, admin login (route group)
  dashboard/          Citizen pages (layout, list, detail, status, new)
  admin/              Operator pages (overview, queue, detail, audit)
  api/                Route handlers — auth, applications, documents, AI, admin
  globals.css         Tokens + base styles
  layout.tsx          Root layout
components/           Reusable UI: Navbar, Sidebar, AppShell, DataTable,
                      FilterBar, FileUpload, StepperForm, StatusBadge,
                      MetricCard, AIRecommendationPanel, AuditTimeline,
                      EmptyState/ErrorState/LoadingSkeleton, ConfirmationDialog,
                      forms/{LoginForm,RegisterForm,NewApplicationWizard}
lib/                  db (Prisma singleton), auth (JWT + cookies),
                      validators (Zod), mock-ai, audit, types, utils
prisma/               schema.prisma, seed.ts
tests/                Jest + RTL tests
public/               Static assets
```
