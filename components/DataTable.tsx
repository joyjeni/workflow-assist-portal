import React from "react";

export type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  width?: string;
};

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  emptyMessage = "No records",
}: {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}) {
  if (!data.length) {
    return (
      <div className="card p-6 text-center text-muted">{emptyMessage}</div>
    );
  }
  return (
    <div className="card overflow-x-auto">
      <table className="table" role="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={String(c.key)} scope="col" style={c.width ? { width: c.width } : undefined}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id ?? idx}>
              {columns.map((c) => (
                <td key={String(c.key)}>
                  {c.render ? c.render(row) : ((row as Record<string, unknown>)[c.key as string] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
