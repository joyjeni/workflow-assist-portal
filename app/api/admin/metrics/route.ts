import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const { error } = await requireUser("ADMIN");
  if (error) return NextResponse.json({ error }, { status: error === "unauthenticated" ? 401 : 403 });

  const [total, byStatus, byRisk] = await Promise.all([
    prisma.application.count(),
    prisma.application.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.aIAssessment.groupBy({ by: ["riskLevel"], _count: { riskLevel: true } }),
  ]);

  return NextResponse.json({
    total,
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.status })),
    byRisk: byRisk
      .filter((r) => !!r.riskLevel)
      .map((r) => ({ risk: r.riskLevel, count: r._count.riskLevel })),
  });
}
