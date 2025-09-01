import React, { useState, useCallback, useEffect, useMemo, useRef, memo } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDocuments } from '../../hooks/useDocuments';
import { useSettings } from '../../hooks/useSettings';
import { analyzeImageWithGemini } from '../../services/geminiService';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Checkbox from '../ui/Checkbox';
import { GeminiExerciseResponse, GeminiAnalysisOptions } from '../../types';
import { UploadCloud, CheckCircle2, AlertTriangle, X, Loader, Trash2, FileCheck2, FileX2 } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

// Helper to convert a file to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

type FileStatus = 'waiting' | 'analyzing' | 'success' | 'error';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  status: FileStatus;
  result?: GeminiExerciseResponse;
  error?: string;
}

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  docId: string;
}

const StatusIcon: React.FC<{status: FileStatus}> = ({status}) => {
    const iconClass = "text-white drop-shadow-md";
    switch (status) {
        case 'analyzing':
            return <Loader size={28} className={`${iconClass}`}/>;
        case 'success':
            return <CheckCircle2 size={32} className={iconClass}/>;
        case 'error':
            return <AlertTriangle size={28} className="text-red-400 drop-shadow-md"/>;
        default:
            return null;
    }
}

const ImageFileItem: React.FC<{ imageFile: ImageFile, onRemove: () => void }> = memo(({ imageFile, onRemove }) => {
    const { status } = imageFile;
    const isOverlayVisible = status !== 'waiting';
    const overlayColor = 
        status === 'success' ? 'bg-green-600/70' :
        status === 'error' ? 'bg-red-800/70' :
        status === 'analyzing' ? 'bg-black/60' :
        'bg-black/50';

    return (
      <div key={imageFile.id} className="relative aspect-square group overflow-hidden rounded-lg shadow-sm">
        <img src={imageFile.preview} alt={imageFile.file.name} className="w-full h-full object-cover"/>
        
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200
            ${isOverlayVisible ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} ${overlayColor}`}
        >
             <div className="text-center text-white">
                <StatusIcon status={status} />
            </div>
        </div>

        <button 
            onClick={onRemove} 
            className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-red-600 focus:opacity-100 transition-all"
            aria-label="Remove image"
        >
            <X size={16}/>
        </button>
      </div>
    );
});
ImageFileItem.displayName = 'ImageFileItem';


const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ isOpen, onClose, docId }) => {
  const { addExercise } = useDocuments();
  const { t, settings, isApiKeyValid } = useSettings();
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const cancelRef = useRef(false);
  const [analysisOptions, setAnalysisOptions] = useState<GeminiAnalysisOptions>({
    boldKeywords: true,
    reviseText: false,
    suggestHints: false,
  });
  const { addToast } = useToast();

  useEffect(() => {
    // Clean up object URLs on unmount
    return () => {
      files.forEach(f => URL.revokeObjectURL(f.preview));
    };
  }, [files]);

  const resetState = useCallback(() => {
    files.forEach(f => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setIsAnalyzing(false);
    setAnalysisOptions({
        boldKeywords: true,
        reviseText: false,
        suggestHints: false,
    });
  }, [files]);

  const handleClose = useCallback(() => {
    if (isAnalyzing) return;
    resetState();
    onClose();
  }, [resetState, onClose, isAnalyzing]);

  const handleAnalysis = useCallback(async () => {
    if (!isApiKeyValid || !settings.apiKey) {
      addToast(t('modals.imageUpload.apiKeyMissing'), 'error');
      return;
    }
    const filesToAnalyze = files.filter(f => f.status === 'waiting' || f.status === 'error');
    if (filesToAnalyze.length === 0) return;
    cancelRef.current = false;
    setProgress({ completed: 0, total: filesToAnalyze.length });
    setIsAnalyzing(true);

    const concurrency = 3;
    let cursor = 0;

    const runNext = async (): Promise<void> => {
      if (cancelRef.current) return;
      const index = cursor++;
      const imageFile = filesToAnalyze[index];
      if (!imageFile) return;
      setFiles(prev => prev.map(f => f.id === imageFile.id ? { ...f, status: 'analyzing' } : f));
      try {
        const base64Image = await fileToBase64(imageFile.file);
        const analysisResult = await analyzeImageWithGemini(settings.apiKey!, base64Image, imageFile.file.type, analysisOptions);
        setFiles(current => current.map(f => f.id === imageFile.id ? { ...f, status: 'success', result: analysisResult } : f));
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : t('modals.imageUpload.error');
        console.error(`Analysis failed for ${imageFile.file.name}:`, e);
        addToast(`${imageFile.file.name}: ${errorMessage}`, 'error');
        setFiles(current => current.map(f => f.id === imageFile.id ? { ...f, status: 'error', error: errorMessage } : f));
      } finally {
        setProgress(p => ({ ...p, completed: p.completed + 1 }));
        await runNext();
      }
    };

    await Promise.all(Array.from({ length: Math.min(concurrency, filesToAnalyze.length) }, () => runNext()));
    setIsAnalyzing(false);
  }, [files, isApiKeyValid, settings.apiKey, addToast, t, analysisOptions]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: ImageFile[] = acceptedFiles.map(file => ({
      id: `file_${Date.now()}_${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'waiting',
    }));
    setFiles(prev => [...prev, ...newFiles]);
    if (settings.autoAnalyzeImages && !isAnalyzing && isApiKeyValid) {
      setTimeout(() => handleAnalysis(), 10);
    }
  }, [settings.autoAnalyzeImages, isAnalyzing, isApiKeyValid, handleAnalysis]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.gif', '.webp'] },
    multiple: true,
    disabled: !isApiKeyValid || isAnalyzing
  } as any);
  
  const handleRemoveFile = useCallback((id: string) => {
    setFiles(prev => {
        const fileToRemove = prev.find(f => f.id === id);
        if(fileToRemove) {
            URL.revokeObjectURL(fileToRemove.preview);
        }
        return prev.filter(f => f.id !== id);
    });
  }, []);

  const handleClearAll = useCallback(() => {
    files.forEach(f => URL.revokeObjectURL(f.preview));
    setFiles([]);
  }, [files]);
  

  const handleCancelAnalysis = useCallback(() => {
    if (!isAnalyzing) return;
    cancelRef.current = true;
    setIsAnalyzing(false);
  }, [isAnalyzing]);


  const handleAddExercises = useCallback(() => {
    const successfulExercises = files.filter(f => f.status === 'success' && f.result).map(f => f.result!);
    successfulExercises.forEach(ex => addExercise(docId, ex));
    if(successfulExercises.length > 0) {
        addToast(`${successfulExercises.length} exercise(s) added successfully!`, 'success');
        handleClose();
    }
  }, [files, addExercise, docId, handleClose, addToast]);

  const waitingCount = useMemo(() => files.filter(f => f.status === 'waiting' || f.status === 'error').length, [files]);
  const successCount = useMemo(() => files.filter(f => f.status === 'success').length, [files]);
  const progressPercent = useMemo(() => progress.total ? Math.round((progress.completed / progress.total) * 100) : 0, [progress]);

  const renderFooter = () => {
    if (!isApiKeyValid) {
      return <Button variant="secondary" onClick={handleClose}>{t('actions.close')}</Button>;
    }
    if (files.length === 0) {
      return <Button variant="secondary" onClick={handleClose}>{t('actions.close')}</Button>;
    }
    
    const isDoneAnalyzing = !isAnalyzing && waitingCount === 0;

    return (
      <div className="flex w-full justify-between items-center">
        <Button variant="danger" size="sm" onClick={handleClearAll} disabled={isAnalyzing}>
          <Trash2 size={16} className="mr-2"/>
          {t('modals.imageUpload.clear_all')}
        </Button>
        <div className="flex gap-3 items-center">
          {/* Hide standard close while analyzing to avoid double 'cancel' */}
          {!isAnalyzing && (
            <Button variant="secondary" onClick={handleClose}>{t('actions.cancel')}</Button>
          )}
          {isDoneAnalyzing && successCount > 0 ? (
            <Button variant="primary" onClick={handleAddExercises}>
              <FileCheck2 size={16} className="mr-2"/>
              {t('modals.imageUpload.addExercises', { count: successCount })}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="primary" onClick={handleAnalysis} disabled={isAnalyzing || waitingCount === 0}>
                {isAnalyzing ? <Loader size={16} className="mr-2"/> : <FileX2 size={16} className="mr-2"/>}
                {t('modals.imageUpload.analyze_count', { count: waitingCount })}
              </Button>
              {isAnalyzing && (
                <Button variant="danger" onClick={handleCancelAnalysis}>Stop</Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('modals.imageUpload.title')} size="4xl" footer={renderFooter()}>
      <div className="min-h-[50vh] max-h-[70vh] flex flex-col space-y-4">
         {!isApiKeyValid ? (
            <div className="flex-grow p-10 flex flex-col items-center justify-center text-center bg-amber-50 dark:bg-amber-900/10 border-2 border-dashed border-amber-400 dark:border-amber-600 rounded-lg">
                <AlertTriangle size={48} className="text-amber-500" />
                <h3 className="mt-4 text-lg font-semibold text-amber-900 dark:text-amber-200">{t('modals.imageUpload.apiKeyNeededTitle')}</h3>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">{t('modals.imageUpload.apiKeyNeededDescription')}</p>
            </div>
        ) : (
          <>
            {files.length > 0 && (
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex-shrink-0">
                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">{t('modals.imageUpload.optionsTitle')}</h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <Checkbox label={t('modals.imageUpload.reviseText')} name="reviseText" checked={analysisOptions.reviseText} onChange={(e) => setAnalysisOptions(o => ({ ...o, reviseText: e.target.checked }))} disabled={isAnalyzing} />
                  <Checkbox label={t('modals.imageUpload.suggestHints')} name="suggestHints" checked={analysisOptions.suggestHints} onChange={(e) => setAnalysisOptions(o => ({ ...o, suggestHints: e.target.checked }))} disabled={isAnalyzing} />
                  <Checkbox label={t('modals.imageUpload.boldKeywords')} name="boldKeywords" checked={analysisOptions.boldKeywords} onChange={(e) => setAnalysisOptions(o => ({ ...o, boldKeywords: e.target.checked }))} disabled={isAnalyzing} />
                  {/* Auto analyze removed here; now managed via global Settings Modal */}
                </div>
                {isAnalyzing && (
                  <div className="mt-4">
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 dark:bg-indigo-400 transition-all" style={{ width: progressPercent + '%' }} />
                    </div>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">{progress.completed}/{progress.total} ({progressPercent}%)</p>
                  </div>
                )}
              </div>
            )}
            <div
              {...getRootProps()}
              className={`relative flex-grow flex flex-col border-2 border-dashed rounded-lg transition-colors
                ${isDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'}
                ${isAnalyzing ? 'cursor-wait' : 'cursor-pointer'}
                `}
            >
              <input {...getInputProps()} />
              {files.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400 p-10">
                    <UploadCloud size={48} className="text-slate-400 mb-3" />
                    <p className="font-semibold text-base">{t('modals.imageUpload.uploadArea')}</p>
                    <p className="text-sm">You can add more images at any time.</p>
                </div>
              ) : (
                <div className="p-4 overflow-y-auto custom-scrollbar h-full">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {files.map((imageFile) => (
                            <ImageFileItem 
                                key={imageFile.id}
                                imageFile={imageFile}
                                onRemove={() => handleRemoveFile(imageFile.id)}
                            />
                        ))}
                    </div>
                </div>
              )}
               {isDragActive && (
                    <div className="absolute inset-0 bg-indigo-100/80 dark:bg-indigo-900/80 flex items-center justify-center rounded-lg pointer-events-none">
                        <div className="text-center text-indigo-600 dark:text-indigo-300 font-semibold">
                            <UploadCloud size={48} className="mx-auto" />
                            <p>Drop images to add them</p>
                        </div>
                    </div>
                )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ImageUploadModal;