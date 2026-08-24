import React, { useEffect, useState } from 'react';
import { maritimeService } from '../api/client';
import { Port } from '../types';
import { Badge } from '../components/UI/Badge';
import { Modal } from '../components/UI/Modal';
import { ConfirmDialog } from '../components/UI/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  Anchor,
  Plus,
  Search,
  Edit2,
  Power,
  Layers,
  Globe2,
  Filter,
  RefreshCw
} from 'lucide-react';

export const PortsPage: React.FC = () => {
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [filterActive, setFilterActive] = useState<string>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingPort, setEditingPort] = useState<Port | null>(null);
  const [togglingPort, setTogglingPort] = useState<Port | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    code: '',
    nom: '',
    pays: '',
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { showToast } = useToast();
  const { can } = useAuth();

  const loadPorts = async () => {
    setLoading(true);
    try {
      const activeParam = filterActive === 'all' ? undefined : filterActive === 'active';
      const data = await maritimeService.getPorts(search, activeParam);
      setPorts(data);
    } catch (err) {
      showToast('Impossible de charger la liste des ports', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPorts();
  }, [filterActive]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPorts();
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
  if (!formData.code.trim()) errors.code = 'Le code UN/LOCODE est obligatoire (MACAS).';
    else if (formData.code.trim().length < 3) errors.code = 'Le code doit comporter au moins 3 caractères.';

    if (!formData.nom.trim()) errors.nom = 'Le nom du port est obligatoire.';
    if (!formData.pays.trim()) errors.pays = 'Le pays est obligatoire.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreate = () => {
    setFormData({ code: '', nom: '', pays: '', is_active: true });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (port: Port) => {
    setEditingPort(port);
    setFormData({
      code: port.code,
      nom: port.nom,
      pays: port.pays,
      is_active: port.is_active,
    });
    setFormErrors({});
  };

  const handleSavePort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingPort) {
        await maritimeService.updatePort(editingPort.id, formData);
        showToast(`Port "${formData.nom}" mis à jour avec succès.`, 'success', 'Port Modifié');
        setEditingPort(null);
      } else {
        await maritimeService.createPort(formData);
        showToast(`Nouveau port "${formData.nom}" enregistré.`, 'success', 'Port Créé');
        setIsCreateModalOpen(false);
      }
      loadPorts();
    } catch (err) {
      showToast('Erreur lors de l\'enregistrement.', 'error');
    }
  };

  const handleConfirmToggleActive = async () => {
    if (!togglingPort) return;
    try {
      await maritimeService.togglePortActive(togglingPort.id);
      const newStatus = !togglingPort.is_active ? 'activé' : 'désactivé';
      showToast(`Le port ${togglingPort.nom} a été ${newStatus}.`, 'info', 'Statut Modifié');
      setTogglingPort(null);
      loadPorts();
    } catch (err) {
      showToast('Erreur lors du changement de statut.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172B4D]">Ports maritimes</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Autorités portuaires et localisation des escales • <strong>{ports.length}</strong> ports enregistrés
          </p>
        </div>

        {can('ports.manage') && <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0B4F8A] hover:bg-[#083B68] text-white font-semibold text-sm rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>Nouveau port</span>
        </button>}
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par code UN/LOCODE, nom..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#172B4D] placeholder-[#94A3B8] focus:outline-none focus:border-[#0B4F8A] focus:ring-1 focus:ring-[#0B4F8A]"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs">
            <Filter size={14} className="text-[#0B4F8A]" />
            <span className="text-[#64748B] font-medium">Statut :</span>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="bg-transparent text-[#172B4D] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">Tous</option>
              <option value="active">Actifs uniquement</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>

          <button
            onClick={loadPorts}
            className="p-2 rounded-lg bg-white border border-[#CBD5E1] text-[#64748B] hover:text-[#0B4F8A] hover:border-[#0B4F8A] transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Ports Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#172B4D]">
            <thead className="bg-[#F8FAFC] text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
              <tr>
                <th className="px-5 py-3.5">Code UN/LOCODE</th>
                <th className="px-5 py-3.5">Nom Officiel du Port</th>
                <th className="px-5 py-3.5">Pays</th>
                <th className="px-5 py-3.5">Terminaux</th>
                <th className="px-5 py-3.5">Statut</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#64748B]">
                    Chargement des ports maritimes...
                  </td>
                </tr>
              ) : ports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#94A3B8]">
                    Aucun port trouvé.
                  </td>
                </tr>
              ) : (
                ports.map((port) => (
                  <tr key={port.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-3.5 font-bold font-mono text-[#0B4F8A]">
                      {port.code}
                    </td>

                    <td className="px-5 py-3.5 font-bold text-[#172B4D]">
                      {port.nom}
                    </td>

                    <td className="px-5 py-3.5 text-xs text-[#475569]">
                      <div className="flex items-center gap-1.5">
                        <Globe2 size={14} className="text-[#94A3B8]" />
                        <span>{port.pays}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-xs">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#F1F5F9] text-[#475569] border border-slate-200">
                        <Layers size={13} className="text-[#0B4F8A]" />
                        <span className="font-bold text-[#172B4D]">{port.terminals_count ?? 0}</span>
                        <span>terminaux</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <Badge type="active" status={port.is_active} />
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(port)}
                          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0B4F8A] hover:bg-[#EAF4FB] transition-colors"
                          title="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setTogglingPort(port)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            port.is_active
                              ? 'text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2]'
                              : 'text-[#64748B] hover:text-[#16A34A] hover:bg-[#DCFCE7]'
                          }`}
                          title={port.is_active ? 'Désactiver le port' : 'Activer le port'}
                        >
                          <Power size={16} />
                        </button>
                      </div>
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
        isOpen={isCreateModalOpen || !!editingPort}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingPort(null);
        }}
        title={editingPort ? `Modifier le port : ${editingPort.nom}` : 'Enregistrer un nouveau port'}
      >
        <form onSubmit={handleSavePort} className="space-y-4">
          <div>
            <label className="form-label">Code UN/LOCODE Unique *</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="MACAS"
              maxLength={10}
              className="form-input font-mono uppercase font-bold"
            />
            {formErrors.code && <p className="mt-1 text-xs text-[#DC2626]">{formErrors.code}</p>}
          </div>

          <div>
            <label className="form-label">Nom officiel du port *</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="Ex: Grand Port Maritime de Marseille-Fos"
              className="form-input"
            />
            {formErrors.nom && <p className="mt-1 text-xs text-[#DC2626]">{formErrors.nom}</p>}
          </div>

          <div>
            <label className="form-label">Pays *</label>
            <input
              type="text"
              value={formData.pays}
              onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
              placeholder="Ex: France, Maroc, Pays-Bas"
              className="form-input"
            />
            {formErrors.pays && <p className="mt-1 text-xs text-[#DC2626]">{formErrors.pays}</p>}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="is_active_checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-[#CBD5E1] text-[#0B4F8A] focus:ring-[#0B4F8A] cursor-pointer"
            />
            <label htmlFor="is_active_checkbox" className="text-sm text-[#334155] cursor-pointer select-none">
              Port actif et ouvert aux escales maritimes
            </label>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false);
                setEditingPort(null);
              }}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-[#0B4F8A] hover:bg-[#083B68] text-white shadow-sm"
            >
              {editingPort ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog Désactivation */}
      <ConfirmDialog
        isOpen={!!togglingPort}
        onClose={() => setTogglingPort(null)}
        onConfirm={handleConfirmToggleActive}
        title={togglingPort?.is_active ? 'Désactiver le port' : 'Activer le port'}
        message={
          togglingPort?.is_active
            ? `Êtes-vous sûr de vouloir désactiver le port "${togglingPort?.nom}" (${togglingPort?.code}) ?`
            : `Confirmez-vous la réactivation du port "${togglingPort?.nom}" ?`
        }
        confirmLabel={togglingPort?.is_active ? 'Désactiver' : 'Activer'}
        isDestructive={togglingPort?.is_active}
      />
    </div>
  );
};
