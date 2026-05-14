import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { error, session } = await requireUser();
  if (error) return NextResponse.json({ error }, { status: error === "unauthenticated" ? 401 : 403 });
  const app = await prisma.application.findUnique({ where: { id: params.id } });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session!.role !== "ADMIN" && app.applicantId !== session!.uid)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const logs = await prisma.auditLog.findMany({
    where: { applicationId: app.id },
    orderBy: { createdAt: "desc" },
    include: { actor: { select: { fullName: true, email: true } } },
  });
  return NextResponse.json({ entries: logs });
}
