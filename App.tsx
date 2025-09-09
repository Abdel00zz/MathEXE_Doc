
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import OrientationPrompt from './components/modals/OrientationPrompt';
import Dashboard from './components/document/Dashboard';
import DocumentEditor from './components/document/DocumentEditor';
import NewDocumentModal from './components/modals/NewDocumentModal';
import HelpModal from './components/modals/HelpModal';
import SettingsModal from './components/modals/SettingsModal';
import Modal from './components/ui/Modal';
import { ToolboxProvider } from './contexts/ToolboxContext';
import { useSettings } from './hooks/useSettings';
import { useDocuments } from './hooks/useDocuments';
import { useToast } from './hooks/useToast';
import { searchDocuments } from './utils/search';
import { Document } from './types';

function AppContent() {
  const { settings, t } = useSettings();
  const { documents, importDocuments } = useDocuments();
  const { addToast } = useToast();
  
  // Modal states
  const [isNewDocumentOpen, setNewDocumentOpen] = useState(false);
  const [isHelpOpen, setHelpOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  
  // Search states
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{id: string; title: string; score: number}[]>([]);

  React.useEffect(() => {
    if (settings?.language) {
      document.documentElement.lang = settings.language;
    }
  }, [settings?.language]);
  
  React.useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);
  }, [settings.theme]);

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
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
    input.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-950">
      <Header 
        onNewDocument={() => setNewDocumentOpen(true)}
        onSearch={() => setSearchOpen(true)}
        onImport={handleImport}
        onSettings={() => setSettingsOpen(true)}
        onHelp={() => setHelpOpen(true)}
      />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/document/:id" element={<DocumentEditor />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <OrientationPrompt delayMs={3000} />
      
      {/* Modals */}
      <NewDocumentModal isOpen={isNewDocumentOpen} onClose={() => setNewDocumentOpen(false)} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setHelpOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} />
      
      {/* Search Modal */}
      <Modal isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} title={t('search.title')} size="lg">
        <div className="space-y-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="w-full h-11 px-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
          {(() => {
            const hits = searchDocuments(documents, query).slice(0, 20);
            if (hits.length !== results.length || hits.some((h,i)=>h.doc.id!==results[i]?.id)) {
              setResults(hits.map(h=>({ id: h.doc.id, title: h.doc.title, score: h.score })));
            }
            return null;
          })()}
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('search.tip')}
          </p>
          <div className="space-y-2 max-h-80 overflow-auto">
            {results.length === 0 ? (
              <div className="text-sm text-slate-500">{t('search.noResults')}</div>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                {results.map(r => (
                  <li key={r.id} className="py-2 flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{r.title}</div>
                      <div className="text-xs text-slate-500">Score: {r.score}</div>
                    </div>
                    <a 
                      className="text-indigo-600 hover:underline text-sm" 
                      href={`/document/${r.id}`}
                      onClick={() => setSearchOpen(false)}
                    >
                      {t('search.open')}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

function App() {
  return (
    <ToolboxProvider>
      <AppContent />
    </ToolboxProvider>
  );
}

export default App;