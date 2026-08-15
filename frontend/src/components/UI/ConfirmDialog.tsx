import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  isDestructive = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-lg flex-shrink-0 ${
            isDestructive
              ? 'bg-[#FEE2E2] text-[#DC2626] border border-red-200'
              : 'bg-[#FEF3C7] text-[#B45309] border border-amber-200'
          }`}
        >
          <AlertTriangle size={22} />
        </div>
        <div>
          <p className="text-sm text-[#334155] leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#F1F5F9]">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC] transition-colors"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors ${
            isDestructive
              ? 'bg-[#DC2626] hover:bg-[#B91C1C]'
              : 'bg-[#0B4F8A] hover:bg-[#083B68]'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
};
