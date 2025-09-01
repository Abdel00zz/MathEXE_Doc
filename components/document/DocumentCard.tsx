
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
    <button onClick={onClick} className={`flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors ${className}`}>
        {icon}
        <span>{label}</span>
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
    ? 'ring-2 ring-indigo-400/60 dark:ring-indigo-500/50'
    : '';

  return (
    <>
      <li className="relative">
        <Link to={`/document/${document.id}`} className="block">
          <div className={`relative flex h-full items-start gap-4 rounded-lg border border-slate-300/70 dark:border-slate-600/60 bg-white dark:bg-slate-800 px-4 py-3 ${highlightClass}`}>
            <div className="flex flex-col flex-grow min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate tracking-tight">
                {document.title}
              </p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight">
                <span className="inline-flex items-center gap-1"><Book size={11} />{document.className}</span>
                <span className="inline-flex items-center gap-1"><Calendar size={11} />{document.schoolYear}</span>
                <span className="inline-flex items-center gap-1"><ListOrdered size={11} />{(document.exercises || []).length} {t('dashboard.documentCard.exercises')}</span>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between h-full text-[10px] text-slate-500 dark:text-slate-500 font-medium">
              <span>{lastModified.toLocaleDateString(settings.language)}</span>
              <div ref={actionsRef} className="relative mt-2">
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600" onClick={(e)=>{e.preventDefault(); setActionsOpen(o=>!o);}}>
                  <MoreVertical size={16} />
                </Button>
                {isActionsOpen && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-800 rounded-md shadow-md border border-slate-200 dark:border-slate-700 p-1 space-y-0.5 z-20">
                    <DocumentCardAction onClick={(e) => handleAction(e, () => setEditModalOpen(true))} icon={<Pencil size={14} />} label={t('actions.edit')} />
                    <DocumentCardAction onClick={(e) => handleAction(e, () => duplicateDocument(document.id))} icon={<Copy size={14} />} label={t('actions.duplicate')} />
                    <DocumentCardAction onClick={handleExportJson} icon={<FileJson2 size={14} />} label={t('actions.exportJson')} />
                    <div className="my-1 h-px bg-slate-200 dark:bg-slate-700" />
                    <DocumentCardAction onClick={(e) => handleAction(e, () => setDeleteModalOpen(true))} icon={<Trash2 size={14} />} label={t('actions.delete')} className="text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-400" />
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