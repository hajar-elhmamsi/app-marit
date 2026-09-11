import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PRIMARY_CONSIGNATAIRE_EMAIL } from '../api/client';
import { useToast } from '../context/ToastContext';
import { FileText, ArrowLeft, UploadCloud, Anchor } from 'lucide-react';

interface DemandeAccostage {
  id: number;
  numero_demande: string;
  navire: string;
  poste: string;
  date_accostage: string;
  operateur: string;
  validation: string;
  observations: string;
  documents: string[];
  consignataire_email: string;
  date_decision_admin?: string;
}

const STORAGE_KEY = 'portnet_demande_accostage';

const initialDocuments = {
  demande: [] as string[],
  certificat: [] as string[],
  bordereau: [] as string[],
  validation: [] as string[],
};

export const DAAccostagePage: React.FC = () => {
  const [form, setForm] = useState({
    numero_demande: '',
    navire: '',
    poste: '',
    date_accostage: '',
    operateur: 'ANP',
    validation: 'En attente',
    observations: '',
  });
  const [documents, setDocuments] = useState<Record<string, string[]>>(initialDocuments);
  const [items, setItems] = useState<DemandeAccostage[]>([]);
  const { showToast } = useToast();

  const loadDemandes = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as DemandeAccostage[];
        if (Array.isArray(parsed)) setItems(parsed);
      } catch {}
    }
  };

  useEffect(() => {
    loadDemandes();
    const refresh = () => loadDemandes();
    window.addEventListener('storage', refresh);
    window.addEventListener('portnet-admin-decision', refresh);
    const refreshTimer = window.setInterval(refresh, 2000);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('portnet-admin-decision', refresh);
      window.clearInterval(refreshTimer);
    };
  }, []);

  const handleFileChange = (key: keyof typeof initialDocuments, files: FileList | null) => {
    if (!files) return;
    const names = Array.from(files).map((file) => file.name);
    setDocuments((prev) => ({ ...prev, [key]: names }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: DemandeAccostage = {
      id: Date.now(),
      ...form,
      documents: Object.values(documents).flat(),
      consignataire_email: PRIMARY_CONSIGNATAIRE_EMAIL,
    };

    const updated = [newItem, ...items];
    setItems(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('portnet-submission-created'));
    showToast('La demande d’accostage a été envoyée à Marsa Maroc.', 'success', 'Transmission effectuée');

    setForm({
      numero_demande: '',
      navire: '',
      poste: '',
      date_accostage: '',
      operateur: 'ANP',
      validation: 'En attente',
      observations: '',
    });
    setDocuments(initialDocuments);
  };

  const uploadGroups = [
    { key: 'demande', label: 'Demande d’accostage (DA)' },
    { key: 'certificat', label: 'Certificat / pièces techniques' },
    { key: 'bordereau', label: 'Bordereau de manutention' },
    { key: 'validation', label: 'Justificatif de validation' },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#0B4F8A]">
            <Link to="/portnet" className="inline-flex items-center gap-1 text-sm font-medium hover:underline">
              <ArrowLeft size={14} />
              PortNet
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-[#172B4D] mt-2">Demande d’accostage (DA)</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#172B4D] font-bold">
            <Anchor size={18} className="text-[#0B4F8A]" />
            <span>Demande d’accès au port</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="form-label">N° demande</span>
              <input value={form.numero_demande} onChange={(e) => setForm({ ...form, numero_demande: e.target.value })} className="form-input" placeholder="Ex. DA-2026-014" />
            </label>
            <label className="space-y-1">
              <span className="form-label">Navire</span>
              <input value={form.navire} onChange={(e) => setForm({ ...form, navire: e.target.value })} className="form-input" placeholder="Nom du navire" />
            </label>
            <label className="space-y-1">
              <span className="form-label">Poste</span>
              <input value={form.poste} onChange={(e) => setForm({ ...form, poste: e.target.value })} className="form-input" placeholder="Ex. Poste 1 / TC3" />
            </label>
            <label className="space-y-1">
              <span className="form-label">Date d’accostage</span>
              <input type="date" value={form.date_accostage} onChange={(e) => setForm({ ...form, date_accostage: e.target.value })} className="form-input" />
            </label>
            <label className="space-y-1">
              <span className="form-label">Opérateur concerné</span>
              <select value={form.operateur} onChange={(e) => setForm({ ...form, operateur: e.target.value })} className="form-input">
                <option value="ANP">ANP</option>
                <option value="Marsa Maroc">Marsa Maroc</option>
                <option value="Autre opérateur">Autre opérateur</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="form-label">Validation</span>
              <input value="Envoyée · En attente admin" readOnly className="form-input bg-[#F8FAFC]" />
            </label>
          </div>

          <label className="space-y-1 block">
            <span className="form-label">Observations</span>
            <textarea rows={3} value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} className="form-input" placeholder="Détails sur les conditions d’accostage, navigation, sécurité, etc." />
          </label>

          <div className="space-y-3 border-t border-[#E2E8F0] pt-4">
            <div className="flex items-center gap-2 font-semibold text-[#172B4D]">
              <UploadCloud size={16} className="text-[#0B4F8A]" />
              Pièces à fournir
            </div>
            {uploadGroups.map((group) => (
              <div key={group.key} className="rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-3">
                <label className="block text-sm font-medium text-[#172B4D] mb-2">{group.label}</label>
                <input type="file" multiple onChange={(e) => handleFileChange(group.key, e.target.files)} className="block w-full text-sm text-[#475569] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[#EAF4FB] file:text-[#0B4F8A] file:font-semibold" />
                {documents[group.key].length > 0 && (
                  <ul className="mt-2 text-xs text-[#475569] space-y-1">
                    {documents[group.key].map((name) => (
                      <li key={name}>• {name}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <button type="submit" className="w-full rounded-lg bg-[#0B4F8A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#083B68]">
            Envoyer la DA
          </button>
        </form>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-[#172B4D] font-bold mb-4">
            <FileText size={18} className="text-[#0B4F8A]" />
            Historique des DA accostage envoyées
          </div>

          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-6 text-sm text-[#64748B] text-center">
              Aucune DA enregistrée pour le moment.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-lg border border-[#E2E8F0] p-3">
                  <div className="flex justify-between gap-3">
                    <div>
                      <div className="font-bold text-[#172B4D]">{item.navire || 'Navire non renseigné'}</div>
                      <div className="text-xs text-[#64748B]">N° : {item.numero_demande || '—'}</div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.validation?.startsWith('Acceptée') ? 'bg-green-100 text-green-700' : item.validation?.startsWith('Refusée') ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{item.validation || 'Envoyée · En attente admin'}</span>
                  </div>
                  <div className="mt-2 text-xs text-[#64748B]">Consignataire : {item.consignataire_email || PRIMARY_CONSIGNATAIRE_EMAIL}</div>
                  {item.date_decision_admin && <div className="mt-1 text-[11px] text-[#64748B]">Décision admin : {item.date_decision_admin}</div>}
                  <div className="mt-2 text-xs text-[#475569] space-y-1">
                    <div>Poste : {item.poste || '—'}</div>
                    <div>Opérateur : {item.operateur || '—'}</div>
                    <div>Date d’accostage : {item.date_accostage || '—'}</div>
                  </div>
                  {item.documents.length > 0 && (
                    <div className="mt-2 text-xs text-[#475569]">
                      <span className="font-semibold">Documents :</span> {item.documents.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
