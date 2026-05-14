import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { StatusBadge } from "@/components/StatusBadge";
import { AIRecommendationPanel } from "@/components/AIRecommendationPanel";
import { AuditTimeline } from "@/components/AuditTimeline";
import { FileUpload } from "@/components/FileUpload";
import { CitizenActions } from "@/components/CitizenActions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  const app = await prisma.application.findUnique({
    where: { id: params.id },
    include: {
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
  if (!app || app.applicantId !== session!.uid) notFound();

  const latestAI = app.aiAssessments[0] ?? null;
  const editable = app.status === "DRAFT";
  const canTriggerAI =
    app.status === "SUBMITTED" || app.status === "UNDER_REVIEW";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="font-mono text-xs text-muted">{app.referenceCode}</div>
          <h1 className="text-2xl font-semibold">{app.title}</h1>
          <div className="text-sm text-muted">{app.category} · submitted {formatDate(app.submittedAt)}</div>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <section className="card p-5">
            <h2 className="font-semibold">Applicant details</h2>
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
                <dt className="text-muted sm:col-span-2">Reason</dt>
                <dd className="sm:col-span-2 whitespace-pre-wrap">{app.details.reason}</dd>
              </dl>
            ) : <div className="text-muted text-sm mt-2">No details captured.</div>}
          </section>

          <section className="card p-5">
            <h2 className="font-semibold">Documents</h2>
            <p className="text-sm text-muted">Upload identity and supporting documents.</p>
            <div className="mt-3">
              <FileUpload
                applicationId={app.id}
                disabled={!editable && app.status !== "CORRECTION_REQUESTED"}
                initial={app.documents.map((d) => ({
                  fileName: d.fileName,
                  mimeType: d.mimeType,
                  sizeBytes: d.sizeBytes,
                  category: d.category,
                }))}
              />
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-semibold">Activity & audit trail</h2>
            <div className="mt-3">
              <AuditTimeline entries={app.auditLogs} />
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <CitizenActions
            id={app.id}
            status={app.status}
            editable={editable}
            canTriggerAI={canTriggerAI}
          />
          <AIRecommendationPanel assessment={latestAI} />
          {app.reviews.length > 0 && (
            <section className="card p-4">
              <h3 className="font-semibold mb-2">Operator decisions</h3>
              <ul className="space-y-3">
                {app.reviews.map((r) => (
                  <li key={r.id} className="text-sm">
                    <div className="font-medium">{r.decision.replaceAll("_", " ")}</div>
                    <div className="text-xs text-muted">{formatDate(r.createdAt)} · {r.reviewer.fullName}</div>
                    {r.notes && <p className="text-muted mt-1">{r.notes}</p>}
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
