import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './components/DashboardPage';
import { ImageViewerPage } from './components/ImageViewerPage';
import { QCReportPage } from './components/QCReportPage';
import { AnalyticsPage } from './components/AnalyticsPage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedPatient, setSelectedPatient] = useState('PT-2025-002');

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleViewImage = (patientId: string) => {
    setSelectedPatient(patientId);
    setCurrentPage('viewer');
  };

  const handleGenerateReport = () => {
    setCurrentPage('reports');
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      {currentPage === 'dashboard' && <DashboardPage onViewImage={handleViewImage} />}
      {currentPage === 'viewer' && (
        <ImageViewerPage
          patientId={selectedPatient}
          onGenerateReport={handleGenerateReport}
        />
      )}
      {currentPage === 'reports' && <QCReportPage />}
      {currentPage === 'analytics' && <AnalyticsPage />}
      {currentPage === 'settings' && (
        <div className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl text-gray-900 mb-2">Settings</h2>
            <p className="text-gray-600">Settings page coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
}
