
import React, { useState } from 'react';
import { useDocuments } from '../../hooks/useDocuments';
import { useSettings } from '../../hooks/useSettings';
import DocumentCard from './DocumentCard';
import Button from '../ui/Button';
import NewDocumentModal from '../modals/NewDocumentModal';
import { Document } from '../../types';
import { Plus, Upload, FileText } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

const Dashboard: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
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
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => document.getElementById('import-input')?.click()}>
            <Upload size={16} className="mr-2" />
            {t('dashboard.import')}
          </Button>
          <input type="file" id="import-input" accept=".json" className="hidden" onChange={handleImport} />
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} className="mr-2" />
            {t('dashboard.newDocument')}
          </Button>
        </div>
      </div>

      {documents.length > 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {documents.map(doc => (
              <DocumentCard key={doc.id} document={doc} isRecent={doc.id === recentlyDuplicatedId} />
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
           <div className="flex justify-center items-center mb-4">
              <FileText size={40} className="text-gray-400" />
           </div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">{t('dashboard.noDocuments')}</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">{t('dashboard.createFirst')}</p>
          <Button variant="primary" onClick={() => setModalOpen(true)} className="mt-6">
            <Plus size={16} className="mr-2" />
            {t('dashboard.newDocument')}
          </Button>
        </div>
      )}
      <NewDocumentModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default Dashboard;