/**
 * Authorization rules at the validator level.
 * Tests for runtime route-level checks would require a running database;
 * these tests pin down the decision logic that role-aware routes rely on.
 */

import { reviewDecisionSchema } from "@/lib/validators";

describe("admin review authorization rules", () => {
  it("requires an override reason of >=10 characters", () => {
    const tooShort = reviewDecisionSchema.safeParse({
      decision: "REJECT",
      overrodeAI: true,
      overrideReason: "no",
    });
    expect(tooShort.success).toBe(false);
    const ok = reviewDecisionSchema.safeParse({
      decision: "REJECT",
      overrodeAI: true,
      overrideReason: "Sufficient explanation provided.",
    });
    expect(ok.success).toBe(true);
  });

  it("limits decisions to the allowed enum", () => {
    const bad = reviewDecisionSchema.safeParse({ decision: "MAYBE" });
    expect(bad.success).toBe(false);
  });
});
