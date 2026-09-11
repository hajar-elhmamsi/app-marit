import React, { useEffect, useMemo, useState } from 'react';
import { maritimeService, PRIMARY_CONSIGNATAIRE_EMAIL } from '../api/client';
import { DAP, Navire, VisiteMaritime } from '../types';
import { Badge } from '../components/UI/Badge';
import { useToast } from '../context/ToastContext';
import {
  Anchor,
  AlertTriangle,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  LifeBuoy,
  Ship,
  SlidersHorizontal,
  TrafficCone,
  X,
  Wrench,
} from 'lucide-react';

interface AccostageRequest {
  id: number;
  numero_demande: string;
  navire: string;
  poste: string;
  date_accostage: string;
  operateur: string;
  validation: string;
  documents: string[];
  consignataire_email: string;
  heure_validation?: string;
}

interface NauticalAssignment {
  pilote: string;
  remorqueurs: string;
  lamaneurs: string;
}

const ACCOSTAGE_KEY = 'portnet_demande_accostage';
const RESOURCES_KEY = 'capitainerie_ressources_nautiques';
const AVIS_DECISIONS_KEY = 'capitainerie_avis_decisions';

export type CapitainerieSection = 'overview' | 'flux' | 'quais' | 'operations' | 'flotte';

export const CapitainerieDashboardPage: React.FC<{ section?: CapitainerieSection }> = ({ section = 'overview' }) => {
  const [visites, setVisites] = useState<VisiteMaritime[]>([]);
  const [daps, setDaps] = useState<DAP[]>([]);
  const [navires, setNavires] = useState<Navire[]>([]);
  const [accostages, setAccostages] = useState<AccostageRequest[]>([]);
  const [assignments, setAssignments] = useState<Record<number, NauticalAssignment>>({});
  const [avisDecisions, setAvisDecisions] = useState<Record<number, 'en_attente' | 'valide' | 'refuse'>>({});
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [visiteData, dapData, navireData] = await Promise.all([
        maritimeService.getVisites(),
        maritimeService.getDAPs(),
        maritimeService.getNavires(),
      ]);
      setVisites(visiteData);
      setDaps(dapData);
      setNavires(navireData);

      const savedRequests = localStorage.getItem(ACCOSTAGE_KEY);
      if (savedRequests) {
        try {
          const parsed = JSON.parse(savedRequests) as AccostageRequest[];
          if (Array.isArray(parsed)) setAccostages(parsed);
        } catch {}
      }

      const savedAssignments = localStorage.getItem(RESOURCES_KEY);
      if (savedAssignments) {
        try {
          const parsed = JSON.parse(savedAssignments) as Record<number, NauticalAssignment>;
          setAssignments(parsed);
        } catch {}
      }

      const savedAvisDecisions = localStorage.getItem(AVIS_DECISIONS_KEY);
      if (savedAvisDecisions) {
        try {
          const parsed = JSON.parse(savedAvisDecisions) as Record<number, 'en_attente' | 'valide' | 'refuse'>;
          setAvisDecisions(parsed);
        } catch {}
      }
    } catch {
      showToast('Impossible de charger les flux de la capitainerie.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const roadstead = visites.filter((visite) => visite.statut === 'prevue');
  const alongside = visites.filter((visite) => visite.statut === 'active');
  const departed = visites.filter((visite) => visite.statut === 'cloturee');
  const pendingDAPs = daps.filter((dap) => dap.statut === 'envoye');
  const pendingVessels = navires.filter((navire) => navire.validation_anp === 'en_attente');

  const dangerousCargo = useMemo(() => {
    const saved = localStorage.getItem('portnet_declaration_sommaire');
    if (!saved) return [];
    try {
      const declarations = JSON.parse(saved) as Array<{ navire: string; type_cargaison: string; quantite_marchandises: string }>;
      return declarations.filter((declaration) => /pétrol|chimique|dangereux/i.test(`${declaration.type_cargaison} ${declaration.navire}`));
    } catch {
      return [];
    }
  }, [visites]);

  const handleDAPDecision = async (dap: DAP, decision: 'accept' | 'refuse' | 'correction') => {
    try {
      if (decision === 'accept') {
        await maritimeService.accepterDAP(dap.id);
        showToast(`${dap.numero_dap} validé et statut transmis au consignataire.`, 'success', 'DAP validé');
      } else {
        const motif = decision === 'correction' ? 'Correction demandée par la Capitainerie.' : 'DAP refusé par la Capitainerie.';
        await maritimeService.refuserDAP(dap.id, motif);
        showToast(`${dap.numero_dap} : ${decision === 'correction' ? 'correction demandée' : 'refusé'}.`, decision === 'correction' ? 'warning' : 'error');
      }
      await loadData();
    } catch {
      showToast('La décision n’a pas pu être transmise.', 'error');
    }
  };

  const handleAvisDecision = (visite: VisiteMaritime, decision: 'valide' | 'refuse') => {
    const updated = { ...avisDecisions, [visite.id]: decision };
    setAvisDecisions(updated);
    localStorage.setItem(AVIS_DECISIONS_KEY, JSON.stringify(updated));
    showToast(
      decision === 'valide' ? `${visite.numero_visite} validé et transmis au consignataire.` : `${visite.numero_visite} refusé et transmis au consignataire.`,
      decision === 'valide' ? 'success' : 'error',
      decision === 'valide' ? 'Avis validé' : 'Avis refusé',
    );
  };

  const handleAccostageDecision = (request: AccostageRequest, accepted: boolean) => {
    const updated = accostages.map((item) => item.id === request.id ? { ...item, validation: accepted ? 'Validée par Capitainerie' : 'Refusée' } : item);
    setAccostages(updated);
    localStorage.setItem(ACCOSTAGE_KEY, JSON.stringify(updated));
    showToast(
      accepted
        ? `${request.numero_demande} validée : ${request.poste} transmis instantanément à ${request.operateur}.`
        : `${request.numero_demande} refusée et statut renvoyé au consignataire.`,
      accepted ? 'success' : 'error',
      accepted ? 'Autorisation transmise' : 'DA refusée',
    );
  };

  const saveAssignment = (visiteId: number, assignment: NauticalAssignment) => {
    const updated = { ...assignments, [visiteId]: assignment };
    setAssignments(updated);
    localStorage.setItem(RESOURCES_KEY, JSON.stringify(updated));
    showToast('Ressources nautiques affectées à l’escale.', 'success');
  };

  const validateVessel = async (navire: Navire) => {
    try {
      await maritimeService.validerNavireANP(navire.id);
      showToast(`IMO ${navire.imo} intégré au registre partagé.`, 'success', 'Certificats validés');
      await loadData();
    } catch {
      showToast('Impossible de valider les certificats du navire.', 'error');
    }
  };

  const requestRows = [
    ...pendingDAPs.map((dap) => ({ id: `dap-${dap.id}`, kind: 'DAP', title: dap.numero_dap, vessel: dap.visite_maritime?.navire?.nom || 'Navire', email: PRIMARY_CONSIGNATAIRE_EMAIL, status: 'En attente', onAccept: () => handleDAPDecision(dap, 'accept'), onRefuse: () => handleDAPDecision(dap, 'refuse') })),
    ...roadstead.filter((visite) => !avisDecisions[visite.id] || avisDecisions[visite.id] === 'en_attente').map((visite) => ({ id: `avis-${visite.id}`, kind: 'Avis d’arrivée', title: visite.numero_visite, vessel: visite.navire?.nom || 'Navire', email: PRIMARY_CONSIGNATAIRE_EMAIL, status: 'En attente', onAccept: () => handleAvisDecision(visite, 'valide'), onRefuse: () => handleAvisDecision(visite, 'refuse') })),
  ];

  if (loading) {
    return <div className="flex min-h-[350px] items-center justify-center text-sm text-[#64748B]">Chargement du centre opérationnel de la Capitainerie...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-[#111C2E] p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-orange-300 text-xs font-bold uppercase tracking-wider"><TrafficCone size={15} /> Autorité Portuaire ANP</div>
            <h1 className="mt-2 text-2xl font-bold">Capitainerie — Plan d’eau de Casablanca</h1>
            <p className="mt-1 text-sm text-slate-300">Centre de validation des flux consignataire et de coordination Marsa Maroc</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-orange-300/30 bg-orange-400/10 px-3 py-2 text-xs text-orange-100"><span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" /> Flux temps réel actif</div>
        </div>
      </div>

      {dangerousCargo.length > 0 && (
        <div className="border-l-4 border-orange-500 bg-orange-50 p-4 text-orange-900 shadow-sm">
          <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-orange-600" size={20} /><div><div className="font-bold">Alerte sécurité cargaison dangereuse</div><div className="mt-1 text-sm">{dangerousCargo.map((item) => `${item.navire || 'Navire'} — ${item.type_cargaison} (${item.quantite_marchandises || 'quantité non précisée'})`).join(' · ')}</div></div></div>
        </div>
      )}

      {section === 'overview' && <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[{ label: 'Plan d’eau', value: `${roadstead.length + alongside.length + departed.length} mouvements`, detail: 'Rade, quais et départs', tone: 'bg-[#111C2E]' }, { label: 'Validation des flux', value: `${requestRows.length} demandes`, detail: 'Avis, DAP et DA à traiter', tone: 'bg-orange-500' }, { label: 'Planning des quais', value: 'TOPI', detail: 'Coordination Marsa Maroc', tone: 'bg-[#1D4ED8]' }, { label: 'Opérations & flotte', value: `${navires.length} navires`, detail: 'Ressources et certificats', tone: 'bg-[#15803D]' }].map((card) => <div key={card.label} className={`${card.tone} rounded-xl p-4 text-white shadow-sm`}><div className="text-xs font-semibold text-white/70">{card.label}</div><div className="mt-2 text-xl font-bold">{card.value}</div><div className="mt-1 text-xs text-white/75">{card.detail}</div></div>)}
      </div>}

      {false && <section>
        <div className="mb-3 flex items-center justify-between"><div><h2 className="text-lg font-bold text-[#172B4D]">Vue générale du plan d’eau</h2><p className="text-xs text-[#64748B]">Situation des mouvements maritimes</p></div><Anchor size={20} className="text-orange-500" /></div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[{ title: 'Navires en rade', items: roadstead, tone: 'border-orange-200 bg-orange-50', icon: LifeBuoy }, { title: 'Navires à quai', items: alongside, tone: 'border-green-200 bg-green-50', icon: Anchor }, { title: 'Navires partis', items: departed, tone: 'border-slate-200 bg-slate-50', icon: Ship }].map((group) => { const Icon = group.icon; return <div key={group.title} className={`rounded-xl border p-4 ${group.tone}`}><div className="mb-3 flex items-center gap-2 font-bold text-[#172B4D]"><Icon size={17} />{group.title}<span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs">{group.items.length}</span></div>{group.items.length === 0 ? <p className="text-xs text-[#64748B]">Aucun navire</p> : <div className="space-y-2">{group.items.slice(0, 4).map((item) => <div key={item.id} className="rounded-lg border border-white/70 bg-white/70 p-2 text-xs"><div className="font-bold text-[#172B4D]">{item.navire?.nom}</div><div className="text-[#64748B]">IMO {item.navire?.imo} · {item.numero_visite}</div></div>)}</div>}</div>; })}
        </div>
      </section>
      }

      {section === 'flux' && <section id="flux" className="rounded-xl border border-[#D7DEE8] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] p-5"><div><h2 className="flex items-center gap-2 text-lg font-bold text-[#172B4D]"><ClipboardCheck size={19} className="text-orange-500" />Validation des flux</h2><p className="text-xs text-[#64748B]">Les décisions sont renvoyées au consignataire en temps réel.</p></div><span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700">{requestRows.length} en attente</span></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-[#F8FAFC] text-xs uppercase text-[#64748B]"><tr><th className="px-5 py-3">Flux</th><th className="px-5 py-3">Référence</th><th className="px-5 py-3">Navire</th><th className="px-5 py-3">Consignataire</th><th className="px-5 py-3">Statut</th><th className="px-5 py-3 text-right">Décision</th></tr></thead><tbody className="divide-y divide-[#EEF2F6]">{requestRows.length === 0 ? <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-[#64748B]">Aucune demande en attente.</td></tr> : requestRows.map((row) => <tr key={row.id}><td className="px-5 py-3 font-semibold text-[#475569]">{row.kind}</td><td className="px-5 py-3 font-mono font-bold text-[#0B4F8A]">{row.title}</td><td className="px-5 py-3 font-semibold text-[#172B4D]">{row.vessel}</td><td className="px-5 py-3 text-xs text-[#475569]">{row.email}</td><td className="px-5 py-3"><span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">{row.status}</span></td><td className="px-5 py-3"><div className="flex justify-end gap-2"><button onClick={row.onAccept} className="inline-flex items-center gap-1 rounded-md bg-green-100 px-2.5 py-1.5 text-xs font-bold text-green-700 hover:bg-green-200"><Check size={13} />Valider</button><button onClick={row.onRefuse} className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-200"><X size={13} />Refuser</button></div></td></tr>)}</tbody></table></div>
      </section>}

      {section === 'quais' && <section id="quais" className="rounded-xl border border-[#D7DEE8] bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><div><h2 className="flex items-center gap-2 text-lg font-bold text-[#172B4D]"><SlidersHorizontal size={19} className="text-orange-500" />Planning des quais et TOPI</h2><p className="text-xs text-[#64748B]">Décision de Marsa Maroc sur le poste demandé par le consignataire.</p></div><span className="text-xs font-semibold text-green-700">Synchronisé Marsa Maroc</span></div>{accostages.length > 0 && <div className="mb-5 space-y-2">{accostages.map((request) => <div key={request.id} className="grid grid-cols-1 gap-2 rounded-lg border border-[#E2E8F0] p-3 text-xs md:grid-cols-5 md:items-center"><span className="font-mono font-bold text-[#0B4F8A]">{request.numero_demande}</span><span className="font-semibold text-[#172B4D]">{request.navire}</span><span>Poste demandé : <strong>{request.poste}</strong></span><span>Heure : <strong>{request.date_accostage || 'À définir'}</strong></span><span className={`font-bold ${request.validation?.startsWith('Acceptée') ? 'text-green-700' : request.validation?.startsWith('Refusée') ? 'text-red-700' : 'text-orange-700'}`}>{request.validation || 'En attente Marsa Maroc'}</span></div>)}</div>}<div className="overflow-x-auto"><div className="min-w-[720px]"><div className="grid grid-cols-[145px_1fr] border-b border-[#E2E8F0] text-xs font-bold text-[#64748B]"><div className="p-2">Poste</div><div className="grid grid-cols-6"><span className="p-2">06h</span><span className="p-2">10h</span><span className="p-2">14h</span><span className="p-2">18h</span><span className="p-2">22h</span><span className="p-2">02h</span></div></div>{['Poste 32', 'Poste 31', 'TC3 Marsa Maroc', 'Poste 4'].map((poste, index) => <div key={poste} className="grid grid-cols-[145px_1fr] border-b border-[#EEF2F6] text-xs"><div className="p-3 font-bold text-[#172B4D]">{poste}</div><div className="relative grid grid-cols-6 gap-px bg-[#EEF2F6]"><div className={`m-1 rounded px-2 py-2 font-semibold ${index === 0 ? 'col-span-2 bg-green-200 text-green-800' : index === 1 ? 'col-span-1 bg-orange-200 text-orange-800' : 'col-span-3 bg-slate-200 text-slate-700'}`}>{index === 0 ? 'Autorisation transmise' : index === 1 ? 'En attente' : 'Disponible'}</div></div></div>)}</div></div></section>}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {section === 'operations' && <div id="operations" className="rounded-xl border border-[#D7DEE8] bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><LifeBuoy size={19} className="text-orange-500" /><div><h2 className="text-lg font-bold text-[#172B4D]">Suivi des opérations</h2><p className="text-xs text-[#64748B]">Affectation des ressources nautiques</p></div></div><div className="space-y-4">{alongside.length === 0 ? <p className="text-sm text-[#64748B]">Aucun navire à quai.</p> : alongside.map((visite) => { const current = assignments[visite.id] || { pilote: '', remorqueurs: '', lamaneurs: '' }; return <div key={visite.id} className="rounded-lg border border-[#E2E8F0] p-3"><div className="mb-3 flex justify-between"><span className="font-bold text-[#172B4D]">{visite.navire?.nom}</span><span className="text-xs text-green-700">Manutention : 70%</span></div><div className="mb-3 h-2 rounded-full bg-slate-100"><div className="h-2 w-[70%] rounded-full bg-green-500" /></div><div className="grid grid-cols-1 gap-2 md:grid-cols-3"><input className="form-input text-xs" placeholder="Pilote" value={current.pilote} onChange={(e) => setAssignments({ ...assignments, [visite.id]: { ...current, pilote: e.target.value } })} /><input className="form-input text-xs" placeholder="Remorqueurs" value={current.remorqueurs} onChange={(e) => setAssignments({ ...assignments, [visite.id]: { ...current, remorqueurs: e.target.value } })} /><input className="form-input text-xs" placeholder="Lamaneurs" value={current.lamaneurs} onChange={(e) => setAssignments({ ...assignments, [visite.id]: { ...current, lamaneurs: e.target.value } })} /></div><button onClick={() => saveAssignment(visite.id, current)} className="mt-3 rounded-md bg-[#111C2E] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#1D2B43]">Enregistrer les ressources</button></div>; })}</div></div>}
        {section === 'flotte' && <div id="flotte" className="rounded-xl border border-[#D7DEE8] bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><Ship size={19} className="text-orange-500" /><div><h2 className="text-lg font-bold text-[#172B4D]">Registre de la flotte</h2><p className="text-xs text-[#64748B]">Certificats de sécurité reçus du consignataire</p></div></div><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="border-b border-[#E2E8F0] text-[#64748B]"><tr><th className="py-2">IMO</th><th className="py-2">Navire</th><th className="py-2">Statut</th><th className="py-2 text-right">Action</th></tr></thead><tbody className="divide-y divide-[#EEF2F6]">{navires.map((navire) => <tr key={navire.id}><td className="py-3 font-mono font-bold text-[#0B4F8A]">{navire.imo}</td><td className="py-3 font-semibold text-[#172B4D]">{navire.nom}</td><td className="py-3">{navire.validation_anp === 'en_attente' ? <span className="rounded-full bg-orange-100 px-2 py-1 font-semibold text-orange-700">En attente</span> : <span className="rounded-full bg-green-100 px-2 py-1 font-semibold text-green-700">Validé</span>}</td><td className="py-3 text-right">{navire.validation_anp === 'en_attente' && <button onClick={() => validateVessel(navire)} className="rounded-md bg-orange-500 px-2.5 py-1.5 font-bold text-white hover:bg-orange-600">Valider certificats</button>}</td></tr>)}</tbody></table></div></div>}
      </section>

      {section === 'overview' && <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><div className="rounded-lg bg-[#111C2E] p-3 text-white"><div className="text-xs text-slate-300">Rade</div><div className="text-2xl font-bold">{roadstead.length}</div></div><div className="rounded-lg bg-green-700 p-3 text-white"><div className="text-xs text-green-100">À quai</div><div className="text-2xl font-bold">{alongside.length}</div></div><div className="rounded-lg bg-orange-500 p-3 text-white"><div className="text-xs text-orange-100">Flux à valider</div><div className="text-2xl font-bold">{requestRows.length}</div></div><div className="rounded-lg bg-slate-600 p-3 text-white"><div className="text-xs text-slate-200">Départs</div><div className="text-2xl font-bold">{departed.length}</div></div></div>}
    </div>
  );
};
