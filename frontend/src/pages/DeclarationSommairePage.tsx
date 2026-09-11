import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, ArrowLeft, UploadCloud, FileText } from 'lucide-react';
import { PRIMARY_CONSIGNATAIRE_EMAIL } from '../api/client';
import { useToast } from '../context/ToastContext';

interface DeclarationSommaire {
  id: number;
  navire: string;
  armateur: string;
  nationalite: string;
  tonnage_brut: string;
  tonnage_net: string;
  quantite_marchandises: string;
  date_chargement: string;
  type_cargaison: string;
  notes: string;
  documents: string[];
  consignataire_email?: string;
  statut_admin?: 'en_attente' | 'accepte' | 'refuse';
  date_decision_admin?: string;
}

const STORAGE_KEY = 'portnet_declaration_sommaire';

const initialDocuments = {
  cona: [] as string[],
  cargo: [] as string[],
  crew: [] as string[],
  plan: [] as string[],
  dechets: [] as string[],
};

export const DeclarationSommairePage: React.FC = () => {
  const [form, setForm] = useState({
    navire: '',
    armateur: '',
    nationalite: '',
    tonnage_brut: '',
    tonnage_net: '',
    quantite_marchandises: '',
    date_chargement: '',
    type_cargaison: 'Vrac',
    notes: '',
  });
  const [documents, setDocuments] = useState<Record<string, string[]>>(initialDocuments);
  const [items, setItems] = useState<DeclarationSommaire[]>([]);
  const { showToast } = useToast();

  const loadDeclarations = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as DeclarationSommaire[];
        if (Array.isArray(parsed)) setItems(parsed);
      } catch {}
    }
  };

  useEffect(() => {
    loadDeclarations();
    const refresh = () => loadDeclarations();
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

    const newItem: DeclarationSommaire = {
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
    showToast('La déclaration sommaire a été envoyée à Marsa Maroc.', 'success', 'Transmission effectuée');

    setForm({
      navire: '',
      armateur: '',
      nationalite: '',
      tonnage_brut: '',
      tonnage_net: '',
      quantite_marchandises: '',
      date_chargement: '',
      type_cargaison: 'Vrac',
      notes: '',
    });
    setDocuments(initialDocuments);
  };

  const uploadGroups = [
    { key: 'cona', label: 'Connaissement / facture' },
    { key: 'cargo', label: 'Cargo Manifest' },
    { key: 'crew', label: 'Crew List / Nill(e)' },
    { key: 'plan', label: 'Plan de chargement' },
    { key: 'dechets', label: 'Liste des déchets' },
  ] as const;

  const statusLabel = (status?: DeclarationSommaire['statut_admin']) => {
    if (status === 'accepte') return 'Acceptée par Marsa Maroc';
    if (status === 'refuse') return 'Refusée par Marsa Maroc';
    return 'Envoyée · En attente admin';
  };

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
          <h1 className="text-2xl font-bold text-[#172B4D] mt-2">Déclaration sommaire</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#172B4D] font-bold">
            <ClipboardList size={18} className="text-[#0B4F8A]" />
            <span>Informations douanières</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="form-label">Navire</span>
              <input value={form.navire} onChange={(e) => setForm({ ...form, navire: e.target.value })} className="form-input" placeholder="Nom du navire" />
            </label>
            <label className="space-y-1">
              <span className="form-label">Armateur</span>
              <input value={form.armateur} onChange={(e) => setForm({ ...form, armateur: e.target.value })} className="form-input" placeholder="Nom de l’armateur" />
            </label>
            <label className="space-y-1">
              <span className="form-label">Nationalité du navire</span>
              <input value={form.nationalite} onChange={(e) => setForm({ ...form, nationalite: e.target.value })} className="form-input" placeholder="Ex. Maroc / France" />
            </label>
            <label className="space-y-1">
              <span className="form-label">Type de cargaison</span>
              <select value={form.type_cargaison} onChange={(e) => setForm({ ...form, type_cargaison: e.target.value })} className="form-input">
                <option>Vrac</option>
                <option>Conteneurs</option>
                <option>Produits pétroliers</option>
                <option>Véhicules</option>
                <option>Engrais / minéraux</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="form-label">Tonnage brut</span>
              <input value={form.tonnage_brut} onChange={(e) => setForm({ ...form, tonnage_brut: e.target.value })} className="form-input" placeholder="Ex. 54000" />
            </label>
            <label className="space-y-1">
              <span className="form-label">Tonnage net</span>
              <input value={form.tonnage_net} onChange={(e) => setForm({ ...form, tonnage_net: e.target.value })} className="form-input" placeholder="Ex. 32500" />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="form-label">Quantité de marchandises à bord</span>
              <input value={form.quantite_marchandises} onChange={(e) => setForm({ ...form, quantite_marchandises: e.target.value })} className="form-input" placeholder="Ex. 35000 tonnes / 1200 conteneurs" />
            </label>
            <label className="space-y-1">
              <span className="form-label">Date de chargement</span>
              <input type="date" value={form.date_chargement} onChange={(e) => setForm({ ...form, date_chargement: e.target.value })} className="form-input" />
            </label>
            <label className="space-y-1">
              <span className="form-label">Port d’origine</span>
              <input className="form-input" placeholder="Ex. Tanger / Rotterdam" />
            </label>
          </div>

          <label className="space-y-1 block">
            <span className="form-label">Observations / commentaire</span>
            <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="form-input" placeholder="Mention utile pour la douane ou l’ANP" />
          </label>

          <div className="space-y-3 border-t border-[#E2E8F0] pt-4">
            <div className="flex items-center gap-2 font-semibold text-[#172B4D]">
              <UploadCloud size={16} className="text-[#0B4F8A]" />
              Documents demandés
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
            Envoyer la déclaration sommaire
          </button>
        </form>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-[#172B4D] font-bold mb-4">
            <FileText size={18} className="text-[#0B4F8A]" />
            Historique des déclarations envoyées
          </div>

          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-6 text-sm text-[#64748B] text-center">
              Aucune déclaration sommaire enregistrée pour le moment.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-lg border border-[#E2E8F0] p-3">
                  <div className="flex justify-between gap-3">
                    <div>
                      <div className="font-bold text-[#172B4D]">{item.navire || 'Navire non renseigné'}</div>
                      <div className="text-xs text-[#64748B]">Armateur : {item.armateur || '—'}</div>
                    </div>
                    <span className="text-xs font-semibold bg-[#EAF4FB] text-[#0B4F8A] px-2 py-1 rounded-full">{item.type_cargaison}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                    <span>Consignataire : {item.consignataire_email || PRIMARY_CONSIGNATAIRE_EMAIL}</span>
                    <span className={`rounded-full px-2 py-1 font-semibold ${item.statut_admin === 'accepte' ? 'bg-green-100 text-green-700' : item.statut_admin === 'refuse' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {statusLabel(item.statut_admin)}
                    </span>
                  </div>
                  {item.date_decision_admin && <div className="mt-1 text-[11px] text-[#64748B]">Décision admin : {item.date_decision_admin}</div>}
                  <div className="mt-2 text-xs text-[#475569] space-y-1">
                    <div>Tonnage brut : {item.tonnage_brut || '—'}</div>
                    <div>Tonnage net : {item.tonnage_net || '—'}</div>
                    <div>Quantité : {item.quantite_marchandises || '—'}</div>
                    <div>Date de chargement : {item.date_chargement || '—'}</div>
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
