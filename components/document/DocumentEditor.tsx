
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDocuments } from '../../hooks/useDocuments';
import { useSettings } from '../../hooks/useSettings';
import { useMobile } from '../../hooks/useMobile';
import ExerciseList from '../exercise/ExerciseList';
import Button from '../ui/Button';
import ExportModal from '../modals/ExportModal';
import ExerciseEditorModal from '../modals/ExerciseEditorModal';
import ImageUploadModal from '../modals/ImageUploadModal';
import { ChevronLeft, Plus, Image, Printer, Check, Edit, MoreVertical } from 'lucide-react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';

const DocumentEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { documents, updateDocument } = useDocuments();
  const { t } = useSettings();
  const isMobile = useMobile();
  const [isExportOpen, setExportOpen] = useState(false);
  const [isAddExerciseOpen, setAddExerciseOpen] = useState(false);
  const [isAddFromImageOpen, setAddFromImageOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isActionsMenuOpen, setActionsMenuOpen] = useState(false);
  
  const document = documents.find(doc => doc.id === id);
  const [title, setTitle] = useState(document?.title || '');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(actionsMenuRef, () => setActionsMenuOpen(false));

  useEffect(() => {
    if (document) {
      setTitle(document.title);
    }
  }, [document]);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }, []);

  const saveTitle = useCallback(() => {
    if (document && title.trim() !== '' && title !== document.title) {
      updateDocument(document.id, { title });
    }
    setIsEditingTitle(false);
  }, [document, title, updateDocument]);
  
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveTitle();
    } else if (e.key === 'Escape') {
      setTitle(document?.title || '');
      setIsEditingTitle(false);
    }
  };

  if (!document) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Document not found</h2>
        <Link to="/" className="text-indigo-500 hover:underline mt-4 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }
  
  if (isExportOpen) {
    return <ExportModal document={document} onClose={() => setExportOpen(false)} />;
  }

  const renderDesktopActions = () => (
    <>
      <Button variant="secondary" onClick={() => setAddExerciseOpen(true)}>
          <Plus size={16} className="mr-2"/>
          {t('documentEditor.addExercise')}
        </Button>
        <Button variant="secondary" onClick={() => setAddFromImageOpen(true)}>
          <Image size={16} className="mr-2"/>
          {t('documentEditor.addFromImage')}
        </Button>
        <Button variant="primary" onClick={() => setExportOpen(true)}>
          <Printer size={16} className="mr-2"/>
          {t('documentEditor.export')}
        </Button>
    </>
  );

  const MobileActionMenuItem: React.FC<{onClick: () => void, icon: React.ReactNode, label: string}> = ({ onClick, icon, label }) => (
    <button onClick={onClick} className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
      {icon}
      <span>{label}</span>
    </button>
  );
  
  const handleMobileAction = (action: () => void) => {
    action();
    setActionsMenuOpen(false);
  }

  const renderMobileActions = () => (
    <div ref={actionsMenuRef} className="relative">
      <Button variant="primary" onClick={() => setActionsMenuOpen(o => !o)}>
        <MoreVertical size={16} className="mr-2"/>
        {t('actions.actions')}
      </Button>
      {isActionsMenuOpen && (
  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-lg z-20 border border-gray-200 dark:border-gray-800 p-2 space-y-1 origin-top-right">
          <MobileActionMenuItem onClick={() => handleMobileAction(() => setAddExerciseOpen(true))} icon={<Plus size={16} />} label={t('documentEditor.addExercise')} />
          <MobileActionMenuItem onClick={() => handleMobileAction(() => setAddFromImageOpen(true))} icon={<Image size={16} />} label={t('documentEditor.addFromImage')} />
          <MobileActionMenuItem onClick={() => handleMobileAction(() => setExportOpen(true))} icon={<Printer size={16} />} label={t('documentEditor.export')} />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-50 transition-colors">
          <ChevronLeft size={20} />
          {t('documentEditor.backToDashboard')}
        </Link>
        <div className="flex items-center gap-2">
           {isMobile ? renderMobileActions() : renderDesktopActions()}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 sm:p-8 md:p-12 lg:p-16">
          <div className="text-center mb-12">
            <div className="relative group inline-flex flex-col items-center">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                   <input
                    ref={titleInputRef}
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    onBlur={saveTitle}
                    onKeyDown={handleTitleKeyDown}
                    className="text-2xl sm:text-4xl font-bold tracking-tight bg-transparent text-center focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800 rounded-lg px-2"
                  />
                  <Button size="icon" variant="primary" className="h-8 w-8 flex-shrink-0" onClick={saveTitle}>
                    <Check size={16}/>
                  </Button>
                </div>
              ) : (
                <h1 className="text-2xl sm:text-4xl font-bold tracking-tight flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsEditingTitle(true)}>
                  {document.title}
                  <Edit size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h1>
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {document.className} - {document.schoolYear}
            </p>
          </div>
          <ExerciseList docId={document.id} exercises={document.exercises} />
        </div>
      
      <ExerciseEditorModal isOpen={isAddExerciseOpen} onClose={() => setAddExerciseOpen(false)} docId={document.id} />
      <ImageUploadModal isOpen={isAddFromImageOpen} onClose={() => setAddFromImageOpen(false)} docId={document.id} />
    </div>
  );
};

export default DocumentEditor;