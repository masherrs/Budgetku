"use client";

import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";

export function ExportPdfButton() {
  const [isExporting, setIsExporting] = useState(false);

  async function exportPdf() {
    setIsExporting(true);
    try {
      const response = await fetch("/api/reports/monthly", { cache: "no-store" });
      if (!response.ok) throw new Error("PDF tidak dapat dibuat.");

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const filename =
        disposition.match(/filename="([^"]+)"/)?.[1] ?? "BudgetKu-Laporan.pdf";
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.alert("Laporan PDF gagal dibuat. Silakan coba lagi.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <button
      className="button button-outline"
      type="button"
      onClick={exportPdf}
      disabled={isExporting}
      aria-label={isExporting ? "Menyiapkan laporan PDF" : "Export laporan ke PDF"}
    >
      {isExporting ? <LoaderCircle className="submit-spinner" size={17} /> : <Download size={17} />}
      <span>{isExporting ? "Menyiapkan..." : "Export PDF"}</span>
    </button>
  );
}
