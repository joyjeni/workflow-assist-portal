"use client";
import { useState } from "react";

type Doc = { fileName: string; mimeType: string; sizeBytes: number; category: string };

export function FileUpload({
  applicationId,
  initial = [],
  disabled = false,
}: {
  applicationId: string;
  initial?: Doc[];
  disabled?: boolean;
}) {
  const [docs, setDocs] = useState<Doc[]>(initial);
  const [category, setCategory] = useState("id_proof");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be smaller than 5 MB");
      return;
    }
    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          category,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setDocs((prev) => [...prev, json.document]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className="label" htmlFor="doc-category">Document type</label>
          <select
            id="doc-category"
            className="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={disabled}
          >
            <option value="id_proof">Identity proof</option>
            <option value="address_proof">Address proof</option>
            <option value="supporting">Supporting document</option>
          </select>
        </div>
        <label className="btn btn-secondary cursor-pointer">
          <input
            type="file"
            className="sr-only"
            onChange={handleFile}
            disabled={disabled || pending}
            accept=".pdf,.jpg,.jpeg,.png"
          />
          {pending ? "Uploading…" : "Add document"}
        </label>
        <p className="help">Max 5 MB. PDF, JPG, PNG accepted. Demo build stores metadata only.</p>
      </div>
      {error && <div className="error">{error}</div>}
      {docs.length === 0 ? (
        <div className="text-sm text-muted">No documents uploaded yet.</div>
      ) : (
        <ul className="divide-y divide-border border border-border rounded-md">
          {docs.map((d, i) => (
            <li key={i} className="px-3 py-2 flex items-center justify-between text-sm">
              <div>
                <div className="font-medium">{d.fileName}</div>
                <div className="text-muted text-xs">
                  {d.category} · {(d.sizeBytes / 1024).toFixed(1)} KB · {d.mimeType}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
