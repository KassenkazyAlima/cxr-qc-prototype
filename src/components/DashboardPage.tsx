// src/components/DashboardPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

type QCStatus = "PASS" | "FIX" | "FLAG";
type RecordRow = {
  id: string;                // study/exam id (optional, if you use it)
  patient_id: string;
  view_type: string;         // "PA", "Lateral"
  device: string;            // "Siemens Multix"
  qc_status: QCStatus;       // "PASS" | "FIX" | "FLAG"
  date: string;              // ISO date "2025-11-02"
};

interface DashboardPageProps {
  onViewImage: (patientId: string) => void;
}

export function DashboardPage({ onViewImage }: DashboardPageProps) {
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // fetch records from backend
  useEffect(() => {
    let canceled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const url = new URL(`${API_BASE}/records/records`);
        if (search.trim()) url.searchParams.set("search", search.trim());
        url.searchParams.set("page", "1");
        url.searchParams.set("page_size", "25");

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        // expected: { items: RecordRow[], total: number } (see backend below)
        const data = await res.json();
        if (!canceled) setRows(data.items ?? data); // tolerate simple list too
      } catch (e: any) {
        if (!canceled) setError(e?.message ?? "Failed to load records");
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    // slight debounce for search typing
    const t = setTimeout(load, 250);
    return () => {
      canceled = true;
      clearTimeout(t);
    };
  }, [search]);

  // KPIs
  const { total, passRate, fixRate, flagRate } = useMemo(() => {
    const total = rows.length;
    if (!total) return { total: 0, passRate: 0, fixRate: 0, flagRate: 0 };
    const pass = rows.filter(r => r.qc_status === "PASS").length;
    const fix = rows.filter(r => r.qc_status === "FIX").length;
    const flag = rows.filter(r => r.qc_status === "FLAG").length;
    return {
      total,
      passRate: Math.round((pass / total) * 1000) / 10,
      fixRate: Math.round((fix / total) * 1000) / 10,
      flagRate: Math.round((flag / total) * 1000) / 10,
    };
  }, [rows]);

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="p-8">
        <h1 className="text-2xl text-gray-900 mb-2">Patient X-ray Records</h1>
        <p className="text-gray-600 mb-6">Review and manage chest X-ray quality control</p>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Records</p>
            <p className="text-3xl text-gray-900 mt-1">{total}</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600">Pass Rate</p>
            <p className="text-3xl mt-1 text-green-600">{passRate.toFixed(1)}%</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600">Fix Required</p>
            <p className="text-3xl mt-1 text-yellow-600">{fixRate.toFixed(1)}%</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600">Flagged</p>
            <p className="text-3xl mt-1 text-red-600">{flagRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* Search + (optional) filter button */}
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
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="px-5 py-3">Patient ID</th>
                <th className="px-5 py-3">View Type</th>
                <th className="px-5 py-3">Device</th>
                <th className="px-5 py-3">QC Status</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading && (
                <tr>
                  <td className="px-5 py-6 text-gray-500" colSpan={6}>
                    Loading…
                  </td>
                </tr>
              )}
              {error && !loading && (
                <tr>
                  <td className="px-5 py-6 text-red-600" colSpan={6}>
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td className="px-5 py-6 text-gray-500" colSpan={6}>
                    No records found.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                rows.map((r) => (
                  <tr key={r.id ?? `${r.patient_id}-${r.date}`} className="border-t">
                    <td className="px-5 py-3 font-medium text-gray-900">{r.patient_id}</td>
                    <td className="px-5 py-3">{r.view_type}</td>
                    <td className="px-5 py-3">{r.device}</td>
                    <td className="px-5 py-3">
                      {r.qc_status === "PASS" && (
                        <span className="text-green-700 bg-green-100 px-2 py-1 rounded-md text-xs">PASS</span>
                      )}
                      {r.qc_status === "FIX" && (
                        <span className="text-yellow-700 bg-yellow-100 px-2 py-1 rounded-md text-xs">FIX</span>
                      )}
                      {r.qc_status === "FLAG" && (
                        <span className="text-red-700 bg-red-100 px-2 py-1 rounded-md text-xs">FLAG</span>
                      )}
                    </td>
                    <td className="px-5 py-3">{r.date}</td>
                    <td className="px-5 py-3">
                      <Button variant="link" onClick={() => onViewImage(r.patient_id)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
