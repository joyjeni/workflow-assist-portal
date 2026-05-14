import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { runAssessment } from "@/lib/mock-ai";
import { recordAudit } from "@/lib/audit";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { error, session } = await requireUser();
  if (error) return NextResponse.json({ error }, { status: error === "unauthenticated" ? 401 : 403 });
  const app = await prisma.application.findUnique({
    where: { id: params.id },
    include: { details: true, documents: true },
  });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session!.role !== "ADMIN" && app.applicantId !== session!.uid)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!app.details)
    return NextResponse.json({ error: "Application is missing details" }, { status: 400 });
  if (app.status === "DRAFT")
    return NextResponse.json({ error: "Submit the application before running AI check" }, { status: 400 });

  await recordAudit({
    applicationId: app.id,
    actorId: session!.uid,
    actorRole: session!.role,
    action: "AI_CHECK_TRIGGERED",
    oldStatus: app.status,
    newStatus: "AI_REVIEW",
  });

  const result = runAssessment({
    details: app.details,
    documents: app.documents,
    category: app.category,
  });

  const created = await prisma.aIAssessment.create({
    data: {
      applicationId: app.id,
      modelVersion: result.modelVersion,
      status: "COMPLETED",
      riskLevel: result.riskLevel,
      riskScore: result.riskScore,
      confidenceScore: result.confidenceScore,
      recommendation: result.recommendation,
      explanationSummary: result.explanationSummary as unknown as object,
      rawSignals: result.rawSignals as unknown as object,
      completedAt: new Date(),
    },
  });

  // After AI completes, move to UNDER_REVIEW so operators can act.
  const updated = await prisma.application.update({
    where: { id: app.id },
    data: { status: "UNDER_REVIEW" },
  });

  await recordAudit({
    applicationId: app.id,
    actorId: session!.uid,
    actorRole: session!.role,
    action: "AI_CHECK_COMPLETED",
    oldStatus: "AI_REVIEW",
    newStatus: "UNDER_REVIEW",
    metadata: {
      recommendation: result.recommendation,
      riskLevel: result.riskLevel,
      riskScore: result.riskScore,
    },
  });

  return NextResponse.json({ assessment: created, application: updated });
}
