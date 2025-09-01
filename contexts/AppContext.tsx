
import React, { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';
import { AppSettings, Document, Exercise } from '../types';
import { DOCS_STORAGE_KEY, SETTINGS_STORAGE_KEY } from '../constants';
import { useMobile } from '../hooks/useMobile';
import { useI18n } from '../hooks/useI18n';
import { ToastContext } from './ToastContext';
import { verifyGeminiApiKey } from '../services/geminiService';

// --- UTILITY ---
const getInitialState = <T,>(key: string, fallback: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return fallback;
  }
};
const getCurrentTimestamp = () => new Date().toISOString();


// --- SETTINGS CONTEXT ---

interface SettingsContextType {
  settings: AppSettings;
  isMobile: boolean;
  isApiKeyValid: boolean;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  verifyApiKey: (key: string) => Promise<boolean>;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const defaultSettings: AppSettings = {
    language: 'en',
    theme: 'system',
    teacherName: '',
    schoolId: '',
    apiKey: '',
  autoAnalyzeImages: true,
  };

  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = getInitialState<AppSettings>(SETTINGS_STORAGE_KEY, defaultSettings);
    // Merge to ensure newly added defaults (like autoAnalyzeImages) are present
    return { ...defaultSettings, ...stored };
  });
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);
  const isMobile = useMobile();
  const { t } = useI18n(settings.language);

  const verifyApiKey = useCallback(async (key: string): Promise<boolean> => {
    const isValid = await verifyGeminiApiKey(key);
    setIsApiKeyValid(isValid);
    return isValid;
  }, []);

  useEffect(() => {
    if (settings.apiKey) {
      verifyApiKey(settings.apiKey);
    } else {
      setIsApiKeyValid(false);
    }
  }, [settings.apiKey, verifyApiKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving settings to localStorage:", error);
    }
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const value: SettingsContextType = {
    settings,
    isMobile,
    isApiKeyValid,
    t,
    verifyApiKey,
    updateSettings,
  };
  
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};


// --- DOCUMENTS CONTEXT ---

interface DocumentsContextType {
  documents: Document[];
  recentlyDuplicatedId: string | null;
  addDocument: (doc: Omit<Document, 'id' | 'exercises' | 'date'>) => Document;
  updateDocument: (docId: string, updates: Partial<Document>) => void;
  deleteDocument: (docId: string) => void;
  duplicateDocument: (docId: string) => void;
  addExercise: (docId: string, exercise: Omit<Exercise, 'id'>) => void;
  updateExercise: (docId: string, exerciseId: string, updates: Partial<Exercise>) => void;
  deleteExercise: (docId: string, exerciseId: string) => void;
  reorderExercises: (docId: string, startIndex: number, endIndex: number) => void;
  importDocuments: (importedDocs: Document[]) => void;
}

export const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

const DocumentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const toastContext = useContext(ToastContext);
  const [documents, setDocuments] = useState<Document[]>(() => getInitialState<Document[]>(DOCS_STORAGE_KEY, []));
  const [recentlyDuplicatedId, setRecentlyDuplicatedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(documents));
    } catch (error) {
      console.error("Error saving documents to localStorage:", error);
    }
  }, [documents]);

  const addDocument = useCallback((doc: Omit<Document, 'id' | 'exercises' | 'date'>): Document => {
    const newDoc: Document = {
      ...doc,
      id: `doc_${Date.now()}`,
      exercises: [],
      date: new Date().toISOString().split('T')[0],
      lastModified: getCurrentTimestamp(),
    };
    setDocuments(prev => [newDoc, ...prev]);
    return newDoc;
  }, []);

  const updateDocument = useCallback((docId: string, updates: Partial<Document>) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === docId ? { ...doc, ...updates, lastModified: getCurrentTimestamp() } : doc
      )
    );
  }, []);

  const deleteDocument = useCallback((docId: string) => {
    const docTitle = documents.find(d => d.id === docId)?.title || 'Document';
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    toastContext?.addToast(`"${docTitle}" deleted.`, 'success');
  }, [documents, toastContext]);
  
  const duplicateDocument = useCallback((docId: string) => {
    const docToDuplicate = documents.find(d => d.id === docId);
    if (docToDuplicate) {
        const newDocId = `doc_${Date.now()}`;
        const newDoc: Document = {
            ...docToDuplicate,
            id: newDocId,
            title: `${docToDuplicate.title} (Copy)`,
            date: new Date().toISOString().split('T')[0],
            lastModified: getCurrentTimestamp(),
            exercises: docToDuplicate.exercises.map(ex => ({
                ...ex,
                id: `ex_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
            }))
        };
        setDocuments(prev => [newDoc, ...prev]);
        setRecentlyDuplicatedId(newDocId);
        setTimeout(() => setRecentlyDuplicatedId(null), 1000);
    }
  }, [documents]);

  const addExercise = useCallback((docId: string, exercise: Omit<Exercise, 'id'>) => {
    const newExercise: Exercise = {
      ...exercise,
      id: `ex_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === docId
          ? { ...doc, exercises: [...doc.exercises, newExercise], lastModified: getCurrentTimestamp() }
          : doc
      )
    );
  }, []);

  const updateExercise = useCallback((docId: string, exerciseId: string, updates: Partial<Exercise>) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === docId
          ? {
              ...doc,
              exercises: doc.exercises.map(ex =>
                ex.id === exerciseId ? { ...ex, ...updates } : ex
              ),
              lastModified: getCurrentTimestamp(),
            }
          : doc
      )
    );
  }, []);

  const deleteExercise = useCallback((docId: string, exerciseId: string) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === docId
          ? { ...doc, exercises: doc.exercises.filter(ex => ex.id !== exerciseId), lastModified: getCurrentTimestamp() }
          : doc
      )
    );
    toastContext?.addToast('Exercise deleted.', 'success');
  }, [toastContext]);

  const reorderExercises = useCallback((docId: string, startIndex: number, endIndex: number) => {
    setDocuments(prev =>
      prev.map(doc => {
        if (doc.id === docId) {
          const newExercises = Array.from(doc.exercises);
          const [removed] = newExercises.splice(startIndex, 1);
          newExercises.splice(endIndex, 0, removed);
          return { ...doc, exercises: newExercises, lastModified: getCurrentTimestamp() };
        }
        return doc;
      })
    );
  }, []);
  
  const importDocuments = useCallback((importedDocs: Document[]) => {
    const validDocs = importedDocs.filter(d => d.id && d.title && Array.isArray(d.exercises));
    
    setDocuments(prevDocs => {
      const importedDocsMap = new Map(validDocs.map(d => [d.id, d]));
      const existingIds = new Set(prevDocs.map(d => d.id));

      const updatedDocs = prevDocs.map(existingDoc => {
        if (importedDocsMap.has(existingDoc.id)) {
          const importedDoc = importedDocsMap.get(existingDoc.id)!;
          const existingExerciseIds = new Set(existingDoc.exercises.map(ex => ex.id));
          const newExercises = importedDoc.exercises.filter(ex => !existingExerciseIds.has(ex.id));
          return {
            ...existingDoc,
            ...importedDoc,
            exercises: [...existingDoc.exercises, ...newExercises],
            lastModified: getCurrentTimestamp(),
          };
        }
        return existingDoc;
      });

      const newDocs = validDocs.filter(d => !existingIds.has(d.id));
      
      return [...updatedDocs, ...newDocs];
    });
  }, []);

  const value: DocumentsContextType = {
    documents,
    recentlyDuplicatedId,
    addDocument,
    updateDocument,
    deleteDocument,
    duplicateDocument,
    addExercise,
    updateExercise,
    deleteExercise,
    reorderExercises,
    importDocuments,
  };
  return <DocumentsContext.Provider value={value}>{children}</DocumentsContext.Provider>;
};


// --- MAIN APP PROVIDER (COMPOSER) ---

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <SettingsProvider>
      <DocumentsProvider>
        {children}
      </DocumentsProvider>
    </SettingsProvider>
  );
};
