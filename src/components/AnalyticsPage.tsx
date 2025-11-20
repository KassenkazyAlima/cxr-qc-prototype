import React, { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

// Ответ /qc/qc
type QcApiRow = {
  id: number;
  exam_id: number;
  patient_id?: string;
  exam?: {
    id: number;
    patient_id: string;
    view_type?: string;
    device?: string;
    exam_date?: string;
  };
  qc_status?: string;
  needs_fix?: boolean;
  severe_flags?: string[];
  [key: string]: any;
};

type QcStats = {
  totalExams: number;
  passCount: number;
  fixCount: number;
  flagCount: number;
};

type ExamAnalytics = {
  examId: number;
  patientId: string;
  status: string;
  viewType?: string;
  device?: string;
  examDate?: string;
  severeFlags: string[];
  needsFix: boolean;
};

function classifyStatus(row: QcApiRow): "PASS" | "FIX" | "FLAG" {
  const backend = row.qc_status?.toUpperCase();
  if (backend === "PASS" || backend === "FIX" || backend === "FLAG") {
    return backend;
  }

  const severe = Array.isArray(row.severe_flags) ? row.severe_flags : [];
  if (severe.length > 0) return "FLAG";
  if (row.needs_fix) return "FIX";
  return "PASS";
}

// Общая функция агрегации для любых наборов записей
function buildStats(rows: QcApiRow[]): QcStats {
  const total = rows.length;
  let pass = 0,
    fix = 0,
    flag = 0;

  rows.forEach((r) => {
    const status = classifyStatus(r);
    if (status === "PASS") pass++;
    else if (status === "FIX") fix++;
    else flag++;
  });

  return {
    totalExams: total,
    passCount: pass,
    fixCount: fix,
    flagCount: flag,
  };
}

// Универсальный парсер ответа /qc/qc
function parseQcListResponse(body: any): QcApiRow[] {
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.items)) return body.items;
  if (body && Array.isArray(body.results)) return body.results;
  if (body && typeof body === "object" && "id" in body) {
    return [body as QcApiRow];
  }
  return [];
}

