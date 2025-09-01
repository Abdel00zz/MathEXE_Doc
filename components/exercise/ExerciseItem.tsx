
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Exercise } from '../../types';
import { useDocuments } from '../../hooks/useDocuments';
import { useSettings } from '../../hooks/useSettings';
import Button from '../ui/Button';
import ExerciseEditorModal from '../modals/ExerciseEditorModal';
import ConfirmModal from '../modals/ConfirmModal';
import { MoreVertical, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import StarRating from '../ui/StarRating';
import MathRenderer from '../ui/MathRenderer';
import Tooltip from '../ui/Tooltip';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { typesetElement, scheduleTypesetAll } from '../../services/mathjaxLoader';


interface ExerciseItemProps {
  docId: string;
  exercise: Exercise;
  index: number;
  isFirst: boolean;
  isLast: boolean;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({ docId, exercise, index, isFirst, isLast }) => {
  const { deleteExercise, reorderExercises } = useDocuments();
  const { t } = useSettings();
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isActionsOpen, setActionsOpen] = useState(false);
  // Removed animation state

  const actionsRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(actionsRef, () => setActionsOpen(false));

  const handleDelete = useCallback(() => {
    setDeleteOpen(false);
    deleteExercise(docId, exercise.id);
    scheduleTypesetAll();
  }, [deleteExercise, docId, exercise.id]);
  
  const handleAction = (action: () => void) => {
    action();
    setActionsOpen(false);
  };
  
  const handleMoveUp = useCallback(() => {
    if (!isFirst) {
        reorderExercises(docId, index, index - 1);
  scheduleTypesetAll();
    }
  }, [isFirst, reorderExercises, docId, index]);

  const handleMoveDown = useCallback(() => {
      if (!isLast) {
          reorderExercises(docId, index, index + 1);
          scheduleTypesetAll();
      }
  }, [isLast, reorderExercises, docId, index]);


  // Updated style: flat (no shadow), thicker border, adjusted padding (options 5+2+3)
  const containerClasses = `relative bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 flex flex-col group`;

  // Inline math-capable title renderer without dependency on React MathJax provider
  const TitleMath: React.FC<{ value: string }> = ({ value }) => {
    const spanRef = useRef<HTMLSpanElement | null>(null);
    useEffect(() => {
      if (spanRef.current && value.trim()) {
        typesetElement(spanRef.current);
      }
    }, [value]);
    return (
      <span
        ref={spanRef}
        className="tex2jax_process"
        // Title is controlled (comes from exercise data). If user-editable, consider sanitizing.
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  };

  return (
    <>
  <div className={containerClasses}>
  <div className="p-5">
            {/* Title row with rating */}
            <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-3 flex-grow min-w-0">
                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-bold px-3 py-1 rounded-lg shadow-sm">
                        Exercice {index + 1}
                    </span>
                    {exercise.title && (
                        <p className="font-semibold text-sm text-indigo-600 dark:text-indigo-400 italic truncate">
                          <TitleMath value={exercise.title} />
                        </p>
                    )}
                </div>
                {exercise.difficulty > 0 && (
                    <div className="flex-shrink-0">
                        <StarRating rating={exercise.difficulty} size={18} />
                    </div>
                )}
            </div>

            {/* Keywords */}
            {exercise.keywords && exercise.keywords.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                    {exercise.keywords.map(kw => (
                        <span key={kw} className="text-[0.65rem] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium border border-indigo-200 dark:border-indigo-800">
                            {kw}
                        </span>
                    ))}
                </div>
            )}
        </div>
        
  <div className="px-5 pb-5">
            <MathRenderer 
                content={exercise.content} 
                className="prose prose-sm prose-gray dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 pt-4 border-t border-gray-200 dark:border-gray-800"
            />
        </div>

        {/* Footer with actions */}
  <div className="border-t-2 border-gray-300 dark:border-gray-700 px-4 py-3 flex justify-end items-center gap-1 bg-gray-50/70 dark:bg-gray-900/50">
            <Tooltip text={t('tooltips.moveUp')}>
                 <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-lg hover:bg-indigo-100/50 dark:hover:bg-indigo-900/40" onClick={handleMoveUp} disabled={isFirst}>
                     <ArrowUp size={20} className="text-indigo-600 dark:text-indigo-400" />
                 </Button>
             </Tooltip>
             <Tooltip text={t('tooltips.moveDown')}>
                 <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-lg hover:bg-indigo-100/50 dark:hover:bg-indigo-900/40" onClick={handleMoveDown} disabled={isLast}>
                     <ArrowDown size={20} className="text-indigo-600 dark:text-indigo-400" />
                 </Button>
             </Tooltip>
            <div ref={actionsRef} className="relative z-10">
               <Tooltip text={t('tooltips.actions')}>
                   <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-gray-200/60 dark:hover:bg-gray-700/60" onClick={() => setActionsOpen(c => !c)}>
                       <MoreVertical size={16} />
                   </Button>
               </Tooltip>
               {isActionsOpen && (
                   <div className="absolute right-0 bottom-full mb-1 w-40 bg-white dark:bg-gray-950 rounded-xl shadow-lg z-20 border border-gray-200 dark:border-gray-800 p-2 space-y-1 origin-bottom-right">
                       <button onClick={() => handleAction(() => setEditorOpen(true))} className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                           <Pencil size={16} />
                           <span>{t('actions.edit')}</span>
                       </button>
                       <button onClick={() => handleAction(() => setDeleteOpen(true))} className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm rounded-md transition-colors text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-400">
                           <Trash2 size={16} />
                           <span>{t('actions.delete')}</span>
                       </button>
                   </div>
               )}
           </div>
        </div>
      </div>
      <ExerciseEditorModal
        isOpen={isEditorOpen}
        onClose={() => setEditorOpen(false)}
        docId={docId}
        exerciseToEdit={exercise}
      />
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={`${t('actions.delete')} Exercise`}
      >
        <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
          {`${t('actions.delete')} "${exercise.title || `Exercice ${index + 1}`}"?`}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {t('modals.confirm.text')}
        </p>
      </ConfirmModal>
    </>
  );
};

export default React.memo(ExerciseItem);
