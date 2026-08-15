import React from 'react';
import { StatutVisite, StatutDAP } from '../../types';

interface BadgeProps {
  type: 'visite' | 'dap' | 'active' | 'type_navire' | 'type_terminal' | 'role';
  status?: StatutVisite | StatutDAP | boolean | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, status, className = '' }) => {
  // Statut Actif / Inactif
  if (type === 'active') {
    const isActive = Boolean(status);
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          isActive
            ? 'bg-[#DCFCE7] text-[#15803D] border border-green-200'
            : 'bg-[#F1F5F9] text-[#64748B] border border-slate-200'
        } ${className}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            isActive ? 'bg-[#16A34A]' : 'bg-[#94A3B8]'
          }`}
        />
        {isActive ? 'Actif' : 'Inactif'}
      </span>
    );
  }

  // Statut Visite Maritime (Escale)
  if (type === 'visite') {
    switch (status as StatutVisite) {
      case 'active':
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#15803D] border border-green-200 ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-[#16A34A]" />
            Active (À quai)
          </span>
        );
      case 'prevue':
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF4FB] text-[#0B4F8A] border border-blue-200 ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-[#0B4F8A]" />
            Prévue
          </span>
        );
      case 'cloturee':
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#475569] border border-slate-200 ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-[#64748B]" />
            Clôturée
          </span>
        );
      case 'annulee':
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#B91C1C] border border-red-200 ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-[#DC2626]" />
            Annulée
          </span>
        );
      default:
        return <span className="text-slate-600 text-xs">{status}</span>;
    }
  }

  // Statut DAP (Demande d'Accès Portuaire)
  if (type === 'dap') {
    switch (status as StatutDAP) {
      case 'accepte':
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#15803D] border border-green-200 ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-[#16A34A]" />
            Accepté
          </span>
        );
      case 'envoye':
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#B45309] border border-amber-200 ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-[#F59E0B]" />
            En attente
          </span>
        );
      case 'brouillon':
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#475569] border border-slate-200 ${className}`}
          >
            Brouillon
          </span>
        );
      case 'refuse':
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#B91C1C] border border-red-200 ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-[#DC2626]" />
            Refusé
          </span>
        );
      default:
        return <span className="text-slate-600 text-xs">{status}</span>;
    }
  }

  // Rôle Utilisateur
  if (type === 'role') {
    switch (status) {
      case 'admin':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#EAF4FB] text-[#0B4F8A] border border-blue-200">
            Administrateur
          </span>
        );
      case 'capitainerie':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#E0F2FE] text-[#0369A1] border border-sky-200">
            Capitainerie
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#F1F5F9] text-[#475569] border border-slate-200">
            Agent Maritime
          </span>
        );
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#F1F5F9] text-[#475569] border border-slate-200 ${className}`}
    >
      {status}
    </span>
  );
};
