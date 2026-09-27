import React, { useEffect, useState } from 'react';
import { Check, ClipboardList, FileCheck2, FileText, PackageCheck, RefreshCw, Ship, X } from 'lucide-react';
import { maritimeService, PRIMARY_CONSIGNATAIRE_EMAIL } from '../api/client';
import { DAP, VisiteMaritime } from '../types';
import { useToast } from '../context/ToastContext';

export type AdminMaritimeSection = 'avis' | 'daps' | 'declaration' | 'bon' | 'da';

type DocumentRecord = {
  id: number;
  consignataire_email?: string;
  statut_admin?: 'en_attente' | 'accepte' | 'refuse';
  [key: string]: unknown;
};

type DecisionHistoryItem = {
  id: string;
  reference: string;
  navire: string;
  decision: 'accepte' | 'refuse';
  date: string;
};

const STORAGE_KEYS: Record<Exclude<AdminMaritimeSection, 'avis' | 'daps'>, string> = {
  declaration: 'portnet_declaration_sommaire',
  bon: 'portnet_bon_a_delivrer',
  da: 'portnet_demande_accostage',
};

const HISTORY_KEYS: Record<AdminMaritimeSection, string> = {
  avis: 'admin_avis_history',
  daps: 'admin_dap_history',
  declaration: 'admin_declaration_history',
  bon: 'admin_bon_history',
  da: 'admin_da_history',
};

const labels: Record<AdminMaritimeSection, string> = {
  avis: 'Avis d’arrivée reçus de la Capitainerie',
  daps: 'DAP acceptées par la Capitainerie',
  declaration: 'Déclarations sommaires reçues',
  bon: 'Bons à délivrer reçus',
  da: 'Demandes d’accostage reçues',
};

