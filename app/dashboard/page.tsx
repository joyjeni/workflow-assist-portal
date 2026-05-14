import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CitizenDashboard() {
  const session = await getSession();
  const apps = await prisma.application.findMany({
    where: { applicantId: session!.uid },
    orderBy: { updatedAt: "desc" },
    include: { aiAssessments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">My applications</h1>
          <p className="text-muted text-sm">Track every application you submit.</p>
        </div>
        <Link href="/dashboard/new" className="btn btn-primary">Start a new application</Link>
      </div>

      {apps.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Start a new application to begin."
          action={<Link href="/dashboard/new" className="btn btn-primary">Start application</Link>}
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Category</th>
                <th>Status</th>
                <th>Last updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id}>
                  <td className="font-mono text-xs">{a.referenceCode}</td>
                  <td>{a.category}<div className="text-xs text-muted">{a.title}</div></td>
                  <td><StatusBadge status={a.status} /></td>
                  <td className="text-muted">{formatDate(a.updatedAt)}</td>
                  <td className="text-right">
                    <Link href={`/dashboard/applications/${a.id}`} className="text-primary underline text-sm">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
