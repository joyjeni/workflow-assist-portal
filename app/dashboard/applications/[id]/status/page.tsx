import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { StatusBadge } from "@/components/StatusBadge";
import { AuditTimeline } from "@/components/AuditTimeline";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StatusTrackingPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  const app = await prisma.application.findUnique({
    where: { id: params.id },
    include: {
      auditLogs: {
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { fullName: true, email: true } } },
      },
    },
  });
  if (!app || app.applicantId !== session!.uid) notFound();

  return (
    <div className="space-y-4">
      <div>
        <Link href={`/dashboard/applications/${app.id}`} className="text-sm text-primary underline">
          ← Back to application
        </Link>
        <h1 className="text-2xl font-semibold mt-2">Status tracking</h1>
        <div className="text-sm text-muted">{app.referenceCode}</div>
      </div>
      <div className="card p-5 flex items-center justify-between">
        <div>
          <div className="text-sm text-muted">Current status</div>
          <div className="mt-1"><StatusBadge status={app.status} /></div>
        </div>
        <div className="text-sm text-muted">{app.title}</div>
      </div>
      <div className="card p-5">
        <h2 className="font-semibold mb-3">History</h2>
        <AuditTimeline entries={app.auditLogs} />
      </div>
    </div>
  );
}
