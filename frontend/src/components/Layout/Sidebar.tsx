import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  FileCheck2,
  Ship,
  Anchor,
  Layers,
  History,
  Users,
  ClipboardList,
  PackageCheck,
  FileText
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { can, user } = useAuth();
  const navLinks = user?.role === 'capitainerie'
    ? [
        { to: '/capitainerie', label: 'Tableau de bord', icon: LayoutDashboard, badge: 'Plan d’eau', permission: null },
        { to: '/capitainerie/flux', label: 'Validation des flux', icon: ClipboardList, badge: 'Direct', permission: null },
        { to: '/capitainerie/quais', label: 'Planning des quais / TOPI', icon: Layers, permission: null },
        { to: '/capitainerie/operations', label: 'Suivi des opérations', icon: Anchor, permission: null },
        { to: '/capitainerie/flotte', label: 'Registre de la flotte', icon: Ship, permission: null },
      ]
    : user?.role === 'admin'
    ? [
        { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, permission: null },
        { to: '/admin/avis', label: 'Avis d’arrivée', icon: CalendarCheck, badge: 'ANP', permission: 'visites.view' },
        { to: '/admin/daps', label: 'DAP', icon: FileCheck2, badge: 'ANP', permission: 'dap.validate' },
        { to: '/admin/declaration', label: 'Déclaration sommaire', icon: ClipboardList, permission: 'visites.view' },
        { to: '/admin/bon', label: 'Bon à délivrer', icon: PackageCheck, permission: 'visites.view' },
        { to: '/admin/da', label: 'DA accostage', icon: FileText, permission: 'visites.view' },
        { to: '/marsa-planning', label: 'Planning Marsa Maroc', icon: Layers, badge: 'Postes', permission: 'terminals.manage' },
        { to: '/navires', label: 'Flotte des navires', icon: Ship, permission: 'navires.view' },
        { to: '/terminals', label: 'Terminaux à quai', icon: Layers, permission: 'terminals.manage' },
        { to: '/audit-logs', label: 'Journal d\'audit', icon: History, permission: 'audit.view' },
        { to: '/rbac', label: 'Utilisateurs & RBAC', icon: Users, badge: 'Sécurité', permission: 'rbac.manage' },
      ]
    : [
        ...(user?.role === 'agent_maritime' ? [] : [{ to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, permission: null }]),
        { to: '/portnet', label: 'PortNet', icon: Anchor, badge: 'Consignataire', permission: null },
        { to: '/visites', label: 'Avis d’arrivée', icon: CalendarCheck, badge: 'ETA', permission: 'visites.view' },
        { to: '/daps', label: 'DAP', icon: FileCheck2, permission: 'dap.create' },
        { to: '/declaration-sommaire', label: 'Déclaration sommaire', icon: ClipboardList, permission: 'visites.view' },
        { to: '/bon-a-delivrer', label: 'Bon à délivrer', icon: PackageCheck, permission: 'visites.view' },
        { to: '/da-accostage', label: 'DA accostage', icon: FileText, permission: 'visites.view' },
        { to: '/navires', label: 'Flotte des navires', icon: Ship, permission: 'navires.view' },
        { to: '/terminals', label: 'Terminaux à quai', icon: Layers, permission: 'terminals.manage' },
        { to: '/audit-logs', label: 'Journal d\'audit', icon: History, permission: 'audit.view' },
        ...(can('rbac.manage')
          ? [{ to: '/rbac', label: 'Utilisateurs & RBAC', icon: Users, badge: 'Sécurité', permission: 'rbac.manage' }]
          : []),
      ].filter((item) => item.to !== '/daps' || can('dap.create') || can('dap.validate') || can('dap.refuse'))
        .filter((item) => !item.permission || can(item.permission));

  return (
    <aside className="w-64 bg-white border-r border-[#E2E8F0] flex flex-col flex-shrink-0 select-none z-30 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-[#E2E8F0]">
        <div className="w-9 h-9 rounded-lg bg-[#0B4F8A] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
          <Anchor size={20} className="stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-tight text-[#123B63]">NAVIOS</span>
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#EAF4FB] text-[#0B4F8A] border border-blue-200">
              PortCall
            </span>
          </div>
          <p className="text-[11px] text-[#64748B]">Port de Casablanca (MACAS)</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
          Menu Principal
        </div>

        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={`${item.to}-${'section' in item ? item.section || 'root' : 'root'}`}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#EAF4FB] text-[#0B4F8A] font-semibold border-l-4 border-[#0B4F8A]'
                    : 'text-[#475569] hover:text-[#172B4D] hover:bg-[#F8FAFC]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={isActive ? 'text-[#0B4F8A]' : 'text-[#64748B]'}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#EAF4FB] text-[#0B4F8A] border border-blue-200">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

    </aside>
  );
};
