import {
  loginSchema,
  registerSchema,
  fullApplicationSchema,
  reviewDecisionSchema,
} from "@/lib/validators";

describe("validators", () => {
  describe("loginSchema", () => {
    it("accepts valid input", () => {
      const r = loginSchema.safeParse({ email: "a@b.com", password: "x" });
      expect(r.success).toBe(true);
    });
    it("rejects invalid email", () => {
      const r = loginSchema.safeParse({ email: "not-an-email", password: "x" });
      expect(r.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("requires a strong password", () => {
      const r = registerSchema.safeParse({
        email: "a@b.com",
        password: "short",
        fullName: "Aa Bb",
      });
      expect(r.success).toBe(false);
    });
    it("accepts a valid registration", () => {
      const r = registerSchema.safeParse({
        email: "user@example.com",
        password: "Strong1234",
        fullName: "Test User",
      });
      expect(r.success).toBe(true);
    });
  });

  describe("fullApplicationSchema", () => {
    const base = {
      category: "Housing Subsidy",
      title: "My application",
      fullName: "Test Person",
      dateOfBirth: "1990-01-01",
      nationalId: "ABC123456",
      addressLine1: "12, Some Street",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560001",
      reason: "Need help with housing — describing in enough detail here please.",
    };
    it("accepts a complete payload", () => {
      const r = fullApplicationSchema.safeParse(base);
      expect(r.success).toBe(true);
    });
    it("rejects short reason text", () => {
      const r = fullApplicationSchema.safeParse({ ...base, reason: "too short" });
      expect(r.success).toBe(false);
    });
    it("rejects missing title", () => {
      const r = fullApplicationSchema.safeParse({ ...base, title: "" });
      expect(r.success).toBe(false);
    });
  });

  describe("reviewDecisionSchema", () => {
    it("requires override reason when overrodeAI is true", () => {
      const r = reviewDecisionSchema.safeParse({
        decision: "REJECT",
        overrodeAI: true,
      });
      expect(r.success).toBe(false);
    });
    it("accepts override with reason", () => {
      const r = reviewDecisionSchema.safeParse({
        decision: "REJECT",
        overrodeAI: true,
        overrideReason: "Documentation insufficient",
      });
      expect(r.success).toBe(true);
    });
    it("accepts non-override decision without reason", () => {
      const r = reviewDecisionSchema.safeParse({ decision: "APPROVE" });
      expect(r.success).toBe(true);
    });
  });
});
