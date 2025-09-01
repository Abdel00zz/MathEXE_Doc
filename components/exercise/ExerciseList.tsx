
import React from 'react';
import { Exercise } from '../../types';
import { useSettings } from '../../hooks/useSettings';
import ExerciseItem from './ExerciseItem';

interface ExerciseListProps {
  docId: string;
  exercises: Exercise[];
}

const ExerciseList: React.FC<ExerciseListProps> = ({ docId, exercises }) => {
  const { t } = useSettings();

  if (exercises.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
        <h2 className="text-xl font-semibold font-display text-slate-700 dark:text-slate-300">{t('documentEditor.noExercises')}</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">{t('documentEditor.addFirstExercise')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
    {exercises.map((exercise, index) => (
        <ExerciseItem
            key={exercise.id}
            docId={docId}
            exercise={exercise}
            index={index}
            isFirst={index === 0}
            isLast={index === exercises.length - 1}
        />
    ))}
    </div>
  );
};

export default ExerciseList;