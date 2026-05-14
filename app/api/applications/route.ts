import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fullApplicationSchema } from "@/lib/validators";
import { recordAudit } from "@/lib/audit";
import { generateReferenceCode } from "@/lib/utils";

export async function GET() {
  const { error, session } = await requireUser("CITIZEN");
  if (error) return NextResponse.json({ error }, { status: error === "unauthenticated" ? 401 : 403 });
  const apps = await prisma.application.findMany({
    where: { applicantId: session!.uid },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ applications: apps });
}

export async function POST(req: Request) {
  const { error, session } = await requireUser("CITIZEN");
  if (error) return NextResponse.json({ error }, { status: error === "unauthenticated" ? 401 : 403 });
  const body = await req.json().catch(() => null);
  const parsed = fullApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }
  const action = (body as { action?: "draft" | "submit" }).action || "draft";
  const v = parsed.data;
  const willSubmit = action === "submit";
  const status = willSubmit ? "SUBMITTED" : "DRAFT";

  const app = await prisma.application.create({
    data: {
      referenceCode: generateReferenceCode(),
      applicantId: session!.uid,
      category: v.category,
      title: v.title,
      status,
      submittedAt: willSubmit ? new Date() : null,
      details: {
        create: {
          fullName: v.fullName,
          dateOfBirth: new Date(v.dateOfBirth),
          nationalId: v.nationalId,
          addressLine1: v.addressLine1,
          addressLine2: v.addressLine2,
          city: v.city,
          state: v.state,
          postalCode: v.postalCode,
          reason: v.reason,
          declaredIncome: v.declaredIncome,
          householdSize: v.householdSize,
          prevApplications: v.prevApplications,
        },
      },
    },
  });

  await recordAudit({
    applicationId: app.id,
    actorId: session!.uid,
    actorRole: "CITIZEN",
    action: "APPLICATION_CREATED",
    newStatus: "DRAFT",
  });
  if (willSubmit) {
    await recordAudit({
      applicationId: app.id,
      actorId: session!.uid,
      actorRole: "CITIZEN",
      action: "APPLICATION_SUBMITTED",
      oldStatus: "DRAFT",
      newStatus: "SUBMITTED",
    });
  }

  return NextResponse.json({ application: app });
}