export function AnalyticsPage() {
  // ---- GLOBAL analytics ----
  const [globalStats, setGlobalStats] = useState<QcStats | null>(null);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // ---- PATIENT analytics ----
  const [patientId, setPatientId] = useState("P-1001");
  const [patientStats, setPatientStats] = useState<QcStats | null>(null);
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientError, setPatientError] = useState<string | null>(null);

  // ---- EXAM analytics ----
  const [examIdInput, setExamIdInput] = useState("");
  const [examAnalytics, setExamAnalytics] = useState<ExamAnalytics | null>(
    null
  );
  const [examLoading, setExamLoading] = useState(false);
  const [examError, setExamError] = useState<string | null>(null);

  // ----------------- LOAD GLOBAL ANALYTICS -----------------
  const loadGlobalAnalytics = async () => {
    setGlobalLoading(true);
    setGlobalError(null);
    setGlobalStats(null);

    try {
      const url = new URL(`${API_BASE}/qc/qc/`);
      // если есть лимиты/фильтры на бэке – можно добавить тут, напр.:
      // url.searchParams.set("limit", "1000");

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const body = await res.json();
      const rows = parseQcListResponse(body);

      const stats = buildStats(rows);
      setGlobalStats(stats);
    } catch (e: any) {
      setGlobalError(e?.message ?? "Failed to load global analytics");
    } finally {
      setGlobalLoading(false);
    }
  };

  // ----------------- LOAD PATIENT ANALYTICS -----------------
  const loadPatientAnalytics = async () => {
    const pid = patientId.trim();
    if (!pid) {
      alert("Enter patient ID");
      return;
    }

    setPatientLoading(true);
    setPatientError(null);
    setPatientStats(null);

    try {
      const url = new URL(`${API_BASE}/qc/qc/`);
      url.searchParams.set("patient_id", pid);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const body = await res.json();
      const rows = parseQcListResponse(body);

      const stats = buildStats(rows);
      setPatientStats(stats);
    } catch (e: any) {
      setPatientError(e?.message ?? "Failed to load patient analytics");
    } finally {
      setPatientLoading(false);
    }
  };

  // ----------------- LOAD EXAM ANALYTICS -----------------
  const loadExamAnalytics = async () => {
    const id = Number(examIdInput);
    if (!id || Number.isNaN(id)) {
      alert("Enter a valid exam ID (integer)");
      return;
    }

    setExamLoading(true);
    setExamError(null);
    setExamAnalytics(null);

    try {
      const res = await fetch(`${API_BASE}/qc/qc/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const row: QcApiRow = await res.json();

      const examId = row.exam_id ?? id;
      const patientId =
        row.patient_id ?? row.exam?.patient_id ?? "Unknown patient";
      const status = classifyStatus(row);
      const viewType = row.exam?.view_type;
      const device = row.exam?.device;
      const examDate = row.exam?.exam_date;
      const severeFlags = Array.isArray(row.severe_flags)
        ? row.severe_flags
        : [];
      const needsFix = !!row.needs_fix;

      setExamAnalytics({
        examId,
        patientId,
        status,
        viewType,
        device,
        examDate,
        severeFlags,
        needsFix,
      });
    } catch (e: any) {
      setExamError(e?.message ?? "Failed to load exam analytics");
    } finally {
      setExamLoading(false);
    }
  };

  // ----------------- CHART DATA -----------------
  const globalChartData = useMemo(() => {
    if (!globalStats) return [];
    return [
      { status: "PASS", value: globalStats.passCount },
      { status: "FIX", value: globalStats.fixCount },
      { status: "FLAG", value: globalStats.flagCount },
    ];
  }, [globalStats]);

  const patientChartData = useMemo(() => {
    if (!patientStats) return [];
    return [
      { status: "PASS", value: patientStats.passCount },
      { status: "FIX", value: patientStats.fixCount },
      { status: "FLAG", value: patientStats.flagCount },
    ];
  }, [patientStats]);

  const globalTotal = globalStats?.totalExams ?? 0;
  const globalPassRate =
    globalTotal > 0
      ? Math.round((globalStats!.passCount / globalTotal) * 1000) / 10
      : 0;
  const globalFixRate =
    globalTotal > 0
      ? Math.round((globalStats!.fixCount / globalTotal) * 1000) / 10
      : 0;
  const globalFlagRate =
    globalTotal > 0
      ? Math.round((globalStats!.flagCount / globalTotal) * 1000) / 10
      : 0;

  const totalExams = patientStats?.totalExams ?? 0;
  const passRate =
    totalExams > 0
      ? Math.round((patientStats!.passCount / totalExams) * 1000) / 10
      : 0;
  const fixRate =
    totalExams > 0
      ? Math.round((patientStats!.fixCount / totalExams) * 1000) / 10
      : 0;
  const flagRate =
    totalExams > 0
      ? Math.round((patientStats!.flagCount / totalExams) * 1000) / 10
      : 0;

  // ----------------- RENDER -----------------
  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-2xl text-gray-900 mb-1">
          QC Analytics Dashboard
        </h1>
        <p className="text-gray-600 mb-6">
          Deep dive into QC statistics for specific patients, exams and overall
          QC performance.
        </p>

        {/* ------------ GLOBAL ANALYTICS ------------ */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div className="bg-white border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-900 text-lg">Overall QC overview</h2>
              <Button onClick={loadGlobalAnalytics} disabled={globalLoading}>
                {globalLoading ? "Loading…" : "Load overall QC"}
              </Button>
            </div>

            {globalError && (
              <p className="text-sm text-red-600 mb-3">{globalError}</p>
            )}

            {globalStats && (
              <>
                <p className="text-sm text-gray-700 mb-2">
                  Total exams{" "}
                  <span className="font-semibold">{globalTotal}</span>
                </p>
                <p className="text-xs mb-4">
                  <span className="text-green-600 mr-3">
                    PASS: {globalStats.passCount} ({globalPassRate}%)
                  </span>
                  <span className="text-yellow-600 mr-3">
                    FIX: {globalStats.fixCount} ({globalFixRate}%)
                  </span>
                  <span className="text-red-600">
                    FLAG: {globalStats.flagCount} ({globalFlagRate}%)
                  </span>
                </p>

                <div className="h-64 border rounded-lg p-3 flex flex-col">
                  <p className="text-sm text-gray-800 mb-2">
                    Status distribution (all exams)
                  </p>
                  {globalTotal === 0 ? (
                    <div className="text-xs text-gray-500 mt-6">
                      No QC records found.
                    </div>
                  ) : (
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={globalChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="status" />
                          <YAxis allowDecimals={false} domain={[0, "dataMax"]} />
                          <Tooltip />
                          <Bar dataKey="value" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </>
            )}

            {!globalStats && !globalLoading && !globalError && (
              <p className="text-sm text-gray-500 mt-2">
                Click &quot;Load overall QC&quot; to see statistics across all
                exams.
              </p>
            )}
          </div>
        </div>

        {/* ------------ PATIENT + EXAM ANALYTICS ------------ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ------------ PATIENT ANALYTICS ------------ */}
          <div className="bg-white border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-900 text-lg">Patient analytics</h2>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <Input
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Patient ID"
              />
              <Button onClick={loadPatientAnalytics} disabled={patientLoading}>
                {patientLoading ? "Loading…" : "Load patient analytics"}
              </Button>
            </div>

            {patientError && (
              <p className="text-sm text-red-600 mb-3">{patientError}</p>
            )}

            {patientStats && (
              <>
                <p className="text-sm text-gray-700 mb-2">
                  Total exams{" "}
                  <span className="font-semibold">{totalExams}</span>
                </p>
                <p className="text-xs mb-4">
                  <span className="text-green-600 mr-3">
                    PASS: {patientStats.passCount} ({passRate}%)
                  </span>
                  <span className="text-yellow-600 mr-3">
                    FIX: {patientStats.fixCount} ({fixRate}%)
                  </span>
                  <span className="text-red-600">
                    FLAG: {patientStats.flagCount} ({flagRate}%)
                  </span>
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="h-64 border rounded-lg p-3 flex flex-col">
                    <p className="text-sm text-gray-800 mb-2">
                      Status distribution
                    </p>
                    {totalExams === 0 ? (
                      <div className="text-xs text-gray-500 mt-6">
                        No QC records found for this patient.
                      </div>
                    ) : (
                      <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={patientChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="status" />
                            <YAxis allowDecimals={false} domain={[0, "dataMax"]} />
                            <Tooltip />
                            <Bar dataKey="value" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  <div className="h-64 border rounded-lg p-3">
                    <p className="text-sm text-gray-800 mb-2">
                      Major / critical flags
                    </p>
                    {patientStats.flagCount === 0 ? (
                      <div className="text-xs text-gray-500 mt-6">
                        No FLAG records for this patient.
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 mt-4">
                        FLAG exams:{" "}
                        <span className="font-semibold">
                          {patientStats.flagCount}
                        </span>{" "}
                        out of{" "}
                        <span className="font-semibold">
                          {patientStats.totalExams}
                        </span>{" "}
                        ({flagRate}%)
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {!patientStats && !patientLoading && !patientError && (
              <p className="text-sm text-gray-500 mt-4">
                Enter a patient ID and click &quot;Load patient
                analytics&quot;.
              </p>
            )}
          </div>

          {/* ------------ EXAM ANALYTICS ------------ */}
          <div className="bg-white border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-900 text-lg">Exam analytics</h2>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <Input
                value={examIdInput}
                onChange={(e) => setExamIdInput(e.target.value)}
                placeholder="Exam ID (integer)"
              />
              <Button onClick={loadExamAnalytics} disabled={examLoading}>
                {examLoading ? "Loading…" : "Load exam analytics"}
              </Button>
            </div>

            {examError && (
              <p className="text-sm text-red-600 mb-3">{examError}</p>
            )}

            {!examAnalytics && !examLoading && !examError && (
              <p className="text-sm text-gray-500">
                Enter an exam ID and click &quot;Load exam analytics&quot;.
              </p>
            )}

            {examAnalytics && (
              <div className="mt-2 border rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold">Exam ID:</span>{" "}
                  {examAnalytics.examId}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold">Patient:</span>{" "}
                  {examAnalytics.patientId}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold">QC status:</span>{" "}
                  {examAnalytics.status}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold">View type:</span>{" "}
                  {examAnalytics.viewType || "—"}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold">Device:</span>{" "}
                  {examAnalytics.device || "—"}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold">Exam date:</span>{" "}
                  {examAnalytics.examDate || "—"}
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  <span className="font-semibold">Severe flags:</span>{" "}
                  {examAnalytics.severeFlags.length
                    ? examAnalytics.severeFlags.join(", ")
                    : "none"}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Needs fix:</span>{" "}
                  {examAnalytics.needsFix ? "yes" : "no"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
