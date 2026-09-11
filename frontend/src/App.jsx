import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { TrainingCenterDashboard } from './pages/TrainingCenterDashboard';
import { GovernmentDashboard } from './pages/GovernmentDashboard';
import { EmployerDashboard } from './pages/EmployerDashboard';
import { CandidateOnboarding } from './pages/CandidateOnboarding';
import { BatchCreationPage } from './pages/BatchCreationPage';
import { SkillAssessmentModule } from './pages/SkillAssessmentModule';
import { SkillScorecardPage } from './pages/SkillScorecardPage';
import { SkillMatchPage } from './pages/SkillMatchPage';
import { EmploymentStatusPage } from './pages/EmploymentStatusPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Unauthorized } from './pages/Unauthorized';

const DashboardRouter = () => {
  const { user, role, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-govt-navy flex items-center justify-center text-white font-roboto">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-govt-orange border-t-transparent animate-spin mx-auto"></div>
          <p className="text-xs tracking-wider uppercase font-bold">Loading Govt Portal Session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const renderContent = () => {
    if (activeTab === 'employment-status') {
      return <EmploymentStatusPage />;
    }

    if (activeTab === 'skill-match') {
      return <SkillMatchPage />;
    }

    if (activeTab === 'assessment') {
      return <SkillAssessmentModule onNavigateScorecard={() => setActiveTab('scorecard')} />;
    }

    if (activeTab === 'scorecard') {
      return <SkillScorecardPage />;
    }

    if (activeTab === 'onboarding' || activeTab === 'enrollment') {
      return <CandidateOnboarding />;
    }

    if (activeTab === 'create-batch') {
      return <BatchCreationPage />;
    }

    // Role specific dashboard default
    switch (role) {
      case 'candidate':
        return <CandidateDashboard activeTab={activeTab} onNavigateTab={(tab) => setActiveTab(tab)} />;
      case 'training_center':
        return <TrainingCenterDashboard activeTab={activeTab} />;
      case 'government':
        return <GovernmentDashboard activeTab={activeTab} onNavigateTab={(tab) => setActiveTab(tab)} />;
      case 'employer':
        return <EmployerDashboard activeTab={activeTab} />;
      default:
        return <CandidateDashboard activeTab={activeTab} onNavigateTab={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </MainLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
