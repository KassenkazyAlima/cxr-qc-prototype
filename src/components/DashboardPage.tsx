import React, { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

type QCStatus = "PASS" | "FIX" | "FLAG" | string;

export type QCRow = {
  exam_id: number;
  patient_id: string;
  view_type: string;
  device: string;
  qc_status: QCStatus;
  exam_date: string; // ISO date string
  has_report?: boolean;
};

type DashboardSummary = {
  total_records: number;
  pass_rate: number; // %
  fix_rate: number; // %
  flag_rate: number; // %
};

interface DashboardPageProps {
  onViewImage: (patientId: string) => void;
}

export function DashboardPage({ onViewImage }: DashboardPageProps) {
  const [rows, setRows] = useState<QCRow[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loadingTable, setLoadingTable] = useState(true);
  const [errorTable, setErrorTable] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [errorSummary, setErrorSummary] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // ---------- SUMMARY ----------
  useEffect(() => {
    let canceled = false;

    async function loadSummary() {
      setLoadingSummary(true);
      setErrorSummary(null);
      try {
        const res = await fetch(`${API_BASE}/dashboard/dashboard/summary`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = await res.json();

        // Backend example payload:
        // { total_records, green_flags, amber_flags, red_flags, critical_flags }
        const total = raw.total_records ?? raw.total ?? raw.count ?? 0;
        const green = raw.green_flags ?? 0;
        const amber = raw.amber_flags ?? 0;
        const red = raw.red_flags ?? 0;

        const toPct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

        const normalized: DashboardSummary = {
          total_records: total,
          pass_rate: toPct(green),
          fix_rate: toPct(amber),
          flag_rate: toPct(red),
        };

        if (!canceled) setSummary(normalized);
      } catch (e: any) {
        if (!canceled) {
          setErrorSummary(e?.message ?? "Failed to load summary");
        }
      } finally {
        if (!canceled) setLoadingSummary(false);
      }
    }

    loadSummary();
    return () => {
      canceled = true;
    };
  }, []);

  // ---------- TABLE: load exams ----------
  useEffect(() => {
    let canceled = false;

    async function loadExams() {
      setLoadingTable(true);
      setErrorTable(null);
      try {
        // GET /exams/  ->  [ { id, patient_id, exam_date, view_type, qc_summary, ... } ]
        const res = await fetch(`${API_BASE}/exams/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const list: any[] = Array.isArray(data)
          ? data
          : data.items ?? data.results ?? [];

        const mapped: QCRow[] = list.map((item) => ({
          exam_id: item.id ?? item.exam_id ?? 0,
          patient_id: item.patient_id ?? "",
          view_type: item.view_type ?? "",
          device: item.device ?? "",
          qc_status: item.qc_summary ?? "",
          exam_date: item.exam_date ?? "",
          has_report: !!item.qc_summary,
        }));

        if (!canceled) setRows(mapped);
      } catch (e: any) {
        if (!canceled) {
          setErrorTable(e?.message ?? "Failed to load QC records");
        }
      } finally {
        if (!canceled) setLoadingTable(false);
      }
    }

    loadExams();
    return () => {
      canceled = true;
    };
  }, []);

  // ---------- FALLBACK KPI computed from rows ----------
  const computedFromRows = useMemo(() => {
    const total = rows.length;
    if (!total) return { total: 0, passRate: 0, fixRate: 0, flagRate: 0 };

    const pass = rows.filter((r) => r.qc_status === "PASS").length;
    const fix = rows.filter((r) => r.qc_status === "FIX").length;
    const flag = rows.filter((r) => r.qc_status === "FLAG").length;

    const toPct = (n: number) => Math.round((n / total) * 1000) / 10;

    return {
      total,
      passRate: toPct(pass),
      fixRate: toPct(fix),
      flagRate: toPct(flag),
    };
  }, [rows]);

  const total = summary?.total_records ?? computedFromRows.total;
  const passRate = summary?.pass_rate ?? computedFromRows.passRate;
  const fixRate = summary?.fix_rate ?? computedFromRows.fixRate;
  const flagRate = summary?.flag_rate ?? computedFromRows.flagRate;

  // ---------- SEARCH ----------
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      return (
        r.patient_id.toLowerCase().includes(q) ||
        (r.device ?? "").toLowerCase().includes(q) ||
        (r.view_type ?? "").toLowerCase().includes(q) ||
        String(r.qc_status).toLowerCase().includes(q)
      );
    });
  }, [rows, search]);

  // ---------- REPORT ----------
  const handleViewReport = async (examId: number) => {
    try {
      const res = await fetch(`${API_BASE}/qc/${examId}/report`, {
        method: "GET",
        headers: { Accept: "application/pdf" },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Report failed (${res.status}): ${txt}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      alert(e?.message ?? "Failed to open report");
    }
  };

  // ---------- RENDER ----------
  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      {/* unified content width + centered */}
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-2xl text-gray-900 mb-2">Patient X-ray Records</h1>
        <p className="text-gray-600 mb-6">
          Review and manage chest X-ray quality control
        </p>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Records</p>
            <p className="text-3xl text-gray-900 mt-1">
              {loadingSummary ? "…" : total}
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600">Pass Rate</p>
            <p className="text-3xl mt-1 text-green-600">
              {passRate.toFixed(1)}%
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600">Fix Required</p>
            <p className="text-3xl mt-1 text-yellow-600">
              {fixRate.toFixed(1)}%
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600">Flagged</p>
            <p className="text-3xl mt-1 text-red-600">
              {flagRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {errorSummary && (
          <p className="text-sm text-red-600 mb-4">
            Summary error: {errorSummary}
          </p>
        )}

        {/* Search */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search by Patient ID, Device, or Status…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline">Filter</Button>
        </div>

        {/* Table */}
        <div className="bg-white border rounded-lg overflow-hidden">
          {/* inner wrapper adds horizontal padding so cells are not glued to the border */}
          <div className="px-6">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm">
                <tr>
                  <th className="py-3">Patient ID</th>
                  <th className="px-5 py-3">View Type</th>
                  <th className="px-5 py-3">Device</th>
                  <th className="px-5 py-3">QC Status</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loadingTable && (
                  <tr>
                    <td className="py-6 text-gray-500" colSpan={6}>
                      Loading…
                    </td>
                  </tr>
                )}

                {errorTable && !loadingTable && (
                  <tr>
                    <td className="py-6 text-red-600" colSpan={6}>
                      {errorTable}
                    </td>
                  </tr>
                )}

                {!loadingTable &&
                  !errorTable &&
                  filteredRows.length === 0 && (
                    <tr>
                      <td className="py-6 text-gray-500" colSpan={6}>
                        No records found.
                      </td>
                    </tr>
                  )}

                {!loadingTable &&
                  !errorTable &&
                  filteredRows.map((r) => (
                    <tr key={r.exam_id} className="border-t">
                      <td className="py-3 font-medium text-gray-900">
                        {r.patient_id}
                      </td>
                      <td className="px-5 py-3">{r.view_type}</td>
                      <td className="px-5 py-3">{r.device}</td>
                      <td className="px-5 py-3">
                        {r.qc_status === "PASS" && (
                          <span className="text-green-700 bg-green-100 px-2 py-1 rounded-md text-xs">
                            PASS
                          </span>
                        )}
                        {r.qc_status === "FIX" && (
                          <span className="text-yellow-700 bg-yellow-100 px-2 py-1 rounded-md text-xs">
                            FIX
                          </span>
                        )}
                        {r.qc_status === "FLAG" && (
                          <span className="text-red-700 bg-red-100 px-2 py-1 rounded-md text-xs">
                            FLAG
                          </span>
                        )}
                        {r.qc_status !== "PASS" &&
                          r.qc_status !== "FIX" &&
                          r.qc_status !== "FLAG" && (
                            <span className="px-2 py-1 rounded-md text-xs border border-gray-300 text-gray-700">
                              {String(r.qc_status || "—")}
                            </span>
                          )}
                      </td>
                      <td className="px-5 py-3">{r.exam_date}</td>
                      <td className="px-5 py-3 space-x-2">
                        <Button
                          variant="link"
                          onClick={() => onViewImage(r.patient_id)}
                        >
                          View in QC Viewer
                        </Button>
                        <Button
                          variant="link"
                          disabled={r.has_report === false}
                          onClick={() => handleViewReport(r.exam_id)}
                        >
                          View / Download report
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
