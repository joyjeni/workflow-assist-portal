"use client";
export function Stepper({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <ol className="flex items-center gap-2 text-sm" aria-label="Application steps">
      {steps.map((label, i) => {
        const state = i < current ? "done" : i === current ? "active" : "pending";
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              aria-current={state === "active" ? "step" : undefined}
              className={
                state === "done"
                  ? "w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-medium"
                  : state === "active"
                    ? "w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-medium ring-2 ring-offset-2 ring-primary/30"
                    : "w-7 h-7 rounded-full bg-surface-alt text-muted flex items-center justify-center font-medium border border-border"
              }
            >
              {state === "done" ? "✓" : i + 1}
            </span>
            <span className={state === "pending" ? "text-muted" : "font-medium"}>{label}</span>
            {i < steps.length - 1 && <span aria-hidden className="text-muted">›</span>}
          </li>
        );
      })}
    </ol>
  );
}
