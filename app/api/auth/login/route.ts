import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validators";
import { setSessionCookie, signSession, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }
  const expectedRole = (body as { expectedRole?: "CITIZEN" | "ADMIN" }).expectedRole;
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  if (expectedRole && user.role !== expectedRole) {
    return NextResponse.json(
      { error: `This account is not a ${expectedRole.toLowerCase()} account.` },
      { status: 403 }
    );
  }
  const token = await signSession({
    uid: user.id,
    role: user.role,
    email: user.email,
    name: user.fullName,
  });
  await setSessionCookie(token);
  return NextResponse.json({ ok: true, user: { id: user.id, role: user.role } });
}
