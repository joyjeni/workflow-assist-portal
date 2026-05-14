"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function CitizenActions({
  id,
  status,
  editable,
  canTriggerAI,
}: {
  id: string;
  status: string;
  editable: boolean;
  canTriggerAI: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setBusy("submit");
    setErr(null);
    const res = await fetch(`/api/applications/${id}/submit`, { method: "POST" });
    setBusy(null);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error || "Could not submit");
      return;
    }
    router.refresh();
  }
  async function triggerAI() {
    setBusy("ai");
    setErr(null);
    const res = await fetch(`/api/applications/${id}/ai-check`, { method: "POST" });
    setBusy(null);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error || "Could not run AI check");
      return;
    }
    router.refresh();
  }

  return (
    <section className="card p-4">
      <h3 className="font-semibold mb-2">Actions</h3>
      <div className="space-y-2">
        {editable && (
          <button className="btn btn-primary w-full" onClick={submit} disabled={!!busy}>
            {busy === "submit" ? "Submitting…" : "Submit application"}
          </button>
        )}
        {canTriggerAI && (
          <button className="btn btn-secondary w-full" onClick={triggerAI} disabled={!!busy}>
            {busy === "ai" ? "Running…" : "Run AI check"}
          </button>
        )}
        <div className="text-xs text-muted">
          Current status: <span className="font-medium text-text">{status.replaceAll("_", " ")}</span>
        </div>
        {err && <div role="alert" className="error">{err}</div>}
      </div>
    </section>
  );
}
