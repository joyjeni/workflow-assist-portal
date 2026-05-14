import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Logo } from "@/components/Logo";
import { getSession } from "@/lib/auth";

export default async function LandingPage() {
  const session = await getSession();
  const user = session
    ? { name: session.name, email: session.email, role: session.role }
    : null;

  return (
    <div className="min-h-screen">
      <Navbar user={user} />

      <main>
        {/* Hero */}
        <section className="border-b border-border bg-surface">
          <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                <Logo size={14} /> Workflow demo · full-stack portfolio
              </div>
              <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
                A citizen-application workflow with operator review and a mock AI assistant.
              </h1>
              <p className="mt-4 text-muted max-w-2xl">
                A reference implementation of a government-style service workflow:
                citizens submit applications and upload supporting documents, a
                mock AI service produces risk and recommendation signals, and an
                operator reviews, approves, rejects, requests correction, or
                escalates — every action captured in an append-only audit trail.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/login" className="btn btn-primary">Login as Citizen</Link>
                <Link href="/admin/login" className="btn btn-secondary">Login as Admin</Link>
                <Link href="/register" className="btn btn-ghost">Create a citizen account</Link>
              </div>
              <p className="mt-3 text-xs text-faint">
                Demo credentials are listed in the README; pre-seeded in the database after running <code className="font-mono">npm run prisma:seed</code>.
              </p>
            </div>
            <div className="card p-5">
              <div className="text-xs uppercase tracking-wider text-muted">Sample queue snapshot</div>
              <ul className="mt-3 divide-y divide-border">
                {[
                  { ref: "WAP-2025-0002", cat: "Education Grant", st: "Under Review", risk: "MEDIUM" },
                  { ref: "WAP-2025-0003", cat: "Pension Enrollment", st: "Approved", risk: "LOW" },
                  { ref: "WAP-2025-0004", cat: "Business Permit", st: "Rejected", risk: "HIGH" },
                  { ref: "WAP-2025-0001", cat: "Housing Subsidy", st: "Draft", risk: "—" },
                ].map((r) => (
                  <li key={r.ref} className="py-2 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-mono text-xs text-muted">{r.ref}</div>
                      <div>{r.cat}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted">{r.st}</div>
                      <div className="text-xs">Risk: {r.risk}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Why */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-xl font-semibold">Why this project</h2>
          <p className="text-muted mt-2 max-w-3xl">
            Public-service and enterprise workflows share the same shape: a
            structured application with documents, machine-generated signals,
            human review, well-defined state transitions, notifications, and
            non-repudiable audit. This project demonstrates the application-layer
            engineering needed to build that shape end-to-end — the part of the
            stack that turns models and policies into a system citizens and
            operators can actually use.
          </p>
        </section>

        {/* Features */}
        <section className="bg-surface border-y border-border">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <h2 className="text-xl font-semibold">Features</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {FEATURES.map((f) => (
                <div key={f.title} className="card p-5">
                  <div className="font-medium">{f.title}</div>
                  <p className="text-sm text-muted mt-1">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Architecture */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-xl font-semibold">Architecture</h2>
          <p className="text-muted mt-2 max-w-3xl">
            Next.js App Router serves both UI and JSON APIs. Prisma ORM
            speaks to PostgreSQL. A mock AI service module returns deterministic
            risk and recommendation signals so the integration surface stays
            stable when a real model is swapped in. Authentication uses signed
            JWT cookies; role-based access is enforced server-side.
          </p>
          <div className="mt-6 grid lg:grid-cols-2 gap-4">
            <pre className="card p-4 text-xs leading-6 overflow-x-auto">
{`Citizen UI ──┐
              ├─► Next.js Route Handlers ──► Prisma ──► PostgreSQL
 Admin UI ───┘                            │
                                          ├─► Mock AI service (lib/mock-ai.ts)
                                          └─► Audit log (append-only)`}
            </pre>
            <div className="card p-4 text-sm">
              <div className="font-medium mb-2">Stack</div>
              <ul className="list-disc pl-5 text-muted space-y-1">
                <li>Next.js 14 (App Router) · TypeScript</li>
                <li>Tailwind CSS · React Hook Form · Zod</li>
                <li>Prisma ORM · PostgreSQL-ready schema</li>
                <li>Signed JWT cookie sessions (jose) · bcryptjs</li>
                <li>Jest · React Testing Library</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-surface border-t border-border">
          <div className="max-w-6xl mx-auto px-4 py-14 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-lg font-semibold">Try the workflow</div>
              <p className="text-muted">Sign in as a citizen to submit, or as an operator to review.</p>
            </div>
            <div className="flex gap-2">
              <Link href="/login" className="btn btn-primary">Citizen login</Link>
              <Link href="/admin/login" className="btn btn-secondary">Admin login</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-muted flex flex-wrap items-center justify-between gap-2">
          <div>© {new Date().getFullYear()} Workflow Assist Portal — portfolio demo.</div>
          <div>Mock AI service. Does not train or call any ML model.</div>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    title: "Citizen module",
    body: "Register, login, draft and submit applications, upload supporting documents, and track status with a clear timeline.",
  },
  {
    title: "Operator module",
    body: "Filterable queue, application detail view, citizen context, document list, AI recommendation, and structured decisions.",
  },
  {
    title: "Mock AI service",
    body: "Deterministic rule-based stand-in returns risk level, score, confidence, recommendation, and explanation signals.",
  },
  {
    title: "Audit trail",
    body: "Append-only log of creation, draft updates, submissions, AI checks, reviews, status changes, and AI overrides.",
  },
  {
    title: "Accessible by default",
    body: "Semantic HTML, labels, helper text, validation, keyboard focus states, mobile-first responsive layouts.",
  },
  {
    title: "PostgreSQL-ready schema",
    body: "Prisma models for users, applications, details, documents, AI assessments, admin reviews, audit logs, and notifications.",
  },
];
