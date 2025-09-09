import React, { useEffect, useRef, useState } from 'react';
import Modal from '../ui/Modal';
import { useMobile } from '../../hooks/useMobile';
import { useOrientation } from '../../hooks/useOrientation';
import { useSettings } from '../../hooks/useSettings';
import { RotateCcw, Smartphone } from 'lucide-react';

interface OrientationPromptProps {
  delayMs?: number;
}

const OrientationPrompt: React.FC<OrientationPromptProps> = ({ delayMs = 3000 }) => {
  const isMobile = useMobile();
  const orientation = useOrientation();
  const { t } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const timerRef = useRef<number | null>(null);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    // Ne pas afficher immédiatement au premier rendu
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    // Fermer le modal si on n'est plus sur mobile ou si on est en paysage
    if (!isMobile || orientation === 'landscape') {
      setIsOpen(false);
      return;
    }

    // Ne montrer qu'une seule fois par session
    if (hasBeenShown) return;

    // Nettoyer le timer précédent
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    // Programmer l'affichage du modal
    timerRef.current = window.setTimeout(() => {
      if (isMobile && orientation === 'portrait') {
        setIsOpen(true);
        setHasBeenShown(true);
      }
    }, delayMs);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [isMobile, orientation, delayMs, hasBeenShown]);

  // Gérer la fermeture manuelle
  const handleClose = () => {
    setIsOpen(false);
    setHasBeenShown(true);
  };

  if (!isOpen) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={t('orientation.title') || 'Conseil d\'orientation'} 
      size="sm" 
      backdrop="dark"
    >
      <div className="text-center space-y-6">
        {/* Icône animée */}
        <div className="flex justify-center">
          <div className="relative">
            <Smartphone 
              size={48} 
              className="text-blue-500 dark:text-blue-400 animate-pulse" 
            />
            <RotateCcw 
              size={20} 
              className="absolute -bottom-1 -right-1 text-orange-500 dark:text-orange-400 animate-bounce" 
            />
          </div>
        </div>

        {/* Démonstration visuelle */}
        <div className="flex justify-center space-x-4">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-12 rounded-md border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <div className="w-4 h-8 bg-red-200 dark:bg-red-800 rounded-sm" />
            </div>
            <span className="text-xs text-red-600 dark:text-red-400 font-medium">Portrait</span>
          </div>
          
          <div className="flex items-center">
            <RotateCcw size={16} className="text-gray-400 mx-2" />
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-8 rounded-md border-2 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <div className="w-8 h-4 bg-green-200 dark:bg-green-800 rounded-sm" />
            </div>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">Paysage</span>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t('orientation.message') || 'Pour une meilleure expérience'}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {t('orientation.instruction') || 'Tournez votre appareil en mode paysage pour profiter de plus d\'espace d\'affichage'}
          </p>
        </div>

        {/* Bouton de fermeture optionnel */}
        <div className="pt-2">
          <button
            onClick={handleClose}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors underline"
          >
            {t('orientation.dismiss') || 'Ne plus afficher'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default OrientationPrompt;
