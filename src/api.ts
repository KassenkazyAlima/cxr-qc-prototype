const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export type RecordRow = {
  id: number;
  patient_id: string;
  view_type: string;
  device: string;
  qc_status: "PASS" | "FIX" | "FLAG" | string;
  date: string;
  image_path: string | null;
  report_id: number | null;
};

export async function fetchRecords(): Promise<RecordRow[]> {
  const r = await fetch(`${API_BASE}/records/records`);
  if (!r.ok) throw new Error(`Records fetch failed: ${r.status}`);
  return r.json();
}

// If your backend accepts an image and returns analysis + a new record:
export type AnalyzeResp = {
  record: RecordRow;
  metrics: Array<{ name: string; value: number; unit?: string; status: string }>;
};

export async function analyzeImage(patientId: string, file: File, viewType = "PA") {
  const fd = new FormData();
  fd.append("patient_id", patientId);
  fd.append("view_type", viewType);
  fd.append("image", file);
  const r = await fetch(`${API_BASE}/ml/analyze`, { method: "POST", body: fd });
  if (!r.ok) throw new Error(`Analyze failed: ${r.status}`);
  return (await r.json()) as AnalyzeResp;
}

// Generate report (Swagger shows: POST /reports/{patient_id}/generate?token=...)
// If your backend doesn’t need token yet, omit it here or store the JWT in localStorage.
export async function generateReport(patientId: string, token?: string) {
  const url = new URL(`${API_BASE}/reports/${encodeURIComponent(patientId)}/generate`);
  if (token) url.searchParams.set("token", token);
  const r = await fetch(url.toString(), { method: "POST" });
  if (!r.ok) throw new Error(`Report generate failed: ${r.status}`);
  // Backend returns: { report_id: number, download_url: string }
  return r.json() as Promise<{ report_id: number; download_url: string }>;
}

// Download report by id (GET /reports/{report_id}/download -> application/pdf)
export async function downloadReport(reportId: number) {
  const r = await fetch(`${API_BASE}/reports/${reportId}/download`);
  if (!r.ok) throw new Error(`Report download failed: ${r.status}`);
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `report_${reportId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
