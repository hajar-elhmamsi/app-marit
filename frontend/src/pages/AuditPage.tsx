import React, { useEffect, useState } from 'react';
import { maritimeService } from '../api/client';
import { AuditLog } from '../types';
import { Modal } from '../components/UI/Modal';
import { useToast } from '../context/ToastContext';
import {
  History,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Globe,
  Tag,
  Code2
} from 'lucide-react';

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [inspectLog, setInspectLog] = useState<AuditLog | null>(null);

  const { showToast } = useToast();

  const loadLogs = async () => {
    setLoading(true);
    try {
      const actParam = selectedAction === 'all' ? '' : selectedAction;
      const entParam = selectedEntity === 'all' ? '' : selectedEntity;
      const data = await maritimeService.getAuditLogs(actParam, entParam);
      setLogs(data);
    } catch (err) {
      showToast('Impossible de charger le journal d\'audit', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [selectedAction, selectedEntity]);

  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'CREATE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#15803D] border border-green-200">
            CREATE
          </span>
        );
      case 'UPDATE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF4FB] text-[#0B4F8A] border border-blue-200">
            UPDATE
          </span>
        );
      case 'STATUS_CHANGE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#B45309] border border-amber-200">
            STATUS_CHANGE
          </span>
        );
      case 'CANCEL':
      case 'DELETE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#B91C1C] border border-red-200">
            {action}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#475569] border border-slate-200">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172B4D]">Journal d'audit</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Traçabilité et historique des opérations maritimes • <strong>{logs.length}</strong> événements enregistrés
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Action Filter */}
          <div className="flex items-center gap-2 bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs">
            <Tag size={14} className="text-[#0B4F8A]" />
            <span className="text-[#64748B] font-medium">Action :</span>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="bg-transparent text-[#172B4D] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">Toutes les actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="STATUS_CHANGE">STATUS_CHANGE</option>
              <option value="CANCEL">CANCEL</option>
              <option value="DEACTIVATE">DEACTIVATE</option>
            </select>
          </div>

          {/* Entity Filter */}
          <div className="flex items-center gap-2 bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs">
            <Filter size={14} className="text-[#0B4F8A]" />
            <span className="text-[#64748B] font-medium">Entité :</span>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="bg-transparent text-[#172B4D] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">Toutes les entités</option>
              <option value="VisiteMaritime">VisiteMaritime</option>
              <option value="DAP">DAP</option>
              <option value="Port">Port</option>
              <option value="Terminal">Terminal</option>
              <option value="Navire">Navire</option>
            </select>
          </div>
        </div>

        <button
          onClick={loadLogs}
          className="p-2 rounded-lg bg-white border border-[#CBD5E1] text-[#64748B] hover:text-[#0B4F8A] hover:border-[#0B4F8A] transition-colors"
          title="Rafraîchir"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#172B4D]">
            <thead className="bg-[#F8FAFC] text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
              <tr>
                <th className="px-5 py-3.5">Horodatage (UTC)</th>
                <th className="px-5 py-3.5">Auteur / Rôle</th>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Entité Cible</th>
                <th className="px-5 py-3.5">Adresse IP</th>
                <th className="px-5 py-3.5 text-right">Détails JSON</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#64748B]">
                    Chargement du journal d'audit...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#94A3B8]">
                    Aucun événement d'audit trouvé.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-3.5 text-xs text-[#475569] font-mono">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-[#94A3B8]" />
                        <span>{log.created_at}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#EAF4FB] text-[#0B4F8A] flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {log.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#172B4D]">{log.user?.name || 'Système'}</div>
                          <div className="text-[10px] text-[#64748B] capitalize">
                            {log.user?.role?.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      {getActionBadge(log.action)}
                    </td>

                    <td className="px-5 py-3.5 text-xs">
                      <span className="font-semibold text-[#172B4D] bg-[#F1F5F9] px-2 py-0.5 rounded border border-slate-200">
                        {log.entite_type}
                      </span>
                      {log.entite_id && (
                        <span className="ml-1.5 text-[#64748B]">#{log.entite_id}</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-xs font-mono text-[#64748B]">
                      <div className="flex items-center gap-1.5">
                        <Globe size={13} className="text-[#94A3B8]" />
                        <span>{log.ip_address || '127.0.0.1'}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setInspectLog(log)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#F1F5F9] text-[#0B4F8A] hover:bg-[#EAF4FB] border border-slate-200 transition-colors inline-flex items-center gap-1.5"
                      >
                        <Code2 size={13} />
                        <span>Détails</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Inspection Payload JSON */}
      {inspectLog && (
        <Modal
          isOpen={true}
          onClose={() => setInspectLog(null)}
          title={`Journal d'audit #${inspectLog.id} • ${inspectLog.entite_type}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <div><span className="text-[#64748B]">Action :</span> <strong className="text-[#172B4D]">{inspectLog.action}</strong></div>
              <div><span className="text-[#64748B]">Horodatage :</span> <strong className="text-[#0B4F8A]">{inspectLog.created_at}</strong></div>
              <div><span className="text-[#64748B]">Auteur :</span> <strong className="text-[#172B4D]">{inspectLog.user?.name}</strong></div>
              <div><span className="text-[#64748B]">IP source :</span> <strong className="text-[#475569]">{inspectLog.ip_address}</strong></div>
            </div>

            <div>
              <div className="text-xs font-semibold text-[#64748B] mb-1.5 uppercase">Données JSON enregistrées :</div>
              <pre className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono text-[#0B4F8A] overflow-x-auto max-h-72 leading-relaxed">
                {JSON.stringify(inspectLog.details || {}, null, 2)}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectLog(null)}
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
