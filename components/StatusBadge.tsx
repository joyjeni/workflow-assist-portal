import { STATUS_LABEL } from "@/lib/types";
import { cn } from "@/lib/utils";

const COLORS: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200",
  AI_REVIEW: "bg-indigo-50 text-indigo-700 border-indigo-200",
  UNDER_REVIEW: "bg-amber-50 text-amber-800 border-amber-200",
  CORRECTION_REQUESTED: "bg-orange-50 text-orange-800 border-orange-200",
  ESCALATED: "bg-purple-50 text-purple-700 border-purple-200",
  APPROVED: "bg-emerald-50 text-emerald-800 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-800 border-rose-200",
};

const ICONS: Record<string, string> = {
  DRAFT: "●",
  SUBMITTED: "↑",
  AI_REVIEW: "◇",
  UNDER_REVIEW: "◐",
  CORRECTION_REQUESTED: "!",
  ESCALATED: "↗",
  APPROVED: "✓",
  REJECTED: "✕",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        COLORS[status] || "bg-slate-50 text-slate-700 border-slate-200"
      )}
      aria-label={`Status: ${STATUS_LABEL[status] || status}`}
    >
      <span aria-hidden>{ICONS[status] || "•"}</span>
      {STATUS_LABEL[status] || status}
    </span>
  );
}

export function RiskBadge({ level }: { level?: string | null }) {
  if (!level) return <span className="text-muted text-xs">—</span>;
  const colors: Record<string, string> = {
    LOW: "bg-emerald-50 text-emerald-800 border-emerald-200",
    MEDIUM: "bg-amber-50 text-amber-800 border-amber-200",
    HIGH: "bg-rose-50 text-rose-800 border-rose-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium",
        colors[level]
      )}
    >
      {level} RISK
    </span>
  );
}
