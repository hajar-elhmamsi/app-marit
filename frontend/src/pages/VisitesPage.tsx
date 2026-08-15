import React, { useEffect, useState } from 'react';
import { maritimeService } from '../api/client';
import { VisiteMaritime, Navire, Terminal } from '../types';
import { Badge } from '../components/UI/Badge';
import { Modal } from '../components/UI/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Plus,
  Search,
  PlayCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye
} from 'lucide-react';

export const VisitesPage: React.FC = () => {
  const [visites, setVisites] = useState<VisiteMaritime[]>([]);
  const [navires, setNavires] = useState<Navire[]>([]);
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedStatut, setSelectedStatut] = useState<string>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [detailVisite, setDetailVisite] = useState<VisiteMaritime | null>(null);

  // Workflow modals
  const [activatingVisite, setActivatingVisite] = useState<VisiteMaritime | null>(null);
  const [realArrivalDate, setRealArrivalDate] = useState<string>('');

  const [closingVisite, setClosingVisite] = useState<VisiteMaritime | null>(null);
  const [realDepartureDate, setRealDepartureDate] = useState<string>('');

  const [cancellingVisite, setCancellingVisite] = useState<VisiteMaritime | null>(null);
  const [cancelMotif, setCancelMotif] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    navire_id: 0,
    terminal_id: 0,
    date_arrivee_estimee: '',
    date_depart_estimee: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { showToast } = useToast();
  const { can } = useAuth();

  const loadData = async () => {
    setLoading(true);
    try {
      const statutParam = selectedStatut === 'all' ? '' : selectedStatut;
      const [visList, navList, termList] = await Promise.all([
        maritimeService.getVisites(statutParam, search),
        maritimeService.getNavires(),
        maritimeService.getTerminals(),
      ]);
      setVisites(visList);
      setNavires(navList.filter((n) => n.is_active));
      setTerminals(termList.filter((t) => t.is_active));
    } catch (err) {
      showToast('Impossible de charger les visites maritimes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStatut]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenCreate = () => {
    const now = new Date();
    const eta = new Date(now.getTime() + 24 * 3600 * 1000).toISOString().slice(0, 16);
    const etd = new Date(now.getTime() + 72 * 3600 * 1000).toISOString().slice(0, 16);

    setFormData({
      navire_id: navires[0]?.id || 1,
      terminal_id: terminals[0]?.id || 1,
      date_arrivee_estimee: eta,
      date_depart_estimee: etd,
    });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.navire_id) errors.navire_id = 'Veuillez sélectionner un navire.';
    if (!formData.terminal_id) errors.terminal_id = 'Veuillez sélectionner un terminal.';
    if (!formData.date_arrivee_estimee) errors.date_arrivee_estimee = 'L\'ETA est obligatoire.';
    if (!formData.date_depart_estimee) errors.date_depart_estimee = 'L\'ETD est obligatoire.';

    if (formData.date_arrivee_estimee && formData.date_depart_estimee) {
      if (new Date(formData.date_depart_estimee) <= new Date(formData.date_arrivee_estimee)) {
        errors.date_depart_estimee = 'La date de départ doit être postérieure à l\'arrivée.';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateVisite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const created = await maritimeService.createVisite(formData);
      showToast(`Escale ${created.numero_visite} planifiée avec succès. DAP automatique créé.`, 'success', 'Escale Enregistrée');
      setIsCreateModalOpen(false);
      loadData();
    } catch (err) {
      showToast('Erreur lors de la planification de l\'escale.', 'error');
    }
  };

  const handleOpenActiver = (visite: VisiteMaritime) => {
    setActivatingVisite(visite);
    setRealArrivalDate(new Date().toISOString().slice(0, 16));
  };

  const handleConfirmActiver = async () => {
    if (!activatingVisite) return;
    try {
      await maritimeService.activerVisite(activatingVisite.id, realArrivalDate);
      showToast(`L'escale ${activatingVisite.numero_visite} est ACTIVE (Navire à quai).`, 'success', 'Accostage Validé');
      setActivatingVisite(null);
      loadData();
    } catch (err) {
      showToast('Erreur lors de l\'activation de l\'escale.', 'error');
    }
  };

  const handleOpenCloturer = (visite: VisiteMaritime) => {
    setClosingVisite(visite);
    setRealDepartureDate(new Date().toISOString().slice(0, 16));
  };

  const handleConfirmCloturer = async () => {
    if (!closingVisite) return;
    try {
      await maritimeService.cloturerVisite(closingVisite.id, realDepartureDate);
      showToast(`L'escale ${closingVisite.numero_visite} est CLÔTURÉE (Navire appareillé).`, 'info', 'Escale Clôturée');
      setClosingVisite(null);
      loadData();
    } catch (err) {
      showToast('Erreur lors de la clôture de l\'escale.', 'error');
    }
  };

  const handleOpenAnnuler = (visite: VisiteMaritime) => {
    setCancellingVisite(visite);
    setCancelMotif('');
  };

  const handleConfirmAnnuler = async () => {
    if (!cancellingVisite) return;
    if (!cancelMotif.trim()) {
      showToast('Veuillez renseigner un motif d\'annulation.', 'warning');
      return;
    }
    try {
      await maritimeService.annulerVisite(cancellingVisite.id, cancelMotif);
      showToast(`L'escale ${cancellingVisite.numero_visite} a été ANNULÉE.`, 'warning', 'Escale Annulée');
      setCancellingVisite(null);
      loadData();
    } catch (err) {
      showToast('Erreur lors de l\'annulation.', 'error');
    }
  };

  const counts = {
    all: visites.length,
    active: visites.filter((v) => v.statut === 'active').length,
    prevue: visites.filter((v) => v.statut === 'prevue').length,
    cloturee: visites.filter((v) => v.statut === 'cloturee').length,
    annulee: visites.filter((v) => v.statut === 'annulee').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172B4D]">Visites maritimes</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Gestion et supervision des escales et mouvements portuaires
          </p>
        </div>

        {can('visites.create') && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0B4F8A] hover:bg-[#083B68] text-white font-semibold text-sm rounded-lg shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus size={18} />
            <span>Planifier une escale</span>
          </button>
        )}
      </div>

      {/* Synthetic Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { id: 'all', label: 'Toutes les escales', count: counts.all },
          { id: 'active', label: 'Actives (À quai)', count: counts.active },
          { id: 'prevue', label: 'Prévues', count: counts.prevue },
          { id: 'cloturee', label: 'Clôturées', count: counts.cloturee },
          { id: 'annulee', label: 'Annulées', count: counts.annulee },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatut(tab.id)}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              selectedStatut === tab.id
                ? 'bg-[#EAF4FB] border-[#0B4F8A] shadow-sm'
                : 'bg-white hover:bg-[#F8FAFC] border-[#E2E8F0]'
            }`}
          >
            <div className="text-xs font-semibold text-[#64748B]">{tab.label}</div>
            <div className="text-2xl font-bold text-[#123B63] mt-1">{tab.count}</div>
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par n° escale (ESC-...), navire..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#172B4D] placeholder-[#94A3B8] focus:outline-none focus:border-[#0B4F8A] focus:ring-1 focus:ring-[#0B4F8A]"
          />
        </form>

        <button
          onClick={loadData}
          className="p-2 rounded-lg bg-white border border-[#CBD5E1] text-[#64748B] hover:text-[#0B4F8A] hover:border-[#0B4F8A] transition-colors self-end md:self-auto"
          title="Rafraîchir"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Escales Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#172B4D]">
            <thead className="bg-[#F8FAFC] text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
              <tr>
                <th className="px-5 py-3.5">N° Escale</th>
                <th className="px-5 py-3.5">Navire</th>
                <th className="px-5 py-3.5">Terminal & Port</th>
                <th className="px-5 py-3.5">Planning (ETA / ATA)</th>
                <th className="px-5 py-3.5">Statut</th>
                <th className="px-5 py-3.5">DAP</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#64748B]">
                    Chargement des visites maritimes...
                  </td>
                </tr>
              ) : visites.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#94A3B8]">
                    Aucune visite maritime trouvée.
                  </td>
                </tr>
              ) : (
                visites.map((visite) => (
                  <tr key={visite.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-3.5 font-bold text-[#0B4F8A]">
                      {visite.numero_visite}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-bold text-[#172B4D]">{visite.navire?.nom}</div>
                      <div className="text-xs text-[#64748B]">IMO {visite.navire?.imo}</div>
                    </td>

                    <td className="px-5 py-3.5 text-xs">
                      <div className="font-semibold text-[#172B4D]">{visite.terminal?.nom}</div>
                      <div className="text-[#64748B]">{visite.terminal?.port?.nom}</div>
                    </td>

                    <td className="px-5 py-3.5 text-xs font-mono">
                      <div><span className="text-[#64748B]">ETA:</span> {visite.date_arrivee_estimee}</div>
                      {visite.date_arrivee_reelle && (
                        <div className="text-[#15803D] font-bold">
                          <span>ATA:</span> {visite.date_arrivee_reelle}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <Badge type="visite" status={visite.statut} />
                      {visite.statut === 'annulee' && visite.motif_annulation && (
                        <div className="text-xs text-[#DC2626] mt-0.5 max-w-[160px] truncate" title={visite.motif_annulation}>
                          Motif: {visite.motif_annulation}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      {visite.dap ? (
                        <Link to="/daps" className="inline-flex flex-col">
                          <span className="text-xs font-semibold text-[#0B4F8A] hover:underline">
                            {visite.dap.numero_dap}
                          </span>
                          <Badge type="dap" status={visite.dap.statut} className="mt-1" />
                        </Link>
                      ) : (
                        <span className="text-xs text-[#94A3B8] italic">-</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setDetailVisite(visite)}
                          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0B4F8A] hover:bg-[#EAF4FB] transition-colors"
                          title="Détails"
                        >
                          <Eye size={16} />
                        </button>

                        {/* Transition: Prévue -> Activer */}
                        {visite.statut === 'prevue' && (
                          <>
                            {can('visites.activate') && (
                              <button
                                onClick={() => handleOpenActiver(visite)}
                                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#DCFCE7] text-[#15803D] hover:bg-green-200 border border-green-200 flex items-center gap-1 transition-colors"
                                title="Activer (Accostage)"
                              >
                                <PlayCircle size={14} />
                                <span>Activer</span>
                              </button>
                            )}

                            {can('visites.cancel') && (
                              <button
                                onClick={() => handleOpenAnnuler(visite)}
                                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
                                title="Annuler"
                              >
                                <XCircle size={16} />
                              </button>
                            )}
                          </>
                        )}

                        {/* Transition: Active -> Clôturer */}
                        {visite.statut === 'active' && can('visites.close') && (
                          <button
                            onClick={() => handleOpenCloturer(visite)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#EAF4FB] text-[#0B4F8A] hover:bg-blue-100 border border-blue-200 flex items-center gap-1 transition-colors"
                            title="Clôturer (Appareillage)"
                          >
                            <CheckCircle size={14} />
                            <span>Clôturer</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Création Escale */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Planifier une visite maritime"
      >
        <form onSubmit={handleCreateVisite} className="space-y-4">
          <div>
            <label className="form-label">Navire *</label>
            <select
              value={formData.navire_id}
              onChange={(e) => setFormData({ ...formData, navire_id: Number(e.target.value) })}
              className="form-input"
            >
              {navires.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.nom} (IMO {n.imo} - {n.pavillon})
                </option>
              ))}
            </select>
            {formErrors.navire_id && <p className="mt-1 text-xs text-[#DC2626]">{formErrors.navire_id}</p>}
          </div>

          <div>
            <label className="form-label">Terminal d'accostage & Port *</label>
            <select
              value={formData.terminal_id}
              onChange={(e) => setFormData({ ...formData, terminal_id: Number(e.target.value) })}
              className="form-input"
            >
              {terminals.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nom} ({t.port?.nom} - {t.type_terminal})
                </option>
              ))}
            </select>
            {formErrors.terminal_id && <p className="mt-1 text-xs text-[#DC2626]">{formErrors.terminal_id}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Date & Heure d'Arrivée (ETA) *</label>
              <input
                type="datetime-local"
                value={formData.date_arrivee_estimee}
                onChange={(e) => setFormData({ ...formData, date_arrivee_estimee: e.target.value })}
                className="form-input font-mono"
              />
              {formErrors.date_arrivee_estimee && <p className="mt-1 text-xs text-[#DC2626]">{formErrors.date_arrivee_estimee}</p>}
            </div>

            <div>
              <label className="form-label">Date & Heure de Départ (ETD) *</label>
              <input
                type="datetime-local"
                value={formData.date_depart_estimee}
                onChange={(e) => setFormData({ ...formData, date_depart_estimee: e.target.value })}
                className="form-input font-mono"
              />
              {formErrors.date_depart_estimee && <p className="mt-1 text-xs text-[#DC2626]">{formErrors.date_depart_estimee}</p>}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#EAF4FB] text-[#0B4F8A] border border-blue-200 text-xs">
            ℹ️ La création de l'escale générera automatiquement une <strong>Demande d'Accès Portuaire (DAP)</strong> au statut <em>Brouillon</em>.
          </div>

          <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-[#0B4F8A] hover:bg-[#083B68] text-white shadow-sm"
            >
              Enregistrer l'escale
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Activation Escale */}
      <Modal
        isOpen={!!activatingVisite}
        onClose={() => setActivatingVisite(null)}
        title={`Activer l'escale : ${activatingVisite?.numero_visite}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-[#DCFCE7] text-[#15803D] border border-green-200 text-xs">
            Le navire <strong>{activatingVisite?.navire?.nom}</strong> est à quai. Confirmez la date et l'heure réelle d'arrivée (ATA).
          </div>

          <div>
            <label className="form-label">Date & Heure Réelle d'Arrivée (ATA) *</label>
            <input
              type="datetime-local"
              value={realArrivalDate}
              onChange={(e) => setRealArrivalDate(e.target.value)}
              className="form-input font-mono"
            />
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActivatingVisite(null)}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirmActiver}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white shadow-sm"
            >
              Confirmer l'accostage
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Clôture Escale */}
      <Modal
        isOpen={!!closingVisite}
        onClose={() => setClosingVisite(null)}
        title={`Clôturer l'escale : ${closingVisite?.numero_visite}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-[#EAF4FB] text-[#0B4F8A] border border-blue-200 text-xs">
            Le navire <strong>{closingVisite?.navire?.nom}</strong> appareille. Confirmez la date et l'heure réelle de départ (ATD).
          </div>

          <div>
            <label className="form-label">Date & Heure Réelle de Départ (ATD) *</label>
            <input
              type="datetime-local"
              value={realDepartureDate}
              onChange={(e) => setRealDepartureDate(e.target.value)}
              className="form-input font-mono"
            />
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setClosingVisite(null)}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirmCloturer}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-[#0B4F8A] hover:bg-[#083B68] text-white shadow-sm"
            >
              Confirmer le départ
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Annulation Escale */}
      <Modal
        isOpen={!!cancellingVisite}
        onClose={() => setCancellingVisite(null)}
        title={`Annuler l'escale : ${cancellingVisite?.numero_visite}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-[#FEE2E2] text-[#B91C1C] border border-red-200 text-xs">
            Un motif officiel est requis pour annuler l'escale maritime.
          </div>

          <div>
            <label className="form-label">Motif de l'annulation *</label>
            <textarea
              rows={3}
              value={cancelMotif}
              onChange={(e) => setCancelMotif(e.target.value)}
              placeholder="Ex: Avarie machine, déroutement météo..."
              className="form-input"
            />
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setCancellingVisite(null)}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirmAnnuler}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-sm"
            >
              Confirmer l'annulation
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Détails Escale */}
      {detailVisite && (
        <Modal
          isOpen={true}
          onClose={() => setDetailVisite(null)}
          title={`Détails de l'escale : ${detailVisite.numero_visite}`}
          maxWidth="lg"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <div>
                <span className="text-xs text-[#64748B]">Statut actuel</span>
                <div className="mt-1">
                  <Badge type="visite" status={detailVisite.statut} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#64748B]">Agent assigné</span>
                <div className="text-sm font-bold text-[#172B4D] mt-0.5">{detailVisite.agent?.name || 'Agent Maritime'}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5 text-xs">
                <div className="font-bold text-[#0B4F8A] uppercase">Navire</div>
                <div className="text-base font-bold text-[#172B4D]">{detailVisite.navire?.nom}</div>
                <div className="text-[#64748B]">IMO : {detailVisite.navire?.imo}</div>
                <div className="text-[#64748B]">Pavillon : {detailVisite.navire?.pavillon}</div>
              </div>

              <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5 text-xs">
                <div className="font-bold text-[#0B4F8A] uppercase">Terminal</div>
                <div className="text-base font-bold text-[#172B4D]">{detailVisite.terminal?.nom}</div>
                <div className="text-[#64748B]">Port : {detailVisite.terminal?.port?.nom}</div>
                <div className="text-[#64748B]">Type : {detailVisite.terminal?.type_terminal}</div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
              <div className="font-bold text-[#0B4F8A] uppercase mb-2">Horaires d'escale</div>
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-[#64748B]">ETA :</span> <strong className="text-[#172B4D]">{detailVisite.date_arrivee_estimee}</strong></div>
                <div><span className="text-[#64748B]">ETD :</span> <strong className="text-[#172B4D]">{detailVisite.date_depart_estimee}</strong></div>
                <div><span className="text-[#64748B]">ATA (Réel) :</span> <strong className="text-[#15803D]">{detailVisite.date_arrivee_reelle || 'Non accosté'}</strong></div>
                <div><span className="text-[#64748B]">ATD (Réel) :</span> <strong className="text-[#0B4F8A]">{detailVisite.date_depart_reelle || 'Non appareillé'}</strong></div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailVisite(null)}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]"
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
