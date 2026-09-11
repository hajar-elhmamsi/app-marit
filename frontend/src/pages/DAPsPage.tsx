import React, { useEffect, useState } from 'react';
import { maritimeService } from '../api/client';
import { DAP, StatutDAP } from '../types';
import { Badge } from '../components/UI/Badge';
import { Modal } from '../components/UI/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  FileCheck2,
  Search,
  Send,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  Check,
  X,
  Layers
} from 'lucide-react';

export const DAPsPage: React.FC = () => {
  const [daps, setDaps] = useState<DAP[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedStatut, setSelectedStatut] = useState<string>('all');
  const [adminDAPDecisions, setAdminDAPDecisions] = useState<Record<number, string>>({});

  // Modals
  const [detailDAP, setDetailDAP] = useState<DAP | null>(null);
  const [sendingDAP, setSendingDAP] = useState<DAP | null>(null);
  const [sendRemarks, setSendRemarks] = useState<string>('');

  const [refusingDAP, setRefusingDAP] = useState<DAP | null>(null);
  const [refusalMotif, setRefusalMotif] = useState<string>('');

  const { showToast } = useToast();
  const { can } = useAuth();

  const loadDAPs = async () => {
    setLoading(true);
    try {
      const statutParam = selectedStatut === 'all' ? '' : selectedStatut;
      const data = await maritimeService.getDAPs(statutParam, search);
      setDaps(data);
      try {
        setAdminDAPDecisions(JSON.parse(localStorage.getItem('admin_dap_decisions') || '{}'));
      } catch {}
    } catch (err) {
      showToast('Impossible de charger les demandes DAP', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDAPs();
  }, [selectedStatut]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadDAPs();
  };

  const handleOpenSend = (dap: DAP) => {
    setSendingDAP(dap);
    setSendRemarks(dap.remarques || '');
  };

  const handleConfirmSend = async () => {
    if (!sendingDAP) return;
    try {
      await maritimeService.envoyerDAP(sendingDAP.id, sendRemarks);
      showToast(`DAP ${sendingDAP.numero_dap} transmis à la Capitainerie.`, 'success', 'DAP Transmis');
      setSendingDAP(null);
      loadDAPs();
    } catch (err) {
      showToast('Erreur lors de l\'envoi du DAP.', 'error');
    }
  };

  const handleAccepter = async (dap: DAP) => {
    try {
      await maritimeService.accepterDAP(dap.id);
      showToast(`DAP ${dap.numero_dap} validé et accepté.`, 'success', 'Accès Autorisé');
      loadDAPs();
    } catch (err) {
      showToast('Erreur lors de la validation du DAP.', 'error');
    }
  };

  const handleOpenRefuse = (dap: DAP) => {
    setRefusingDAP(dap);
    setRefusalMotif('');
  };

  const handleConfirmRefuse = async () => {
    if (!refusingDAP) return;
    if (!refusalMotif.trim()) {
      showToast('Veuillez renseigner le motif officiel du refus.', 'warning');
      return;
    }
    try {
      await maritimeService.refuserDAP(refusingDAP.id, refusalMotif);
      showToast(`DAP ${refusingDAP.numero_dap} refusé.`, 'error', 'Accès Refusé');
      setRefusingDAP(null);
      loadDAPs();
    } catch (err) {
      showToast('Erreur lors du refus du DAP.', 'error');
    }
  };

  const counts = {
    all: daps.length,
    brouillon: daps.filter((d) => d.statut === 'brouillon').length,
    envoye: daps.filter((d) => d.statut === 'envoye').length,
    accepte: daps.filter((d) => d.statut === 'accepte').length,
    refuse: daps.filter((d) => d.statut === 'refuse').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172B4D]">Accès portuaire (DAP)</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Instruction administrative des demandes d'accès et autorisations d'accostage
          </p>
        </div>
      </div>

      {/* Synthetic Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { id: 'all', label: 'Toutes les DAP', count: counts.all },
          { id: 'brouillon', label: 'Brouillons (Agent)', count: counts.brouillon },
          { id: 'envoye', label: 'En attente capitainerie', count: counts.envoye },
          { id: 'accepte', label: 'Acceptées (Validées)', count: counts.accepte },
          { id: 'refuse', label: 'Refusées', count: counts.refuse },
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
            placeholder="Rechercher par n° DAP (DAP-...), navire..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#172B4D] placeholder-[#94A3B8] focus:outline-none focus:border-[#0B4F8A] focus:ring-1 focus:ring-[#0B4F8A]"
          />
        </form>

        <button
          onClick={loadDAPs}
          className="p-2 rounded-lg bg-white border border-[#CBD5E1] text-[#64748B] hover:text-[#0B4F8A] hover:border-[#0B4F8A] transition-colors self-end md:self-auto"
          title="Rafraîchir"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* DAPs Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#172B4D]">
            <thead className="bg-[#F8FAFC] text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
              <tr>
                <th className="px-5 py-3.5">N° DAP</th>
                <th className="px-5 py-3.5">Escale & Navire</th>
                <th className="px-5 py-3.5">Terminal Demandé</th>
                <th className="px-5 py-3.5">Date Demande</th>
                <th className="px-5 py-3.5">Statut</th>
                <th className="px-5 py-3.5">Remarques / Motif</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#64748B]">
                    Chargement des demandes d'accès portuaire...
                  </td>
                </tr>
              ) : daps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#94A3B8]">
                    Aucune demande d'accès portuaire trouvée.
                  </td>
                </tr>
              ) : (
                daps.map((dap) => (
                  <tr key={dap.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-3.5 font-bold text-[#0B4F8A]">
                      {dap.numero_dap}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-bold text-[#172B4D]">
                        {dap.visite_maritime?.navire?.nom || 'Navire'}
                      </div>
                      <div className="text-xs text-[#0B4F8A]">
                        {dap.visite_maritime?.numero_visite || `Escale #${dap.visite_maritime_id}`}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-xs">
                      <div className="font-semibold text-[#172B4D]">
                        {dap.visite_maritime?.terminal?.nom || 'Terminal à quai'}
                      </div>
                      <div className="text-[#64748B]">
                        {dap.visite_maritime?.terminal?.port?.nom}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-xs text-[#475569] font-mono">
                      {dap.date_demande}
                    </td>

                    <td className="px-5 py-3.5">
                      <Badge type="dap" status={dap.statut} />
                      {adminDAPDecisions[dap.id] && (
                        <span className={`mt-1 block text-[11px] font-semibold ${adminDAPDecisions[dap.id] === 'accepte' ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>
                          Marsa Maroc : {adminDAPDecisions[dap.id] === 'accepte' ? 'Accepté' : 'Refusé'}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-xs max-w-[220px]">
                      {dap.statut === 'refuse' && dap.motif_refus ? (
                        <span className="text-[#DC2626] font-medium truncate block" title={dap.motif_refus}>
                          Motif: {dap.motif_refus}
                        </span>
                      ) : dap.remarques ? (
                        <span className="text-[#64748B] truncate block" title={dap.remarques}>
                          {dap.remarques}
                        </span>
                      ) : (
                        <span className="text-[#94A3B8] italic">-</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setDetailDAP(dap)}
                          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0B4F8A] hover:bg-[#EAF4FB] transition-colors"
                          title="Consulter"
                        >
                          <Eye size={16} />
                        </button>

                        {/* Transition: Brouillon -> Envoyer */}
                        {dap.statut === 'brouillon' && can('dap.send') && (
                          <button
                            onClick={() => handleOpenSend(dap)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#EAF4FB] text-[#0B4F8A] hover:bg-blue-100 border border-blue-200 flex items-center gap-1 transition-colors"
                            title="Transmettre à la Capitainerie"
                          >
                            <Send size={13} />
                            <span>Soumettre l'escale</span>
                          </button>
                        )}

                        {/* Transition: Envoyé -> Valider / Refuser */}
                        {dap.statut === 'envoye' && (
                          <>
                            {can('dap.validate') && (
                              <button
                                onClick={() => handleAccepter(dap)}
                                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#DCFCE7] text-[#15803D] hover:bg-green-200 border border-green-200 flex items-center gap-1 transition-colors"
                                title="Valider l'accès"
                              >
                                <Check size={14} />
                                <span>Valider</span>
                              </button>
                            )}

                            {can('dap.refuse') && (
                              <button
                                onClick={() => handleOpenRefuse(dap)}
                                className="px-2 py-1 text-xs font-semibold rounded-md bg-[#FEE2E2] text-[#DC2626] hover:bg-red-200 border border-red-200 flex items-center gap-1 transition-colors"
                                title="Refuser"
                              >
                                <X size={14} />
                                <span>Refuser</span>
                              </button>
                            )}
                          </>
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

      {/* Modal Envoi DAP */}
      <Modal
        isOpen={!!sendingDAP}
        onClose={() => setSendingDAP(null)}
        title={`Transmettre le DAP : ${sendingDAP?.numero_dap}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-[#EAF4FB] text-[#0B4F8A] border border-blue-200 text-xs">
            La demande d'accès portuaire sera transmise à l'Officier de Capitainerie pour instruction technique et validation du quai.
          </div>

          <div>
            <label className="form-label">Remarques opérationnelles pour la Capitainerie</label>
            <textarea
              rows={3}
              value={sendRemarks}
              onChange={(e) => setSendRemarks(e.target.value)}
              placeholder="Ex: Demande de branchement électrique à quai, manutention conteneurs dangereux..."
              className="form-input"
            />
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setSendingDAP(null)}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirmSend}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-[#0B4F8A] hover:bg-[#083B68] text-white shadow-sm"
            >
              Transmettre la demande
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Refus DAP */}
      <Modal
        isOpen={!!refusingDAP}
        onClose={() => setRefusingDAP(null)}
        title={`Refuser le DAP : ${refusingDAP?.numero_dap}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-[#FEE2E2] text-[#B91C1C] border border-red-200 text-xs">
            Un motif officiel de refus est requis par la capitainerie pour notifier l'agent maritime.
          </div>

          <div>
            <label className="form-label">Motif officiel du refus *</label>
            <textarea
              rows={3}
              value={refusalMotif}
              onChange={(e) => setRefusalMotif(e.target.value)}
              placeholder="Ex: Quai indisponible, tirant d'eau incompatible avec la marée..."
              className="form-input"
            />
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setRefusingDAP(null)}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirmRefuse}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-sm"
            >
              Confirmer le refus
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Détails DAP */}
      {detailDAP && (
        <Modal
          isOpen={true}
          onClose={() => setDetailDAP(null)}
          title={`Fiche d'instruction DAP : ${detailDAP.numero_dap}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <div>
                <span className="text-xs text-[#64748B]">Statut DAP</span>
                <div className="mt-1">
                  <Badge type="dap" status={detailDAP.statut} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#64748B]">Date de demande</span>
                <div className="text-xs font-mono text-[#172B4D] font-bold mt-1">{detailDAP.date_demande}</div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5 text-xs">
              <div><span className="text-[#64748B]">Escale associée :</span> <strong className="text-[#172B4D]">{detailDAP.visite_maritime?.numero_visite}</strong></div>
              <div><span className="text-[#64748B]">Navire :</span> <strong className="text-[#172B4D]">{detailDAP.visite_maritime?.navire?.nom}</strong></div>
              <div><span className="text-[#64748B]">Terminal :</span> <strong className="text-[#172B4D]">{detailDAP.visite_maritime?.terminal?.nom}</strong></div>
              {detailDAP.date_traitement && (
                <div><span className="text-[#64748B]">Date d'instruction :</span> <strong className="text-[#0B4F8A]">{detailDAP.date_traitement}</strong></div>
              )}
            </div>

            {detailDAP.remarques && (
              <div className="p-3.5 rounded-lg bg-white border border-[#E2E8F0]">
                <div className="text-xs text-[#64748B] mb-1 font-semibold">Remarques de l'agent :</div>
                <div className="text-xs text-[#172B4D]">{detailDAP.remarques}</div>
              </div>
            )}

            {detailDAP.motif_refus && (
              <div className="p-3.5 rounded-lg bg-[#FEE2E2] border border-red-200">
                <div className="text-xs font-bold text-[#B91C1C] mb-1">Motif du refus :</div>
                <div className="text-xs text-[#B91C1C]">{detailDAP.motif_refus}</div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailDAP(null)}
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
