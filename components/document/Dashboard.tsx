
import React, { useState } from 'react';
import { useDocuments } from '../../hooks/useDocuments';
import { useSettings } from '../../hooks/useSettings';
import DocumentCard from './DocumentCard';
import Button from '../ui/Button';
import NewDocumentModal from '../modals/NewDocumentModal';
import { Plus, FileText } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const { documents, recentlyDuplicatedId } = useDocuments();
  const { t } = useSettings();

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
      
      <NewDocumentModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default Dashboard;