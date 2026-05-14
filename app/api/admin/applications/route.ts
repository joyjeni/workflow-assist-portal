import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import type { ApplicationStatus, RiskLevel } from "@prisma/client";

export async function GET(req: Request) {
  const { error } = await requireUser("ADMIN");
  if (error) return NextResponse.json({ error }, { status: error === "unauthenticated" ? 401 : 403 });
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const risk = url.searchParams.get("risk");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const where: Record<string, unknown> = {};
  if (status) where.status = status as ApplicationStatus;
  if (from || to) {
    const range: Record<string, Date> = {};
    if (from) range.gte = new Date(from);
    if (to) range.lte = new Date(to + "T23:59:59");
    where.createdAt = range;
  }
  if (risk) where.aiAssessments = { some: { riskLevel: risk as RiskLevel } };

  const apps = await prisma.application.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      applicant: { select: { fullName: true, email: true } },
      aiAssessments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  return NextResponse.json({ applications: apps });
}
