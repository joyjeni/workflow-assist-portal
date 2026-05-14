import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fullApplicationSchema } from "@/lib/validators";
import { recordAudit } from "@/lib/audit";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { error, session } = await requireUser();
  if (error) return NextResponse.json({ error }, { status: error === "unauthenticated" ? 401 : 403 });
  const app = await prisma.application.findUnique({
    where: { id: params.id },
    include: { details: true, documents: true, aiAssessments: true, reviews: true },
  });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session!.role !== "ADMIN" && app.applicantId !== session!.uid)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return NextResponse.json({ application: app });
}

// Update a draft (citizen-owned, DRAFT only)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { error, session } = await requireUser("CITIZEN");
  if (error) return NextResponse.json({ error }, { status: error === "unauthenticated" ? 401 : 403 });
  const app = await prisma.application.findUnique({ where: { id: params.id } });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (app.applicantId !== session!.uid)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (app.status !== "DRAFT")
    return NextResponse.json({ error: "Only drafts can be edited" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const parsed = fullApplicationSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }
  const v = parsed.data;
  const updated = await prisma.application.update({
    where: { id: app.id },
    data: {
      category: v.category,
      title: v.title,
      details: {
        update: {
          ...(v.fullName ? { fullName: v.fullName } : {}),
          ...(v.dateOfBirth ? { dateOfBirth: new Date(v.dateOfBirth) } : {}),
          ...(v.nationalId ? { nationalId: v.nationalId } : {}),
          ...(v.addressLine1 ? { addressLine1: v.addressLine1 } : {}),
          ...(v.addressLine2 !== undefined ? { addressLine2: v.addressLine2 } : {}),
          ...(v.city ? { city: v.city } : {}),
          ...(v.state ? { state: v.state } : {}),
          ...(v.postalCode ? { postalCode: v.postalCode } : {}),
          ...(v.reason ? { reason: v.reason } : {}),
          ...(v.declaredIncome !== undefined ? { declaredIncome: v.declaredIncome } : {}),
          ...(v.householdSize !== undefined ? { householdSize: v.householdSize } : {}),
          ...(v.prevApplications !== undefined ? { prevApplications: v.prevApplications } : {}),
        },
      },
    },
  });
  await recordAudit({
    applicationId: app.id,
    actorId: session!.uid,
    actorRole: "CITIZEN",
    action: "DRAFT_UPDATED",
  });
  return NextResponse.json({ application: updated });
}
