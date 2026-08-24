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
import { useAuth } from './context/AuthContext';

const RBACRoute: React.FC = () => {
  const { can } = useAuth();

  return can('rbac.manage') ? <AuthRBACPage /> : <Navigate to="/dashboard" replace />;
};

const PermissionRoute: React.FC<{ permission: string; children: React.ReactNode }> = ({ permission, children }) => {
  const { can } = useAuth();

  return can(permission) ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

const DAPRoute: React.FC = () => {
  const { can } = useAuth();

  return can('dap.create') || can('dap.validate') || can('dap.refuse')
    ? <DAPsPage />
    : <Navigate to="/dashboard" replace />;
};

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
              <Route path="/visites" element={<PermissionRoute permission="visites.view"><VisitesPage /></PermissionRoute>} />
              <Route path="/daps" element={<DAPRoute />} />
              <Route path="/navires" element={<PermissionRoute permission="navires.view"><NaviresPage /></PermissionRoute>} />
              <Route path="/ports" element={<PermissionRoute permission="ports.manage"><PortsPage /></PermissionRoute>} />
              <Route path="/terminals" element={<PermissionRoute permission="terminals.manage"><TerminauxPage /></PermissionRoute>} />
              <Route path="/audit-logs" element={<PermissionRoute permission="audit.view"><AuditPage /></PermissionRoute>} />
              <Route path="/rbac" element={<RBACRoute />} />
            </Route>

            {/* 404 Catch-All */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
};
