"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Decision = "APPROVE" | "REJECT" | "REQUEST_CORRECTION" | "ESCALATE";

const TERMINAL_STATUSES = ["APPROVED", "REJECTED"];

export function AdminReviewPanel({
  applicationId,
  status,
  aiRecommendation,
}: {
  applicationId: string;
  status: string;
  aiRecommendation: string | null;
}) {
  const router = useRouter();
  const [decision, setDecision] = useState<Decision>("APPROVE");
  const [notes, setNotes] = useState("");
  const [overrideAI, setOverrideAI] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const isTerminal = TERMINAL_STATUSES.includes(status);

  // AI override indicator
  const recAsDecision: Record<string, Decision> = {
    APPROVE: "APPROVE",
    MANUAL_REVIEW: "APPROVE",
    REQUEST_CORRECTION: "REQUEST_CORRECTION",
  };
  const aiAlignedDecision = aiRecommendation ? recAsDecision[aiRecommendation] : null;
  const wouldOverride = !!aiRecommendation && aiRecommendation !== "MANUAL_REVIEW" && aiAlignedDecision !== decision;

  async function submit() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          notes: notes.trim() || undefined,
          overrodeAI: wouldOverride || overrideAI,
          overrideReason: overrideReason.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Review failed");
      router.refresh();
      setNotes("");
      setOverrideReason("");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (isTerminal) {
    return (
      <section className="card p-4">
        <h3 className="font-semibold mb-1">Review</h3>
        <p className="text-sm text-muted">
          This application is in a terminal state ({status}). Further review is not possible.
        </p>
      </section>
    );
  }

  return (
    <section className="card p-4 space-y-3">
      <h3 className="font-semibold">Review decision</h3>

      <div>
        <label className="label" htmlFor="decision">Decision</label>
        <select
          id="decision"
          className="select"
          value={decision}
          onChange={(e) => setDecision(e.target.value as Decision)}
        >
          <option value="APPROVE">Approve</option>
          <option value="REJECT">Reject</option>
          <option value="REQUEST_CORRECTION">Request correction</option>
          <option value="ESCALATE">Escalate</option>
        </select>
      </div>

      <div>
        <label className="label" htmlFor="notes">Notes (optional)</label>
        <textarea
          id="notes"
          rows={3}
          className="textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add context for the audit trail."
        />
      </div>

      {wouldOverride && (
        <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm">
          <div className="font-medium text-amber-900">AI override detected</div>
          <div className="text-amber-800 text-xs">
            AI recommended <strong>{aiRecommendation}</strong>; your decision is <strong>{decision}</strong>.
          </div>
          <label className="label mt-2" htmlFor="reason">Reason for override (required)</label>
          <textarea
            id="reason"
            rows={3}
            className="textarea"
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
            placeholder="At least 10 characters explaining why you are overriding the AI recommendation."
          />
        </div>
      )}

      {err && <div role="alert" className="error">{err}</div>}
      <button
        className="btn btn-primary w-full"
        onClick={submit}
        disabled={busy || (wouldOverride && overrideReason.trim().length < 10)}
      >
        {busy ? "Saving…" : "Submit decision"}
      </button>
    </section>
  );
}
