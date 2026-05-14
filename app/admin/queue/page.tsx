import Link from "next/link";
import { prisma } from "@/lib/db";
import { StatusBadge, RiskBadge } from "@/components/StatusBadge";
import { FilterBar } from "@/components/FilterBar";
import { formatDate } from "@/lib/utils";
import type { ApplicationStatus, RiskLevel } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminQueue({
  searchParams,
}: {
  searchParams: { status?: string; risk?: string; from?: string; to?: string };
}) {
  const where: Record<string, unknown> = {};
  if (searchParams.status) where.status = searchParams.status as ApplicationStatus;
  if (searchParams.from || searchParams.to) {
    const range: Record<string, Date> = {};
    if (searchParams.from) range.gte = new Date(searchParams.from);
    if (searchParams.to) range.lte = new Date(searchParams.to + "T23:59:59");
    where.createdAt = range;
  }
  if (searchParams.risk) {
    where.aiAssessments = { some: { riskLevel: searchParams.risk as RiskLevel } };
  }

  const apps = await prisma.application.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      applicant: { select: { fullName: true, email: true } },
      aiAssessments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Application queue</h1>
        <p className="text-muted text-sm">Filter by status, AI risk, and submission date.</p>
      </div>
      <FilterBar />
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Applicant</th>
              <th>Category</th>
              <th>Status</th>
              <th>AI risk</th>
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {apps.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-muted py-6">No matching applications</td></tr>
            ) : apps.map((r) => (
              <tr key={r.id}>
                <td className="font-mono text-xs">{r.referenceCode}</td>
                <td>{r.applicant.fullName}<div className="text-xs text-muted">{r.applicant.email}</div></td>
                <td>{r.category}</td>
                <td><StatusBadge status={r.status} /></td>
                <td><RiskBadge level={r.aiAssessments[0]?.riskLevel ?? null} /></td>
                <td className="text-muted">{formatDate(r.updatedAt)}</td>
                <td className="text-right">
                  <Link href={`/admin/applications/${r.id}`} className="text-primary underline text-sm">Review</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
