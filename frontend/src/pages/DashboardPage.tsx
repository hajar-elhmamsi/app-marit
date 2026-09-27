import React from 'react';
import { Link } from 'react-router-dom';
import {
  Anchor,
  CalendarCheck,
  ClipboardList,
  FileCheck2,
  FileText,
  History,
  Layers,
  PackageCheck,
  ShieldCheck,
  Ship,
  Users,
} from 'lucide-react';

const adminModules = [
  { title: 'Avis d’arrivée', description: 'Consulter et décider sur les avis d’arrivée validés par la Capitainerie.', route: '/admin/avis', icon: CalendarCheck, tone: 'bg-[#E0F2FE] text-[#075985] border-[#BAE6FD]' },
  { title: 'DAP', description: 'Suivre les demandes d’accès acceptées et transmises pour décision finale.', route: '/admin/daps', icon: FileCheck2, tone: 'bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4]' },
  { title: 'Déclaration sommaire', description: 'Traiter les déclarations sommaires envoyées par les consignataires.', route: '/admin/declaration', icon: ClipboardList, tone: 'bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE]' },
  { title: 'Bon à délivrer', description: 'Contrôler et décider sur les bons à délivrer reçus.', route: '/admin/bon', icon: PackageCheck, tone: 'bg-[#D1FAE5] text-[#047857] border-[#A7F3D0]' },
  { title: 'DA accostage', description: 'Suivre les demandes d’accostage et les décisions transmises.', route: '/admin/da', icon: FileText, tone: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]' },
  { title: 'Planning Marsa Maroc', description: 'Consulter la coordination des quais et des postes de Marsa Maroc.', route: '/marsa-planning', icon: Layers, tone: 'bg-[#CCFBF1] text-[#115E59] border-[#99F6E4]' },
  { title: 'Flotte des navires', description: 'Consulter les navires enregistrés et leurs informations techniques.', route: '/navires', icon: Ship, tone: 'bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]' },
  { title: 'Terminaux à quai', description: 'Gérer les terminaux et les postes d’amarrage du port.', route: '/terminals', icon: Anchor, tone: 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]' },
  { title: 'Journal d’audit', description: 'Consulter la traçabilité des opérations et des décisions portuaires.', route: '/audit-logs', icon: History, tone: 'bg-[#E0F2FE] text-[#075985] border-[#BAE6FD]' },
  { title: 'Utilisateurs & RBAC', description: 'Gérer les utilisateurs et leurs droits d’accès à la plateforme.', route: '/rbac', icon: Users, tone: 'bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4]' },
];

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#1E5575] bg-gradient-to-r from-[#063B5C] via-[#075985] to-[#0E7490] p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-100 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={15} /> Direction Marsa Maroc
            </div>
            <h1 className="mt-2 text-2xl font-bold">Tableau de bord — Port de Casablanca</h1>
            <p className="mt-1 text-sm text-cyan-50">Centre de supervision des transmissions, des opérations et des infrastructures portuaires</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-cyan-200/30 bg-cyan-100/10 px-3 py-2 text-xs text-cyan-50">
            <span className="h-2 w-2 rounded-full bg-cyan-300 animate-pulse" /> Supervision active
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {adminModules.map((module) => {
          const Icon = module.icon;
          return (
            <Link key={module.route} to={module.route} className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className={`inline-flex items-center justify-center rounded-lg border p-2.5 ${module.tone}`}>
                <Icon size={20} />
              </div>
              <h2 className="mt-4 text-lg font-bold text-[#172B4D]">{module.title}</h2>
              <p className="mt-2 text-sm text-[#64748B]">{module.description}</p>
              <div className="mt-4 text-xs font-semibold text-[#0E7490]">Ouvrir le module →</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
