import React, { useState, useEffect, useCallback } from 'react';
import { Exercise } from '../../types';
import { useDocuments } from '../../hooks/useDocuments';
import { useSettings } from '../../hooks/useSettings';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import StarRating from '../ui/StarRating';
import { Save, X } from 'lucide-react';
import MathRenderer from '../ui/MathRenderer';
import { scheduleTypesetAll } from '../../services/mathjaxLoader';

interface ExerciseEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  docId: string;
  exerciseToEdit?: Exercise;
}

const ExerciseEditorModal: React.FC<ExerciseEditorModalProps> = ({ isOpen, onClose, docId, exerciseToEdit }) => {
  const { addExercise, updateExercise } = useDocuments();
  const { t } = useSettings();

  const getInitialState = useCallback(() => ({
    title: exerciseToEdit?.title || '',
    difficulty: exerciseToEdit?.difficulty || 3,
    keywords: exerciseToEdit?.keywords?.join(', ') || '',
    content: exerciseToEdit?.content || '',
  }), [exerciseToEdit]);

  const [formState, setFormState] = useState(getInitialState());
  const isEditing = !!exerciseToEdit;

  useEffect(() => {
    if (isOpen) {
      setFormState(getInitialState());
    }
  }, [isOpen, getInitialState]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  if (name === 'content') scheduleTypesetAll();
  }, []);

  const handleRatingChange = useCallback((newRating: number) => {
    setFormState(prev => ({...prev, difficulty: newRating}));
  }, []);

  const handleSave = useCallback(() => {
    const exerciseData = {
      ...formState,
      difficulty: Number(formState.difficulty),
      keywords: formState.keywords.split(',').map(k => k.trim()).filter(Boolean),
    };

    if (isEditing && exerciseToEdit) {
      updateExercise(docId, exerciseToEdit.id, exerciseData);
    } else {
      addExercise(docId, exerciseData);
    }
    onClose();
  }, [addExercise, docId, exerciseToEdit, formState, isEditing, onClose, updateExercise]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? t('modals.editExercise.editTitle') : t('modals.editExercise.createTitle')}
  size="6xl"
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <Input
                    label={t('modals.editExercise.titleLabel')}
                    name="title"
                    value={formState.title}
                    onChange={handleChange}
                    containerClassName="col-span-2 sm:col-span-1"
                />
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('modals.editExercise.difficultyLabel')}</label>
                    <StarRating rating={formState.difficulty} onRatingChange={handleRatingChange} isEditable size={24}/>
                </div>
            </div>
          <Input
            label={t('modals.editExercise.keywordsLabel')}
            name="keywords"
            value={formState.keywords}
            onChange={handleChange}
          />
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('modals.editExercise.contentLabel')}</label>
            <textarea
              id="content"
              name="content"
              value={formState.content}
              onChange={handleChange}
              rows={10}
              className="w-full p-2 border border-slate-300 rounded-lg dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('modals.editExercise.preview')}</h4>
          <div className="border border-slate-300 dark:border-slate-700 rounded-lg p-4 min-h-[300px] bg-slate-50 dark:bg-slate-800/50">
            <MathRenderer
              content={formState.content}
              className="prose prose-sm prose-slate dark:prose-invert max-w-none"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
        <Button type="button" variant="secondary" onClick={onClose}>
            <X size={16} className="mr-2" />
            {t('actions.cancel')}
        </Button>
        <Button type="button" onClick={handleSave}>
            <Save size={16} className="mr-2" />
            {t('modals.editExercise.save')}
        </Button>
      </div>
    </Modal>
  );
};

export default ExerciseEditorModal;