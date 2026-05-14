import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/StatusBadge";
import { AIRecommendationPanel } from "@/components/AIRecommendationPanel";
import { AuditTimeline } from "@/components/AuditTimeline";
import { AdminReviewPanel } from "@/components/AdminReviewPanel";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAppDetail({ params }: { params: { id: string } }) {
  const app = await prisma.application.findUnique({
    where: { id: params.id },
    include: {
      applicant: true,
      details: true,
      documents: true,
      aiAssessments: { orderBy: { createdAt: "desc" } },
      reviews: { include: { reviewer: { select: { fullName: true, email: true } } }, orderBy: { createdAt: "desc" } },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { fullName: true, email: true } } },
      },
    },
  });
  if (!app) notFound();
  const latestAI = app.aiAssessments[0] ?? null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="font-mono text-xs text-muted">{app.referenceCode}</div>
          <h1 className="text-2xl font-semibold">{app.title}</h1>
          <div className="text-sm text-muted">
            {app.category} · submitted {formatDate(app.submittedAt)}
          </div>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <section className="card p-5">
            <h2 className="font-semibold">Applicant</h2>
            <dl className="grid sm:grid-cols-2 gap-y-2 mt-3 text-sm">
              <dt className="text-muted">Name</dt><dd>{app.applicant.fullName}</dd>
              <dt className="text-muted">Email</dt><dd>{app.applicant.email}</dd>
              <dt className="text-muted">Phone</dt><dd>{app.applicant.phone || "—"}</dd>
              <dt className="text-muted">Account since</dt><dd>{formatDate(app.applicant.createdAt)}</dd>
            </dl>
          </section>

          <section className="card p-5">
            <h2 className="font-semibold">Application details</h2>
            {app.details ? (
              <dl className="grid sm:grid-cols-2 gap-y-2 mt-3 text-sm">
                <dt className="text-muted">Full name</dt><dd>{app.details.fullName}</dd>
                <dt className="text-muted">Date of birth</dt><dd>{formatDate(app.details.dateOfBirth)}</dd>
                <dt className="text-muted">National ID</dt><dd>{app.details.nationalId}</dd>
                <dt className="text-muted">Address</dt>
                <dd>
                  {app.details.addressLine1}
                  {app.details.addressLine2 ? `, ${app.details.addressLine2}` : ""}, {app.details.city}, {app.details.state} {app.details.postalCode}
                </dd>
                <dt className="text-muted">Declared income</dt><dd>{app.details.declaredIncome ?? "—"}</dd>
                <dt className="text-muted">Household size</dt><dd>{app.details.householdSize ?? "—"}</dd>
                <dt className="text-muted">Prior applications</dt><dd>{app.details.prevApplications ?? "—"}</dd>
                <dt className="text-muted sm:col-span-2">Reason</dt>
                <dd className="sm:col-span-2 whitespace-pre-wrap">{app.details.reason}</dd>
              </dl>
            ) : <div className="text-muted text-sm mt-2">No details captured.</div>}
          </section>

          <section className="card p-5">
            <h2 className="font-semibold">Documents</h2>
            {app.documents.length === 0 ? (
              <div className="text-sm text-muted mt-2">No documents on file.</div>
            ) : (
              <ul className="mt-3 divide-y divide-border border border-border rounded-md">
                {app.documents.map((d) => (
                  <li key={d.id} className="px-3 py-2 text-sm flex justify-between">
                    <div>
                      <div className="font-medium">{d.fileName}</div>
                      <div className="text-xs text-muted">{d.category} · {(d.sizeBytes / 1024).toFixed(1)} KB · {d.mimeType}</div>
                    </div>
                    <div className="text-xs text-muted">{formatDate(d.uploadedAt)}</div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-5">
            <h2 className="font-semibold">Audit trail</h2>
            <div className="mt-3">
              <AuditTimeline entries={app.auditLogs} />
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <AIRecommendationPanel assessment={latestAI} />
          <AdminReviewPanel
            applicationId={app.id}
            status={app.status}
            aiRecommendation={latestAI?.recommendation ?? null}
          />
          {app.reviews.length > 0 && (
            <section className="card p-4">
              <h3 className="font-semibold mb-2">Previous decisions</h3>
              <ul className="space-y-3">
                {app.reviews.map((r) => (
                  <li key={r.id} className="text-sm">
                    <div className="font-medium">{r.decision.replaceAll("_", " ")}</div>
                    <div className="text-xs text-muted">
                      {formatDate(r.createdAt)} · {r.reviewer.fullName}
                      {r.overrodeAI && " · AI override"}
                    </div>
                    {r.notes && <p className="text-muted mt-1">{r.notes}</p>}
                    {r.overrideReason && (
                      <p className="text-muted mt-1 italic">Override reason: {r.overrideReason}</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
