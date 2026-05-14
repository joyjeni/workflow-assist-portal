/**
 * Mock AI Service Layer
 * ---------------------
 * Deterministic, rule-based stand-in for an AI risk/recommendation model.
 * This module DOES NOT train or call any ML model. It exists to demonstrate
 * the application-layer integration: triggering, persisting, surfacing, and
 * overriding AI signals inside a workflow.
 *
 * If a real model is plugged in later, only `runAssessment` needs to change;
 * the API surface and shape of the result stay the same.
 */

import type { ApplicationDetails, Document } from "@prisma/client";

export const MOCK_MODEL_VERSION = "mock-ai-v1.2.0";

export type MockAIInput = {
  details: Pick<
    ApplicationDetails,
    | "declaredIncome"
    | "householdSize"
    | "prevApplications"
    | "reason"
    | "nationalId"
  >;
  documents: Pick<Document, "category">[];
  category: string;
};

export type MockAIResult = {
  modelVersion: string;
  status: "COMPLETED";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  riskScore: number; // 0..1
  confidenceScore: number; // 0..1
  recommendation: "APPROVE" | "MANUAL_REVIEW" | "REQUEST_CORRECTION";
  explanationSummary: string[];
  rawSignals: Record<string, unknown>;
};

/** Deterministic mock — same input → same output. */
export function runAssessment(input: MockAIInput): MockAIResult {
  const { details, documents, category } = input;
  const explanations: string[] = [];
  let risk = 0.15;

  // Document completeness signal
  const hasIdProof = documents.some((d) => d.category === "id_proof");
  const hasAddressProof = documents.some((d) => d.category === "address_proof");
  if (!hasIdProof) {
    risk += 0.25;
    explanations.push("Identity proof not provided.");
  } else {
    explanations.push("Identity proof present.");
  }
  if (!hasAddressProof && category !== "Pension Enrollment") {
    risk += 0.15;
    explanations.push("Address proof missing or pending verification.");
  }

  // Income / household signal
  const income = details.declaredIncome ?? 0;
  if (income > 0 && income < 200000) {
    risk -= 0.05;
    explanations.push("Declared income within low-income eligibility band.");
  } else if (income > 800000) {
    risk += 0.2;
    explanations.push("Declared income above typical scheme threshold.");
  } else if (income > 0) {
    explanations.push("Declared income within middle band — requires review.");
  }

  // Prior application history
  const prev = details.prevApplications ?? 0;
  if (prev >= 3) {
    risk += 0.15;
    explanations.push("Frequent prior applications flagged for verification.");
  } else if (prev === 0) {
    explanations.push("No prior application history on file.");
  }

  // ID format sanity
  if (!/^[A-Z0-9-]{6,}$/i.test(details.nationalId)) {
    risk += 0.1;
    explanations.push("National ID format does not match expected pattern.");
  }

  // Reason length signal (proxy for completeness)
  if ((details.reason || "").trim().length < 30) {
    risk += 0.1;
    explanations.push("Application reason is short; may need clarification.");
  }

  // Clamp + derive
  const riskScore = Math.max(0, Math.min(1, Number(risk.toFixed(2))));
  const riskLevel =
    riskScore < 0.3 ? "LOW" : riskScore < 0.6 ? "MEDIUM" : "HIGH";
  const recommendation =
    riskLevel === "LOW"
      ? "APPROVE"
      : riskLevel === "HIGH"
        ? "REQUEST_CORRECTION"
        : "MANUAL_REVIEW";
  const confidenceScore = Number(
    Math.max(0.55, 0.95 - Math.abs(0.5 - riskScore) * 0.4).toFixed(2)
  );

  return {
    modelVersion: MOCK_MODEL_VERSION,
    status: "COMPLETED",
    riskLevel,
    riskScore,
    confidenceScore,
    recommendation,
    explanationSummary: explanations,
    rawSignals: {
      hasIdProof,
      hasAddressProof,
      incomeBand: income < 200000 ? "low" : income > 800000 ? "high" : "middle",
      prevApplications: prev,
      reasonLen: (details.reason || "").length,
    },
  };
}
