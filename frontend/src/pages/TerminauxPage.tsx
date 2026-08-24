import React, { useEffect, useState } from 'react';
import { maritimeService } from '../api/client';
import { Terminal, Port } from '../types';
import { Badge } from '../components/UI/Badge';
import { Modal } from '../components/UI/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Anchor,
  Filter,
  RefreshCw,
  Boxes,
  Fuel,
  Ship,
  Users
} from 'lucide-react';

export const TerminauxPage: React.FC = () => {
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedPortId, setSelectedPortId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingTerminal, setEditingTerminal] = useState<Terminal | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    port_id: 1,
    code: '',
    nom: '',
    type_terminal: 'conteneurs' as Terminal['type_terminal'],
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { showToast } = useToast();
  const { can } = useAuth();

  const loadData = async () => {
    setLoading(true);
    try {
      const portIdNum = selectedPortId === 'all' ? undefined : Number(selectedPortId);
      const [termList, portList] = await Promise.all([
        maritimeService.getTerminals(portIdNum, search),
        maritimeService.getPorts(),
      ]);
      setTerminals(termList);
      setPorts(portList);
      if (portList.length > 0 && !formData.port_id) {
        setFormData((prev) => ({ ...prev, port_id: portList[0].id }));
      }
    } catch (err) {
      showToast('Impossible de charger les terminaux', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPortId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const filteredTerminals = terminals.filter((t) => {
    if (selectedType !== 'all' && t.type_terminal !== selectedType) return false;
    return true;
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.port_id) errors.port_id = 'Le port de rattachement est obligatoire.';
    if (!formData.code.trim()) errors.code = 'Le code du terminal est obligatoire.';
    if (!formData.nom.trim()) errors.nom = 'Le nom du terminal est obligatoire.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreate = () => {
    const defaultPortId = ports[0]?.id || 1;
    setFormData({
      port_id: defaultPortId,
      code: '',
      nom: '',
      type_terminal: 'conteneurs',
      is_active: true,
    });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (term: Terminal) => {
    setEditingTerminal(term);
    setFormData({
      port_id: term.port_id,
      code: term.code,
      nom: term.nom,
      type_terminal: term.type_terminal,
      is_active: term.is_active,
    });
    setFormErrors({});
  };

  const handleSaveTerminal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingTerminal) {
        showToast(`Terminal "${formData.nom}" mis à jour avec succès.`, 'success', 'Terminal Modifié');
        setEditingTerminal(null);
      } else {
        await maritimeService.createTerminal(formData);
        showToast(`Terminal "${formData.nom}" ajouté avec succès.`, 'success', 'Terminal Créé');
        setIsCreateModalOpen(false);
      }
      loadData();
    } catch (err) {
      showToast('Erreur lors de l\'enregistrement.', 'error');
    }
  };

  const getTerminalTypeBadge = (type: Terminal['type_terminal']) => {
    switch (type) {
      case 'conteneurs':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#EAF4FB] text-[#0B4F8A] border border-blue-200">
            <Boxes size={12} /> Conteneurs
          </span>
        );
      case 'petrolier':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#FEE2E2] text-[#B91C1C] border border-red-200">
            <Fuel size={12} /> Pétrolier
          </span>
        );
      case 'vraquier':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#FEF3C7] text-[#B45309] border border-amber-200">
            <Ship size={12} /> Vraquier
          </span>
        );
      case 'passagers':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#EDE9FE] text-[#6D28D9] border border-purple-200">
            <Users size={12} /> Passagers & RoRo
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#F1F5F9] text-[#475569] border border-slate-200">
            Polyvalent
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172B4D]">Terminaux à quai</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Postes d'amarrage, capacités et installations spécialisées des ports • <strong>{filteredTerminals.length}</strong> terminaux
          </p>
        </div>

        {can('terminals.manage') && <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0B4F8A] hover:bg-[#083B68] text-white font-semibold text-sm rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>Nouveau terminal</span>
        </button>}
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher code, terminal..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#172B4D] placeholder-[#94A3B8] focus:outline-none focus:border-[#0B4F8A] focus:ring-1 focus:ring-[#0B4F8A]"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          {/* Port Filter */}
          <div className="flex items-center gap-2 bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs">
            <Anchor size={14} className="text-[#0B4F8A]" />
            <span className="text-[#64748B] font-medium">Port :</span>
            <select
              value={selectedPortId}
              onChange={(e) => setSelectedPortId(e.target.value)}
              className="bg-transparent text-[#172B4D] font-semibold focus:outline-none cursor-pointer max-w-[160px] truncate"
            >
              <option value="all">Tous les ports</option>
              {ports.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2 bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs">
            <Filter size={14} className="text-[#0B4F8A]" />
            <span className="text-[#64748B] font-medium">Type :</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-transparent text-[#172B4D] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">Tous types</option>
              <option value="conteneurs">Conteneurs</option>
              <option value="petrolier">Pétrolier</option>
              <option value="vraquier">Vraquier</option>
              <option value="passagers">Passagers & RoRo</option>
              <option value="polyvalent">Polyvalent</option>
            </select>
          </div>

          <button
            onClick={loadData}
            className="p-2 rounded-lg bg-white border border-[#CBD5E1] text-[#64748B] hover:text-[#0B4F8A] hover:border-[#0B4F8A] transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Terminaux Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#172B4D]">
            <thead className="bg-[#F8FAFC] text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
              <tr>
                <th className="px-5 py-3.5">Code Terminal</th>
                <th className="px-5 py-3.5">Nom du Terminal</th>
                <th className="px-5 py-3.5">Port de Rattachement</th>
                <th className="px-5 py-3.5">Typologie</th>
                <th className="px-5 py-3.5">Statut</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#64748B]">
                    Chargement des terminaux...
                  </td>
                </tr>
              ) : filteredTerminals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#94A3B8]">
                    Aucun terminal ne correspond aux critères.
                  </td>
                </tr>
              ) : (
                filteredTerminals.map((term) => (
                  <tr key={term.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-3.5 font-bold font-mono text-[#0B4F8A]">
                      {term.code}
                    </td>

                    <td className="px-5 py-3.5 font-bold text-[#172B4D]">
                      {term.nom}
                    </td>

                    <td className="px-5 py-3.5 text-xs text-[#475569]">
                      <div className="flex items-center gap-1.5">
                        <Anchor size={14} className="text-[#0B4F8A]" />
                        <span className="font-semibold text-[#172B4D]">{term.port?.nom || `Port #${term.port_id}`}</span>
                        {term.port?.code && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#64748B] border border-slate-200">
                            {term.port.code}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      {getTerminalTypeBadge(term.type_terminal)}
                    </td>

                    <td className="px-5 py-3.5">
                      <Badge type="active" status={term.is_active} />
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      {can('terminals.manage') && <button
                        onClick={() => handleOpenEdit(term)}
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0B4F8A] hover:bg-[#EAF4FB] transition-colors"
                        title="Modifier"
                      >
                        <Edit2 size={16} />
                      </button>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Création / Modification */}
      <Modal
        isOpen={isCreateModalOpen || !!editingTerminal}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingTerminal(null);
        }}
        title={editingTerminal ? `Modifier le terminal : ${editingTerminal.nom}` : 'Ajouter un terminal à quai'}
      >
        <form onSubmit={handleSaveTerminal} className="space-y-4">
          <div>
            <label className="form-label">Port de rattachement *</label>
            <select
              value={formData.port_id}
              onChange={(e) => setFormData({ ...formData, port_id: Number(e.target.value) })}
              className="form-input"
            >
              {ports.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.nom} ({p.pays})
                </option>
              ))}
            </select>
            {formErrors.port_id && <p className="mt-1 text-xs text-[#DC2626]">{formErrors.port_id}</p>}
          </div>

          <div>
            <label className="form-label">Code unique du terminal *</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="Ex: TERM-FOS-2XL"
              className="form-input font-mono uppercase font-bold"
            />
            {formErrors.code && <p className="mt-1 text-xs text-[#DC2626]">{formErrors.code}</p>}
          </div>

          <div>
            <label className="form-label">Nom du terminal *</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="Ex: Terminal Conteneurs Fos 2XL"
              className="form-input"
            />
            {formErrors.nom && <p className="mt-1 text-xs text-[#DC2626]">{formErrors.nom}</p>}
          </div>

          <div>
            <label className="form-label">Typologie opérationnelle *</label>
            <select
              value={formData.type_terminal}
              onChange={(e) => setFormData({ ...formData, type_terminal: e.target.value as any })}
              className="form-input"
            >
              <option value="conteneurs">Conteneurs (TEU / Boîtes)</option>
              <option value="petrolier">Pétrolier / Hydrocarbures</option>
              <option value="vraquier">Vraquier / Minéralier</option>
              <option value="passagers">Passagers / Roulier (RoRo)</option>
              <option value="polyvalent">Polyvalent / Marchandises diverses</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="term_active_checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-[#CBD5E1] text-[#0B4F8A] focus:ring-[#0B4F8A] cursor-pointer"
            />
            <label htmlFor="term_active_checkbox" className="text-sm text-[#334155] cursor-pointer select-none">
              Terminal opérationnel pour les visites maritimes
            </label>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false);
                setEditingTerminal(null);
              }}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-[#0B4F8A] hover:bg-[#083B68] text-white shadow-sm"
            >
              {editingTerminal ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
