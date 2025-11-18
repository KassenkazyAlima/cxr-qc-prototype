import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  X,
  Image as ImageIcon,
  Wand2,
  Calendar as Cal,
  Save,
  AlertTriangle,
  UserPlus,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

type Sex = "M" | "F" | "O" | "";

const todayISO = () => new Date().toISOString().slice(0, 10);

const fieldBase =
  "block w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500";

export function PatientRegistrationPage() {
  const navigate = useNavigate();

  // --- form state
  const [patientId, setPatientId] = useState("PT-2025-020");
  const [firstName, setFirstName] = useState("John");
  const [lastName, setLastName] = useState("Mack");
  const [dob, setDob] = useState<string>("");
  const [sex, setSex] = useState<Sex>("");
  const [notes, setNotes] = useState("");

  const [accession, setAccession] = useState("H1234567");
  const [examDate, setExamDate] = useState<string>(todayISO());
  const [viewType, setViewType] = useState("PA");
  const [device, setDevice] = useState("Siemens Multix");
  const [technician, setTechnician] = useState("John Technician");

  // --- image
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // preview height control
  const [previewH, setPreviewH] = useState<number>(420); // px

  const onPick = (f: File | null) => {
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const onDrop: React.DragEventHandler<HTMLLabelElement> = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) onPick(f);
  };

  // computed & validation
  const canSubmit = useMemo(
    () => Boolean(patientId && firstName && lastName && examDate && viewType),
    [patientId, firstName, lastName, examDate, viewType]
  );

  const age = useMemo(() => {
    if (!dob) return "";
    const d = new Date(dob);
    if (isNaN(+d)) return "";
    const now = new Date();
    let y = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) y--;
    return y >= 0 ? `${y}y` : "";
  }, [dob]);

  const [error, setError] = useState<string | null>(null);

  function validate(): string | null {
    if (!patientId.trim()) return "Patient ID is required.";
    if (!firstName.trim()) return "First name is required.";
    if (!lastName.trim()) return "Last name is required.";
    if (!examDate) return "Exam date is required.";
    if (dob) {
      const d = new Date(dob);
      if (d > new Date()) return "Date of birth cannot be in the future.";
      const ex = new Date(examDate);
      if (d > ex) return "Date of birth must be earlier than the exam date.";
    }
    return null;
  }

  // keyboard: Cmd/Ctrl + S
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [patientId, firstName, lastName, examDate, viewType, dob]);

  const generateId = () => {
    const n = Math.floor(100 + Math.random() * 900);
    setPatientId(`PT-${new Date().getFullYear()}-${n}`);
  };

  const handleSubmit = async () => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    if (!canSubmit) return;
    setError(null);
    // TODO: POST to backend when endpoint is ready.
    // await fetch(`${API_BASE}/records`, { method: "POST", headers: {'Content-Type':'application/json'}, body: JSON.stringify({...}) });
    navigate("/viewer"); // open the viewer flow you already have
  };

  const status = patientId || firstName || lastName ? "Open" : "Draft";

  return (
    <div className="flex-1 bg-gray-50">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 -mx-0 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-screen-2xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserPlus className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Register New Patient</h1>
              <p className="text-sm text-gray-500">
                {accession ? (
                  <>
                    Accession <span className="font-medium text-gray-700">{accession}</span>
                    {(firstName || lastName) && (
                      <>
                        {" · "}
                        {lastName}, {firstName}
                      </>
                    )}
                  </>
                ) : (
                  "Create a patient and exam record before running QC."
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                status === "Open" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
              }`}
            >
              {status}
            </span>
            <Button onClick={handleSubmit} disabled={!canSubmit} className="gap-2">
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl px-6 pb-28 pt-8 space-y-6">
        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left card — Patient */}
          <section className="xl:col-span-7 bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-gray-900 mb-1">Patient &amp; Exam Details</h2>
            <p className="text-sm text-gray-500 mb-6">
              Fields marked with <span className="text-red-500">*</span> are required. Press{" "}
              <span className="font-medium">⌘/Ctrl + S</span> to save.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="pid" className="text-sm text-gray-700">
                  Patient ID <span className="text-red-500">*</span>
                </Label>
                <div className="mt-1.5 flex gap-2">
                  <input
                    id="pid"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className={fieldBase}
                    placeholder="Local MRN or study ID"
                    aria-required
                  />
                  <Button type="button" variant="outline" onClick={generateId} className="shrink-0">
                    <Wand2 className="w-4 h-4 mr-1" /> Generate
                  </Button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Local MRN or system-generated ID.</p>
              </div>

              <div>
                <Label htmlFor="acc" className="text-sm text-gray-700">
                  Accession number
                </Label>
                <input
                  id="acc"
                  value={accession}
                  onChange={(e) => setAccession(e.target.value)}
                  className={fieldBase}
                  placeholder="H1234567"
                />
                <p className="mt-1 text-xs text-gray-500">Auto-fills from PACS when available.</p>
              </div>

              <div>
                <Label htmlFor="fname" className="text-sm text-gray-700">
                  First name <span className="text-red-500">*</span>
                </Label>
                <input
                  id="fname"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={fieldBase}
                  placeholder="John"
                  aria-required
                />
              </div>

              <div>
                <Label htmlFor="lname" className="text-sm text-gray-700">
                  Last name <span className="text-red-500">*</span>
                </Label>
                <input
                  id="lname"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={fieldBase}
                  placeholder="Doe"
                  aria-required
                />
              </div>

              <div>
                <Label className="text-sm text-gray-700" htmlFor="dob">
                  Date of birth
                </Label>
                <div className="relative mt-1.5">
                  <Cal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="dob"
                    type="date"
                    value={dob}
                    max={todayISO()}
                    onChange={(e) => setDob(e.target.value)}
                    className={`${fieldBase} pl-9`}
                  />
                </div>
                {age && <p className="mt-1 text-xs text-gray-500">Age: {age}</p>}
              </div>

              <div>
                <Label className="text-sm text-gray-700" htmlFor="sex">
                  Sex
                </Label>
                <select
                  id="sex"
                  value={sex}
                  onChange={(e) => setSex(e.target.value as Sex)}
                  className={`${fieldBase}`}
                >
                  <option value="">Select…</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="notes" className="text-sm text-gray-700">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1.5 w-full min-h-[88px] rounded-lg border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                  placeholder="Clinical indication, positioning notes, QC flags…"
                />
              </div>
            </div>
          </section>

          {/* Right card — Exam + Image */}
          <section className="xl:col-span-5 space-y-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-gray-900 mb-4">Exam</h2>

              <div className="grid grid-cols-1 gap-5">
                <div>
                  <Label htmlFor="examDate" className="text-sm text-gray-700">
                    Exam date <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1.5">
                    <Cal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="examDate"
                      type="date"
                      value={examDate}
                      max={todayISO()}
                      onChange={(e) => setExamDate(e.target.value)}
                      className={`${fieldBase} pl-9`}
                      aria-required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="viewType" className="text-sm text-gray-700">
                      View type <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="viewType"
                      value={viewType}
                      onChange={(e) => setViewType(e.target.value)}
                      className={fieldBase}
                    >
                      <option value="PA">PA</option>
                      <option value="AP">AP</option>
                      <option value="Lateral">Lateral</option>
                      <option value="AP Supine">AP Supine</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="device" className="text-sm text-gray-700">
                      Device
                    </Label>
                    <select
                      id="device"
                      value={device}
                      onChange={(e) => setDevice(e.target.value)}
                      className={fieldBase}
                    >
                      <option>Siemens Multix</option>
                      <option>GE Discovery XR656</option>
                      <option>Philips DigitalDiagnost</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="technician" className="text-sm text-gray-700">
                    Technician
                  </Label>
                  <input
                    id="technician"
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    className={fieldBase}
                    placeholder="Tech name"
                  />
                </div>
              </div>
            </div>

            {/* Image upload */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-gray-900 mb-4">Attach X-ray (optional)</h2>

              {!preview ? (
                <label
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 py-14 hover:bg-gray-50"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-700">
                    Click to upload <span className="text-gray-400">or</span> drag & drop
                  </p>
                  <p className="text-xs text-gray-500">PNG/JPG for now (DICOM later)</p>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onPick(e.target.files?.[0] ?? null)}
                  />
                </label>
              ) : (
                <div className="space-y-3">
                  <div
                    className="rounded-xl bg-gray-900 w-full overflow-hidden flex items-center justify-center"
                    style={{ height: `${previewH}px` }}
                  >
                    <img src={preview} alt="preview" className="max-h-full max-w-full object-contain" />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ImageIcon className="w-4 h-4" />
                      <span className="truncate max-w-[240px]">{file?.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Size</span>
                      <input
                        type="range"
                        min={280}
                        max={720}
                        step={20}
                        value={previewH}
                        onChange={(e) => setPreviewH(Number(e.target.value))}
                        className="w-40"
                        aria-label="Preview size"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => onPick(null)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-64 right-0 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-t border-gray-200">
        <div className="mx-auto max-w-screen-2xl px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Press <span className="font-medium">⌘/Ctrl + S</span> to save.
          </p>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="border-gray-300">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
            >
              Save &amp; Open in Viewer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
