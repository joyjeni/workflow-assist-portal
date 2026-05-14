import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { documentMetaSchema } from "@/lib/validators";
import { recordAudit } from "@/lib/audit";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { error, session } = await requireUser();
  if (error) return NextResponse.json({ error }, { status: error === "unauthenticated" ? 401 : 403 });
  const app = await prisma.application.findUnique({ where: { id: params.id } });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session!.role !== "ADMIN" && app.applicantId !== session!.uid)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const docs = await prisma.document.findMany({
    where: { applicationId: app.id },
    orderBy: { uploadedAt: "desc" },
  });
  return NextResponse.json({ documents: docs });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { error, session } = await requireUser("CITIZEN");
  if (error) return NextResponse.json({ error }, { status: error === "unauthenticated" ? 401 : 403 });
  const app = await prisma.application.findUnique({ where: { id: params.id } });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (app.applicantId !== session!.uid)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = documentMetaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }
  const doc = await prisma.document.create({
    data: {
      applicationId: app.id,
      fileName: parsed.data.fileName,
      mimeType: parsed.data.mimeType,
      sizeBytes: parsed.data.sizeBytes,
      category: parsed.data.category,
      storageKey: `demo/${app.id}/${parsed.data.fileName}`,
    },
  });
  await recordAudit({
    applicationId: app.id,
    actorId: session!.uid,
    actorRole: "CITIZEN",
    action: "DOCUMENT_UPLOADED",
    metadata: { fileName: doc.fileName, category: doc.category },
  });
  return NextResponse.json({ document: doc });
}
