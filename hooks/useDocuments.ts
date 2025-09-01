
import { useContext } from 'react';
import { DocumentsContext } from '../contexts/AppContext';

export const useDocuments = () => {
  const context = useContext(DocumentsContext);
  if (!context) {
    throw new Error('useDocuments must be used within an AppProvider');
  }
  return context;
};
