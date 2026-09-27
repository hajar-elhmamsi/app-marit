import React, { useEffect, useState } from 'react';
import { Anchor, Check, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface AccostageRequest {
  id: number;
  numero_demande: string;
  navire: string;
  poste: string;
  date_accostage: string;
  operateur: string;
  validation: string;
  consignataire_email: string;
  documents: string[];
  heure_validation?: string;
}

interface PlanningDecision {
  id: string;
  reference: string;
  navire: string;
  poste: string;
  decision: 'acceptee' | 'refusee';
  date: string;
}

const STORAGE_KEY = 'portnet_demande_accostage';
const HISTORY_KEY = 'marsa_maroc_planning_history';

export const MarsaPlanningPage: React.FC = () => {
  const [requests, setRequests] = useState<AccostageRequest[]>([]);
  const [times, setTimes] = useState<Record<number, string>>({});
  const [history, setHistory] = useState<PlanningDecision[]>([]);
  const { showToast } = useToast();

  const loadRequests = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as AccostageRequest[];
      if (Array.isArray(parsed)) {
        setRequests(parsed.filter((item) => item.operateur === 'Marsa Maroc'));
      }
    } catch {}
  };

  useEffect(() => {
    loadRequests();
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory) as PlanningDecision[];
        if (Array.isArray(parsed)) setHistory(parsed);
      } catch {}
    }
  }, []);

  const decide = (request: AccostageRequest, decision: 'Acceptée par Marsa Maroc' | 'Refusée par Marsa Maroc') => {
    const allSaved = localStorage.getItem(STORAGE_KEY);
    if (!allSaved) return;

    try {
      const all = JSON.parse(allSaved) as AccostageRequest[];
      const updated = all.map((item) => item.id === request.id
        ? { ...item, validation: decision, heure_validation: times[request.id] || '' }
        : item
      );
      const decisionDate = new Date().toLocaleString('fr-FR');
      const decisionEntry: PlanningDecision = {
          id: `${request.id}-${Date.now()}`,
          reference: request.numero_demande,
          navire: request.navire,
          poste: request.poste || 'À affecter',
          decision: decision.startsWith('Acceptée') ? 'acceptee' : 'refusee',
          date: decisionDate,
      };
      const updatedHistory = [...history, decisionEntry];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      setRequests(updated.filter((item) => item.operateur === 'Marsa Maroc'));
      setHistory(updatedHistory);
      window.dispatchEvent(new Event('portnet-admin-decision'));
      showToast(
        `${request.numero_demande} : ${decision.toLowerCase()} pour ${request.poste}.`,
        decision.startsWith('Acceptée') ? 'success' : 'error',
        'Planning Marsa Maroc',
      );
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-[#111C2E] p-6 text-white shadow-sm">
        <div className="flex items-center gap-2 text-orange-300 text-xs font-bold uppercase tracking-wider">
          <Anchor size={15} /> Marsa Maroc · Opérateur de quai
        </div>
        <h1 className="mt-2 text-2xl font-bold">Demandes de postes et planning TOPI</h1>
        <p className="mt-1 text-sm text-slate-300">L’opérateur accepte ou refuse le poste demandé par le consignataire.</p>
      </div>

      <div className="rounded-xl border border-[#D7DEE8] bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[#E2E8F0] p-5">
          <h2 className="text-lg font-bold text-[#172B4D]">Demandes reçues</h2>
          <p className="text-xs text-[#64748B] mt-1">Les demandes du consignataire sont affichées pour décision de Marsa Maroc.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-[#F8FAFC] text-xs uppercase text-[#64748B]">
              <tr>
                <th className="px-5 py-3">Référence</th>
                <th className="px-5 py-3">Navire</th>
                <th className="px-5 py-3">Consignataire</th>
                <th className="px-5 py-3">Poste demandé</th>
                <th className="px-5 py-3">Heure</th>
                <th className="px-5 py-3 text-right">Décision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF2F6]">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[#64748B]">Aucune demande de poste Marsa Maroc.</td>
                </tr>
              ) : requests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-5 py-3 font-mono font-bold text-[#0B4F8A]">{request.numero_demande}</td>
                    <td className="px-5 py-3 font-semibold text-[#172B4D]">{request.navire}</td>
                    <td className="px-5 py-3 text-xs text-[#475569]">{request.consignataire_email || 'agent@portcasablanca.ma'}</td>
                    <td className="px-5 py-3 font-bold text-[#172B4D]">{request.poste || 'À affecter'}</td>
                    <td className="px-5 py-3">
                      <input type="time" value={times[request.id] || request.heure_validation || ''} onChange={(event) => setTimes({ ...times, [request.id]: event.target.value })} className="form-input text-xs" />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => decide(request, 'Acceptée par Marsa Maroc')} className="inline-flex items-center gap-1 rounded-md bg-green-100 px-2.5 py-1.5 text-xs font-bold text-green-700 hover:bg-green-200"><Check size={13} />Accepter</button>
                        <button onClick={() => decide(request, 'Refusée par Marsa Maroc')} className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-200"><X size={13} />Refuser</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#075985]">Historique des demandes traitées</h2>
            <p className="mt-1 text-xs text-[#0369A1]">Demandes acceptées ou refusées par Marsa Maroc.</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#075985]">{history.length} décision(s)</span>
        </div>
        {history.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#7DD3FC] bg-white p-5 text-center text-sm text-[#64748B]">Aucune demande traitée pour le moment.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#BAE6FD] bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[#E0F2FE] text-xs uppercase text-[#075985]"><tr><th className="px-4 py-3">Référence</th><th className="px-4 py-3">Navire</th><th className="px-4 py-3">Poste</th><th className="px-4 py-3">Décision</th><th className="px-4 py-3">Date</th></tr></thead>
              <tbody className="divide-y divide-[#E0F2FE]">
                {history.slice().reverse().map((item) => <tr key={item.id}><td className="px-4 py-3 font-mono font-bold text-[#0B4F8A]">{item.reference}</td><td className="px-4 py-3 font-semibold text-[#172B4D]">{item.navire}</td><td className="px-4 py-3 text-[#475569]">{item.poste}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.decision === 'acceptee' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.decision === 'acceptee' ? 'Acceptée' : 'Refusée'}</span></td><td className="px-4 py-3 text-xs text-[#64748B]">{item.date}</td></tr>)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
