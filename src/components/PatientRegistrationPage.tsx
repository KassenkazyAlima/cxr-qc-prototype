import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Upload,
  X,
  Image as ImageIcon,
  Save,
  AlertTriangle,
  UserPlus,
  Wand2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useTranslation } from "react-i18next";

// -------- Types & helpers --------

type Sex = "M" | "F" | "O" | "";
type Modality = "XR" | "CT" | "MRI" | "US" | "Other" | "";

interface PatientData {
  id?: number;            // для PUT
  created_at?: string;    // для PUT
  patient_id: string;
  first_name: string;
  last_name: string;
  birth_date: string; // YYYY-MM-DD
  sex: Sex;
}

interface ExamData {
  accession: string;
  examDate: string;
  modality: Modality;
  viewType: string;
  device: string;
  technician: string;
  notes: string;
}

const PATIENT_API_URL = "http://localhost:8000/patients/patients/";

const todayISO = () => new Date().toISOString().slice(0, 10);

const fieldBase =
  "block w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500";

const labelClass = "block text-sm text-gray-700 mb-1.5";

// -------- Component --------

export function PatientRegistrationPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { patientId } = useParams<{ patientId?: string }>();
  const isEdit = !!patientId;

  const [patientData, setPatientData] = useState<PatientData>({
    patient_id: "",
    first_name: "",
    last_name: "",
    birth_date: "",
    sex: "",
  });

  const [examData, setExamData] = useState<ExamData>({
    accession: "H1234567",
    examDate: todayISO(),
    modality: "XR",
    viewType: "PA",
    device: "Siemens Multix",
    technician: "John Technician",
    notes: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewH, setPreviewH] = useState<number>(420);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingPatient, setLoadingPatient] = useState<boolean>(isEdit);

  // -------- LOAD PATIENT IN EDIT MODE --------

  useEffect(() => {
    if (!isEdit) return;

    const loadPatient = async () => {
      try {
        setLoadingPatient(true);
        setError(null);

        const res = await fetch(
          `${PATIENT_API_URL}${encodeURIComponent(patientId!)}/`
        );
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Failed to load patient (${res.status}): ${txt}`);
        }
        const data = await res.json();

        // маппинг из backend → в state
        setPatientData({
          id: data.id,
          created_at: data.created_at,
          patient_id: data.patient_id,
          first_name: data.first_name,
          last_name: data.last_name,
          // у тебя в API может быть birth_date или date_of_birth
          birth_date: data.birth_date ?? data.date_of_birth ?? "",
          sex: (data.sex ?? "") as Sex,
        });

        // если когда-нибудь будешь хранить exam в БД — тут можно тоже префиллить examData
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "Failed to load patient data.");
      } finally {
        setLoadingPatient(false);
      }
    };

    loadPatient();
  }, [isEdit, patientId]);

  // -------- field handlers --------

  const handlePatientChange = useCallback(
    (key: keyof PatientData, value: string | Sex) => {
      setPatientData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleExamChange = useCallback(
    (key: keyof ExamData, value: string | Modality) => {
      setExamData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // -------- image logic --------

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

  // -------- derived data --------

  const age = useMemo(() => {
    if (!patientData.birth_date) return "";
    const d = new Date(patientData.birth_date);
    if (isNaN(+d)) return "";
    const now = new Date();
    let y = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) y--;
    return y >= 0 ? `${y}y` : "";
  }, [patientData.birth_date]);

  const validate = useCallback((): string | null => {
    if (
      !patientData.patient_id.trim() ||
      !patientData.first_name.trim() ||
      !patientData.last_name.trim() ||
      !patientData.birth_date
    ) {
      return t("reg_alert_error", "Please fill all required patient fields.");
    }

    if (!examData.examDate || !examData.modality) {
      return t("reg_alert_error", "Please fill all required exam fields.");
    }

    const birth = new Date(patientData.birth_date);
    const now = new Date();
    if (birth > now) {
      return t("reg_alert_error", "Birth date cannot be in the future.");
    }

    const exam = new Date(examData.examDate);
    if (birth > exam) {
      return t(
        "reg_alert_error",
        "Birth date must be earlier than the exam date."
      );
    }

    return null;
  }, [patientData, examData, t]);

  const canSubmit = useMemo(() => !validate(), [validate]);

  const generateId = () => {
    if (isEdit) return; // не генерим новый ID в режиме редактирования
    const n = Math.floor(1001 + Math.random() * 8999);
    setPatientData((prev) => ({
      ...prev,
      patient_id: `P-${n}`,
    }));
  };

  // -------- submit --------

  const handleSubmit = useCallback(async () => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    if (!canSubmit) return;

    setError(null);

    const patientPayload: any = {
      patient_id: patientData.patient_id,
      first_name: patientData.first_name,
      last_name: patientData.last_name,
      birth_date: patientData.birth_date,
      sex: patientData.sex,
    };

    // для PUT добавляем то, что приходит с бэка
    if (isEdit) {
      if (patientData.id !== undefined) {
        patientPayload.id = patientData.id;
      }
      if (patientData.created_at) {
        patientPayload.created_at = patientData.created_at;
      }
    }

    const debugExamAndImage = {
      exam: examData,
      image_file: file ? { name: file.name, size: file.size } : null,
    };
    console.log("Patient payload:", patientPayload);
    console.log("Exam + image (not sent yet):", debugExamAndImage);

    try {
      const url = isEdit
        ? `${PATIENT_API_URL}${encodeURIComponent(patientId!)}/`
        : PATIENT_API_URL;

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientPayload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Backend error:", res.status, text);
        setError(
          isEdit
            ? `Failed to update patient (${res.status})`
            : `Failed to register patient (${res.status})`
        );
        return;
      }

      const saved = await res.json();
      console.log(isEdit ? "Updated patient:" : "Created patient:", saved);

      alert(
        t("reg_alert_success", {
          patientId: saved.patient_id ?? patientData.patient_id,
          defaultValue: isEdit
            ? `Patient ${saved.patient_id ?? patientData.patient_id} updated`
            : `Patient ${saved.patient_id ?? patientData.patient_id} created`,
        })
      );

      // после редактирования логичнее вернуть на список пациентов
      navigate("/patients");
    } catch (err) {
      console.error(err);
      setError(
        t(
          "reg_alert_error_network",
          "Network error while registering patient."
        )
      );
    }
  }, [
    validate,
    canSubmit,
    patientData,
    examData,
    file,
    navigate,
    t,
    isEdit,
    patientId,
  ]);

  // Cmd/Ctrl + S
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSubmit]);

  const status =
    patientData.patient_id &&
    patientData.first_name &&
    patientData.last_name
      ? "Open"
      : "Draft";

  // -------- UI --------

  return (
    <div className="flex-1 bg-gray-50">
      {/* Top sticky header */}
      <div className="sticky top-0 z-20 -mx-0 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-screen-2xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserPlus className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
                {isEdit
                  ? t("reg_title_edit", "Edit patient")
                  : t("reg_title", "Register patient")}
              </h1>
              <p className="text-sm text-gray-500">
                {examData.accession ? (
                  <>
                    {t("reg_title_accession_label", "Accession")}{" "}
                    <span className="font-medium text-gray-700">
                      {examData.accession}
                    </span>
                    {patientData.first_name && patientData.last_name && (
                      <>
                        {" · "}
                        {patientData.last_name}, {patientData.first_name}
                      </>
                    )}
                  </>
                ) : (
                  t(
                    "reg_title_sub",
                    "Create a patient and exam record before running QC."
                  )
                )}
              </p>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              status === "Open"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {status}
          </span>
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

        {loadingPatient && (
          <div className="text-sm text-gray-500 mb-2">
            Loading patient data…
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* LEFT: Patient + Exam (big card #1) */}
          <section className="xl:col-span-7 bg-white border border-gray-100 shadow-sm rounded-2xl p-6 space-y-8">
            {/* Patient section */}
            <div>
              <header className="mb-4">
                <h2 className="text-base font-semibold text-gray-900">
                  {t("reg_info_header", "Patient details")}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {t(
                    "reg_info_helper",
                    "Fill basic patient demographics. Fields marked * are required."
                  )}
                </p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* patient_id */}
                <div className="md:col-span-2">
                  <Label htmlFor="pid" className={labelClass}>
                    {t("reg_info_patient_id", "Patient ID")}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <input
                      id="pid"
                      value={patientData.patient_id}
                      onChange={(e) =>
                        handlePatientChange("patient_id", e.target.value)
                      }
                      className={fieldBase}
                      placeholder="P-1001"
                      aria-required
                      disabled={isEdit} // ID лучше не менять при редактировании
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateId}
                      className="shrink-0"
                      disabled={isEdit}
                    >
                      <Wand2 className="w-4 h-4 mr-1" />
                      {t("reg_action_generate_id", "Generate")}
                    </Button>
                  </div>
                </div>

                {/* first_name */}
                <div>
                  <Label htmlFor="fname" className={labelClass}>
                    {t("reg_info_first_name", "First name")}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <input
                    id="fname"
                    value={patientData.first_name}
                    onChange={(e) =>
                      handlePatientChange("first_name", e.target.value)
                    }
                    className={fieldBase}
                    placeholder="Aruzhan"
                    aria-required
                  />
                </div>

                {/* last_name */}
                <div>
                  <Label htmlFor="lname" className={labelClass}>
                    {t("reg_info_last_name", "Last name")}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <input
                    id="lname"
                    value={patientData.last_name}
                    onChange={(e) =>
                      handlePatientChange("last_name", e.target.value)
                    }
                    className={fieldBase}
                    placeholder="Tulegenova"
                    aria-required
                  />
                </div>

                {/* birth_date */}
                <div>
                  <Label htmlFor="dob" className={labelClass}>
                    {t("reg_info_dob", "Date of birth")}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <input
                    id="dob"
                    type="date"
                    value={patientData.birth_date}
                    max={todayISO()}
                    onChange={(e) =>
                      handlePatientChange("birth_date", e.target.value)
                    }
                    className={fieldBase}
                    aria-required
                  />
                  {age && (
                    <p className="mt-1 text-xs text-gray-500">
                      {t("reg_info_age_label", "Age")}: {age}
                    </p>
                  )}
                </div>

                {/* sex */}
                <div>
                  <Label htmlFor="sex" className={labelClass}>
                    {t("reg_info_sex", "Sex")}
                  </Label>
                  <select
                    id="sex"
                    value={patientData.sex}
                    onChange={(e) =>
                      handlePatientChange("sex", e.target.value as Sex)
                    }
                    className={fieldBase}
                  >
                    <option value="">
                      {t("reg_info_sex_placeholder", "Select…")}
                    </option>
                    <option value="M">{t("reg_info_sex_m", "Male")}</option>
                    <option value="F">{t("reg_info_sex_f", "Female")}</option>
                    <option value="O">{t("reg_info_sex_o", "Other")}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Divider between Patient and Exam */}
            <div className="border-t border-gray-100" />

            {/* Exam section */}
            <div>
              <header className="mb-4">
                <h2 className="text-base font-semibold text-gray-900">
                  {t("reg_exam_header", "Exam details")}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {t(
                    "reg_exam_helper",
                    "Describe the exam used for this QC record."
                  )}
                </p>
              </header>

              <div className="grid grid-cols-1 gap-5">
                {/* accession */}
                <div>
                  <Label htmlFor="acc" className={labelClass}>
                    {t("reg_exam_accession", "Accession number")}
                  </Label>
                  <input
                    id="acc"
                    value={examData.accession}
                    onChange={(e) =>
                      handleExamChange("accession", e.target.value)
                    }
                    className={fieldBase}
                    placeholder="H1234567"
                  />
                </div>

                {/* exam date */}
                <div>
                  <Label htmlFor="examDate" className={labelClass}>
                    {t("reg_exam_date", "Exam date")}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <input
                    id="examDate"
                    type="date"
                    value={examData.examDate}
                    max={todayISO()}
                    onChange={(e) =>
                      handleExamChange("examDate", e.target.value)
                    }
                    className={fieldBase}
                    aria-required
                  />
                </div>

                {/* modality + viewType */}
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="modality" className={labelClass}>
                      {t("reg_exam_modality", "Modality")}{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="modality"
                      value={examData.modality}
                      onChange={(e) =>
                        handleExamChange(
                          "modality",
                          e.target.value as Modality
                        )
                      }
                      className={fieldBase}
                      aria-required
                    >
                      <option value="">
                        {t(
                          "reg_exam_select_modality",
                          "Select modality"
                        )}
                      </option>
                      <option value="XR">XR (X-Ray)</option>
                      <option value="CT">CT</option>
                      <option value="MRI">MRI</option>
                      <option value="US">US</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="viewType" className={labelClass}>
                      {t("reg_exam_type", "View type")}
                    </Label>
                    <select
                      id="viewType"
                      value={examData.viewType}
                      onChange={(e) =>
                        handleExamChange("viewType", e.target.value)
                      }
                      className={fieldBase}
                    >
                      <option value="PA">PA</option>
                      <option value="AP">AP</option>
                      <option value="Lateral">Lateral</option>
                      <option value="AP Supine">AP Supine</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* device + tech */}
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="device" className={labelClass}>
                      {t("reg_exam_device", "Device")}
                    </Label>
                    <select
                      id="device"
                      value={examData.device}
                      onChange={(e) =>
                        handleExamChange("device", e.target.value)
                      }
                      className={fieldBase}
                    >
                      <option>Siemens Multix</option>
                      <option>GE Discovery XR656</option>
                      <option>Philips DigitalDiagnost</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="technician" className={labelClass}>
                      {t("reg_exam_tech", "Technician")}
                    </Label>
                    <input
                      id="technician"
                      value={examData.technician}
                      onChange={(e) =>
                        handleExamChange("technician", e.target.value)
                      }
                      className={fieldBase}
                      placeholder="Tech name"
                    />
                  </div>
                </div>

                {/* notes */}
                <div>
                  <Label htmlFor="notes" className={labelClass}>
                    {t("reg_notes_header", "Exam notes")}
                  </Label>
                  <Textarea
                    id="notes"
                    value={examData.notes}
                    onChange={(e) =>
                      handleExamChange("notes", e.target.value)
                    }
                    className="mt-1.5 w-full min-h-[88px] rounded-lg border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                    placeholder={t(
                      "reg_notes_placeholder",
                      "Clinical indication, positioning notes, QC flags…"
                    )}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT: Image upload (big card #2) */}
          <section className="xl:col-span-5 bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              {t("reg_image_header", "Attach X-ray (optional)")}
            </h2>

            {!preview ? (
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 py-14 hover:bg-gray-50"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-sm text-gray-700 text-center">
                  {t(
                    "reg_image_upload_placeholder",
                    "Click to upload or drag & drop image"
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  PNG/JPG for now (DICOM later)
                </p>
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
                  style={{ height: previewH }}
                >
                  <img
                    src={preview}
                    alt="preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ImageIcon className="w-4 h-4" />
                    <span className="truncate max-w-[240px]">
                      {file?.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {t("reg_image_size_label", "Size")}
                    </span>
                    <input
                      type="range"
                      min={280}
                      max={720}
                      step={20}
                      value={previewH}
                      onChange={(e) =>
                        setPreviewH(Number(e.target.value))
                      }
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
                    {t("reg_image_remove", "Remove")}
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Bottom sticky action bar */}
      <div className="fixed bottom-0 left-64 right-0 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-t border-gray-200">
        <div className="mx-auto max-w-screen-2xl px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Save className="w-3 h-3" />
            {t(
              "reg_action_hint",
              "Press ⌘/Ctrl + S to save or use the button."
            )}
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="border-gray-300"
            >
              {t("reg_action_cancel", "Cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || loadingPatient}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 gap-2"
            >
              <Save className="w-4 h-4" />
              {isEdit
                ? t("reg_action_save_edit", "Save changes")
                : t(
                    "reg_action_save_continue",
                    "Save & open in viewer"
                  )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
