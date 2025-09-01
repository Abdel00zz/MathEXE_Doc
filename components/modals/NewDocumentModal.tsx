
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Document } from '../../types';
import { useDocuments } from '../../hooks/useDocuments';
import { useSettings } from '../../hooks/useSettings';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { Save, X } from 'lucide-react';

interface NewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentToEdit?: Document;
}

const NewDocumentModal: React.FC<NewDocumentModalProps> = ({ isOpen, onClose, documentToEdit }) => {
  const { addDocument, updateDocument } = useDocuments();
  const { t } = useSettings();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [className, setClassName] = useState('');
  const [schoolYear, setSchoolYear] = useState(new Date().getFullYear() + '-' + (new Date().getFullYear() + 1));
  const titleInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!documentToEdit;

  useEffect(() => {
    if (isOpen) {
        if (isEditing && documentToEdit) {
          setTitle(documentToEdit.title);
          setClassName(documentToEdit.className);
          setSchoolYear(documentToEdit.schoolYear);
        } else {
          setTitle('');
          setClassName('');
          setSchoolYear(new Date().getFullYear() + '-' + (new Date().getFullYear() + 1));
          // Auto-focus on the title input for new documents
          setTimeout(() => titleInputRef.current?.focus(), 100);
        }
    }
  }, [documentToEdit, isEditing, isOpen]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && documentToEdit) {
      updateDocument(documentToEdit.id, { title, className, schoolYear });
    } else {
      const newDoc = addDocument({ title, className, schoolYear });
      navigate(`/document/${newDoc.id}`);
    }
    onClose();
  }, [isEditing, documentToEdit, title, className, schoolYear, updateDocument, addDocument, navigate, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? t('modals.newDocument.editTitle') : t('modals.newDocument.createTitle')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          ref={titleInputRef}
          label={t('modals.newDocument.titleLabel')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('modals.newDocument.titlePlaceholder')}
          required
        />
        <Input
          label={t('modals.newDocument.classLabel')}
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder={t('modals.newDocument.classPlaceholder')}
          required
        />
        <Input
          label={t('modals.newDocument.yearLabel')}
          value={schoolYear}
          onChange={(e) => setSchoolYear(e.target.value)}
          placeholder={t('modals.newDocument.yearPlaceholder')}
          required
        />
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            <X size={16} className="mr-2" />
            {t('actions.cancel')}
          </Button>
          <Button type="submit">
            <Save size={16} className="mr-2" />
            {isEditing ? t('modals.newDocument.update') : t('modals.newDocument.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NewDocumentModal;