export const AdminMaritimePage: React.FC<{ section: AdminMaritimeSection }> = ({ section }) => {
  const [visites, setVisites] = useState<VisiteMaritime[]>([]);
  const [daps, setDaps] = useState<DAP[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [avisDecisions, setAvisDecisions] = useState<Record<number, string>>({});
  const [adminAvisDecisions, setAdminAvisDecisions] = useState<Record<number, string>>({});
  const [adminDAPDecisions, setAdminDAPDecisions] = useState<Record<number, string>>({});
  const [decisionHistory, setDecisionHistory] = useState<DecisionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadData = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      if (section === 'avis' || section === 'daps') {
        const [visiteData, dapData] = await Promise.all([maritimeService.getVisites(), maritimeService.getDAPs()]);
        setVisites(visiteData);
        setDaps(dapData);
        const savedAvis = localStorage.getItem('capitainerie_avis_decisions');
        if (savedAvis) setAvisDecisions(JSON.parse(savedAvis));
        const savedAdminAvis = localStorage.getItem('admin_avis_decisions');
        if (savedAdminAvis) setAdminAvisDecisions(JSON.parse(savedAdminAvis));
        const savedAdminDAPs = localStorage.getItem('admin_dap_decisions');
        if (savedAdminDAPs) setAdminDAPDecisions(JSON.parse(savedAdminDAPs));
      } else {
        const saved = localStorage.getItem(STORAGE_KEYS[section]);
        setDocuments(saved ? JSON.parse(saved) : []);
      }
      const savedHistory = localStorage.getItem(HISTORY_KEYS[section]);
      setDecisionHistory(savedHistory ? JSON.parse(savedHistory) : []);
    } catch {
      showToast('Impossible de charger les transmissions du consignataire.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
    const handleStorageUpdate = () => loadData();
    const handleSubmissionCreated = () => loadData();
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('portnet-submission-created', handleSubmissionCreated);
    const refreshTimer = window.setInterval(loadData, 2000);
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('portnet-submission-created', handleSubmissionCreated);
      window.clearInterval(refreshTimer);
    };
  }, [section]);

  const decideDocument = (id: number, statut_admin: 'accepte' | 'refuse') => {
    const key = STORAGE_KEYS[section as Exclude<AdminMaritimeSection, 'avis' | 'daps'>];
    const decisionDate = new Date().toLocaleString('fr-FR');
    const target = documents.find((item) => item.id === id);
    if (!target) return;
    const updated = documents.map((item) => item.id === id ? { ...item, ...(section === 'da' ? { validation: statut_admin === 'accepte' ? 'Acceptée par Marsa Maroc' : 'Refusée par Marsa Maroc', date_decision_admin: decisionDate } : { statut_admin, date_decision_admin: decisionDate }) } : item);
    const history = [...decisionHistory, { id: `${section}-${id}-${Date.now()}`, reference: documentTitle(target), navire: String(target.navire || target.nom_receptionnaire || 'Document'), decision: statut_admin, date: decisionDate }];
    setDocuments(updated);
    setDecisionHistory(history);
    localStorage.setItem(key, JSON.stringify(updated));
    localStorage.setItem(HISTORY_KEYS[section], JSON.stringify(history));
    window.dispatchEvent(new Event('portnet-admin-decision'));
    showToast(statut_admin === 'accepte' ? 'Document accepté et statut renvoyé au consignataire.' : 'Document refusé et statut renvoyé au consignataire.', statut_admin === 'accepte' ? 'success' : 'error');
  };

  const decideAvis = (visite: VisiteMaritime, statut: 'accepte' | 'refuse') => {
    const decisionDate = new Date().toLocaleString('fr-FR');
    const adminUpdated = { ...adminAvisDecisions, [visite.id]: `admin_${statut}` };
    const history = [...decisionHistory, { id: `avis-${visite.id}-${Date.now()}`, reference: visite.numero_visite, navire: visite.navire?.nom || 'Navire', decision: statut, date: decisionDate }];
    setAdminAvisDecisions(adminUpdated);
    setDecisionHistory(history);
    localStorage.setItem('admin_avis_decisions', JSON.stringify(adminUpdated));
    localStorage.setItem(HISTORY_KEYS.avis, JSON.stringify(history));
    showToast(statut === 'accepte' ? 'Avis d’arrivée accepté par Marsa Maroc.' : 'Avis d’arrivée refusé par Marsa Maroc.', statut === 'accepte' ? 'success' : 'error');
  };

  const decideDAP = async (dap: DAP, statut: 'accepte' | 'refuse') => {
    const decisionDate = new Date().toLocaleString('fr-FR');
    const updated = { ...adminDAPDecisions, [dap.id]: statut };
    const history = [...decisionHistory, { id: `dap-${dap.id}-${Date.now()}`, reference: dap.numero_dap, navire: dap.visite_maritime?.navire?.nom || 'Navire', decision: statut, date: decisionDate }];
    setAdminDAPDecisions(updated);
    setDecisionHistory(history);
    localStorage.setItem('admin_dap_decisions', JSON.stringify(updated));
    localStorage.setItem(HISTORY_KEYS.daps, JSON.stringify(history));
    showToast(statut === 'accepte' ? 'DAP accepté par Marsa Maroc.' : 'DAP refusé par Marsa Maroc.', statut === 'accepte' ? 'success' : 'error');
  };

  const pendingAvis = visites.filter((visite) => avisDecisions[visite.id] === 'valide' && !adminAvisDecisions[visite.id]);
  const pendingDAPs = daps.filter((dap) => dap.statut === 'accepte' && !adminDAPDecisions[dap.id]);

  const documentTitle = (item: DocumentRecord) => String(item.navire || item.nom_receptionnaire || item.numero_demande || `Dossier #${item.id}`);

  if (loading) return <div className="flex min-h-[300px] items-center justify-center text-sm text-[#64748B]">Chargement des transmissions...</div>;

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-[#111C2E] p-6 text-white shadow-sm">
        <div className="flex items-center gap-2 text-orange-300 text-xs font-bold uppercase tracking-wider"><Ship size={15} /> Marsa Maroc · Administration</div>
        <h1 className="mt-2 text-2xl font-bold">{labels[section]}</h1>
        <p className="mt-1 text-sm text-slate-300">Les décisions sont transmises au consignataire et à la Capitainerie.</p>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => loadData(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-sm font-semibold text-[#475569] hover:border-[#0B4F8A] hover:text-[#0B4F8A]"
        >
          <RefreshCw size={15} />
          Actualiser les transmissions
        </button>
      </div>

      {section === 'avis' && <ReviewTable empty="Aucun avis d’arrivée accepté par la Capitainerie." headers={['Flux', 'Référence', 'Navire', 'Consignataire']} rows={pendingAvis.map((visite) => ({ id: visite.id, cells: ['Avis d’arrivée', visite.numero_visite, visite.navire?.nom || 'Navire', PRIMARY_CONSIGNATAIRE_EMAIL], onAccept: () => decideAvis(visite, 'accepte'), onRefuse: () => decideAvis(visite, 'refuse') }))} />}
      {section === 'daps' && <ReviewTable empty="Aucun DAP accepté par la Capitainerie." headers={['Flux', 'Référence', 'Navire', 'Consignataire']} rows={pendingDAPs.map((dap) => ({ id: dap.id, cells: ['DAP', dap.numero_dap, dap.visite_maritime?.navire?.nom || 'Navire', PRIMARY_CONSIGNATAIRE_EMAIL], onAccept: () => decideDAP(dap, 'accepte'), onRefuse: () => decideDAP(dap, 'refuse') }))} />}
      {section !== 'avis' && section !== 'daps' && <ReviewTable empty="Aucune transmission du consignataire en attente." headers={['Dossier', 'Consignataire', 'Statut']} rows={documents.filter((item) => section === 'da' ? (!item.validation || item.validation === 'En attente') : (!item.statut_admin || item.statut_admin === 'en_attente')).map((item) => ({ id: item.id, cells: [documentTitle(item), item.consignataire_email || PRIMARY_CONSIGNATAIRE_EMAIL, String(section === 'da' ? item.validation || 'en_attente' : item.statut_admin || 'en_attente')], onAccept: () => decideDocument(item.id, 'accepte'), onRefuse: () => decideDocument(item.id, 'refuse'), status: item.statut_admin }))} />}
      <DecisionHistoryTable history={decisionHistory} />
    </div>
  );
};

interface ReviewRow { id: number; cells: string[]; onAccept: () => void; onRefuse: () => void; status?: string; }

const ReviewTable: React.FC<{ headers: string[]; rows: ReviewRow[]; empty: string }> = ({ headers, rows, empty }) => (
  <div className="overflow-x-auto rounded-xl border border-[#D7DEE8] bg-white shadow-sm">
    <table className="w-full min-w-[800px] text-left text-sm">
      <thead className="bg-[#F8FAFC] text-xs uppercase text-[#64748B]"><tr>{headers.map((header) => <th key={header} className="px-5 py-3">{header}</th>)}<th className="px-5 py-3 text-right">Décision</th></tr></thead>
      <tbody className="divide-y divide-[#EEF2F6]">
        {rows.length === 0 ? <tr><td colSpan={headers.length + 1} className="px-5 py-10 text-center text-[#64748B]">{empty}</td></tr> : rows.map((row) => <tr key={row.id}>{row.cells.map((cell, index) => <td key={`${row.id}-${index}`} className="px-5 py-3 text-[#172B4D]">{index === 1 ? <span className="font-mono font-bold text-[#0B4F8A]">{cell}</span> : cell}</td>)}<td className="px-5 py-3"><div className="flex justify-end gap-2"><button onClick={row.onAccept} className="inline-flex items-center gap-1 rounded-md bg-green-100 px-2.5 py-1.5 text-xs font-bold text-green-700 hover:bg-green-200"><Check size={13} />Accepter</button><button onClick={row.onRefuse} className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-200"><X size={13} />Refuser</button></div></td></tr>)}
      </tbody>
    </table>
  </div>
);

const DecisionHistoryTable: React.FC<{ history: DecisionHistoryItem[] }> = ({ history }) => (
  <section className="rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h2 className="text-base font-bold text-[#075985]">Historique des décisions Marsa Maroc</h2>
        <p className="text-xs text-[#0369A1]">Toutes les acceptations et tous les refus enregistrés dans ce module.</p>
      </div>
      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#075985]">{history.length} décision(s)</span>
    </div>
    {history.length === 0 ? <p className="rounded-lg border border-dashed border-[#7DD3FC] bg-white p-5 text-center text-sm text-[#64748B]">Aucune décision enregistrée pour le moment.</p> : <div className="overflow-x-auto rounded-lg border border-[#BAE6FD] bg-white"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-[#E0F2FE] text-xs uppercase text-[#075985]"><tr><th className="px-4 py-3">Référence</th><th className="px-4 py-3">Navire / dossier</th><th className="px-4 py-3">Décision</th><th className="px-4 py-3">Date</th></tr></thead><tbody className="divide-y divide-[#E0F2FE]">{history.slice().reverse().map((item) => <tr key={item.id}><td className="px-4 py-3 font-mono font-bold text-[#0B4F8A]">{item.reference}</td><td className="px-4 py-3 font-semibold text-[#172B4D]">{item.navire}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.decision === 'accepte' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.decision === 'accepte' ? 'Accepté' : 'Refusé'}</span></td><td className="px-4 py-3 text-xs text-[#64748B]">{item.date}</td></tr>)}</tbody></table></div>}
  </section>
);
