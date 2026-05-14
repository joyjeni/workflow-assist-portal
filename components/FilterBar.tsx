"use client";
import { useRouter, useSearchParams } from "next/navigation";

const STATUSES = [
  "",
  "DRAFT",
  "SUBMITTED",
  "AI_REVIEW",
  "UNDER_REVIEW",
  "CORRECTION_REQUESTED",
  "ESCALATED",
  "APPROVED",
  "REJECTED",
];
const RISKS = ["", "LOW", "MEDIUM", "HIGH"];

export function FilterBar() {
  const router = useRouter();
  const sp = useSearchParams();

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="card p-3 flex flex-wrap gap-3 items-end">
      <div>
        <label className="label" htmlFor="f-status">Status</label>
        <select
          id="f-status"
          className="select"
          defaultValue={sp.get("status") || ""}
          onChange={(e) => update("status", e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s || "All statuses"}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="f-risk">Risk</label>
        <select
          id="f-risk"
          className="select"
          defaultValue={sp.get("risk") || ""}
          onChange={(e) => update("risk", e.target.value)}
        >
          {RISKS.map((r) => (
            <option key={r} value={r}>{r || "All risk levels"}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="f-from">From</label>
        <input
          id="f-from"
          type="date"
          className="input"
          defaultValue={sp.get("from") || ""}
          onChange={(e) => update("from", e.target.value)}
        />
      </div>
      <div>
        <label className="label" htmlFor="f-to">To</label>
        <input
          id="f-to"
          type="date"
          className="input"
          defaultValue={sp.get("to") || ""}
          onChange={(e) => update("to", e.target.value)}
        />
      </div>
    </div>
  );
}
