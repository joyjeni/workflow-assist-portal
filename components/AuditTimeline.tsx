import { formatDate } from "@/lib/utils";

export type AuditEntry = {
  id: string;
  action: string;
  actorRole: string | null;
  oldStatus: string | null;
  newStatus: string | null;
  metadata: unknown;
  createdAt: Date | string;
  actor?: { fullName: string; email: string } | null;
};

export function AuditTimeline({ entries }: { entries: AuditEntry[] }) {
  if (!entries.length) {
    return <div className="text-muted text-sm">No audit entries yet.</div>;
  }
  return (
    <ol className="relative border-l border-border pl-4 space-y-4" aria-label="Audit timeline">
      {entries.map((e) => (
        <li key={e.id} className="relative">
          <span
            aria-hidden
            className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary"
          />
          <div className="text-sm font-medium">{e.action.replaceAll("_", " ")}</div>
          <div className="text-xs text-muted">
            {formatDate(e.createdAt)}
            {e.actor ? ` · ${e.actor.fullName}` : ""}
            {e.actorRole ? ` (${e.actorRole.toLowerCase()})` : ""}
          </div>
          {(e.oldStatus || e.newStatus) && (
            <div className="text-xs text-muted">
              {e.oldStatus || "—"} → <span className="text-text font-medium">{e.newStatus || "—"}</span>
            </div>
          )}
          {e.metadata != null && typeof e.metadata === "object" ? (
            <pre className="text-xs bg-surface-alt rounded p-2 mt-1 overflow-x-auto">
              {JSON.stringify(e.metadata as object, null, 2)}
            </pre>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
