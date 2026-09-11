import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/Layout/AppLayout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CapitainerieDashboardPage } from './pages/CapitainerieDashboardPage';
import { MarsaPlanningPage } from './pages/MarsaPlanningPage';
import { AdminMaritimePage } from './pages/AdminMaritimePage';
import { PortNetOverviewPage } from './pages/PortNetOverviewPage';
import { VisitesPage } from './pages/VisitesPage';
import { DAPsPage } from './pages/DAPsPage';
import { DeclarationSommairePage } from './pages/DeclarationSommairePage';
import { BonADelivrerPage } from './pages/BonADelivrerPage';
import { DAAccostagePage } from './pages/DAAccostagePage';
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

const HomeRoute: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'agent_maritime') return <Navigate to="/portnet" replace />;
  if (user?.role === 'capitainerie') return <Navigate to="/capitainerie" replace />;
  return <Navigate to="/dashboard" replace />;
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
              <Route path="/" element={<HomeRoute />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/marsa-planning" element={<PermissionRoute permission="terminals.manage"><MarsaPlanningPage /></PermissionRoute>} />
              <Route path="/admin/avis" element={<PermissionRoute permission="visites.view"><AdminMaritimePage section="avis" /></PermissionRoute>} />
              <Route path="/admin/daps" element={<PermissionRoute permission="dap.validate"><AdminMaritimePage section="daps" /></PermissionRoute>} />
              <Route path="/admin/declaration" element={<PermissionRoute permission="visites.view"><AdminMaritimePage section="declaration" /></PermissionRoute>} />
              <Route path="/admin/bon" element={<PermissionRoute permission="visites.view"><AdminMaritimePage section="bon" /></PermissionRoute>} />
              <Route path="/admin/da" element={<PermissionRoute permission="visites.view"><AdminMaritimePage section="da" /></PermissionRoute>} />
              <Route path="/capitainerie" element={<PermissionRoute permission="visites.activate"><CapitainerieDashboardPage section="overview" /></PermissionRoute>} />
              <Route path="/capitainerie/flux" element={<PermissionRoute permission="visites.activate"><CapitainerieDashboardPage section="flux" /></PermissionRoute>} />
              <Route path="/capitainerie/quais" element={<PermissionRoute permission="visites.activate"><CapitainerieDashboardPage section="quais" /></PermissionRoute>} />
              <Route path="/capitainerie/operations" element={<PermissionRoute permission="visites.activate"><CapitainerieDashboardPage section="operations" /></PermissionRoute>} />
              <Route path="/capitainerie/flotte" element={<PermissionRoute permission="visites.activate"><CapitainerieDashboardPage section="flotte" /></PermissionRoute>} />
              <Route path="/portnet" element={<PermissionRoute permission="visites.view"><PortNetOverviewPage /></PermissionRoute>} />
              <Route path="/visites" element={<PermissionRoute permission="visites.view"><VisitesPage /></PermissionRoute>} />
              <Route path="/daps" element={<DAPRoute />} />
              <Route path="/declaration-sommaire" element={<PermissionRoute permission="visites.view"><DeclarationSommairePage /></PermissionRoute>} />
              <Route path="/bon-a-delivrer" element={<PermissionRoute permission="visites.view"><BonADelivrerPage /></PermissionRoute>} />
              <Route path="/da-accostage" element={<PermissionRoute permission="visites.view"><DAAccostagePage /></PermissionRoute>} />
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
