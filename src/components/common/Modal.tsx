import React from 'react';
import { Button } from './Button';
import { t } from '../../utils/i18n';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText,
  cancelText,
  danger = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
          <h2 id="modal-title" className="text-3xl font-bold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-3xl font-bold text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-4 focus:ring-senior-accent"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="mb-8">{children}</div>

        <div className="flex gap-4 justify-end">
          <Button variant="secondary" size="md" onClick={onClose}>
            {cancelText || t('common.cancel')}
          </Button>
          {onConfirm && (
            <Button
              variant={danger ? 'danger' : 'primary'}
              size="md"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText || t('common.confirm')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
