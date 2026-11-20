type Cell = string | number;

function escapeCell(value: Cell): string {
  // A text cell starting with = + - @ would run as a formula in a spreadsheet: neutralise it.
  const text = typeof value === "string" && /^[=+\-@]/.test(value) ? `'${value}` : String(value);
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Semicolons and a byte-order mark: what a French Excel opens without asking anything. */
export function toCsv(header: string[], rows: Cell[][]): string {
  return `﻿${[header, ...rows].map((row) => row.map(escapeCell).join(";")).join("\r\n")}`;
}

/** Hands the file to the browser. Call it from an event handler. */
export function downloadCsv(filename: string, content: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
