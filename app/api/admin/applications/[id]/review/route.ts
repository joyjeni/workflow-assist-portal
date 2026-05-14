import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { reviewDecisionSchema } from "@/lib/validators";
import { recordAudit } from "@/lib/audit";
import type { ApplicationStatus } from "@prisma/client";

// Map a review decision to the next application status.
const DECISION_TO_STATUS: Record<string, ApplicationStatus> = {
  APPROVE: "APPROVED",
  REJECT: "REJECTED",
  REQUEST_CORRECTION: "CORRECTION_REQUESTED",
  ESCALATE: "ESCALATED",
};

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { error, session } = await requireUser("ADMIN");
  if (error) return NextResponse.json({ error }, { status: error === "unauthenticated" ? 401 : 403 });
  const body = await req.json().catch(() => null);
  const parsed = reviewDecisionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }
  const app = await prisma.application.findUnique({
    where: { id: params.id },
    include: { aiAssessments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (app.status === "APPROVED" || app.status === "REJECTED") {
    return NextResponse.json({ error: "Application is in a terminal state" }, { status: 400 });
  }

  const { decision, notes, overrodeAI, overrideReason } = parsed.data;
  const nextStatus = DECISION_TO_STATUS[decision];

  const review = await prisma.adminReview.create({
    data: {
      applicationId: app.id,
      reviewerId: session!.uid,
      decision,
      notes,
      overrodeAI: overrodeAI ?? false,
      overrideReason: overrideReason,
    },
  });

  const updated = await prisma.application.update({
    where: { id: app.id },
    data: { status: nextStatus },
  });

  await recordAudit({
    applicationId: app.id,
    actorId: session!.uid,
    actorRole: "ADMIN",
    action: "ADMIN_REVIEWED",
    metadata: { decision, reviewId: review.id },
  });
  if (overrodeAI) {
    await recordAudit({
      applicationId: app.id,
      actorId: session!.uid,
      actorRole: "ADMIN",
      action: "AI_OVERRIDE_USED",
      metadata: {
        aiRecommendation: app.aiAssessments[0]?.recommendation ?? null,
        adminDecision: decision,
        overrideReason,
      },
    });
  }
  await recordAudit({
    applicationId: app.id,
    actorId: session!.uid,
    actorRole: "ADMIN",
    action: "STATUS_CHANGED",
    oldStatus: app.status,
    newStatus: nextStatus,
  });

  // Notify the applicant.
  await prisma.notification.create({
    data: {
      userId: app.applicantId,
      applicationId: app.id,
      title: `Application ${nextStatus.replaceAll("_", " ").toLowerCase()}`,
      body: `Your application ${app.referenceCode} status changed to ${nextStatus}.`,
    },
  });

  return NextResponse.json({ application: updated, review });
}
