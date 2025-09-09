
import React, { useState, useRef } from 'react';
import { useDocuments } from '../../hooks/useDocuments';
import { useSettings } from '../../hooks/useSettings';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { useToolbox } from '../../contexts/ToolboxContext';
import DocumentCard from './DocumentCard';
import Button from '../ui/Button';
import NewDocumentModal from '../modals/NewDocumentModal';
import HelpModal from '../modals/HelpModal';
import SettingsModal from '../modals/SettingsModal';
import { Document } from '../../types';
import { Plus, Upload, FileText, Search, Menu, X, FileSearch, FolderPlus, Import, Settings, Grid3X3, Command, HelpCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import { searchDocuments } from '../../utils/search';
import { useToast } from '../../hooks/useToast';

const Dashboard: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isHelpOpen, setHelpOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{id: string; title: string; score: number}[]>([]);
  const { documents, importDocuments, recentlyDuplicatedId } = useDocuments();
  const { t } = useSettings();
  const { addToast } = useToast();
  const { isOpen: toolboxOpen, closeToolbox, toggleToolbox } = useToolbox();
  
  const toolboxRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(toolboxRef, closeToolbox);


  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          if (typeof content === 'string') {
            const importedData = JSON.parse(content);
            if(Array.isArray(importedData)) {
              importDocuments(importedData as Document[]);
            } else if (typeof importedData === 'object' && importedData !== null) {
              importDocuments([importedData as Document]);
            }
             addToast('Documents imported successfully!', 'success');
          }
        } catch (error) {
          console.error("Failed to parse imported JSON", error);
          addToast("Error: Invalid JSON file.", 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{t('dashboard.title')}</h1>
      </div>

      {documents.length > 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
          <ul className="divide-y divide-gray-200 dark:divide-gray-800 p-3 space-y-3">
            {documents.map(doc => (
              <DocumentCard key={doc.id} document={doc} isRecent={doc.id === recentlyDuplicatedId} />
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
           <div className="flex justify-center items-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <FileText size={32} className="text-gray-400 dark:text-gray-500" />
              </div>
           </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">{t('dashboard.noDocuments')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">{t('dashboard.createFirst')}</p>
          <Button variant="primary" onClick={() => setModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-200">
            <Plus size={18} className="mr-2" />
            {t('dashboard.newDocument')}
          </Button>
        </div>
      )}
      <NewDocumentModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      <Modal isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} title="Search" size="lg">
        <div className="space-y-4">
          <input
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
            placeholder="Search across all content (titles, exercises, keywords, math)…"
            className="w-full h-11 px-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {/* Compute results */}
          {(() => {
            const hits = searchDocuments(documents, query).slice(0, 20);
            if (hits.length !== results.length || hits.some((h,i)=>h.doc.id!==results[i]?.id)) {
              setResults(hits.map(h=>({ id: h.doc.id, title: h.doc.title, score: h.score })));
            }
            return null;
          })()}
          <p className="text-xs text-slate-500 dark:text-slate-400">Astuce: tapez plusieurs mots, la recherche parcourt titres, classes, années, mots‑clés et contenu (HTML/LaTeX inclus).</p>
          <div className="space-y-2 max-h-80 overflow-auto">
            {results.length === 0 ? (
              <div className="text-sm text-slate-500">Aucun résultat.</div>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                {results.map(r => (
                  <li key={r.id} className="py-2 flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{r.title}</div>
                      <div className="text-xs text-slate-500">Score: {r.score}</div>
                    </div>
                    <a className="text-indigo-600 hover:underline text-sm" href={`/document/${r.id}`}>Ouvrir</a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setSearchOpen(false)}>Fermer</Button>
          </div>
        </div>
      </Modal>

      {/* Mobile-Optimized Floating Toolbox */}
      <div className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-50" ref={toolboxRef}>
        <div className="relative">
          {/* Compact toolbox menu - Mobile first */}
          <div className={`absolute bottom-16 right-0 transition-all duration-200 ease-out ${toolboxOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'}`}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 space-y-1 min-w-[180px] sm:min-w-[200px]">
              {/* Compact action buttons */}
              <button
                onClick={() => {setModalOpen(true); closeToolbox();}}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors touch-manipulation"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <FolderPlus size={14} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-medium text-sm">Nouveau</span>
              </button>
              
              <button
                onClick={() => {setSearchOpen(true); closeToolbox();}}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors touch-manipulation"
              >
                <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <Search size={14} className="text-green-600 dark:text-green-400" />
                </div>
                <span className="font-medium text-sm">Rechercher</span>
              </button>
              
              <button
                onClick={() => {document.getElementById('import-input')?.click(); closeToolbox();}}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors touch-manipulation"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                  <Import size={14} className="text-amber-600 dark:text-amber-400" />
                </div>
                <span className="font-medium text-sm">Importer</span>
              </button>
              
              <button
                onClick={() => {setHelpOpen(true); closeToolbox();}}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors touch-manipulation"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <HelpCircle size={14} className="text-purple-600 dark:text-purple-400" />
                </div>
                <span className="font-medium text-sm">Aide</span>
              </button>
              
              <button
                onClick={() => {setSettingsOpen(true); closeToolbox();}}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors touch-manipulation"
              >
                <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center flex-shrink-0">
                  <Settings size={14} className="text-gray-600 dark:text-gray-400" />
                </div>
                <span className="font-medium text-sm">Configuration</span>
              </button>
            </div>
          </div>
          
          {/* Main button - Mobile optimized with better icon */}
          <button
            onClick={toggleToolbox}
            aria-label="Boîte à outils"
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-lg flex items-center justify-center transition-all duration-200 touch-manipulation ${
              toolboxOpen 
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300' 
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-600/25'
            }`}
          >
            {toolboxOpen ? (
              <X size={18} className="sm:hidden" />
            ) : (
              <Menu size={18} className="sm:hidden" />
            )}
            {toolboxOpen ? (
              <X size={20} className="hidden sm:block" />
            ) : (
              <Menu size={20} className="hidden sm:block" />
            )}
          </button>
        </div>
        
        <input type="file" id="import-input" accept=".json" className="hidden" onChange={handleImport} />
      </div>

      <NewDocumentModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setHelpOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

export default Dashboard;