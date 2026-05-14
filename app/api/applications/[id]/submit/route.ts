import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { error, session } = await requireUser("CITIZEN");
  if (error) return NextResponse.json({ error }, { status: error === "unauthenticated" ? 401 : 403 });
  const app = await prisma.application.findUnique({ where: { id: params.id } });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (app.applicantId !== session!.uid)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (app.status !== "DRAFT")
    return NextResponse.json({ error: "Application is not a draft" }, { status: 400 });

  const updated = await prisma.application.update({
    where: { id: app.id },
    data: { status: "SUBMITTED", submittedAt: new Date() },
  });
  await recordAudit({
    applicationId: app.id,
    actorId: session!.uid,
    actorRole: "CITIZEN",
    action: "APPLICATION_SUBMITTED",
    oldStatus: "DRAFT",
    newStatus: "SUBMITTED",
  });
  return NextResponse.json({ application: updated });
}
