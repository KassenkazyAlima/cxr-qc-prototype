// src/App.tsx
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { LoginPage } from "./components/LoginPage";
import { Sidebar } from "./components/Sidebar";
import { DashboardPage } from "./components/DashboardPage";
import { ImageViewerPage } from "./components/ImageViewerPage";
import { QCReportPage } from "./components/QCReportPage";
import { AnalyticsPage } from "./components/AnalyticsPage";
import { PatientRegistrationPage } from "./components/PatientRegistrationPage";
import { AdminPatientsPage } from "./components/AdminPatientsPage";

// Shell with sidebar + routes, used only after login
function AppShell() {
  const [selectedPatient, setSelectedPatient] = useState<string>("P-1001");
  const navigate = useNavigate();

  const handleViewImage = (patientId: string) => {
    setSelectedPatient(patientId);
    navigate("/viewer");
  };

  const handleGenerateReport = () => {
    navigate("/reports");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <Routes>
        {/* default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/dashboard"
          element={<DashboardPage onViewImage={handleViewImage} />}
        />

        <Route
          path="/viewer"
          element={
            <ImageViewerPage
              patientId={selectedPatient}
              onGenerateReport={handleGenerateReport}
            />
          }
        />

        {/* patient registration (create) */}
        <Route path="/register" element={<PatientRegistrationPage />} />
        <Route path="/patients/new" element={<PatientRegistrationPage />} />

        {/* patients list + edit */}
        <Route path="/patients" element={<AdminPatientsPage />} />
        <Route
          path="/patients/edit/:patientId"
          element={<PatientRegistrationPage />}
        />

        {/* reports + analytics */}
        <Route path="/reports" element={<QCReportPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    // later you’ll store token/role here as well
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <AppShell />
    </Router>
  );
}
