import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PackageCheck, ArrowLeft, UploadCloud, FileText } from 'lucide-react';
import { PRIMARY_CONSIGNATAIRE_EMAIL } from '../api/client';
import { useToast } from '../context/ToastContext';

interface BonADelivrer {
  id: number;
  numero_receptionnaire: string;
  nom_receptionnaire: string;
  quantite_a_decharger: string;
  port_de_chargement: string;
  poste_quai: string;
  date_prevue: string;
  observations: string;
  documents: string[];
  consignataire_email?: string;
  statut_admin?: 'en_attente' | 'accepte' | 'refuse';
  date_decision_admin?: string;
}

const STORAGE_KEY = 'portnet_bon_a_delivrer';

const initialDocuments = {
  bon: [] as string[],
  ordre: [] as string[],
  facture: [] as string[],
  reception: [] as string[],
};

export const BonADelivrerPage: React.FC = () => {
  const [form, setForm] = useState({
    numero_receptionnaire: '',
    nom_receptionnaire: '',
    quantite_a_decharger: '',
    port_de_chargement: '',
    poste_quai: '',
    date_prevue: '',
    observations: '',
  });
  const [documents, setDocuments] = useState<Record<string, string[]>>(initialDocuments);
  const [items, setItems] = useState<BonADelivrer[]>([]);
  const { showToast } = useToast();

  const loadBons = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as BonADelivrer[];
        if (Array.isArray(parsed)) setItems(parsed);
      } catch {}
    }
  };

  useEffect(() => {
    loadBons();
    const refresh = () => loadBons();
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
    const newItem: BonADelivrer = {
      id: Date.now(),
      ...form,
      documents: Object.values(documents).flat(),
      consignataire_email: PRIMARY_CONSIGNATAIRE_EMAIL,
      statut_admin: 'en_attente',
    };

    const updated = [newItem, ...items];
    setItems(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('portnet-submission-created'));
    showToast('Le bon à délivrer a été envoyé à Marsa Maroc.', 'success', 'Transmission effectuée');

    setForm({
      numero_receptionnaire: '',
      nom_receptionnaire: '',
      quantite_a_decharger: '',
      port_de_chargement: '',
      poste_quai: '',
      date_prevue: '',
      observations: '',
    });
    setDocuments(initialDocuments);
  };

  const uploadGroups = [
    { key: 'bon', label: 'Bon à délivrer' },
    { key: 'ordre', label: 'Ordre de déchargement' },
    { key: 'facture', label: 'Facture / documents réception' },
    { key: 'reception', label: 'Pièces réceptionnaire' },
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
          <h1 className="text-2xl font-bold text-[#172B4D] mt-2">Bon à délivrer</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#172B4D] font-bold">
            <PackageCheck size={18} className="text-[#0B4F8A]" />
            <span>Informations du bon à délivrer</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="form-label">N° réceptionnaire (OCP)</span>
              <input value={form.numero_receptionnaire} onChange={(e) => setForm({ ...form, numero_receptionnaire: e.target.value })} className="form-input" placeholder="Ex. OCP-1023" />
            </label>
            <label className="space-y-1">
              <span className="form-label">Nom du réceptionnaire</span>
              <input value={form.nom_receptionnaire} onChange={(e) => setForm({ ...form, nom_receptionnaire: e.target.value })} className="form-input" placeholder="Nom du destinataire" />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="form-label">Quantité à décharger</span>
              <input value={form.quantite_a_decharger} onChange={(e) => setForm({ ...form, quantite_a_decharger: e.target.value })} className="form-input" placeholder="Ex. 1800 tonnes / 400 conteneurs" />
            </label>
            <label className="space-y-1">
              <span className="form-label">Port de chargement</span>
              <input value={form.port_de_chargement} onChange={(e) => setForm({ ...form, port_de_chargement: e.target.value })} className="form-input" placeholder="Ex. Tanger / Rotterdam" />
            </label>
            <label className="space-y-1">
              <span className="form-label">Poste de quai</span>
              <input value={form.poste_quai} onChange={(e) => setForm({ ...form, poste_quai: e.target.value })} className="form-input" placeholder="Ex. Poste 2 / TC3" />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="form-label">Date prévue</span>
              <input type="date" value={form.date_prevue} onChange={(e) => setForm({ ...form, date_prevue: e.target.value })} className="form-input" />
            </label>
          </div>

          <label className="space-y-1 block">
            <span className="form-label">Observations</span>
            <textarea rows={3} value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} className="form-input" placeholder="Conditions de livraison, manutention, précautions, etc." />
          </label>

          <div className="space-y-3 border-t border-[#E2E8F0] pt-4">
            <div className="flex items-center gap-2 font-semibold text-[#172B4D]">
              <UploadCloud size={16} className="text-[#0B4F8A]" />
              Pièces à joindre
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
            Envoyer le bon à délivrer
          </button>
        </form>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-[#172B4D] font-bold mb-4">
            <FileText size={18} className="text-[#0B4F8A]" />
            Historique des bons à délivrer envoyés
          </div>

          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-6 text-sm text-[#64748B] text-center">
              Aucun bon à délivrer enregistré.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-lg border border-[#E2E8F0] p-3">
                  <div className="flex justify-between gap-3">
                    <div>
                      <div className="font-bold text-[#172B4D]">{item.nom_receptionnaire || 'Réceptionnaire'}</div>
                      <div className="text-xs text-[#64748B]">N° : {item.numero_receptionnaire || '—'}</div>
                    </div>
                    <span className="text-xs font-semibold bg-[#EAF4FB] text-[#0B4F8A] px-2 py-1 rounded-full">{item.poste_quai || '—'}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                    <span>Consignataire : {item.consignataire_email || PRIMARY_CONSIGNATAIRE_EMAIL}</span>
                    <span className={`rounded-full px-2 py-1 font-semibold ${item.statut_admin === 'accepte' ? 'bg-green-100 text-green-700' : item.statut_admin === 'refuse' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {item.statut_admin === 'accepte' ? 'Accepté par Marsa Maroc' : item.statut_admin === 'refuse' ? 'Refusé par Marsa Maroc' : 'Envoyé · En attente admin'}
                    </span>
                  </div>
                  {item.date_decision_admin && <div className="mt-1 text-[11px] text-[#64748B]">Décision admin : {item.date_decision_admin}</div>}
                  <div className="mt-2 text-xs text-[#475569] space-y-1">
                    <div>Quantité : {item.quantite_a_decharger || '—'}</div>
                    <div>Port de chargement : {item.port_de_chargement || '—'}</div>
                    <div>Date prévue : {item.date_prevue || '—'}</div>
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
