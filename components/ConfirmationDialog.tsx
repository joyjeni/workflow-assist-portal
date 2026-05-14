"use client";
import { useEffect, useRef } from "react";

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  destructive = false,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    else if (!open && dlg.open) dlg.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      className="rounded-lg border border-border p-0 backdrop:bg-black/40"
      aria-labelledby="confirm-title"
    >
      <div className="p-5 bg-surface text-text min-w-[20rem] max-w-md">
        <h2 id="confirm-title" className="font-semibold text-base">{title}</h2>
        {description && <p className="text-sm text-muted mt-1">{description}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn btn-secondary" onClick={onCancel} type="button">
            {cancelLabel}
          </button>
          <button
            className={destructive ? "btn btn-danger" : "btn btn-primary"}
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
