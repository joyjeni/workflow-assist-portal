import { prisma } from "./db";
import type { AuditAction, ApplicationStatus, Role } from "@prisma/client";

/**
 * Append an audit-trail entry. Audit writes are intentionally append-only;
 * never updated or deleted from application code.
 */
export async function recordAudit(params: {
  applicationId?: string | null;
  actorId?: string | null;
  actorRole?: Role | null;
  action: AuditAction;
  oldStatus?: ApplicationStatus | null;
  newStatus?: ApplicationStatus | null;
  metadata?: Record<string, unknown> | null;
}) {
  return prisma.auditLog.create({
    data: {
      applicationId: params.applicationId ?? null,
      actorId: params.actorId ?? null,
      actorRole: params.actorRole ?? null,
      action: params.action,
      oldStatus: params.oldStatus ?? null,
      newStatus: params.newStatus ?? null,
      metadata: (params.metadata as object) ?? undefined,
    },
  });
}
