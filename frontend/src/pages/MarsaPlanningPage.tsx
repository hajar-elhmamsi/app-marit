import React, { useEffect, useState } from 'react';
import { Clock3, Check, X, Anchor } from 'lucide-react';
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
}

const STORAGE_KEY = 'portnet_demande_accostage';

export const MarsaPlanningPage: React.FC = () => {
  const [requests, setRequests] = useState<AccostageRequest[]>([]);
  const [times, setTimes] = useState<Record<number, string>>({});
  const { showToast } = useToast();

  const loadRequests = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as AccostageRequest[];
      if (Array.isArray(parsed)) setRequests(parsed.filter((item) => item.operateur === 'Marsa Maroc'));
    } catch {}
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const decide = (request: AccostageRequest, status: string) => {
    const updated = requests.map((item) => item.id === request.id ? { ...item, validation: status } : item);
    setRequests(updated);

    const allSaved = localStorage.getItem(STORAGE_KEY);
    if (allSaved) {
      try {
        const all = JSON.parse(allSaved) as AccostageRequest[];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all.map((item) => item.id === request.id ? { ...item, validation: status, heure_validation: times[request.id] || '' } : item)));
      } catch {}
    }

    showToast(`${request.numero_demande} : ${status.toLowerCase()} pour ${request.poste}.`, status === 'Acceptée par Marsa Maroc' ? 'success' : status === 'Refusée par Marsa Maroc' ? 'error' : 'warning', 'Planning Marsa Maroc');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-[#111C2E] p-6 text-white shadow-sm">
        <div className="flex items-center gap-2 text-orange-300 text-xs font-bold uppercase tracking-wider"><Anchor size={15} /> Marsa Maroc · Opérateur de quai</div>
        <h1 className="mt-2 text-2xl font-bold">Demandes de postes et planning TOPI</h1>
        <p className="mt-1 text-sm text-slate-300">L’opérateur accepte, refuse ou maintient en attente le poste demandé par le consignataire.</p>
      </div>

      <div className="rounded-xl border border-[#D7DEE8] bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[#E2E8F0] p-5"><h2 className="text-lg font-bold text-[#172B4D]">Demandes reçues</h2><p className="text-xs text-[#64748B] mt-1">La décision est immédiatement visible dans le planning de la Capitainerie.</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="bg-[#F8FAFC] text-xs uppercase text-[#64748B]"><tr><th className="px-5 py-3">Référence</th><th className="px-5 py-3">Navire</th><th className="px-5 py-3">Consignataire</th><th className="px-5 py-3">Poste demandé</th><th className="px-5 py-3">Heure</th><th className="px-5 py-3">Statut</th><th className="px-5 py-3 text-right">Décision</th></tr></thead><tbody className="divide-y divide-[#EEF2F6]">{requests.length === 0 ? <tr><td colSpan={7} className="px-5 py-10 text-center text-[#64748B]">Aucune demande de poste Marsa Maroc.</td></tr> : requests.map((request) => { const pending = !request.validation || request.validation === 'En attente'; return <tr key={request.id}><td className="px-5 py-3 font-mono font-bold text-[#0B4F8A]">{request.numero_demande}</td><td className="px-5 py-3 font-semibold text-[#172B4D]">{request.navire}</td><td className="px-5 py-3 text-xs text-[#475569]">{request.consignataire_email || 'agent@portcasablanca.ma'}</td><td className="px-5 py-3 font-bold text-[#172B4D]">{request.poste}</td><td className="px-5 py-3"><input type="time" value={times[request.id] || ''} onChange={(e) => setTimes({ ...times, [request.id]: e.target.value })} className="form-input text-xs" /></td><td className="px-5 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${request.validation?.startsWith('Acceptée') ? 'bg-green-100 text-green-700' : request.validation?.startsWith('Refusée') ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{request.validation || 'En attente'}</span></td><td className="px-5 py-3"><div className="flex justify-end gap-2">{pending && <><button onClick={() => decide(request, 'Acceptée par Marsa Maroc')} className="inline-flex items-center gap-1 rounded-md bg-green-100 px-2.5 py-1.5 text-xs font-bold text-green-700 hover:bg-green-200"><Check size={13} />Accepter</button><button onClick={() => decide(request, 'En attente')} className="inline-flex items-center gap-1 rounded-md bg-orange-100 px-2.5 py-1.5 text-xs font-bold text-orange-700 hover:bg-orange-200"><Clock3 size={13} />Attente</button><button onClick={() => decide(request, 'Refusée par Marsa Maroc')} className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-200"><X size={13} />Refuser</button></>}</div></td></tr>; })}</tbody></table></div>
      </div>
    </div>
  );
};
