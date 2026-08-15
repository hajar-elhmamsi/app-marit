import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/Layout/AppLayout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { VisitesPage } from './pages/VisitesPage';
import { DAPsPage } from './pages/DAPsPage';
import { NaviresPage } from './pages/NaviresPage';
import { PortsPage } from './pages/PortsPage';
import { TerminauxPage } from './pages/TerminauxPage';
import { AuditPage } from './pages/AuditPage';
import { AuthRBACPage } from './pages/AuthRBACPage';

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Authenticated Maritime Application Layout */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/visites" element={<VisitesPage />} />
              <Route path="/daps" element={<DAPsPage />} />
              <Route path="/navires" element={<NaviresPage />} />
              <Route path="/ports" element={<PortsPage />} />
              <Route path="/terminals" element={<TerminauxPage />} />
              <Route path="/audit-logs" element={<AuditPage />} />
              <Route path="/rbac" element={<AuthRBACPage />} />
            </Route>

            {/* 404 Catch-All */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
};
