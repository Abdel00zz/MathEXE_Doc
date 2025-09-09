import React, { useState } from 'react';
import { useDocuments } from '../../hooks/useDocuments';
import { useSettings } from '../../hooks/useSettings';
import DocumentCard from './DocumentCard';
import Button from '../ui/Button';
import NewDocumentModal from '../modals/NewDocumentModal';
import HelpModal from '../modals/HelpModal';
import SettingsModal from '../modals/SettingsModal';
import { Document } from '../../types';
import { Plus, FileText } from 'lucide-react';
import Modal from '../ui/Modal';
import { searchDocuments } from '../../utils/search';
import { useToast } from '../../hooks/useToast';

interface DashboardProps {
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  isHelpOpen: boolean;
  setHelpOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  isModalOpen,
  setModalOpen,
  isSearchOpen,
  setSearchOpen,
  isHelpOpen,
  setHelpOpen,
  isSettingsOpen,
  setSettingsOpen
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{id: string; title: string; score: number}[]>([]);
  const { documents, importDocuments, recentlyDuplicatedId } = useDocuments();
  const { t } = useSettings();
  const { addToast } = useToast();

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
          <ul className="p-3 space-y-3">
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

      <input type="file" id="import-input" accept=".json" className="hidden" onChange={handleImport} />

      <NewDocumentModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setHelpOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

export default Dashboard;
