import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET(req: Request) {
  const { error } = await requireUser("ADMIN");
  if (error) return NextResponse.json({ error }, { status: error === "unauthenticated" ? 401 : 403 });
  const url = new URL(req.url);
  const take = Math.min(500, Number(url.searchParams.get("limit") || 100));
  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: {
      actor: { select: { fullName: true, email: true } },
      application: { select: { referenceCode: true } },
    },
  });
  return NextResponse.json({ entries });
}
