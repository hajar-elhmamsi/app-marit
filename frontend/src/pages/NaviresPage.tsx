import React, { useEffect, useState } from 'react';
import { maritimeService } from '../api/client';
import { Navire } from '../types';
import { Badge } from '../components/UI/Badge';
import { Modal } from '../components/UI/Modal';
import { ConfirmDialog } from '../components/UI/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  Ship,
  Plus,
  Search,
  Edit2,
  Trash2,
  Flag,
  Filter,
  RefreshCw
} from 'lucide-react';

export const NaviresPage: React.FC = () => {
  const [navires, setNavires] = useState<Navire[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingNavire, setEditingNavire] = useState<Navire | null>(null);
  const [deletingNavire, setDeletingNavire] = useState<Navire | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    imo: '',
    nom: '',
    pavillon: '',
    type_navire: 'porte_conteneurs' as Navire['type_navire'],
    longueur_m: 300,
    tirant_eau_m: 14.5,
    jauge_brute: 100000,
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { showToast } = useToast();
  const { can } = useAuth();

  const loadNavires = async () => {
    setLoading(true);
    try {
      const typeParam = selectedType === 'all' ? '' : selectedType;
      const data = await maritimeService.getNavires(search, typeParam);
      setNavires(data);
    } catch (err) {
      showToast('Impossible de charger la flotte de navires', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNavires();
  }, [selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadNavires();
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const imoClean = formData.imo.trim();
    if (!imoClean) {
      errors.imo = 'Le numéro IMO est obligatoire (7 chiffres).';
    } else if (!/^\d{7}$/.test(imoClean)) {
      errors.imo = 'Le numéro IMO doit comporter exactement 7 chiffres.';
    }

    if (!formData.nom.trim()) errors.nom = 'Le nom du navire est obligatoire.';
    if (!formData.pavillon.trim()) errors.pavillon = 'Le pavillon est obligatoire.';
    if (formData.longueur_m <= 0) errors.longueur_m = 'La longueur doit être positive.';
    if (formData.tirant_eau_m <= 0) errors.tirant_eau_m = 'Le tirant d\'eau doit être positif.';
    if (formData.jauge_brute <= 0) errors.jauge_brute = 'La jauge brute doit être positive.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreate = () => {
    setFormData({
      imo: '',
      nom: '',
      pavillon: '',
      type_navire: 'porte_conteneurs',
      longueur_m: 300,
      tirant_eau_m: 14.5,
      jauge_brute: 120000,
      is_active: true,
    });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (navire: Navire) => {
    setEditingNavire(navire);
    setFormData({
      imo: navire.imo,
      nom: navire.nom,
      pavillon: navire.pavillon,
      type_navire: navire.type_navire,
      longueur_m: navire.longueur_m,
      tirant_eau_m: navire.tirant_eau_m,
      jauge_brute: navire.jauge_brute,
      is_active: navire.is_active,
    });
    setFormErrors({});
  };

  const handleSaveNavire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingNavire) {
        showToast(`Navire "${formData.nom}" mis à jour avec succès.`, 'success', 'Navire Modifié');
        setEditingNavire(null);
      } else {
        await maritimeService.createNavire(formData);
        showToast(`Navire "${formData.nom}" (IMO ${formData.imo}) enregistré.`, 'success', 'Navire Enregistré');
        setIsCreateModalOpen(false);
      }
      loadNavires();
    } catch (err) {
      showToast('Erreur lors de l\'enregistrement.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingNavire) return;
    try {
      await maritimeService.deleteNavire(deletingNavire.id);
      showToast(`Le navire "${deletingNavire.nom}" a été supprimé.`, 'success', 'Navire Supprimé');
      setDeletingNavire(null);
      loadNavires();
    } catch {
      showToast('Ce navire est lié à une escale et ne peut pas être supprimé.', 'error');
    }
  };

  const handleValidateANP = async (navire: Navire) => {
    try {
      await maritimeService.validerNavireANP(navire.id);
      showToast(`Le navire ${navire.nom} (IMO ${navire.imo}) est validé par l'ANP.`, 'success', 'Navire validé');
      loadNavires();
    } catch {
      showToast('Impossible de valider ce navire.', 'error');
    }
  };

  const formatVesselType = (type: Navire['type_navire']) => {
    switch (type) {
      case 'porte_conteneurs': return 'Porte-conteneurs';
      case 'petrolier': return 'Pétrolier';
      case 'vraquier': return 'Vraquier';
      case 'gazier': return 'Méthanier / Gazier';
      case 'roulier': return 'Roulier (RoRo)';
      case 'remorqueur': return 'Remorqueur';
      default: return type;
    }
  };

  const totalActifs = navires.filter((n) => n.is_active).length;
  const totalInactifs = navires.filter((n) => !n.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172B4D]">Flotte des navires</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Total : <strong>{navires.length}</strong> • Actifs : <span className="text-[#15803D] font-bold">{totalActifs}</span> • Inactifs : <span className="text-[#64748B] font-bold">{totalInactifs}</span>
          </p>
        </div>

        {can('navires.manage') && <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0B4F8A] hover:bg-[#083B68] text-white font-semibold text-sm rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>Nouveau navire</span>
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
            placeholder="Rechercher par nom de navire ou code IMO (7 chiffres)..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#172B4D] placeholder-[#94A3B8] focus:outline-none focus:border-[#0B4F8A] focus:ring-1 focus:ring-[#0B4F8A]"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs">
            <Filter size={14} className="text-[#0B4F8A]" />
            <span className="text-[#64748B] font-medium">Type :</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-transparent text-[#172B4D] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">Tous les types</option>
              <option value="porte_conteneurs">Porte-conteneurs</option>
              <option value="petrolier">Pétrolier</option>
              <option value="vraquier">Vraquier</option>
              <option value="gazier">Gazier</option>
              <option value="roulier">Roulier</option>
              <option value="remorqueur">Remorqueur</option>
            </select>
          </div>

          <button
            onClick={loadNavires}
            className="p-2 rounded-lg bg-white border border-[#CBD5E1] text-[#64748B] hover:text-[#0B4F8A] hover:border-[#0B4F8A] transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Navires Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#172B4D]">
            <thead className="bg-[#F8FAFC] text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
              <tr>
                <th className="px-5 py-3.5">Numéro IMO</th>
                <th className="px-5 py-3.5">Nom du Navire</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Pavillon</th>
                <th className="px-5 py-3.5">Dimensions & Jauge</th>
                <th className="px-5 py-3.5">Statut</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#64748B]">
                    Chargement des navires...
                  </td>
                </tr>
              ) : navires.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#94A3B8]">
                    Aucun navire trouvé.
                  </td>
                </tr>
              ) : (
                navires.map((nav) => (
                  <tr key={nav.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-[#0B4F8A]">
                      IMO {nav.imo}
                    </td>

                    <td className="px-5 py-3.5 font-bold text-[#172B4D]">
                      <div className="flex items-center gap-2">
                        <Ship size={16} className="text-[#0B4F8A]" />
                        <span>{nav.nom}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-xs text-[#475569]">
                      {formatVesselType(nav.type_navire)}
                    </td>

                    <td className="px-5 py-3.5 text-xs text-[#475569]">
                      <div className="flex items-center gap-1.5">
                        <Flag size={13} className="text-[#94A3B8]" />
                        <span>{nav.pavillon}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-xs font-mono text-[#475569]">
                      <div>L: {nav.longueur_m}m • TE: {nav.tirant_eau_m}m</div>
                      <div>Jauge: {nav.jauge_brute.toLocaleString()} UMS</div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="space-y-1">
                        <Badge type="active" status={nav.is_active} />
                        {nav.validation_anp === 'en_attente' && (
                          <div className="text-[11px] font-semibold text-[#B45309]">Validation ANP en attente</div>
                        )}
                        {nav.validation_anp === 'valide' && (
                          <div className="text-[11px] font-semibold text-[#15803D]">Validé par ANP</div>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      {can('navires.manage') && (
                        <div className="flex items-center justify-end gap-2">
                          {nav.validation_anp === 'en_attente' && can('visites.activate') && (
                            <button
                              onClick={() => handleValidateANP(nav)}
                              className="px-2.5 py-1 rounded-md text-xs font-semibold text-[#15803D] bg-[#DCFCE7] hover:bg-green-200 border border-green-200 transition-colors"
                              title="Valider par l'ANP"
                            >
                              Valider ANP
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(nav)}
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0B4F8A] hover:bg-[#EAF4FB] transition-colors"
                            title="Modifier"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeletingNavire(nav)}
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
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
        isOpen={isCreateModalOpen || !!editingNavire}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingNavire(null);
        }}
        title={editingNavire ? `Modifier le navire : ${editingNavire.nom}` : 'Enregistrer un nouveau navire'}
      >
        <form onSubmit={handleSaveNavire} className="space-y-4">
          <div>
            <label className="form-label">Numéro IMO Unique (7 chiffres) *</label>
            <input
              type="text"
              value={formData.imo}
              onChange={(e) => setFormData({ ...formData, imo: e.target.value.replace(/\D/g, '').slice(0, 7) })}
              placeholder="Ex: 9893890"
              maxLength={7}
              className="form-input font-mono font-bold"
            />
            {formErrors.imo && <p className="mt-1 text-xs text-[#DC2626]">{formErrors.imo}</p>}
          </div>

          <div>
            <label className="form-label">Nom du navire *</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value.toUpperCase() })}
              placeholder="Ex: CMA CGM JACQUES SAADÉ"
              className="form-input font-bold uppercase"
            />
            {formErrors.nom && <p className="mt-1 text-xs text-[#DC2626]">{formErrors.nom}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Pavillon (Pays) *</label>
              <input
                type="text"
                value={formData.pavillon}
                onChange={(e) => setFormData({ ...formData, pavillon: e.target.value })}
                placeholder="Ex: France, Panama, Liberia"
                className="form-input"
              />
              {formErrors.pavillon && <p className="mt-1 text-xs text-[#DC2626]">{formErrors.pavillon}</p>}
            </div>

            <div>
              <label className="form-label">Type de navire *</label>
              <select
                value={formData.type_navire}
                onChange={(e) => setFormData({ ...formData, type_navire: e.target.value as any })}
                className="form-input"
              >
                <option value="porte_conteneurs">Porte-conteneurs</option>
                <option value="petrolier">Pétrolier</option>
                <option value="vraquier">Vraquier</option>
                <option value="gazier">Méthanier / Gazier</option>
                <option value="roulier">Roulier (RoRo)</option>
                <option value="remorqueur">Remorqueur</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Longueur (m)</label>
              <input
                type="number"
                step="0.1"
                value={formData.longueur_m}
                onChange={(e) => setFormData({ ...formData, longueur_m: parseFloat(e.target.value) || 0 })}
                className="form-input font-mono"
              />
            </div>

            <div>
              <label className="form-label">Tirant d'eau (m)</label>
              <input
                type="number"
                step="0.1"
                value={formData.tirant_eau_m}
                onChange={(e) => setFormData({ ...formData, tirant_eau_m: parseFloat(e.target.value) || 0 })}
                className="form-input font-mono"
              />
            </div>

            <div>
              <label className="form-label">Jauge Brute (GT)</label>
              <input
                type="number"
                value={formData.jauge_brute}
                onChange={(e) => setFormData({ ...formData, jauge_brute: parseInt(e.target.value, 10) || 0 })}
                className="form-input font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="navire_active_checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-[#CBD5E1] text-[#0B4F8A] focus:ring-[#0B4F8A] cursor-pointer"
            />
            <label htmlFor="navire_active_checkbox" className="text-sm text-[#334155] cursor-pointer select-none">
              Navire actif et autorisé aux escales
            </label>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false);
                setEditingNavire(null);
              }}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-[#0B4F8A] hover:bg-[#083B68] text-white shadow-sm"
            >
              {editingNavire ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingNavire}
        onClose={() => setDeletingNavire(null)}
        onConfirm={handleConfirmDelete}
        title="Supprimer le navire"
        message={`Voulez-vous supprimer le navire ${deletingNavire?.nom} ? Cette action est définitive.`}
        confirmLabel="Supprimer"
        isDestructive
      />
    </div>
  );
};
