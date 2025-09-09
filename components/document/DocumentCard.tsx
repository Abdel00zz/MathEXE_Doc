
import React, { useState, useRef } from 'react';
import { Document } from '../../types';
import { useDocuments } from '../../hooks/useDocuments';
import { useSettings } from '../../hooks/useSettings';
import Button from '../ui/Button';
import ConfirmModal from '../modals/ConfirmModal';
import NewDocumentModal from '../modals/NewDocumentModal';
import { Link } from 'react-router-dom';
import Tooltip from '../ui/Tooltip';
import { Book, Calendar, Copy, FileJson2, ListOrdered, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';

interface DocumentCardProps {
  document: Document;
  isRecent?: boolean;
}

const DocumentCardAction: React.FC<{onClick: (e: React.MouseEvent) => void, icon: React.ReactNode, label: string, className?: string}> = ({ onClick, icon, label, className }) => (
    <button onClick={onClick} className={`flex items-center gap-3 w-full text-left px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50/80 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200 ${className}`}>
        <div className="w-5 h-5 flex items-center justify-center">
          {icon}
        </div>
        <span className="font-medium">{label}</span>
    </button>
);


const DocumentCard: React.FC<DocumentCardProps> = ({ document, isRecent = false }) => {
  const { deleteDocument, duplicateDocument } = useDocuments();
  const { t, settings } = useSettings();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isActionsOpen, setActionsOpen] = useState(false);
  
  const actionsRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(actionsRef, () => setActionsOpen(false));


  const handleDelete = () => {
    deleteDocument(document.id);
    setDeleteModalOpen(false);
  };

  const handleExportJson = (e: React.MouseEvent) => {
    e.stopPropagation();
    const jsonString = JSON.stringify(document, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.title.replace(/\s+/g, '_')}.json`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setActionsOpen(false);
  };
  
  const lastModified = document.lastModified ? new Date(document.lastModified) : new Date(document.date);

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setActionsOpen(false);
  };
  
  const highlightClass = isRecent
    ? 'ring-2 ring-blue-400/60 dark:ring-blue-500/50'
    : '';

  return (
    <>
      <li className="relative group">
        <Link to={`/document/${document.id}`} className="block">
          <div className={`relative flex h-full items-start gap-4 rounded-lg bg-white dark:bg-gray-800 px-5 py-4 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-200 group-hover:border-gray-300 dark:group-hover:border-gray-600 ${highlightClass}`}>
            <div className="flex flex-col flex-grow min-w-0">
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate tracking-tight mb-3 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                {document.title}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="inline-flex items-center gap-2">
                  <Book size={14} className="text-blue-600 dark:text-blue-400" />
                  <span className="font-medium">{document.className}</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <Calendar size={14} className="text-green-600 dark:text-green-400" />
                  <span className="font-medium">{document.schoolYear}</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <ListOrdered size={14} className="text-purple-600 dark:text-purple-400" />
                  <span className="font-medium">{(document.exercises || []).length} {t('dashboard.documentCard.exercises')}</span>
                </span>
              </div>
            </div>
            
            <div className="flex flex-col items-end justify-between h-full">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {lastModified.toLocaleDateString(settings.language)}
              </span>
              <div ref={actionsRef} className="relative mt-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-all duration-200" 
                  onClick={(e)=>{e.preventDefault(); setActionsOpen(o=>!o);}}
                >
                  <MoreVertical size={16} className="text-gray-600 dark:text-gray-400" />
                </Button>
                {isActionsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2 space-y-1 z-20">
                    <DocumentCardAction onClick={(e) => handleAction(e, () => setEditModalOpen(true))} icon={<Pencil size={14} />} label={t('actions.edit')} />
                    <DocumentCardAction onClick={(e) => handleAction(e, () => duplicateDocument(document.id))} icon={<Copy size={14} />} label={t('actions.duplicate')} />
                    <DocumentCardAction onClick={handleExportJson} icon={<FileJson2 size={14} />} label={t('actions.exportJson')} />
                    <div className="my-1.5 h-px bg-gray-200 dark:bg-gray-700" />
                    <DocumentCardAction onClick={(e) => handleAction(e, () => setDeleteModalOpen(true))} icon={<Trash2 size={14} />} label={t('actions.delete')} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      </li>

      <NewDocumentModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} documentToEdit={document} />
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`${t('actions.delete')} Document`}
      >
        <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
          {`${t('actions.delete')} "${document.title}"?`}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {t('modals.confirm.text')}
        </p>
      </ConfirmModal>
    </>
  );
};

export default React.memo(DocumentCard);