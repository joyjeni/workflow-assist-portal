/**
 * @jest-environment node
 */
import { signSession, verifySession } from "@/lib/auth";

describe("session token", () => {
  it("round-trips a session payload", async () => {
    const token = await signSession({
      uid: "u1",
      role: "ADMIN",
      email: "a@b.com",
      name: "Admin",
    });
    expect(typeof token).toBe("string");
    const payload = await verifySession(token);
    expect(payload?.uid).toBe("u1");
    expect(payload?.role).toBe("ADMIN");
  });

  it("rejects garbage tokens", async () => {
    const r = await verifySession("not-a-token");
    expect(r).toBeNull();
  });
});
