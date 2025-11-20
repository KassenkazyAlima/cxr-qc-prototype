// src/components/AdminPatientsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export type Patient = {
  id: number;
  patient_id: string; // e.g. "P-1001"
  first_name: string;
  last_name: string;
  birth_date: string; // <-- как в backend (birth_date)
  sex: string;
  created_at?: string;
};

interface PatientsPageProps {
  onEditPatient?: (patientId: string) => void;
}

export function AdminPatientsPage({ onEditPatient }: PatientsPageProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const role = localStorage.getItem("role") || "ADMIN";
  const isAdmin = role === "ADMIN";

  const loadPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/patients/patients/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // поддержка разных форматов ответа: массив / {items} / {results}
      const rawItems: any[] = Array.isArray(data)
        ? data
        : (data.items ?? data.results ?? []);

      const items: Patient[] = rawItems.map((p: any) => ({
        id: p.id,
        patient_id: p.patient_id,
        first_name: p.first_name,
        last_name: p.last_name,
        // подстраховка: если вдруг поле называется иначе
        birth_date: p.birth_date ?? p.date_of_birth ?? "",
        sex: p.sex,
        created_at: p.created_at,
      }));

      setPatients(items);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => {
      const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
      return (
        p.patient_id.toLowerCase().includes(q) ||
        fullName.includes(q) ||
        (p.sex || "").toLowerCase().includes(q)
      );
    });
  }, [patients, search]);

  const handleDelete = async (p: Patient) => {
    if (!isAdmin) {
      alert("Only admin can delete patients.");
      return;
    }
    if (!window.confirm(`Delete patient ${p.patient_id}?`)) return;

    try {
      const res = await fetch(
        `${API_BASE}/patients/patients/${encodeURIComponent(p.patient_id)}/`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Delete failed (${res.status}): ${txt}`);
      }
      setPatients((prev) => prev.filter((x) => x.patient_id !== p.patient_id));
    } catch (e: any) {
      alert(e?.message ?? "Failed to delete patient");
    }
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl text-gray-900 mb-1">Patients</h1>
            <p className="text-gray-600">
              Manage patient records used for QC and reporting.
            </p>
          </div>

          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate("/patients/new")}
          >
            + New patient
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search by ID, name, or sex…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={loadPatients}>
            Refresh
          </Button>
        </div>

        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-5 py-3">Patient ID</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">DOB</th>
                <th className="px-5 py-3">Sex</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="px-5 py-6 text-gray-500" colSpan={5}>
                    Loading…
                  </td>
                </tr>
              )}
              {error && !loading && (
                <tr>
                  <td className="px-5 py-6 text-red-600" colSpan={5}>
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td className="px-5 py-6 text-gray-500" colSpan={5}>
                    No patients found.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                filtered.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {p.patient_id}
                    </td>
                    <td className="px-5 py-3">
                      {p.last_name} {p.first_name}
                    </td>
                    <td className="px-5 py-3">{p.birth_date}</td>
                    <td className="px-5 py-3">{p.sex}</td>
                    <td className="px-5 py-3 space-x-2">
                      <Button
                        variant="link"
                        onClick={() =>
                          onEditPatient
                            ? onEditPatient(p.patient_id)
                            : navigate(
                                `/patients/edit/${encodeURIComponent(
                                  p.patient_id
                                )}`
                              )
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        variant="link"
                        className="text-red-600"
                        onClick={() => handleDelete(p)}
                        disabled={!isAdmin}
                      >
                        Delete
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
