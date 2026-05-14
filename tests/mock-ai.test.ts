import { runAssessment, MOCK_MODEL_VERSION } from "@/lib/mock-ai";

const baseDetails = {
  declaredIncome: 250000,
  householdSize: 3,
  prevApplications: 0,
  reason: "Detailed reason of more than thirty characters for testing only.",
  nationalId: "ABC-12345678",
};

describe("mock AI service", () => {
  it("returns a complete result shape", () => {
    const r = runAssessment({
      details: baseDetails,
      documents: [{ category: "id_proof" }, { category: "address_proof" }],
      category: "Housing Subsidy",
    });
    expect(r.modelVersion).toBe(MOCK_MODEL_VERSION);
    expect(r.status).toBe("COMPLETED");
    expect(["LOW", "MEDIUM", "HIGH"]).toContain(r.riskLevel);
    expect(typeof r.riskScore).toBe("number");
    expect(typeof r.confidenceScore).toBe("number");
    expect(["APPROVE", "MANUAL_REVIEW", "REQUEST_CORRECTION"]).toContain(r.recommendation);
    expect(Array.isArray(r.explanationSummary)).toBe(true);
  });

  it("treats missing documents as higher risk", () => {
    const without = runAssessment({
      details: baseDetails,
      documents: [],
      category: "Housing Subsidy",
    });
    const withDocs = runAssessment({
      details: baseDetails,
      documents: [{ category: "id_proof" }, { category: "address_proof" }],
      category: "Housing Subsidy",
    });
    expect(without.riskScore).toBeGreaterThan(withDocs.riskScore);
  });

  it("is deterministic for identical inputs", () => {
    const a = runAssessment({
      details: baseDetails,
      documents: [{ category: "id_proof" }],
      category: "Education Grant",
    });
    const b = runAssessment({
      details: baseDetails,
      documents: [{ category: "id_proof" }],
      category: "Education Grant",
    });
    expect(a).toEqual(b);
  });
});
