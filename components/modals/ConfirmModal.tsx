
import React from 'react';
import { useSettings } from '../../hooks/useSettings';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { AlertTriangle, Check, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, children }) => {
    const {t} = useSettings();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <div className="flex items-start gap-4">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-800/20 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>
            <div className="mt-1 text-left flex-grow">
                {children}
            </div>
        </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
            <X size={16} className="mr-2" />
            {t('modals.confirm.cancel')}
        </Button>
        <Button variant="danger" onClick={onConfirm}>
            <Check size={16} className="mr-2" />
            {t('modals.confirm.confirm')}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;