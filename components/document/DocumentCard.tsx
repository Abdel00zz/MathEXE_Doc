
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
    ? 'bg-indigo-50 dark:bg-slate-800 border-indigo-500/50' 
    : 'bg-white dark:bg-slate-800/50 border-transparent';

  return (
    <>
      <li className={`relative group transition-all duration-300 ease-in-out`}>
        <Link to={`/document/${document.id}`} className="block p-1">
          <div className={`relative flex flex-col h-full p-4 rounded-xl border transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg hover:-translate-y-1 dark:shadow-slate-900/50 ${highlightClass}`}>
            <div className="flex-grow">
                <p className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">{document.title}</p>
            </div>
            
            <div className="flex justify-between items-center mt-3 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5"><Book size={12} /><span className="font-medium">{document.className}</span></div>
                    <div className="flex items-center gap-1.5"><Calendar size={12} /><span className="font-medium">{document.schoolYear}</span></div>
                    <div className="flex items-center gap-1.5"><ListOrdered size={12} /><span className="font-medium">{(document.exercises || []).length} {t('dashboard.documentCard.exercises')}</span></div>
                </div>
                <div className="text-slate-400 dark:text-slate-500 font-medium">
                    <span>{lastModified.toLocaleDateString(settings.language)}</span>
                </div>
            </div>
          </div>
        </Link>
        <div ref={actionsRef} className="absolute right-2 top-2 z-10 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <Tooltip text={t('tooltips.actions')}>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setActionsOpen(c => !c)}>
                    <MoreVertical size={20} />
                </Button>
            </Tooltip>
            {isActionsOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg z-20 border border-slate-200 dark:border-slate-700 p-2 space-y-1 origin-top-right">
                <DocumentCardAction onClick={(e) => handleAction(e, () => setEditModalOpen(true))} icon={<Pencil size={16} />} label={t('actions.edit')} />
                <DocumentCardAction onClick={(e) => handleAction(e, () => duplicateDocument(document.id))} icon={<Copy size={16} />} label={t('actions.duplicate')} />
                <DocumentCardAction onClick={handleExportJson} icon={<FileJson2 size={16} />} label={t('actions.exportJson')} />
                <div className="my-1 h-px bg-slate-200 dark:bg-slate-700" />
                <DocumentCardAction onClick={(e) => handleAction(e, () => setDeleteModalOpen(true))} icon={<Trash2 size={16} />} label={t('actions.delete')} className="text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-400" />
            </div>
            )}
        </div>
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