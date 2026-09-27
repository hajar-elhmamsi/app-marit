import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { maritimeService, PRIMARY_CONSIGNATAIRE_EMAIL } from '../api/client';
import { DAP, Navire, VisiteMaritime } from '../types';
import { Badge } from '../components/UI/Badge';
import { useToast } from '../context/ToastContext';
import {
  Anchor,
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

interface PlanningRequest {
  id: string;
  source: string;
  reference: string;
  navire: string;
  navireId?: number;
  posteDemande: string;
  date: string;
}

const ACCOSTAGE_KEY = 'portnet_demande_accostage';
const PLANNING_KEY = 'capitainerie_planning_affectations';
const RESOURCES_KEY = 'capitainerie_ressources_nautiques';
const AVIS_DECISIONS_KEY = 'capitainerie_avis_decisions';

export type CapitainerieSection = 'overview' | 'flux' | 'quais' | 'operations' | 'flotte';

export const CapitainerieDashboardPage: React.FC<{ section?: CapitainerieSection }> = ({ section = 'overview' }) => {
  const [visites, setVisites] = useState<VisiteMaritime[]>([]);
  const [daps, setDaps] = useState<DAP[]>([]);
  const [navires, setNavires] = useState<Navire[]>([]);
  const [accostages, setAccostages] = useState<AccostageRequest[]>([]);
  const [planningAssignments, setPlanningAssignments] = useState<Record<string, { poste: string; date: string; statut: string }>>({});
  const [assignments, setAssignments] = useState<Record<number, NauticalAssignment>>({});
  const [selectedNavireId, setSelectedNavireId] = useState<number | null>(null);
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

      const savedPlanning = localStorage.getItem(PLANNING_KEY);
      if (savedPlanning) {
        try {
          const parsed = JSON.parse(savedPlanning) as Record<string, { poste: string; date: string; statut: string }>;
          if (parsed && typeof parsed === 'object') setPlanningAssignments(parsed);
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
  const alongside = visites.filter((visite) => visite.statut === 'active' || visite.statut === 'prevue');
  const departed = visites.filter((visite) => visite.statut === 'cloturee');
  const pendingDAPs = daps.filter((dap) => dap.statut === 'envoye');
  const pendingVessels = navires.filter((navire) => navire.validation_anp === 'en_attente');

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

  const updateAccostage = (request: AccostageRequest, updates: Partial<AccostageRequest>) => {
    const updated = accostages.map((item) => item.id === request.id ? { ...item, ...updates } : item);
    setAccostages(updated);
    localStorage.setItem(ACCOSTAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('portnet-admin-decision'));
  };

  const savePlanningAssignment = (request: PlanningRequest, updates: Partial<{ poste: string; date: string; statut: string }>) => {
    const current = planningAssignments[request.id] || { poste: request.posteDemande, date: request.date, statut: 'Affectation enregistrée' };
    const updated = { ...planningAssignments, [request.id]: { ...current, ...updates } };
    setPlanningAssignments(updated);
    localStorage.setItem(PLANNING_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('capitainerie-planning-updated'));
    showToast(`${request.navire} : poste affecté et planning enregistré.`, 'success', 'Planning mis à jour');
  };

  const saveAssignment = (navireId: number, assignment: NauticalAssignment) => {
    const updated = { ...assignments, [navireId]: assignment };
    setAssignments(updated);
    localStorage.setItem(RESOURCES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('capitainerie-resources-updated'));
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

  const planningRequests: PlanningRequest[] = [
    ...accostages.map((request) => ({ id: `da-${request.id}`, source: 'DA accostage', reference: request.numero_demande || 'DA sans référence', navire: request.navire || 'Navire non renseigné', posteDemande: request.poste || 'Non précisé', date: request.date_accostage || 'À définir' })),
    ...daps.filter((dap) => dap.statut === 'envoye' || dap.statut === 'accepte').map((dap) => ({ id: `dap-${dap.id}`, source: 'DAP', reference: dap.numero_dap, navire: dap.visite_maritime?.navire?.nom || 'Navire', navireId: dap.visite_maritime?.navire_id, posteDemande: dap.visite_maritime?.terminal?.nom || 'À affecter', date: dap.visite_maritime?.date_arrivee_estimee || 'À définir' })),
    ...roadstead.map((visite) => ({ id: `avis-${visite.id}`, source: 'Avis d’arrivée', reference: visite.numero_visite, navire: visite.navire?.nom || 'Navire', navireId: visite.navire_id, posteDemande: visite.terminal?.nom || 'À affecter', date: visite.date_arrivee_estimee || 'À définir' })),
  ].filter((request, index, list) => list.findIndex((item) => item.navire === request.navire) === index);

  const visiteNavires = visites.map((visite) => visite.navire).filter((navire): navire is Navire => Boolean(navire));
  const operationalNavires = navires.filter((navire) => navire.is_active).concat(
    visiteNavires.filter((navire) => !navires.some((item) => item.id === navire.id)),
  );
  const selectedNavire = operationalNavires.find((navire) => navire.id === selectedNavireId) || operationalNavires[0];

  if (loading) {
    return <div className="flex min-h-[350px] items-center justify-center text-sm text-[#64748B]">Chargement du centre opérationnel de la Capitainerie...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#1E5575] bg-gradient-to-r from-[#063B5C] via-[#075985] to-[#0E7490] p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-100 text-xs font-bold uppercase tracking-wider"><TrafficCone size={15} /> Capitainerie du Port de Casablanca</div>
            <h1 className="mt-2 text-2xl font-bold">Capitainerie — Plan d’eau de Casablanca</h1>
            <p className="mt-1 text-sm text-cyan-50">Centre de validation des flux et de coordination des opérations maritimes</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-cyan-200/30 bg-cyan-100/10 px-3 py-2 text-xs text-cyan-50"><span className="h-2 w-2 rounded-full bg-cyan-300 animate-pulse" /> Flux temps réel actif</div>
        </div>
      </div>

      {section === 'overview' && <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {[
          { title: 'Validation des flux', description: 'Avis d’arrivée, DAP et demandes d’accostage à traiter.', route: '/capitainerie/flux', icon: ClipboardCheck, tone: 'bg-[#E0F2FE] text-[#075985] border-[#BAE6FD]' },
          { title: 'Planning des quais / TOPI', description: 'Coordination des postes et des autorisations d’accostage.', route: '/capitainerie/quais', icon: SlidersHorizontal, tone: 'bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4]' },
          { title: 'Suivi des opérations', description: 'Affectation des ressources nautiques aux navires à quai.', route: '/capitainerie/operations', icon: LifeBuoy, tone: 'bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE]' },
          { title: 'Registre de la flotte', description: 'Consultation des navires et validation de leurs certificats.', route: '/capitainerie/flotte', icon: Ship, tone: 'bg-[#D1FAE5] text-[#047857] border-[#A7F3D0]' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.route} to={item.route} className="rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className={`inline-flex items-center justify-center rounded-lg border p-2.5 ${item.tone}`}>
                <Icon size={20} />
              </div>
              <h2 className="mt-4 text-lg font-bold text-[#172B4D]">{item.title}</h2>
              <p className="mt-2 text-sm text-[#64748B]">{item.description}</p>
              <div className="mt-4 text-xs font-semibold text-[#0E7490]">Ouvrir le module →</div>
            </Link>
          );
        })}
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

      {false && section === 'quais' && <section id="quais" />}

      {section === 'quais' && <section className="rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#075985]"><Anchor size={19} />Affectation des navires aux postes</h2>
            <p className="text-xs text-[#0369A1]">Choisissez le poste, la date et confirmez l’autorisation d’accostage pour chaque demande reçue.</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#0E7490]">{planningRequests.length} demande(s)</span>
        </div>
        {planningRequests.length === 0 ? <div className="rounded-lg border border-dashed border-[#7DD3FC] bg-white p-6 text-center text-sm text-[#64748B]">Aucun DAP ou avis d’arrivée transmis par le consignataire.</div> : <div className="space-y-3">
          {planningRequests.map((request) => { const assigned = planningAssignments[request.id]; const assignedPoste = assigned?.poste || request.posteDemande; const assignedDate = assigned?.date || request.date; return <div key={request.id} className="grid grid-cols-1 gap-3 rounded-xl border border-[#BAE6FD] bg-white p-4 lg:grid-cols-[1.1fr_1fr_1fr_1fr_auto] lg:items-end">
            <div><div className="text-xs font-bold uppercase text-[#64748B]">{request.source}</div><div className="mt-1 font-bold text-[#172B4D]">{request.navire}</div><div className="text-xs font-mono text-[#0B4F8A]">{request.reference}</div></div>
            <label className="text-xs font-semibold text-[#475569]">Poste affecté<input defaultValue={assignedPoste} onBlur={(event) => savePlanningAssignment(request, { poste: event.target.value })} className="form-input mt-1 text-xs" placeholder="TC3, Poste 31..." /></label>
            <label className="text-xs font-semibold text-[#475569]">Date prévue<input type="date" defaultValue={assignedDate} onBlur={(event) => savePlanningAssignment(request, { date: event.target.value })} className="form-input mt-1 text-xs" /></label>
            <div><div className="text-xs font-bold uppercase text-[#64748B]">Poste demandé</div><div className="mt-2 text-xs font-bold text-[#0F766E]">{request.posteDemande}</div></div>
            <div className="flex gap-2 lg:flex-col"><button onClick={() => savePlanningAssignment(request, { poste: assignedPoste, date: assignedDate, statut: 'Autorisation confirmée' })} className="rounded-md bg-[#0F766E] px-3 py-2 text-xs font-bold text-white hover:bg-[#115E59]">Confirmer le poste</button><span className="rounded-md bg-[#E0F2FE] px-3 py-2 text-center text-xs font-bold text-[#075985]">{assigned?.statut || 'À affecter'}</span></div>
          </div>; })}
        </div>}
      </section>}

      {section === 'operations' && <section id="operations" className="rounded-xl border border-[#99F6E4] bg-[#F0FDFA] p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2"><LifeBuoy size={19} className="text-[#0F766E]" /><div><h2 className="text-lg font-bold text-[#115E59]">Suivi des opérations nautiques</h2><p className="text-xs text-[#0F766E]">Sélectionnez un navire puis affectez les ressources nécessaires à son opération.</p></div></div>
        {operationalNavires.length === 0 ? <div className="rounded-lg border border-dashed border-[#5EEAD4] bg-white p-6 text-center text-sm text-[#64748B]">Aucun navire disponible dans le registre ou dans les avis/DAP reçus.</div> : <>
          <label className="block max-w-xl text-sm font-semibold text-[#334155]">Navire concerné<select value={selectedNavire?.id || ''} onChange={(event) => setSelectedNavireId(Number(event.target.value))} className="form-input mt-1 bg-white"><option value="">Sélectionner un navire</option>{operationalNavires.map((navire) => <option key={navire.id} value={navire.id}>{navire.nom} — IMO {navire.imo}</option>)}</select></label>
          {selectedNavire && <div className="mt-5 rounded-xl border border-[#99F6E4] bg-white p-4"><div className="mb-4 flex items-center justify-between"><div><div className="font-bold text-[#172B4D]">{selectedNavire.nom}</div><div className="text-xs text-[#64748B]">IMO {selectedNavire.imo} · {selectedNavire.pavillon}</div></div><span className="rounded-full bg-[#D1FAE5] px-3 py-1 text-xs font-bold text-[#047857]">Navire sélectionné</span></div><div className="grid grid-cols-1 gap-3 md:grid-cols-3"><label className="text-xs font-semibold text-[#475569]">Pilote<input className="form-input mt-1" placeholder="Nom du pilote" value={assignments[selectedNavire.id]?.pilote || ''} onChange={(event) => setAssignments({ ...assignments, [selectedNavire.id]: { ...(assignments[selectedNavire.id] || { remorqueurs: '', lamaneurs: '' }), pilote: event.target.value } })} /></label><label className="text-xs font-semibold text-[#475569]">Remorqueurs<input className="form-input mt-1" placeholder="Équipe / remorqueur" value={assignments[selectedNavire.id]?.remorqueurs || ''} onChange={(event) => setAssignments({ ...assignments, [selectedNavire.id]: { ...(assignments[selectedNavire.id] || { pilote: '', lamaneurs: '' }), remorqueurs: event.target.value } })} /></label><label className="text-xs font-semibold text-[#475569]">Lamaneurs<input className="form-input mt-1" placeholder="Équipe de lamanage" value={assignments[selectedNavire.id]?.lamaneurs || ''} onChange={(event) => setAssignments({ ...assignments, [selectedNavire.id]: { ...(assignments[selectedNavire.id] || { pilote: '', remorqueurs: '' }), lamaneurs: event.target.value } })} /></label></div><button onClick={() => saveAssignment(selectedNavire.id, assignments[selectedNavire.id] || { pilote: '', remorqueurs: '', lamaneurs: '' })} className="mt-4 rounded-md bg-[#0F766E] px-4 py-2 text-xs font-bold text-white hover:bg-[#115E59]">Enregistrer les ressources</button></div>}
        </>}
      </section>}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {false && section === 'operations' && <div id="operations" />}
        {section === 'flotte' && <div id="flotte" className="rounded-xl border border-[#D7DEE8] bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><Ship size={19} className="text-orange-500" /><div><h2 className="text-lg font-bold text-[#172B4D]">Registre de la flotte</h2><p className="text-xs text-[#64748B]">Certificats de sécurité reçus du consignataire</p></div></div><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="border-b border-[#E2E8F0] text-[#64748B]"><tr><th className="py-2">IMO</th><th className="py-2">Navire</th><th className="py-2">Statut</th><th className="py-2 text-right">Action</th></tr></thead><tbody className="divide-y divide-[#EEF2F6]">{navires.map((navire) => <tr key={navire.id}><td className="py-3 font-mono font-bold text-[#0B4F8A]">{navire.imo}</td><td className="py-3 font-semibold text-[#172B4D]">{navire.nom}</td><td className="py-3">{navire.validation_anp === 'en_attente' ? <span className="rounded-full bg-orange-100 px-2 py-1 font-semibold text-orange-700">En attente</span> : <span className="rounded-full bg-green-100 px-2 py-1 font-semibold text-green-700">Validé</span>}</td><td className="py-3 text-right">{navire.validation_anp === 'en_attente' && <button onClick={() => validateVessel(navire)} className="rounded-md bg-orange-500 px-2.5 py-1.5 font-bold text-white hover:bg-orange-600">Valider certificats</button>}</td></tr>)}</tbody></table></div></div>}
      </section>

    </div>
  );
};
