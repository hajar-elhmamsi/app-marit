import React from 'react';
import { Link } from 'react-router-dom';
import {
  Ship,
  FileCheck2,
  ClipboardList,
  PackageCheck,
  FileText,
  ArrowRight,
  CheckCircle2,
  Anchor
} from 'lucide-react';

const workflowSteps = [
  {
    title: '1. Avis d’arrivée',
    description: 'Le consignataire identifie le navire par son IMO et déclenche la procédure d’escale.',
    route: '/visites',
    icon: Ship,
    tone: 'bg-[#EAF4FB] text-[#0B4F8A] border-blue-200'
  },
  {
    title: '2. DAP',
    description: 'Demande d’attribution de poste et validation de l’opérateur portuaire.',
    route: '/daps',
    icon: FileCheck2,
    tone: 'bg-[#EDF7ED] text-[#15803D] border-green-200'
  },
  {
    title: '3. Déclaration sommaire',
    description: 'Déclaration douanière avec armateur, tonnage, quantité et date de chargement.',
    route: '/declaration-sommaire',
    icon: ClipboardList,
    tone: 'bg-[#FFF7ED] text-[#B45309] border-orange-200'
  },
  {
    title: '4. Bon à délivrer',
    description: 'Ordre de livraison lié au réceptionnaire et à la quantité à décharger.',
    route: '/bon-a-delivrer',
    icon: PackageCheck,
    tone: 'bg-[#F5F3FF] text-[#6D28D9] border-violet-200'
  },
  {
    title: '5. DA accostage',
    description: 'Demande d’accostage soumise à validation de l’opérateur concerné.',
    route: '/da-accostage',
    icon: FileText,
    tone: 'bg-[#FEF2F2] text-[#B91C1C] border-red-200'
  },
];

export const PortNetOverviewPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#E2E8F0] bg-gradient-to-r from-[#0B4F8A] to-[#123B63] p-6 text-white shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-white/10 border border-white/20">
            <Anchor size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">PortNet — Consignataire / Agent maritime</h1>
            <p className="text-sm text-blue-100">Interface métier dédiée au suivi des formalités portuaires</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-sm">
          <div className="rounded-xl bg-white/10 border border-white/10 p-3">
            <div className="text-blue-100">Navire</div>
            <div className="font-bold text-lg">IMO + inscription</div>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/10 p-3">
            <div className="text-blue-100">Validation</div>
            <div className="font-bold text-lg">ANP / Marsa Maroc</div>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/10 p-3">
            <div className="text-blue-100">Documents</div>
            <div className="font-bold text-lg">Cargo, crew, DAP, B.A.D</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {workflowSteps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className={`inline-flex items-center justify-center rounded-lg border p-2.5 ${step.tone}`}>
                  <Icon size={20} />
                </div>
                <Link
                  to={step.route}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B4F8A] hover:text-[#083B68]"
                >
                  Ouvrir
                  <ArrowRight size={13} />
                </Link>
              </div>

              <h2 className="mt-4 text-lg font-bold text-[#172B4D]">{step.title}</h2>
              <p className="mt-2 text-sm text-[#64748B]">{step.description}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 size={18} className="text-[#15803D]" />
          <h2 className="text-lg font-bold text-[#172B4D]">Documents obligatoires à transmettre</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-[#475569]">
          <ul className="space-y-2 list-disc pl-5">
            <li>Connaissement et facture de marchandises</li>
            <li>Liste de l’équipage (Crew List / Nill(e))</li>
            <li>Cargo Manifest</li>
            <li>Plan de chargement</li>
          </ul>
          <ul className="space-y-2 list-disc pl-5">
            <li>Déclaration sommaire</li>
            <li>Bon à délivrer</li>
            <li>Demande d’accostage (DA)</li>
            <li>Pièces complémentaires (déchets, certificat, etc.)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
