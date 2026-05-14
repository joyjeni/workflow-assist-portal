import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      actor: { select: { fullName: true, email: true } },
      application: { select: { referenceCode: true } },
    },
  });
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">System audit log</h1>
        <p className="text-muted text-sm">Last 200 entries across the platform.</p>
      </div>
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>When</th>
              <th>Action</th>
              <th>Reference</th>
              <th>Actor</th>
              <th>Status change</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id}>
                <td className="text-muted text-xs whitespace-nowrap">{formatDate(e.createdAt)}</td>
                <td className="font-medium">{e.action.replaceAll("_", " ")}</td>
                <td className="font-mono text-xs">{e.application?.referenceCode || "—"}</td>
                <td>{e.actor?.fullName || "system"}<div className="text-xs text-muted">{e.actorRole?.toLowerCase() || ""}</div></td>
                <td className="text-xs text-muted">
                  {e.oldStatus || "—"} → <span className="text-text">{e.newStatus || "—"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
