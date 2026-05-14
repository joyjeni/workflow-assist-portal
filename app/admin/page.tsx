import Link from "next/link";
import { prisma } from "@/lib/db";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [total, pending, approved, rejected, recent] = await Promise.all([
    prisma.application.count(),
    prisma.application.count({
      where: { status: { in: ["SUBMITTED", "UNDER_REVIEW", "AI_REVIEW", "ESCALATED"] } },
    }),
    prisma.application.count({ where: { status: "APPROVED" } }),
    prisma.application.count({ where: { status: "REJECTED" } }),
    prisma.application.findMany({
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: { applicant: { select: { fullName: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Operator overview</h1>
        <p className="text-muted text-sm">Snapshot of the workflow queue and recent activity.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total applications" value={total} />
        <MetricCard label="Awaiting review" value={pending} tone="warning" />
        <MetricCard label="Approved" value={approved} tone="success" />
        <MetricCard label="Rejected" value={rejected} tone="danger" />
      </div>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Recent activity</h2>
          <Link href="/admin/queue" className="text-primary text-sm underline">Open full queue</Link>
        </div>
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Applicant</th>
                <th>Category</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.id}>
                  <td className="font-mono text-xs">
                    <Link href={`/admin/applications/${r.id}`} className="text-primary underline">
                      {r.referenceCode}
                    </Link>
                  </td>
                  <td>{r.applicant.fullName}</td>
                  <td>{r.category}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td className="text-muted">{formatDate(r.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
