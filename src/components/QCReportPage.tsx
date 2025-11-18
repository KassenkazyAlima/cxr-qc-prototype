import React, { useState } from "react";
import { Download, CheckCircle, AlertTriangle, FileText, Calendar } from "lucide-react";
import { Button } from "./ui/button";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

// If you already pass patient id via router state/query, read it here.
// For now we keep your previous static demo values:
const reportData = {
  patientId: "PT-2025-002",
  date: "2025-11-02",
  technician: "John Technician",
  device: "Siemens Multix",
  viewType: "PA",
};

export function QCReportPage() {
  const [reportId, setReportId] = useState<number | null>(null);
  const [genBusy, setGenBusy] = useState(false);
  const [dlBusy, setDlBusy] = useState(false);

  const findings = [
    { metric: "Rotation", result: "6°", status: "warning", recommendation: "Image shows slight rotation. Recommend retake with proper patient positioning." },
    { metric: "Coverage", result: "95%", status: "pass", recommendation: "Adequate anatomical coverage. No action required." },
    { metric: "Exposure", result: "Normal (88%)", status: "pass", recommendation: "Exposure within acceptable range. Image quality is diagnostic." },
    { metric: "Blur Detection", result: "92% Sharpness", status: "pass", recommendation: "Image sharpness is excellent. No motion artifacts detected." },
  ];

  async function handleGenerate() {
    try {
      setGenBusy(true);
      const url = new URL(`${API_BASE}/reports/${encodeURIComponent(reportData.patientId)}/generate`);
      const token = localStorage.getItem("token");
      if (token) url.searchParams.set("token", token);

      const res = await fetch(url.toString(), { method: "POST" });
      if (!res.ok) throw new Error(`Generate failed: ${res.status}`);
      const data = (await res.json()) as { report_id: number; download_url: string };
      setReportId(data.report_id);
      // optional: auto-download immediately:
      // await handleDownload(data.report_id);
    } catch (e) {
      console.error(e);
      alert("Failed to generate report");
    } finally {
      setGenBusy(false);
    }
  }

  async function handleDownload(id?: number) {
    const rid = id ?? reportId;
    if (!rid) return alert("Generate a report first.");
    try {
      setDlBusy(true);
      const res = await fetch(`${API_BASE}/reports/${rid}/download`, { method: "GET" });
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);

      const disposition = res.headers.get("content-disposition");
      let filename = "report.pdf";
      if (disposition) {
        const m = disposition.match(/filename="?([^"]+)"?/);
        if (m?.[1]) filename = m[1];
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download report");
    } finally {
      setDlBusy(false);
    }
  }

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl text-gray-900 mb-2">Quality Control Report</h1>
            <p className="text-gray-600">Detailed findings and recommendations</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleGenerate} disabled={genBusy} variant="outline">
              {genBusy ? "Generating..." : "Generate Report"}
            </Button>
            <Button onClick={() => handleDownload()} className="bg-blue-600 hover:bg-blue-700" disabled={dlBusy}>
              <Download className="w-4 h-4 mr-2" />
              {dlBusy ? "Downloading..." : "Download Report"}
            </Button>
          </div>
        </div>

        {/* Report Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          {/* Report Header */}
          <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl text-gray-900">CXR Quality Control Report</h2>
                <p className="text-sm text-gray-500">Generated on {reportData.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
              <AlertTriangle className="w-4 h-4" />
              FIX REQUIRED
            </div>
          </div>

          {/* Patient & Exam Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div>
              <p className="text-xs text-gray-500 mb-1">Patient ID</p>
              <p className="text-gray-900">{reportData.patientId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">View Type</p>
              <p className="text-gray-900">{reportData.viewType}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Device</p>
              <p className="text-gray-900">{reportData.device}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Technician</p>
              <p className="text-gray-900">{reportData.technician}</p>
            </div>
          </div>

          {/* Findings */}
          <div>
            <h3 className="text-gray-900 mb-4">Findings & Recommendations</h3>
            <div className="space-y-4">
              {findings.map((finding, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {finding.status === "pass" ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        )}
                        <span className="text-gray-900">{finding.metric}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Result: <span className="text-gray-900">{finding.result}</span>
                      </p>
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs ${
                        finding.status === "pass" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {finding.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-sm text-gray-700">{finding.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-gray-900 mb-3">Summary</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-900 mb-1">
                    This X-ray requires attention due to rotation exceeding acceptable threshold.
                  </p>
                  <p className="text-sm text-yellow-800">
                    Recommendation: Retake image with proper patient positioning to ensure diagnostic quality.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
            <p>Report ID: {reportId ? `QCR-${reportId}` : "— not generated —"}</p>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <p>{reportData.date} 14:32:15</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
