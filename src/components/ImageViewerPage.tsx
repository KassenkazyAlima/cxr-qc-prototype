import React, { useState } from "react";
import { RotateCw, Upload, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

interface ImageViewerPageProps {
  patientId: string;
  onGenerateReport: () => void;
}

type AnalyzeResponse = {
  filename: string;
  threshold: number;
  top3: { label: string; prob: number }[];
  positives: string[];
  all: { label: string; prob: number }[];
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export function ImageViewerPage({ patientId, onGenerateReport }: ImageViewerPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const onSelect = (f: File | null) => {
    setFile(f);
    setResult(null);
    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleDetect = async () => {
    if (!file) return alert("Please upload an image first.");
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const fd = new FormData();
      fd.append("file", file);

      // If you have auth, pass token:
      // const token = localStorage.getItem("token") || "";
      // const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      const res = await fetch(`${API_BASE}/api/ml/analyze`, {
        method: "POST",
        body: fd,
        // headers,
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Analyze failed (${res.status}): ${t}`);
      }
      const data = (await res.json()) as AnalyzeResponse;
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Analyze failed");
    } finally {
      setLoading(false);
    }
  };

  // simple helper to show a bar by probability (0..1 → 0..100)
  const pct = (p: number) => Math.round(p * 100);

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="p-8 mx-auto max-w-screen-2xl">
        <div className="mb-6">
          <h1 className="text-2xl text-gray-900 mb-2">QC Image Viewer</h1>
          <p className="text-gray-600">Patient ID: {patientId}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Upload & Preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-gray-900 mb-4">X-ray</h2>

            {!preview ? (
              <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-xl py-16 cursor-pointer hover:bg-gray-50">
                <Upload className="w-8 h-8 text-gray-500" />
                <div className="text-sm text-gray-600">Click to upload or drag & drop</div>
                <div className="text-xs text-gray-500">PNG or JPG (DICOM viewer can be added later)</div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
                />
              </label>
            ) : (
              <>
                <div className="bg-gray-900 rounded-xl aspect-[3/4] flex items-center justify-center overflow-hidden">
                  <img src={preview} alt="Uploaded X-ray" className="w-full h-full object-contain" />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => onSelect(null)}>Remove</Button>
                  <Button variant="outline" size="sm">Zoom In</Button>
                  <Button variant="outline" size="sm">Zoom Out</Button>
                  <Button variant="outline" size="sm">Reset</Button>
                </div>
              </>
            )}
          </div>

          {/* Right: Analysis */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-gray-900 mb-4">Analysis Results</h2>

            {!result ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <RotateCw className={`w-8 h-8 ${loading ? "animate-spin" : "text-blue-600"}`} />
                </div>
                {error ? (
                  <p className="text-red-600 mb-4">{error}</p>
                ) : (
                  <p className="text-gray-600 mb-6">
                    {file ? "Ready to analyze." : "Upload an image to begin."}
                  </p>
                )}
                <Button onClick={handleDetect} className="bg-blue-600 hover:bg-blue-700" disabled={!file || loading}>
                  {loading ? "Analyzing..." : "Run QC Analysis"}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Top-3 block */}
                <div>
                  <p className="text-gray-900 font-medium mb-2">Top-3 findings</p>
                  <div className="space-y-3">
                    {result.top3.map((r) => (
                      <div key={r.label} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-900">{r.label}</span>
                          <span className="text-gray-700 font-medium">{pct(r.prob)}%</span>
                        </div>
                        <Progress value={pct(r.prob)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Positives chips (above threshold) */}
                <div>
                  <p className="text-gray-900 font-medium mb-2">
                    Positives (≥ {Math.round(result.threshold * 100)}%)
                  </p>
                  {result.positives.length === 0 ? (
                    <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <AlertTriangle className="w-4 h-4" />
                      <span>No findings above threshold.</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {result.positives.map((l) => (
                        <span key={l} className="px-2.5 py-1 text-sm rounded-full bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
                          {l}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Full table */}
                <div>
                  <p className="text-gray-900 font-medium mb-2">All classes</p>
                  <div className="max-h-72 overflow-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-3 py-2">Label</th>
                          <th className="text-right px-3 py-2">Prob</th>
                          <th className="px-3 py-2">Bar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.all.map((r) => (
                          <tr key={r.label} className="border-t">
                            <td className="px-3 py-2">{r.label}</td>
                            <td className="px-3 py-2 text-right">{pct(r.prob)}%</td>
                            <td className="px-3 py-2">
                              <Progress value={pct(r.prob)} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <Button variant="outline" className="flex-1 border-red-600 text-red-600 hover:bg-red-50">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Flag
                  </Button>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={onGenerateReport}>
                    Generate Report
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Model output is not a medical diagnosis. Use for QC/triage only.
        </p>
      </div>
    </div>
  );
}
