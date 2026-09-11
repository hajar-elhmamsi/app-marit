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

const STORAGE_KEYS: Record<Exclude<AdminMaritimeSection, 'avis' | 'daps'>, string> = {
  declaration: 'portnet_declaration_sommaire',
  bon: 'portnet_bon_a_delivrer',
  da: 'portnet_demande_accostage',
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
    const updated = documents.map((item) => item.id === id ? { ...item, ...(section === 'da' ? { validation: statut_admin === 'accepte' ? 'Acceptée par Marsa Maroc' : 'Refusée par Marsa Maroc', date_decision_admin: decisionDate } : { statut_admin, date_decision_admin: decisionDate }) } : item);
    setDocuments(updated);
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new Event('portnet-admin-decision'));
    showToast(statut_admin === 'accepte' ? 'Document accepté et statut renvoyé au consignataire.' : 'Document refusé et statut renvoyé au consignataire.', statut_admin === 'accepte' ? 'success' : 'error');
  };

  const decideAvis = (visite: VisiteMaritime, statut: 'accepte' | 'refuse') => {
    const adminUpdated = { ...adminAvisDecisions, [visite.id]: `admin_${statut}` };
    setAdminAvisDecisions(adminUpdated);
    localStorage.setItem('admin_avis_decisions', JSON.stringify(adminUpdated));
    showToast(statut === 'accepte' ? 'Avis d’arrivée accepté par Marsa Maroc.' : 'Avis d’arrivée refusé par Marsa Maroc.', statut === 'accepte' ? 'success' : 'error');
  };

  const decideDAP = async (dap: DAP, statut: 'accepte' | 'refuse') => {
    const updated = { ...adminDAPDecisions, [dap.id]: statut };
    setAdminDAPDecisions(updated);
    localStorage.setItem('admin_dap_decisions', JSON.stringify(updated));
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
