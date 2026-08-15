import React, { useEffect, useState } from 'react';
import { maritimeService } from '../api/client';
import { StatCard } from '../components/UI/StatCard';
import { Badge } from '../components/UI/Badge';
import { useAuth } from '../context/AuthContext';
import {
  CalendarCheck,
  Radio,
  FileCheck2,
  Ship,
  Anchor,
  Layers,
  ArrowRight,
  Plus,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { VisiteMaritime } from '../types';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { can } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const data = await maritimeService.getDashboardStats();
      setStats(data);
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] text-[#64748B] space-y-2">
        <div className="w-7 h-7 border-2 border-[#0B4F8A] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Chargement du tableau de bord du Port de Casablanca...</span>
      </div>
    );
  }

  const { kpis, prochaines_escales, repartition_navires } = stats;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#172B4D]">Tableau de bord — Port de Casablanca</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#EAF4FB] text-[#0B4F8A] border border-blue-200">
              UN/LOCODE: MACAS
            </span>
          </div>
          <p className="text-sm text-[#64748B] mt-0.5">
            Supervision opérationnelle des escales maritimes et des postes à quai • Autorité Portuaire ANP
          </p>
        </div>

        {can('visites.create') && (
          <Link
            to="/visites"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0B4F8A] hover:bg-[#083B68] text-white font-semibold text-sm rounded-lg shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus size={18} />
            <span>Déclarer une escale</span>
          </Link>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Navires à quai (Casablanca)"
          value={kpis.escales_actives}
          subtitle="En cours de manutention"
          trend="À quai"
          trendType="positive"
          icon={Radio}
        />

        <StatCard
          title="Escales attendues en rade"
          value={kpis.escales_prevues}
          subtitle="Arrivées planifiées 48h"
          trend="Planifiées"
          trendType="neutral"
          icon={CalendarCheck}
        />

        <StatCard
          title="DAP en instruction VTS"
          value={kpis.dap_en_attente}
          subtitle="Capitainerie Casablanca"
          trend="À traiter"
          trendType="warning"
          icon={FileCheck2}
        />

        <StatCard
          title="Flotte enregistrée ANP"
          value={kpis.total_navires}
          subtitle="Navires autorisés"
          trend="Certifiés"
          trendType="neutral"
          icon={Ship}
        />
      </div>

      {/* Main Grid: Escales Casablanca & Infrastructures */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Escales prioritaires */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#172B4D] flex items-center gap-2">
                <Anchor size={18} className="text-[#0B4F8A]" />
                <span>Mouvements et escales au Port de Casablanca</span>
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Navires en approche en rade ou amarrés aux terminaux (TC3, TC2, Roulier, Phosphates)
              </p>
            </div>

            <Link
              to="/visites"
              className="text-xs font-semibold text-[#0B4F8A] hover:text-[#083B68] flex items-center gap-1"
            >
              <span>Voir tout</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAFC] text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-5 py-3">N° Escale</th>
                  <th className="px-5 py-3">Navire & Pavillon</th>
                  <th className="px-5 py-3">Poste d'Accostage</th>
                  <th className="px-5 py-3">ETA / ATA</th>
                  <th className="px-5 py-3">Statut Escale</th>
                  <th className="px-5 py-3">DAP ANP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] font-medium text-[#172B4D]">
                {prochaines_escales.map((visite: VisiteMaritime) => (
                  <tr key={visite.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-[#0B4F8A] font-mono">
                      {visite.numero_visite}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-bold text-[#172B4D]">{visite.navire?.nom}</div>
                      <div className="text-xs text-[#64748B]">IMO {visite.navire?.imo} • {visite.navire?.pavillon}</div>
                    </td>

                    <td className="px-5 py-3.5 text-xs text-[#334155]">
                      <div className="font-semibold text-[#172B4D]">{visite.terminal?.nom}</div>
                      <div className="text-[#64748B]">{visite.terminal?.port?.nom}</div>
                    </td>

                    <td className="px-5 py-3.5 text-xs text-[#334155] font-mono">
                      {visite.statut === 'active' && visite.date_arrivee_reelle ? (
                        <span className="text-[#15803D] font-semibold">ATA: {visite.date_arrivee_reelle}</span>
                      ) : (
                        <span>ETA: {visite.date_arrivee_estimee}</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <Badge type="visite" status={visite.statut} />
                    </td>

                    <td className="px-5 py-3.5">
                      <Badge type="dap" status={visite.dap?.statut || 'brouillon'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Infrastructure Portuaire Casablanca & Flotte */}
        <div className="space-y-6">
          {/* Infrastructure Portuaire Casablanca */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#172B4D] mb-3 flex items-center gap-2">
              <Building2 size={16} className="text-[#0B4F8A]" />
              <span>Infrastructures du Port de Casablanca</span>
            </h3>

            <div className="divide-y divide-[#F1F5F9] text-sm">
              <div className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2 text-[#475569]">
                  <Anchor size={15} className="text-[#0B4F8A]" />
                  <span>Terminaux actifs (MACAS)</span>
                </div>
                <span className="font-bold text-[#123B63]">{kpis.total_terminaux}</span>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2 text-[#475569]">
                  <Layers size={15} className="text-[#0B4F8A]" />
                  <span>Ports réseau national ANP</span>
                </div>
                <span className="font-bold text-[#123B63]">{kpis.total_ports}</span>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2 text-[#475569]">
                  <CheckCircle2 size={15} className="text-[#16A34A]" />
                  <span>Escales traitées avec succès</span>
                </div>
                <span className="font-bold text-[#15803D]">{kpis.escales_cloturees}</span>
              </div>
            </div>
          </div>

          {/* Typologie Navires Casablanca */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#172B4D] mb-3 flex items-center gap-2">
              <Ship size={16} className="text-[#0B4F8A]" />
              <span>Trafic par Typologie de Navires</span>
            </h3>

            <div className="space-y-3">
              {repartition_navires.map((item: any) => {
                const percentage = Math.round((item.total / (kpis.total_navires || 1)) * 100);
                return (
                  <div key={item.type_navire} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="capitalize text-[#475569] font-medium">
                        {item.type_navire === 'porte_conteneurs'
                          ? 'Conteneurs (TC3 / TC2)'
                          : item.type_navire === 'roulier'
                          ? 'Roulier & Véhicules (Bassin Tarik)'
                          : item.type_navire === 'vraquier'
                          ? 'Minéralier & Phosphates (OCP)'
                          : item.type_navire === 'petrolier'
                          ? 'Hydrocarbures (Moulay Youssef)'
                          : item.type_navire?.replace('_', ' ')}
                      </span>
                      <span className="font-semibold text-[#172B4D]">
                        {item.total} <span className="text-[#94A3B8]">({percentage}%)</span>
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0B4F8A] rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
